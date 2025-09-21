"""
🎨 AisleMarts Creator Economy Routes
Comprehensive creator monetization and content management endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import json
import logging

from services.creator_economy_service import creator_economy_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/creator-economy", tags=["Creator Economy 🎨"])

class CreatorProfileRequest(BaseModel):
    display_name: str = Field(..., min_length=3, max_length=50)
    bio: str = Field(..., min_length=10, max_length=500)
    categories: List[str] = Field(..., min_items=1, max_items=5)
    social_links: Optional[Dict[str, str]] = Field(default_factory=dict)
    experience_level: str = Field(default="beginner", description="beginner, intermediate, expert")

class ContentPublishRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    type: str = Field(..., description="video, image, story, live")
    category: str = Field(...)
    tags: List[str] = Field(default_factory=list, max_items=10)
    featured_products: List[str] = Field(default_factory=list, max_items=20)
    sponsored: bool = Field(default=False)
    brand_partnership_id: Optional[str] = None

class BrandPartnershipRequest(BaseModel):
    brand_name: str = Field(..., min_length=2, max_length=100)
    campaign_type: str = Field(default="product_feature")
    duration: str = Field(default="30_days", description="7_days, 30_days, 90_days, ongoing")
    compensation_type: str = Field(default="commission_plus_fee")
    base_fee: float = Field(default=0.00, ge=0)
    commission_rate: float = Field(default=0.12, ge=0, le=1)
    content_count: int = Field(default=3, ge=1, le=20)
    minimum_reach: int = Field(default=1000, ge=100)
    required_hashtags: List[str] = Field(default_factory=list)
    deliverables: List[str] = Field(default_factory=list)

@router.post("/create-profile")
async def create_creator_profile(
    profile_data: CreatorProfileRequest,
    user_id: str = "current_user"
):
    """
    🎨 Create comprehensive creator profile for monetization
    """
    try:
        result = await creator_economy_service.create_creator_profile(
            user_id, 
            profile_data.model_dump()
        )
        return result
        
    except Exception as e:
        logger.error(f"Creator profile creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/publish-content")
async def publish_content(
    content_data: ContentPublishRequest,
    creator_id: str = Query(..., description="Creator ID from profile creation")
):
    """
    📱 Publish creator content with automatic monetization tracking
    """
    try:
        result = await creator_economy_service.publish_content(
            creator_id,
            content_data.model_dump()
        )
        return result
        
    except Exception as e:
        logger.error(f"Content publishing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/content-performance/{content_id}")
async def get_content_performance(content_id: str):
    """
    📊 Get detailed content performance analytics and earnings
    """
    try:
        result = await creator_economy_service.track_content_performance(content_id)
        return result
        
    except Exception as e:
        logger.error(f"Performance tracking error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/earnings/{creator_id}")
async def get_creator_earnings(
    creator_id: str,
    period: str = Query("current_month", description="current_month, last_month, quarterly, yearly")
):
    """
    💰 Get creator earnings with detailed breakdown and projections
    """
    try:
        valid_periods = ["current_month", "last_month", "quarterly", "yearly"]
        if period not in valid_periods:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid period. Must be one of: {valid_periods}"
            )
        
        result = await creator_economy_service.calculate_earnings(creator_id, period)
        return result
        
    except Exception as e:
        logger.error(f"Earnings calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/brand-partnership")
async def create_brand_partnership(
    partnership_data: BrandPartnershipRequest,
    creator_id: str = Query(..., description="Creator ID for partnership")
):
    """
    🤝 Create brand partnership opportunity for creator
    """
    try:
        result = await creator_economy_service.create_brand_partnership(
            creator_id,
            partnership_data.model_dump()
        )
        return result
        
    except Exception as e:
        logger.error(f"Brand partnership creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/{creator_id}")
async def get_creator_dashboard(creator_id: str):
    """
    📊 Get comprehensive creator dashboard with analytics and insights
    """
    try:
        result = await creator_economy_service.get_creator_dashboard(creator_id)
        return result
        
    except Exception as e:
        logger.error(f"Creator dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tier-requirements")
async def get_tier_requirements():
    """
    🏆 Get creator tier requirements and benefits
    """
    try:
        return {
            "success": True,
            "creator_tiers": {
                "emerging": {
                    "requirements": {
                        "followers": "0+",
                        "monthly_sales": "$0+",
                        "content_quality": "Basic"
                    },
                    "benefits": {
                        "commission_rate": "8%",
                        "payout_frequency": "Monthly",
                        "support_level": "Community"
                    }
                },
                "established": {
                    "requirements": {
                        "followers": "1,000+",
                        "monthly_sales": "$500+",
                        "content_quality": "High",
                        "engagement_rate": "5%+"
                    },
                    "benefits": {
                        "commission_rate": "10%",
                        "payout_frequency": "Bi-weekly",
                        "support_level": "Priority",
                        "brand_partnership_access": True
                    }
                },
                "premium": {
                    "requirements": {
                        "followers": "10,000+",
                        "monthly_sales": "$2,500+",
                        "content_quality": "Premium",
                        "engagement_rate": "8%+"
                    },
                    "benefits": {
                        "commission_rate": "12%",
                        "payout_frequency": "Weekly",
                        "support_level": "Dedicated manager",
                        "early_product_access": True,
                        "custom_landing_pages": True
                    }
                },
                "elite": {
                    "requirements": {
                        "followers": "100,000+",
                        "monthly_sales": "$10,000+",
                        "content_quality": "Elite",
                        "engagement_rate": "10%+"
                    },
                    "benefits": {
                        "commission_rate": "15%",
                        "payout_frequency": "Real-time",
                        "support_level": "Executive support",
                        "custom_product_collaboration": True,
                        "revenue_sharing_opportunities": True,
                        "exclusive_events": True
                    }
                }
            },
            "progression_tips": [
                "Focus on high-quality, engaging content",
                "Build genuine relationships with your audience",
                "Consistently promote products you believe in",
                "Engage with your community regularly",
                "Collaborate with other creators",
                "Stay updated with luxury trends"
            ]
        }
        
    except Exception as e:
        logger.error(f"Tier requirements error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending-opportunities")
async def get_trending_opportunities():
    """
    🔥 Get trending content opportunities and brand partnerships
    """
    try:
        return {
            "success": True,
            "trending_categories": [
                {
                    "category": "sustainable_luxury",
                    "growth": "+245%",
                    "average_engagement": "12.4%",
                    "brand_demand": "Very High",
                    "suggested_content": ["Eco-friendly unboxings", "Sustainable brand spotlights", "Green luxury lifestyle"]
                },
                {
                    "category": "tech_luxury",
                    "growth": "+189%",
                    "average_engagement": "8.7%",
                    "brand_demand": "High",
                    "suggested_content": ["Smart home luxury", "Premium tech reviews", "Digital lifestyle"]
                },
                {
                    "category": "wellness_luxury",
                    "growth": "+156%",
                    "average_engagement": "15.2%",
                    "brand_demand": "Very High",
                    "suggested_content": ["Premium wellness routines", "Luxury spa experiences", "Health tech reviews"]
                }
            ],
            "active_brand_campaigns": [
                {
                    "brand": "Luxury Watches Co",
                    "campaign": "Winter Elegance Collection",
                    "payout_range": "$500 - $2,000",
                    "requirements": "1K+ followers, luxury lifestyle content",
                    "deadline": "2025-02-15"
                },
                {
                    "brand": "Premium Skincare Inc",
                    "campaign": "New Year, New Glow",
                    "payout_range": "$300 - $1,500", 
                    "requirements": "Beauty/wellness content, 5%+ engagement",
                    "deadline": "2025-01-31"
                }
            ],
            "seasonal_trends": {
                "current_season": "Winter Luxury",
                "trending_hashtags": ["#WinterElegance", "#LuxuryWellness", "#SustainableLuxury"],
                "peak_posting_times": ["7-9 PM EST", "12-2 PM EST"],
                "content_tips": [
                    "Focus on cozy luxury aesthetics",
                    "Highlight premium winter collections",
                    "Showcase sustainable luxury options"
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Trending opportunities error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def creator_economy_health_check():
    """
    🏥 Creator Economy service health check
    """
    return {
        "status": "operational",
        "service": "AisleMarts Creator Economy Platform",
        "features": [
            "creator_profile_management",
            "content_monetization_tracking",
            "brand_partnership_matching",
            "performance_analytics",
            "tier_progression_system"
        ],
        "active_creators": len(creator_economy_service.creator_profiles),
        "total_partnerships": len(creator_economy_service.brand_partnerships),
        "average_creator_earnings": "$1,247/month",
        "platform_growth": "+67% quarter-over-quarter"
    }