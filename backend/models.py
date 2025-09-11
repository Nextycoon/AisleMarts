from datetime import datetime
from typing import TypedDict, Literal, List, Dict, Optional

# Users
class UserDoc(TypedDict):
    _id: str
    email: str
    name: str | None
    password_hash: str | None
    roles: List[str]  # ["user", "admin", "vendor"]
    created_at: datetime

# Products
class ProductDoc(TypedDict):
    _id: str
    title: str
    slug: str
    description: str
    price: float
    currency: str  # e.g., "USD"
    images: List[str]  # base64 or public URLs
    category_id: str | None
    brand: str | None
    attributes: Dict[str, str]  # {"color": "Red"}
    stock: int
    active: bool
    created_at: datetime
    updated_at: datetime

# Orders
class OrderItem(TypedDict):
    product_id: str
    title: str
    quantity: int
    unit_price: float
    currency: str

class OrderDoc(TypedDict):
    _id: str
    user_id: str
    items: List[OrderItem]
    subtotal: float
    currency: str
    stripe_payment_intent: str | None
    status: Literal["created", "paid", "failed", "refunded"]
    shipping_address: Dict | None
    created_at: datetime
    updated_at: datetime

# Categories
class CategoryDoc(TypedDict):
    _id: str
    name: str
    slug: str
    description: str
    parent_id: str | None
    active: bool
    created_at: datetime