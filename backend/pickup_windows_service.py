"""
Phase 3 Week 3: Pickup Windows & Advanced Reservations - Business Logic
Service layer for window management, reservation scheduling, and notifications
"""

import asyncio
import logging
from datetime import datetime, timedelta, time
from typing import List, Dict, Any, Optional, Tuple
from bson import ObjectId

from db import db
from pickup_windows_models import (
    PickupWindow, PickupWindowCreate, PickupWindowUpdate, TimeSlot,
    ReservationExtensionRequest, ReservationModification, PartialPickupRequest,
    ReservationCancellation, PickupReminder, ExpiredReservationCleanup,
    CleanupResult, PickupWindowsResponse, ReservationScheduleResponse,
    AdvancedReservationStatus, BulkWindowCreation, BulkWindowResult
)

logger = logging.getLogger(__name__)

class PickupWindowService:
    """Service for managing pickup windows and scheduling"""
    
    async def create_pickup_windows(self, request: PickupWindowCreate) -> List[PickupWindow]:
        """Create pickup windows for a location and date"""
        
        # Validate location exists
        location = await db().locations.find_one({"_id": request.location_id, "status": "active"})
        if not location:
            raise ValueError(f"Location {request.location_id} not found or inactive")
        
        # Check for existing windows on same date
        existing_windows = await db().pickup_windows.find({
            "location_id": request.location_id,
            "date": request.date
        }).to_list(100)
        
        existing_slots = {f"{w['time_slot']['start_time']}-{w['time_slot']['end_time']}" 
                         for w in existing_windows}
        
        # Create new windows
        created_windows = []
        for time_slot in request.time_slots:
            slot_key = f"{time_slot.start_time}-{time_slot.end_time}"
            
            if slot_key in existing_slots:
                logger.warning(f"Window already exists for {request.location_id} on {request.date} at {slot_key}")
                continue
            
            window = PickupWindow(
                location_id=request.location_id,
                date=request.date,
                time_slot=time_slot,
                capacity=request.capacity_per_slot,
                notes=request.notes
            )
            
            # Insert into database
            await db().pickup_windows.insert_one(window.dict())
            created_windows.append(window)
            
            logger.info(f"Created pickup window {window.id} for {request.location_id} on {request.date}")
        
        return created_windows
    
    async def get_available_windows(self, location_id: str, date: str, 
                                  min_capacity: int = 1) -> PickupWindowsResponse:
        """Get available pickup windows for a location and date"""
        
        # Get all windows for the date
        windows_data = await db().pickup_windows.find({
            "location_id": location_id,
            "date": date,
            "status": "active"
        }).sort("time_slot.start_time", 1).to_list(50)
        
        # Convert to PickupWindow objects and filter by availability
        windows = []
        total_capacity = 0
        available_capacity = 0
        
        for window_data in windows_data:
            window = PickupWindow(**window_data)
            windows.append(window)
            total_capacity += window.capacity
            
            if window.capacity - window.reserved >= min_capacity:
                available_capacity += (window.capacity - window.reserved)
        
        # Find next available slot
        next_available_slot = None
        for window in windows:
            if window.is_available and window.capacity - window.reserved >= min_capacity:
                next_available_slot = {
                    "window_id": window.id,
                    "time_slot": window.time_slot.dict(),
                    "available_spots": window.capacity - window.reserved
                }
                break
        
        return PickupWindowsResponse(
            location_id=location_id,
            date=date,
            windows=windows,
            total_capacity=total_capacity,
            available_capacity=available_capacity,
            next_available_slot=next_available_slot
        )
    
    async def schedule_reservation(self, reservation_id: str, pickup_window_id: str) -> ReservationScheduleResponse:
        """Schedule a reservation for a specific pickup window"""
        
        # Get reservation
        reservation = await db().reservations.find_one({"_id": reservation_id})
        if not reservation:
            raise ValueError(f"Reservation {reservation_id} not found")
        
        if reservation["status"] not in ["held", "confirmed"]:
            raise ValueError(f"Reservation {reservation_id} is not schedulable (status: {reservation['status']})")
        
        # Get pickup window
        window_data = await db().pickup_windows.find_one({"id": pickup_window_id})
        if not window_data:
            raise ValueError(f"Pickup window {pickup_window_id} not found")
        
        window = PickupWindow(**window_data)
        
        # Check availability
        if not window.is_available:
            raise ValueError(f"Pickup window {pickup_window_id} is not available")
        
        # Atomic update - reserve spot in window and update reservation
        async with await db().client.start_session() as session:
            async with session.start_transaction():
                # Increment reserved count in window
                window_update = await db().pickup_windows.update_one(
                    {
                        "id": pickup_window_id,
                        "reserved": {"$lt": window.capacity}  # Ensure capacity not exceeded
                    },
                    {
                        "$inc": {"reserved": 1},
                        "$set": {"updated_at": datetime.utcnow().isoformat() + "Z"}
                    },
                    session=session
                )
                
                if window_update.modified_count == 0:
                    raise ValueError("Pickup window is full or unavailable")
                
                # Update reservation with pickup window
                await db().reservations.update_one(
                    {"_id": reservation_id},
                    {
                        "$set": {
                            "pickup_window_id": pickup_window_id,
                            "status": "scheduled",
                            "scheduled_at": datetime.utcnow().isoformat() + "Z"
                        },
                        "$push": {
                            "audit": {
                                "at": datetime.utcnow().isoformat() + "Z",
                                "event": "scheduled",
                                "by": "system",
                                "comment": f"Scheduled for pickup window {pickup_window_id}"
                            }
                        }
                    },
                    session=session
                )
        
        # Generate confirmation code
        confirmation_code = f"PU{window.date.replace('-', '')}{window.time_slot.start_time.replace(':', '')}{reservation_id[-6:].upper()}"
        
        return ReservationScheduleResponse(
            reservation_id=reservation_id,
            pickup_window_id=pickup_window_id,
            scheduled_slot={
                "date": window.date,
                "time_slot": window.time_slot.dict(),
                "location_id": window.location_id
            },
            confirmation_code=confirmation_code,
            estimated_wait_time_minutes=5  # Base estimate
        )
    
    async def update_pickup_window(self, window_id: str, update_data: PickupWindowUpdate) -> PickupWindow:
        """Update pickup window details"""
        
        update_dict = {}
        if update_data.capacity is not None:
            update_dict["capacity"] = update_data.capacity
        if update_data.status is not None:
            update_dict["status"] = update_data.status
        if update_data.notes is not None:
            update_dict["notes"] = update_data.notes
        
        update_dict["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        result = await db().pickup_windows.update_one(
            {"id": window_id},
            {"$set": update_dict}
        )
        
        if result.modified_count == 0:
            raise ValueError(f"Pickup window {window_id} not found or no changes made")
        
        # Get updated window
        updated_window_data = await db().pickup_windows.find_one({"id": window_id})
        return PickupWindow(**updated_window_data)
    
    async def bulk_create_windows(self, bulk_request: BulkWindowCreation) -> BulkWindowResult:
        """Create multiple pickup windows based on pattern"""
        
        start_date = datetime.fromisoformat(bulk_request.date_range["start"])
        end_date = datetime.fromisoformat(bulk_request.date_range["end"])
        pattern = bulk_request.recurring_pattern
        
        created_windows = 0
        skipped_windows = 0
        failed_windows = 0
        details = []
        date_coverage = []
        total_capacity_added = 0
        
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            
            # Check if this day matches the pattern
            if current_date.weekday() + 1 in pattern.get("days_of_week", [1, 2, 3, 4, 5]):
                try:
                    # Create windows for this date
                    time_slots = [TimeSlot(**slot) for slot in pattern["time_slots"]]
                    create_request = PickupWindowCreate(
                        location_id=bulk_request.location_id,
                        date=date_str,
                        time_slots=time_slots,
                        capacity_per_slot=pattern["capacity_per_slot"]
                    )
                    
                    windows = await self.create_pickup_windows(create_request)
                    created_count = len(windows)
                    
                    if created_count > 0:
                        created_windows += created_count
                        date_coverage.append(date_str)
                        total_capacity_added += created_count * pattern["capacity_per_slot"]
                        
                        details.append({
                            "date": date_str,
                            "status": "created",
                            "windows_created": created_count
                        })
                    else:
                        skipped_windows += len(time_slots)
                        details.append({
                            "date": date_str,
                            "status": "skipped",
                            "reason": "Windows already exist"
                        })
                
                except Exception as e:
                    failed_windows += len(pattern["time_slots"])
                    details.append({
                        "date": date_str,
                        "status": "failed",
                        "error": str(e)
                    })
                    logger.error(f"Failed to create windows for {date_str}: {e}")
            
            current_date += timedelta(days=1)
        
        return BulkWindowResult(
            requested_date_range=bulk_request.date_range,
            created_windows=created_windows,
            skipped_windows=skipped_windows,
            failed_windows=failed_windows,
            details=details,
            total_capacity_added=total_capacity_added,
            date_coverage=date_coverage
        )

