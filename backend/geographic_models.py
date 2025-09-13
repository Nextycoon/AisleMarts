from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional, Literal

# Geographic Data Models
class CountryDoc(TypedDict):
    _id: str
    code: str  # ISO country code (US, CA, GB, etc.)
    name: str
    continent: str
    currency: str
    timezone: str
    active: bool
    created_at: datetime

class CityDoc(TypedDict):
    _id: str
    name: str
    country_code: str
    country_name: str
    region: str  # State/Province
    latitude: float
    longitude: float
    population: int
    timezone: str
    is_major_city: bool
    metro_area: str | None
    created_at: datetime

class SellerVisibilityDoc(TypedDict):
    _id: str
    vendor_id: str
    visibility_type: Literal["local", "national", "global_strategic", "global_all"]
    
    # Local targeting
    local_radius_km: float | None  # Radius in kilometers
    local_center_city_id: str | None
    
    # National targeting
    target_countries: List[str] | None  # Country codes
    
    # Global strategic targeting
    target_cities: List[str] | None  # City IDs
    target_regions: List[str] | None  # Region names
    
    # Exclusions
    excluded_countries: List[str] | None
    excluded_cities: List[str] | None
    
    # Settings
    auto_expand: bool  # AI can suggest expansions
    budget_daily_usd: float | None
    performance_threshold: float | None
    
    # Metrics
    impressions: int
    clicks: int
    conversions: int
    revenue_usd: float
    
    # AI recommendations
    ai_suggestions: List[Dict[str, Any]]
    last_ai_analysis: datetime | None
    
    active: bool
    created_at: datetime
    updated_at: datetime

class GeographicPerformanceDoc(TypedDict):
    _id: str
    vendor_id: str
    product_id: str | None  # None for overall vendor performance
    
    # Geographic data
    country_code: str
    city_id: str | None
    region: str | None
    
    # Performance metrics
    impressions: int
    clicks: int
    conversions: int
    revenue_usd: float
    avg_order_value: float
    conversion_rate: float
    
    # Time tracking
    date: datetime
    week_of_year: int
    month: int
    year: int
    
    # AI insights
    performance_score: float  # 0-100
    ai_insights: List[str]
    recommended_actions: List[str]
    
    created_at: datetime
    updated_at: datetime

class BuyerLocationDoc(TypedDict):
    _id: str
    user_id: str
    
    # Current location
    current_city_id: str | None
    current_country_code: str
    current_latitude: float | None
    current_longitude: float | None
    
    # Location preferences
    preferred_shipping_countries: List[str]
    max_shipping_distance_km: float | None
    willing_to_pay_international_shipping: bool
    
    # Location history for personalization
    location_history: List[Dict[str, Any]]
    
    # Privacy settings
    share_precise_location: bool
    share_city_level: bool
    share_country_level: bool
    
    created_at: datetime
    updated_at: datetime

class ShippingZoneDoc(TypedDict):
    _id: str
    vendor_id: str
    
    # Zone definition
    zone_name: str
    zone_type: Literal["domestic", "regional", "international"]
    
    # Coverage
    included_countries: List[str]
    included_cities: List[str] | None
    excluded_countries: List[str] | None
    excluded_cities: List[str] | None
    
    # Shipping details
    shipping_methods: List[Dict[str, Any]]  # carrier, cost, delivery_days
    free_shipping_threshold_usd: float | None
    
    # Restrictions
    restricted_products: List[str] | None  # Product category restrictions
    max_weight_kg: float | None
    max_dimensions_cm: Dict[str, float] | None
    
    active: bool
    created_at: datetime
    updated_at: datetime

# AI Geographic Intelligence Models  
class GeographicInsight(TypedDict):
    insight_type: Literal["opportunity", "warning", "recommendation", "trend"]
    title: str
    description: str
    confidence_score: float  # 0-1
    potential_impact: Literal["low", "medium", "high"]
    suggested_actions: List[str]
    supporting_data: Dict[str, Any]

class MarketAnalysis(TypedDict):
    market_name: str
    market_size_score: float  # 0-100
    competition_level: Literal["low", "medium", "high"]
    demand_trend: Literal["declining", "stable", "growing", "explosive"]
    seasonality_factors: List[Dict[str, Any]]
    cultural_considerations: List[str]
    recommended_entry_strategy: str
    estimated_performance: Dict[str, float]

