"""
AisleMarts Shop API Router - TikTok Shop Enhanced Implementation
Supports: Product catalog, cart, checkout, orders, reviews, shoppable video integration
Priority: Phase 2 (Shoppable Video) → Phase 1 (Core Shop) → Phase 3 (Live Shopping)
"""

from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
import uuid
import time
import json
from datetime import datetime, timedelta
from enum import Enum

router = APIRouter()

# Feature Flags
SHOP_ENABLED = True
INFEED_CHECKOUT_ENABLED = True
LIVE_SHOPPING_ENABLED = True
AR_TRYON_ENABLED = False
B2B_RFQ_ENABLED = False

class ProductStatus(str, Enum):
    ACTIVE = "active"
    DRAFT = "draft" 
    ARCHIVED = "archived"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FULFILLED = "fulfilled"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class TrustTier(str, Enum):
    UNVERIFIED = "unverified"
    VERIFIED = "verified"
    GOLD = "gold"
    DIAMOND = "diamond"

# Request/Response Models
class ProductMedia(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    type: str = "image"  # image, video, ar_asset
    alt_text: Optional[str] = None
    sort_order: int = 0

class ProductVariant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sku: str
    title: str
    price: float
    compare_at_price: Optional[float] = None
    stock: int = 0
    attributes: Dict[str, str] = {}  # size: L, color: red
    image_url: Optional[str] = None

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    media: List[ProductMedia] = []
    variants: List[ProductVariant] = []
    price: float  # base price
    compare_at_price: Optional[float] = None
    category: str
    tags: List[str] = []
    seller_id: str
    seller_name: str
    seller_tier: TrustTier = TrustTier.VERIFIED
    status: ProductStatus = ProductStatus.ACTIVE
    rating: float = 0.0
    review_count: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Shoppable Video Fields
    video_tags: List[str] = []  # video IDs this product is tagged in
    
    # Commerce Metrics
    views: int = 0
    clicks: int = 0
    cart_adds: int = 0
    purchases: int = 0
    conversion_rate: float = 0.0

class CartItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    variant_id: str
    quantity: int
    price_snapshot: float  # price at time of add to cart
    added_at: datetime = Field(default_factory=datetime.now)

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    total: float = 0.0
    updated_at: datetime = Field(default_factory=datetime.now)

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    seller_id: str
    items: List[CartItem]
    total: float
    status: OrderStatus = OrderStatus.PENDING
    payment_reference: Optional[str] = None
    shipping_address: Dict[str, str] = {}
    tracking_number: Optional[str] = None
    
    # Attribution
    source: str = "shop"  # shop, feed, live, ar
    video_id: Optional[str] = None
    stream_id: Optional[str] = None
    creator_id: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    order_id: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = None
    content: str
    media: List[str] = []  # image/video URLs
    verified_purchase: bool = False
    helpful_count: int = 0
    created_at: datetime = Field(default_factory=datetime.now)

# Video Tagging Models (Phase 2 Priority)
class VideoProductTag(BaseModel):
    video_id: str
    product_id: str
    variant_id: Optional[str] = None
    position: Dict[str, float] = {}  # x, y coordinates for overlay
    created_at: datetime = Field(default_factory=datetime.now)

class ShoppableVideoRequest(BaseModel):
    video_id: str
    product_tags: List[Dict[str, Any]]  # [{product_id, variant_id?, position?}]

# Live Shopping Models (Phase 3)
class LiveProductPin(BaseModel):
    stream_id: str
    product_id: str
    variant_id: Optional[str] = None
    pinned_at: datetime = Field(default_factory=datetime.now)
    pinned_by: str  # creator_id

# Mock Database (Production would use MongoDB/PostgreSQL)
PRODUCTS_DB: Dict[str, Product] = {}
CARTS_DB: Dict[str, Cart] = {}
ORDERS_DB: Dict[str, Order] = {}
REVIEWS_DB: List[Review] = []
VIDEO_TAGS_DB: List[VideoProductTag] = []
LIVE_PINS_DB: List[LiveProductPin] = []

# Initialize with sample products
def init_sample_products():
    """Initialize sample products for demo"""
    sample_products = [
        Product(
            id="prod_luxury_watch_001",
            title="Premium Smartwatch - Rose Gold Edition",
            description="Luxury smartwatch with health tracking, GPS, and premium rose gold finish. Perfect for fitness enthusiasts and fashion-forward individuals.",
            price=299.99,
            compare_at_price=399.99,
            category="electronics",
            tags=["smartwatch", "fitness", "luxury", "health"],
            seller_id="seller_tech_luxury",
            seller_name="@TechLuxury",
            seller_tier=TrustTier.GOLD,
            rating=4.8,
            review_count=247,
            media=[
                ProductMedia(url="https://via.placeholder.com/400x400/FFB6C1/000?text=Rose+Gold+Watch", type="image"),
                ProductMedia(url="https://via.placeholder.com/400x400/FFB6C1/000?text=Watch+Features", type="image"),
            ],
            variants=[
                ProductVariant(id="var_001", sku="WATCH-RG-42", title="42mm Rose Gold", price=299.99, stock=15, attributes={"size": "42mm", "color": "rose_gold"}),
                ProductVariant(id="var_002", sku="WATCH-RG-46", title="46mm Rose Gold", price=329.99, stock=8, attributes={"size": "46mm", "color": "rose_gold"}),
            ],
            views=1250, clicks=89, cart_adds=34, purchases=12, conversion_rate=13.5
        ),
        Product(
            id="prod_fashion_jacket_002",
            title="Designer Leather Jacket - Black Premium",
            description="Genuine leather jacket with premium craftsmanship. Features asymmetric zipper, quilted details, and contemporary fit.",
            price=189.99,
            compare_at_price=299.99,
            category="fashion",
            tags=["leather", "jacket", "designer", "premium"],
            seller_id="seller_fashion_co",
            seller_name="@FashionCo",
            seller_tier=TrustTier.DIAMOND,
            rating=4.9,
            review_count=189,
            media=[
                ProductMedia(url="https://via.placeholder.com/400x400/000000/FFF?text=Leather+Jacket", type="image"),
                ProductMedia(url="https://via.placeholder.com/400x400/000000/FFF?text=Jacket+Detail", type="image"),
            ],
            variants=[
                ProductVariant(id="var_003", sku="JACKET-BLK-S", title="Small Black", price=189.99, stock=5, attributes={"size": "S", "color": "black"}),
                ProductVariant(id="var_004", sku="JACKET-BLK-M", title="Medium Black", price=189.99, stock=12, attributes={"size": "M", "color": "black"}),
                ProductVariant(id="var_005", sku="JACKET-BLK-L", title="Large Black", price=189.99, stock=8, attributes={"size": "L", "color": "black"}),
            ],
            views=980, clicks=76, cart_adds=28, purchases=9, conversion_rate=11.5
        ),
        Product(
            id="prod_home_candle_003",
            title="Luxury Scented Candle Set - Vanilla & Lavender",
            description="Premium soy wax candles with natural fragrances. Perfect for creating a relaxing atmosphere. Burns for 40+ hours each.",
            price=45.99,
            compare_at_price=65.99,
            category="home",
            tags=["candles", "luxury", "scented", "relaxation"],
            seller_id="seller_home_essence",
            seller_name="@HomeEssence",
            seller_tier=TrustTier.VERIFIED,
            rating=4.7,
            review_count=156,
            media=[
                ProductMedia(url="https://via.placeholder.com/400x400/E6E6FA/000?text=Luxury+Candles", type="image"),
            ],
            variants=[
                ProductVariant(id="var_006", sku="CANDLE-SET-VL", title="Vanilla & Lavender Set", price=45.99, stock=25, attributes={"scent": "vanilla_lavender", "count": "2"}),
            ],
            views=650, clicks=52, cart_adds=19, purchases=7, conversion_rate=10.8
        ),
        Product(
            id="prod_beauty_lipstick_004",
            title="Matte Liquid Lipstick - Ruby Red",
            description="Long-lasting matte liquid lipstick with intense color payoff. Comfortable wear for up to 8 hours. Cruelty-free formula.",
            price=24.99,
            compare_at_price=34.99,
            category="beauty",
            tags=["lipstick", "matte", "long-lasting", "cruelty-free"],
            seller_id="seller_beauty_brand",
            seller_name="@BeautyBrand",
            seller_tier=TrustTier.GOLD,
            rating=4.6,
            review_count=432,
            media=[
                ProductMedia(url="https://via.placeholder.com/400x400/DC143C/FFF?text=Ruby+Red+Lipstick", type="image"),
            ],
            variants=[
                ProductVariant(id="var_007", sku="LIPSTICK-RUBY", title="Ruby Red", price=24.99, stock=45, attributes={"color": "ruby_red", "finish": "matte"}),
            ],
            views=1150, clicks=95, cart_adds=38, purchases=15, conversion_rate=15.8
        ),
    ]
    
    for product in sample_products:
        PRODUCTS_DB[product.id] = product

# Initialize sample data
init_sample_products()

# Event Tracking
async def track_shop_event(event_type: str, data: Dict[str, Any]):
    """Track shop events for analytics and ranker"""
    event = {
        "event": event_type,
        "timestamp": datetime.now().isoformat(),
        "data": data
    }
    print(f"🛍️ Shop Event: {event}")
    # In production, send to analytics pipeline

# === PHASE 2: SHOPPABLE VIDEO & IN-FEED CHECKOUT (Priority 1) ===

@router.post("/api/shop/videos/{video_id}/tag", tags=["shoppable_video"])
async def tag_video_products(video_id: str, request: ShoppableVideoRequest):
    """Tag products in a video for shoppable content"""
    if not INFEED_CHECKOUT_ENABLED:
        raise HTTPException(status_code=403, detail="In-feed checkout not enabled")
    
    # Clear existing tags for this video
    global VIDEO_TAGS_DB
    VIDEO_TAGS_DB = [tag for tag in VIDEO_TAGS_DB if tag.video_id != video_id]
    
    # Add new tags
    for tag_data in request.product_tags:
        product_id = tag_data.get("product_id")
        if product_id not in PRODUCTS_DB:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
        
        tag = VideoProductTag(
            video_id=video_id,
            product_id=product_id,
            variant_id=tag_data.get("variant_id"),
            position=tag_data.get("position", {})
        )
        VIDEO_TAGS_DB.append(tag)
        
        # Update product video_tags
        PRODUCTS_DB[product_id].video_tags.append(video_id)
    
    await track_shop_event("video_tagged", {
        "video_id": video_id,
        "product_count": len(request.product_tags)
    })
    
    return {"success": True, "video_id": video_id, "tags_count": len(request.product_tags)}

@router.get("/api/shop/videos/{video_id}/products", tags=["shoppable_video"])
async def get_video_products(video_id: str):
    """Get products tagged in a video"""
    tags = [tag for tag in VIDEO_TAGS_DB if tag.video_id == video_id]
    
    products = []
    for tag in tags:
        if tag.product_id in PRODUCTS_DB:
            product = PRODUCTS_DB[tag.product_id]
            variant = None
            if tag.variant_id:
                variant = next((v for v in product.variants if v.id == tag.variant_id), None)
            
            products.append({
                "product": product,
                "variant": variant,
                "position": tag.position,
                "tag_id": f"{tag.video_id}_{tag.product_id}"
            })
    
    await track_shop_event("video_products_viewed", {
        "video_id": video_id,
        "product_count": len(products)
    })
    
    return {"video_id": video_id, "products": products}

@router.post("/api/shop/checkout/mini", tags=["checkout"])
async def mini_checkout_session(
    product_id: str,
    variant_id: Optional[str] = None,
    quantity: int = 1,
    source: str = "feed",
    video_id: Optional[str] = None,
    user_id: str = "demo_user"  # In production, get from auth
):
    """Create mini-checkout session for in-feed purchases"""
    if not INFEED_CHECKOUT_ENABLED:
        raise HTTPException(status_code=403, detail="In-feed checkout not enabled")
    
    if product_id not in PRODUCTS_DB:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = PRODUCTS_DB[product_id]
    
    # Find variant or use first available
    variant = None
    if variant_id:
        variant = next((v for v in product.variants if v.id == variant_id), None)
    else:
        variant = product.variants[0] if product.variants else None
    
    if not variant:
        raise HTTPException(status_code=400, detail="No variant available")
    
    if variant.stock < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Calculate total
    total = variant.price * quantity
    
    # Create checkout session
    session_id = f"cs_{int(time.time())}_{uuid.uuid4().hex[:8]}"
    
    session_data = {
        "session_id": session_id,
        "product": product,
        "variant": variant,
        "quantity": quantity,
        "total": total,
        "source": source,
        "video_id": video_id,
        "user_id": user_id,
        "expires_at": (datetime.now() + timedelta(minutes=15)).isoformat()
    }
    
    await track_shop_event("mini_checkout_started", {
        "session_id": session_id,
        "product_id": product_id,
        "source": source,
        "video_id": video_id,
        "total": total
    })
    
    return session_data

@router.post("/api/shop/checkout/{session_id}/complete", tags=["checkout"])
async def complete_mini_checkout(
    session_id: str,
    payment_method: str = "sandbox_success",
    user_id: str = "demo_user"
):
    """Complete mini-checkout purchase"""
    # Simulate payment processing (in production, integrate with Stripe/Adyen)
    payment_success = payment_method != "sandbox_fail"
    
    if not payment_success:
        await track_shop_event("checkout_failed", {
            "session_id": session_id,
            "reason": "payment_failed"
        })
        raise HTTPException(status_code=400, detail="Payment failed")
    
    # Create order (simplified for demo)
    order_id = f"ord_{int(time.time())}_{uuid.uuid4().hex[:8]}"
    
    # For demo, create a basic order
    order = Order(
        id=order_id,
        user_id=user_id,
        seller_id="demo_seller",
        items=[],  # Would populate from session data
        total=99.99,  # Would get from session
        status=OrderStatus.PAID,
        payment_reference=f"pay_{uuid.uuid4().hex[:16]}",
        source="feed"
    )
    
    ORDERS_DB[order_id] = order
    
    await track_shop_event("purchase_completed", {
        "order_id": order_id,
        "session_id": session_id,
        "total": order.total,
        "source": order.source
    })
    
    return {
        "success": True,
        "order_id": order_id,
        "total": order.total,
        "status": order.status
    }

# === PHASE 1: CORE SHOP MVP ===

@router.get("/api/shop/products", tags=["products"])
async def get_products(
    query: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Product category"),
    sort: str = Query("relevance", description="Sort by: relevance, price_asc, price_desc, rating, newest"),
    limit: int = Query(20, le=100, description="Number of products to return"),
    cursor: Optional[str] = Query(None, description="Pagination cursor")
):
    """Get products with search, filtering, and pagination"""
    products = list(PRODUCTS_DB.values())
    
    # Filter by category
    if category:
        products = [p for p in products if p.category.lower() == category.lower()]
    
    # Search by query
    if query:
        query_lower = query.lower()
        products = [p for p in products if 
                   query_lower in p.title.lower() or 
                   query_lower in p.description.lower() or
                   any(tag.lower().startswith(query_lower) for tag in p.tags)]
    
    # Sort products
    if sort == "price_asc":
        products.sort(key=lambda x: x.price)
    elif sort == "price_desc":
        products.sort(key=lambda x: x.price, reverse=True)
    elif sort == "rating":
        products.sort(key=lambda x: x.rating, reverse=True)
    elif sort == "newest":
        products.sort(key=lambda x: x.created_at, reverse=True)
    else:  # relevance (default)
        # Sort by conversion rate and views
        products.sort(key=lambda x: (x.conversion_rate, x.views), reverse=True)
    
    # Pagination (simplified)
    start_idx = int(cursor) if cursor and cursor.isdigit() else 0
    end_idx = start_idx + limit
    page_products = products[start_idx:end_idx]
    
    # Track event
    await track_shop_event("products_browsed", {
        "query": query,
        "category": category,
        "sort": sort,
        "result_count": len(page_products)
    })
    
    next_cursor = str(end_idx) if end_idx < len(products) else None
    
    return {
        "products": page_products,
        "total": len(products),
        "has_more": next_cursor is not None,
        "next_cursor": next_cursor
    }

@router.get("/api/shop/products/{product_id}", tags=["products"])
async def get_product(product_id: str):
    """Get product details"""
    if product_id not in PRODUCTS_DB:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = PRODUCTS_DB[product_id]
    
    # Increment view count
    product.views += 1
    
    await track_shop_event("product_viewed", {
        "product_id": product_id,
        "seller_id": product.seller_id
    })
    
    return {"product": product}

@router.post("/api/shop/cart/add", tags=["cart"])
async def add_to_cart(
    product_id: str,
    variant_id: Optional[str] = None,
    quantity: int = 1,
    user_id: str = "demo_user"
):
    """Add product to cart"""
    if product_id not in PRODUCTS_DB:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = PRODUCTS_DB[product_id]
    
    # Find or create cart
    user_cart = None
    for cart in CARTS_DB.values():
        if cart.user_id == user_id:
            user_cart = cart
            break
    
    if not user_cart:
        user_cart = Cart(user_id=user_id)
        CARTS_DB[user_cart.id] = user_cart
    
    # Find variant
    variant = None
    if variant_id:
        variant = next((v for v in product.variants if v.id == variant_id), None)
    else:
        variant = product.variants[0] if product.variants else None
    
    if not variant:
        raise HTTPException(status_code=400, detail="Variant not found")
    
    # Check stock
    if variant.stock < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Add item to cart
    cart_item = CartItem(
        product_id=product_id,
        variant_id=variant.id,
        quantity=quantity,
        price_snapshot=variant.price
    )
    
    user_cart.items.append(cart_item)
    user_cart.total = sum(item.price_snapshot * item.quantity for item in user_cart.items)
    user_cart.updated_at = datetime.now()
    
    # Update product metrics
    product.cart_adds += 1
    
    await track_shop_event("add_to_cart", {
        "product_id": product_id,
        "variant_id": variant.id,
        "quantity": quantity,
        "cart_total": user_cart.total
    })
    
    return {"success": True, "cart": user_cart}

@router.get("/api/shop/cart", tags=["cart"])
async def get_cart(user_id: str = "demo_user"):
    """Get user's cart"""
    for cart in CARTS_DB.values():
        if cart.user_id == user_id:
            return {"cart": cart}
    
    # Return empty cart if not found
    return {"cart": Cart(user_id=user_id)}

@router.get("/api/shop/orders", tags=["orders"])
async def get_orders(user_id: str = "demo_user"):
    """Get user's orders"""
    user_orders = [order for order in ORDERS_DB.values() if order.user_id == user_id]
    user_orders.sort(key=lambda x: x.created_at, reverse=True)
    
    return {"orders": user_orders}

# === PHASE 3: LIVE SHOPPING ===

@router.post("/api/shop/live/{stream_id}/pin", tags=["live_shopping"])
async def pin_product_to_stream(
    stream_id: str,
    product_id: str,
    variant_id: Optional[str] = None,
    creator_id: str = "demo_creator"
):
    """Pin product to live stream"""
    if not LIVE_SHOPPING_ENABLED:
        raise HTTPException(status_code=403, detail="Live shopping not enabled")
    
    if product_id not in PRODUCTS_DB:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Remove existing pins for this stream (only one at a time for demo)
    global LIVE_PINS_DB
    LIVE_PINS_DB = [pin for pin in LIVE_PINS_DB if pin.stream_id != stream_id]
    
    # Add new pin
    pin = LiveProductPin(
        stream_id=stream_id,
        product_id=product_id,
        variant_id=variant_id,
        pinned_by=creator_id
    )
    LIVE_PINS_DB.append(pin)
    
    await track_shop_event("live_product_pinned", {
        "stream_id": stream_id,
        "product_id": product_id,
        "creator_id": creator_id
    })
    
    return {"success": True, "pin": pin}

@router.get("/api/shop/live/{stream_id}/products", tags=["live_shopping"])
async def get_live_stream_products(stream_id: str):
    """Get products pinned to live stream"""
    pins = [pin for pin in LIVE_PINS_DB if pin.stream_id == stream_id]
    
    products = []
    for pin in pins:
        if pin.product_id in PRODUCTS_DB:
            product = PRODUCTS_DB[pin.product_id]
            variant = None
            if pin.variant_id:
                variant = next((v for v in product.variants if v.id == pin.variant_id), None)
            
            products.append({
                "product": product,
                "variant": variant,
                "pinned_at": pin.pinned_at,
                "pinned_by": pin.pinned_by
            })
    
    return {"stream_id": stream_id, "products": products}

# Health Check
@router.get("/api/shop/health", tags=["health"])
async def shop_health():
    """Shop service health check"""
    return {
        "status": "healthy",
        "service": "AisleMarts Shop",
        "version": "1.0.0",
        "features": {
            "shop_enabled": SHOP_ENABLED,
            "infeed_checkout": INFEED_CHECKOUT_ENABLED,
            "live_shopping": LIVE_SHOPPING_ENABLED,
            "ar_tryon": AR_TRYON_ENABLED,
            "b2b_rfq": B2B_RFQ_ENABLED
        },
        "stats": {
            "products": len(PRODUCTS_DB),
            "carts": len(CARTS_DB),
            "orders": len(ORDERS_DB),
            "video_tags": len(VIDEO_TAGS_DB),
            "live_pins": len(LIVE_PINS_DB)
        },
        "timestamp": datetime.now().isoformat()
    }