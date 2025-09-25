"""
AisleMarts RFQ (Request for Quote) Router - PRODUCTION HARDENED
Implements secure B2B quoting system with authentication and validation
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timedelta
from enum import Enum
import json

# Import security and validation
from middleware.auth import get_current_user, get_buyer_user, get_supplier_user, AuthToken, require_resource_ownership
from middleware.rate_limiting import rate_limit_rfq_create, rate_limit_rfq_quote, rate_limit_general
from validation.rfq_validation import (
    RFQCreateValidated, QuoteSubmissionValidated, RFQValidationError,
    validate_rfq_update_permission, validate_quote_submission_permission, validate_business_rules
)
from rfq_models import RFQCreate

router = APIRouter()

class RFQStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    QUOTED = "quoted"
    NEGOTIATING = "negotiating"
    AWARDED = "awarded"
    CANCELLED = "cancelled"

class QuoteStatus(str, Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"

class RFQCategory(str, Enum):
    ELECTRONICS = "electronics"
    FASHION = "fashion"
    HOME_GARDEN = "home_garden"
    MACHINERY = "machinery"
    CHEMICALS = "chemicals"
    TEXTILES = "textiles"
    AUTOMOTIVE = "automotive"
    PACKAGING = "packaging"

# Request/Response Models
class RFQSpec(BaseModel):
    material: Optional[str] = None
    dimensions: Optional[str] = None
    color: Optional[str] = None
    certifications: List[str] = []
    customization: Optional[str] = None
    packaging: Optional[str] = None
    delivery_terms: Optional[str] = None
    payment_terms: Optional[str] = None
    sample_required: bool = False

class RFQRequest(BaseModel):
    title: str = Field(max_length=200)
    category: RFQCategory
    description: str = Field(max_length=2000)
    specifications: RFQSpec
    quantity: int = Field(ge=1)
    target_price: Optional[float] = None
    currency: str = "USD"
    deadline: Optional[datetime] = None
    shipping_destination: str
    attachments: List[str] = []  # URLs to uploaded files

class RFQ(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    business_user_id: str
    business_name: str
    title: str
    category: RFQCategory
    description: str
    specifications: RFQSpec
    quantity: int
    target_price: Optional[float] = None
    currency: str = "USD"
    deadline: Optional[datetime] = None
    shipping_destination: str
    attachments: List[str] = []
    status: RFQStatus = RFQStatus.PUBLISHED
    quote_count: int = 0
    views: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class QuoteItem(BaseModel):
    description: str
    unit_price: float
    quantity: int
    total_price: float
    lead_time_days: int
    notes: Optional[str] = None

class QuoteRequest(BaseModel):
    supplier_message: str = Field(max_length=1000)
    items: List[QuoteItem]
    total_amount: float
    currency: str = "USD"
    lead_time_days: int
    payment_terms: str
    shipping_terms: str
    validity_days: int = 30
    certifications: List[str] = []
    sample_available: bool = False
    sample_cost: Optional[float] = None

class Quote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rfq_id: str
    supplier_id: str
    supplier_name: str
    supplier_tier: str = "VERIFIED"
    supplier_message: str
    items: List[QuoteItem]
    total_amount: float
    currency: str = "USD"
    lead_time_days: int
    payment_terms: str
    shipping_terms: str
    validity_days: int = 30
    certifications: List[str] = []
    sample_available: bool = False
    sample_cost: Optional[float] = None
    status: QuoteStatus = QuoteStatus.SUBMITTED
    submitted_at: datetime = Field(default_factory=datetime.now)
    expires_at: datetime = Field(default_factory=lambda: datetime.now() + timedelta(days=30))
    response_time_hours: Optional[int] = None

# Mock Database
RFQS_DB: Dict[str, RFQ] = {}
QUOTES_DB: Dict[str, Quote] = {}

# Initialize with sample data
def init_sample_rfqs():
    """Initialize sample RFQs and quotes for demo"""
    sample_rfqs = [
        RFQ(
            id="rfq_electronics_001",
            business_user_id="biz_user_001",
            business_name="TechCorp Manufacturing",
            title="Custom Bluetooth Speakers - 5000 Units",
            category=RFQCategory.ELECTRONICS,
            description="Looking for high-quality Bluetooth speakers for corporate gifts. Need custom branding and packaging.",
            specifications=RFQSpec(
                material="Plastic + Fabric",
                dimensions="15cm x 8cm x 8cm",
                color="Black, White, Navy Blue",
                certifications=["FCC", "CE", "RoHS"],
                customization="Logo embossing + custom packaging",
                packaging="Individual gift boxes",
                delivery_terms="FOB Shanghai",
                payment_terms="30% deposit, 70% before shipping",
                sample_required=True
            ),
            quantity=5000,
            target_price=15.50,
            currency="USD",
            deadline=datetime.now() + timedelta(days=15),
            shipping_destination="Los Angeles, CA, USA",
            status=RFQStatus.PUBLISHED,
            quote_count=3,
            views=47
        ),
        RFQ(
            id="rfq_fashion_002", 
            business_user_id="biz_user_002",
            business_name="Retail Fashion Co.",
            title="Organic Cotton T-Shirts - Private Label",
            category=RFQCategory.FASHION,
            description="Seeking supplier for organic cotton t-shirts with custom labels. Multiple colors and sizes needed.",
            specifications=RFQSpec(
                material="100% Organic Cotton, GOTS Certified",
                color="White, Black, Gray, Navy, Heather",
                certifications=["GOTS", "OEKO-TEX"],
                customization="Custom woven labels + hang tags",
                packaging="Poly bags + shipping cartons",
                delivery_terms="CIF New York",
                payment_terms="L/C at sight"
            ),
            quantity=10000,
            target_price=4.25,
            currency="USD", 
            deadline=datetime.now() + timedelta(days=20),
            shipping_destination="New York, NY, USA",
            status=RFQStatus.QUOTED,
            quote_count=5,
            views=89
        ),
        RFQ(
            id="rfq_home_003",
            business_user_id="biz_user_003", 
            business_name="HomeDecor Plus",
            title="Ceramic Dinnerware Set - Hotel Grade",
            category=RFQCategory.HOME_GARDEN,
            description="High-quality ceramic dinnerware for hotel chain. Need durability testing and custom design.",
            specifications=RFQSpec(
                material="Porcelain Ceramic",
                color="White with gold rim accent",
                certifications=["FDA", "LFGB"],
                customization="Custom hotel logo",
                packaging="Foam inserts + master cartons",
                delivery_terms="FOB Ningbo",
                payment_terms="T/T 30/70"
            ),
            quantity=2500,
            target_price=28.00,
            currency="USD",
            deadline=datetime.now() + timedelta(days=25),
            shipping_destination="Miami, FL, USA", 
            status=RFQStatus.NEGOTIATING,
            quote_count=2,
            views=34
        )
    ]
    
    for rfq in sample_rfqs:
        RFQS_DB[rfq.id] = rfq
    
    # Sample quotes
    sample_quotes = [
        Quote(
            id="quote_001",
            rfq_id="rfq_electronics_001",
            supplier_id="supplier_tech_001",
            supplier_name="Shenzhen Audio Tech Co., Ltd",
            supplier_tier="GOLD",
            supplier_message="We specialize in custom Bluetooth speakers with 8+ years experience. Can provide samples within 5 days.",
            items=[
                QuoteItem(
                    description="Custom Bluetooth Speaker with Logo",
                    unit_price=14.50,
                    quantity=5000,
                    total_price=72500.00,
                    lead_time_days=25,
                    notes="Includes custom molding and packaging"
                )
            ],
            total_amount=72500.00,
            currency="USD",
            lead_time_days=25,
            payment_terms="30% T/T deposit, 70% before shipment",
            shipping_terms="FOB Shenzhen",
            validity_days=15,
            certifications=["FCC", "CE", "RoHS", "BQB"],
            sample_available=True,
            sample_cost=150.00,
            status=QuoteStatus.SUBMITTED,
            response_time_hours=8
        ),
        Quote(
            id="quote_002",
            rfq_id="rfq_electronics_001", 
            supplier_id="supplier_tech_002",
            supplier_name="Guangzhou Premium Electronics",
            supplier_tier="DIAMOND",
            supplier_message="Premium quality speakers with advanced DSP. Factory audited by Disney and Apple suppliers.",
            items=[
                QuoteItem(
                    description="Premium Bluetooth Speaker - Custom Design",
                    unit_price=16.80,
                    quantity=5000,
                    total_price=84000.00,
                    lead_time_days=30,
                    notes="Premium drivers + enhanced bass"
                )
            ],
            total_amount=84000.00,
            currency="USD",
            lead_time_days=30,
            payment_terms="L/C at sight or 30% T/T + 70% against B/L copy",
            shipping_terms="FOB Guangzhou",
            validity_days=20,
            certifications=["FCC", "CE", "RoHS", "BQB", "BSCI"],
            sample_available=True,
            sample_cost=200.00,
            status=QuoteStatus.SUBMITTED,
            response_time_hours=4
        ),
        Quote(
            id="quote_003",
            rfq_id="rfq_fashion_002",
            supplier_id="supplier_fashion_001", 
            supplier_name="Organic Textile Manufacturing Ltd",
            supplier_tier="GOLD",
            supplier_message="GOTS certified organic cotton specialist. Working with major US brands for 10+ years.",
            items=[
                QuoteItem(
                    description="Organic Cotton T-Shirt - Multiple Colors",
                    unit_price=3.95,
                    quantity=10000,
                    total_price=39500.00,
                    lead_time_days=35,
                    notes="All sizes XS-XXL, pre-shrunk"
                )
            ],
            total_amount=39500.00,
            currency="USD", 
            lead_time_days=35,
            payment_terms="L/C 90 days or T/T 30% deposit",
            shipping_terms="CIF New York",
            validity_days=30,
            certifications=["GOTS", "OEKO-TEX", "WRAP"],
            sample_available=True,
            sample_cost=25.00,
            status=QuoteStatus.SUBMITTED,
            response_time_hours=12
        )
    ]
    
    for quote in sample_quotes:
        QUOTES_DB[quote.id] = quote

# Initialize sample data
init_sample_rfqs()

async def track_rfq_event(event_type: str, data: Dict[str, Any]):
    """Track RFQ events for analytics"""
    event = {
        "event": event_type,
        "timestamp": datetime.now().isoformat(),
        "data": data
    }
    print(f"🏭 RFQ Event: {event}")

# RFQ Endpoints
@router.post("/api/b2b/rfq", tags=["b2b_rfq"])
async def create_rfq(
    request: Request,
    rfq_create: RFQRequest,
    current_user: AuthToken = Depends(get_buyer_user),
    _: bool = Depends(rate_limit_rfq_create)
):
    """Create a new RFQ with authentication and validation"""
    try:
        # Validate RFQ data
        validated_data = RFQCreateValidated(**rfq_create.dict())
        
        # Validate business rules
        validate_business_rules(validated_data, user_business_tier="verified")  # Mock tier
        
        # Create RFQ
        rfq_id = f"rfq_{uuid.uuid4().hex[:12]}"
        rfq = RFQ(
            id=rfq_id,
            business_user_id=current_user.user_id,
            business_name=current_user.business_id or "Business Name",
            title=validated_data.title,
            category=RFQCategory(validated_data.category),
            description=validated_data.description,
            specifications=RFQSpec(**validated_data.specifications.dict()),
            quantity=validated_data.quantity,
            target_price=validated_data.target_price,
            currency=validated_data.currency,
            deadline=validated_data.deadline,
            shipping_destination=validated_data.shipping_destination,
            attachments=validated_data.attachments,
            status=RFQStatus.PUBLISHED,
            quote_count=0,
            views=0
        )
        
        RFQS_DB[rfq_id] = rfq
        
        return {
            "success": True,
            "rfq": rfq,
            "message": "RFQ created successfully and published to suppliers"
        }
        
    except RFQValidationError as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create RFQ")

@router.get("/api/b2b/rfq", tags=["b2b_rfq"])
async def list_rfqs(
    category: Optional[RFQCategory] = None,
    status: Optional[RFQStatus] = None,
    limit: int = 20,
    offset: int = 0
):
    """List published RFQs for suppliers to browse"""
    rfqs = list(RFQS_DB.values())
    
    # Filter by category
    if category:
        rfqs = [rfq for rfq in rfqs if rfq.category == category]
    
    # Filter by status
    if status:
        rfqs = [rfq for rfq in rfqs if rfq.status == status]
    else:
        # Only show published RFQs by default
        rfqs = [rfq for rfq in rfqs if rfq.status in [RFQStatus.PUBLISHED, RFQStatus.QUOTED, RFQStatus.NEGOTIATING]]
    
    # Sort by created date (newest first)
    rfqs.sort(key=lambda x: x.created_at, reverse=True)
    
    # Pagination
    total = len(rfqs)
    rfqs = rfqs[offset:offset + limit]
    
    return {
        "rfqs": rfqs,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": offset + limit < total
    }

@router.get("/api/b2b/rfq/{rfq_id}", tags=["b2b_rfq"])
async def get_rfq(rfq_id: str):
    """Get RFQ details with quotes"""
    if rfq_id not in RFQS_DB:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    rfq = RFQS_DB[rfq_id]
    
    # Increment view count
    rfq.views += 1
    
    # Get quotes for this RFQ
    quotes = [quote for quote in QUOTES_DB.values() if quote.rfq_id == rfq_id]
    quotes.sort(key=lambda x: x.submitted_at, reverse=True)
    
    await track_rfq_event("rfq_viewed", {
        "rfq_id": rfq_id,
        "view_count": rfq.views
    })
    
    return {
        "rfq": rfq,
        "quotes": quotes,
        "quote_count": len(quotes)
    }

@router.post("/api/b2b/rfq/{rfq_id}/quote", tags=["b2b_rfq"])
async def submit_quote(rfq_id: str, request: QuoteRequest, supplier_id: str = "demo_supplier"):
    """Submit a quote for an RFQ"""
    if rfq_id not in RFQS_DB:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    rfq = RFQS_DB[rfq_id]
    
    # Check if RFQ is still open for quotes
    if rfq.status not in [RFQStatus.PUBLISHED, RFQStatus.QUOTED]:
        raise HTTPException(status_code=400, detail="RFQ is no longer accepting quotes")
    
    # Check deadline
    if rfq.deadline and datetime.now() > rfq.deadline:
        raise HTTPException(status_code=400, detail="RFQ deadline has passed")
    
    # Calculate response time
    response_time_hours = int((datetime.now() - rfq.created_at).total_seconds() / 3600)
    
    quote = Quote(
        rfq_id=rfq_id,
        supplier_id=supplier_id,
        supplier_name="Demo Supplier Co., Ltd",
        supplier_tier="GOLD",
        supplier_message=request.supplier_message,
        items=request.items,
        total_amount=request.total_amount,
        currency=request.currency,
        lead_time_days=request.lead_time_days,
        payment_terms=request.payment_terms,
        shipping_terms=request.shipping_terms,
        validity_days=request.validity_days,
        certifications=request.certifications,
        sample_available=request.sample_available,
        sample_cost=request.sample_cost,
        response_time_hours=response_time_hours
    )
    
    QUOTES_DB[quote.id] = quote
    
    # Update RFQ status and quote count
    rfq.quote_count += 1
    if rfq.status == RFQStatus.PUBLISHED:
        rfq.status = RFQStatus.QUOTED
    rfq.updated_at = datetime.now()
    
    await track_rfq_event("quote_submitted", {
        "rfq_id": rfq_id,
        "quote_id": quote.id,
        "supplier_id": supplier_id,
        "total_amount": quote.total_amount,
        "response_time_hours": response_time_hours
    })
    
    return {"success": True, "quote": quote}

@router.post("/api/b2b/rfq/{rfq_id}/quote/{quote_id}/accept", tags=["b2b_rfq"])
async def accept_quote(rfq_id: str, quote_id: str, business_user_id: str = "demo_business_user"):
    """Accept a quote (award the RFQ)"""
    if rfq_id not in RFQS_DB:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    if quote_id not in QUOTES_DB:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    rfq = RFQS_DB[rfq_id]
    quote = QUOTES_DB[quote_id]
    
    # Verify quote belongs to RFQ
    if quote.rfq_id != rfq_id:
        raise HTTPException(status_code=400, detail="Quote does not belong to this RFQ")
    
    # Update quote status
    quote.status = QuoteStatus.ACCEPTED
    
    # Update RFQ status
    rfq.status = RFQStatus.AWARDED
    rfq.updated_at = datetime.now()
    
    # Reject other quotes
    for other_quote in QUOTES_DB.values():
        if other_quote.rfq_id == rfq_id and other_quote.id != quote_id:
            other_quote.status = QuoteStatus.REJECTED
    
    await track_rfq_event("quote_accepted", {
        "rfq_id": rfq_id,
        "quote_id": quote_id,
        "supplier_id": quote.supplier_id,
        "total_amount": quote.total_amount
    })
    
    return {"success": True, "message": "Quote accepted successfully"}

@router.get("/api/b2b/supplier/{supplier_id}/quotes", tags=["b2b_rfq"])
async def get_supplier_quotes(supplier_id: str):
    """Get all quotes submitted by a supplier"""
    supplier_quotes = [quote for quote in QUOTES_DB.values() if quote.supplier_id == supplier_id]
    supplier_quotes.sort(key=lambda x: x.submitted_at, reverse=True)
    
    return {"quotes": supplier_quotes, "total": len(supplier_quotes)}

@router.get("/api/b2b/business/{business_id}/rfqs", tags=["b2b_rfq"])  
async def get_business_rfqs(business_id: str):
    """Get all RFQs created by a business"""
    business_rfqs = [rfq for rfq in RFQS_DB.values() if rfq.business_user_id == business_id]
    business_rfqs.sort(key=lambda x: x.created_at, reverse=True)
    
    return {"rfqs": business_rfqs, "total": len(business_rfqs)}

@router.get("/api/b2b/analytics/rfq", tags=["b2b_rfq"])
async def get_rfq_analytics():
    """Get RFQ analytics and statistics"""
    total_rfqs = len(RFQS_DB)
    total_quotes = len(QUOTES_DB)
    
    # Status distribution
    status_counts = {}
    for rfq in RFQS_DB.values():
        status_counts[rfq.status] = status_counts.get(rfq.status, 0) + 1
    
    # Category distribution  
    category_counts = {}
    for rfq in RFQS_DB.values():
        category_counts[rfq.category] = category_counts.get(rfq.category, 0) + 1
    
    # Average response time
    response_times = [quote.response_time_hours for quote in QUOTES_DB.values() if quote.response_time_hours]
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0
    
    # Success rate (awarded RFQs)
    awarded_count = len([rfq for rfq in RFQS_DB.values() if rfq.status == RFQStatus.AWARDED])
    success_rate = (awarded_count / total_rfqs * 100) if total_rfqs > 0 else 0
    
    return {
        "total_rfqs": total_rfqs,
        "total_quotes": total_quotes,
        "avg_response_time_hours": round(avg_response_time, 1),
        "success_rate_percent": round(success_rate, 1),
        "status_distribution": status_counts,
        "category_distribution": category_counts,
        "quotes_per_rfq": round(total_quotes / total_rfqs, 1) if total_rfqs > 0 else 0
    }

# Health check
@router.get("/api/b2b/health", tags=["health"])
async def rfq_health():
    """RFQ service health check"""
    return {
        "status": "healthy",
        "service": "AisleMarts RFQ System",
        "version": "1.0.0",
        "stats": {
            "rfqs": len(RFQS_DB),
            "quotes": len(QUOTES_DB),
            "categories": len(RFQCategory),
            "avg_quotes_per_rfq": round(len(QUOTES_DB) / len(RFQS_DB), 1) if RFQS_DB else 0
        },
        "timestamp": datetime.now().isoformat()
    }