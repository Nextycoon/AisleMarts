"""
📱💻 AisleMarts Digital Commerce Routes
Global digital marketplace - Apps, E-books, Software, NFTs, and E-products integration
"""

from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import json
import logging

from services.digital_commerce_service import digital_commerce_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/digital-commerce", tags=["Digital Commerce 📱💻"])

class DigitalProductSearch(BaseModel):
    query: str = Field(..., min_length=1, max_length=200)
    category: str = Field(default="all", description="Product category filter")
    platforms: Optional[List[str]] = Field(default=None, description="Specific platforms to search")
    price_range: Optional[Dict[str, float]] = Field(default=None, description="Min/max price filter")
    limit: int = Field(default=20, ge=1, le=100)

class CreatorProductRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    category: str = Field(..., description="E-product category")
    type: str = Field(..., description="Specific product type")
    price: float = Field(..., ge=0.99, le=9999.99)
    currency: str = Field(default="USD")
    description: str = Field(..., min_length=10, max_length=2000)
    file_size_mb: Optional[float] = Field(None, ge=0.1, le=5000)
    license: str = Field(default="standard", description="License type")
    tags: List[str] = Field(default_factory=list, max_items=10)

class DigitalPurchaseRequest(BaseModel):
    product_id: str = Field(...)
    platform: str = Field(...)
    payment_method: str = Field(default="aislemarts_balance")
    delivery_email: Optional[str] = Field(None, description="Email for digital delivery")

@router.post("/search")
async def search_global_digital_products(request: DigitalProductSearch):
    """
    🔍 Search across ALL global digital commerce platforms
    """
    try:
        result = await digital_commerce_service.search_global_digital_products(
            request.query,
            request.category,
            request.limit
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Search failed"))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Digital product search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/platforms")
async def get_supported_platforms():
    """
    🌐 Get all supported digital commerce platforms
    """
    try:
        result = await digital_commerce_service.get_digital_platforms_stats()
        return result
    except Exception as e:
        logger.error(f"Platforms retrieval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/creator/publish")
