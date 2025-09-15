from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime
from bson import ObjectId

class OrderItem(BaseModel):
    """Order Item Model"""
    product_id: str
    title: str
    sku: Optional[str] = None
    quantity: int = Field(gt=0, description="Item quantity")
    price: float = Field(gt=0, description="Unit price in KES")
    subtotal: float = Field(gt=0, description="Line total in KES")

class OrderCustomer(BaseModel):
    """Order Customer Info"""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class OrderEvent(BaseModel):
    """Order Timeline Event"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event: str
    description: Optional[str] = None

class Order(BaseModel):
    """Complete Order Model"""
    order_id: str
    seller_id: str
    customer: OrderCustomer
    items: List[OrderItem]
    subtotal: float = Field(gt=0, description="Order subtotal in KES")
    shipping: float = Field(ge=0, description="Shipping cost in KES")
    commission: float = Field(ge=0, description="AisleMarts 1% commission in KES")
    seller_payout: float = Field(ge=0, description="Amount seller receives in KES")
    total: float = Field(gt=0, description="Total order amount in KES")
    status: Literal['pending', 'paid', 'shipped', 'delivered', 'cancelled'] = 'pending'
    payment_method: str = 'M-Pesa'
    mpesa_transaction_id: Optional[str] = None
    mpesa_checkout_request_id: Optional[str] = None
    events: List[OrderEvent] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderStatusUpdate(BaseModel):
    """Order Status Update Request"""
    status: Literal['pending', 'paid', 'shipped', 'delivered', 'cancelled']
    notes: Optional[str] = None

class MPesaSTKCallback(BaseModel):
    """M-Pesa STK Callback Model"""
    MerchantRequestID: str
    CheckoutRequestID: str
    ResultCode: int
    ResultDesc: str
    CallbackMetadata: Optional[dict] = None