from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class SellerProduct(BaseModel):
    """Seller Product Model"""
    seller_id: str
    title: str
    description: Optional[str] = None
    price: float = Field(gt=0, description="Product price in KES")
    stock: int = Field(ge=0, description="Available stock")
    sku: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SellerProductUpdate(BaseModel):
    """Update model for seller products"""
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    sku: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    active: Optional[bool] = None

class SellerProductCreate(BaseModel):
    """Create model for seller products"""
    title: str
    description: Optional[str] = None
    price: float = Field(gt=0, description="Product price in KES")
    stock: int = Field(ge=0, description="Available stock")
    sku: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None

class SellerOrder(BaseModel):
    """Seller Order Model"""
    order_id: str
    seller_id: str
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    items: List[dict]  # List of order items
    subtotal: float
    commission: float = Field(description="AisleMarts 1% commission")
    seller_payout: float = Field(description="Amount seller receives")
    status: str = Field(default="pending", description="Order status")
    mpesa_transaction_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SellerAnalytics(BaseModel):
    """Seller Analytics Summary"""
    seller_id: str
    revenue_30d: float = 0.0
    orders_30d: int = 0
    views_30d: int = 0
    commission_30d: float = 0.0
    average_order_value: float = 0.0
    conversion_rate: float = 0.0
    ai_share: float = 0.0  # Percentage of sales from AI recommendations
    last_updated: datetime = Field(default_factory=datetime.utcnow)