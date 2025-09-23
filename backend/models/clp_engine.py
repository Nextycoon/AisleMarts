from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Union, Any
from datetime import datetime
from enum import Enum

class ContentType(str, Enum):
    VIDEO = "video"
    IMAGE = "image"
    STORY = "story"
    REEL = "reel"
    LIVE_STREAM = "live_stream"
    CAROUSEL = "carousel"
    PRODUCT_SHOWCASE = "product_showcase"
    USER_GENERATED = "user_generated"
    INFLUENCER_POST = "influencer_post"

class EngagementAction(str, Enum):
    VIEW = "view"
    LIKE = "like"
    COMMENT = "comment"
    SHARE = "share"
    SAVE = "save"
    CLICK = "click"
    SWIPE = "swipe"
    TAP = "tap"
    HOLD = "hold"
    SCROLL = "scroll"

class PurchaseStage(str, Enum):
    AWARENESS = "awareness"
    INTEREST = "interest"
    CONSIDERATION = "consideration"
    INTENT = "intent"
    PURCHASE = "purchase"
    RETENTION = "retention"
    ADVOCACY = "advocacy"

class ContentTrigger(str, Enum):
    TRENDING = "trending"
    PERSONALIZED = "personalized"
    SOCIAL_PROOF = "social_proof"
    SCARCITY = "scarcity"
    URGENCY = "urgency"
    REWARD = "reward"
    GAMIFICATION = "gamification"
    DISCOVERY = "discovery"

# CLP Core Models
class ContentEngagement(BaseModel):
    engagement_id: str = Field(..., description="Unique engagement identifier")
    content_id: str = Field(..., description="Content identifier")
    user_id: str = Field(..., description="User identifier")
    
    # Engagement Details
    action: EngagementAction = Field(..., description="Type of engagement action")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    duration_seconds: float = Field(default=0.0, description="Engagement duration")
    engagement_depth: float = Field(default=0.0, description="Engagement intensity (0-1)")
    
    # Context
    device_type: str = Field(default="mobile", description="Device type")
    platform: str = Field(default="aislemarts", description="Platform")
    location: Optional[Dict] = Field(None, description="User location context")
    
    # Social Context
    referrer_type: str = Field(default="organic", description="How user found content")
    social_context: Dict = Field(default_factory=dict, description="Social proof context")
    
    # Behavioral Data
    previous_actions: List[str] = Field(default_factory=list, description="Previous user actions")
    session_context: Dict = Field(default_factory=dict, description="Current session data")
    
    # AI Insights
    engagement_score: float = Field(default=0.0, description="AI-calculated engagement quality")
    purchase_intent_score: float = Field(default=0.0, description="Predicted purchase likelihood")
    content_resonance: float = Field(default=0.0, description="Content-user match score")

class ContentItem(BaseModel):
    content_id: str = Field(..., description="Unique content identifier")
    content_type: ContentType = Field(..., description="Type of content")
    
    # Content Metadata
    title: str = Field(..., description="Content title")
    description: str = Field(default="", description="Content description")
    creator_id: str = Field(..., description="Content creator ID")
    creator_type: str = Field(default="user", description="Creator type (user, brand, influencer)")
    
    # Media Assets
    media_urls: List[str] = Field(default_factory=list, description="Media file URLs")
    thumbnail_url: str = Field(default="", description="Thumbnail image URL")
    duration_seconds: Optional[float] = Field(None, description="Content duration")
    
    # Product Integration
    featured_products: List[str] = Field(default_factory=list, description="Featured product IDs")
    shopping_tags: List[Dict] = Field(default_factory=list, description="Shoppable product tags")
    product_placement_score: float = Field(default=0.0, description="Product integration quality")
    
    # Content Optimization
    content_triggers: List[ContentTrigger] = Field(default_factory=list, description="Psychological triggers")
    target_audience: Dict = Field(default_factory=dict, description="Target audience data")
    optimization_score: float = Field(default=0.0, description="Content optimization rating")
    
    # Performance Metrics
    view_count: int = Field(default=0, description="Total views")
    engagement_rate: float = Field(default=0.0, description="Overall engagement rate")
    conversion_rate: float = Field(default=0.0, description="Content to purchase conversion")
    virality_score: float = Field(default=0.0, description="Viral potential")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = Field(None, description="Publication timestamp")

