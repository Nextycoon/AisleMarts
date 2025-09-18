"""
Product data models for MongoDB
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProductBase(BaseModel):
    title: str
    brand: str
    description: Optional[str] = None
    price: float
    currency: str = "USD"
    images: List[str] = []
    tags: List[str] = []
    colors: List[str] = []
    sizes: List[str] = []
    category_id: Optional[str] = None

class ProductCreate(ProductBase):
    stock: int = 0
    active: bool = True

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    images: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    stock: Optional[int] = None
    active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: str
    stock: int
    active: bool
    rating: float = 0.0
    rating_count: int = 0
    created_at: datetime
    updated_at: datetime

class ProductReview(BaseModel):
    id: str
    product_id: str
    author: str
    rating: int  # 1-5
    body: str
    created_at: datetime
    verified_purchase: bool = False