from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional, Literal
from decimal import Decimal

# AI Search Hub Models
class SearchRequest(TypedDict):
    q: str
    locale: str
    currency: str
    country: str
    filters: Dict[str, Any]

class SearchResult(TypedDict):
    title: str
    id: str
    price: float
    currency: str
    seller: Dict[str, Any]
    cities: Optional[List[str]]

class QuickSearchResponse(TypedDict):
    results: List[SearchResult]
    applied_filters: Dict[str, Any]
    latency_ms: int

class DeepSearchRequest(TypedDict):
    objective: str
    time_horizon: Optional[str]
    regions: Optional[List[str]]
    evidence_required: Optional[bool]

class DeepSearchResponse(TypedDict):
    insights: List[Dict[str, Any]]
    sources: List[Dict[str, Any]]
    confidence: float

class ImageReadRequest(TypedDict):
    image_ref: str  # Base64 or URL
    tasks: List[Literal["ocr", "translate", "extract_entities"]]
    languages_hint: Optional[List[str]]

class EntityExtraction(TypedDict):
    type: Literal["sku", "lot", "expiry", "brand", "ingredient", "price", "contact"]
    value: str
    bbox: Optional[List[float]]  # [x, y, width, height]

class ImageReadResponse(TypedDict):
    text_blocks: List[str]
    entities: List[EntityExtraction]
    translations: Optional[List[Dict[str, str]]]

class QRScanRequest(TypedDict):
    image_ref: str

class QRScanResponse(TypedDict):
    qr_value: str
    intent_guess: Literal["open_url", "product_lookup", "auth", "contact"]
    next_action: str

class BarcodeScanRequest(TypedDict):
    image_ref: str
    symbologies: List[Literal["EAN13", "UPC", "CODE128", "QR"]]

class BarcodeScanResponse(TypedDict):
    barcode_value: str
    symbology: str
    lookup_key: str

class VoiceInputRequest(TypedDict):
    audio_ref: str  # Base64 audio data
    language_hint: Optional[str]

class VoiceInputResponse(TypedDict):
    transcript: str
    language: str
    confidence: float

class SearchHubAnalytics(TypedDict):
    _id: str
    user_id: Optional[str]
    session_id: str
    tool_used: str
    query: str
    success: bool
    latency_ms: int
    timestamp: datetime
    country: str
    language: str

class UserPreferences(TypedDict):
    _id: str
    user_id: Optional[str]
    preferred_tools: List[str]
    default_currency: str
    default_language: str
    privacy_settings: Dict[str, bool]
    last_updated: datetime

# Intent Recognition Models
class Intent(TypedDict):
    name: str
    confidence: float
    entities: Dict[str, Any]
    suggested_tool: str
    fallback_tool: Optional[str]

class IntentAnalysisResponse(TypedDict):
    primary_intent: Intent
    alternative_intents: List[Intent]
    suggested_action: str

# Sample data for testing
SAMPLE_PRODUCTS = [
    {
        "id": "prod_001",
        "title": "Organic Turkish Hazelnuts - Premium Grade",
        "price": 8.50,
        "currency": "EUR",
        "category": "food",
        "seller": {
            "id": "seller_tr_001",
            "name": "Anatolian Nuts Co.",
            "country": "TR",
            "rating": 4.8,
            "city": "Trabzon"
        },
        "cities": ["Trabzon", "Istanbul", "Ankara"],
        "keywords": ["hazelnuts", "organic", "turkish", "premium", "nuts", "food"],
        "description": "Premium organic hazelnuts from the Black Sea region of Turkey",
        "stock": 5000,
        "minimum_order": 100
    },
    {
        "id": "prod_002", 
        "title": "Wholesale Cotton T-Shirts - White Basic",
        "price": 2.80,
        "currency": "USD",
        "category": "clothing",
        "seller": {
            "id": "seller_bd_001",
            "name": "Dhaka Textiles Ltd",
            "country": "BD",
            "rating": 4.5,
            "city": "Dhaka"
        },
        "cities": ["Dhaka", "Chittagong"],
        "keywords": ["cotton", "t-shirts", "wholesale", "basic", "white", "clothing", "textile"],
        "description": "100% cotton basic white t-shirts for wholesale orders",
        "stock": 10000,
        "minimum_order": 500
    },
    {
        "id": "prod_003",
        "title": "Bamboo Towels Set - Eco-Friendly Hotel Grade",
        "price": 12.00,
        "currency": "EUR",
        "category": "home_garden",
        "seller": {
            "id": "seller_cn_001",
            "name": "Green Bamboo Manufacturing",
            "country": "CN",
            "rating": 4.6,
            "city": "Guangzhou"
        },
        "cities": ["Guangzhou", "Shenzhen", "Shanghai"],
        "keywords": ["bamboo", "towels", "eco-friendly", "hotel", "sustainable", "home"],
        "description": "Premium eco-friendly bamboo towel sets for hotels and spas",
        "stock": 2500,
        "minimum_order": 50
    },
    {
        "id": "prod_004",
        "title": "Turkish Coffee - Authentic Ground",
        "price": 15.00,
        "currency": "EUR",
        "category": "food",
        "seller": {
            "id": "seller_tr_002",
            "name": "Istanbul Coffee House",
            "country": "TR",
            "rating": 4.9,
            "city": "Istanbul"
        },
        "cities": ["Istanbul", "Izmir", "Bursa"],
        "keywords": ["turkish", "coffee", "authentic", "ground", "premium", "قهوة", "تركية"],
        "description": "Authentic Turkish coffee, finely ground using traditional methods",
        "stock": 1200,
        "minimum_order": 20
    },
    {
        "id": "prod_005",
        "title": "Vegan Leather Jackets - Fashion Forward",
        "price": 45.00,
        "currency": "EUR",
        "category": "clothing",
        "seller": {
            "id": "seller_tr_003",
            "name": "Istanbul Fashion Co.",
            "country": "TR",
            "rating": 4.4,
            "city": "Istanbul"
        },
        "cities": ["Istanbul", "Izmir"],
        "keywords": ["vegan", "leather", "jackets", "fashion", "sustainable", "deri", "ceket"],
        "description": "High-quality vegan leather jackets with modern designs",
        "stock": 800,
        "minimum_order": 25
    }
]

# City data for targeting
SAMPLE_CITIES = [
    {"id": "istanbul_tr", "name": "Istanbul", "country": "TR", "demand_score": 95},
    {"id": "berlin_de", "name": "Berlin", "country": "DE", "demand_score": 88},
    {"id": "london_gb", "name": "London", "country": "GB", "demand_score": 92},
    {"id": "paris_fr", "name": "Paris", "country": "FR", "demand_score": 85},
    {"id": "madrid_es", "name": "Madrid", "country": "ES", "demand_score": 78},
    {"id": "rome_it", "name": "Rome", "country": "IT", "demand_score": 80},
    {"id": "amsterdam_nl", "name": "Amsterdam", "country": "NL", "demand_score": 87},
    {"id": "vienna_at", "name": "Vienna", "country": "AT", "demand_score": 82},
    {"id": "zurich_ch", "name": "Zurich", "country": "CH", "demand_score": 90},
    {"id": "stockholm_se", "name": "Stockholm", "country": "SE", "demand_score": 85}
]