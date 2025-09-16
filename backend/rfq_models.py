"""
B2B RFQ (Request for Quote) Models
MongoDB collections and data models for RFQ workflows in Universal AI Commerce Engine Phase 2
"""
from datetime import datetime, timedelta
from typing import TypedDict, Literal, List, Dict, Optional, Union
from pydantic import BaseModel, Field
from enum import Enum

# ============= ENUMS =============

class RFQStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    QUOTED = "quoted"
    NEGOTIATING = "negotiating"
    AWARDED = "awarded"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

class QuoteStatus(str, Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    REVISED = "revised"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"

class PurchaseOrderStatus(str, Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MessageType(str, Enum):
    MESSAGE = "message"
    QUOTE_UPDATE = "quote_update"
    ATTACHMENT = "attachment"
    SYSTEM = "system"
    PAYMENT = "payment"

class UrgencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# ============= MONGODB COLLECTION MODELS =============

class RFQItemDoc(TypedDict):
    """RFQ item specification document"""
    _id: str
    rfq_id: str
    product_id: Optional[str]  # Reference to existing product if available
    title: str
    description: str
    specifications: Dict[str, str]  # {"material": "stainless steel", "capacity": "10L"}
    quantity: int
    unit: str  # "pieces", "kg", "meters", etc.
    target_price_minor: Optional[int]  # Target price in minor units
    currency: str
    delivery_location: Optional[str]
    delivery_date_required: Optional[datetime]
    notes: Optional[str]
    attachments: List[str]  # File URLs/paths
    created_at: datetime

class RFQDoc(TypedDict):
    """Main RFQ document in MongoDB"""
    _id: str
    buyer_id: str  # Reference to users collection
    title: str
    description: str
    status: RFQStatus
    urgency: UrgencyLevel
    total_items: int
    estimated_budget_minor: Optional[int]  # Total estimated budget
    currency: str
    delivery_location: str
    delivery_date_required: datetime
    submission_deadline: datetime
    requirements: Dict[str, str]  # Additional requirements
    payment_terms: Optional[str]  # "30 days", "advance", "on delivery"
    terms_conditions: Optional[str]
    attachments: List[str]
    supplier_ids: List[str]  # Invited suppliers
    tags: List[str]  # ["electronics", "bulk", "wholesale"]
    is_public: bool  # Public RFQ vs private invitation
    view_count: int
    quote_count: int
    created_at: datetime
    updated_at: datetime
    expires_at: datetime

class QuoteDoc(TypedDict):
    """Quote response document"""
    _id: str
    rfq_id: str
    supplier_id: str  # Reference to users collection  
    status: QuoteStatus
    total_price_minor: int
    currency: str
    line_items: List[Dict[str, Union[str, int, float]]]  # Detailed pricing per RFQ item
    delivery_days: int
    delivery_terms: str
    payment_terms: str
    validity_days: int  # How long quote is valid
    notes: str
    attachments: List[str]
    revisions: List[Dict]  # Quote revision history
    score: Optional[float]  # Buyer scoring of this quote
    is_shortlisted: bool
    created_at: datetime
    updated_at: datetime
    expires_at: datetime

class NegotiationMessageDoc(TypedDict):
    """Negotiation message document"""
    _id: str
    rfq_id: str
    quote_id: Optional[str]  # Associated quote if applicable
    sender_id: str
    recipient_id: str
    message_type: MessageType
    subject: Optional[str]
    message: str
    attachments: List[str]
    metadata: Dict[str, str]  # Additional context data
    is_read: bool
    read_at: Optional[datetime]
    created_at: datetime

class PurchaseOrderDoc(TypedDict):
    """Purchase Order document"""
    _id: str
    rfq_id: str
    quote_id: str
    buyer_id: str
    supplier_id: str
    po_number: str  # Generated PO number
    status: PurchaseOrderStatus
    total_amount_minor: int
    currency: str
    line_items: List[Dict[str, Union[str, int, float]]]
    delivery_address: str
    billing_address: str
    delivery_date_requested: datetime
    payment_terms: str
    notes: str
    attachments: List[str]
    payment_ids: List[str]  # References to payment transactions
    shipment_tracking: Optional[str]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]

# ============= PYDANTIC API MODELS =============

class RFQItemCreate(BaseModel):
    """Create RFQ item request"""
    product_id: Optional[str] = None
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)
    specifications: Dict[str, str] = Field(default_factory=dict)
    quantity: int = Field(..., gt=0)
    unit: str = Field(..., min_length=1, max_length=20)
    target_price_minor: Optional[int] = Field(None, gt=0)
    currency: str = Field(default="KES", pattern="^[A-Z]{3}$")
    delivery_location: Optional[str] = None
    delivery_date_required: Optional[datetime] = None
    notes: Optional[str] = None
    attachments: List[str] = Field(default_factory=list)

