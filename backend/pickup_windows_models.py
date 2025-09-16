"""
Phase 3 Week 3: Pickup Windows & Advanced Reservations - Data Models
Pydantic models for scheduling, window management, and reservation extensions
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime, time
import uuid

# Pickup window models
class TimeSlot(BaseModel):
    """Time slot for pickup windows"""
    start_time: str  # "09:00" format
    end_time: str    # "10:00" format
    
    @validator('start_time', 'end_time')
    def validate_time_format(cls, v):
        try:
            # Validate HH:MM format
            time.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError('Time must be in HH:MM format')

class PickupWindow(BaseModel):
    """Pickup window for a specific location and date"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    date: str  # "2024-01-15" format
    time_slot: TimeSlot
    capacity: int = Field(ge=1, description="Maximum reservations for this window")
    reserved: int = Field(default=0, ge=0, description="Current reservation count")
    status: Literal["active", "inactive", "full"] = "active"
    
    # Metadata
    created_by: Optional[str] = None  # Staff member who created the window
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    
    @validator('date')
    def validate_date_format(cls, v):
        try:
            datetime.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
    
    @property
    def is_available(self) -> bool:
        """Check if window has available slots"""
        return self.status == "active" and self.reserved < self.capacity
    
    @property
    def availability_percentage(self) -> float:
        """Get availability percentage"""
        if self.capacity == 0:
            return 0.0
        return (self.capacity - self.reserved) / self.capacity * 100

class PickupWindowCreate(BaseModel):
    """Request to create pickup windows"""
    location_id: str
    date: str
    time_slots: List[TimeSlot]
    capacity_per_slot: int = Field(default=10, ge=1)
    notes: Optional[str] = None
    
    @validator('time_slots')
    def validate_time_slots(cls, v):
        if not v:
            raise ValueError('At least one time slot is required')
        if len(v) > 20:  # Reasonable limit
            raise ValueError('Maximum 20 time slots per request')
        
        # Check for overlapping slots
        for i, slot1 in enumerate(v):
            for j, slot2 in enumerate(v[i+1:], i+1):
                start1 = time.fromisoformat(slot1.start_time)
                end1 = time.fromisoformat(slot1.end_time)
                start2 = time.fromisoformat(slot2.start_time)
                end2 = time.fromisoformat(slot2.end_time)
                
                # Check for overlap
                if not (end1 <= start2 or end2 <= start1):
                    raise ValueError(f'Time slots {i+1} and {j+1} overlap')
        
        return v

class PickupWindowUpdate(BaseModel):
    """Update pickup window"""
    capacity: Optional[int] = Field(None, ge=1)
    status: Optional[Literal["active", "inactive", "full"]] = None
    notes: Optional[str] = None

# Advanced reservation models
class ReservationExtensionRequest(BaseModel):
    """Request to extend a reservation"""
    extension_minutes: int = Field(ge=15, le=120, description="Extension in minutes (15-120)")
    reason: Optional[str] = None

class ReservationModification(BaseModel):
    """Modify reservation items or pickup details"""
    items: Optional[List[Dict[str, Any]]] = None  # New item list
    pickup_window_id: Optional[str] = None        # Change pickup window
    notes: Optional[str] = None

class PartialPickupItem(BaseModel):
    """Item picked up partially"""
    sku: str
    requested_qty: int
    picked_up_qty: int = Field(ge=0)
    reason_for_shortage: Optional[str] = None

class PartialPickupRequest(BaseModel):
    """Record partial pickup of reservation"""
    items: List[PartialPickupItem]
    pickup_notes: Optional[str] = None
    completion_status: Literal["partial", "complete"] = "partial"

class ReservationCancellation(BaseModel):
    """Cancellation request with reason"""
    reason: Literal["customer_request", "out_of_stock", "location_closed", "other"] = "customer_request"
    notes: Optional[str] = None
    refund_requested: bool = False

# Notification models
class PickupReminder(BaseModel):
    """Pickup reminder notification"""
    reservation_id: str
    user_id: str
    reminder_type: Literal["24h_before", "2h_before", "30m_before", "ready_now"]
    scheduled_at: str
    sent_at: Optional[str] = None
    delivery_channels: List[Literal["sms", "push", "email"]] = ["push"]
    status: Literal["scheduled", "sent", "failed", "cancelled"] = "scheduled"

# Analytics models
class PickupWindowAnalytics(BaseModel):
    """Analytics for pickup windows"""
    location_id: str
    date_range: Dict[str, str]  # {"start": "2024-01-01", "end": "2024-01-31"}
    
    # Window statistics
    total_windows_created: int
    total_capacity_offered: int
    total_reservations_made: int
    utilization_rate: float  # reservations / capacity
    
    # Popular time slots
    popular_slots: List[Dict[str, Any]]  # [{"slot": "10:00-11:00", "bookings": 25}]
    
    # Performance metrics
    avg_window_utilization: float
    peak_utilization_day: Optional[str]
    lowest_utilization_day: Optional[str]
    
    # Customer behavior
    advance_booking_days: float  # Average days customers book in advance
    cancellation_rate: float
    no_show_rate: float