# World Cities Data (Sample structure - would be populated from geographic API)
MAJOR_CITIES_SAMPLE = [
    {
        "name": "New York",
        "country_code": "US",
        "country_name": "United States",
        "region": "New York",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "population": 8336817,
        "timezone": "America/New_York",
        "is_major_city": True,
        "metro_area": "New York Metropolitan Area"
    },
    {
        "name": "London",
        "country_code": "GB", 
        "country_name": "United Kingdom",
        "region": "England",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "population": 9648110,
        "timezone": "Europe/London",
        "is_major_city": True,
        "metro_area": "Greater London"
    },
    {
        "name": "Tokyo",
        "country_code": "JP",
        "country_name": "Japan", 
        "region": "Tokyo",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "population": 14094034,
        "timezone": "Asia/Tokyo",
        "is_major_city": True,
        "metro_area": "Greater Tokyo Area"
    },
    {
        "name": "Paris",
        "country_code": "FR",
        "country_name": "France",
        "region": "Île-de-France",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "population": 2161000,
        "timezone": "Europe/Paris", 
        "is_major_city": True,
        "metro_area": "Paris Metropolitan Area"
    },
    {
        "name": "Sydney",
        "country_code": "AU",
        "country_name": "Australia",
        "region": "New South Wales", 
        "latitude": -33.8688,
        "longitude": 151.2093,
        "population": 5312163,
        "timezone": "Australia/Sydney",
        "is_major_city": True,
        "metro_area": "Greater Sydney"
    },
    {
        "name": "Dubai",
        "country_code": "AE",
        "country_name": "United Arab Emirates",
        "region": "Dubai",
        "latitude": 25.2048,
        "longitude": 55.2708,
        "population": 3331420,
        "timezone": "Asia/Dubai",
        "is_major_city": True,
        "metro_area": "Dubai Metropolitan Area"
    },
    {
        "name": "Singapore",
        "country_code": "SG",
        "country_name": "Singapore",
        "region": "Singapore",
        "latitude": 1.3521,
        "longitude": 103.8198,
        "population": 5685807,
        "timezone": "Asia/Singapore",
        "is_major_city": True,
        "metro_area": "Singapore"
    },
    {
        "name": "São Paulo",
        "country_code": "BR",
        "country_name": "Brazil",
        "region": "São Paulo",
        "latitude": -23.5505,
        "longitude": -46.6333,
        "population": 12325232,
        "timezone": "America/Sao_Paulo",
        "is_major_city": True,
        "metro_area": "São Paulo Metropolitan Area"
    }
]

COUNTRIES_SAMPLE = [
    {"code": "US", "name": "United States", "continent": "North America", "currency": "USD", "timezone": "America/New_York"},
    {"code": "GB", "name": "United Kingdom", "continent": "Europe", "currency": "GBP", "timezone": "Europe/London"},
    {"code": "JP", "name": "Japan", "continent": "Asia", "currency": "JPY", "timezone": "Asia/Tokyo"},
    {"code": "FR", "name": "France", "continent": "Europe", "currency": "EUR", "timezone": "Europe/Paris"},
    {"code": "AU", "name": "Australia", "continent": "Oceania", "currency": "AUD", "timezone": "Australia/Sydney"},
    {"code": "AE", "name": "United Arab Emirates", "continent": "Asia", "currency": "AED", "timezone": "Asia/Dubai"},
    {"code": "SG", "name": "Singapore", "continent": "Asia", "currency": "SGD", "timezone": "Asia/Singapore"},
    {"code": "BR", "name": "Brazil", "continent": "South America", "currency": "BRL", "timezone": "America/Sao_Paulo"},
    {"code": "CA", "name": "Canada", "continent": "North America", "currency": "CAD", "timezone": "America/Toronto"},
    {"code": "DE", "name": "Germany", "continent": "Europe", "currency": "EUR", "timezone": "Europe/Berlin"},
    {"code": "TR", "name": "Turkey", "continent": "Asia", "currency": "TRY", "timezone": "Europe/Istanbul"},
    {"code": "IN", "name": "India", "continent": "Asia", "currency": "INR", "timezone": "Asia/Kolkata"},
    {"code": "CN", "name": "China", "continent": "Asia", "currency": "CNY", "timezone": "Asia/Shanghai"}
]