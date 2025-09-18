from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from bson import ObjectId
from routers.deps import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
import bcrypt
from enum import Enum

router = APIRouter(prefix="/api/vendors", tags=["vendor-management"])

class VendorStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REJECTED = "rejected"

class VendorTier(str, Enum):
    BASIC = "basic"  
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

# Pydantic Models
class VendorCreate(BaseModel):
    business_name: str
    email: EmailStr
    phone: str
    contact_name: str
    business_type: str  # "retail", "wholesale", "manufacturer", "service"
    description: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    tax_id: Optional[str] = None
    
class VendorUpdate(BaseModel):
    business_name: Optional[str] = None
    phone: Optional[str] = None
    contact_name: Optional[str] = None
    business_type: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    tax_id: Optional[str] = None
    status: Optional[VendorStatus] = None
    tier: Optional[VendorTier] = None
    commission_rate: Optional[float] = None

class VendorResponse(BaseModel):
    id: str = Field(alias="_id")
    business_name: str
    email: str
    phone: str
    contact_name: str
    business_type: str
    description: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    tax_id: Optional[str] = None
    status: VendorStatus
    tier: VendorTier
    commission_rate: float
    total_products: int = 0
    total_sales: float = 0.0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True

class VendorMetrics(BaseModel):
    total_vendors: int
    active_vendors: int
    pending_vendors: int
    suspended_vendors: int
    total_products: int
    total_sales: float
    average_commission: float

# Helper Functions
def _oid(obj_id) -> str:
    return str(obj_id) if isinstance(obj_id, ObjectId) else obj_id

async def get_vendor_metrics(db: AsyncIOMotorDatabase) -> dict:
    """Calculate vendor metrics"""
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_vendors": {"$sum": 1},
                "active_vendors": {
                    "$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}
                },
                "pending_vendors": {
                    "$sum": {"$cond": [{"$eq": ["$status", "pending"]}, 1, 0]}
                },
                "suspended_vendors": {
                    "$sum": {"$cond": [{"$eq": ["$status", "suspended"]}, 1, 0]}
                },
                "total_sales": {"$sum": "$total_sales"},
                "average_commission": {"$avg": "$commission_rate"}
            }
        }
    ]
    
    result = await db.vendors.aggregate(pipeline).to_list(1)
    if result:
        metrics = result[0]
        metrics.pop("_id", None)
    else:
        metrics = {
            "total_vendors": 0,
            "active_vendors": 0,
            "pending_vendors": 0,
            "suspended_vendors": 0,
            "total_sales": 0.0,
            "average_commission": 0.0
        }
    
    # Get total products count
    total_products = await db.products.count_documents({"vendor_id": {"$exists": True}})
    metrics["total_products"] = total_products
    
    return metrics

# API Endpoints
@router.get("/health")
async def vendor_health():
    """Health check for vendor management system"""
    return {
        "status": "healthy",
        "service": "vendor_management",
        "features": [
            "vendor_registration",
            "vendor_approval",
            "product_management",
            "commission_tracking",
            "analytics"
        ],
        "default_commission": 5.0,
        "timestamp": datetime.utcnow()
    }

