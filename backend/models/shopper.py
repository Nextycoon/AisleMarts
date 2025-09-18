"""
Shopper data models for MongoDB
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime

class ShopperCreate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    locale: str = "en"
    currency: str = "USD"
    device_info: Optional[Dict[str, Any]] = None

class ShopperProfile(BaseModel):
    id: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    locale: str = "en"
    currency: str = "USD"
    preferences: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

class ShopperPreferences(BaseModel):
    brands: List[str] = []
    categories: List[str] = []
    price_range: Optional[Dict[str, float]] = None
    style_preferences: List[str] = []
    notification_settings: Dict[str, bool] = {}
    privacy_settings: Dict[str, bool] = {}