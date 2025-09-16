"""
Phase 3 Week 2: Inventory Sync Service - Business Logic
Handles inventory synchronization, conflict resolution, and background jobs
"""

import asyncio
import logging
import hashlib
import csv
import io
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from bson import ObjectId

from db import db
from inventory_sync_models import (
    BulkInventorySync, InventoryItem, SyncResult, InventoryConflict,
    InventoryAudit, CSVImportJob, ReconciliationJob, InventoryAlert,
    InventoryStatsResponse, MerchantInventoryDashboard
)

logger = logging.getLogger(__name__)

class ConflictResolutionEngine:
    """Handles inventory conflicts during synchronization"""
    
    @staticmethod
    def detect_conflicts(current_item: dict, incoming_item: InventoryItem) -> List[InventoryConflict]:
        """Detect conflicts between current and incoming inventory data"""
        conflicts = []
        
        # Timestamp conflict - incoming data is older
        current_updated = datetime.fromisoformat(current_item.get('updated_at', '2000-01-01T00:00:00Z').replace('Z', '+00:00'))
        incoming_updated = datetime.fromisoformat(incoming_item.updated_at.replace('Z', '+00:00'))
        
        if incoming_updated < current_updated:
            conflicts.append(InventoryConflict(
                sku=incoming_item.sku,
                location_id=current_item['location_id'],
                current_item=current_item,
                incoming_item=incoming_item.dict(),
                conflict_type="timestamp"
            ))
        
        # Quantity mismatch (significant difference)
        current_qty = current_item.get('qty', 0)
        qty_diff = abs(current_qty - incoming_item.qty)
        if qty_diff > max(10, current_qty * 0.1):  # More than 10 items or 10% difference
            conflicts.append(InventoryConflict(
                sku=incoming_item.sku,
                location_id=current_item['location_id'],
                current_item=current_item,
                incoming_item=incoming_item.dict(),
                conflict_type="quantity_mismatch"
            ))
        
        # Price difference (more than 5%)
        current_price = current_item.get('price', {}).get('amount', 0)
        incoming_price = incoming_item.price.get('amount', 0)
        if current_price > 0 and incoming_price > 0:
            price_diff_pct = abs(current_price - incoming_price) / current_price
            if price_diff_pct > 0.05:  # More than 5% difference
                conflicts.append(InventoryConflict(
                    sku=incoming_item.sku,
                    location_id=current_item['location_id'],
                    current_item=current_item,
                    incoming_item=incoming_item.dict(),
                    conflict_type="price_difference"
                ))
        
        return conflicts
    
    @staticmethod
    def resolve_conflict(conflict: InventoryConflict, resolution_strategy: str = "timestamp_wins") -> dict:
        """Resolve a conflict based on strategy"""
        if resolution_strategy == "timestamp_wins":
            # Later timestamp wins
            current_ts = datetime.fromisoformat(conflict.current_item['updated_at'].replace('Z', '+00:00'))
            incoming_ts = datetime.fromisoformat(conflict.incoming_item['updated_at'].replace('Z', '+00:00'))
            
            if incoming_ts >= current_ts:
                return conflict.incoming_item
            else:
                return conflict.current_item
        
        elif resolution_strategy == "keep_current":
            return conflict.current_item
        
        elif resolution_strategy == "use_incoming":
            return conflict.incoming_item
        
        # Default: use timestamp
        return ConflictResolutionEngine.resolve_conflict(conflict, "timestamp_wins")

