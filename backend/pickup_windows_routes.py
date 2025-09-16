"""
Phase 3 Week 3: Pickup Windows & Advanced Reservations - FastAPI Routes
API endpoints for window management, reservation scheduling, and notifications
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path, BackgroundTasks
from typing import List, Optional
import logging
import asyncio
from datetime import datetime, timedelta

from fastapi import Header
from security import decode_access_token
from pickup_windows_models import (
    PickupWindowCreate, PickupWindow, PickupWindowUpdate, PickupWindowsResponse,
    ReservationScheduleResponse, ReservationExtensionRequest, ReservationModification,
    PartialPickupRequest, ReservationCancellation, ExpiredReservationCleanup,
    CleanupResult, BulkWindowCreation, BulkWindowResult, AdvancedReservationStatus
)
from pickup_windows_service import (
    pickup_window_service, advanced_reservation_service, cleanup_service
)
from db import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/pickup", tags=["pickup-windows"])

# Authentication dependencies
async def get_authenticated_user(authorization: str | None = Header(None)):
    """Get authenticated user"""
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

async def get_admin_user(authorization: str | None = Header(None)):
    """Get authenticated admin user"""
    user = await get_authenticated_user(authorization)
    if not user.get("is_admin", False):
        raise HTTPException(403, "Admin access required")
    return user

# Pickup Window Management Endpoints
@router.post("/windows", response_model=List[PickupWindow])
async def create_pickup_windows(
    window_request: PickupWindowCreate,
    user: dict = Depends(get_authenticated_user)
):
    """
    Create pickup windows for a location and date
    
    Creates time slots for customers to schedule their pickups.
    Prevents double-booking and manages capacity automatically.
    """
    try:
        # Validate user has access to this location
        location = await db().locations.find_one({
            "_id": window_request.location_id,
            "merchant_id": str(user.get("merchant_id", ""))
        })
        
        if not location and not user.get("is_admin"):
            raise HTTPException(403, "Access denied to this location")
        
        windows = await pickup_window_service.create_pickup_windows(window_request)
        
        logger.info(f"Created {len(windows)} pickup windows for {window_request.location_id} on {window_request.date}")
        
        return windows
        
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Create pickup windows failed: {e}")
        raise HTTPException(500, f"Failed to create pickup windows: {str(e)}")

@router.get("/windows", response_model=PickupWindowsResponse)
async def get_pickup_windows(
    location_id: str = Query(..., description="Location ID"),
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    min_capacity: int = Query(1, description="Minimum available spots required"),
    user: dict = Depends(get_authenticated_user)
):
    """Get available pickup windows for a location and date"""
    try:
        # Validate date format
        datetime.fromisoformat(date)
        
        windows_response = await pickup_window_service.get_available_windows(
            location_id, date, min_capacity
        )
        
        return windows_response
        
    except ValueError as e:
        raise HTTPException(400, f"Invalid date format: {str(e)}")
    except Exception as e:
        logger.error(f"Get pickup windows failed: {e}")
        raise HTTPException(500, f"Failed to get pickup windows: {str(e)}")

@router.patch("/windows/{window_id}", response_model=PickupWindow)
async def update_pickup_window(
    window_id: str = Path(..., description="Pickup window ID"),
    update_data: PickupWindowUpdate = ...,
    user: dict = Depends(get_authenticated_user)
):
    """Update pickup window details"""
    try:
        # Verify user has access to this window's location
        window_data = await db().pickup_windows.find_one({"id": window_id})
        if not window_data:
            raise HTTPException(404, "Pickup window not found")
        
        location = await db().locations.find_one({
            "_id": window_data["location_id"],
            "merchant_id": str(user.get("merchant_id", ""))
        })
        
        if not location and not user.get("is_admin"):
            raise HTTPException(403, "Access denied to this pickup window")
        
        updated_window = await pickup_window_service.update_pickup_window(window_id, update_data)
        
        return updated_window
        
    except ValueError as e:
        raise HTTPException(400, str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update pickup window failed: {e}")
        raise HTTPException(500, f"Failed to update pickup window: {str(e)}")

@router.post("/windows/bulk", response_model=BulkWindowResult)
async def bulk_create_windows(
    bulk_request: BulkWindowCreation,
    user: dict = Depends(get_admin_user)
):
    """Create multiple pickup windows based on recurring pattern (Admin only)"""
    try:
        result = await pickup_window_service.bulk_create_windows(bulk_request)
        
        logger.info(f"Bulk created {result.created_windows} windows for {bulk_request.location_id}")
        
        return result
        
    except Exception as e:
        logger.error(f"Bulk create windows failed: {e}")
        raise HTTPException(500, f"Failed to bulk create windows: {str(e)}")

# Reservation Scheduling Endpoints
@router.post("/reservations/{reservation_id}/schedule", response_model=ReservationScheduleResponse)
async def schedule_reservation(
    reservation_id: str = Path(..., description="Reservation ID"),
    pickup_window_id: str = Query(..., description="Pickup window ID"),
    user: dict = Depends(get_authenticated_user)
):
    """Schedule a reservation for a specific pickup window"""
    try:
        # Verify user owns this reservation
        reservation = await db().reservations.find_one({
            "_id": reservation_id,
            "user_id": str(user["_id"])
        })
        
        if not reservation:
            raise HTTPException(404, "Reservation not found or access denied")
        
        response = await pickup_window_service.schedule_reservation(reservation_id, pickup_window_id)
        
        logger.info(f"Scheduled reservation {reservation_id} for window {pickup_window_id}")
        
        return response
        
    except ValueError as e:
        raise HTTPException(400, str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Schedule reservation failed: {e}")
        raise HTTPException(500, f"Failed to schedule reservation: {str(e)}")

# Advanced Reservation Management
@router.post("/reservations/{reservation_id}/extend")
async def extend_reservation(
    reservation_id: str = Path(..., description="Reservation ID"),
    extension_request: ReservationExtensionRequest = ...,
    user: dict = Depends(get_authenticated_user)
):
    """Extend reservation hold time"""
    try:
        # Verify user owns this reservation
        reservation = await db().reservations.find_one({
            "_id": reservation_id,
            "user_id": str(user["_id"])
        })
        
        if not reservation:
            raise HTTPException(404, "Reservation not found or access denied")
        
        result = await advanced_reservation_service.extend_reservation(reservation_id, extension_request)
        
        logger.info(f"Extended reservation {reservation_id} by {extension_request.extension_minutes} minutes")
        
        return result
        
    except ValueError as e:
        raise HTTPException(400, str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Extend reservation failed: {e}")
        raise HTTPException(500, f"Failed to extend reservation: {str(e)}")

@router.patch("/reservations/{reservation_id}/modify")
async def modify_reservation(
    reservation_id: str = Path(..., description="Reservation ID"),
    modification: ReservationModification = ...,
    user: dict = Depends(get_authenticated_user)
):
    """Modify reservation items or pickup details"""
    try:
        # Verify user owns this reservation
        reservation = await db().reservations.find_one({
            "_id": reservation_id,
            "user_id": str(user["_id"])
        })
        
        if not reservation:
            raise HTTPException(404, "Reservation not found or access denied")
        
        result = await advanced_reservation_service.modify_reservation(reservation_id, modification)
        
        logger.info(f"Modified reservation {reservation_id}")
        
        return result
        
    except ValueError as e:
        raise HTTPException(400, str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Modify reservation failed: {e}")
        raise HTTPException(500, f"Failed to modify reservation: {str(e)}")

@router.post("/reservations/{reservation_id}/partial-pickup")
async def process_partial_pickup(
    reservation_id: str = Path(..., description="Reservation ID"),
    partial_pickup: PartialPickupRequest = ...,
    user: dict = Depends(get_authenticated_user)
):
    """Process partial pickup of reservation items (Merchant access)"""
    try:
        # Verify user is merchant or admin
        reservation = await db().reservations.find_one({"_id": reservation_id})
        if not reservation:
            raise HTTPException(404, "Reservation not found")
        
        # Check if user is merchant for any of the pickup locations
        location_ids = []
        for item in reservation.get("items", []):
            if item.get("location_id"):
                location_ids.append(item["location_id"])
        
        if location_ids and not user.get("is_admin"):
            merchant_locations = await db().locations.find({
                "_id": {"$in": location_ids},
                "merchant_id": str(user.get("merchant_id"))
            }).to_list(100)
            
            if not merchant_locations:
                raise HTTPException(403, "Access denied - not authorized for pickup location")
        
        result = await advanced_reservation_service.process_partial_pickup(reservation_id, partial_pickup)
        
        logger.info(f"Processed partial pickup for reservation {reservation_id}")
        
        return result
        
    except ValueError as e:
        raise HTTPException(400, str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Process partial pickup failed: {e}")
        raise HTTPException(500, f"Failed to process partial pickup: {str(e)}")

@router.post("/reservations/{reservation_id}/cancel")
async def cancel_reservation(
    reservation_id: str = Path(..., description="Reservation ID"),
    cancellation: ReservationCancellation = ...,
    user: dict = Depends(get_authenticated_user)
):
    """Cancel reservation and release resources"""
    try:
        # Verify user owns this reservation
        reservation = await db().reservations.find_one({
            "_id": reservation_id,
            "user_id": str(user["_id"])
        })
        
        if not reservation:
            raise HTTPException(404, "Reservation not found or access denied")
        
        result = await advanced_reservation_service.cancel_reservation(reservation_id, cancellation)
        
        logger.info(f"Cancelled reservation {reservation_id}: {cancellation.reason}")
        
        return result
        
    except ValueError as e:
        raise HTTPException(400, str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cancel reservation failed: {e}")
        raise HTTPException(500, f"Failed to cancel reservation: {str(e)}")

@router.get("/reservations/{reservation_id}/status", response_model=AdvancedReservationStatus)
async def get_advanced_reservation_status(
    reservation_id: str = Path(..., description="Reservation ID"),
    user: dict = Depends(get_authenticated_user)
):
    """Get detailed reservation status with pickup window details"""
    try:
        # Verify user owns this reservation or is admin
        reservation = await db().reservations.find_one({"_id": reservation_id})
        if not reservation:
            raise HTTPException(404, "Reservation not found")
        
        if str(reservation["user_id"]) != str(user["_id"]) and not user.get("is_admin"):
            raise HTTPException(403, "Access denied")
        
        # Get pickup window details if scheduled
        pickup_window = None
        if reservation.get("pickup_window_id"):
            window_data = await db().pickup_windows.find_one({"id": reservation["pickup_window_id"]})
            if window_data:
                pickup_window = PickupWindow(**window_data)
        
        status = AdvancedReservationStatus(
            reservation_id=reservation_id,
            status=reservation["status"],
            pickup_window=pickup_window,
            extension_history=reservation.get("extension_history", []),
            modification_history=reservation.get("modification_history", []),
            reminders_sent=[],  # TODO: Get from reminders collection
            current_hold_expires_at=reservation.get("hold_expires_at"),
            next_reminder_at=None,  # TODO: Calculate next reminder
            estimated_pickup_time=None  # TODO: Calculate based on window
        )
        
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get reservation status failed: {e}")
        raise HTTPException(500, f"Failed to get reservation status: {str(e)}")

# Cleanup and Maintenance Endpoints (Admin only)
@router.post("/cleanup/expired-reservations", response_model=CleanupResult)
async def cleanup_expired_reservations(
    config: ExpiredReservationCleanup = ExpiredReservationCleanup(),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    user: dict = Depends(get_admin_user)
):
    """Clean up expired reservations and release resources (Admin only)"""
    try:
        # Run cleanup in background
        result = await cleanup_service.cleanup_expired_reservations(config)
        
        logger.info(f"Cleanup completed: {result.released_reservations}/{result.processed_reservations} reservations")
        
        return result
        
    except Exception as e:
        logger.error(f"Cleanup expired reservations failed: {e}")
        raise HTTPException(500, f"Failed to cleanup expired reservations: {str(e)}")

@router.post("/cleanup/run-background")
async def run_background_cleanup(
    background_tasks: BackgroundTasks,
    max_age_hours: int = Query(24, description="Maximum age of reservations to cleanup"),
    batch_size: int = Query(100, description="Number of reservations to process"),
    user: dict = Depends(get_admin_user)
):
    """Run cleanup in background (Admin only)"""
    def cleanup_task():
        asyncio.create_task(cleanup_service.cleanup_expired_reservations(
            ExpiredReservationCleanup(
                cleanup_batch_size=batch_size,
                max_age_hours=max_age_hours
            )
        ))
    
    background_tasks.add_task(cleanup_task)
    
    return {
        "message": "Background cleanup started",
        "max_age_hours": max_age_hours,
        "batch_size": batch_size
    }

# Analytics and Monitoring
@router.get("/analytics/windows")
async def get_window_analytics(
    location_id: str = Query(..., description="Location ID"),
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    user: dict = Depends(get_authenticated_user)
):
    """Get pickup window analytics for a location"""
    try:
        # Verify access to location
        location = await db().locations.find_one({"_id": location_id})
        if not location:
            raise HTTPException(404, "Location not found")
        
        if str(location["merchant_id"]) != str(user.get("merchant_id")) and not user.get("is_admin"):
            raise HTTPException(403, "Access denied to this location")
        
        # Get window statistics
        windows = await db().pickup_windows.find({
            "location_id": location_id,
            "date": {"$gte": start_date, "$lte": end_date}
        }).to_list(1000)
        
        total_windows = len(windows)
        total_capacity = sum(w["capacity"] for w in windows)
        total_reserved = sum(w["reserved"] for w in windows)
        utilization_rate = (total_reserved / total_capacity * 100) if total_capacity > 0 else 0
        
        # Popular time slots
        slot_stats = {}
        for window in windows:
            slot_key = f"{window['time_slot']['start_time']}-{window['time_slot']['end_time']}"
            if slot_key not in slot_stats:
                slot_stats[slot_key] = {"bookings": 0, "capacity": 0}
            slot_stats[slot_key]["bookings"] += window["reserved"]
            slot_stats[slot_key]["capacity"] += window["capacity"]
        
        popular_slots = [
            {"slot": slot, "bookings": stats["bookings"], "utilization": stats["bookings"]/stats["capacity"]*100 if stats["capacity"] > 0 else 0}
            for slot, stats in sorted(slot_stats.items(), key=lambda x: x[1]["bookings"], reverse=True)
        ]
        
        return {
            "location_id": location_id,
            "date_range": {"start": start_date, "end": end_date},
            "total_windows_created": total_windows,
            "total_capacity_offered": total_capacity,
            "total_reservations_made": total_reserved,
            "utilization_rate": round(utilization_rate, 2),
            "popular_slots": popular_slots[:10],
            "avg_window_utilization": round(utilization_rate, 2)  # Simplified for now
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get window analytics failed: {e}")
        raise HTTPException(500, f"Failed to get window analytics: {str(e)}")

@router.get("/analytics/reservations")
async def get_reservation_analytics(
    location_id: Optional[str] = Query(None, description="Location ID (optional)"),
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    user: dict = Depends(get_authenticated_user)
):
    """Get reservation analytics"""
    try:
        # Build filter
        date_filter = {
            "created_at": {
                "$gte": start_date + "T00:00:00Z",
                "$lte": end_date + "T23:59:59Z"
            }
        }
        
        if location_id:
            # Verify access
            location = await db().locations.find_one({"_id": location_id})
            if not location:
                raise HTTPException(404, "Location not found")
            
            if str(location["merchant_id"]) != str(user.get("merchant_id")) and not user.get("is_admin"):
                raise HTTPException(403, "Access denied to this location")
            
            date_filter["items.location_id"] = location_id
        elif not user.get("is_admin"):
            # Limit to user's merchant locations
            merchant_locations = await db().locations.find({
                "merchant_id": str(user.get("merchant_id"))
            }).to_list(100)
            
            location_ids = [str(loc["_id"]) for loc in merchant_locations]
            date_filter["items.location_id"] = {"$in": location_ids}
        
        # Get reservation statistics
        reservations = await db().reservations.find(date_filter).to_list(10000)
        
        total_reservations = len(reservations)
        status_counts = {}
        for reservation in reservations:
            status = reservation["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            "location_id": location_id,
            "date_range": {"start": start_date, "end": end_date},
            "total_reservations": total_reservations,
            "confirmed_reservations": status_counts.get("confirmed", 0),
            "cancelled_reservations": status_counts.get("cancelled", 0),
            "expired_reservations": status_counts.get("expired", 0),
            "completed_pickups": status_counts.get("completed", 0),
            "successful_pickup_rate": round(status_counts.get("completed", 0) / total_reservations * 100, 2) if total_reservations > 0 else 0,
            "status_breakdown": status_counts
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get reservation analytics failed: {e}")
        raise HTTPException(500, f"Failed to get reservation analytics: {str(e)}")

# Health and Status
@router.get("/health")
async def pickup_system_health():
    """Get pickup system health status"""
    try:
        # Check active windows
        active_windows = await db().pickup_windows.count_documents({"status": "active"})
        
        # Check recent reservations
        recent_cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat() + "Z"
        recent_reservations = await db().reservations.count_documents({
            "created_at": {"$gte": recent_cutoff}
        })
        
        # Check pending pickups
        pending_pickups = await db().reservations.count_documents({
            "status": {"$in": ["scheduled", "confirmed"]}
        })
        
        # Check overdue reservations
        now = datetime.utcnow().isoformat() + "Z"
        overdue_reservations = await db().reservations.count_documents({
            "status": {"$in": ["held", "scheduled"]},
            "hold_expires_at": {"$lt": now}
        })
        
        return {
            "status": "healthy" if overdue_reservations < 10 else "degraded",
            "active_windows": active_windows,
            "recent_reservations_24h": recent_reservations,
            "pending_pickups": pending_pickups,
            "overdue_reservations": overdue_reservations,
            "features": {
                "window_creation": True,
                "reservation_scheduling": True,
                "reservation_extensions": True,
                "partial_pickups": True,
                "cleanup_automation": True,
                "analytics": True
            },
            "recommendations": [
                "Run cleanup for overdue reservations" if overdue_reservations > 5 else None
            ]
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(500, f"Health check failed: {str(e)}")