class CLPConversion(BaseModel):
    conversion_id: str = Field(..., description="Unique conversion identifier")
    user_id: str = Field(..., description="User identifier")
    content_id: str = Field(..., description="Source content ID")
    
    # Conversion Journey
    journey_stages: List[PurchaseStage] = Field(default_factory=list, description="Purchase journey stages")
    touchpoints: List[Dict] = Field(default_factory=list, description="All touchpoints in journey")
    conversion_path: List[str] = Field(default_factory=list, description="Content IDs in conversion path")
    
    # Timing
    first_exposure: datetime = Field(..., description="First content exposure")
    conversion_time: datetime = Field(default_factory=datetime.utcnow)
    time_to_conversion: float = Field(..., description="Time from exposure to conversion (seconds)")
    
    # Purchase Details
    product_ids: List[str] = Field(..., description="Purchased product IDs")
    order_value: float = Field(..., description="Total order value")
    profit_margin: float = Field(default=0.0, description="Profit margin percentage")
    
    # Attribution
    primary_content_id: str = Field(..., description="Main converting content")
    attribution_model: str = Field(default="last_click", description="Attribution model used")
    content_contribution_scores: Dict[str, float] = Field(default_factory=dict, description="Content contribution weights")
    
    # Quality Metrics
    conversion_confidence: float = Field(default=0.0, description="Confidence in attribution")
    customer_lifetime_value: float = Field(default=0.0, description="Predicted CLV")
    repeat_purchase_probability: float = Field(default=0.0, description="Repeat purchase likelihood")

class CLPOptimization(BaseModel):
    optimization_id: str = Field(..., description="Unique optimization identifier")
    content_id: str = Field(..., description="Target content ID")
    
    # Optimization Type
    optimization_type: str = Field(..., description="Type of optimization")
    optimization_goal: str = Field(..., description="Optimization objective")
    
    # A/B Testing
    variant_id: str = Field(..., description="Optimization variant ID")
    test_group: str = Field(..., description="Test group (control/variant)")
    test_duration: int = Field(default=7, description="Test duration in days")
    
    # Performance Improvements
    baseline_metrics: Dict = Field(default_factory=dict, description="Pre-optimization metrics")
    current_metrics: Dict = Field(default_factory=dict, description="Current performance metrics")
    improvement_percentage: float = Field(default=0.0, description="Performance improvement %")
    
    # AI Recommendations
    ai_suggestions: List[Dict] = Field(default_factory=list, description="AI optimization suggestions")
    implemented_changes: List[str] = Field(default_factory=list, description="Applied optimizations")
    pending_recommendations: List[str] = Field(default_factory=list, description="Pending optimizations")
    
    # Results
    statistical_significance: float = Field(default=0.0, description="Statistical confidence")
    roi_impact: float = Field(default=0.0, description="ROI impact of optimization")
    user_experience_score: float = Field(default=0.0, description="UX impact score")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="active", description="Optimization status")

class InfiniteDiscoveryEngine(BaseModel):
    engine_id: str = Field(..., description="Engine instance identifier")
    user_id: str = Field(..., description="User identifier")
    
    # Personalization Profile
    user_preferences: Dict = Field(default_factory=dict, description="User preference profile")
    behavior_patterns: Dict = Field(default_factory=dict, description="Behavioral patterns")
    interest_graph: Dict = Field(default_factory=dict, description="Interest relationship graph")
    
    # Real-time Context
    current_mood: str = Field(default="neutral", description="Current user mood")
    session_intent: str = Field(default="browse", description="Current session intent")
    contextual_factors: Dict = Field(default_factory=dict, description="Contextual variables")
    
    # Discovery Algorithm
    exploration_ratio: float = Field(default=0.3, description="Exploration vs exploitation ratio")
    novelty_preference: float = Field(default=0.5, description="User's novelty preference")
    serendipity_factor: float = Field(default=0.2, description="Serendipitous discovery factor")
    
    # Feed Composition
    content_mix_ratios: Dict = Field(default_factory=dict, description="Content type distribution")
    engagement_thresholds: Dict = Field(default_factory=dict, description="Engagement quality thresholds")
    content_freshness_weights: Dict = Field(default_factory=dict, description="Content freshness priorities")
    
    # Performance Tracking
    feed_performance_score: float = Field(default=0.0, description="Overall feed performance")
    user_satisfaction_score: float = Field(default=0.0, description="User satisfaction rating")
    engagement_sustainability: float = Field(default=0.0, description="Long-term engagement health")
    
    # AI Learning
    learning_rate: float = Field(default=0.1, description="Algorithm learning rate")
    model_version: str = Field(default="1.0", description="AI model version")
    last_model_update: datetime = Field(default_factory=datetime.utcnow)

