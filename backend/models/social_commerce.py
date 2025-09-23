from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ContentType(str, Enum):
    POST = "post"
    VIDEO = "video"
    STORY = "story"
    LIVE_STREAM = "live_stream"
    CAROUSEL = "carousel"
    REEL = "reel"


class InfluencerTier(str, Enum):
    NANO = "nano"          # 1K-10K followers
    MICRO = "micro"        # 10K-100K followers  
    MACRO = "macro"        # 100K-1M followers
    MEGA = "mega"          # 1M+ followers
    CELEBRITY = "celebrity" # Special category


class CampaignStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class EngagementType(str, Enum):
    LIKE = "like"
    COMMENT = "comment"
    SHARE = "share"
    SAVE = "save"
    CLICK = "click"
    PURCHASE = "purchase"
    VIEW = "view"


# Advanced Shoppable Content
class ShoppableContent(BaseModel):
    id: Optional[str] = None
    creator_id: str
    creator_name: str
    content_type: ContentType
    title: str
    description: str
    media_urls: List[str] = []
    thumbnail_url: Optional[str] = None
    tagged_products: List[Dict[str, Any]] = []  # Product info with positioning
    engagement_count: int = 0
    view_count: int = 0
    purchase_count: int = 0
    conversion_rate: float = 0.0
    revenue_generated: float = 0.0
    is_sponsored: bool = False
    sponsor_brand: Optional[str] = None
    hashtags: List[str] = []
    location: Optional[str] = None
    audience_demographics: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.now)
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class ProductTag(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    price: float
    currency: str = "USD"
    x_position: float  # 0-100% for positioning in media
    y_position: float  # 0-100% for positioning in media
    affiliate_commission: float = 0.0
    is_exclusive_deal: bool = False
    discount_code: Optional[str] = None
    discount_percentage: Optional[float] = None


# Advanced Influencer Marketplace
class InfluencerProfile(BaseModel):
    user_id: str
    username: str
    display_name: str
    bio: str
    profile_image: str
    tier: InfluencerTier
    follower_count: int = 0
    engagement_rate: float = 0.0
    average_views: int = 0
    specialties: List[str] = []  # fashion, beauty, tech, lifestyle, etc.
    target_demographics: Dict[str, Any] = {}
    content_categories: List[str] = []
    preferred_brands: List[str] = []
    commission_rate: float = 0.1
    min_campaign_budget: float = 500.0
    max_posts_per_month: int = 10
    collaboration_count: int = 0
    total_revenue_generated: float = 0.0
    rating: float = 0.0
    review_count: int = 0
    is_verified: bool = False
    verification_badges: List[str] = []
    contact_info: Dict[str, str] = {}
    media_kit_url: Optional[str] = None
    sample_content_urls: List[str] = []
    availability_calendar: Dict[str, bool] = {}
    performance_metrics: Dict[str, Any] = {}


class BrandProfile(BaseModel):
    id: Optional[str] = None
    company_name: str
    brand_name: str
    logo_url: str
    industry: str
    description: str
    website: str
    contact_email: str
    budget_range: Dict[str, float]  # min, max monthly budget
    target_audience: Dict[str, Any] = {}
    preferred_content_types: List[ContentType] = []
    campaign_objectives: List[str] = []  # brand_awareness, sales, engagement
    collaboration_history: List[str] = []
    average_campaign_performance: Dict[str, float] = {}
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.now)


# Campaign Management
class InfluencerCampaign(BaseModel):
    id: Optional[str] = None
    brand_id: str
    brand_name: str
    campaign_name: str
    description: str
    campaign_type: str  # product_launch, seasonal, ongoing, event
    budget: float
    objectives: List[str] = []
    target_demographics: Dict[str, Any] = {}
    content_requirements: Dict[str, Any] = {}
    deliverables: List[Dict[str, Any]] = []
    timeline: Dict[str, datetime] = {}
    selected_influencers: List[str] = []
    pending_applications: List[str] = []
    status: CampaignStatus = CampaignStatus.DRAFT
    performance_metrics: Dict[str, Any] = {}
    total_reach: int = 0
    total_engagement: int = 0
    total_conversions: int = 0
    roi: float = 0.0
    created_at: datetime = Field(default_factory=datetime.now)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CollaborationProposal(BaseModel):
    id: Optional[str] = None
    campaign_id: str
    influencer_id: str
    brand_id: str
    proposed_content: List[Dict[str, Any]] = []
    proposed_timeline: Dict[str, datetime] = {}
    requested_compensation: float
    additional_terms: str = ""
    status: str = "pending"  # pending, accepted, rejected, negotiating
    negotiation_history: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.now)


# User Generated Content & Social Shopping
class UserGeneratedContent(BaseModel):
    id: Optional[str] = None
    user_id: str
    username: str
    content_type: ContentType
    media_urls: List[str] = []
    caption: str
    hashtags: List[str] = []
    tagged_products: List[ProductTag] = []
    location: Optional[str] = None
    engagement_metrics: Dict[str, int] = {}
    is_featured: bool = False
    moderation_status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.now)


