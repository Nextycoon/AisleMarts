from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import json


class CommissionTier(str, Enum):
    BRONZE = "bronze"      # 0-10K GMV
    SILVER = "silver"      # 10K-100K GMV
    GOLD = "gold"          # 100K-1M GMV
    PLATINUM = "platinum"  # 1M+ GMV
    ENTERPRISE = "enterprise"  # Custom deals


class SubscriptionType(str, Enum):
    BASIC = "basic"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"
    CREATOR_PLUS = "creator_plus"
    SELLER_PRO = "seller_pro"


class AdFormat(str, Enum):
    NATIVE_FEED = "native_feed"
    STORY_AD = "story_ad"
    VIDEO_AD = "video_ad"
    SPONSORED_POST = "sponsored_post"
    BANNER = "banner"
    INTERSTITIAL = "interstitial"
    SHOPPABLE_AD = "shoppable_ad"


class PaymentMethod(str, Enum):
    CREDIT_CARD = "credit_card"
    PAYPAL = "paypal"
    APPLE_PAY = "apple_pay"
    GOOGLE_PAY = "google_pay"
    BANK_TRANSFER = "bank_transfer"
    CRYPTOCURRENCY = "cryptocurrency"
    AISLEPAY_WALLET = "aislepay_wallet"


class RevenueStream(str, Enum):
    TRANSACTION_COMMISSION = "transaction_commission"
    ADVERTISING_REVENUE = "advertising_revenue"
    SUBSCRIPTION_FEES = "subscription_fees"
    AFFILIATE_COMMISSIONS = "affiliate_commissions"
    VIRTUAL_GOODS = "virtual_goods"
    PREMIUM_FEATURES = "premium_features"
    MARKETPLACE_FEES = "marketplace_fees"
    DATA_INSIGHTS = "data_insights"


# Advanced Commission System
class DynamicCommissionStructure(BaseModel):
    id: Optional[str] = None
    seller_id: str
    current_tier: CommissionTier
    base_commission_rate: float = 0.05  # 5% default
    volume_based_rates: Dict[str, float] = {}  # GMV ranges -> rates
    category_multipliers: Dict[str, float] = {}  # Category -> multiplier
    performance_bonuses: Dict[str, float] = {}  # Metrics -> bonus rates
    seasonal_adjustments: Dict[str, float] = {}  # Season -> adjustment
    loyalty_discounts: Dict[str, float] = {}  # Years -> discount
    total_gmv: float = 0.0
    monthly_gmv: float = 0.0
    commission_earned_total: float = 0.0
    commission_earned_monthly: float = 0.0
    next_tier_threshold: float = 0.0
    effective_commission_rate: float = 0.0
    created_at: datetime = Field(default_factory=datetime.now)
    last_calculated: datetime = Field(default_factory=datetime.now)


class TransactionCommission(BaseModel):
    id: Optional[str] = None
    transaction_id: str
    seller_id: str
    buyer_id: str
    product_id: str
    gross_amount: float
    commission_rate: float
    commission_amount: float
    platform_fee: float = 0.0
    payment_processing_fee: float = 0.0
    net_seller_amount: float = 0.0
    commission_tier: CommissionTier
    category: str
    applied_bonuses: List[Dict[str, Any]] = []
    applied_discounts: List[Dict[str, Any]] = []
    referral_commission: Optional[Dict[str, float]] = None
    affiliate_commission: Optional[Dict[str, float]] = None
    created_at: datetime = Field(default_factory=datetime.now)


