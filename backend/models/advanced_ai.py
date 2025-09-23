from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import json


class AIModelType(str, Enum):
    VISUAL_RECOGNITION = "visual_recognition"
    SENTIMENT_ANALYSIS = "sentiment_analysis"
    TREND_PREDICTION = "trend_prediction"
    BEHAVIOR_ANALYSIS = "behavior_analysis"
    EMOTIONAL_INTELLIGENCE = "emotional_intelligence"
    CONTENT_GENERATION = "content_generation"
    PRICE_OPTIMIZATION = "price_optimization"


class PersonalizationLevel(str, Enum):
    BASIC = "basic"
    ADVANCED = "advanced"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class MoodCategory(str, Enum):
    HAPPY = "happy"
    EXCITED = "excited"
    RELAXED = "relaxed"
    STRESSED = "stressed"
    INSPIRED = "inspired"
    NOSTALGIC = "nostalgic"
    ADVENTUROUS = "adventurous"
    ROMANTIC = "romantic"


# Advanced AI Models
class VisualProductRecognition(BaseModel):
    id: Optional[str] = None
    image_url: str
    detected_products: List[Dict[str, Any]] = []
    confidence_scores: Dict[str, float] = {}
    extracted_features: Dict[str, Any] = {}
    brand_recognition: Dict[str, float] = {}
    style_attributes: Dict[str, str] = {}
    color_palette: List[str] = []
    material_detection: Dict[str, float] = {}
    occasion_suitability: Dict[str, float] = {}
    price_estimation: Optional[Dict[str, float]] = None
    similar_products: List[str] = []
    processed_at: datetime = Field(default_factory=datetime.now)