@router.get("/metrics", response_model=VendorMetrics)
async def get_metrics(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get vendor system metrics"""
    metrics = await get_vendor_metrics(db)
    return VendorMetrics(**metrics)

@router.post("", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor(vendor: VendorCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create a new vendor registration"""
    # Check if email already exists
    existing = await db.vendors.find_one({"email": vendor.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vendor with this email already exists"
        )
    
    # Create vendor document
    vendor_doc = {
        **vendor.dict(),
        "status": VendorStatus.PENDING,
        "tier": VendorTier.BASIC,
        "commission_rate": 5.0,  # Default 5% commission
        "total_products": 0,
        "total_sales": 0.0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.vendors.insert_one(vendor_doc)
    vendor_doc["_id"] = str(result.inserted_id)
    
    return VendorResponse(**vendor_doc)

@router.get("", response_model=List[VendorResponse])
async def list_vendors(
    status_filter: Optional[VendorStatus] = None,
    tier_filter: Optional[VendorTier] = None,
    city: Optional[str] = None,
    country: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """List vendors with optional filters"""
    query = {}
    
    if status_filter:
        query["status"] = status_filter.value
    if tier_filter:
        query["tier"] = tier_filter.value
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    
    cursor = db.vendors.find(query).skip(skip).limit(limit).sort("created_at", -1)
    vendors = []
    
    async for doc in cursor:
        doc["_id"] = _oid(doc["_id"])
        vendors.append(VendorResponse(**doc))
    
    return vendors

@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(vendor_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get vendor by ID"""
    try:
        doc = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
    except:
        raise HTTPException(status_code=404, detail="Invalid vendor ID format")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    doc["_id"] = _oid(doc["_id"])
    return VendorResponse(**doc)

@router.patch("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    vendor_id: str, 
    vendor_update: VendorUpdate, 
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update vendor information"""
    try:
        # Verify vendor exists
        existing = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        # Build update document
        update_data = {k: v for k, v in vendor_update.dict().items() if v is not None}
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            result = await db.vendors.update_one(
                {"_id": ObjectId(vendor_id)},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                raise HTTPException(status_code=404, detail="Vendor not found")
        
        # Return updated vendor
        updated_doc = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
        updated_doc["_id"] = _oid(updated_doc["_id"])
        return VendorResponse(**updated_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Update failed: {str(e)}")

@router.delete("/{vendor_id}")
async def delete_vendor(vendor_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Delete vendor (soft delete by setting status to rejected)"""
    try:
        result = await db.vendors.update_one(
            {"_id": ObjectId(vendor_id)},
            {
                "$set": {
                    "status": VendorStatus.REJECTED,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        return {"message": "Vendor deleted successfully"}
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid vendor ID format")

@router.post("/{vendor_id}/approve")
async def approve_vendor(vendor_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Approve a pending vendor"""
    try:
        result = await db.vendors.update_one(
            {"_id": ObjectId(vendor_id), "status": VendorStatus.PENDING},
            {
                "$set": {
                    "status": VendorStatus.ACTIVE,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=404, 
                detail="Vendor not found or not in pending status"
            )
        
        # Get updated vendor
        updated_doc = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
        updated_doc["_id"] = _oid(updated_doc["_id"])
        
        return {
            "message": "Vendor approved successfully",
            "vendor": VendorResponse(**updated_doc)
        }
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid vendor ID format")

@router.post("/{vendor_id}/suspend")
async def suspend_vendor(vendor_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Suspend an active vendor"""
    try:
        result = await db.vendors.update_one(
            {"_id": ObjectId(vendor_id), "status": VendorStatus.ACTIVE},
            {
                "$set": {
                    "status": VendorStatus.SUSPENDED,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=404, 
                detail="Vendor not found or not in active status"
            )
        
        return {"message": "Vendor suspended successfully"}
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid vendor ID format")

@router.get("/{vendor_id}/products")
async def get_vendor_products(
    vendor_id: str,
    limit: int = 20,
    skip: int = 0,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get products for a specific vendor"""
    try:
        # Verify vendor exists
        vendor = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        # Get vendor products
        cursor = db.products.find({"vendor_id": vendor_id}).skip(skip).limit(limit)
        products = []
        
        async for doc in cursor:
            doc["_id"] = _oid(doc["_id"])
            products.append(doc)
        
        # Get total count
        total_count = await db.products.count_documents({"vendor_id": vendor_id})
        
        return {
            "vendor_id": vendor_id,
            "vendor_name": vendor["business_name"],
            "products": products,
            "total_count": total_count,
            "page_size": limit,
            "page": skip // limit + 1
        }
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid vendor ID format")

@router.get("/{vendor_id}/analytics")
async def get_vendor_analytics(
    vendor_id: str,
    days: int = 30,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get analytics for a specific vendor"""
    try:
        # Verify vendor exists
        vendor = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        # Calculate date range
        from datetime import timedelta
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Aggregate analytics
        pipeline = [
            {
                "$match": {
                    "vendor_id": vendor_id,
                    "created_at": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_products": {"$sum": 1},
                    "total_views": {"$sum": {"$ifNull": ["$views", 0]}},
                    "total_sales": {"$sum": {"$ifNull": ["$sales_count", 0]}},
                    "average_price": {"$avg": "$price"},
                    "total_revenue": {"$sum": {"$multiply": ["$price", {"$ifNull": ["$sales_count", 0]}]}}
                }
            }
        ]
        
        result = await db.products.aggregate(pipeline).to_list(1)
        
        if result:
            analytics = result[0]
            analytics.pop("_id", None)
        else:
            analytics = {
                "total_products": 0,
                "total_views": 0,
                "total_sales": 0,
                "average_price": 0.0,
                "total_revenue": 0.0
            }
        
        # Calculate commission earned
        commission_earned = analytics["total_revenue"] * (vendor["commission_rate"] / 100)
        
        return {
            "vendor_id": vendor_id,
            "vendor_name": vendor["business_name"],
            "period_days": days,
            "analytics": {
                **analytics,
                "commission_rate": vendor["commission_rate"],
                "commission_earned": commission_earned,
                "conversion_rate": (
                    analytics["total_sales"] / analytics["total_views"] * 100
                    if analytics["total_views"] > 0 else 0.0
                )
            },
            "generated_at": datetime.utcnow()
        }
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid vendor ID format")

# Seed initial vendors for demo
@router.post("/seed")
async def seed_vendors(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Seed initial vendor data for demo"""
    demo_vendors = [
        {
            "business_name": "Luxury Fashion House",
            "email": "contact@luxuryfashion.com",
            "phone": "+1-555-0101",
            "contact_name": "Maria Gonzalez",
            "business_type": "retail",
            "description": "Premium luxury fashion and accessories",
            "website": "https://luxuryfashion.com",
            "address": "123 Fashion Ave",
            "city": "New York",
            "country": "United States",
            "tax_id": "US123456789",
            "status": VendorStatus.ACTIVE,
            "tier": VendorTier.PREMIUM,
            "commission_rate": 3.5,
            "total_products": 25,
            "total_sales": 15000.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "business_name": "Tech Innovations Co",
            "email": "sales@techinnovations.com",
            "phone": "+1-555-0102",
            "contact_name": "David Chen",
            "business_type": "manufacturer",
            "description": "Cutting-edge electronics and gadgets",
            "website": "https://techinnovations.com",
            "address": "456 Silicon Valley Blvd",
            "city": "San Francisco",
            "country": "United States",
            "tax_id": "US987654321",
            "status": VendorStatus.ACTIVE,
            "tier": VendorTier.ENTERPRISE,
            "commission_rate": 2.5,
            "total_products": 50,
            "total_sales": 45000.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "business_name": "Artisan Home Goods",
            "email": "info@artisanhome.com",
            "phone": "+1-555-0103",
            "contact_name": "Sarah Williams",
            "business_type": "retail",
            "description": "Handcrafted home decor and furniture",
            "website": "https://artisanhome.com",
            "address": "789 Craft Lane",
            "city": "Portland",
            "country": "United States",
            "tax_id": "US456789123",
            "status": VendorStatus.PENDING,
            "tier": VendorTier.BASIC,
            "commission_rate": 5.0,
            "total_products": 12,
            "total_sales": 2500.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Check if vendors already exist
    existing_count = await db.vendors.count_documents({})
    if existing_count > 0:
        return {
            "message": "Vendors already seeded",
            "existing_count": existing_count
        }
    
    # Insert demo vendors
    result = await db.vendors.insert_many(demo_vendors)
    
    return {
        "message": "Demo vendors seeded successfully",
        "count": len(result.inserted_ids),
        "vendor_ids": [str(id) for id in result.inserted_ids]
    }