# Advanced Advertising Platform
class AdvertisingCampaign(BaseModel):
    id: Optional[str] = None
    advertiser_id: str
    campaign_name: str
    campaign_type: str  # brand_awareness, conversions, app_installs, traffic
    ad_formats: List[AdFormat] = []
    target_audience: Dict[str, Any] = {}
    budget_total: float = 0.0
    budget_daily: float = 0.0
    bid_strategy: str = "automatic"  # automatic, manual_cpc, manual_cpm
    bid_amount: float = 0.0
    start_date: datetime
    end_date: Optional[datetime] = None
    status: str = "draft"  # draft, active, paused, completed
    performance_metrics: Dict[str, Any] = {}
    creative_assets: List[Dict[str, Any]] = []
    placement_settings: Dict[str, Any] = {}
    frequency_capping: Dict[str, int] = {}
    created_at: datetime = Field(default_factory=datetime.now)


class AdPlacement(BaseModel):
    id: Optional[str] = None
    campaign_id: str
    ad_format: AdFormat
    placement_location: str  # feed, stories, search, profile
    priority_score: float = 0.0
    targeting_criteria: Dict[str, Any] = {}
    content_requirements: Dict[str, Any] = {}
    pricing_model: str = "cpm"  # cpm, cpc, cpa, fixed
    base_price: float = 0.0
    current_bid: float = 0.0
    impression_count: int = 0
    click_count: int = 0
    conversion_count: int = 0
    revenue_generated: float = 0.0
    ctr: float = 0.0  # click-through rate
    cpm: float = 0.0  # cost per mille
    cpc: float = 0.0  # cost per click
    cpa: float = 0.0  # cost per acquisition
    created_at: datetime = Field(default_factory=datetime.now)


class ProgrammaticAdBidding(BaseModel):
    auction_id: str
    ad_slot_id: str
    auction_type: str = "second_price"
    participating_campaigns: List[str] = []
    winning_bid: float = 0.0
    winning_campaign_id: str
    clearing_price: float = 0.0
    auction_duration_ms: float = 0.0
    user_profile: Dict[str, Any] = {}
    context: Dict[str, Any] = {}
    quality_score: float = 0.0
    relevance_score: float = 0.0
    expected_ctr: float = 0.0
    bid_adjustments: Dict[str, float] = {}
    auction_timestamp: datetime = Field(default_factory=datetime.now)


# Subscription & Premium Features
class SubscriptionPlan(BaseModel):
    id: Optional[str] = None
    plan_type: SubscriptionType
    name: str
    description: str
    price_monthly: float = 0.0
    price_yearly: float = 0.0
    currency: str = "USD"
    features: List[str] = []
    limitations: Dict[str, Any] = {}
    target_audience: str = "general"
    billing_cycle: str = "monthly"  # monthly, yearly, lifetime
    trial_period_days: int = 0
    is_active: bool = True
    tier_benefits: Dict[str, Any] = {}
    usage_limits: Dict[str, int] = {}
    priority_support: bool = False
    custom_branding: bool = False
    advanced_analytics: bool = False
    created_at: datetime = Field(default_factory=datetime.now)


class UserSubscription(BaseModel):
    id: Optional[str] = None
    user_id: str
    plan_id: str
    subscription_type: SubscriptionType
    status: str = "active"  # active, cancelled, expired, suspended
    start_date: datetime = Field(default_factory=datetime.now)
    end_date: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None
    billing_amount: float = 0.0
    billing_currency: str = "USD"
    payment_method: PaymentMethod
    auto_renewal: bool = True
    trial_end_date: Optional[datetime] = None
    cancellation_date: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    usage_statistics: Dict[str, Any] = {}
    feature_usage: Dict[str, int] = {}
    satisfaction_score: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.now)


# Affiliate & Referral Program
class AffiliateProgram(BaseModel):
    id: Optional[str] = None
    affiliate_id: str
    program_name: str
    commission_structure: Dict[str, float] = {}  # Product categories -> rates
    performance_tiers: Dict[str, Dict[str, float]] = {}
    cookie_duration_days: int = 30
    minimum_payout: float = 50.0
    payment_schedule: str = "monthly"  # weekly, bi-weekly, monthly
    promotional_materials: List[Dict[str, Any]] = []
    tracking_links: List[str] = []
    performance_metrics: Dict[str, Any] = {}
    total_referrals: int = 0
    total_conversions: int = 0
    total_commission_earned: float = 0.0
    pending_commission: float = 0.0
    paid_commission: float = 0.0
    conversion_rate: float = 0.0
    average_order_value: float = 0.0
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.now)