class UserBehaviorAnalysis(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    browsing_patterns: Dict[str, Any] = {}
    interaction_timeline: List[Dict[str, Any]] = []
    purchase_probability: float = 0.0
    engagement_score: float = 0.0
    attention_span: float = 0.0  # seconds
    scroll_velocity: float = 0.0
    click_through_rate: float = 0.0
    conversion_likelihood: Dict[str, float] = {}
    preferred_content_types: List[str] = []
    peak_activity_hours: List[int] = []
    device_preferences: Dict[str, float] = {}
    social_influence_susceptibility: float = 0.0
    price_sensitivity: float = 0.0
    brand_loyalty_score: Dict[str, float] = {}
    impulse_buying_tendency: float = 0.0
    research_behavior: Dict[str, Any] = {}


class EmotionalIntelligence(BaseModel):
    user_id: str
    current_mood: MoodCategory
    mood_confidence: float = 0.0
    emotional_triggers: List[str] = []
    mood_history: List[Dict[str, Any]] = []
    emotional_shopping_patterns: Dict[str, Any] = {}
    stress_indicators: List[str] = []
    happiness_factors: List[str] = []
    mood_based_recommendations: List[str] = []
    emotional_response_to_content: Dict[str, float] = {}
    comfort_zone_products: List[str] = []
    adventure_seeking_score: float = 0.0
    social_validation_need: float = 0.0
    self_care_indicators: Dict[str, Any] = {}


class TrendPrediction(BaseModel):
    id: Optional[str] = None
    trend_category: str
    trend_name: str
    prediction_confidence: float = 0.0
    emergence_timeline: Dict[str, datetime] = {}
    peak_prediction: Optional[datetime] = None
    decline_prediction: Optional[datetime] = None
    geographic_spread: Dict[str, float] = {}
    demographic_appeal: Dict[str, float] = {}
    related_trends: List[str] = []
    driving_factors: List[str] = []
    social_media_momentum: Dict[str, float] = {}
    influencer_adoption: List[Dict[str, Any]] = []
    commercial_potential: Dict[str, float] = {}
    seasonal_patterns: Dict[str, Any] = {}
    viral_potential_score: float = 0.0
    sustainability_forecast: Dict[str, float] = {}


class ContentViralityPrediction(BaseModel):
    content_id: str
    content_type: str
    virality_score: float = 0.0
    predicted_reach: int = 0
    predicted_engagement: int = 0
    optimal_posting_time: Optional[datetime] = None
    target_demographics: Dict[str, Any] = {}  # Flexible structure for any demographic data
    hashtag_recommendations: List[str] = []
    collaboration_suggestions: List[str] = []
    content_optimization_tips: List[str] = []
    risk_factors: List[str] = []
    monetization_potential: float = 0.0


class PersonalizedRecommendation(BaseModel):
    user_id: str
    recommendation_type: str  # product, content, influencer, brand
    item_id: str
    relevance_score: float = 0.0
    confidence_level: float = 0.0
    reasoning: List[str] = []
    personalization_factors: Dict[str, float] = {}
    timing_optimization: Dict[str, Any] = {}
    context_awareness: Dict[str, Any] = {}
    cross_category_influences: Dict[str, float] = {}
    social_proof_factors: Dict[str, float] = {}
    novelty_score: float = 0.0
    serendipity_factor: float = 0.0
    expected_engagement: float = 0.0
    predicted_satisfaction: float = 0.0


class MarketIntelligence(BaseModel):
    category: str
    subcategory: Optional[str] = None
    market_size: Dict[str, float] = {}
    growth_rate: float = 0.0
    competitive_landscape: Dict[str, Any] = {}
    price_trends: Dict[str, Any] = {}
    demand_patterns: Dict[str, Any] = {}
    seasonal_variations: Dict[str, Any] = {}
    consumer_sentiment: Dict[str, float] = {}
    innovation_opportunities: List[str] = []
    threat_analysis: List[str] = []
    market_saturation_level: float = 0.0
    entry_barriers: Dict[str, float] = {}
    key_success_factors: List[str] = []


class SmartPricingOptimization(BaseModel):
    product_id: str
    seller_id: str
    current_price: float
    optimal_price_range: Dict[str, float] = {}
    price_elasticity: float = 0.0
    competitive_pricing: Dict[str, float] = {}
    demand_based_pricing: Dict[str, float] = {}
    dynamic_pricing_triggers: List[Dict[str, Any]] = []
    personalized_pricing: Dict[str, float] = {}  # user_segment -> price
    promotional_recommendations: List[Dict[str, Any]] = []
    inventory_based_adjustments: Dict[str, float] = {}
    seasonal_price_patterns: Dict[str, Any] = {}
    profit_optimization: Dict[str, float] = {}


class AIContentGeneration(BaseModel):
    id: Optional[str] = None
    content_type: str  # post, video_script, product_description, ad_copy
    input_parameters: Dict[str, Any] = {}
    generated_content: Dict[str, Any] = {}
    style_preferences: Dict[str, Any] = {}
    target_audience: Dict[str, Any] = {}
    brand_voice: Dict[str, str] = {}
    performance_predictions: Dict[str, float] = {}
    optimization_suggestions: List[str] = []
    version_history: List[Dict[str, Any]] = []
    quality_score: float = 0.0
    originality_score: float = 0.0
    brand_alignment_score: float = 0.0


class CrossPlatformAnalytics(BaseModel):
    user_id: str
    platform_activity: Dict[str, Dict[str, Any]] = {}  # platform -> metrics
    cross_platform_behavior: Dict[str, Any] = {}
    influence_mapping: Dict[str, float] = {}
    content_performance_correlation: Dict[str, Any] = {}
    audience_overlap: Dict[str, float] = {}
    engagement_migration_patterns: Dict[str, Any] = {}
    platform_specific_preferences: Dict[str, Any] = {}
    optimal_content_distribution: Dict[str, float] = {}


class PredictiveUserLifecycle(BaseModel):
    user_id: str
    current_stage: str  # discovery, engagement, purchase, loyalty, advocacy, churn_risk
    stage_transition_probabilities: Dict[str, float] = {}
    lifetime_value_prediction: float = 0.0
    churn_risk_score: float = 0.0
    retention_strategies: List[Dict[str, Any]] = []
    engagement_optimization: Dict[str, Any] = {}
    personalized_journey_map: List[Dict[str, Any]] = []
    milestone_predictions: Dict[str, datetime] = {}
    intervention_recommendations: List[Dict[str, Any]] = []


class SentimentAnalysis(BaseModel):
    id: Optional[str] = None
    content_id: str
    content_type: str
    overall_sentiment: str  # positive, negative, neutral
    sentiment_confidence: float = 0.0
    emotion_breakdown: Dict[str, float] = {}
    topic_sentiment: Dict[str, Dict[str, float]] = {}
    brand_sentiment: Dict[str, float] = {}
    product_sentiment: Dict[str, float] = {}
    comparative_sentiment: Dict[str, float] = {}
    sentiment_trends: List[Dict[str, Any]] = []
    influence_factors: List[str] = []
    sentiment_drivers: Dict[str, float] = {}


class AIInsightEngine(BaseModel):
    insight_id: Optional[str] = None
    insight_type: str
    title: str
    description: str
    confidence_level: float = 0.0
    impact_score: float = 0.0
    actionability_score: float = 0.0
    supporting_data: Dict[str, Any] = {}
    recommendations: List[Dict[str, Any]] = []
    affected_stakeholders: List[str] = []
    implementation_complexity: str  # low, medium, high
    expected_outcomes: Dict[str, Any] = {}
    risk_assessment: Dict[str, float] = {}
    created_at: datetime = Field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None


# Request Models
class VisualRecognitionRequest(BaseModel):
    image_url: str
    analysis_depth: str = "standard"  # quick, standard, deep
    include_price_estimation: bool = True
    include_style_analysis: bool = True
    include_similar_products: bool = True


class PersonalizationRequest(BaseModel):
    user_id: str
    content_type: Optional[str] = None
    category: Optional[str] = None
    context: Dict[str, Any] = {}
    personalization_level: PersonalizationLevel = PersonalizationLevel.ADVANCED
    include_explanations: bool = True


class TrendAnalysisRequest(BaseModel):
    categories: List[str] = []
    time_horizon: str = "30d"  # 7d, 30d, 90d, 1y
    geographic_scope: List[str] = []
    include_predictions: bool = True
    confidence_threshold: float = 0.7


class BehaviorAnalysisRequest(BaseModel):
    user_id: str
    session_data: Dict[str, Any] = {}
    include_predictions: bool = True
    analysis_depth: str = "comprehensive"


class AIModelPerformance(BaseModel):
    model_type: AIModelType
    model_version: str
    accuracy_metrics: Dict[str, float] = {}
    performance_benchmarks: Dict[str, float] = {}
    training_data_stats: Dict[str, Any] = {}
    validation_results: Dict[str, Any] = {}
    deployment_status: str = "active"
    last_updated: datetime = Field(default_factory=datetime.now)
    next_training_scheduled: Optional[datetime] = None