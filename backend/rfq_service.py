"""
B2B RFQ Service Layer
Business logic for RFQ workflows, quote management, and purchase orders
"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid

from rfq_models import (
    RFQStatus, QuoteStatus, PurchaseOrderStatus, UrgencyLevel, MessageType,
    RFQDoc, RFQItemDoc, QuoteDoc, NegotiationMessageDoc, PurchaseOrderDoc,
    RFQ, RFQCreate, RFQItem, Quote, QuoteCreate, NegotiationMessage, 
    PurchaseOrder, PurchaseOrderCreate, RFQListResponse, QuoteListResponse,
    generate_po_number, calculate_rfq_expires_at, calculate_quote_expires_at,
    validate_delivery_date, validate_submission_deadline, validate_rfq_budget
)


class RFQService:
    """Service for managing RFQ workflows and B2B operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    # ============= RFQ MANAGEMENT =============
    
    async def create_rfq(self, rfq_data: RFQCreate, buyer_id: str) -> RFQ:
        """Create new RFQ with items"""
        
        # Validate dates
        if not validate_delivery_date(rfq_data.delivery_date_required):
            raise ValueError("Delivery date must be in the future")
        
        if not validate_submission_deadline(rfq_data.submission_deadline, rfq_data.delivery_date_required):
            raise ValueError("Submission deadline must be before delivery date")
        
        # Validate budget if provided
        if rfq_data.estimated_budget_minor and not validate_rfq_budget(rfq_data.estimated_budget_minor, rfq_data.items):
            raise ValueError("Estimated budget is less than sum of target prices")
        
        # Create RFQ document
        rfq_id = str(uuid.uuid4())
        now = datetime.utcnow()
        expires_at = calculate_rfq_expires_at(rfq_data.submission_deadline)
        
        rfq_doc: RFQDoc = {
            "_id": rfq_id,
            "buyer_id": buyer_id,
            "title": rfq_data.title,
            "description": rfq_data.description,
            "status": RFQStatus.DRAFT,
            "urgency": rfq_data.urgency,
            "total_items": len(rfq_data.items),
            "estimated_budget_minor": rfq_data.estimated_budget_minor,
            "currency": rfq_data.currency,
            "delivery_location": rfq_data.delivery_location,
            "delivery_date_required": rfq_data.delivery_date_required,
            "submission_deadline": rfq_data.submission_deadline,
            "requirements": rfq_data.requirements,
            "payment_terms": rfq_data.payment_terms,
            "terms_conditions": rfq_data.terms_conditions,
            "attachments": rfq_data.attachments,
            "supplier_ids": rfq_data.supplier_ids,
            "tags": rfq_data.tags,
            "is_public": rfq_data.is_public,
            "view_count": 0,
            "quote_count": 0,
            "created_at": now,
            "updated_at": now,
            "expires_at": expires_at
        }
        
        # Insert RFQ
        await self.db.rfqs.insert_one(rfq_doc)
        
        # Create RFQ items
        rfq_items = []
        for item_data in rfq_data.items:
            item_id = str(uuid.uuid4())
            item_doc: RFQItemDoc = {
                "_id": item_id,
                "rfq_id": rfq_id,
                "product_id": item_data.product_id,
                "title": item_data.title,
                "description": item_data.description,
                "specifications": item_data.specifications,
                "quantity": item_data.quantity,
                "unit": item_data.unit,
                "target_price_minor": item_data.target_price_minor,
                "currency": item_data.currency,
                "delivery_location": item_data.delivery_location,
                "delivery_date_required": item_data.delivery_date_required,
                "notes": item_data.notes,
                "attachments": item_data.attachments,
                "created_at": now
            }
            await self.db.rfq_items.insert_one(item_doc)
            
            rfq_items.append(RFQItem(
                id=item_id,
                rfq_id=rfq_id,
                created_at=now,
                **item_data.dict()
            ))
        
        return RFQ(
            id=rfq_id,
            items=rfq_items,
            **{k: v for k, v in rfq_doc.items() if k != "_id"}
        )
    
    async def publish_rfq(self, rfq_id: str, buyer_id: str) -> bool:
        """Publish RFQ to make it visible to suppliers"""
        result = await self.db.rfqs.update_one(
            {"_id": rfq_id, "buyer_id": buyer_id, "status": RFQStatus.DRAFT},
            {
                "$set": {
                    "status": RFQStatus.PUBLISHED,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def get_rfq(self, rfq_id: str, user_id: str) -> Optional[RFQ]:
        """Get RFQ by ID with access control"""
        rfq_doc = await self.db.rfqs.find_one({"_id": rfq_id})
        if not rfq_doc:
            return None
        
        # Check access permissions
        is_buyer = rfq_doc["buyer_id"] == user_id
        is_invited_supplier = user_id in rfq_doc.get("supplier_ids", [])
        is_public = rfq_doc.get("is_public", False)
        
        if not (is_buyer or is_invited_supplier or is_public):
            return None
        
        # Increment view count for non-buyers
        if not is_buyer:
            await self.db.rfqs.update_one(
                {"_id": rfq_id},
                {"$inc": {"view_count": 1}}
            )
        
        # Get RFQ items
        items_cursor = self.db.rfq_items.find({"rfq_id": rfq_id})
        items_docs = await items_cursor.to_list(length=None)
        
        items = [
            RFQItem(
                id=item["_id"],
                rfq_id=item["rfq_id"],
                product_id=item.get("product_id"),
                title=item["title"],
                description=item["description"],
                specifications=item["specifications"],
                quantity=item["quantity"],
                unit=item["unit"],
                target_price_minor=item.get("target_price_minor"),
                currency=item["currency"],
                delivery_location=item.get("delivery_location"),
                delivery_date_required=item.get("delivery_date_required"),
                notes=item.get("notes"),
                attachments=item.get("attachments", []),
                created_at=item["created_at"]
            )
            for item in items_docs
        ]
        
        return RFQ(
            id=rfq_doc["_id"],
            buyer_id=rfq_doc["buyer_id"],
            title=rfq_doc["title"],
            description=rfq_doc["description"],
            status=rfq_doc["status"],
            urgency=rfq_doc["urgency"],
            total_items=rfq_doc["total_items"],
            estimated_budget_minor=rfq_doc.get("estimated_budget_minor"),
            currency=rfq_doc["currency"],
            delivery_location=rfq_doc["delivery_location"],
            delivery_date_required=rfq_doc["delivery_date_required"],
            submission_deadline=rfq_doc["submission_deadline"],
            requirements=rfq_doc.get("requirements", {}),
            payment_terms=rfq_doc.get("payment_terms"),
            terms_conditions=rfq_doc.get("terms_conditions"),
            attachments=rfq_doc.get("attachments", []),
            supplier_ids=rfq_doc.get("supplier_ids", []),
            tags=rfq_doc.get("tags", []),
            is_public=rfq_doc.get("is_public", False),
            view_count=rfq_doc.get("view_count", 0),
            quote_count=rfq_doc.get("quote_count", 0),
            created_at=rfq_doc["created_at"],
            updated_at=rfq_doc["updated_at"],
            expires_at=rfq_doc["expires_at"],
            items=items
        )
    
    async def list_rfqs(
        self,
        user_id: str,
        status: Optional[RFQStatus] = None,
        urgency: Optional[UrgencyLevel] = None,
        tags: Optional[List[str]] = None,
        is_buyer: bool = True,
        page: int = 1,
        limit: int = 20
    ) -> RFQListResponse:
        """List RFQs with filtering and pagination"""
        
        skip = (page - 1) * limit
        
        # Build query
        query = {}
        
        if is_buyer:
            query["buyer_id"] = user_id
        else:
            # For suppliers: public RFQs or invited RFQs
            query["$or"] = [
                {"is_public": True, "status": {"$in": [RFQStatus.PUBLISHED, RFQStatus.QUOTED]}},
                {"supplier_ids": user_id}
            ]
        
        if status:
            query["status"] = status
        
        if urgency:
            query["urgency"] = urgency
        
        if tags:
            query["tags"] = {"$in": tags}
        
        # Get total count
        total = await self.db.rfqs.count_documents(query)
        
        # Get RFQs
        cursor = self.db.rfqs.find(query).sort("created_at", -1).skip(skip).limit(limit)
        rfq_docs = await cursor.to_list(length=limit)
        
        rfqs = []
        for rfq_doc in rfq_docs:
            # Get items count (don't load full items for list view)
            items_count = await self.db.rfq_items.count_documents({"rfq_id": rfq_doc["_id"]})
            
            rfq = RFQ(
                id=rfq_doc["_id"],
                buyer_id=rfq_doc["buyer_id"],
                title=rfq_doc["title"],
                description=rfq_doc["description"],
                status=rfq_doc["status"],
                urgency=rfq_doc["urgency"],
                total_items=items_count,
                estimated_budget_minor=rfq_doc.get("estimated_budget_minor"),
                currency=rfq_doc["currency"],
                delivery_location=rfq_doc["delivery_location"],
                delivery_date_required=rfq_doc["delivery_date_required"],
                submission_deadline=rfq_doc["submission_deadline"],
                requirements=rfq_doc.get("requirements", {}),
                payment_terms=rfq_doc.get("payment_terms"),
                terms_conditions=rfq_doc.get("terms_conditions"),
                attachments=rfq_doc.get("attachments", []),
                supplier_ids=rfq_doc.get("supplier_ids", []),
                tags=rfq_doc.get("tags", []),
                is_public=rfq_doc.get("is_public", False),
                view_count=rfq_doc.get("view_count", 0),
                quote_count=rfq_doc.get("quote_count", 0),
                created_at=rfq_doc["created_at"],
                updated_at=rfq_doc["updated_at"],
                expires_at=rfq_doc["expires_at"],
                items=[]  # Empty for list view
            )
            rfqs.append(rfq)
        
        return RFQListResponse(
            rfqs=rfqs,
            total=total,
            page=page,
            limit=limit,
            has_more=skip + len(rfqs) < total
        )
    
    # ============= QUOTE MANAGEMENT =============
    
    async def create_quote(self, quote_data: QuoteCreate, supplier_id: str) -> Quote:
        """Create quote for RFQ"""
        
        # Verify RFQ exists and is open for quotes
        rfq_doc = await self.db.rfqs.find_one({
            "_id": quote_data.rfq_id,
            "status": {"$in": [RFQStatus.PUBLISHED, RFQStatus.QUOTED]},
            "submission_deadline": {"$gte": datetime.utcnow()}
        })
        
        if not rfq_doc:
            raise ValueError("RFQ not found or closed for quotes")
        
        # Check if supplier already has a quote
        existing_quote = await self.db.quotes.find_one({
            "rfq_id": quote_data.rfq_id,
            "supplier_id": supplier_id
        })
        
        if existing_quote:
            raise ValueError("Quote already exists for this RFQ")
        
        # Calculate total price
        total_price = sum(item.total_price_minor for item in quote_data.line_items)
        
        # Create quote
        quote_id = str(uuid.uuid4())
        now = datetime.utcnow()
        expires_at = calculate_quote_expires_at(now, quote_data.validity_days)
        
        quote_doc: QuoteDoc = {
            "_id": quote_id,
            "rfq_id": quote_data.rfq_id,
            "supplier_id": supplier_id,
            "status": QuoteStatus.SUBMITTED,
            "total_price_minor": total_price,
            "currency": rfq_doc["currency"],
            "line_items": [item.dict() for item in quote_data.line_items],
            "delivery_days": quote_data.delivery_days,
            "delivery_terms": quote_data.delivery_terms,
            "payment_terms": quote_data.payment_terms,
            "validity_days": quote_data.validity_days,
            "notes": quote_data.notes,
            "attachments": quote_data.attachments,
            "revisions": [],
            "score": None,
            "is_shortlisted": False,
            "created_at": now,
            "updated_at": now,
            "expires_at": expires_at
        }
        
        await self.db.quotes.insert_one(quote_doc)
        
        # Update RFQ quote count and status
        await self.db.rfqs.update_one(
            {"_id": quote_data.rfq_id},
            {
                "$inc": {"quote_count": 1},
                "$set": {
                    "status": RFQStatus.QUOTED,
                    "updated_at": now
                }
            }
        )
        
        return Quote(
            id=quote_id,
            **{k: v for k, v in quote_doc.items() if k != "_id"}
        )
    
    async def get_rfq_quotes(self, rfq_id: str, user_id: str) -> QuoteListResponse:
        """Get all quotes for an RFQ (buyer view)"""
        
        # Verify user is the buyer
        rfq_doc = await self.db.rfqs.find_one({"_id": rfq_id, "buyer_id": user_id})
        if not rfq_doc:
            raise ValueError("RFQ not found or access denied")
        
        # Get quotes
        cursor = self.db.quotes.find({"rfq_id": rfq_id}).sort("total_price_minor", 1)
        quote_docs = await cursor.to_list(length=None)
        
        quotes = [
            Quote(
                id=quote["_id"],
                rfq_id=quote["rfq_id"],
                supplier_id=quote["supplier_id"],
                status=quote["status"],
                total_price_minor=quote["total_price_minor"],
                currency=quote["currency"],
                line_items=quote["line_items"],
                delivery_days=quote["delivery_days"],
                delivery_terms=quote["delivery_terms"],
                payment_terms=quote["payment_terms"],
                validity_days=quote["validity_days"],
                notes=quote["notes"],
                attachments=quote.get("attachments", []),
                revisions=quote.get("revisions", []),
                score=quote.get("score"),
                is_shortlisted=quote.get("is_shortlisted", False),
                created_at=quote["created_at"],
                updated_at=quote["updated_at"],
                expires_at=quote["expires_at"]
            )
            for quote in quote_docs
        ]
        
        rfq_info = {
            "title": rfq_doc["title"],
            "currency": rfq_doc["currency"],
            "delivery_location": rfq_doc["delivery_location"]
        }
        
        return QuoteListResponse(
            quotes=quotes,
            total=len(quotes),
            rfq_info=rfq_info
        )
    
    async def shortlist_quote(self, quote_id: str, rfq_id: str, buyer_id: str) -> bool:
        """Shortlist a quote for further consideration"""
        result = await self.db.quotes.update_one(
            {
                "_id": quote_id,
                "rfq_id": rfq_id,
                # Verify buyer ownership via RFQ
            },
            {"$set": {"is_shortlisted": True, "updated_at": datetime.utcnow()}}
        )
        
        # Verify buyer owns the RFQ
        rfq_doc = await self.db.rfqs.find_one({"_id": rfq_id, "buyer_id": buyer_id})
        if not rfq_doc:
            return False
        
        return result.modified_count > 0
    
    # ============= NEGOTIATION MANAGEMENT =============
    
    async def send_message(self, message_data: NegotiationMessageCreate, sender_id: str) -> NegotiationMessage:
        """Send negotiation message"""
        
        message_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        message_doc: NegotiationMessageDoc = {
            "_id": message_id,
            "rfq_id": message_data.rfq_id,
            "quote_id": message_data.quote_id,
            "sender_id": sender_id,
            "recipient_id": message_data.recipient_id,
            "message_type": message_data.message_type,
            "subject": message_data.subject,
            "message": message_data.message,
            "attachments": message_data.attachments,
            "metadata": message_data.metadata,
            "is_read": False,
            "read_at": None,
            "created_at": now
        }
        
        await self.db.negotiation_messages.insert_one(message_doc)
        
        return NegotiationMessage(
            id=message_id,
            **{k: v for k, v in message_doc.items() if k != "_id"}
        )
    
    async def get_negotiation_thread(self, rfq_id: str, user_id: str) -> List[NegotiationMessage]:
        """Get negotiation messages for RFQ"""
        
        # Verify user has access to RFQ
        rfq_doc = await self.db.rfqs.find_one({
            "$or": [
                {"_id": rfq_id, "buyer_id": user_id},
                {"_id": rfq_id, "supplier_ids": user_id},
                {"_id": rfq_id, "is_public": True}
            ]
        })
        
        if not rfq_doc:
            raise ValueError("RFQ not found or access denied")
        
        # Get messages
        cursor = self.db.negotiation_messages.find({
            "rfq_id": rfq_id,
            "$or": [
                {"sender_id": user_id},
                {"recipient_id": user_id}
            ]
        }).sort("created_at", 1)
        
        message_docs = await cursor.to_list(length=None)
        
        messages = [
            NegotiationMessage(
                id=msg["_id"],
                rfq_id=msg["rfq_id"],
                quote_id=msg.get("quote_id"),
                sender_id=msg["sender_id"],
                recipient_id=msg["recipient_id"],
                message_type=msg["message_type"],
                subject=msg.get("subject"),
                message=msg["message"],
                attachments=msg.get("attachments", []),
                metadata=msg.get("metadata", {}),
                is_read=msg["is_read"],
                read_at=msg.get("read_at"),
                created_at=msg["created_at"]
            )
            for msg in message_docs
        ]
        
        # Mark messages as read for recipient
        await self.db.negotiation_messages.update_many(
            {
                "rfq_id": rfq_id,
                "recipient_id": user_id,
                "is_read": False
            },
            {
                "$set": {
                    "is_read": True,
                    "read_at": datetime.utcnow()
                }
            }
        )
        
        return messages
    
    # ============= PURCHASE ORDER MANAGEMENT =============
    
    async def create_purchase_order(self, po_data: PurchaseOrderCreate, buyer_id: str) -> PurchaseOrder:
        """Create purchase order from accepted quote"""
        
        # Get quote and verify
        quote_doc = await self.db.quotes.find_one({"_id": po_data.quote_id})
        if not quote_doc:
            raise ValueError("Quote not found")
        
        # Verify RFQ ownership
        rfq_doc = await self.db.rfqs.find_one({
            "_id": po_data.rfq_id,
            "buyer_id": buyer_id
        })
        if not rfq_doc:
            raise ValueError("RFQ not found or access denied")
        
        # Check if PO already exists
        existing_po = await self.db.purchase_orders.find_one({
            "rfq_id": po_data.rfq_id,
            "quote_id": po_data.quote_id
        })
        if existing_po:
            raise ValueError("Purchase order already exists for this quote")
        
        # Create PO
        po_id = str(uuid.uuid4())
        now = datetime.utcnow()
        po_number = generate_po_number(buyer_id, now)
        
        po_doc: PurchaseOrderDoc = {
            "_id": po_id,
            "rfq_id": po_data.rfq_id,
            "quote_id": po_data.quote_id,
            "buyer_id": buyer_id,
            "supplier_id": quote_doc["supplier_id"],
            "po_number": po_number,
            "status": PurchaseOrderStatus.DRAFT,
            "total_amount_minor": quote_doc["total_price_minor"],
            "currency": quote_doc["currency"],
            "line_items": quote_doc["line_items"],
            "delivery_address": po_data.delivery_address,
            "billing_address": po_data.billing_address,
            "delivery_date_requested": po_data.delivery_date_requested,
            "payment_terms": quote_doc["payment_terms"],
            "notes": po_data.notes,
            "attachments": po_data.attachments,
            "payment_ids": [],
            "shipment_tracking": None,
            "created_at": now,
            "updated_at": now,
            "completed_at": None
        }
        
        await self.db.purchase_orders.insert_one(po_doc)
        
        # Update quote status
        await self.db.quotes.update_one(
            {"_id": po_data.quote_id},
            {
                "$set": {
                    "status": QuoteStatus.ACCEPTED,
                    "updated_at": now
                }
            }
        )
        
        # Update RFQ status
        await self.db.rfqs.update_one(
            {"_id": po_data.rfq_id},
            {
                "$set": {
                    "status": RFQStatus.AWARDED,
                    "updated_at": now
                }
            }
        )
        
        return PurchaseOrder(
            id=po_id,
            **{k: v for k, v in po_doc.items() if k != "_id"}
        )


# ============= UTILITY FUNCTIONS =============

async def create_rfq_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create all required indexes for RFQ collections"""
    
    from rfq_models import RFQ_INDEXES
    
    # Create indexes for each collection
    for collection_name, indexes in RFQ_INDEXES.items():
        collection = getattr(db, collection_name)
        
        for index_spec in indexes:
            try:
                if isinstance(index_spec, tuple) and len(index_spec) == 2:
                    # Simple index
                    await collection.create_index(index_spec)
                else:
                    # Compound index
                    await collection.create_index(index_spec)
                    
            except Exception as e:
                print(f"Index creation warning for {collection_name}: {e}")
    
    print("✅ RFQ indexes created successfully")


async def seed_sample_rfq_data(db: AsyncIOMotorDatabase) -> None:
    """Seed sample RFQ data for testing"""
    
    # Sample RFQ
    rfq_id = "rfq_sample_001"
    buyer_id = "buyer_001"  # This should exist in users collection
    now = datetime.utcnow()
    
    sample_rfq: RFQDoc = {
        "_id": rfq_id,
        "buyer_id": buyer_id,
        "title": "Office Furniture - 50 Desks and Chairs",
        "description": "We need high-quality office furniture for our new Nairobi branch. Looking for ergonomic desks and chairs suitable for 8-hour daily use.",
        "status": RFQStatus.PUBLISHED,
        "urgency": UrgencyLevel.MEDIUM,
        "total_items": 2,
        "estimated_budget_minor": 250000000,  # KES 2.5M
        "currency": "KES",
        "delivery_location": "Nairobi, Kenya - Westlands Business District",
        "delivery_date_required": now + timedelta(days=30),
        "submission_deadline": now + timedelta(days=7),
        "requirements": {
            "quality": "Commercial grade",
            "warranty": "Minimum 2 years",
            "installation": "Including assembly and installation"
        },
        "payment_terms": "30 days net",
        "terms_conditions": "Standard commercial terms apply",
        "attachments": [],
        "supplier_ids": [],
        "tags": ["furniture", "office", "bulk"],
        "is_public": True,
        "view_count": 15,
        "quote_count": 3,
        "created_at": now,
        "updated_at": now,
        "expires_at": now + timedelta(days=8)
    }
    
    # Sample RFQ Items
    rfq_items = [
        {
            "_id": "rfq_item_001",
            "rfq_id": rfq_id,
            "product_id": None,
            "title": "Ergonomic Office Desks",
            "description": "Height-adjustable office desks with cable management",
            "specifications": {
                "size": "120cm x 80cm",
                "material": "Laminated wood with steel frame",
                "features": "Height adjustable, cable management tray"
            },
            "quantity": 50,
            "unit": "pieces",
            "target_price_minor": 3500000,  # KES 35,000 each
            "currency": "KES",
            "delivery_location": None,
            "delivery_date_required": None,
            "notes": "Prefer neutral colors - white or grey",
            "attachments": [],
            "created_at": now
        },
        {
            "_id": "rfq_item_002", 
            "rfq_id": rfq_id,
            "product_id": None,
            "title": "Ergonomic Office Chairs",
            "description": "Comfortable office chairs with lumbar support",
            "specifications": {
                "type": "Executive chair with armrests",
                "material": "Mesh back with cushioned seat",
                "features": "Lumbar support, adjustable height, 360° swivel"
            },
            "quantity": 50,
            "unit": "pieces", 
            "target_price_minor": 1500000,  # KES 15,000 each
            "currency": "KES",
            "delivery_location": None,
            "delivery_date_required": None,
            "notes": "Must support up to 120kg weight",
            "attachments": [],
            "created_at": now
        }
    ]
    
    # Insert sample data
    await db.rfqs.replace_one({"_id": rfq_id}, sample_rfq, upsert=True)
    
    for item in rfq_items:
        await db.rfq_items.replace_one({"_id": item["_id"]}, item, upsert=True)
    
    print(f"✅ Seeded sample RFQ data: {rfq_id}")


# ============= ANALYTICS =============

async def get_rfq_analytics(db: AsyncIOMotorDatabase, user_id: str, is_buyer: bool = True) -> Dict[str, Any]:
    """Get RFQ analytics for dashboard"""
    
    if is_buyer:
        # Buyer analytics
        total_rfqs = await db.rfqs.count_documents({"buyer_id": user_id})
        active_rfqs = await db.rfqs.count_documents({
            "buyer_id": user_id,
            "status": {"$in": [RFQStatus.PUBLISHED, RFQStatus.QUOTED, RFQStatus.NEGOTIATING]}
        })
        
        # Get quote stats
        pipeline = [
            {"$match": {"buyer_id": user_id}},
            {"$group": {
                "_id": None,
                "total_quotes": {"$sum": "$quote_count"},
                "avg_quotes": {"$avg": "$quote_count"}
            }}
        ]
        
        quote_stats = await db.rfqs.aggregate(pipeline).to_list(length=1)
        total_quotes = quote_stats[0]["total_quotes"] if quote_stats else 0
        avg_quotes = quote_stats[0]["avg_quotes"] if quote_stats else 0
        
        # Conversion rate (RFQs that became POs)
        awarded_rfqs = await db.rfqs.count_documents({
            "buyer_id": user_id,
            "status": RFQStatus.AWARDED
        })
        
        conversion_rate = (awarded_rfqs / total_rfqs * 100) if total_rfqs > 0 else 0
        
    else:
        # Supplier analytics
        total_quotes = await db.quotes.count_documents({"supplier_id": user_id})
        accepted_quotes = await db.quotes.count_documents({
            "supplier_id": user_id,
            "status": QuoteStatus.ACCEPTED
        })
        
        conversion_rate = (accepted_quotes / total_quotes * 100) if total_quotes > 0 else 0
        
        total_rfqs = await db.rfqs.count_documents({
            "$or": [
                {"is_public": True, "status": {"$in": [RFQStatus.PUBLISHED, RFQStatus.QUOTED]}},
                {"supplier_ids": user_id}
            ]
        })
        active_rfqs = total_rfqs
        avg_quotes = 0
    
    return {
        "total_rfqs": total_rfqs,
        "active_rfqs": active_rfqs,
        "total_quotes": total_quotes,
        "average_quotes_per_rfq": round(avg_quotes, 1),
        "conversion_rate": round(conversion_rate, 1),
        "top_categories": [],  # TODO: Implement based on tags
        "recent_activity": []   # TODO: Implement recent activity feed
    }