async def publish_creator_product(
    creator_product: CreatorProductRequest,
    creator_id: str = Query(..., description="Creator ID"),
    background_tasks: BackgroundTasks = None
):
    """
    🎨 Enable creators to publish digital products directly on AisleMarts
    """
    try:
        result = await digital_commerce_service.create_creator_product(
            creator_id,
            creator_product.model_dump()
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Product creation failed"))
        
        # Add background tasks for AI optimization
        if background_tasks:
            background_tasks.add_task(
                _optimize_creator_product,
                result["product"]["product_id"]
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Creator product publishing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def _optimize_creator_product(product_id: str):
    """Background task for AI-powered product optimization"""
    logger.info(f"AI optimizing creator product: {product_id}")
    # In production: AI-powered description enhancement, SEO optimization, etc.

@router.post("/purchase")
async def purchase_digital_product(purchase_request: DigitalPurchaseRequest, user_id: str = Query(...)):
    """
    💳 Unified checkout for digital products from any global platform
    """
    try:
        result = await digital_commerce_service.process_digital_purchase(
            user_id,
            purchase_request.product_id,
            purchase_request.platform
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Purchase failed"))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Digital purchase error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories")
async def get_digital_product_categories():
    """
    📋 Get all available digital product categories
    """
    try:
        return {
            "success": True,
            "categories": {
                "mobile_apps": {
                    "name": "Mobile Apps",
                    "platforms": ["Apple App Store", "Google Play", "Huawei AppGallery"],
                    "subcategories": ["productivity", "games", "social", "entertainment", "education"],
                    "total_products": "2.8M+ apps"
                },
                "software": {
                    "name": "Desktop Software",
                    "platforms": ["Microsoft Store", "Mac App Store", "Steam"],
                    "subcategories": ["creative_tools", "productivity", "developer_tools", "games"],
                    "total_products": "500K+ applications"
                },
                "digital_media": {
                    "name": "Digital Media",
                    "platforms": ["Amazon Kindle", "Audible", "Spotify"],
                    "subcategories": ["ebooks", "audiobooks", "music", "podcasts", "videos"],
                    "total_products": "50M+ media items"
                },
                "creative_assets": {
                    "name": "Creative Assets",
                    "platforms": ["Envato Market", "Shutterstock", "Adobe Stock"],
                    "subcategories": ["templates", "graphics", "photos", "videos", "3d_models"],
                    "total_products": "200M+ assets"
                },
                "online_courses": {
                    "name": "Online Courses",
                    "platforms": ["Udemy", "Coursera", "Skillshare"],
                    "subcategories": ["programming", "design", "business", "marketing", "languages"],
                    "total_products": "100K+ courses"
                },
                "nfts_digital_art": {
                    "name": "NFTs & Digital Art",
                    "platforms": ["OpenSea", "Rarible", "Foundation"],
                    "subcategories": ["art", "collectibles", "music", "photography", "gaming_items"],
                    "total_products": "10M+ NFTs"
                }
            },
            "market_size": "$1.37T total addressable digital market",
            "aislemarts_advantage": "First platform to unify ALL digital commerce platforms globally"
        }
    except Exception as e:
        logger.error(f"Categories retrieval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
async def get_trending_digital_products(
    category: str = Query("all", description="Category filter"),
    region: str = Query("global", description="Regional trends"),
    timeframe: str = Query("weekly", description="Trending timeframe")
):
    """
    🔥 Get trending digital products across all platforms
    """
    try:
        # Mock trending data (in production: real-time trend analysis)
        trending_products = {
            "trending_period": timeframe,
            "region": region,
            "category": category,
            "top_trending": [
                {
                    "rank": 1,
                    "name": "ChatGPT Mobile App",
                    "platform": "apple_app_store",
                    "category": "productivity",
                    "growth": "+2840%",
                    "downloads_24h": 45000,
                    "price": "Free with IAP"
                },
                {
                    "rank": 2,
                    "name": "AI Art Generator Pro",
                    "platform": "google_play",
                    "category": "creative_tools",
                    "growth": "+1250%", 
                    "downloads_24h": 28000,
                    "price": "$4.99"
                },
                {
                    "rank": 3,
                    "name": "Luxury Lifestyle NFT Collection",
                    "platform": "opensea",
                    "category": "nfts",
                    "growth": "+890%",
                    "volume_24h": "45.2 ETH",
                    "floor_price": "0.08 ETH"
                },
                {
                    "rank": 4,
                    "name": "E-commerce Mastery 2024",
                    "platform": "udemy",
                    "category": "business_course",
                    "growth": "+675%",
                    "enrollments_24h": 1200,
                    "price": "$89.99"
                },
                {
                    "rank": 5,
                    "name": "Premium Website Templates Bundle",
                    "platform": "envato_market",
                    "category": "web_templates",
                    "growth": "+445%",
                    "downloads_24h": 890,
                    "price": "$49.00"
                }
            ],
            "trend_analysis": {
                "ai_powered_tools": "+300% average growth",
                "nft_collections": "+250% trading volume",
                "online_courses": "+180% enrollment growth",
                "mobile_productivity": "+150% download growth"
            }
        }
        
        return {
            "success": True,
            "trending_data": trending_products,
            "market_insights": [
                "AI-powered tools dominating all categories",
                "NFT market showing strong recovery",
                "Mobile-first productivity apps gaining traction",
                "Online learning continues explosive growth"
            ]
        }
    except Exception as e:
        logger.error(f"Trending products error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/creator/dashboard/{creator_id}")
async def get_creator_digital_dashboard(creator_id: str):
    """
    📊 Get comprehensive creator dashboard for digital products
    """
    try:
        # Mock creator dashboard (in production: real creator analytics)
        dashboard_data = {
            "creator_id": creator_id,
            "digital_products": {
                "published": 8,
                "pending_review": 2,
                "total_downloads": 15420,
                "total_revenue": 3247.80,
                "avg_rating": 4.7
            },
            "top_performing": [
                {
                    "name": "Premium E-commerce Templates",
                    "downloads": 5420,
                    "revenue": 1247.80,
                    "rating": 4.8,
                    "platform": "envato_market"
                },
                {
                    "name": "Digital Marketing Course",
                    "enrollments": 892,
                    "revenue": 890.50,
                    "rating": 4.9,
                    "platform": "udemy"
                }
            ],
            "earnings_breakdown": {
                "this_month": 847.30,
                "last_month": 692.15,
                "growth": "+22.4%",
                "payout_ready": 3247.80,
                "next_payout": "2025-01-25"
            },
            "platform_performance": {
                "envato_market": {"revenue": 1450.20, "products": 3},
                "udemy": {"revenue": 890.50, "products": 2},
                "aislemarts_direct": {"revenue": 907.10, "products": 3}
            },
            "optimization_tips": [
                "Add more keywords to improve discoverability",
                "Create video previews to increase conversion by 40%",
                "Bundle complementary products for higher average sale value",
                "Engage with customer reviews to boost algorithm ranking"
            ]
        }
        
        return {
            "success": True,
            "creator_dashboard": dashboard_data,
            "growth_opportunities": [
                "Expand to new digital product categories",
                "Create course bundles for higher value sales", 
                "Partner with other creators for collaborative products",
                "Leverage AisleMarts AI optimization for better performance"
            ]
        }
    except Exception as e:
        logger.error(f"Creator dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_digital_commerce_analytics():
    """
    📈 Get comprehensive digital commerce platform analytics
    """
    try:
        result = await digital_commerce_service.get_digital_platforms_stats()
        return result
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def digital_commerce_health_check():
    """
    🏥 Digital commerce service health check
    """
    return {
        "status": "operational",
        "service": "AisleMarts Global Digital Commerce Platform",
        "features": [
            "global_digital_platform_integration",
            "creator_product_publishing",
            "unified_digital_checkout",
            "cross_platform_search",
            "ai_powered_optimization"
        ],
        "platforms_integrated": 22,
        "total_digital_products": "365M+ products across all platforms",
        "creator_tools": "Advanced publishing and monetization suite",
        "unified_experience": "Single checkout for physical + digital products",
        "market_coverage": "$1.37T digital commerce market",
        "competitive_advantage": "First platform to unify ALL digital commerce globally"
    }