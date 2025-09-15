from typing import Dict, List, Optional
from datetime import datetime, timedelta
from bson import ObjectId
import re
from seller_models import SellerProfile, SellerStore, Commission, SellerPayout
from models import User, Product, Order
from dotenv import load_dotenv
import requests
import os

load_dotenv()

class SellerVerificationService:
    def __init__(self):
        pass
    
    async def verify_phone_number(self, phone_number: str) -> bool:
        """Send SMS verification code to phone number"""
        # For MVP: format validation only
        # TODO: Integrate with SMS service (Africa's Talking or Twilio)
        return phone_number.startswith('+254') and len(phone_number) == 13
    
    async def verify_business_permit(self, permit_number: str, country: str) -> dict:
        """Verify business permit with government database"""
        # For Kenya: integrate with eCitizen API in production
        # For now: manual verification flag
        return {
            "status": "pending_manual_review",
            "estimated_completion": "24 hours"
        }
    
    async def verify_m_pesa_number(self, m_pesa_number: str) -> bool:
        """Verify M-Pesa number is valid business account"""
        # For MVP: format validation only
        # TODO: Integrate with Safaricom M-Pesa API
        return m_pesa_number.startswith('+254') and len(m_pesa_number) == 13
    
    async def calculate_trust_score(self, seller_profile: SellerProfile) -> float:
        """Calculate initial trust score based on verification"""
        score = 50.0  # Base score
        
        if seller_profile.phone_number:
            score += 20.0
        if seller_profile.business_permit:
            score += 15.0
        if seller_profile.m_pesa_number:
            score += 10.0
        if seller_profile.business_description:
            score += 5.0
            
        return min(score, 100.0)

class SellerService:
    def __init__(self):
        self.verification_service = SellerVerificationService()
        self.default_commission_rate = 0.01  # 1%
    
    async def create_seller_profile(self, user_id: ObjectId, seller_data: dict) -> SellerProfile:
        """Create a new seller profile"""
        
        # Validate phone number format for Kenya
        phone_number = seller_data.get('phone_number', '')
        if not phone_number.startswith('+254'):
            raise ValueError("Phone number must be in Kenya format (+254)")
        
        # Create seller profile
        seller_profile = SellerProfile(
            user_id=user_id,
            business_name=seller_data['business_name'],
            business_type=seller_data.get('business_type', 'individual'),
            phone_number=phone_number,
            business_permit=seller_data.get('business_permit'),
            m_pesa_number=seller_data.get('m_pesa_number'),
            tax_pin=seller_data.get('tax_pin'),
            business_description=seller_data.get('business_description'),
            business_address=seller_data.get('business_address'),
            business_city=seller_data.get('business_city', 'Nairobi'),
            business_country=seller_data.get('business_country', 'Kenya')
        )
        
        # Calculate initial trust score
        seller_profile.trust_score = await self.verification_service.calculate_trust_score(seller_profile)
        
        await seller_profile.insert()
        return seller_profile
    
    async def create_seller_store(self, seller_id: ObjectId, store_data: dict) -> SellerStore:
        """Create a seller's store"""
        
        # Generate unique store slug
        store_slug = self._generate_store_slug(store_data['store_name'])
        
        # Create store
        store = SellerStore(
            seller_id=seller_id,
            store_name=store_data['store_name'],
            store_slug=store_slug,
            store_description=store_data.get('store_description'),
            store_logo=store_data.get('store_logo'),
            store_banner=store_data.get('store_banner'),
            store_categories=store_data.get('store_categories', []),
            shipping_policy=store_data.get('shipping_policy'),
            return_policy=store_data.get('return_policy'),
            store_language=store_data.get('store_language', 'en')
        )
        
        await store.insert()
        return store
    
    def _generate_store_slug(self, store_name: str) -> str:
        """Generate URL-friendly store slug"""
        slug = re.sub(r'[^a-zA-Z0-9\s-]', '', store_name.lower())
        slug = re.sub(r'[\s-]+', '-', slug)
        slug = slug.strip('-')
        
        # Add timestamp to ensure uniqueness
        timestamp = str(int(datetime.utcnow().timestamp()))
        return f"{slug}-{timestamp[-4:]}"
    
    async def get_seller_profile(self, user_id: ObjectId) -> Optional[SellerProfile]:
        """Get seller profile by user ID"""
        return await SellerProfile.find_one({"user_id": user_id})
    
    async def get_seller_store(self, seller_id: ObjectId) -> Optional[SellerStore]:
        """Get seller's store by seller ID"""
        return await SellerStore.find_one({"seller_id": seller_id})
    
    async def get_seller_products(self, seller_id: ObjectId, limit: int = 50, offset: int = 0) -> List[Product]:
        """Get products for a seller"""
        # This assumes Product model has seller_id field
        products = await Product.find({"seller_id": seller_id}).skip(offset).limit(limit).to_list()
        return products
    
    async def get_seller_analytics(self, seller_id: ObjectId, period: str = "current_month") -> Dict:
        """Get seller's performance analytics"""
        
        # Calculate date range
        now = datetime.utcnow()
        if period == "current_month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = now
        elif period == "last_month":
            last_month = now.replace(day=1) - timedelta(days=1)
            start_date = last_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = last_month.replace(day=last_month.day, hour=23, minute=59, second=59)
        else:
            # Default to last 30 days
            start_date = now - timedelta(days=30)
            end_date = now
        
        # Get orders for period (assumes Order model has seller_id)
        orders = await Order.find({
            "seller_id": seller_id,
            "created_at": {"$gte": start_date, "$lte": end_date}
        }).to_list()
        
        # Calculate analytics
        total_orders = len(orders)
        total_sales = sum(order.total_amount for order in orders)
        completed_orders = len([o for o in orders if o.status == "completed"])
        pending_orders = len([o for o in orders if o.status in ["pending", "processing"]])
        
        # Get average order value
        avg_order_value = total_sales / total_orders if total_orders > 0 else 0
        
        # Get products count
        products = await self.get_seller_products(seller_id)
        total_products = len(products)
        active_products = len([p for p in products if getattr(p, 'is_active', True)])
        
        return {
            "period": period,
            "orders": {
                "total_orders": total_orders,
                "completed_orders": completed_orders,
                "pending_orders": pending_orders,
                "avg_order_value": round(avg_order_value, 2)
            },
            "sales": {
                "total_sales": round(total_sales, 2),
                "currency": "KES"
            },
            "products": {
                "total_products": total_products,
                "active_products": active_products
            },
            "performance": {
                "conversion_rate": (completed_orders / total_orders * 100) if total_orders > 0 else 0,
                "store_views": 0,  # TODO: Implement view tracking
                "store_rating": 0  # TODO: Implement rating system
            }
        }

# Initialize service
seller_service = SellerService()