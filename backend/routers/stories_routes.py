"""
🎬 Stories API Routes - Phase 3 Commerce Integration
Supports cursor pagination, creator management, story lifecycle, and full commerce attribution
"""
from fastapi import APIRouter, Query, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
import time
import json
from datetime import datetime, timedelta

router = APIRouter(prefix="/api", tags=["Stories"])

# Phase 3: Commerce tracking models
class ImpressionRequest(BaseModel):
    storyId: str
    userId: Optional[str] = None

class CTARequest(BaseModel):
    storyId: str
    productId: Optional[str] = None
    userId: Optional[str] = None

class PurchaseRequest(BaseModel):
    orderId: str
    userId: Optional[str] = None
    productId: str
    amount: float
    currency: str
    referrerStoryId: Optional[str] = None

# Mock creator data (matches Phase 2 implementation + Phase 3 commission rates)
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

# Phase 3: Mock product catalog with realistic prices
MOCK_PRODUCTS = [
    {"id": "yoga-mat", "title": "Pro Yoga Mat", "price": 49.99, "currency": "USD"},
    {"id": "protein-shaker", "title": "Protein Shaker 700ml", "price": 14.99, "currency": "USD"},
    {"id": "silk-scarf", "title": "Silk Scarf", "price": 89.00, "currency": "USD"},
    {"id": "trench-coat", "title": "Classic Trench Coat", "price": 239.00, "currency": "USD"},
    {"id": "smartwatch-pro", "title": "Smartwatch Pro", "price": 299.00, "currency": "USD"},
    {"id": "buds-x", "title": "Buds X Earphones", "price": 129.00, "currency": "USD"},
]

# Phase 3: In-memory storage for commerce tracking (production would use database)
IMPRESSIONS = []
CTAS = []
PURCHASES = []

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
        
        # Phase 3: Add product ID for product stories with realistic product mapping
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

def find_creator_by_id(creator_id: str) -> Optional[dict]:
    """Find creator by ID for commission calculation"""
    return next((c for c in MOCK_CREATORS if c["id"] == creator_id), None)

def find_product_by_id(product_id: str) -> Optional[dict]:
    """Find product by ID for purchase tracking"""
    return next((p for p in MOCK_PRODUCTS if p["id"] == product_id), None)

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
            start_index = 0
    
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

# Phase 3: Commerce tracking endpoints

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
    """Track purchase with full attribution and commission calculation"""
    
    # Phase 3: Advanced attribution logic
    # 1. Find the most recent CTA for this user/product within 7-day window
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
    creator = None
    if creator_id:
        creator = find_creator_by_id(creator_id)
        if creator:
            commission = request.amount * creator["commissionPct"]
    
    # Find product info
    product = find_product_by_id(request.productId)
    
    # Store purchase
    purchase = {
        "id": f"purchase_{len(PURCHASES)}",
        "orderId": request.orderId,
        "userId": request.userId,
        "productId": request.productId,
        "amount": request.amount,
        "currency": request.currency,
        "refStoryId": request.referrerStoryId,
        "creatorId": creator_id,
        "commission": commission,
        "attributedCTA": relevant_cta["id"] if relevant_cta else None,
        "createdAt": datetime.now().isoformat()
    }
    PURCHASES.append(purchase)
    
    print(f"💰 Purchase tracked: Order {request.orderId} -> ${commission:.2f} commission to creator {creator_id}")
    
    return {
        "ok": True,
        "id": purchase["id"],
        "commission": round(commission, 2),
        "creatorId": creator_id,
        "creatorName": creator["displayName"] if creator else None,
        "productInfo": product,
        "attributionMethod": "CTA" if relevant_cta else "Direct",
        "message": "Purchase and attribution tracked successfully"
    }

@router.get("/commerce/analytics")
async def get_commerce_analytics():
    """Get commerce analytics dashboard data"""
    
    # Calculate totals
    total_impressions = len(IMPRESSIONS)
    total_ctas = len(CTAS)
    total_purchases = len(PURCHASES)
    total_revenue = sum(p["amount"] for p in PURCHASES)
    total_commissions = sum(p["commission"] for p in PURCHASES)
    
    # Creator performance
    creator_stats = {}
    for creator in MOCK_CREATORS:
        creator_purchases = [p for p in PURCHASES if p["creatorId"] == creator["id"]]
        creator_stats[creator["id"]] = {
            "name": creator["displayName"],
            "tier": creator["tier"],
            "purchases": len(creator_purchases),
            "revenue": sum(p["amount"] for p in creator_purchases),
            "commissions": sum(p["commission"] for p in creator_purchases)
        }
    
    return {
        "summary": {
            "totalImpressions": total_impressions,
            "totalCTAs": total_ctas,
            "totalPurchases": total_purchases,
            "totalRevenue": round(total_revenue, 2),
            "totalCommissions": round(total_commissions, 2),
            "conversionRate": round((total_purchases / total_ctas) * 100, 2) if total_ctas > 0 else 0
        },
        "creatorStats": creator_stats,
        "recentPurchases": PURCHASES[-5:] if PURCHASES else []
    }

@router.get("/stories/health")
async def stories_health():
    """Enhanced health check for Phase 3 stories system"""
    return {
        "status": "healthy",
        "phase": "3",
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
            "creator_performance_analytics"
        ],
        "creators_count": len(MOCK_CREATORS),
        "stories_per_creator": 3,
        "total_stories": len(MOCK_CREATORS) * 3,
        "commerce_stats": {
            "impressions_tracked": len(IMPRESSIONS),
            "ctas_tracked": len(CTAS),
            "purchases_tracked": len(PURCHASES),
            "total_commissions": round(sum(p["commission"] for p in PURCHASES), 2)
        }
    }