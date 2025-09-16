"""
Phase 3 Week 2: Inventory Sync Service - FastAPI Routes
API endpoints for inventory synchronization, CSV imports, and analytics
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Path
from typing import List, Optional
import logging
import asyncio
from datetime import datetime, timedelta

from security import decode_access_token
from inventory_sync_models import (
    BulkInventorySync, SyncResult, InventoryStatsResponse, 
    MerchantInventoryDashboard, CSVImportJob, ReconciliationJob
)
from inventory_sync_service import (
    inventory_sync_service, csv_import_service, reconciliation_service
)
from db import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/inventory", tags=["inventory-sync"])

# Authentication dependencies
async def get_merchant_user(authorization: str | None = None):
    """Get authenticated merchant user"""
    if not authorization:
        raise HTTPException(401, "Authentication required")
    
    try:
        token = authorization.split()[1]
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        
        if user_id:
            user = await db().users.find_one({"_id": user_id})
            if user:
                return user
    except Exception as e:
        logger.error(f"Authentication error: {e}")
    
    raise HTTPException(401, "Invalid authentication")

async def get_admin_user(authorization: str | None = None):
    """Get authenticated admin user"""
    user = await get_merchant_user(authorization)
    if not user.get("is_admin", False):
        raise HTTPException(403, "Admin access required")
    return user

# Bulk Sync Endpoints
@router.post("/sync", response_model=SyncResult)
async def bulk_inventory_sync(
    sync_request: BulkInventorySync,
    user: dict = Depends(get_merchant_user)
):
    """
    Perform bulk inventory synchronization
    
    Supports both full and delta sync modes with conflict resolution.
    Automatically handles price conflicts, quantity mismatches, and timestamp issues.
    """
    try:
        # Validate merchant has access to this location
        location = await db().locations.find_one({
            "_id": sync_request.location_id,
            "merchant_id": sync_request.merchant_id
        })
        
        if not location:
            raise HTTPException(404, "Location not found or access denied")
        
        # Execute sync
        result = await inventory_sync_service.sync_inventory(sync_request)
        
        logger.info(f"Sync completed: {result.sync_reference} - {result.status} - {result.processed_items}/{result.total_items} items")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk sync failed: {e}")
        raise HTTPException(500, f"Sync operation failed: {str(e)}")

@router.get("/sync/{sync_reference}/status", response_model=SyncResult)
async def get_sync_status(
    sync_reference: str = Path(..., description="Sync reference ID"),
    user: dict = Depends(get_merchant_user)
):
    """Get status of a sync operation"""
    try:
        result = await db().inventory_sync_results.find_one({
            "sync_reference": sync_reference
        })
        
        if not result:
            raise HTTPException(404, "Sync reference not found")
        
        # Verify user has access to this merchant's data
        if result["merchant_id"] != str(user.get("merchant_id", "")):
            raise HTTPException(403, "Access denied")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get sync status failed: {e}")
        raise HTTPException(500, f"Failed to get sync status: {str(e)}")

@router.get("/sync/history")
async def get_sync_history(
    merchant_id: Optional[str] = Query(None, description="Merchant ID filter"),
    location_id: Optional[str] = Query(None, description="Location ID filter"),
    status: Optional[str] = Query(None, description="Status filter"),
    limit: int = Query(50, description="Maximum results"),
    skip: int = Query(0, description="Skip results"),
    user: dict = Depends(get_merchant_user)
):
    """Get sync operation history"""
    try:
        # Build filter
        filter_doc = {}
        
        # Apply merchant filter based on user permissions
        if user.get("is_admin"):
            if merchant_id:
                filter_doc["merchant_id"] = merchant_id
        else:
            filter_doc["merchant_id"] = str(user.get("merchant_id", ""))
        
        if location_id:
            filter_doc["location_id"] = location_id
        if status:
            filter_doc["status"] = status
        
        # Get results
        cursor = db().inventory_sync_results.find(filter_doc)
        cursor = cursor.sort("completed_at", -1).skip(skip).limit(limit)
        
        results = await cursor.to_list(limit)
        
        # Get total count
        total_count = await db().inventory_sync_results.count_documents(filter_doc)
        
        return {
            "results": results,
            "total_count": total_count,
            "page_info": {
                "limit": limit,
                "skip": skip,
                "has_more": skip + len(results) < total_count
            }
        }
        
    except Exception as e:
        logger.error(f"Get sync history failed: {e}")
        raise HTTPException(500, f"Failed to get sync history: {str(e)}")

# CSV Import Endpoints
@router.post("/csv/upload", response_model=CSVImportJob)
async def upload_csv_inventory(
    file: UploadFile = File(..., description="CSV file with inventory data"),
    merchant_id: str = Form(..., description="Merchant ID"),
    location_id: str = Form(..., description="Location ID"),
    user: dict = Depends(get_merchant_user)
):
    """
    Upload CSV file for inventory import
    
    Expected CSV format:
    - sku (required): Product SKU
    - qty (required): Quantity 
    - price (required): Price in currency units
    - gtin (optional): Global Trade Item Number
    - currency (optional): Currency code (default: KES)
    - Additional columns become product attributes
    """
    try:
        # Validate file
        if not file.filename.endswith('.csv'):
            raise HTTPException(400, "File must be a CSV")
        
        if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(400, "File too large (max 10MB)")
        
        # Validate access
        location = await db().locations.find_one({
            "_id": location_id,
            "merchant_id": merchant_id
        })
        
        if not location:
            raise HTTPException(404, "Location not found or access denied")
        
        # Read file content
        csv_content = (await file.read()).decode('utf-8')
        
        # Create import job
        job = CSVImportJob(
            merchant_id=merchant_id,
            location_id=location_id,
            filename=file.filename,
            file_size=len(csv_content),
            original_filename=file.filename
        )
        
        # Store job in database
        await db().csv_import_jobs.insert_one(job.dict())
        
        # Process import asynchronously
        asyncio.create_task(
            csv_import_service.process_csv_import(job, csv_content)
        )
        
        logger.info(f"CSV import started: {job.job_id} - {file.filename}")
        
        return job
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CSV upload failed: {e}")
        raise HTTPException(500, f"CSV upload failed: {str(e)}")

@router.get("/csv/{job_id}/status", response_model=CSVImportJob)
async def get_csv_import_status(
    job_id: str = Path(..., description="Import job ID"),
    user: dict = Depends(get_merchant_user)
):
    """Get status of CSV import job"""
    try:
        job = await db().csv_import_jobs.find_one({"job_id": job_id})
        
        if not job:
            raise HTTPException(404, "Import job not found")
        
        # Verify access
        if not user.get("is_admin") and job["merchant_id"] != str(user.get("merchant_id", "")):
            raise HTTPException(403, "Access denied")
        
        return job
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get CSV status failed: {e}")
        raise HTTPException(500, f"Failed to get import status: {str(e)}")

@router.get("/csv/template")
async def get_csv_template():
    """Download CSV template for inventory import"""
    template_content = """sku,qty,price,gtin,currency,color,size,condition
