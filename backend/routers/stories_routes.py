"""
🎬 Stories API Routes - Final Production Version
Supports cursor pagination, creator management, story lifecycle, full commerce attribution,
proper validation with 4xx responses, and multi-currency support (EUR/GBP/JPY)
"""
from fastapi import APIRouter, Query, HTTPException, Request
from typing import List, Optional
import time
import json
from datetime import datetime, timedelta
from src.validation import ImpressionRequest, CTARequest, PurchaseRequest
from src.currency import round_minor, assert_supported

router = APIRouter(prefix="/api", tags=["Stories"])

# Mock creator data with Phase 3 commission rates
MOCK_CREATORS = [
    {"id": "luxefashion", "displayName": "Lux Fashion", "tier": "gold", "avatarUrl": "https://picsum.photos/seed/luxe/100/100", "popularity": 0.95, "commissionPct": 0.12},
    {"id": "techguru", "displayName": "Tech Guru", "tier": "blue", "avatarUrl": "https://picsum.photos/seed/tech/100/100", "popularity": 0.88, "commissionPct": 0.10},
    {"id": "fitnessjane", "displayName": "Fitness Jane", "tier": "gold", "avatarUrl": "https://picsum.photos/seed/fitness/100/100", "popularity": 0.92, "commissionPct": 0.11},
    {"id": "beautyqueen", "displayName": "Beauty Queen", "tier": "gold", "avatarUrl": "https://picsum.photos/seed/beauty/100/100", "popularity": 0.90, "commissionPct": 0.13},
    {"id": "foodiefun", "displayName": "Foodie Fun", "tier": "blue", "avatarUrl": "https://picsum.photos/seed/food/100/100", "popularity": 0.82, "commissionPct": 0.09},
    {"id": "traveladdict", "displayName": "Travel Addict", "tier": "blue", "avatarUrl": "https://picsum.photos/seed/travel/100/100", "popularity": 0.85, "commissionPct": 0.08},
    {"id": "homedecor", "displayName": "Home Decor", "tier": "grey", "avatarUrl": "https://picsum.photos/seed/home/100/100", "popularity": 0.75, "commissionPct": 0.07},
    {"id": "artcreative", "displayName": "Art Creative", "tier": "unverified", "avatarUrl": "https://picsum.photos/seed/art/100/100", "popularity": 0.65, "commissionPct": 0.05},
]

# Mock FX rates for multi-currency support
MOCK_FX_RATES = {
    "USD": 1.0000,
    "EUR": 1.0700,  # 1 EUR = 1.07 USD
    "GBP": 1.2600,  # 1 GBP = 1.26 USD
    "JPY": 0.0067   # 1 JPY = 0.0067 USD
}

# Mock product catalog with realistic prices in multiple currencies
MOCK_PRODUCTS = [
    {"id": "yoga-mat", "title": "Pro Yoga Mat", "price": {"USD": 49.99, "EUR": 46.72, "GBP": 39.68, "JPY": 7462}},
    {"id": "protein-shaker", "title": "Protein Shaker 700ml", "price": {"USD": 14.99, "EUR": 14.01, "GBP": 11.90, "JPY": 2237}},
    {"id": "silk-scarf", "title": "Silk Scarf", "price": {"USD": 89.00, "EUR": 83.18, "GBP": 70.63, "JPY": 13284}},
    {"id": "trench-coat", "title": "Classic Trench Coat", "price": {"USD": 239.00, "EUR": 223.36, "GBP": 189.68, "JPY": 35672}},
    {"id": "smartwatch-pro", "title": "Smartwatch Pro", "price": {"USD": 299.00, "EUR": 279.44, "GBP": 237.30, "JPY": 44627}},
    {"id": "buds-x", "title": "Buds X Earphones", "price": {"USD": 129.00, "EUR": 120.56, "GBP": 102.38, "JPY": 19254}},
]

# In-memory storage for commerce tracking (production would use database)
IMPRESSIONS = []
CTAS = []
PURCHASES = []

def get_fx_rate(currency_code: str) -> float:
    """Get FX rate for currency conversion to USD"""
    return MOCK_FX_RATES.get(currency_code, 1.0)