class ReservationAnalytics(BaseModel):
    """Analytics for reservation behavior"""
    location_id: Optional[str] = None
    date_range: Dict[str, str]
    
    # Reservation lifecycle
    total_reservations: int
    confirmed_reservations: int
    cancelled_reservations: int
    expired_reservations: int
    completed_pickups: int
    
    # Timing metrics
    avg_hold_duration_minutes: float
    avg_pickup_completion_time_minutes: float
    extension_rate: float  # % of reservations that were extended
    
    # Customer satisfaction indicators
    partial_pickup_rate: float
    successful_pickup_rate: float
    repeat_customer_rate: float

# Service configuration models
class PickupServiceConfig(BaseModel):
    """Configuration for pickup service at location"""
    location_id: str
    
    # Timing settings
    default_hold_duration_minutes: int = 30
    max_extension_minutes: int = 60
    max_extensions_per_reservation: int = 1
    
    # Window settings
    min_advance_booking_hours: int = 2
    max_advance_booking_days: int = 7
    default_slot_duration_minutes: int = 60
    default_slot_capacity: int = 10
    
    # Business rules
    allow_partial_pickups: bool = True
    require_pickup_confirmation: bool = True
    send_reminders: bool = True
    
    # Operating hours
    operating_hours: List[Dict[str, Any]] = []  # [{"day": 1, "start": "09:00", "end": "18:00"}]
    
    # Notification settings
    reminder_schedule: List[str] = ["24h_before", "2h_before"]  # Which reminders to send
    
    # Integration settings
    pos_integration_enabled: bool = False
    auto_release_expired: bool = True

# Response models
class PickupWindowsResponse(BaseModel):
    """Response for pickup windows query"""
    location_id: str
    date: str
    windows: List[PickupWindow]
    total_capacity: int
    available_capacity: int
    next_available_slot: Optional[Dict[str, Any]] = None

class ReservationScheduleResponse(BaseModel):
    """Response for reservation scheduling"""
    reservation_id: str
    pickup_window_id: str
    scheduled_slot: Dict[str, Any]  # Window details
    confirmation_code: str
    estimated_wait_time_minutes: Optional[int] = None

class AdvancedReservationStatus(BaseModel):
    """Extended reservation status with pickup window details"""
    reservation_id: str
    status: str
    pickup_window: Optional[PickupWindow] = None
    extension_history: List[Dict[str, Any]] = []
    modification_history: List[Dict[str, Any]] = []
    reminders_sent: List[PickupReminder] = []
    
    # Current state
    current_hold_expires_at: Optional[str] = None
    next_reminder_at: Optional[str] = None
    estimated_pickup_time: Optional[str] = None

# Bulk operations
class BulkWindowCreation(BaseModel):
    """Create multiple windows efficiently"""
    location_id: str
    date_range: Dict[str, str]  # {"start": "2024-01-15", "end": "2024-01-30"}
    recurring_pattern: Dict[str, Any]  # Template for window creation
    
    # Pattern example:
    # {
    #   "days_of_week": [1, 2, 3, 4, 5],  # Monday-Friday
    #   "time_slots": [{"start": "09:00", "end": "10:00"}, {"start": "14:00", "end": "15:00"}],
    #   "capacity_per_slot": 8
    # }

class BulkWindowResult(BaseModel):
    """Result of bulk window creation"""
    requested_date_range: Dict[str, str]
    created_windows: int
    skipped_windows: int
    failed_windows: int
    
    details: List[Dict[str, Any]] = []  # Details of each creation attempt
    
    # Summary
    total_capacity_added: int
    date_coverage: List[str]  # Dates that now have windows

# Cleanup and maintenance models
class ExpiredReservationCleanup(BaseModel):
    """Configuration for expired reservation cleanup"""
    cleanup_batch_size: int = 100
    max_age_hours: int = 24
    release_inventory: bool = True
    send_notifications: bool = True
    
    # Filters
    location_ids: Optional[List[str]] = None
    exclude_user_ids: Optional[List[str]] = None  # VIP users to skip

class CleanupResult(BaseModel):
    """Result of cleanup operation"""
    cleanup_run_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    processed_reservations: int
    released_reservations: int
    restored_inventory_items: int
    notifications_sent: int
    errors: List[Dict[str, Any]] = []
    
    # Performance
    execution_time_seconds: float
    cleanup_efficiency: float  # released / processed ratio