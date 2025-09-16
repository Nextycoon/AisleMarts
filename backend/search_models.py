"""
Enhanced Search Models for Universal AI Commerce Engine Phase 1
MongoDB collections and data models for merchants, offers, locations
"""
from datetime import datetime
from typing import TypedDict, Literal, List, Dict, Optional
from pydantic import BaseModel, Field

# ============= MONGODB COLLECTION MODELS =============

class MerchantDoc(TypedDict):
    """Merchant/Seller document in MongoDB"""
    _id: str
    name: str
    type: Literal["retail", "wholesale", "factory", "farm"]
    trust_score: float  # 0.0 to 1.0
    sources: List[str]  # ["mock_csv", "shopify_api", "manual"]
    country: Optional[str]  # "KE", "US", "GB" 
    currency: Optional[str]  # "KES", "USD", "GBP"
    description: Optional[str]
    logo_url: Optional[str]
    contact_info: Dict[str, str]  # {"email": "", "phone": ""}
    verification_status: Literal["pending", "verified", "suspended"]
    created_at: datetime
    updated_at: datetime

class OfferDoc(TypedDict):
    """Product offer document in MongoDB"""
    _id: str
    product_id: str  # Reference to existing products collection
    merchant_id: str  # Reference to merchants collection
    price_minor: int  # Price in smallest currency unit (cents, pence)
    currency: str  # "KES", "USD", "GBP"
    delivery_days: int  # Estimated delivery time
    stock: int  # Available quantity
    condition: Literal["new", "used", "refurbished"]
    source: str  # "mock_csv", "api", "manual"
    url: Optional[str]  # External product URL
    attrs: Dict[str, str]  # {"size": "M", "color": "Black"}
    last_seen_at: datetime  # When this offer was last updated
    created_at: datetime

class LocationDoc(TypedDict):
    """Physical location document for nearby commerce"""
    _id: str
    merchant_id: str  # Reference to merchants collection
    name: str  # "Ngong Road Branch"
    address: Optional[str]
    lat: float  # Latitude
    lon: float  # Longitude
    services: List[Literal["onsite", "pickup", "delivery"]]
    hours: Dict[str, str]  # {"mon_fri": "09:00-18:00"}
    phone: Optional[str]
    created_at: datetime
    updated_at: datetime

# ============= EXTENDED PRODUCT MODEL =============

class ProductEnhancedDoc(TypedDict):
    """Extended product document with search enhancements"""
    # Existing fields from models.py
    _id: str
    title: str
    slug: str
    description: str
    price: float
    currency: str
    images: List[str]
    category_id: Optional[str]
    brand: Optional[str]
    attributes: Dict[str, str]
    stock: int
    active: bool
    created_at: datetime
    updated_at: datetime
    
    # New fields for enhanced search
    gtin: Optional[str]  # Global Trade Item Number (barcode)
    lang_tokens: Dict[str, List[str]]  # {"en": ["smartphone", "mobile"], "sw": ["simu"]}
    image_hashes: List[str]  # For deduplication
    attrs: Dict[str, str]  # Normalized attributes
    search_boost: float  # Search relevance multiplier

# ============= PYDANTIC API MODELS =============

class BestPick(BaseModel):
    """Best Pick scoring information"""
    offer_id: str
    price_minor: int
    currency: str
    score: float = Field(..., ge=0.0, le=1.0)
    reasons: List[Literal["price", "trust", "eta", "cultural_fit", "stock"]]
    explanation: str

class Merchant(BaseModel):
    """Merchant information for API responses"""
    id: str
    name: str
    type: Literal["retail", "wholesale", "factory", "farm"]
    trust_score: float
    country: Optional[str] = None
    verification_status: Literal["pending", "verified", "suspended"]

class Offer(BaseModel):
    """Product offer for API responses"""
    id: str
    merchant: Merchant
    price_minor: int
    currency: str
    delivery_days: int
    stock: int
    condition: Literal["new", "used", "refurbished"]
    attrs: Dict[str, str] = Field(default_factory=dict)
    last_seen_at: datetime

class SearchResult(BaseModel):
    """Search result with best pick and offer count"""
    product: Dict  # Existing ProductOut structure
    best_pick: BestPick
    offers_count: int
    dedup_info: Optional[Dict[str, str]] = None  # Debug info

class SearchResponse(BaseModel):
    """Complete search API response"""
    query: str
    mode: Literal["retail", "b2b", "all"]
    results: List[SearchResult]
    page: int
    limit: int
    total: int
    filters_applied: Dict[str, str] = Field(default_factory=dict)

class OffersResponse(BaseModel):
    """Product offers comparison response"""
    product_id: str
    offers: List[Offer]
    total_offers: int
    dedup_clusters: Dict[str, List[str]] = Field(default_factory=dict)

# ============= SEARCH CONFIGURATION =============

class SearchWeights:
    """Scoring weights for Best Pick algorithm"""
    PRICE = 0.35
    ETA = 0.20
    TRUST = 0.25
    CULTURE = 0.15
    STOCK = 0.05

class SearchLanguages:
    """Supported search languages"""
    ENGLISH = "en"
    SWAHILI = "sw"
    ARABIC = "ar"
    TURKISH = "tr"
    FRENCH = "fr"
    
    ALL = [ENGLISH, SWAHILI, ARABIC, TURKISH, FRENCH]

class SearchModes:
    """Search mode filtering"""
    RETAIL = "retail"
    B2B = "b2b"
    ALL = "all"

# ============= INDEX SPECIFICATIONS =============

SEARCH_INDEXES = {
    "products_enhanced": [
        # Text search indexes per language
        ("title", "text"),
        ("description", "text"),
        ("brand", "text"),
        # Lookup indexes
        ("gtin", 1),
        ("brand", 1),
        ("category_id", 1),
        ("active", 1),
        # Compound indexes
        ("brand", 1, "title", 1),
        ("image_hashes", 1),
        ("lang_tokens.en", 1),
        ("lang_tokens.sw", 1),
        ("lang_tokens.ar", 1),
        ("lang_tokens.tr", 1),
    ],
    "merchants": [
        ("name", 1),
        ("type", 1),
        ("trust_score", -1),
        ("verification_status", 1),
        ("country", 1),
    ],
    "offers": [
        ("product_id", 1),
        ("merchant_id", 1),
        ("price_minor", 1),
        ("currency", 1),
        ("stock", 1),
        ("last_seen_at", -1),
        # Compound indexes
        ("product_id", 1, "price_minor", 1),
        ("merchant_id", 1, "stock", 1),
    ],
    "locations": [
        ("merchant_id", 1),
        ("lat", 1, "lon", 1),  # Geospatial index
        ("services", 1),
    ]
}