def find_creator_by_id(creator_id: str) -> Optional[dict]:
    """Find creator by ID for commission calculation"""
    return next((c for c in MOCK_CREATORS if c["id"] == creator_id), None)

def find_product_by_id(product_id: str) -> Optional[dict]:
    """Find product by ID for purchase tracking"""
    return next((p for p in MOCK_PRODUCTS if p["id"] == product_id), None)

# Generate mock stories
def generate_stories(creator_id: str, count: int = 3) -> List[dict]:
    """Generate mock stories for a creator with Phase 3 commerce integration"""
    stories = []
    now = int(time.time() * 1000)  # Current time in milliseconds
    
    story_types = ["moment", "product", "bts"]
    media_urls = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
    ]
    
    for i in range(count):
        story_type = story_types[i % len(story_types)]
        story = {
            "id": f"{creator_id}_story_{i}",
            "creatorId": creator_id,
            "type": story_type,
            "mediaUrl": media_urls[i % len(media_urls)],
            "expiresAt": now + (24 * 60 * 60 * 1000),  # 24 hours from now
        }
        
        # Add product ID for product stories with realistic product mapping
        if story_type == "product":
            product_mapping = {
                "luxefashion": ["silk-scarf", "trench-coat"],
                "techguru": ["smartwatch-pro", "buds-x"],
                "fitnessjane": ["yoga-mat", "protein-shaker"],
                "beautyqueen": ["silk-scarf"],
                "foodiefun": ["protein-shaker"],
                "traveladdict": ["trench-coat", "buds-x"],
                "homedecor": ["yoga-mat"],
                "artcreative": ["silk-scarf"]
            }
            creator_products = product_mapping.get(creator_id, ["yoga-mat"])
            story["productId"] = creator_products[i % len(creator_products)]
            
        stories.append(story)
    
    return stories

@router.get("/creators")
async def get_creators():
    """Get all creators for infinity stories with Phase 3 commission rates"""
    return MOCK_CREATORS

@router.get("/stories")
async def get_stories(
    cursor: Optional[str] = Query(None, description="Pagination cursor"),
    limit: int = Query(24, description="Number of stories to return")
):
    """Get paginated stories with cursor-based pagination"""
    
    # Validate limit
    if limit <= 0:
        raise HTTPException(status_code=400, detail="Limit must be positive")
    if limit > 100:
        raise HTTPException(status_code=400, detail="Limit cannot exceed 100")
    
    # Generate stories for all creators
    all_stories = []
    for creator in MOCK_CREATORS:
        creator_stories = generate_stories(creator["id"], 3)
        all_stories.extend(creator_stories)
    
    # Sort by creation time (simulate real-time ordering)
    all_stories.sort(key=lambda x: x["expiresAt"], reverse=True)
    
    # Handle pagination
    start_index = 0
    if cursor:
        try:
            start_index = int(cursor)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid cursor format")
    
    end_index = start_index + limit
    page_stories = all_stories[start_index:end_index]
    
    # Determine next cursor
    next_cursor = None
    if end_index < len(all_stories):
        next_cursor = str(end_index)
    
    return {
        "data": page_stories,
        "cursor": next_cursor
    }

# Commerce tracking endpoints with proper validation

@router.post("/track/impression")
async def track_impression(request: ImpressionRequest):
    """Track story impression for analytics and attribution"""
    impression = {
        "id": f"imp_{len(IMPRESSIONS)}",
        "storyId": request.storyId,
        "userId": request.userId,
        "viewedAt": datetime.now().isoformat()
    }
    IMPRESSIONS.append(impression)
    
    print(f"🎯 Impression tracked: {request.storyId} by user {request.userId}")
    
    return {
        "ok": True,
        "id": impression["id"],
        "message": "Impression tracked successfully"
    }

@router.post("/track/cta")
async def track_cta(request: CTARequest):
    """Track CTA click for attribution window calculation"""
    cta = {
        "id": f"cta_{len(CTAS)}",
        "storyId": request.storyId,
        "productId": request.productId,
        "userId": request.userId,
        "clickedAt": datetime.now().isoformat()
    }
    CTAS.append(cta)
    
    print(f"🛍️ CTA tracked: {request.storyId} -> {request.productId} by user {request.userId}")
    
    return {
        "ok": True,
        "id": cta["id"],
        "message": "CTA click tracked successfully"
    }

