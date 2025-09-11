from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    name: Optional[str] = None
    roles: List[str] = []

    class Config:
        populate_by_name = True

class ProductIn(BaseModel):
    title: str
    slug: str
    description: str = ""
    price: float
    currency: str = "USD"
    images: List[str] = []
    category_id: str | None = None
    brand: str | None = None
    attributes: Dict[str, str] = {}
    stock: int = 0
    active: bool = True

class ProductOut(ProductIn):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class CartItemIn(BaseModel):
    product_id: str
    quantity: int

class CreatePaymentIntentIn(BaseModel):
    items: List[CartItemIn]
    currency: str = "USD"
    shipping_address: Dict | None = None

class OrderOut(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    items: List[Dict]
    subtotal: float
    currency: str
    status: str
    created_at: datetime

    class Config:
        populate_by_name = True

class CategoryIn(BaseModel):
    name: str
    slug: str
    description: str = ""
    parent_id: str | None = None
    active: bool = True

class CategoryOut(CategoryIn):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True