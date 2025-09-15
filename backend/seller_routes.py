from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from typing import Dict, List, Optional
from bson import ObjectId
from seller_service import seller_service
from commission_service import commission_service
from seller_models import SellerProfileDoc, SellerStoreDoc, CommissionDoc
from security import decode_access_token
from datetime import datetime
from db import db

router = APIRouter(prefix="/api/seller", tags=["Seller"])

async def get_current_user(authorization: str | None = Header(None)):
    """Extract user from auth token"""
    if not authorization:
        raise HTTPException(401, "Missing Authorization header")
    try:
        token = authorization.split()[1]
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        user = await db().users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {str(e)}")

# Pydantic models for API requests
class SellerRegistrationRequest(BaseModel):
    business_name: str
    business_type: str = "individual"
    phone_number: str
    business_permit: Optional[str] = None
    m_pesa_number: Optional[str] = None
    tax_pin: Optional[str] = None
    business_description: Optional[str] = None
    business_address: Optional[str] = None
    business_city: str = "Nairobi"

class StoreSetupRequest(BaseModel):
    store_name: str
    store_description: Optional[str] = None
    store_logo: Optional[str] = None
    store_banner: Optional[str] = None
    store_categories: List[str] = []
    shipping_policy: Optional[str] = None
    return_policy: Optional[str] = None
    store_language: str = "en"

class QuickProductRequest(BaseModel):
    name: str
    description: str
    price: float
    currency: str = "KES"
    images: List[str] = []
    category: str
    stock_quantity: int = 1