class ReferralTransaction(BaseModel):
    id: Optional[str] = None
    referrer_id: str
    referee_id: str
    referral_code: str
    transaction_id: str
    product_id: str
    sale_amount: float
    commission_rate: float
    commission_amount: float
    referrer_bonus: float = 0.0
    referee_bonus: float = 0.0
    conversion_timestamp: datetime = Field(default_factory=datetime.now)
    payout_status: str = "pending"  # pending, processed, paid
    tracking_source: str = "direct"
    campaign_id: Optional[str] = None
    attribution_model: str = "last_click"


# Virtual Goods & Digital Products
class VirtualGood(BaseModel):
    id: Optional[str] = None
    name: str
    category: str  # currency, cosmetic, functional, premium_feature
    description: str
    price_usd: float = 0.0
    price_tokens: int = 0  # Virtual currency price
    rarity: str = "common"  # common, rare, epic, legendary
    availability: str = "unlimited"  # unlimited, limited, seasonal, exclusive
    quantity_available: Optional[int] = None
    digital_assets: List[str] = []  # URLs to assets
    functionality: Dict[str, Any] = {}
    expiration_date: Optional[datetime] = None
    gift_eligible: bool = True
    tradeable: bool = False
    resellable: bool = False
    created_at: datetime = Field(default_factory=datetime.now)


class VirtualCurrency(BaseModel):
    id: Optional[str] = None
    currency_name: str = "AisleCoins"
    currency_symbol: str = "AC"
    exchange_rate_usd: float = 0.01  # 1 AC = $0.01
    user_id: str
    balance: int = 0
    total_purchased: int = 0
    total_earned: int = 0
    total_spent: int = 0
    transaction_history: List[Dict[str, Any]] = []
    earning_sources: Dict[str, int] = {}  # Source -> amount earned
    spending_categories: Dict[str, int] = {}  # Category -> amount spent
    last_transaction: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)


class VirtualGoodPurchase(BaseModel):
    id: Optional[str] = None
    user_id: str
    virtual_good_id: str
    quantity: int = 1
    unit_price_usd: float = 0.0
    unit_price_tokens: int = 0
    total_price_usd: float = 0.0
    total_price_tokens: int = 0
    payment_method: str = "virtual_currency"  # virtual_currency, real_money
    gift_recipient_id: Optional[str] = None
    status: str = "completed"
    transaction_timestamp: datetime = Field(default_factory=datetime.now)


# Premium Features & Marketplace Services
class MarketplaceService(BaseModel):
    id: Optional[str] = None
    service_name: str
    service_category: str  # analytics, marketing, logistics, design
    description: str
    provider_id: str
    pricing_model: str = "subscription"  # one_time, subscription, usage_based, commission
    base_price: float = 0.0
    currency: str = "USD"
    billing_frequency: str = "monthly"
    features: List[str] = []
    integration_complexity: str = "simple"  # simple, moderate, complex
    setup_fee: float = 0.0
    usage_limits: Dict[str, int] = {}
    api_access: bool = False
    custom_integration: bool = False
    support_level: str = "standard"  # basic, standard, premium, enterprise
    rating: float = 0.0
    review_count: int = 0
    active_users: int = 0
    created_at: datetime = Field(default_factory=datetime.now)


class ServiceSubscription(BaseModel):
    id: Optional[str] = None
    user_id: str
    service_id: str
    subscription_tier: str
    monthly_fee: float = 0.0
    usage_fee: float = 0.0
    commission_fee: float = 0.0
    total_monthly_cost: float = 0.0
    start_date: datetime = Field(default_factory=datetime.now)
    next_billing_date: datetime
    auto_renewal: bool = True
    usage_statistics: Dict[str, Any] = {}
    roi_metrics: Dict[str, float] = {}
    satisfaction_rating: Optional[float] = None
    status: str = "active"