class CLPAnalytics(BaseModel):
    analytics_id: str = Field(..., description="Analytics session identifier")
    time_period: Dict = Field(..., description="Analysis time period")
    
    # Content Performance
    top_performing_content: List[Dict] = Field(default_factory=list, description="Best performing content")
    content_performance_trends: Dict = Field(default_factory=dict, description="Performance trend analysis")
    content_optimization_opportunities: List[Dict] = Field(default_factory=list, description="Optimization opportunities")
    
    # User Journey Analytics
    conversion_funnels: Dict = Field(default_factory=dict, description="Conversion funnel analysis")
    user_journey_patterns: List[Dict] = Field(default_factory=list, description="Common user journeys")
    drop_off_analysis: Dict = Field(default_factory=dict, description="Journey drop-off points")
    
    # Revenue Attribution
    revenue_by_content_type: Dict = Field(default_factory=dict, description="Revenue breakdown by content")
    top_revenue_creators: List[Dict] = Field(default_factory=list, description="Top revenue-generating creators")
    clp_efficiency_scores: Dict = Field(default_factory=dict, description="CLP efficiency metrics")
    
    # Engagement Insights
    engagement_pattern_analysis: Dict = Field(default_factory=dict, description="Engagement pattern insights")
    viral_content_characteristics: Dict = Field(default_factory=dict, description="Viral content analysis")
    user_retention_impact: Dict = Field(default_factory=dict, description="Content impact on retention")
    
    # Predictive Analytics
    trend_predictions: List[Dict] = Field(default_factory=list, description="Predicted content trends")
    conversion_forecasts: Dict = Field(default_factory=dict, description="Conversion rate forecasts")
    revenue_projections: Dict = Field(default_factory=dict, description="Revenue projections")
    
    # AI Insights
    ai_insights: List[Dict] = Field(default_factory=list, description="AI-generated insights")
    recommendation_effectiveness: Dict = Field(default_factory=dict, description="Recommendation system performance")
    optimization_impact_analysis: Dict = Field(default_factory=dict, description="Optimization impact tracking")
    
    # Metadata
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    generated_by: str = Field(default="ai_system", description="Analytics generator")
    confidence_level: float = Field(default=0.0, description="Analysis confidence score")

class GamificationEngine(BaseModel):
    gamification_id: str = Field(..., description="Gamification instance identifier")
    user_id: str = Field(..., description="User identifier")
    
    # User Progress
    user_level: int = Field(default=1, description="Current user level")
    experience_points: int = Field(default=0, description="Total experience points")
    points_to_next_level: int = Field(default=100, description="Points needed for next level")
    
    # Achievement System
    earned_badges: List[Dict] = Field(default_factory=list, description="Earned achievement badges")
    active_challenges: List[Dict] = Field(default_factory=list, description="Current active challenges")
    completed_challenges: List[Dict] = Field(default_factory=list, description="Completed challenges")
    
    # Streaks & Consistency
    current_streaks: Dict = Field(default_factory=dict, description="Active streaks")
    longest_streaks: Dict = Field(default_factory=dict, description="Record streaks")
    consistency_score: float = Field(default=0.0, description="User consistency rating")
    
    # Rewards System
    available_rewards: List[Dict] = Field(default_factory=list, description="Available rewards")
    claimed_rewards: List[Dict] = Field(default_factory=list, description="Claimed rewards history")
    reward_points_balance: int = Field(default=0, description="Current reward points balance")
    
    # Social Gaming
    leaderboard_position: int = Field(default=0, description="Current leaderboard rank")
    friend_challenges: List[Dict] = Field(default_factory=list, description="Friend-based challenges")
    team_memberships: List[str] = Field(default_factory=list, description="Team/group memberships")
    
    # Engagement Mechanics
    daily_login_streak: int = Field(default=0, description="Consecutive daily logins")
    purchase_milestone_progress: Dict = Field(default_factory=dict, description="Purchase milestone tracking")
    content_interaction_goals: Dict = Field(default_factory=dict, description="Content engagement goals")
    
    # Personalization
    preferred_challenge_types: List[str] = Field(default_factory=list, description="User's preferred challenges")
    motivation_profile: Dict = Field(default_factory=dict, description="User motivation analysis")
    engagement_preferences: Dict = Field(default_factory=dict, description="Engagement style preferences")
    
    # Performance Tracking
    engagement_improvement: float = Field(default=0.0, description="Engagement improvement due to gamification")
    purchase_frequency_impact: float = Field(default=0.0, description="Purchase frequency improvement")
    retention_impact: float = Field(default=0.0, description="Retention improvement")
    
    # Metadata
    gamification_start_date: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    engagement_tier: str = Field(default="bronze", description="Current engagement tier")