@router.post("/register")
async def register_seller(
    seller_data: SellerRegistrationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Register as a seller"""
    try:
        user_id = current_user["_id"]
        
        # Check if user is already a seller
        existing_seller = await seller_service.get_seller_profile(user_id)
        if existing_seller:
            raise HTTPException(
                status_code=400,
                detail="User is already registered as a seller"
            )
        
        # Create seller profile
        seller_profile = await seller_service.create_seller_profile(
            user_id=user_id,
            seller_data=seller_data.dict()
        )
        
        return {
            "success": True,
            "seller_id": seller_profile['_id'],
            "trust_score": seller_profile['trust_score'],
            "verification_status": seller_profile['verification_status'],
            "message": "Seller registration successful! You can now set up your store."
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/store/setup")
async def setup_store(
    store_data: StoreSetupRequest,
    current_user: dict = Depends(get_current_user)
):
    """Set up seller's store"""
    try:
        user_id = current_user["_id"]
        
        # Get seller profile
        seller_profile = await seller_service.get_seller_profile(user_id)
        if not seller_profile:
            raise HTTPException(
                status_code=404,
                detail="Seller profile not found. Please register as seller first."
            )
        
        # Check if store already exists
        existing_store = await seller_service.get_seller_store(seller_profile['_id'])
        if existing_store:
            raise HTTPException(
                status_code=400,
                detail="Store already exists for this seller"
            )
        
        # Create store
        store = await seller_service.create_seller_store(
            seller_id=seller_profile['_id'],
            store_data=store_data.dict()
        )
        
        return {
            "success": True,
            "store_id": store['_id'],
            "store_slug": store['store_slug'],
            "store_url": f"aislemarts.com/store/{store['store_slug']}",
            "message": "Store setup successful! You can now add products."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Store setup failed: {str(e)}")

@router.get("/profile")
async def get_seller_profile(current_user: dict = Depends(get_current_user)):
    """Get seller's profile information"""
    try:
        user_id = current_user["_id"]
        seller_profile = await seller_service.get_seller_profile(user_id)
        
        if not seller_profile:
            raise HTTPException(
                status_code=404,
                detail="Seller profile not found"
            )
        
        # Get store info if exists
        store = await seller_service.get_seller_store(seller_profile['_id'])
        
        return {
            "seller_profile": {
                "id": seller_profile['_id'],
                "business_name": seller_profile['business_name'],
                "business_type": seller_profile['business_type'],
                "phone_number": seller_profile['phone_number'],
                "verification_status": seller_profile['verification_status'],
                "trust_score": seller_profile['trust_score'],
                "business_city": seller_profile['business_city'],
                "business_country": seller_profile['business_country'],
                "preferred_currency": seller_profile['preferred_currency'],
                "commission_rate": f"{seller_profile['commission_rate'] * 100}%",
                "created_at": seller_profile['created_at']
            },
            "store": {
                "id": store['_id'] if store else None,
                "store_name": store['store_name'] if store else None,
                "store_slug": store['store_slug'] if store else None,
                "store_url": f"aislemarts.com/store/{store['store_slug']}" if store else None,
                "is_active": store['is_active'] if store else False,
                "total_sales": store['total_sales'] if store else 0,
                "total_orders": store['total_orders'] if store else 0
            } if store else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_seller_analytics(
    period: str = "current_month",
    current_user: dict = Depends(get_current_user)
):
    """Get seller's performance analytics"""
    try:
        user_id = current_user["_id"]
        seller_profile = await seller_service.get_seller_profile(user_id)
        
        if not seller_profile:
            raise HTTPException(
                status_code=404,
                detail="Seller profile not found"
            )
        
        analytics = await seller_service.get_seller_analytics(seller_profile['_id'], period)
        
        return analytics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/earnings/{period}")
async def get_seller_earnings(
    period: str = "current_month",
    current_user: dict = Depends(get_current_user)
):
    """Get seller's earnings summary"""
    try:
        user_id = current_user["_id"]
        seller_profile = await seller_service.get_seller_profile(user_id)
        
        if not seller_profile:
            raise HTTPException(
                status_code=404,
                detail="Seller profile not found"
            )
        
        earnings = await commission_service.get_seller_earnings(seller_profile['_id'], period)
        
        return earnings
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/commissions")
async def get_seller_commissions(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get seller's commission history"""
    try:
        user_id = current_user["_id"]
        seller_profile = await seller_service.get_seller_profile(user_id)
        
        if not seller_profile:
            raise HTTPException(
                status_code=404,
                detail="Seller profile not found"
            )
        
        commissions = await commission_service.get_seller_commissions(
            seller_profile['_id'], limit, offset
        )
        
        return {
            "commissions": [
                {
                    "id": c['_id'],
                    "order_id": c['order_id'],
                    "gross_amount": c['gross_amount'],
                    "commission_amount": c['commission_amount'],
                    "seller_payout": c['seller_payout'],
                    "currency": c['currency'],
                    "status": c['status'],
                    "created_at": c['created_at'],
                    "processed_at": c.get('processed_at')
                }
                for c in commissions
            ],
            "total_count": len(commissions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/payout/generate")
async def generate_payout(
    year: int,
    month: int,
    current_user: dict = Depends(get_current_user)
):
    """Generate monthly payout for seller"""
    try:
        user_id = current_user["_id"]
        seller_profile = await seller_service.get_seller_profile(user_id)
        
        if not seller_profile:
            raise HTTPException(
                status_code=404,
                detail="Seller profile not found"
            )
        
        payout = await commission_service.generate_monthly_payout(
            seller_profile['_id'], year, month
        )
        
        if not payout:
            raise HTTPException(
                status_code=404,
                detail="No transactions found for this period"
            )
        
        return {
            "payout_id": payout['_id'],
            "period": payout['payout_period'],
            "net_payout": payout['net_payout'],
            "currency": payout['currency'],
            "status": payout['payout_status'],
            "payout_method": payout['payout_method']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/demo/simulate-sale")
async def simulate_sale(
    amount: float = 15000.0,
    currency: str = "KES",
    current_user: dict = Depends(get_current_user)
):
    """Simulate a sale for demo purposes"""
    try:
        user_id = current_user["_id"]
        seller_profile = await seller_service.get_seller_profile(user_id)
        
        if not seller_profile:
            raise HTTPException(
                status_code=404,
                detail="Seller profile not found"
            )
        
        simulation = await commission_service.simulate_order_completion(
            seller_profile['_id'], amount, currency
        )
        
        return {
            "success": True,
            "message": "Sale simulation completed successfully!",
            "details": simulation
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def seller_health_check():
    """Health check for seller services"""
    return {
        "status": "healthy",
        "service": "seller_service",
        "commission_rate": "1%",
        "supported_currency": "KES",
        "payment_methods": ["m_pesa", "bank_transfer"],
        "timestamp": datetime.utcnow()
    }