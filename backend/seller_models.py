from beanie import Document, Indexed
from pydantic import Field, validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class SellerProfile(Document):
    user_id: ObjectId = Field(...)
    business_name: str = Field(..., min_length=2, max_length=100)
    business_type: str = Field(...)  # individual, business, company
    phone_number: str = Field(..., regex="^\+254[0-9]{9}$")  # Kenya format
    business_permit: Optional[str] = None  # Business license number
    verification_status: str = Field(default="pending")  # pending, verified, rejected
    m_pesa_number: Optional[str] = None
    tax_pin: Optional[str] = None  # KRA PIN for Kenyan businesses
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Business Details
    business_description: Optional[str] = None
    business_address: Optional[str] = None
    business_city: str = Field(default="Nairobi")
    business_country: str = Field(default="Kenya")
    
    # Seller Preferences
    preferred_currency: str = Field(default="KES")
    commission_rate: float = Field(default=0.01)  # 1%
    auto_payout: bool = Field(default=True)
    
    # Trust Score
    trust_score: float = Field(default=50.0)
    
    class Settings:
        collection = "seller_profiles"

class SellerStore(Document):
    seller_id: ObjectId = Field(...)
    store_name: str = Field(..., min_length=3, max_length=50)
    store_slug: str = Field(..., unique=True)  # URL-friendly store name
    store_description: Optional[str] = None
    store_logo: Optional[str] = None  # Base64 or URL
    store_banner: Optional[str] = None
    
    # Store Settings
    is_active: bool = Field(default=True)
    store_categories: List[str] = Field(default=[])
    shipping_policy: Optional[str] = None
    return_policy: Optional[str] = None
    
    # Localization
    store_country: str = Field(default="Kenya")
    store_currency: str = Field(default="KES")
    store_language: str = Field(default="en")
    
    # Performance Metrics
    total_sales: float = Field(default=0.0)
    total_orders: int = Field(default=0)
    avg_rating: float = Field(default=0.0)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('store_slug')
    def validate_store_slug(cls, v):
        # Convert to URL-friendly format
        import re
        slug = re.sub(r'[^a-zA-Z0-9\s-]', '', v.lower())
        slug = re.sub(r'[\s-]+', '-', slug)
        return slug.strip('-')
    
    class Settings:
        collection = "seller_stores"

class Commission(Document):
    order_id: ObjectId = Field(...)
    seller_id: ObjectId = Field(...)
    buyer_id: ObjectId = Field(...)
    
    # Transaction Details
    gross_amount: float = Field(...)  # Total order value
    commission_rate: float = Field(default=0.01)  # 1%
    commission_amount: float = Field(...)  # Calculated commission
    seller_payout: float = Field(...)  # Amount seller receives
    
    # Currency Information
    currency: str = Field(...)
    exchange_rate: Optional[float] = None  # If conversion needed
    
    # Status Tracking
    status: str = Field(default="pending")  # pending, processed, paid
    processed_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    
    # Payment Details
    payment_method: str = Field(...)  # m_pesa, bank_transfer
    payment_reference: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        collection = "commissions"

class SellerPayout(Document):
    seller_id: ObjectId = Field(...)
    payout_period: str = Field(...)  # "2024-01", "2024-02"
    
    # Payout Summary
    total_sales: float = Field(...)
    total_commission: float = Field(...)
    net_payout: float = Field(...)
    currency: str = Field(...)
    
    # Individual Transactions
    commission_ids: List[ObjectId] = Field(default=[])
    
    # Payout Details
    payout_method: str = Field(...)  # m_pesa, bank_transfer
    payout_reference: Optional[str] = None
    payout_status: str = Field(default="pending")  # pending, processing, completed, failed
    
    # Timing
    period_start: datetime = Field(...)
    period_end: datetime = Field(...)
    payout_date: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        collection = "seller_payouts"