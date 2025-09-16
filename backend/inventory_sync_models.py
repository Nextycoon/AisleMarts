"""
Phase 3 Week 2: Inventory Sync Service - Data Models
Pydantic models for inventory synchronization, conflict resolution, and audit trails
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
import uuid

# Core inventory sync models
class InventoryItem(BaseModel):
    """Single inventory item for sync operations"""
    sku: str
    gtin: Optional[str] = None
    qty: int = Field(ge=0, description="Quantity must be non-negative")
    price: Dict[str, Any]  # {amount: int, currency: str}
    attributes: Dict[str, Any] = {}
    updated_at: str  # ISO timestamp
    source: Literal["pos", "erp", "manual", "rfid", "csv"] = "manual"
    
    @validator('sku')
    def validate_sku(cls, v):
        if not v or len(v.strip()) < 3:
            raise ValueError('SKU must be at least 3 characters')
        return v.strip()
    
    @validator('price')
    def validate_price(cls, v):
        if not isinstance(v, dict) or 'amount' not in v:
            raise ValueError('Price must contain amount field')
        if not isinstance(v['amount'], int) or v['amount'] < 0:
            raise ValueError('Price amount must be non-negative integer')
        v.setdefault('currency', 'KES')
        return v

class BulkInventorySync(BaseModel):
    """Bulk inventory synchronization request"""
    merchant_id: str
    location_id: str
    sync_type: Literal["full", "delta"] = "delta"
    items: List[InventoryItem]
    sync_reference: Optional[str] = None  # External reference for tracking
    source_system: Optional[str] = None   # POS system identifier
    metadata: Dict[str, Any] = {}
    
    @validator('items')
    def validate_items(cls, v):
        if not v:
            raise ValueError('At least one item is required')
        if len(v) > 10000:  # Reasonable limit for single sync
            raise ValueError('Maximum 10,000 items per sync request')
        return v
    
    def __init__(self, **data):
        if 'sync_reference' not in data or not data['sync_reference']:
            data['sync_reference'] = f"SYNC-{uuid.uuid4().hex[:8].upper()}"
        super().__init__(**data)

class InventoryConflict(BaseModel):
    """Represents an inventory conflict that needs resolution"""
    sku: str
    location_id: str
    current_item: Dict[str, Any]  # Current database state
    incoming_item: Dict[str, Any] # Incoming sync data
    conflict_type: Literal["timestamp", "quantity_mismatch", "price_difference", "missing_item"]
    resolution: Optional[Literal["keep_current", "use_incoming", "manual_review"]] = None
    resolved_at: Optional[str] = None
    resolved_by: Optional[str] = None

class SyncResult(BaseModel):
    """Result of inventory synchronization operation"""
    sync_reference: str
    merchant_id: str
    location_id: str
    sync_type: str
    status: Literal["success", "partial", "failed"]
    
    # Statistics
    total_items: int
    processed_items: int
    created_items: int
    updated_items: int
    skipped_items: int
    failed_items: int
    
    # Details
    conflicts: List[InventoryConflict] = []
    errors: List[Dict[str, Any]] = []
    warnings: List[str] = []
    
    # Timing
    started_at: str
    completed_at: str
    processing_time_ms: float
    
    # Audit
    changes_summary: Dict[str, Any] = {}

class InventoryAudit(BaseModel):
    """Audit trail for inventory changes"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    merchant_id: str
    location_id: str
    sku: str
    
    # Change details
    change_type: Literal["create", "update", "delete", "sync"]
    old_values: Optional[Dict[str, Any]] = None
    new_values: Dict[str, Any]
    diff: Dict[str, Any] = {}  # Specific fields that changed
    
    # Context
    source: str  # pos, erp, manual, api, csv
    sync_reference: Optional[str] = None
    user_id: Optional[str] = None
    
    # Metadata
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