class RFQItem(RFQItemCreate):
    """RFQ item response"""
    id: str
    rfq_id: str
    created_at: datetime

class RFQCreate(BaseModel):
    """Create RFQ request"""
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20, max_length=2000)
    urgency: UrgencyLevel = UrgencyLevel.MEDIUM
    estimated_budget_minor: Optional[int] = Field(None, gt=0)
    currency: str = Field(default="KES", pattern="^[A-Z]{3}$")
    delivery_location: str = Field(..., min_length=5, max_length=200)
    delivery_date_required: datetime
    submission_deadline: datetime
    requirements: Dict[str, str] = Field(default_factory=dict)
    payment_terms: Optional[str] = None
    terms_conditions: Optional[str] = None
    attachments: List[str] = Field(default_factory=list)
    supplier_ids: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    is_public: bool = True
    items: List[RFQItemCreate]

class RFQ(BaseModel):
    """RFQ response model"""
    id: str
    buyer_id: str
    title: str
    description: str
    status: RFQStatus
    urgency: UrgencyLevel
    total_items: int
    estimated_budget_minor: Optional[int]
    currency: str
    delivery_location: str
    delivery_date_required: datetime
    submission_deadline: datetime
    requirements: Dict[str, str]
    payment_terms: Optional[str]
    terms_conditions: Optional[str]
    attachments: List[str]
    supplier_ids: List[str]
    tags: List[str]
    is_public: bool
    view_count: int
    quote_count: int
    created_at: datetime
    updated_at: datetime
    expires_at: datetime
    items: List[RFQItem] = Field(default_factory=list)

class QuoteLineItem(BaseModel):
    """Quote line item"""
    rfq_item_id: str
    description: str
    quantity: int
    unit_price_minor: int
    total_price_minor: int
    delivery_days: int
    notes: Optional[str] = None

class QuoteCreate(BaseModel):
    """Create quote request"""
    rfq_id: str
    line_items: List[QuoteLineItem]
    delivery_days: int = Field(..., gt=0)
    delivery_terms: str = Field(..., min_length=5, max_length=500)
    payment_terms: str = Field(..., min_length=5, max_length=200)
    validity_days: int = Field(default=30, gt=0, le=365)
    notes: str = Field(default="", max_length=1000)
    attachments: List[str] = Field(default_factory=list)

class Quote(BaseModel):
    """Quote response model"""
    id: str
    rfq_id: str
    supplier_id: str
    status: QuoteStatus
    total_price_minor: int
    currency: str
    line_items: List[QuoteLineItem]
    delivery_days: int
    delivery_terms: str
    payment_terms: str
    validity_days: int
    notes: str
    attachments: List[str]
    revisions: List[Dict] = Field(default_factory=list)
    score: Optional[float]
    is_shortlisted: bool
    created_at: datetime
    updated_at: datetime
    expires_at: datetime

class NegotiationMessageCreate(BaseModel):
    """Create negotiation message request"""
    rfq_id: str
    quote_id: Optional[str] = None
    recipient_id: str
    message_type: MessageType = MessageType.MESSAGE
    subject: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=2000)
    attachments: List[str] = Field(default_factory=list)
    metadata: Dict[str, str] = Field(default_factory=dict)

