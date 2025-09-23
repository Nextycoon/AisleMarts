from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Union
from datetime import datetime
from enum import Enum

class AdPlatform(str, Enum):
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    TIKTOK = "tiktok"
    YOUTUBE = "youtube"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    PINTEREST = "pinterest"
    SNAPCHAT = "snapchat"

class CampaignObjective(str, Enum):
    AWARENESS = "awareness"
    TRAFFIC = "traffic"
    ENGAGEMENT = "engagement"
    LEADS = "leads"
    SALES = "sales"
    APP_INSTALLS = "app_installs"
    VIDEO_VIEWS = "video_views"
    BRAND_AWARENESS = "brand_awareness"

class AdFormat(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    CAROUSEL = "carousel"
    COLLECTION = "collection"
    STORY = "story"
    REEL = "reel"
    SHOPPING = "shopping"
    AR_FILTER = "ar_filter"
    SPONSORED_POST = "sponsored_post"

class CampaignStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Campaign Management Models
class SocialMediaCampaign(BaseModel):
    campaign_id: str = Field(..., description="Unique campaign identifier")
    campaign_name: str = Field(..., description="Campaign name")
    platform: AdPlatform = Field(..., description="Advertising platform")
    objective: CampaignObjective = Field(..., description="Campaign objective")
    status: CampaignStatus = Field(default=CampaignStatus.DRAFT)
    
    # Budget & Bidding
    daily_budget: float = Field(..., description="Daily budget in USD")
    total_budget: Optional[float] = Field(None, description="Total campaign budget")
    bid_strategy: str = Field(default="auto", description="Bidding strategy")
    
    # Targeting
    target_audience: Dict = Field(default_factory=dict, description="Audience targeting parameters")
    demographics: Dict = Field(default_factory=dict, description="Demographic targeting")
    interests: List[str] = Field(default_factory=list, description="Interest targeting")
    behaviors: List[str] = Field(default_factory=list, description="Behavior targeting")
    custom_audiences: List[str] = Field(default_factory=list, description="Custom audience IDs")
    lookalike_audiences: List[str] = Field(default_factory=list, description="Lookalike audience IDs")
    
    # Creative
    ad_format: AdFormat = Field(..., description="Ad format type")
    creative_assets: Dict = Field(default_factory=dict, description="Creative assets (images, videos, text)")
    call_to_action: str = Field(..., description="Call-to-action button")
    
    # Scheduling
    start_date: datetime = Field(..., description="Campaign start date")
    end_date: Optional[datetime] = Field(None, description="Campaign end date")
    
    # Tracking
    tracking_pixels: List[str] = Field(default_factory=list, description="Tracking pixel IDs")
    utm_parameters: Dict = Field(default_factory=dict, description="UTM tracking parameters")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(..., description="Creator user ID")
    
class CampaignPerformance(BaseModel):
    campaign_id: str = Field(..., description="Campaign identifier")
    platform: AdPlatform = Field(..., description="Platform")
    date: datetime = Field(..., description="Performance date")
    
    # Reach & Impressions
    impressions: int = Field(default=0, description="Total impressions")
    reach: int = Field(default=0, description="Unique reach")
    frequency: float = Field(default=0.0, description="Average frequency")
    
    # Engagement
    clicks: int = Field(default=0, description="Total clicks")
    ctr: float = Field(default=0.0, description="Click-through rate")
    engagements: int = Field(default=0, description="Total engagements")
    engagement_rate: float = Field(default=0.0, description="Engagement rate")
    
    # Conversions
    conversions: int = Field(default=0, description="Total conversions")
    conversion_rate: float = Field(default=0.0, description="Conversion rate")
    cost_per_conversion: float = Field(default=0.0, description="Cost per conversion")
    
    # Costs & Revenue
    spend: float = Field(default=0.0, description="Total spend in USD")
    cpm: float = Field(default=0.0, description="Cost per mille")
    cpc: float = Field(default=0.0, description="Cost per click")
    revenue: float = Field(default=0.0, description="Attributed revenue")
    roas: float = Field(default=0.0, description="Return on ad spend")
    
    # Video Metrics (if applicable)
    video_views: int = Field(default=0, description="Video views")
    video_completion_rate: float = Field(default=0.0, description="Video completion rate")
    
    # Platform-specific metrics
    platform_metrics: Dict = Field(default_factory=dict, description="Platform-specific metrics")

# Creator Economy Models
class InfluencerTier(str, Enum):
    NANO = "nano"          # 1K-10K followers
    MICRO = "micro"        # 10K-100K followers
    MACRO = "macro"        # 100K-1M followers
    MEGA = "mega"          # 1M+ followers
    CELEBRITY = "celebrity" # 10M+ followers

class CollaborationType(str, Enum):
    SPONSORED_POST = "sponsored_post"
    PRODUCT_REVIEW = "product_review"
    BRAND_AMBASSADOR = "brand_ambassador"
    AFFILIATE = "affiliate"
    UGC_CREATION = "ugc_creation"
    LIVE_STREAM = "live_stream"
    STORY_TAKEOVER = "story_takeover"

class Influencer(BaseModel):
    influencer_id: str = Field(..., description="Unique influencer identifier")
    username: str = Field(..., description="Social media username")
    platform: AdPlatform = Field(..., description="Primary platform")
    
    # Profile Info
    full_name: str = Field(..., description="Full name")
    bio: str = Field(default="", description="Bio description")
    profile_image: str = Field(default="", description="Profile image URL")
    
    # Audience Metrics
    followers_count: int = Field(..., description="Total followers")
    engagement_rate: float = Field(..., description="Average engagement rate")
    tier: InfluencerTier = Field(..., description="Influencer tier")
    
    # Demographics
    audience_demographics: Dict = Field(default_factory=dict, description="Audience demographics")
    top_locations: List[str] = Field(default_factory=list, description="Top audience locations")
    audience_age_groups: Dict = Field(default_factory=dict, description="Audience age distribution")
    
    # Content Categories
    content_categories: List[str] = Field(default_factory=list, description="Content categories/niches")
    brand_affinity: List[str] = Field(default_factory=list, description="Brand affinity scores")
    
    # Rates & Performance
    rate_per_post: float = Field(..., description="Rate per post in USD")
    rate_per_story: float = Field(default=0.0, description="Rate per story in USD")
    rate_per_video: float = Field(default=0.0, description="Rate per video in USD")
    average_cpm: float = Field(default=0.0, description="Average CPM")
    
    # Contact & Status
    email: str = Field(..., description="Contact email")
    phone: Optional[str] = Field(None, description="Phone number")
    status: str = Field(default="active", description="Account status")
    verified: bool = Field(default=False, description="Verification status")
    
    # Performance History
    total_campaigns: int = Field(default=0, description="Total campaigns completed")
    average_performance_score: float = Field(default=0.0, description="Average performance score")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InfluencerCampaign(BaseModel):
    campaign_id: str = Field(..., description="Unique campaign identifier")
    influencer_id: str = Field(..., description="Influencer ID")
    brand_campaign_id: Optional[str] = Field(None, description="Associated brand campaign ID")
    
    # Campaign Details
    campaign_name: str = Field(..., description="Campaign name")
    collaboration_type: CollaborationType = Field(..., description="Type of collaboration")
    platform: AdPlatform = Field(..., description="Platform for content")
    
    # Content Requirements
    content_requirements: Dict = Field(default_factory=dict, description="Content specifications")
    deliverables: List[str] = Field(default_factory=list, description="Required deliverables")
    hashtags: List[str] = Field(default_factory=list, description="Required hashtags")
    mentions: List[str] = Field(default_factory=list, description="Required mentions")
    
    # Compensation
    compensation_amount: float = Field(..., description="Total compensation in USD")
    compensation_type: str = Field(default="fixed", description="Compensation type (fixed, performance, hybrid)")
    revenue_share_percentage: float = Field(default=0.0, description="Revenue share percentage")
    bonus_thresholds: Dict = Field(default_factory=dict, description="Performance bonus thresholds")
    
    # Timeline
    brief_date: datetime = Field(..., description="Campaign brief date")
    content_due_date: datetime = Field(..., description="Content submission deadline")
    publish_date: datetime = Field(..., description="Content publish date")
    campaign_end_date: datetime = Field(..., description="Campaign end date")
    
    # Performance Tracking
    target_impressions: int = Field(default=0, description="Target impressions")
    target_engagement: int = Field(default=0, description="Target engagement")
    target_conversions: int = Field(default=0, description="Target conversions")
    
    # Status & Approval
    status: str = Field(default="draft", description="Campaign status")
    content_approval_status: str = Field(default="pending", description="Content approval status")
    content_urls: List[str] = Field(default_factory=list, description="Published content URLs")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InfluencerPerformance(BaseModel):
    campaign_id: str = Field(..., description="Campaign ID")
    influencer_id: str = Field(..., description="Influencer ID")
    platform: AdPlatform = Field(..., description="Platform")
    content_url: str = Field(..., description="Content URL")
    
    # Performance Metrics
    impressions: int = Field(default=0, description="Total impressions")
    reach: int = Field(default=0, description="Unique reach")
    likes: int = Field(default=0, description="Total likes")
    comments: int = Field(default=0, description="Total comments")
    shares: int = Field(default=0, description="Total shares")
    saves: int = Field(default=0, description="Total saves")
    
    # Engagement Calculations
    engagement_rate: float = Field(default=0.0, description="Engagement rate")
    cpm: float = Field(default=0.0, description="Cost per mille")
    cpe: float = Field(default=0.0, description="Cost per engagement")
    
    # Conversion Tracking
    clicks: int = Field(default=0, description="Total clicks")
    conversions: int = Field(default=0, description="Total conversions")
    conversion_rate: float = Field(default=0.0, description="Conversion rate")
    revenue_generated: float = Field(default=0.0, description="Revenue attributed to content")
    
    # Sentiment Analysis
    sentiment_score: float = Field(default=0.0, description="Content sentiment score")
    brand_mention_sentiment: float = Field(default=0.0, description="Brand mention sentiment")
    
    # Performance Date
    performance_date: datetime = Field(default_factory=datetime.utcnow)

# AI Optimization Models
class OptimizationRecommendation(BaseModel):
    recommendation_id: str = Field(..., description="Unique recommendation ID")
    campaign_id: str = Field(..., description="Target campaign ID")
    recommendation_type: str = Field(..., description="Type of recommendation")
    
    # Recommendation Details
    title: str = Field(..., description="Recommendation title")
    description: str = Field(..., description="Detailed description")
    predicted_impact: Dict = Field(default_factory=dict, description="Predicted impact metrics")
    confidence_score: float = Field(..., description="AI confidence score (0-1)")
    
    # Implementation
    action_required: str = Field(..., description="Required action")
    implementation_difficulty: str = Field(default="easy", description="Implementation difficulty")
    estimated_impact_percentage: float = Field(..., description="Estimated performance improvement %")
    
    # Targeting & Creative Suggestions
    suggested_audiences: List[Dict] = Field(default_factory=list, description="Suggested audience segments")
    suggested_creatives: List[Dict] = Field(default_factory=list, description="Suggested creative elements")
    suggested_bidding: Dict = Field(default_factory=dict, description="Suggested bidding strategies")
    
    # Priority & Status
    priority: str = Field(default="medium", description="Recommendation priority")
    status: str = Field(default="pending", description="Implementation status")
    applied_at: Optional[datetime] = Field(None, description="Application timestamp")
    
    # Results Tracking
    performance_before: Dict = Field(default_factory=dict, description="Performance before implementation")
    performance_after: Dict = Field(default_factory=dict, description="Performance after implementation")
    actual_impact: float = Field(default=0.0, description="Actual impact achieved")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(None, description="Recommendation expiry")

# Cross-Platform Analytics Models
class CrossPlatformInsight(BaseModel):
    insight_id: str = Field(..., description="Unique insight identifier")
    insight_type: str = Field(..., description="Type of insight")
    
    # Scope
    platforms: List[AdPlatform] = Field(..., description="Platforms included in analysis")
    date_range_start: datetime = Field(..., description="Analysis start date")
    date_range_end: datetime = Field(..., description="Analysis end date")
    
    # Key Findings
    title: str = Field(..., description="Insight title")
    summary: str = Field(..., description="Insight summary")
    key_metrics: Dict = Field(default_factory=dict, description="Key performance metrics")
    
    # Cross-Platform Comparisons
    platform_performance: Dict[str, Dict] = Field(default_factory=dict, description="Performance by platform")
    audience_overlap: Dict = Field(default_factory=dict, description="Audience overlap analysis")
    optimal_budget_allocation: Dict = Field(default_factory=dict, description="Recommended budget allocation")
    
    # Recommendations
    recommendations: List[str] = Field(default_factory=list, description="Action recommendations")
    priority_actions: List[str] = Field(default_factory=list, description="Priority actions")
    
    # Impact Assessment
    potential_improvement: Dict = Field(default_factory=dict, description="Potential improvement metrics")
    confidence_level: float = Field(..., description="Confidence in recommendations")
    
    # Metadata
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    generated_by: str = Field(default="ai_system", description="Generator (ai_system, user, etc.)")

# Platform Integration Models
class PlatformIntegration(BaseModel):
    integration_id: str = Field(..., description="Integration identifier")
    platform: AdPlatform = Field(..., description="Platform")
    
    # Authentication
    access_token: str = Field(..., description="Platform access token")
    refresh_token: Optional[str] = Field(None, description="Platform refresh token")
    token_expires_at: Optional[datetime] = Field(None, description="Token expiry")
    
    # Account Information
    platform_account_id: str = Field(..., description="Platform account ID")
    account_name: str = Field(..., description="Account name")
    account_type: str = Field(..., description="Account type (personal, business, etc.)")
    
    # Permissions
    granted_permissions: List[str] = Field(default_factory=list, description="Granted permissions")
    required_permissions: List[str] = Field(default_factory=list, description="Required permissions")
    
    # Sync Status
    last_sync_at: Optional[datetime] = Field(None, description="Last successful sync")
    sync_status: str = Field(default="active", description="Sync status")
    sync_errors: List[str] = Field(default_factory=list, description="Recent sync errors")
    
    # Metadata
    connected_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    connected_by: str = Field(..., description="User who connected the integration")

# Audience Management Models
class AudienceSegment(BaseModel):
    segment_id: str = Field(..., description="Unique segment identifier")
    segment_name: str = Field(..., description="Segment name")
    segment_type: str = Field(..., description="Segment type (custom, lookalike, interest, etc.)")
    
    # Targeting Criteria
    demographics: Dict = Field(default_factory=dict, description="Demographic criteria")
    interests: List[str] = Field(default_factory=list, description="Interest targeting")
    behaviors: List[str] = Field(default_factory=list, description="Behavior targeting")
    geo_locations: List[str] = Field(default_factory=list, description="Geographic targeting")
    
    # Platform Availability
    available_platforms: List[AdPlatform] = Field(default_factory=list, description="Available on platforms")
    platform_audience_ids: Dict[str, str] = Field(default_factory=dict, description="Platform-specific audience IDs")
    
    # Audience Metrics
    estimated_size: int = Field(default=0, description="Estimated audience size")
    quality_score: float = Field(default=0.0, description="Audience quality score")
    overlap_audiences: Dict = Field(default_factory=dict, description="Overlap with other segments")
    
    # Performance History
    campaigns_used: List[str] = Field(default_factory=list, description="Campaigns that used this segment")
    average_performance: Dict = Field(default_factory=dict, description="Average performance metrics")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(..., description="Creator user ID")