class InventorySyncService:
    """Main service for inventory synchronization operations"""
    
    def __init__(self):
        self.conflict_engine = ConflictResolutionEngine()
    
    async def sync_inventory(self, sync_request: BulkInventorySync) -> SyncResult:
        """Perform bulk inventory synchronization"""
        start_time = datetime.utcnow()
        
        result = SyncResult(
            sync_reference=sync_request.sync_reference,
            merchant_id=sync_request.merchant_id,
            location_id=sync_request.location_id,
            sync_type=sync_request.sync_type,
            status="success",
            total_items=len(sync_request.items),
            processed_items=0,
            created_items=0,
            updated_items=0,
            skipped_items=0,
            failed_items=0,
            started_at=start_time.isoformat() + "Z",
            completed_at="",
            processing_time_ms=0.0
        )
        
        try:
            # Process each item
            for item in sync_request.items:
                try:
                    await self._process_inventory_item(item, sync_request, result)
                    result.processed_items += 1
                except Exception as e:
                    result.failed_items += 1
                    result.errors.append({
                        "sku": item.sku,
                        "error": str(e),
                        "item_data": item.dict()
                    })
                    logger.error(f"Failed to process item {item.sku}: {e}")
            
            # Update final status
            if result.failed_items == 0:
                result.status = "success"
            elif result.processed_items > 0:
                result.status = "partial"
            else:
                result.status = "failed"
            
            # Record completion time
            end_time = datetime.utcnow()
            result.completed_at = end_time.isoformat() + "Z"
            result.processing_time_ms = (end_time - start_time).total_seconds() * 1000
            
            # Store sync result for tracking
            await self._store_sync_result(result)
            
            return result
            
        except Exception as e:
            logger.error(f"Sync operation failed: {e}")
            result.status = "failed"
            result.errors.append({"general": str(e)})
            result.completed_at = datetime.utcnow().isoformat() + "Z"
            return result
    
    async def _process_inventory_item(self, item: InventoryItem, sync_request: BulkInventorySync, result: SyncResult):
        """Process a single inventory item"""
        
        # Find existing item
        existing_item = await db().inventory_snapshots.find_one({
            "location_id": sync_request.location_id,
            "sku": item.sku
        })
        
        if existing_item:
            # Check for conflicts
            conflicts = self.conflict_engine.detect_conflicts(existing_item, item)
            
            if conflicts:
                # Resolve conflicts
                for conflict in conflicts:
                    resolved_item = self.conflict_engine.resolve_conflict(conflict)
                    
                    # If resolution chose incoming item, proceed with update
                    if resolved_item == conflict.incoming_item:
                        await self._update_inventory_item(existing_item, item, sync_request)
                        result.updated_items += 1
                        
                        # Create audit entry
                        await self._create_audit_entry(
                            merchant_id=sync_request.merchant_id,
                            location_id=sync_request.location_id,
                            sku=item.sku,
                            change_type="update",
                            old_values=existing_item,
                            new_values=item.dict(),
                            source=item.source,
                            sync_reference=sync_request.sync_reference
                        )
                    else:
                        result.skipped_items += 1
                        result.warnings.append(f"Skipped {item.sku} due to conflict resolution")
                
                result.conflicts.extend(conflicts)
            else:
                # No conflicts, update item
                await self._update_inventory_item(existing_item, item, sync_request)
                result.updated_items += 1
                
                # Create audit entry
                await self._create_audit_entry(
                    merchant_id=sync_request.merchant_id,
                    location_id=sync_request.location_id,
                    sku=item.sku,
                    change_type="update",
                    old_values=existing_item,
                    new_values=item.dict(),
                    source=item.source,
                    sync_reference=sync_request.sync_reference
                )
        else:
            # Create new item
            await self._create_inventory_item(item, sync_request)
            result.created_items += 1
            
            # Create audit entry
            await self._create_audit_entry(
                merchant_id=sync_request.merchant_id,
                location_id=sync_request.location_id,
                sku=item.sku,
                change_type="create",
                old_values=None,
                new_values=item.dict(),
                source=item.source,
                sync_reference=sync_request.sync_reference
            )
    
    async def _create_inventory_item(self, item: InventoryItem, sync_request: BulkInventorySync):
        """Create new inventory item"""
        doc = {
            "_id": str(ObjectId()),
            "merchant_id": sync_request.merchant_id,
            "location_id": sync_request.location_id,
            "sku": item.sku,
            "gtin": item.gtin,
            "qty": item.qty,
            "price": item.price,
            "attributes": item.attributes,
            "updated_at": item.updated_at,
            "source": item.source,
            "sync_reference": sync_request.sync_reference,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        await db().inventory_snapshots.insert_one(doc)
    
    async def _update_inventory_item(self, existing_item: dict, new_item: InventoryItem, sync_request: BulkInventorySync):
        """Update existing inventory item"""
        update_doc = {
            "$set": {
                "qty": new_item.qty,
                "price": new_item.price,
                "attributes": new_item.attributes,
                "updated_at": new_item.updated_at,
                "source": new_item.source,
                "sync_reference": sync_request.sync_reference,
                "last_modified_at": datetime.utcnow().isoformat() + "Z"
            }
        }
        
        if new_item.gtin:
            update_doc["$set"]["gtin"] = new_item.gtin
        
        await db().inventory_snapshots.update_one(
            {"_id": existing_item["_id"]},
            update_doc
        )
    
    async def _create_audit_entry(self, merchant_id: str, location_id: str, sku: str,
                                change_type: str, old_values: Optional[dict], new_values: dict,
                                source: str, sync_reference: Optional[str] = None):
        """Create audit trail entry"""
        
        # Calculate diff if updating
        diff = {}
        if old_values and change_type == "update":
            for key in ["qty", "price", "attributes"]:
                old_val = old_values.get(key)
                new_val = new_values.get(key)
                if old_val != new_val:
                    diff[key] = {"old": old_val, "new": new_val}
        
        audit = InventoryAudit(
            merchant_id=merchant_id,
            location_id=location_id,
            sku=sku,
            change_type=change_type,
            old_values=old_values,
            new_values=new_values,
            diff=diff,
            source=source,
            sync_reference=sync_reference
        )
        
        await db().inventory_audit.insert_one(audit.dict())
    
    async def _store_sync_result(self, result: SyncResult):
        """Store sync result for tracking and history"""
        await db().inventory_sync_results.insert_one(result.dict())
    
    async def get_inventory_stats(self, merchant_id: str, location_id: str) -> InventoryStatsResponse:
        """Get inventory statistics for a location"""
        
        # Aggregate inventory data
        pipeline = [
            {
                "$match": {
                    "merchant_id": merchant_id,
                    "location_id": location_id
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_skus": {"$sum": 1},
                    "total_quantity": {"$sum": "$qty"},
                    "total_value": {"$sum": {"$multiply": ["$qty", "$price.amount"]}},
                    "low_stock_items": {
                        "$sum": {
                            "$cond": [{"$lte": ["$qty", 5]}, 1, 0]
                        }
                    },
                    "out_of_stock_items": {
                        "$sum": {
                            "$cond": [{"$eq": ["$qty", 0]}, 1, 0]
                        }
                    }
                }
            }
        ]
        
        stats_result = await db().inventory_snapshots.aggregate(pipeline).to_list(1)
        stats = stats_result[0] if stats_result else {}
        
        # Get last sync info
        last_sync = await db().inventory_sync_results.find_one(
            {"merchant_id": merchant_id, "location_id": location_id},
            sort=[("completed_at", -1)]
        )
        
        # Calculate sync success rate (last 30 days)
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
        recent_syncs = await db().inventory_sync_results.find({
            "merchant_id": merchant_id,
            "location_id": location_id,
            "completed_at": {"$gte": thirty_days_ago}
        }).to_list(100)
        
        successful_syncs = len([s for s in recent_syncs if s["status"] == "success"])
        sync_success_rate = (successful_syncs / len(recent_syncs)) * 100 if recent_syncs else 0
        
        avg_duration = sum(s.get("processing_time_ms", 0) for s in recent_syncs) / len(recent_syncs) if recent_syncs else 0
        
        return InventoryStatsResponse(
            merchant_id=merchant_id,
            location_id=location_id,
            total_skus=stats.get("total_skus", 0),
            total_quantity=stats.get("total_quantity", 0),
            total_value=stats.get("total_value", 0) / 100,  # Convert from cents
            currency="KES",
            last_sync_at=last_sync["completed_at"] if last_sync else None,
            last_update_at=None,  # TODO: Get from inventory items
            sync_frequency="manual",  # TODO: Calculate based on history
            low_stock_items=stats.get("low_stock_items", 0),
            out_of_stock_items=stats.get("out_of_stock_items", 0),
            sync_success_rate=sync_success_rate,
            avg_sync_duration_ms=avg_duration
        )

class CSVImportService:
    """Service for CSV-based inventory imports"""
    
    async def process_csv_import(self, job: CSVImportJob, csv_content: str) -> CSVImportJob:
        """Process CSV import job"""
        job.status = "processing"
        job.started_at = datetime.utcnow().isoformat() + "Z"
        
        try:
            # Parse CSV
            csv_reader = csv.DictReader(io.StringIO(csv_content))
            rows = list(csv_reader)
            job.total_rows = len(rows)
            
            # Validate and convert rows to inventory items
            inventory_items = []
            for i, row in enumerate(rows, 1):
                try:
                    item = self._parse_csv_row(row, i)
                    inventory_items.append(item)
                    job.successful_rows += 1
                except Exception as e:
                    job.failed_rows += 1
                    job.validation_errors.append({
                        "row": i,
                        "error": str(e),
                        "data": row
                    })
            
            # If we have valid items, create sync request
            if inventory_items:
                sync_request = BulkInventorySync(
                    merchant_id=job.merchant_id,
                    location_id=job.location_id,
                    sync_type="full",
                    items=inventory_items,
                    source_system="csv_import"
                )
                
                # Process sync
                sync_service = InventorySyncService()
                sync_result = await sync_service.sync_inventory(sync_request)
                
                # Update job with sync results
                job.processed_rows = sync_result.processed_items
                job.successful_rows = sync_result.created_items + sync_result.updated_items
                job.failed_rows = sync_result.failed_items
                
                if sync_result.errors:
                    job.processing_errors.extend(sync_result.errors)
            
            job.status = "completed"
            job.completed_at = datetime.utcnow().isoformat() + "Z"
            
        except Exception as e:
            job.status = "failed"
            job.processing_errors.append({"general": str(e)})
            job.completed_at = datetime.utcnow().isoformat() + "Z"
        
        return job
    
    def _parse_csv_row(self, row: dict, row_number: int) -> InventoryItem:
        """Parse CSV row into InventoryItem"""
        required_fields = ["sku", "qty", "price"]
        
        for field in required_fields:
            if field not in row or not row[field].strip():
                raise ValueError(f"Missing required field: {field}")
        
        try:
            # Parse basic fields
            sku = row["sku"].strip()
            qty = int(row["qty"])
            price_amount = int(float(row["price"]) * 100)  # Convert to cents
            
            # Optional fields
            gtin = row.get("gtin", "").strip() or None
            currency = row.get("currency", "KES").strip()
            
            # Parse attributes
            attributes = {}
            for key, value in row.items():
                if key not in ["sku", "qty", "price", "gtin", "currency"] and value.strip():
                    attributes[key] = value.strip()
            
            return InventoryItem(
                sku=sku,
                gtin=gtin,
                qty=qty,
                price={"amount": price_amount, "currency": currency},
                attributes=attributes,
                updated_at=datetime.utcnow().isoformat() + "Z",
                source="csv"
            )
            
        except ValueError as e:
            raise ValueError(f"Invalid data format: {e}")

class ReconciliationService:
    """Service for nightly inventory reconciliation"""
    
    async def run_reconciliation(self, job: ReconciliationJob) -> ReconciliationJob:
        """Run inventory reconciliation job"""
        job.status = "running"
        job.started_at = datetime.utcnow().isoformat() + "Z"
        
        try:
            # Get merchants to reconcile
            merchant_filter = {}
            if job.merchant_ids:
                merchant_filter["_id"] = {"$in": job.merchant_ids}
            
            merchants = await db().merchants.find(merchant_filter).to_list(1000)
            
            for merchant in merchants:
                await self._reconcile_merchant(merchant, job)
                job.merchants_processed += 1
            
            job.status = "completed"
            job.completed_at = datetime.utcnow().isoformat() + "Z"
            
        except Exception as e:
            job.status = "failed"
            job.errors.append(str(e))
            job.completed_at = datetime.utcnow().isoformat() + "Z"
        
        return job
    
    async def _reconcile_merchant(self, merchant: dict, job: ReconciliationJob):
        """Reconcile inventory for a single merchant"""
        
        # Get all locations for merchant
        locations = await db().locations.find({
            "merchant_id": str(merchant["_id"]),
            "status": "active"
        }).to_list(100)
        
        for location in locations:
            await self._reconcile_location(str(merchant["_id"]), str(location["_id"]), job)
            job.locations_processed += 1
    
    async def _reconcile_location(self, merchant_id: str, location_id: str, job: ReconciliationJob):
        """Reconcile inventory for a single location"""
        
        # Find items with potential issues
        # 1. Negative quantities
        negative_qty_items = await db().inventory_snapshots.find({
            "merchant_id": merchant_id,
            "location_id": location_id,
            "qty": {"$lt": 0}
        }).to_list(100)
        
        for item in negative_qty_items:
            job.discrepancies.append({
                "type": "negative_quantity",
                "merchant_id": merchant_id,
                "location_id": location_id,
                "sku": item["sku"],
                "current_qty": item["qty"],
                "issue": "Negative inventory quantity"
            })
            
            # Auto-correct to 0
            await db().inventory_snapshots.update_one(
                {"_id": item["_id"]},
                {"$set": {"qty": 0, "corrected_at": datetime.utcnow().isoformat() + "Z"}}
            )
            job.corrections_made += 1
        
        # 2. Very old inventory (not updated in 30+ days)
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
        stale_items = await db().inventory_snapshots.find({
            "merchant_id": merchant_id,
            "location_id": location_id,
            "updated_at": {"$lt": thirty_days_ago}
        }).to_list(100)
        
        for item in stale_items:
            job.discrepancies.append({
                "type": "stale_inventory",
                "merchant_id": merchant_id,
                "location_id": location_id,
                "sku": item["sku"],
                "last_updated": item["updated_at"],
                "issue": "Inventory not updated in 30+ days"
            })
        
        job.items_reconciled += len(negative_qty_items) + len(stale_items)
        job.discrepancies_found += len(negative_qty_items) + len(stale_items)

# Service instances
inventory_sync_service = InventorySyncService()
csv_import_service = CSVImportService()
reconciliation_service = ReconciliationService()