class AdvancedReservationService:
    """Service for advanced reservation management"""
    
    async def extend_reservation(self, reservation_id: str, extension_request: ReservationExtensionRequest) -> Dict[str, Any]:
        """Extend reservation hold time"""
        
        reservation = await db().reservations.find_one({"_id": reservation_id})
        if not reservation:
            raise ValueError(f"Reservation {reservation_id} not found")
        
        if reservation["status"] not in ["held", "scheduled"]:
            raise ValueError(f"Reservation cannot be extended (status: {reservation['status']})")
        
        # Check extension limits
        extension_history = reservation.get("extension_history", [])
        if len(extension_history) >= 2:  # Max 2 extensions
            raise ValueError("Maximum number of extensions reached")
        
        # Calculate new expiry
        current_expiry = datetime.fromisoformat(reservation["hold_expires_at"].replace("Z", "+00:00"))
        new_expiry = current_expiry + timedelta(minutes=extension_request.extension_minutes)
        
        # Update reservation
        now = datetime.utcnow()
        extension_record = {
            "extended_at": now.isoformat() + "Z",
            "extension_minutes": extension_request.extension_minutes,
            "reason": extension_request.reason,
            "new_expiry": new_expiry.isoformat() + "Z"
        }
        
        await db().reservations.update_one(
            {"_id": reservation_id},
            {
                "$set": {
                    "hold_expires_at": new_expiry.isoformat() + "Z",
                    "updated_at": now.isoformat() + "Z"
                },
                "$push": {
                    "extension_history": extension_record,
                    "audit": {
                        "at": now.isoformat() + "Z",
                        "event": "extended",
                        "by": "user",
                        "comment": f"Extended by {extension_request.extension_minutes} minutes"
                    }
                }
            }
        )
        
        return {
            "reservation_id": reservation_id,
            "new_expiry": new_expiry.isoformat() + "Z",
            "extension_minutes": extension_request.extension_minutes,
            "extensions_remaining": 2 - len(extension_history) - 1
        }
    
    async def modify_reservation(self, reservation_id: str, modification: ReservationModification) -> Dict[str, Any]:
        """Modify reservation items or pickup details"""
        
        reservation = await db().reservations.find_one({"_id": reservation_id})
        if not reservation:
            raise ValueError(f"Reservation {reservation_id} not found")
        
        if reservation["status"] not in ["held", "scheduled"]:
            raise ValueError(f"Reservation cannot be modified (status: {reservation['status']})")
        
        update_dict = {"updated_at": datetime.utcnow().isoformat() + "Z"}
        modification_record = {
            "modified_at": datetime.utcnow().isoformat() + "Z",
            "changes": {}
        }
        
        # Update items if provided
        if modification.items is not None:
            update_dict["items"] = modification.items
            modification_record["changes"]["items"] = "updated"
        
        # Change pickup window if provided
        if modification.pickup_window_id is not None:
            # Release old window slot and reserve new one
            old_window_id = reservation.get("pickup_window_id")
            if old_window_id:
                await db().pickup_windows.update_one(
                    {"id": old_window_id},
                    {"$inc": {"reserved": -1}}
                )
            
            # Reserve new window slot
            await db().pickup_windows.update_one(
                {"id": modification.pickup_window_id},
                {"$inc": {"reserved": 1}}
            )
            
            update_dict["pickup_window_id"] = modification.pickup_window_id
            modification_record["changes"]["pickup_window"] = "changed"
        
        if modification.notes is not None:
            update_dict["notes"] = modification.notes
            modification_record["changes"]["notes"] = "updated"
        
        # Apply updates
        await db().reservations.update_one(
            {"_id": reservation_id},
            {
                "$set": update_dict,
                "$push": {
                    "modification_history": modification_record,
                    "audit": {
                        "at": datetime.utcnow().isoformat() + "Z",
                        "event": "modified",
                        "by": "user",
                        "comment": f"Modified: {', '.join(modification_record['changes'].keys())}"
                    }
                }
            }
        )
        
        return {
            "reservation_id": reservation_id,
            "modifications_applied": modification_record["changes"],
            "updated_at": update_dict["updated_at"]
        }
    
    async def process_partial_pickup(self, reservation_id: str, partial_pickup: PartialPickupRequest) -> Dict[str, Any]:
        """Process partial pickup of reservation items"""
        
        reservation = await db().reservations.find_one({"_id": reservation_id})
        if not reservation:
            raise ValueError(f"Reservation {reservation_id} not found")
        
        if reservation["status"] not in ["scheduled", "confirmed"]:
            raise ValueError(f"Reservation not ready for pickup (status: {reservation['status']})")
        
        # Process each item
        pickup_summary = {
            "fully_picked_up": [],
            "partially_picked_up": [],
            "remaining_items": []
        }
        
        for pickup_item in partial_pickup.items:
            if pickup_item.picked_up_qty == pickup_item.requested_qty:
                pickup_summary["fully_picked_up"].append(pickup_item.dict())
            elif pickup_item.picked_up_qty > 0:
                pickup_summary["partially_picked_up"].append(pickup_item.dict())
                # Keep remaining quantity as new reservation item
                remaining_qty = pickup_item.requested_qty - pickup_item.picked_up_qty
                pickup_summary["remaining_items"].append({
                    "sku": pickup_item.sku,
                    "qty": remaining_qty
                })
        
        # Update reservation status
        new_status = "completed" if partial_pickup.completion_status == "complete" else "partial_pickup"
        
        await db().reservations.update_one(
            {"_id": reservation_id},
            {
                "$set": {
                    "status": new_status,
                    "pickup_completed_at": datetime.utcnow().isoformat() + "Z",
                    "pickup_summary": pickup_summary,
                    "pickup_notes": partial_pickup.pickup_notes
                },
                "$push": {
                    "audit": {
                        "at": datetime.utcnow().isoformat() + "Z",
                        "event": "partial_pickup",
                        "by": "merchant",
                        "comment": f"Pickup processed: {partial_pickup.completion_status}"
                    }
                }
            }
        )
        
        # Release pickup window slot if completed
        if new_status == "completed" and reservation.get("pickup_window_id"):
            await db().pickup_windows.update_one(
                {"id": reservation["pickup_window_id"]},
                {"$inc": {"reserved": -1}}
            )
        
        return {
            "reservation_id": reservation_id,
            "pickup_status": new_status,
            "pickup_summary": pickup_summary,
            "has_remaining_items": len(pickup_summary["remaining_items"]) > 0
        }
    
    async def cancel_reservation(self, reservation_id: str, cancellation: ReservationCancellation) -> Dict[str, Any]:
        """Cancel reservation and release resources"""
        
        reservation = await db().reservations.find_one({"_id": reservation_id})
        if not reservation:
            raise ValueError(f"Reservation {reservation_id} not found")
        
        if reservation["status"] in ["cancelled", "completed"]:
            raise ValueError(f"Reservation already {reservation['status']}")
        
        # Release pickup window slot if scheduled
        if reservation.get("pickup_window_id"):
            await db().pickup_windows.update_one(
                {"id": reservation["pickup_window_id"]},
                {"$inc": {"reserved": -1}}
            )
        
        # Update reservation
        await db().reservations.update_one(
            {"_id": reservation_id},
            {
                "$set": {
                    "status": "cancelled",
                    "cancelled_at": datetime.utcnow().isoformat() + "Z",
                    "cancellation_reason": cancellation.reason,
                    "cancellation_notes": cancellation.notes,
                    "refund_requested": cancellation.refund_requested
                },
                "$push": {
                    "audit": {
                        "at": datetime.utcnow().isoformat() + "Z",
                        "event": "cancelled",
                        "by": "user",
                        "comment": f"Cancelled: {cancellation.reason}"
                    }
                }
            }
        )
        
        # TODO: Restore inventory quantities
        # TODO: Process refund if requested
        
        return {
            "reservation_id": reservation_id,
            "status": "cancelled",
            "refund_requested": cancellation.refund_requested,
            "cancelled_at": datetime.utcnow().isoformat() + "Z"
        }