class SocialShoppingGroup(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    admin_id: str
    members: List[str] = []
    max_members: int = 50
    privacy_level: str = "public"  # public, private, invite_only
    group_type: str = "general"  # fashion, beauty, tech, deals, etc.
    shared_wishlists: List[str] = []
    group_purchases: List[str] = []
    total_savings: float = 0.0
    created_at: datetime = Field(default_factory=datetime.now)


class GroupPurchase(BaseModel):
    id: Optional[str] = None
    group_id: str
    organizer_id: str
    product_id: str
    product_name: str
    product_image: str
    regular_price: float
    group_price: float
    minimum_participants: int
    maximum_participants: int
    current_participants: List[str] = []
    deadline: datetime
    status: str = "active"  # active, completed, cancelled, expired
    savings_per_person: float = 0.0
    total_savings: float = 0.0
    created_at: datetime = Field(default_factory=datetime.now)


# Social Proof & Reviews
class SocialReview(BaseModel):
    id: Optional[str] = None
    user_id: str
    username: str
    user_avatar: str
    product_id: str
    rating: float  # 1-5 stars
    review_text: str
    media_attachments: List[str] = []
    verified_purchase: bool = False
    helpful_count: int = 0
    report_count: int = 0
    response_from_seller: Optional[str] = None
    tags: List[str] = []  # quality, shipping, value, etc.
    created_at: datetime = Field(default_factory=datetime.now)


class SocialProof(BaseModel):
    product_id: str
    total_purchases: int = 0
    recent_purchases_24h: int = 0
    average_rating: float = 0.0
    review_count: int = 0
    social_mentions: int = 0
    trending_score: float = 0.0
    celebrity_endorsements: List[str] = []
    influencer_recommendations: List[str] = []
    user_photos_count: int = 0
    wishlist_count: int = 0
    share_count: int = 0
    last_updated: datetime = Field(default_factory=datetime.now)


# Advanced Analytics & Attribution
class ConversionTracking(BaseModel):
    id: Optional[str] = None
    user_id: str
    session_id: str
    source_type: str  # influencer_post, ugc, group_purchase, ad
    source_id: str  # specific post/campaign/group ID
    product_id: str
    conversion_events: List[Dict[str, Any]] = []  # view, add_to_cart, purchase
    attribution_model: str = "first_click"
    revenue_attributed: float = 0.0
    commission_owed: float = 0.0
    conversion_path: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.now)


class InfluencerAnalytics(BaseModel):
    influencer_id: str
    period: str  # daily, weekly, monthly
    content_posted: int = 0
    total_views: int = 0
    total_engagement: int = 0
    engagement_rate: float = 0.0
    click_through_rate: float = 0.0
    conversion_rate: float = 0.0
    revenue_generated: float = 0.0
    commission_earned: float = 0.0
    top_performing_content: List[str] = []
    audience_insights: Dict[str, Any] = {}
    brand_collaborations: int = 0
    follower_growth: int = 0
    date: datetime = Field(default_factory=datetime.now)


class SocialCommerceMetrics(BaseModel):
    platform_metrics: Dict[str, Any] = {}
    content_metrics: Dict[str, Any] = {}
    influencer_metrics: Dict[str, Any] = {}
    user_engagement: Dict[str, Any] = {}
    revenue_attribution: Dict[str, Any] = {}
    social_proof_impact: Dict[str, Any] = {}
    generated_at: datetime = Field(default_factory=datetime.now)


# Creator Monetization
class CreatorMonetization(BaseModel):
    creator_id: str
    revenue_streams: Dict[str, float] = {}  # sponsored_posts, affiliate, tips, etc.
    total_earnings: float = 0.0
    pending_payments: float = 0.0
    payment_history: List[Dict[str, Any]] = []
    monetization_tools: List[str] = []
    subscriber_count: int = 0
    fan_support: float = 0.0
    merchandise_sales: float = 0.0
    live_stream_earnings: float = 0.0
    course_sales: float = 0.0


# Request/Response Models
class CreateShoppableContentRequest(BaseModel):
    content_type: ContentType
    title: str
    description: str
    media_urls: List[str]
    tagged_products: List[ProductTag] = []
    hashtags: List[str] = []
    location: Optional[str] = None
    is_sponsored: bool = False
    sponsor_brand: Optional[str] = None


class InfluencerSearchRequest(BaseModel):
    specialties: Optional[List[str]] = None
    min_followers: Optional[int] = None
    max_followers: Optional[int] = None
    engagement_rate_min: Optional[float] = None
    target_demographics: Optional[Dict[str, Any]] = None
    budget_range: Optional[Dict[str, float]] = None
    content_types: Optional[List[ContentType]] = None


class CampaignCreateRequest(BaseModel):
    campaign_name: str
    description: str
    campaign_type: str
    budget: float
    objectives: List[str]
    target_demographics: Dict[str, Any]
    content_requirements: Dict[str, Any]
    deliverables: List[Dict[str, Any]]
    timeline: Dict[str, str]  # ISO date strings


class GroupPurchaseRequest(BaseModel):
    group_id: str
    product_id: str
    minimum_participants: int
    maximum_participants: int
    group_price: float
    deadline: str  # ISO date string


# Social Feed Integration
class SocialFeedItem(BaseModel):
    id: str
    type: str  # shoppable_content, ugc, group_purchase, review
    content: Dict[str, Any]  # Flexible content structure
    creator_info: Dict[str, str]
    engagement_metrics: Dict[str, int]
    shopping_info: Dict[str, Any] = {}
    timestamp: datetime
    algorithm_score: float = 0.0


class PersonalizedFeed(BaseModel):
    user_id: str
    feed_items: List[SocialFeedItem] = []
    pagination_token: Optional[str] = None
    recommendation_reasons: Dict[str, str] = {}
    generated_at: datetime = Field(default_factory=datetime.now)