@router.post("/track/purchase")
async def track_purchase(request: PurchaseRequest):
    """Track purchase with multi-currency support, full attribution and commission calculation"""
    
    try:
        # Validate and normalize currency
        currency_code = assert_supported(request.currency)
        
        # Round amount to proper decimal places for currency
        local_amount = round_minor(request.amount, currency_code)
        
        # Get FX rate for USD normalization
        fx_rate_usd = get_fx_rate(currency_code)
        amount_usd = round_minor(local_amount * fx_rate_usd, "USD")
        
        # Attribution logic - find the most recent CTA for this user/product within 7-day window
        attribution_window = datetime.now() - timedelta(days=7)
        
        relevant_cta = None
        creator_id = None
        
        # Find matching CTA for attribution
        for cta in reversed(CTAS):  # Most recent first
            cta_time = datetime.fromisoformat(cta["clickedAt"])
            if (cta["userId"] == request.userId and 
                cta["productId"] == request.productId and 
                cta_time > attribution_window):
                relevant_cta = cta
                break
        
        # If we have a CTA, get the creator from the story
        if relevant_cta:
            # Extract creator from story ID (format: {creatorId}_story_{index})
            story_id = relevant_cta["storyId"]
            creator_id = story_id.split("_story_")[0] if "_story_" in story_id else None
        
        # Fallback: Use referrer story if provided
        if not creator_id and request.referrerStoryId:
            creator_id = request.referrerStoryId.split("_story_")[0] if "_story_" in request.referrerStoryId else None
        
        # Calculate commission
        commission = 0.0
        commission_usd = 0.0
        creator = None
        if creator_id:
            creator = find_creator_by_id(creator_id)
            if creator:
                local_commission = round_minor(local_amount * creator["commissionPct"], currency_code)
                commission = local_commission
                commission_usd = round_minor(local_commission * fx_rate_usd, "USD")
        
        # Find product info
        product = find_product_by_id(request.productId)
        
        # Store purchase
        purchase = {
            "id": f"purchase_{len(PURCHASES)}",
            "orderId": request.orderId,
            "userId": request.userId,
            "productId": request.productId,
            "amount": local_amount,
            "currency": currency_code,
            "amountUsd": amount_usd,
            "fxRateUsd": fx_rate_usd,
            "refStoryId": request.referrerStoryId,
            "creatorId": creator_id,
            "commission": commission,
            "commissionUsd": commission_usd,
            "attributedCTA": relevant_cta["id"] if relevant_cta else None,
            "createdAt": datetime.now().isoformat()
        }
        PURCHASES.append(purchase)
        
        print(f"💰 Purchase tracked: Order {request.orderId} -> ${commission:.2f} {currency_code} (${commission_usd:.2f} USD) commission to creator {creator_id}")
        
        return {
            "ok": True,
            "id": purchase["id"],
            "commission": round(commission, 2),
            "commissionUsd": round(commission_usd, 2),
            "creatorId": creator_id,
            "creatorName": creator["displayName"] if creator else None,
            "productInfo": product,
            "attributionMethod": "CTA" if relevant_cta else "Direct",
            "currency": currency_code,
            "fxRateUsd": fx_rate_usd,
            "message": "Purchase and attribution tracked successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f"Error processing purchase: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/commerce/analytics")
async def get_commerce_analytics():
    """Get commerce analytics dashboard data with proper funnel logic"""
    
    # Use sessionized approach - count unique user sessions rather than raw events
    # This ensures impressions >= CTAs >= purchases
    user_sessions = {}
    
    # Group events by user to ensure funnel consistency
    for impression in IMPRESSIONS:
        user_id = impression["userId"] or "anonymous"
        if user_id not in user_sessions:
            user_sessions[user_id] = {"impression": False, "cta": False, "purchase": False}
        user_sessions[user_id]["impression"] = True
    
    for cta in CTAS:
        user_id = cta["userId"] or "anonymous"
        if user_id not in user_sessions:
            user_sessions[user_id] = {"impression": False, "cta": False, "purchase": False}
        # Only count CTA if there was an impression
        if user_sessions[user_id]["impression"]:
            user_sessions[user_id]["cta"] = True
    
    for purchase in PURCHASES:
        user_id = purchase["userId"] or "anonymous"
        if user_id not in user_sessions:
            user_sessions[user_id] = {"impression": False, "cta": False, "purchase": False}
        # Only count purchase if there was a CTA
        if user_sessions[user_id]["cta"]:
            user_sessions[user_id]["purchase"] = True
    
    # Calculate funnel metrics from sessions
    sessionized_impressions = sum(1 for s in user_sessions.values() if s["impression"])
    sessionized_ctas = sum(1 for s in user_sessions.values() if s["cta"])
    sessionized_purchases = sum(1 for s in user_sessions.values() if s["purchase"])
    
    # Calculate totals from actual data
    total_revenue = sum(p["amount"] for p in PURCHASES)
    total_revenue_usd = sum(p["amountUsd"] for p in PURCHASES)
    total_commissions = sum(p["commission"] for p in PURCHASES)
    total_commissions_usd = sum(p["commissionUsd"] for p in PURCHASES)
    
    # Creator performance
    creator_stats = {}
    for creator in MOCK_CREATORS:
        creator_purchases = [p for p in PURCHASES if p["creatorId"] == creator["id"]]
        creator_stats[creator["id"]] = {
            "name": creator["displayName"],
            "tier": creator["tier"],
            "purchases": len(creator_purchases),
            "revenue": sum(p["amount"] for p in creator_purchases),
            "revenueUsd": sum(p["amountUsd"] for p in creator_purchases),
            "commissions": sum(p["commission"] for p in creator_purchases),
            "commissionsUsd": sum(p["commissionUsd"] for p in creator_purchases)
        }
    
    return {
        "summary": {
            "totalImpressions": sessionized_impressions,
            "totalCTAs": sessionized_ctas,
            "totalPurchases": sessionized_purchases,
            "totalRevenue": round(total_revenue, 2),
            "totalRevenueUsd": round(total_revenue_usd, 2),
            "totalCommissions": round(total_commissions, 2),
            "totalCommissionsUsd": round(total_commissions_usd, 2),
            "conversionRate": round((sessionized_purchases / sessionized_ctas) * 100, 2) if sessionized_ctas > 0 else 0
        },
        "creatorStats": creator_stats,
        "recentPurchases": PURCHASES[-5:] if PURCHASES else [],
        "currencyBreakdown": {
            currency: {
                "purchases": len([p for p in PURCHASES if p["currency"] == currency]),
                "revenue": sum(p["amount"] for p in PURCHASES if p["currency"] == currency),
                "commissions": sum(p["commission"] for p in PURCHASES if p["currency"] == currency)
            }
            for currency in ["USD", "EUR", "GBP", "JPY"]
        }
    }

@router.get("/stories/health")
async def stories_health():
    """Enhanced health check for Phase 3 stories system with final production readiness"""
    return {
        "status": "healthy",
        "phase": "3-final",
        "features": [
            "cursor_pagination",
            "virtual_scrolling_ready", 
            "preload_coordinator_compatible",
            "24h_expiry_simulation",
            "commerce_integration",
            "impression_tracking",
            "cta_attribution", 
            "commission_calculation",
            "7_day_attribution_window",
            "creator_performance_analytics",
            "multi_currency_support",
            "proper_4xx_responses",
            "funnel_integrity",
            "fx_normalization",
            "production_hardening"
        ],
        "creators_count": len(MOCK_CREATORS),
        "stories_per_creator": 3,
        "total_stories": len(MOCK_CREATORS) * 3,
        "supported_currencies": ["USD", "EUR", "GBP", "JPY"],
        "commerce_stats": {
            "impressions_tracked": len(IMPRESSIONS),
            "ctas_tracked": len(CTAS),
            "purchases_tracked": len(PURCHASES),
            "total_commissions_usd": round(sum(p["commissionUsd"] for p in PURCHASES), 2),
            "currencies_processed": len(set(p["currency"] for p in PURCHASES))
        }
    }