# Advanced Analytics & Business Intelligence
class RevenueAnalytics(BaseModel):
    period: str = "monthly"  # daily, weekly, monthly, quarterly, yearly
    start_date: datetime
    end_date: datetime
    revenue_by_stream: Dict[str, float] = {}
    total_revenue: float = 0.0
    revenue_growth_rate: float = 0.0
    average_revenue_per_user: float = 0.0
    customer_lifetime_value: float = 0.0
    churn_rate: float = 0.0
    retention_rate: float = 0.0
    new_customer_acquisition_cost: float = 0.0
    return_on_ad_spend: float = 0.0
    gross_margin: float = 0.0
    net_margin: float = 0.0
    revenue_per_transaction: float = 0.0
    top_revenue_categories: List[Dict[str, Any]] = []
    geographic_revenue_split: Dict[str, float] = {}
    user_segment_revenue: Dict[str, float] = {}
    generated_at: datetime = Field(default_factory=datetime.now)


class MonetizationMetrics(BaseModel):
    platform_gmv: float = 0.0  # Gross Merchandise Value
    take_rate: float = 0.0  # Platform commission rate
    net_revenue: float = 0.0
    advertising_revenue: float = 0.0
    subscription_revenue: float = 0.0
    service_revenue: float = 0.0
    virtual_goods_revenue: float = 0.0
    total_active_sellers: int = 0
    total_paying_users: int = 0
    average_order_value: float = 0.0
    conversion_rate: float = 0.0
    seller_retention_rate: float = 0.0
    buyer_retention_rate: float = 0.0
    revenue_per_seller: float = 0.0
    revenue_per_buyer: float = 0.0
    cost_per_acquisition: float = 0.0
    lifetime_value_ratio: float = 0.0
    monetization_efficiency: float = 0.0
    market_penetration: float = 0.0


# Request/Response Models
class CommissionCalculationRequest(BaseModel):
    seller_id: str
    transaction_amount: float
    product_category: str
    buyer_location: str = "US"
    is_premium_seller: bool = False
    referral_code: Optional[str] = None


class AdCampaignCreateRequest(BaseModel):
    campaign_name: str
    budget_total: float
    budget_daily: float
    target_audience: Dict[str, Any]
    ad_formats: List[str]
    creative_assets: List[Dict[str, Any]]
    start_date: str  # ISO format
    end_date: Optional[str] = None


class SubscriptionUpgradeRequest(BaseModel):
    user_id: str
    new_plan_type: SubscriptionType
    payment_method: PaymentMethod
    billing_frequency: str = "monthly"
    promo_code: Optional[str] = None


class AffiliateSignupRequest(BaseModel):
    user_id: str
    program_name: str
    promotional_channels: List[str]
    expected_monthly_sales: float
    marketing_experience: str
    website_url: Optional[str] = None


class VirtualGoodPurchaseRequest(BaseModel):
    user_id: str
    virtual_good_id: str
    quantity: int = 1
    payment_method: str = "virtual_currency"
    gift_recipient_id: Optional[str] = None


# Comprehensive Monetization Dashboard
class MonetizationDashboard(BaseModel):
    overview: Dict[str, Any] = {}
    revenue_streams: Dict[str, float] = {}
    performance_metrics: MonetizationMetrics
    growth_trends: Dict[str, List[float]] = {}
    user_segments: Dict[str, Dict[str, Any]] = {}
    geographic_performance: Dict[str, float] = {}
    top_performers: Dict[str, List[Dict[str, Any]]] = {}
    optimization_opportunities: List[Dict[str, Any]] = []
    forecasts: Dict[str, Dict[str, float]] = {}
    alerts: List[Dict[str, Any]] = []
    generated_at: datetime = Field(default_factory=datetime.now)