class NegotiationMessage(BaseModel):
    """Negotiation message response"""
    id: str
    rfq_id: str
    quote_id: Optional[str]
    sender_id: str
    recipient_id: str
    message_type: MessageType
    subject: Optional[str]
    message: str
    attachments: List[str]
    metadata: Dict[str, str]
    is_read: bool
    read_at: Optional[datetime]
    created_at: datetime

class PurchaseOrderCreate(BaseModel):
    """Create purchase order request"""
    rfq_id: str
    quote_id: str
    delivery_address: str = Field(..., min_length=10, max_length=500)
    billing_address: str = Field(..., min_length=10, max_length=500)
    delivery_date_requested: datetime
    notes: str = Field(default="", max_length=1000)
    attachments: List[str] = Field(default_factory=list)

class PurchaseOrder(BaseModel):
    """Purchase order response"""
    id: str
    rfq_id: str
    quote_id: str
    buyer_id: str
    supplier_id: str
    po_number: str
    status: PurchaseOrderStatus
    total_amount_minor: int
    currency: str
    line_items: List[Dict[str, Union[str, int, float]]]
    delivery_address: str
    billing_address: str
    delivery_date_requested: datetime
    payment_terms: str
    notes: str
    attachments: List[str]
    payment_ids: List[str]
    shipment_tracking: Optional[str]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]

# ============= RESPONSE MODELS =============

class RFQListResponse(BaseModel):
    """RFQ list response"""
    rfqs: List[RFQ]
    total: int
    page: int
    limit: int
    has_more: bool

class QuoteListResponse(BaseModel):
    """Quote list response"""
    quotes: List[Quote]
    total: int
    rfq_info: Dict[str, str]  # Basic RFQ information

class NegotiationThreadResponse(BaseModel):
    """Negotiation thread response"""
    messages: List[NegotiationMessage]
    participants: List[Dict[str, str]]  # User information
    total: int

class RFQAnalytics(BaseModel):
    """RFQ analytics response"""
    total_rfqs: int
    active_rfqs: int
    total_quotes: int
    average_quotes_per_rfq: float
    conversion_rate: float  # RFQ to PO conversion
    top_categories: List[Dict[str, Union[str, int]]]
    recent_activity: List[Dict[str, str]]

# ============= INDEX SPECIFICATIONS =============

RFQ_INDEXES = {
    "rfqs": [
        ("buyer_id", 1),
        ("status", 1),
        ("urgency", 1),
        ("is_public", 1),
        ("submission_deadline", 1),
        ("expires_at", 1),
        ("created_at", -1),
        ("tags", 1),
        # Compound indexes
        ("status", 1, "submission_deadline", 1),
        ("buyer_id", 1, "status", 1),
        ("is_public", 1, "status", 1, "submission_deadline", 1),
    ],
    "rfq_items": [
        ("rfq_id", 1),
        ("product_id", 1),
        ("title", "text"),
        ("description", "text"),
    ],
    "quotes": [
        ("rfq_id", 1),
        ("supplier_id", 1),
        ("status", 1),
        ("total_price_minor", 1),
        ("expires_at", 1),
        ("created_at", -1),
        # Compound indexes
        ("rfq_id", 1, "status", 1),
        ("supplier_id", 1, "status", 1),
        ("rfq_id", 1, "total_price_minor", 1),
    ],
    "negotiation_messages": [
        ("rfq_id", 1),
        ("quote_id", 1),
        ("sender_id", 1),
        ("recipient_id", 1),
        ("is_read", 1),
        ("created_at", -1),
        # Compound indexes
        ("rfq_id", 1, "created_at", -1),
        ("sender_id", 1, "recipient_id", 1, "created_at", -1),
    ],
    "purchase_orders": [
        ("buyer_id", 1),
        ("supplier_id", 1),
        ("rfq_id", 1),
        ("quote_id", 1),
        ("status", 1),
        ("po_number", 1),
        ("created_at", -1),
        ("delivery_date_requested", 1),
        # Compound indexes
        ("buyer_id", 1, "status", 1),
        ("supplier_id", 1, "status", 1),
    ]
}

