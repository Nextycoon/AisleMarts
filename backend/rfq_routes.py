"""
B2B RFQ API Routes
RESTful endpoints for RFQ workflows, quote management, and purchase orders
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime

from db import db
from security import get_current_user
from rfq_service import RFQService, create_rfq_indexes, seed_sample_rfq_data, get_rfq_analytics
from rfq_models import (
    RFQ, RFQCreate, RFQListResponse, RFQStatus, UrgencyLevel,
    Quote, QuoteCreate, QuoteListResponse, QuoteStatus,
    NegotiationMessage, NegotiationMessageCreate,
    PurchaseOrder, PurchaseOrderCreate, PurchaseOrderStatus,
    RFQAnalytics
)

# Create router with /api/v1 prefix for RFQ endpoints
router = APIRouter(prefix="/api/v1", tags=["B2B RFQ"])

# Initialize RFQ service
rfq_service = None

async def get_rfq_service() -> RFQService:
    """Dependency to get RFQ service instance"""
    global rfq_service
    if not rfq_service:
        rfq_service = RFQService(db())
    return rfq_service


# ============= RFQ HEALTH CHECK =============

@router.get("/rfq/health")
async def rfq_health():
    """Health check for B2B RFQ system"""
    try:
        # Check database connection
        rfqs_count = await db().rfqs.count_documents({})
        quotes_count = await db().quotes.count_documents({})
        pos_count = await db().purchase_orders.count_documents({})
        messages_count = await db().negotiation_messages.count_documents({})
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": {
                "rfqs": rfqs_count,
                "quotes": quotes_count,
                "purchase_orders": pos_count,
                "negotiation_messages": messages_count
            },
            "features": {
                "rfq_creation": True,
                "quote_management": True,
                "negotiation_threads": True,
                "purchase_orders": True,
                "analytics": True
            },
            "supported_statuses": {
                "rfq": [status.value for status in RFQStatus],
                "quote": [status.value for status in QuoteStatus],
                "purchase_order": [status.value for status in PurchaseOrderStatus]
            },
            "supported_urgency": [urgency.value for urgency in UrgencyLevel]
        }
    except Exception as e:
        raise HTTPException(500, f"RFQ system health check failed: {str(e)}")


# ============= RFQ MANAGEMENT =============

@router.post("/rfqs", response_model=RFQ)
async def create_rfq(
    rfq_data: RFQCreate,
    current_user = Depends(get_current_user),
    rfq_service: RFQService = Depends(get_rfq_service)
):
    """
    Create new Request for Quote (RFQ)
    
    **Features:**
    - Multi-item RFQ support with detailed specifications
    - Urgency levels: low, medium, high, urgent
    - Public or private (invited suppliers only)
    - Delivery location and date requirements
    - Budget estimation and payment terms
    - File attachments support
    - Automatic expiration based on submission deadline
    
    **Validation:**
    - Delivery date must be in future
    - Submission deadline must be before delivery date
    - Budget validation against target prices
    """
    try:
        rfq = await rfq_service.create_rfq(rfq_data, current_user["id"])
        return rfq
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to create RFQ: {str(e)}")


@router.post("/rfqs/{rfq_id}/publish")
async def publish_rfq(
    rfq_id: str,
    current_user = Depends(get_current_user),
    rfq_service: RFQService = Depends(get_rfq_service)
):
    """Publish RFQ to make it visible to suppliers"""
    try:
        success = await rfq_service.publish_rfq(rfq_id, current_user["id"])
        if not success:
            raise HTTPException(404, "RFQ not found or already published")
        
        return {
            "status": "success",
            "message": "RFQ published successfully",
            "rfq_id": rfq_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to publish RFQ: {str(e)}")


@router.get("/rfqs/{rfq_id}", response_model=RFQ)
async def get_rfq(
    rfq_id: str,
    current_user = Depends(get_current_user),
    rfq_service: RFQService = Depends(get_rfq_service)
):
    """
    Get RFQ by ID with access control
    
    **Access Control:**
    - RFQ buyers can always access their RFQs
    - Invited suppliers can access private RFQs
    - Anyone can access public RFQs
    - View count incremented for non-buyers
    """
    try:
        rfq = await rfq_service.get_rfq(rfq_id, current_user["id"])
        if not rfq:
            raise HTTPException(404, "RFQ not found or access denied")
        
        return rfq
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to get RFQ: {str(e)}")


@router.get("/rfqs", response_model=RFQListResponse)
async def list_rfqs(
    status: Optional[RFQStatus] = Query(None, description="Filter by RFQ status"),
    urgency: Optional[UrgencyLevel] = Query(None, description="Filter by urgency level"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    is_buyer: bool = Query(True, description="List as buyer (true) or supplier (false)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Results per page"),
    current_user = Depends(get_current_user),
    rfq_service: RFQService = Depends(get_rfq_service)
):
    """
    List RFQs with filtering and pagination
    
    **Buyer View:**
    - Shows all RFQs created by the user
    - Full access to all RFQ details
    
    **Supplier View:**
    - Shows public RFQs and invited RFQs
    - Filtered by status (published, quoted)
    - Excludes expired RFQs
    """
    try:
        tag_list = tags.split(",") if tags else None
        
        rfq_list = await rfq_service.list_rfqs(
            user_id=current_user["id"],
            status=status,
            urgency=urgency,
            tags=tag_list,
            is_buyer=is_buyer,
            page=page,
            limit=limit
        )
        
        return rfq_list
    except Exception as e:
        raise HTTPException(500, f"Failed to list RFQs: {str(e)}")


# ============= QUOTE MANAGEMENT =============

@router.post("/quotes", response_model=Quote)
async def create_quote(
    quote_data: QuoteCreate,
    current_user = Depends(get_current_user),
    rfq_service: RFQService = Depends(get_rfq_service)
):
    """
    Create quote for RFQ (supplier action)
    
    **Features:**
    - Line-item pricing for each RFQ item
    - Delivery terms and payment terms
    - Quote validity period (default 30 days)
    - File attachments for specifications
    - Automatic total calculation
    
    **Validation:**
    - RFQ must be open for quotes
    - Supplier can only submit one quote per RFQ
    - All RFQ items must be quoted
    """
    try:
        quote = await rfq_service.create_quote(quote_data, current_user["id"])
        return quote
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to create quote: {str(e)}")


@router.get("/rfqs/{rfq_id}/quotes", response_model=QuoteListResponse)
async def get_rfq_quotes(
    rfq_id: str,
    current_user = Depends(get_current_user),
    rfq_service: RFQService = Depends(get_rfq_service)
):
    """
    Get all quotes for RFQ (buyer view)
    
    **Features:**
    - Sorted by total price (lowest first)
    - Includes quote status and expiration
    - Supplier information
    - Shortlisting capabilities
    """
    try:
        quotes = await rfq_service.get_rfq_quotes(rfq_id, current_user["id"])
        return quotes
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to get quotes: {str(e)}")


@router.post("/quotes/{quote_id}/shortlist")
async def shortlist_quote(
    quote_id: str,
    rfq_id: str = Query(..., description="RFQ ID for verification"),
    current_user = Depends(get_current_user),
    rfq_service: RFQService = Depends(get_rfq_service)
):
    """Shortlist a quote for further consideration (buyer action)"""
    try:
        success = await rfq_service.shortlist_quote(quote_id, rfq_id, current_user["id"])
        if not success:
            raise HTTPException(404, "Quote not found or access denied")
        
        return {
            "status": "success",
            "message": "Quote shortlisted successfully",
            "quote_id": quote_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to shortlist quote: {str(e)}")


# ============= NEGOTIATION MANAGEMENT =============

@router.post("/negotiations/messages", response_model=NegotiationMessage)
async def send_negotiation_message(
    message_data: NegotiationMessageCreate,
    current_user = Depends(get_current_user),
    rfq_service: RFQService = Depends(get_rfq_service)
):
    """
    Send negotiation message
    
    **Message Types:**
    - message: Regular text message
    - quote_update: Quote revision notification
    - attachment: File sharing
    - system: Automated system messages
    - payment: Payment-related messages
    """
    try:
        message = await rfq_service.send_message(message_data, current_user["id"])
        return message
    except Exception as e:
        raise HTTPException(500, f"Failed to send message: {str(e)}")


@router.get("/rfqs/{rfq_id}/negotiations")
async def get_negotiation_thread(
    rfq_id: str,
    current_user = Depends(get_current_user),
    rfq_service: RFQService = Depends(get_rfq_service)
):
    """
    Get negotiation thread for RFQ
    
    **Features:**
    - Chronological message ordering
    - Automatic read status updates
    - Access control verification
    - Message type filtering
    """
    try:
        messages = await rfq_service.get_negotiation_thread(rfq_id, current_user["id"])
        
        return {
            "rfq_id": rfq_id,
            "messages": messages,
            "total": len(messages),
            "unread_count": sum(1 for msg in messages if not msg.is_read and msg.recipient_id == current_user["id"])
        }
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to get negotiation thread: {str(e)}")


# ============= PURCHASE ORDER MANAGEMENT =============

@router.post("/purchase-orders", response_model=PurchaseOrder)
async def create_purchase_order(
    po_data: PurchaseOrderCreate,
    current_user = Depends(get_current_user),
    rfq_service: RFQService = Depends(get_rfq_service)
):
    """
    Create purchase order from accepted quote (buyer action)
    
    **Features:**
    - Automatic PO number generation
    - Quote details inheritance
    - Delivery and billing addresses
    - Payment terms from quote
    - Status tracking workflow
    
    **Workflow:**
    1. Buyer creates PO from selected quote
    2. Quote status → ACCEPTED
    3. RFQ status → AWARDED
    4. PO status → DRAFT (ready for payment)
    """
    try:
        po = await rfq_service.create_purchase_order(po_data, current_user["id"])
        return po
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to create purchase order: {str(e)}")


@router.get("/purchase-orders")
async def list_purchase_orders(
    status: Optional[PurchaseOrderStatus] = Query(None, description="Filter by PO status"),
    is_buyer: bool = Query(True, description="List as buyer (true) or supplier (false)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=50, description="Results per page"),
    current_user = Depends(get_current_user)
):
    """List purchase orders with filtering"""
    try:
        skip = (page - 1) * limit
        
        # Build query based on role
        query = {}
        if is_buyer:
            query["buyer_id"] = current_user["id"]
        else:
            query["supplier_id"] = current_user["id"]
        
        if status:
            query["status"] = status
        
        # Get total count
        total = await db().purchase_orders.count_documents(query)
        
        # Get POs
        cursor = db().purchase_orders.find(query).sort("created_at", -1).skip(skip).limit(limit)
        po_docs = await cursor.to_list(length=limit)
        
        pos = [
            PurchaseOrder(
                id=po["_id"],
                rfq_id=po["rfq_id"],
                quote_id=po["quote_id"],
                buyer_id=po["buyer_id"],
                supplier_id=po["supplier_id"],
                po_number=po["po_number"],
                status=po["status"],
                total_amount_minor=po["total_amount_minor"],
                currency=po["currency"],
                line_items=po["line_items"],
                delivery_address=po["delivery_address"],
                billing_address=po["billing_address"],
                delivery_date_requested=po["delivery_date_requested"],
                payment_terms=po["payment_terms"],
                notes=po["notes"],
                attachments=po.get("attachments", []),
                payment_ids=po.get("payment_ids", []),
                shipment_tracking=po.get("shipment_tracking"),
                created_at=po["created_at"],
                updated_at=po["updated_at"],
                completed_at=po.get("completed_at")
            )
            for po in po_docs
        ]
        
        return {
            "purchase_orders": pos,
            "total": total,
            "page": page,
            "limit": limit,
            "has_more": skip + len(pos) < total
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to list purchase orders: {str(e)}")


@router.get("/purchase-orders/{po_id}", response_model=PurchaseOrder)
async def get_purchase_order(
    po_id: str,
    current_user = Depends(get_current_user)
):
    """Get purchase order by ID"""
    try:
        po_doc = await db().purchase_orders.find_one({
            "_id": po_id,
            "$or": [
                {"buyer_id": current_user["id"]},
                {"supplier_id": current_user["id"]}
            ]
        })
        
        if not po_doc:
            raise HTTPException(404, "Purchase order not found or access denied")
        
        return PurchaseOrder(
            id=po_doc["_id"],
            rfq_id=po_doc["rfq_id"],
            quote_id=po_doc["quote_id"],
            buyer_id=po_doc["buyer_id"],
            supplier_id=po_doc["supplier_id"],
            po_number=po_doc["po_number"],
            status=po_doc["status"],
            total_amount_minor=po_doc["total_amount_minor"],
            currency=po_doc["currency"],
            line_items=po_doc["line_items"],
            delivery_address=po_doc["delivery_address"],
            billing_address=po_doc["billing_address"],
            delivery_date_requested=po_doc["delivery_date_requested"],
            payment_terms=po_doc["payment_terms"],
            notes=po_doc["notes"],
            attachments=po_doc.get("attachments", []),
            payment_ids=po_doc.get("payment_ids", []),
            shipment_tracking=po_doc.get("shipment_tracking"),
            created_at=po_doc["created_at"],
            updated_at=po_doc["updated_at"],
            completed_at=po_doc.get("completed_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to get purchase order: {str(e)}")


# ============= ANALYTICS & ADMIN =============

@router.get("/rfq/analytics", response_model=RFQAnalytics)
async def get_rfq_analytics_endpoint(
    is_buyer: bool = Query(True, description="Get buyer (true) or supplier (false) analytics"),
    current_user = Depends(get_current_user)
):
    """
    Get RFQ analytics and performance metrics
    
    **Buyer Analytics:**
    - Total RFQs created
    - Active RFQs
    - Total quotes received
    - Average quotes per RFQ
    - RFQ to PO conversion rate
    
    **Supplier Analytics:**
    - Total quotes submitted
    - Quote acceptance rate
    - Available RFQs to quote
    - Performance metrics
    """
    try:
        analytics = await get_rfq_analytics(db(), current_user["id"], is_buyer)
        
        return RFQAnalytics(
            total_rfqs=analytics["total_rfqs"],
            active_rfqs=analytics["active_rfqs"],
            total_quotes=analytics["total_quotes"],
            average_quotes_per_rfq=analytics["average_quotes_per_rfq"],
            conversion_rate=analytics["conversion_rate"],
            top_categories=analytics["top_categories"],
            recent_activity=analytics["recent_activity"]
        )
        
    except Exception as e:
        raise HTTPException(500, f"Failed to get analytics: {str(e)}")


@router.post("/rfq/initialize")
async def initialize_rfq_system():
    """
    Initialize RFQ system (indexes, sample data)
    For development and testing purposes
    """
    try:
        database = db()
        
        # Create indexes
        print("🔄 Creating RFQ indexes...")
        await create_rfq_indexes(database)
        
        # Seed sample data
        print("🔄 Seeding sample RFQ data...")
        await seed_sample_rfq_data(database)
        
        return {
            "status": "success",
            "message": "RFQ system initialized successfully",
            "timestamp": datetime.utcnow().isoformat(),
            "actions": [
                "Created MongoDB indexes for RFQs, quotes, messages, purchase orders",
                "Seeded sample RFQ data for testing",
                "System ready for B2B operations"
            ]
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to initialize RFQ system: {str(e)}")


# ============= STARTUP/SHUTDOWN HANDLERS =============

@router.on_event("startup")
async def startup_rfq_system():
    """Initialize RFQ system on startup"""
    try:
        global rfq_service  
        rfq_service = RFQService(db())
        
        print("✅ B2B RFQ system startup complete")
        
    except Exception as e:
        print(f"⚠️ RFQ system startup error: {e}")


@router.on_event("shutdown")
async def shutdown_rfq_system():
    """Cleanup RFQ system on shutdown"""
    try:
        print("✅ B2B RFQ system shutdown complete")
        
    except Exception as e:
        print(f"⚠️ RFQ system shutdown error: {e}")


# Include this router in main server.py:
# from rfq_routes import router as rfq_router  
# app.include_router(rfq_router)