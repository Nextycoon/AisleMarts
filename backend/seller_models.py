from datetime import datetime
from typing import TypedDict, List, Dict, Optional
import re

# Seller Profile
class SellerProfileDoc(TypedDict):
    _id: str
    user_id: str
    business_name: str
    business_type: str  # individual, business, company
    phone_number: str  # Kenya format
    business_permit: Optional[str]  # Business license number
    verification_status: str  # pending, verified, rejected
    m_pesa_number: Optional[str]
    tax_pin: Optional[str]  # KRA PIN for Kenyan businesses
    created_at: datetime
    updated_at: datetime
    
    # Business Details
    business_description: Optional[str]
    business_address: Optional[str]
    business_city: str
    business_country: str
    
    # Seller Preferences
    preferred_currency: str
    commission_rate: float  # 1%
    auto_payout: bool
    
    # Trust Score
    trust_score: float

# Seller Store
class SellerStoreDoc(TypedDict):
    _id: str
    seller_id: str
    store_name: str
    store_slug: str  # URL-friendly store name
    store_description: Optional[str]
    store_logo: Optional[str]  # Base64 or URL
    store_banner: Optional[str]
    
    # Store Settings
    is_active: bool
    store_categories: List[str]
    shipping_policy: Optional[str]
    return_policy: Optional[str]
    
    # Localization
    store_country: str
    store_currency: str
    store_language: str
    
    # Performance Metrics
    total_sales: float
    total_orders: int
    avg_rating: float
    
    created_at: datetime
    updated_at: datetime

# Commission
class CommissionDoc(TypedDict):
    _id: str
    order_id: str
    seller_id: str
    buyer_id: str
    
    # Transaction Details
    gross_amount: float  # Total order value
    commission_rate: float  # 1%
    commission_amount: float  # Calculated commission
    seller_payout: float  # Amount seller receives
    
    # Currency Information
    currency: str
    exchange_rate: Optional[float]  # If conversion needed
    
    # Status Tracking
    status: str  # pending, processed, paid
    processed_at: Optional[datetime]
    paid_at: Optional[datetime]
    
    # Payment Details
    payment_method: str  # m_pesa, bank_transfer
    payment_reference: Optional[str]
    
    created_at: datetime

# Seller Payout
class SellerPayoutDoc(TypedDict):
    _id: str
    seller_id: str
    payout_period: str  # "2024-01", "2024-02"
    
    # Payout Summary
    total_sales: float
    total_commission: float
    net_payout: float
    currency: str
    
    # Individual Transactions
    commission_ids: List[str]
    
    # Payout Details
    payout_method: str  # m_pesa, bank_transfer
    payout_reference: Optional[str]
    payout_status: str  # pending, processing, completed, failed
    
    # Timing
    period_start: datetime
    period_end: datetime
    payout_date: Optional[datetime]
    
    created_at: datetime

def generate_store_slug(store_name: str) -> str:
    """Generate URL-friendly store slug"""
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', store_name.lower())
    slug = re.sub(r'[\s-]+', '-', slug)
    slug = slug.strip('-')
    
    # Add timestamp to ensure uniqueness
    timestamp = str(int(datetime.utcnow().timestamp()))
    return f"{slug}-{timestamp[-4:]}"

def validate_kenya_phone(phone_number: str) -> bool:
    """Validate Kenya phone number format"""
    # Remove spaces and special characters
    phone = phone_number.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    
    # Check Kenya format +254XXXXXXXXX
    if phone.startswith('+254') and len(phone) == 13:
        return True
    
    return False