# ============= UTILITY FUNCTIONS =============

def generate_po_number(buyer_id: str, created_at: datetime) -> str:
    """Generate unique PO number"""
    date_str = created_at.strftime("%Y%m%d")
    buyer_short = buyer_id[:8] if len(buyer_id) >= 8 else buyer_id
    timestamp = str(int(created_at.timestamp()))[-6:]
    return f"PO-{date_str}-{buyer_short.upper()}-{timestamp}"

def calculate_rfq_expires_at(submission_deadline: datetime, buffer_hours: int = 24) -> datetime:
    """Calculate RFQ expiration time with buffer after submission deadline"""
    return submission_deadline + timedelta(hours=buffer_hours)

def calculate_quote_expires_at(created_at: datetime, validity_days: int) -> datetime:
    """Calculate quote expiration time"""
    return created_at + timedelta(days=validity_days)

def get_urgency_color(urgency: UrgencyLevel) -> str:
    """Get color code for urgency level"""
    colors = {
        UrgencyLevel.LOW: "#10B981",      # Green
        UrgencyLevel.MEDIUM: "#F59E0B",   # Yellow
        UrgencyLevel.HIGH: "#EF4444",     # Red
        UrgencyLevel.URGENT: "#DC2626"    # Dark Red
    }
    return colors.get(urgency, "#6B7280")

def get_status_color(status: Union[RFQStatus, QuoteStatus, PurchaseOrderStatus]) -> str:
    """Get color code for status"""
    colors = {
        # RFQ Status Colors
        RFQStatus.DRAFT: "#6B7280",
        RFQStatus.PUBLISHED: "#3B82F6", 
        RFQStatus.QUOTED: "#F59E0B",
        RFQStatus.NEGOTIATING: "#8B5CF6",
        RFQStatus.AWARDED: "#10B981",
        RFQStatus.CANCELLED: "#EF4444",
        RFQStatus.EXPIRED: "#9CA3AF",
        
        # Quote Status Colors
        QuoteStatus.PENDING: "#6B7280",
        QuoteStatus.SUBMITTED: "#3B82F6",
        QuoteStatus.REVISED: "#F59E0B",
        QuoteStatus.ACCEPTED: "#10B981",
        QuoteStatus.REJECTED: "#EF4444",
        QuoteStatus.EXPIRED: "#9CA3AF",
        
        # PO Status Colors
        PurchaseOrderStatus.DRAFT: "#6B7280",
        PurchaseOrderStatus.CONFIRMED: "#3B82F6",
        PurchaseOrderStatus.PAID: "#10B981",
        PurchaseOrderStatus.SHIPPED: "#8B5CF6",
        PurchaseOrderStatus.DELIVERED: "#059669",
        PurchaseOrderStatus.COMPLETED: "#065F46",
        PurchaseOrderStatus.CANCELLED: "#EF4444",
    }
    return colors.get(status, "#6B7280")

# ============= VALIDATION HELPERS =============

def validate_delivery_date(delivery_date: datetime) -> bool:
    """Validate delivery date is in future"""
    return delivery_date > datetime.utcnow()

def validate_submission_deadline(submission_deadline: datetime, delivery_date: datetime) -> bool:
    """Validate submission deadline is before delivery date"""
    return submission_deadline < delivery_date

def validate_rfq_budget(estimated_budget_minor: int, items: List[RFQItemCreate]) -> bool:
    """Validate estimated budget covers target prices"""
    total_target = sum(
        (item.target_price_minor or 0) * item.quantity 
        for item in items 
        if item.target_price_minor
    )
    return total_target == 0 or estimated_budget_minor >= total_target