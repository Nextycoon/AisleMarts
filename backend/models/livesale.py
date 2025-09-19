from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum

class LiveSaleStatus(str, Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    ENDED = "ended"
    CANCELLED = "cancelled"

class LiveSaleEventType(str, Enum):
    LIVESALE_START = "LIVESALE_START"
    LIVESALE_TICK = "LIVESALE_TICK"
    STOCK_UPDATE = "STOCK_UPDATE"
    LIVESALE_END = "LIVESALE_END"
    VIEWER_JOIN = "VIEWER_JOIN"
    VIEWER_LEAVE = "VIEWER_LEAVE"
    PRODUCT_FEATURE = "PRODUCT_FEATURE"
    REWARD_EARNED = "REWARD_EARNED"

class LiveSaleProduct(BaseModel):
    product_id: str
    name: str
    original_price: float
    drop_price: float
    quantity_available: int
    quantity_sold: int = 0
    image_url: Optional[str] = None
    description: Optional[str] = None

class LiveSaleRewards(BaseModel):
    watch_points: int = 5      # Points per minute watched
    share_points: int = 10     # Points for sharing
    purchase_points: int = 25  # Points for purchasing
    winner_pool_size: int = 3  # Number of winners selected

class LiveSaleModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    description: Optional[str] = None
    vendor_id: str
    status: LiveSaleStatus = LiveSaleStatus.SCHEDULED
    starts_at: datetime
    duration_minutes: int = 20
    ends_at: Optional[datetime] = None
    products: List[LiveSaleProduct]
    rewards: LiveSaleRewards
    stream_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    viewer_count: int = 0
    total_sales: float = 0.0
    total_viewers: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }

class LiveSaleViewer(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    livesale_id: str
    user_id: str
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    left_at: Optional[datetime] = None
    watch_time_seconds: int = 0
    points_earned: int = 0
    shared_count: int = 0
    purchased_count: int = 0
    is_winner: bool = False
    
    class Config:
        allow_population_by_field_name = True

class LiveSaleEvent(BaseModel):
    type: LiveSaleEventType
    livesale_id: str
    user_id: Optional[str] = None
    data: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Request Models
class CreateLiveSaleRequest(BaseModel):
    title: str
    description: Optional[str] = None
    starts_at: datetime
    duration_minutes: int = 20
    products: List[Dict[str, Any]]  # Will be converted to LiveSaleProduct
    rewards: Optional[Dict[str, Any]] = None

class UpdateLiveSaleRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    starts_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    thumbnail_url: Optional[str] = None

class StartLiveSaleRequest(BaseModel):
    stream_url: str

class PurchaseFromLiveSaleRequest(BaseModel):
    sku: str
    quantity: int = 1

class ShareLiveSaleRequest(BaseModel):
    platform: str  # "story", "channel", "dm"
    target_id: Optional[str] = None