# CSV Import models
class CSVImportJob(BaseModel):
    """CSV import job tracking"""
    job_id: str = Field(default_factory=lambda: f"CSV-{uuid.uuid4().hex[:8].upper()}")
    merchant_id: str
    location_id: str
    filename: str
    file_size: int
    status: Literal["pending", "processing", "completed", "failed"] = "pending"
    
    # Progress tracking
    total_rows: Optional[int] = None
    processed_rows: int = 0
    successful_rows: int = 0
    failed_rows: int = 0
    
    # Results
    validation_errors: List[Dict[str, Any]] = []
    processing_errors: List[Dict[str, Any]] = []
    warnings: List[str] = []
    
    # Timing
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    
    # File info
    file_path: Optional[str] = None
    original_filename: str
    file_hash: Optional[str] = None

class CSVValidationError(BaseModel):
    """CSV validation error details"""
    row_number: int
    column: Optional[str] = None
    error_type: str
    message: str
    suggested_fix: Optional[str] = None

# Background job models
class ReconciliationJob(BaseModel):
    """Nightly inventory reconciliation job"""
    job_id: str = Field(default_factory=lambda: f"RECON-{datetime.utcnow().strftime('%Y%m%d')}")
    status: Literal["pending", "running", "completed", "failed"] = "pending"
    
    # Scope
    merchant_ids: Optional[List[str]] = None  # None = all merchants
    location_ids: Optional[List[str]] = None  # None = all locations
    
    # Results
    merchants_processed: int = 0
    locations_processed: int = 0
    items_reconciled: int = 0
    discrepancies_found: int = 0
    corrections_made: int = 0
    
    # Issues found
    discrepancies: List[Dict[str, Any]] = []
    errors: List[str] = []
    
    # Timing
    scheduled_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    duration_seconds: Optional[float] = None

class InventoryAlert(BaseModel):
    """Inventory-related alerts and notifications"""
    alert_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    alert_type: Literal["low_stock", "out_of_stock", "sync_failure", "large_discrepancy", "expired_reservation"]
    severity: Literal["info", "warning", "error", "critical"] = "warning"
    
    # Target
    merchant_id: str
    location_id: Optional[str] = None
    sku: Optional[str] = None
    
    # Alert details
    title: str
    message: str
    data: Dict[str, Any] = {}
    
    # Status
    status: Literal["new", "acknowledged", "resolved", "dismissed"] = "new"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    acknowledged_at: Optional[str] = None
    resolved_at: Optional[str] = None
    
    # Notification
    notification_sent: bool = False
    notification_channels: List[str] = []  # email, sms, push

# API Response models
class SyncStatusResponse(BaseModel):
    """Response for sync status queries"""
    sync_reference: str
    status: str
    progress_percentage: float
    current_step: str
    estimated_completion: Optional[str] = None
    result: Optional[SyncResult] = None

class InventoryStatsResponse(BaseModel):
    """Inventory statistics for merchants"""
    merchant_id: str
    location_id: str
    
    # Current state
    total_skus: int
    total_quantity: int
    total_value: float
    currency: str = "KES"
    
    # Recent activity  
    last_sync_at: Optional[str] = None
    last_update_at: Optional[str] = None
    sync_frequency: str  # "hourly", "daily", etc.
    
    # Health metrics
    low_stock_items: int
    out_of_stock_items: int
    sync_success_rate: float  # Last 30 days
    avg_sync_duration_ms: float

class MerchantInventoryDashboard(BaseModel):
    """Complete merchant inventory dashboard data"""
    merchant_id: str
    merchant_name: str
    locations: List[InventoryStatsResponse]
    
    # Aggregate metrics
    total_locations: int
    total_skus_across_locations: int
    total_inventory_value: float
    
    # Alerts and notifications
    active_alerts: List[InventoryAlert]
    pending_reconciliations: int
    
    # Recent activity
    recent_syncs: List[SyncResult]
    recent_uploads: List[CSVImportJob]
    
    # Performance
    overall_sync_health: Literal["excellent", "good", "fair", "poor"]
    last_activity_at: Optional[str] = None