class ExpiredReservationCleanupService:
    """Service for cleaning up expired reservations"""
    
    async def cleanup_expired_reservations(self, config: ExpiredReservationCleanup) -> CleanupResult:
        """Clean up expired reservations and release resources"""
        
        start_time = datetime.utcnow()
        cutoff_time = datetime.utcnow() - timedelta(hours=config.max_age_hours)
        
        # Find expired reservations
        filter_query = {
            "status": {"$in": ["held", "scheduled"]},
            "hold_expires_at": {"$lt": cutoff_time.isoformat() + "Z"}
        }
        
        if config.location_ids:
            # Filter by locations
            filter_query["items.location_id"] = {"$in": config.location_ids}
        
        if config.exclude_user_ids:
            filter_query["user_id"] = {"$nin": config.exclude_user_ids}
        
        expired_reservations = await db().reservations.find(filter_query).limit(config.cleanup_batch_size).to_list(config.cleanup_batch_size)
        
        result = CleanupResult(
            processed_reservations=len(expired_reservations),
            released_reservations=0,
            restored_inventory_items=0,
            notifications_sent=0
        )
        
        # Process each expired reservation
        for reservation in expired_reservations:
            try:
                # Release pickup window slot
                if reservation.get("pickup_window_id"):
                    await db().pickup_windows.update_one(
                        {"id": reservation["pickup_window_id"]},
                        {"$inc": {"reserved": -1}}
                    )
                
                # Mark as expired
                await db().reservations.update_one(
                    {"_id": reservation["_id"]},
                    {
                        "$set": {
                            "status": "expired",
                            "expired_at": datetime.utcnow().isoformat() + "Z",
                            "cleanup_batch": result.cleanup_run_id
                        },
                        "$push": {
                            "audit": {
                                "at": datetime.utcnow().isoformat() + "Z",
                                "event": "expired",
                                "by": "system",
                                "comment": "Automatically expired due to timeout"
                            }
                        }
                    }
                )
                
                result.released_reservations += 1
                result.restored_inventory_items += len(reservation.get("items", []))
                
                # TODO: Send notification if enabled
                if config.send_notifications:
                    # Would send expiry notification
                    result.notifications_sent += 1
                
            except Exception as e:
                result.errors.append({
                    "reservation_id": str(reservation["_id"]),
                    "error": str(e)
                })
                logger.error(f"Failed to cleanup reservation {reservation['_id']}: {e}")
        
        # Calculate metrics
        end_time = datetime.utcnow()
        result.execution_time_seconds = (end_time - start_time).total_seconds()
        result.cleanup_efficiency = result.released_reservations / result.processed_reservations if result.processed_reservations > 0 else 0.0
        
        logger.info(f"Cleanup completed: {result.released_reservations}/{result.processed_reservations} reservations cleaned up in {result.execution_time_seconds:.2f}s")
        
        return result

# Service instances
pickup_window_service = PickupWindowService()
advanced_reservation_service = AdvancedReservationService()
cleanup_service = ExpiredReservationCleanupService()