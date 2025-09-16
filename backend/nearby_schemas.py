"""
Phase 3: Nearby/Onsite Commerce - Pydantic Schemas
Data models for locations, offers, reservations, and scanning functionality
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime

# Geospatial types
class GeoPoint(BaseModel):
    type: Literal["Point"] = "Point"
    coordinates: List[float]  # [lng, lat]

class Address(BaseModel):
    line1: str
    line2: Optional[str] = None
    city: str
    region: str
    country: str = "KE"
    postal_code: Optional[str] = None

class OpeningHours(BaseModel):
    dow: int  # Day of week (0=Sunday, 1=Monday, etc.)
    open: str  # "08:00"
    close: str  # "20:00"

# Location models
class LocationCapabilities(BaseModel):
    rfq_counter: bool = False
    cash_pickup: bool = True
    mpesa_payment: bool = True
    bulk_orders: bool = False
    b2b_pricing: bool = False

class Location(BaseModel):
    id: str = Field(alias="_id")
    merchant_id: str
    name: str
    type: Literal["retail", "wholesale", "farm", "factory", "pickup"]
    geo: GeoPoint
    address: Address
    opening_hours: List[OpeningHours] = []
    services: List[str] = []
    capabilities: LocationCapabilities = LocationCapabilities()
    status: Literal["active", "inactive"] = "active"
    distance_m: Optional[int] = None  # Added during search queries
    updated_at: str

    class Config:
        populate_by_name = True

# Inventory and offers
class PriceInfo(BaseModel):
    amount: int  # Price in cents/smallest currency unit
    currency: str = "KES"

class ProductAttributes(BaseModel):
    """Flexible attributes for different product types"""
    color: Optional[str] = None
    size: Optional[str] = None
    storage: Optional[str] = None
    condition: Optional[str] = "new"
    brand: Optional[str] = None
    model: Optional[str] = None
    weight: Optional[str] = None
    min_order: Optional[int] = None

class Offer(BaseModel):
    sku: str
    gtin: Optional[str] = None
    qty: int
    price: PriceInfo
    attributes: ProductAttributes = ProductAttributes()
    location_id: str
    merchant_id: str
    distance_m: Optional[float] = None
    source: Literal["pos", "erp", "manual", "rfid"] = "manual"
    updated_at: str

class InventorySnapshot(BaseModel):
    id: str = Field(alias="_id")
    merchant_id: str
    location_id: str
    sku: str
    gtin: Optional[str] = None
    qty: int
    price: PriceInfo
    attributes: ProductAttributes = ProductAttributes()
    updated_at: str
    source: Literal["pos", "erp", "manual", "rfid"] = "manual"

    class Config:
        populate_by_name = True

# Search models
class NearbySearchItem(BaseModel):
    product_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    best_pick_score: float
    best_pick_reasons: List[str] = []
    best_offer: Offer
    offers_count: int
    location: Location

class NearbySearchResponse(BaseModel):
    items: List[NearbySearchItem]
    total_count: int
    search_time_ms: float
    cached: bool = False
    location_context: Optional[Dict[str, Any]] = None

class ProductOffersResponse(BaseModel):
    product_id: str
    offers: List[Offer]
    total_offers: int
    nearby_locations: List[Location]
    best_pick: Optional[Offer] = None

# Reservation models
class ReservationItem(BaseModel):
    sku: str
    qty: int
    location_id: str
    unit_price: Optional[int] = None  # Cached from inventory

class PickupWindow(BaseModel):
    start: str  # ISO datetime
    end: str    # ISO datetime

class ReservationIn(BaseModel):
    items: List[ReservationItem]
    pickup_window: Optional[PickupWindow] = None
    notes: Optional[str] = None

class ReservationOut(BaseModel):
    reservation_id: str
    reference: str
    hold_expires_at: str
    pickup_window: Optional[PickupWindow] = None
    pickup_code: Optional[str] = None  # 6-digit code for confirmation
    total_amount: Optional[int] = None
    currency: str = "KES"

class ReservationStatus(BaseModel):
    reservation_id: str
    reference: str
    status: Literal["held", "confirmed", "released", "expired", "picked_up", "cancelled"]
    items: List[ReservationItem]
    hold_expires_at: Optional[str] = None
    pickup_window: Optional[PickupWindow] = None
    pickup_code: Optional[str] = None
    total_amount: Optional[int] = None
    currency: str = "KES"
    created_at: str
    audit_trail: List[Dict[str, Any]] = []

# Scanning models
class ScanContext(BaseModel):
    geo: Optional[GeoPoint] = None
    location_id: Optional[str] = None
    timestamp: Optional[str] = None

class ScanIn(BaseModel):
    barcode: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    location_id: Optional[str] = None

class ScanResult(BaseModel):
    sku: Optional[str] = None
    gtin: Optional[str] = None
    product_id: Optional[str] = None
    title: Optional[str] = None
    image_url: Optional[str] = None

class ScanOut(BaseModel):
    barcode: str
    resolved: Optional[ScanResult] = None
    offers: List[Offer] = []
    nearby_locations: List[Location] = []
    best_offer: Optional[Offer] = None
    diagnostics: Dict[str, Any]

# Analytics and health
class NearbyHealthResponse(BaseModel):
    status: str
    features: Dict[str, bool]
    locations_count: int
    inventory_count: int
    active_reservations: int
    cache_status: Dict[str, Any]
    performance: Dict[str, Any]

class NearbyAnalytics(BaseModel):
    search_queries: int
    successful_scans: int
    active_reservations: int
    pickup_success_rate: float
    avg_search_time_ms: float
    popular_locations: List[Dict[str, Any]]
    top_scanned_products: List[Dict[str, Any]]

# Error models
class NearbyError(BaseModel):
    code: str
    message: str
    hint: Optional[str] = None
    retryable: bool = False
    context: Optional[Dict[str, Any]] = None