SKU-EXAMPLE-001,10,2500,1234567890123,KES,black,medium,new
SKU-EXAMPLE-002,5,4999,9876543210987,KES,white,large,new
"""
    
    return {
        "template": template_content,
        "instructions": {
            "required_columns": ["sku", "qty", "price"],
            "optional_columns": ["gtin", "currency"],
            "notes": [
                "Price should be in full currency units (e.g., 2500 for KES 25.00)",
                "Additional columns will be saved as product attributes",
                "GTIN should be valid barcode number if provided",
                "Currency defaults to KES if not specified"
            ]
        }
    }

# Statistics and Analytics
@router.get("/stats/{merchant_id}/{location_id}", response_model=InventoryStatsResponse)
async def get_inventory_stats(
    merchant_id: str = Path(..., description="Merchant ID"),
    location_id: str = Path(..., description="Location ID"),
    user: dict = Depends(get_merchant_user)
):
    """Get inventory statistics for a location"""
    try:
        # Verify access
        if not user.get("is_admin") and merchant_id != str(user.get("merchant_id", "")):
            raise HTTPException(403, "Access denied")
        
        stats = await inventory_sync_service.get_inventory_stats(merchant_id, location_id)
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get inventory stats failed: {e}")
        raise HTTPException(500, f"Failed to get inventory stats: {str(e)}")

@router.get("/dashboard/{merchant_id}")
async def get_merchant_dashboard(
    merchant_id: str = Path(..., description="Merchant ID"),
    user: dict = Depends(get_merchant_user)
):
    """Get complete merchant inventory dashboard"""
    try:
        # Verify access
        if not user.get("is_admin") and merchant_id != str(user.get("merchant_id", "")):
            raise HTTPException(403, "Access denied")
        
        # Get merchant info
        merchant = await db().merchants.find_one({"_id": merchant_id})
        if not merchant:
            raise HTTPException(404, "Merchant not found")
        
        # Get all locations for merchant
        locations = await db().locations.find({
            "merchant_id": merchant_id,
            "status": "active"
        }).to_list(100)
        
        # Get stats for each location
        location_stats = []
        for location in locations:
            stats = await inventory_sync_service.get_inventory_stats(
                merchant_id, str(location["_id"])
            )
            location_stats.append(stats)
        
        # Get recent sync results
        recent_syncs = await db().inventory_sync_results.find({
            "merchant_id": merchant_id
        }).sort("completed_at", -1).limit(10).to_list(10)
        
        # Get recent CSV uploads
        recent_uploads = await db().csv_import_jobs.find({
            "merchant_id": merchant_id
        }).sort("created_at", -1).limit(5).to_list(5)
        
        # Calculate aggregate metrics
        total_skus = sum(loc.total_skus for loc in location_stats)
        total_value = sum(loc.total_value for loc in location_stats)
        
        # Health assessment
        success_rates = [loc.sync_success_rate for loc in location_stats if loc.sync_success_rate > 0]
        avg_success_rate = sum(success_rates) / len(success_rates) if success_rates else 0
        
        if avg_success_rate >= 95:
            health = "excellent"
        elif avg_success_rate >= 85:
            health = "good"
        elif avg_success_rate >= 70:
            health = "fair"
        else:
            health = "poor"
        
        dashboard = MerchantInventoryDashboard(
            merchant_id=merchant_id,
            merchant_name=merchant.get("name", "Unknown Merchant"),
            locations=location_stats,
            total_locations=len(locations),
            total_skus_across_locations=total_skus,
            total_inventory_value=total_value,
            active_alerts=[],  # TODO: Implement alerts
            pending_reconciliations=0,  # TODO: Implement reconciliation tracking
            recent_syncs=recent_syncs,
            recent_uploads=recent_uploads,
            overall_sync_health=health,
            last_activity_at=recent_syncs[0]["completed_at"] if recent_syncs else None
        )
        
        return dashboard
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get merchant dashboard failed: {e}")
        raise HTTPException(500, f"Failed to get merchant dashboard: {str(e)}")

# Reconciliation Endpoints (Admin only)
@router.post("/reconcile", response_model=ReconciliationJob)
async def start_reconciliation(
    merchant_ids: Optional[List[str]] = None,
    location_ids: Optional[List[str]] = None,
    user: dict = Depends(get_admin_user)
):
    """Start inventory reconciliation job (Admin only)"""
    try:
        job = ReconciliationJob(
            scheduled_at=datetime.utcnow().isoformat() + "Z",
            merchant_ids=merchant_ids,
            location_ids=location_ids
        )
        
        # Store job
        await db().reconciliation_jobs.insert_one(job.dict())
        
        # Run reconciliation asynchronously
        asyncio.create_task(reconciliation_service.run_reconciliation(job))
        
        logger.info(f"Reconciliation started: {job.job_id}")
        
        return job
        
    except Exception as e:
        logger.error(f"Start reconciliation failed: {e}")
        raise HTTPException(500, f"Failed to start reconciliation: {str(e)}")

@router.get("/reconcile/{job_id}/status", response_model=ReconciliationJob)
async def get_reconciliation_status(
    job_id: str = Path(..., description="Reconciliation job ID"),
    user: dict = Depends(get_admin_user)
):
    """Get reconciliation job status (Admin only)"""
    try:
        job = await db().reconciliation_jobs.find_one({"job_id": job_id})
        
        if not job:
            raise HTTPException(404, "Reconciliation job not found")
        
        return job
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get reconciliation status failed: {e}")
        raise HTTPException(500, f"Failed to get reconciliation status: {str(e)}")

# Health and Monitoring
@router.get("/health")
async def inventory_sync_health():
    """Get inventory sync system health"""
    try:
        # Check recent sync activity
        recent_syncs = await db().inventory_sync_results.find().sort("completed_at", -1).limit(10).to_list(10)
        
        # Check pending jobs
        pending_csv_jobs = await db().csv_import_jobs.count_documents({"status": "pending"})
        processing_csv_jobs = await db().csv_import_jobs.count_documents({"status": "processing"})
        
        # Check for failed syncs in last hour
        one_hour_ago = (datetime.utcnow() - timedelta(hours=1)).isoformat() + "Z"
        recent_failures = await db().inventory_sync_results.count_documents({
            "status": "failed",
            "completed_at": {"$gte": one_hour_ago}
        })
        
        return {
            "status": "healthy" if recent_failures == 0 else "degraded",
            "recent_syncs": len(recent_syncs),
            "pending_csv_jobs": pending_csv_jobs,
            "processing_csv_jobs": processing_csv_jobs,
            "recent_failures": recent_failures,
            "sync_success_rate": len([s for s in recent_syncs if s["status"] == "success"]) / len(recent_syncs) * 100 if recent_syncs else 0,
            "features": {
                "bulk_sync": True,
                "csv_import": True, 
                "conflict_resolution": True,
                "reconciliation": True,
                "audit_trail": True
            }
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(500, f"Health check failed: {str(e)}")

@router.delete("/cleanup/old-syncs")
async def cleanup_old_syncs(
    days_old: int = Query(30, description="Delete sync results older than N days"),
    user: dict = Depends(get_admin_user)
):
    """Clean up old sync results (Admin only)"""
    try:
        cutoff_date = (datetime.utcnow() - timedelta(days=days_old)).isoformat() + "Z"
        
        # Delete old sync results 
        sync_result = await db().inventory_sync_results.delete_many({
            "completed_at": {"$lt": cutoff_date}
        })
        
        # Delete old CSV import jobs
        csv_result = await db().csv_import_jobs.delete_many({
            "completed_at": {"$lt": cutoff_date}
        })
        
        # Delete old audit entries (keep for compliance - maybe 1 year)
        audit_cutoff = (datetime.utcnow() - timedelta(days=365)).isoformat() + "Z"
        audit_result = await db().inventory_audit.delete_many({
            "timestamp": {"$lt": audit_cutoff}
        })
        
        return {
            "deleted_sync_results": sync_result.deleted_count,
            "deleted_csv_jobs": csv_result.deleted_count,
            "deleted_audit_entries": audit_result.deleted_count,
            "cutoff_date": cutoff_date
        }
        
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise HTTPException(500, f"Cleanup failed: {str(e)}")