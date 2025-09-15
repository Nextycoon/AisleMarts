from typing import Dict, List, Optional
from datetime import datetime, timedelta
import re
import uuid
from seller_models import SellerProfileDoc, SellerStoreDoc, CommissionDoc, SellerPayoutDoc, generate_store_slug, validate_kenya_phone
from models import UserDoc, ProductDoc, OrderDoc
from db import db
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
        return validate_kenya_phone(phone_number)
    
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
        return validate_kenya_phone(m_pesa_number)
    
    async def calculate_trust_score(self, seller_profile: dict) -> float:
        """Calculate initial trust score based on verification"""
        score = 50.0  # Base score
        
        if seller_profile.get('phone_number'):
            score += 20.0
        if seller_profile.get('business_permit'):
            score += 15.0
        if seller_profile.get('m_pesa_number'):
            score += 10.0
        if seller_profile.get('business_description'):
            score += 5.0
            
        return min(score, 100.0)

class SellerService:
    def __init__(self):
        self.verification_service = SellerVerificationService()
        self.default_commission_rate = 0.01  # 1%
    
    async def create_seller_profile(self, user_id: str, seller_data: dict) -> dict:
        """Create a new seller profile"""
        
        # Validate phone number format for Kenya
        phone_number = seller_data.get('phone_number', '')
        if not validate_kenya_phone(phone_number):
            raise ValueError("Phone number must be in Kenya format (+254XXXXXXXXX)")
        
        # Create seller profile document
        seller_profile: SellerProfileDoc = {
            '_id': str(uuid.uuid4()),
            'user_id': user_id,
            'business_name': seller_data['business_name'],
            'business_type': seller_data.get('business_type', 'individual'),
            'phone_number': phone_number,
            'business_permit': seller_data.get('business_permit'),
            'verification_status': 'pending',
            'm_pesa_number': seller_data.get('m_pesa_number'),
            'tax_pin': seller_data.get('tax_pin'),
            'business_description': seller_data.get('business_description'),
            'business_address': seller_data.get('business_address'),
            'business_city': seller_data.get('business_city', 'Nairobi'),
            'business_country': seller_data.get('business_country', 'Kenya'),
            'preferred_currency': 'KES',
            'commission_rate': self.default_commission_rate,
            'auto_payout': True,
            'trust_score': 50.0,  # Will be calculated
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Calculate initial trust score
        seller_profile['trust_score'] = await self.verification_service.calculate_trust_score(seller_profile)
        
        # Insert into database
        await db().seller_profiles.insert_one(seller_profile)
        return seller_profile
    
    async def create_seller_store(self, seller_id: str, store_data: dict) -> dict:
        """Create a seller's store"""
        
        # Generate unique store slug
        store_slug = generate_store_slug(store_data['store_name'])
        
        # Create store document
        store: SellerStoreDoc = {
            '_id': str(uuid.uuid4()),
            'seller_id': seller_id,
            'store_name': store_data['store_name'],
            'store_slug': store_slug,
            'store_description': store_data.get('store_description'),
            'store_logo': store_data.get('store_logo'),
            'store_banner': store_data.get('store_banner'),
            'is_active': True,
            'store_categories': store_data.get('store_categories', []),
            'shipping_policy': store_data.get('shipping_policy'),
            'return_policy': store_data.get('return_policy'),
            'store_country': 'Kenya',
            'store_currency': 'KES',
            'store_language': store_data.get('store_language', 'en'),
            'total_sales': 0.0,
            'total_orders': 0,
            'avg_rating': 0.0,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Insert into database
        await db().seller_stores.insert_one(store)
        return store
    
    async def get_seller_profile(self, user_id: str) -> Optional[dict]:
        """Get seller profile by user ID"""
        return await db().seller_profiles.find_one({"user_id": user_id})
    
    async def get_seller_store(self, seller_id: str) -> Optional[dict]:
        """Get seller's store by seller ID"""
        return await db().seller_stores.find_one({"seller_id": seller_id})
    
    async def get_seller_products(self, seller_id: str, limit: int = 50, offset: int = 0) -> List[dict]:
        """Get products for a seller"""
        # This assumes Product collection has seller_id field
        cursor = db().products.find({"seller_id": seller_id}).skip(offset).limit(limit)
        products = await cursor.to_list(length=limit)
        return products
    
    async def get_seller_analytics(self, seller_id: str, period: str = "current_month") -> Dict:
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
        
        # Get orders for period (assumes Order collection has seller_id)
        cursor = db().orders.find({
            "seller_id": seller_id,
            "created_at": {"$gte": start_date, "$lte": end_date}
        })
        orders = await cursor.to_list(length=None)
        
        # Calculate analytics
        total_orders = len(orders)
        total_sales = sum(order.get('total_amount', 0) for order in orders)
        completed_orders = len([o for o in orders if o.get('status') == "completed"])
        pending_orders = len([o for o in orders if o.get('status') in ["pending", "processing"]])
        
        # Get average order value
        avg_order_value = total_sales / total_orders if total_orders > 0 else 0
        
        # Get products count
        products = await self.get_seller_products(seller_id)
        total_products = len(products)
        active_products = len([p for p in products if p.get('active', True)])
        
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