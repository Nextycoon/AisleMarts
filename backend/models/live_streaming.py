from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class StreamStatus(str, Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    ENDED = "ended"
    PAUSED = "paused"


class ViewerAction(str, Enum):
    JOIN = "join"
    LEAVE = "leave"
    PURCHASE = "purchase"
    LIKE = "like"
    COMMENT = "comment"
    SHARE = "share"


class ProductShowcase(BaseModel):
    product_id: str
    name: str
    price: float
    currency: str = "USD"
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: int = 0
    featured_timestamp: Optional[datetime] = None
    ai_recommendation_score: float = 0.0
    conversion_rate: float = 0.0


class LiveStreamAnalytics(BaseModel):
    total_viewers: int = 0
    peak_viewers: int = 0
    average_view_duration: float = 0.0  # in minutes
    total_purchases: int = 0
    total_revenue: float = 0.0
    engagement_rate: float = 0.0
    chat_messages: int = 0
    likes: int = 0
    shares: int = 0
    ai_insights: List[str] = []
    conversion_funnel: Dict[str, int] = {}


class AIInsight(BaseModel):
    type: str  # "audience_behavior", "product_performance", "revenue_optimization"
    message: str
    confidence: float
    action_recommendation: Optional[str] = None
    timestamp: datetime


class LiveStream(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    host_id: str
    host_name: str
    status: StreamStatus = StreamStatus.SCHEDULED
    scheduled_start: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    thumbnail_url: Optional[str] = None
    stream_url: Optional[str] = None
    chat_enabled: bool = True
    products: List[ProductShowcase] = []
    current_featured_product: Optional[str] = None
    analytics: LiveStreamAnalytics = Field(default_factory=LiveStreamAnalytics)
    ai_insights: List[AIInsight] = []
    tags: List[str] = []
    category: str = "general"
    max_viewers: int = 1000
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ViewerEngagement(BaseModel):
    viewer_id: str
    stream_id: str
    action: ViewerAction
    timestamp: datetime
    metadata: Dict[str, Any] = {}  # Additional data like product_id for purchases


class StreamMetrics(BaseModel):
    stream_id: str
    timestamp: datetime
    concurrent_viewers: int
    chat_activity: int
    purchase_rate: float
    engagement_score: float
    ai_recommendations: List[str] = []


class CreateStreamRequest(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    thumbnail_url: Optional[str] = None
    products: List[ProductShowcase] = []
    tags: List[str] = []
    category: str = "general"


class UpdateStreamRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[StreamStatus] = None
    current_featured_product: Optional[str] = None
    products: Optional[List[ProductShowcase]] = None


class StreamAnalyticsRequest(BaseModel):
    stream_id: str
    date_range: Optional[str] = "last_7_days"  # "today", "yesterday", "last_7_days", "last_30_days"
    metrics: Optional[List[str]] = ["viewers", "engagement", "revenue", "conversion"]