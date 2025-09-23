from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ServiceType(str, Enum):
    PAYMENT = "payment"
    DELIVERY = "delivery"
    TRAVEL = "travel"
    ENTERTAINMENT = "entertainment"
    UTILITIES = "utilities"
    FINANCE = "finance"
    HEALTH = "health"
    EDUCATION = "education"


class PaymentType(str, Enum):
    P2P = "p2p"
    MERCHANT = "merchant"
    BILL_PAYMENT = "bill_payment"
    TOP_UP = "top_up"
    WITHDRAWAL = "withdrawal"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


# AislePay Wallet System
class AisleWallet(BaseModel):
    user_id: str
    balance: float = 0.0
    currency: str = "USD"
    is_verified: bool = False
    daily_limit: float = 1000.0
    monthly_limit: float = 10000.0
    linked_cards: List[str] = []
    transaction_history: List[str] = []
    cashback_earned: float = 0.0
    loyalty_points: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    last_activity: datetime = Field(default_factory=datetime.now)


class PaymentTransaction(BaseModel):
    id: Optional[str] = None
    from_user: str
    to_user: Optional[str] = None
    merchant_id: Optional[str] = None
    amount: float
    currency: str = "USD"
    payment_type: PaymentType
    description: str
    status: TransactionStatus = TransactionStatus.PENDING
    fee: float = 0.0
    cashback_amount: float = 0.0
    loyalty_points_earned: int = 0
    reference_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None


# Super App Services
class SuperAppService(BaseModel):
    id: str
    name: str
    service_type: ServiceType
    description: str
    icon: str
    is_active: bool = True
    integration_url: Optional[str] = None
    api_endpoints: Dict[str, str] = {}
    pricing_model: Dict[str, Any] = {}
    user_rating: float = 0.0
    total_users: int = 0
    commission_rate: float = 0.0


# Food Delivery Integration
class FoodOrder(BaseModel):
    id: Optional[str] = None
    user_id: str
    restaurant_id: str
    restaurant_name: str
    items: List[Dict[str, Any]]
    total_amount: float
    delivery_fee: float
    service_fee: float
    tax_amount: float
    final_amount: float
    delivery_address: Dict[str, str]
    estimated_delivery: int  # minutes
    status: str = "pending"
    payment_method: str = "aislepay"
    special_instructions: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)


# Travel Booking Integration
class TravelBooking(BaseModel):
    id: Optional[str] = None
    user_id: str
    booking_type: str  # flight, hotel, car_rental
    destination: str
    departure_date: datetime
    return_date: Optional[datetime] = None
    passengers: int = 1
    total_cost: float
    booking_reference: str
    status: str = "confirmed"
    provider: str
    payment_method: str = "aislepay"
    created_at: datetime = Field(default_factory=datetime.now)


# Entertainment Bookings
class EntertainmentBooking(BaseModel):
    id: Optional[str] = None
    user_id: str
    event_type: str  # movie, concert, sports, theater
    event_name: str
    venue: str
    date_time: datetime
    tickets: int
    seat_details: List[str] = []
    total_cost: float
    booking_reference: str
    status: str = "confirmed"
    qr_code: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)


# AI Personal Assistant
class AIAssistantRequest(BaseModel):
    user_id: str
    query: str
    request_type: str  # shopping, booking, reminder, general
    context: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.now)


class AIAssistantResponse(BaseModel):
    request_id: str
    response_text: str
    suggested_actions: List[Dict[str, Any]] = []
    confidence_score: float
    follow_up_questions: List[str] = []
    metadata: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.now)


# Lifestyle Content & Services
class LifestyleContent(BaseModel):
    id: Optional[str] = None
    content_type: str  # daily_horoscope, weather, news, recipe, workout
    title: str
    content: str
    media_urls: List[str] = []
    category: str
    target_audience: List[str] = []
    is_personalized: bool = True
    engagement_score: float = 0.0
    related_products: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None


# Bill Payment System
class BillPayment(BaseModel):
    id: Optional[str] = None
    user_id: str
    provider: str  # electricity, water, internet, phone, etc.
    account_number: str
    amount: float
    due_date: datetime
    payment_date: Optional[datetime] = None
    status: str = "pending"
    auto_pay_enabled: bool = False
    reminder_sent: bool = False
    cashback_earned: float = 0.0


# User Preferences & Profile
class UserLifestyleProfile(BaseModel):
    user_id: str
    preferences: Dict[str, Any] = {}
    daily_routines: Dict[str, List[str]] = {}
    favorite_services: List[str] = []
    notification_settings: Dict[str, bool] = {}
    ai_personalization_enabled: bool = True
    data_sharing_consent: Dict[str, bool] = {}
    lifestyle_goals: List[str] = []
    spending_patterns: Dict[str, Any] = {}
    last_updated: datetime = Field(default_factory=datetime.now)


# Social Commerce Features
class InfluencerProfile(BaseModel):
    user_id: str
    is_verified: bool = False
    follower_count: int = 0
    engagement_rate: float = 0.0
    specialties: List[str] = []
    commission_rate: float = 0.1  # 10% default
    total_sales_generated: float = 0.0
    active_campaigns: List[str] = []
    rating: float = 0.0
    bio: str = ""
    contact_info: Dict[str, str] = {}


class BrandPartnership(BaseModel):
    id: Optional[str] = None
    brand_id: str
    influencer_id: str
    campaign_name: str
    products: List[str]
    commission_rate: float
    duration_days: int
    total_budget: float
    spent_amount: float = 0.0
    sales_generated: float = 0.0
    status: str = "active"
    performance_metrics: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.now)


class LiveShoppingEvent(BaseModel):
    id: Optional[str] = None
    host_id: str
    host_name: str
    title: str
    description: str
    scheduled_time: datetime
    duration_minutes: int = 60
    featured_products: List[Dict[str, Any]] = []
    viewer_count: int = 0
    sales_generated: float = 0.0
    status: str = "scheduled"  # scheduled, live, ended
    stream_url: Optional[str] = None
    chat_enabled: bool = True
    exclusive_deals: List[Dict[str, Any]] = []


# Request/Response Models
class WalletTopUpRequest(BaseModel):
    amount: float
    payment_method: str  # card, bank_transfer, etc.
    save_payment_method: bool = False


class P2PTransferRequest(BaseModel):
    to_user_id: str
    amount: float
    description: Optional[str] = None
    split_bill: bool = False


class BillPaymentRequest(BaseModel):
    provider: str
    account_number: str
    amount: float
    save_for_autopay: bool = False


class ServiceBookingRequest(BaseModel):
    service_id: str
    service_type: ServiceType
    booking_details: Dict[str, Any]
    payment_method: str = "aislepay"


# Analytics & Insights
class SuperAppMetrics(BaseModel):
    total_wallet_users: int
    total_transactions: float
    popular_services: List[Dict[str, Any]]
    revenue_by_service: Dict[str, float]
    user_engagement_by_service: Dict[str, float]
    cross_service_usage: Dict[str, int]
    generated_at: datetime = Field(default_factory=datetime.now)