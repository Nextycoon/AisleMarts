from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random

from services.social_commerce_service import SocialCommerceService
from models.social_commerce import (
    ShoppableContent, InfluencerProfile, InfluencerCampaign, 
    SocialShoppingGroup, GroupPurchase, UserGeneratedContent,
    SocialProof, SocialCommerceMetrics, PersonalizedFeed,
    CreateShoppableContentRequest, InfluencerSearchRequest,
    CampaignCreateRequest, GroupPurchaseRequest, ContentType
)

router = APIRouter()
social_commerce = SocialCommerceService()


@router.get("/health")
async def health_check():
    """Health check for Social Commerce Service"""
    return {
        "status": "operational",
        "service": "AisleMarts Advanced Social Commerce Platform",
        "features": [
            "shoppable_content_creation",
            "influencer_marketplace",
            "campaign_management", 
            "social_shopping_groups",
            "group_purchasing",
            "ugc_content_curation",
            "social_proof_engine",
            "personalized_feeds",
            "creator_monetization",
            "advanced_analytics"
        ],
        "platform_stats": {
            "total_content": len(social_commerce.shoppable_content),
            "active_influencers": len(social_commerce.influencer_profiles),
            "active_campaigns": len([c for c in social_commerce.campaigns.values() if c.status.value == "active"]),
            "shopping_groups": len(social_commerce.shopping_groups),
            "group_purchases": len(social_commerce.group_purchases)
        },
        "ai_integration": "emergent_llm" if social_commerce.ai_assistant else "mock_mode",
        "timestamp": datetime.now()
    }


# Shoppable Content Endpoints
@router.post("/content/create")
async def create_shoppable_content(
    creator_id: str = Query(..., description="Creator user ID"),
    content_type: str = Query(..., description="Content type: post, video, story, live_stream, carousel, reel"),
    title: str = Query(..., description="Content title"),
    description: str = Query(..., description="Content description"),
    media_urls: str = Query(..., description="JSON array of media URLs"),
    hashtags: str = Query("[]", description="JSON array of hashtags"),
    location: Optional[str] = Query(None, description="Location tag"),
    is_sponsored: bool = Query(False, description="Is this sponsored content"),
    sponsor_brand: Optional[str] = Query(None, description="Sponsor brand name")
) -> ShoppableContent:
    """Create new shoppable content"""
    try:
        import json
        
        request = CreateShoppableContentRequest(
            content_type=ContentType(content_type),
            title=title,
            description=description,
            media_urls=json.loads(media_urls),
            hashtags=json.loads(hashtags),
            location=location,
            is_sponsored=is_sponsored,
            sponsor_brand=sponsor_brand
        )
        
        content = await social_commerce.create_shoppable_content(creator_id, request)
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create content: {str(e)}")


@router.get("/content/{content_id}")
async def get_shoppable_content(content_id: str) -> ShoppableContent:
    """Get specific shoppable content"""
    content = social_commerce.shoppable_content.get(content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content


@router.get("/content/{content_id}/performance")
async def get_content_performance(content_id: str):
    """Get detailed performance analytics for content"""
    try:
        performance = await social_commerce.get_content_performance(content_id)
        return performance
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance: {str(e)}")


@router.get("/content/trending")
async def get_trending_content(
    content_type: Optional[str] = Query(None, description="Filter by content type"),
    limit: int = Query(20, description="Number of items to return")
) -> List[ShoppableContent]:
    """Get trending shoppable content"""
    try:
        all_content = list(social_commerce.shoppable_content.values())
        
        if content_type:
            all_content = [c for c in all_content if c.content_type.value == content_type]
        
        # Sort by engagement and revenue
        trending = sorted(
            all_content,
            key=lambda x: x.engagement_count * 0.7 + x.revenue_generated * 0.3,
            reverse=True
        )
        
        return trending[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trending content: {str(e)}")


# Influencer Marketplace Endpoints
@router.get("/influencers/search")
async def search_influencers(
    specialties: Optional[str] = Query(None, description="JSON array of specialties"),
    min_followers: Optional[int] = Query(None, description="Minimum follower count"),
    max_followers: Optional[int] = Query(None, description="Maximum follower count"),
    engagement_rate_min: Optional[float] = Query(None, description="Minimum engagement rate"),
    limit: int = Query(20, description="Number of results")
) -> List[InfluencerProfile]:
    """Search for influencers"""
    try:
        import json
        
        request = InfluencerSearchRequest(
            specialties=json.loads(specialties) if specialties else None,
            min_followers=min_followers,
            max_followers=max_followers,
            engagement_rate_min=engagement_rate_min
        )
        
        results = await social_commerce.search_influencers(request)
        return results[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/influencers/{influencer_id}")
async def get_influencer_profile(influencer_id: str) -> InfluencerProfile:
    """Get influencer profile"""
    profile = social_commerce.influencer_profiles.get(influencer_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Influencer not found")
    return profile


@router.get("/influencers/{influencer_id}/analytics")
async def get_influencer_analytics(influencer_id: str):
    """Get detailed analytics for an influencer"""
    try:
        analytics = await social_commerce.get_creator_analytics(influencer_id)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")


# Campaign Management Endpoints
@router.post("/campaigns/create")
async def create_campaign(
    brand_id: str = Query(..., description="Brand user ID"),
    campaign_name: str = Query(..., description="Campaign name"),
    description: str = Query(..., description="Campaign description"),
    campaign_type: str = Query(..., description="Campaign type: product_launch, seasonal, ongoing, event"),
    budget: float = Query(..., description="Campaign budget"),
    objectives: str = Query(..., description="JSON array of objectives"),
    target_demographics: str = Query(..., description="JSON object of target demographics"),
    content_requirements: str = Query(..., description="JSON object of content requirements"),
    deliverables: str = Query(..., description="JSON array of deliverables"),
    timeline: str = Query(..., description="JSON object of timeline with ISO dates")
) -> InfluencerCampaign:
    """Create new influencer campaign"""
    try:
        import json
        
        request = CampaignCreateRequest(
            campaign_name=campaign_name,
            description=description,
            campaign_type=campaign_type,
            budget=budget,
            objectives=json.loads(objectives),
            target_demographics=json.loads(target_demographics),
            content_requirements=json.loads(content_requirements),
            deliverables=json.loads(deliverables),
            timeline=json.loads(timeline)
        )
        
        campaign = await social_commerce.create_campaign(brand_id, request)
        return campaign
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create campaign: {str(e)}")


@router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str) -> InfluencerCampaign:
    """Get campaign details"""
    campaign = social_commerce.campaigns.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.get("/campaigns/{campaign_id}/analytics")
async def get_campaign_analytics(campaign_id: str):
    """Get comprehensive campaign analytics"""
    try:
        analytics = await social_commerce.get_campaign_analytics(campaign_id)
        return analytics
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")


@router.get("/campaigns/active")
async def get_active_campaigns(
    brand_id: Optional[str] = Query(None, description="Filter by brand ID"),
    limit: int = Query(20, description="Number of campaigns")
):
    """Get active campaigns"""
    try:
        active_campaigns = [
            c for c in social_commerce.campaigns.values() 
            if c.status.value == "active"
        ]
        
        if brand_id:
            active_campaigns = [c for c in active_campaigns if c.brand_id == brand_id]
        
        # Sort by creation date
        active_campaigns.sort(key=lambda x: x.created_at, reverse=True)
        
        return {
            "campaigns": active_campaigns[:limit],
            "total_active": len(active_campaigns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get campaigns: {str(e)}")


# Social Shopping Groups Endpoints
@router.post("/groups/create")
async def create_shopping_group(
    admin_id: str = Query(..., description="Admin user ID"),
    name: str = Query(..., description="Group name"),
    description: str = Query(..., description="Group description"),
    group_type: str = Query("general", description="Group type: fashion, beauty, tech, deals, etc.")
) -> SocialShoppingGroup:
    """Create new social shopping group"""
    try:
        group = await social_commerce.create_shopping_group(admin_id, name, description, group_type)
        return group
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create group: {str(e)}")


@router.get("/groups/{group_id}")
async def get_shopping_group(group_id: str) -> SocialShoppingGroup:
    """Get shopping group details"""
    group = social_commerce.shopping_groups.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@router.post("/groups/{group_id}/join")
async def join_shopping_group(
    group_id: str,
    user_id: str = Query(..., description="User ID to join group")
):
    """Join a shopping group"""
    try:
        group = social_commerce.shopping_groups.get(group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        if user_id in group.members:
            return {"message": "Already a member", "status": "success"}
        
        if len(group.members) >= group.max_members:
            return {"error": "Group is full"}
        
        group.members.append(user_id)
        
        return {
            "success": True,
            "message": "Successfully joined group",
            "member_count": len(group.members)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to join group: {str(e)}")


# Group Purchase Endpoints
@router.post("/group-purchase/create")
async def create_group_purchase(
    organizer_id: str = Query(..., description="Organizer user ID"),
    group_id: str = Query(..., description="Shopping group ID"),
    product_id: str = Query(..., description="Product ID"),
    minimum_participants: int = Query(..., description="Minimum participants needed"),
    maximum_participants: int = Query(..., description="Maximum participants allowed"),
    group_price: float = Query(..., description="Discounted group price"),
    deadline: str = Query(..., description="Deadline in ISO format")
) -> GroupPurchase:
    """Create group purchase opportunity"""
    try:
        request = GroupPurchaseRequest(
            group_id=group_id,
            product_id=product_id,
            minimum_participants=minimum_participants,
            maximum_participants=maximum_participants,
            group_price=group_price,
            deadline=deadline
        )
        
        purchase = await social_commerce.create_group_purchase(organizer_id, request)
        return purchase
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create group purchase: {str(e)}")


@router.post("/group-purchase/{purchase_id}/join")
async def join_group_purchase(
    purchase_id: str,
    user_id: str = Query(..., description="User ID")
):
    """Join a group purchase"""
    try:
        result = await social_commerce.join_group_purchase(purchase_id, user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to join purchase: {str(e)}")


@router.get("/group-purchase/active")
async def get_active_group_purchases(
    group_id: Optional[str] = Query(None, description="Filter by group ID"),
    limit: int = Query(20, description="Number of purchases")
):
    """Get active group purchases"""
    try:
        active_purchases = [
            gp for gp in social_commerce.group_purchases.values()
            if gp.status == "active" and gp.deadline > datetime.now()
        ]
        
        if group_id:
            active_purchases = [gp for gp in active_purchases if gp.group_id == group_id]
        
        # Sort by deadline (most urgent first)
        active_purchases.sort(key=lambda x: x.deadline)
        
        return {
            "group_purchases": active_purchases[:limit],
            "total_active": len(active_purchases)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get group purchases: {str(e)}")


# User Generated Content Endpoints
@router.get("/ugc/trending")
async def get_trending_ugc(
    category: Optional[str] = Query(None, description="Category filter"),
    limit: int = Query(20, description="Number of items")
) -> List[UserGeneratedContent]:
    """Get trending user-generated content"""
    try:
        trending = await social_commerce.get_trending_ugc(category, limit)
        return trending
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trending UGC: {str(e)}")


# Social Proof Endpoints
@router.get("/social-proof/{product_id}")
async def get_product_social_proof(product_id: str) -> SocialProof:
    """Get social proof data for a product"""
    try:
        proof = await social_commerce.get_product_social_proof(product_id)
        return proof
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get social proof: {str(e)}")


# Personalized Feed Endpoints
@router.get("/feed/personalized/{user_id}")
async def get_personalized_feed(
    user_id: str,
    limit: int = Query(20, description="Number of feed items")
) -> PersonalizedFeed:
    """Get personalized social commerce feed"""
    try:
        feed = await social_commerce.generate_personalized_feed(user_id, limit)
        return feed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate feed: {str(e)}")


# Analytics & Insights Endpoints
@router.get("/analytics/platform")
async def get_platform_analytics() -> SocialCommerceMetrics:
    """Get comprehensive platform analytics"""
    try:
        metrics = await social_commerce.get_platform_analytics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")


@router.get("/analytics/creator/{creator_id}")
async def get_creator_analytics(creator_id: str):
    """Get detailed creator analytics"""
    try:
        analytics = await social_commerce.get_creator_analytics(creator_id)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get creator analytics: {str(e)}")


# Dashboard Overview
@router.get("/dashboard/overview")
async def get_dashboard_overview():
    """Get social commerce dashboard overview"""
    try:
        platform_metrics = await social_commerce.get_platform_analytics()
        
        # Calculate additional dashboard stats
        recent_content = [
            c for c in social_commerce.shoppable_content.values()
            if c.created_at > datetime.now() - timedelta(hours=24)
        ]
        
        active_campaigns = [
            c for c in social_commerce.campaigns.values()
            if c.status.value == "active"
        ]
        
        overview = {
            "platform_health": {
                "total_active_creators": len(social_commerce.influencer_profiles),
                "content_created_24h": len(recent_content),
                "active_campaigns": len(active_campaigns),
                "total_revenue_30d": platform_metrics.platform_metrics["total_revenue"],
                "conversion_rate": platform_metrics.content_metrics["avg_conversion_rate"]
            },
            "trending_metrics": {
                "top_hashtag": "#summer2025",
                "viral_content_count": len([c for c in social_commerce.shoppable_content.values() if c.view_count > 100000]),
                "avg_engagement_rate": platform_metrics.content_metrics["avg_engagement_rate"],
                "social_commerce_growth": "+23.5%"
            },
            "monetization_stats": {
                "creator_payouts_pending": sum([
                    c.revenue_generated * 0.85 for c in social_commerce.shoppable_content.values()
                ]),
                "platform_commission": platform_metrics.platform_metrics["platform_commission"],
                "avg_creator_earnings": platform_metrics.platform_metrics["total_revenue"] * 0.85 / max(len(social_commerce.influencer_profiles), 1)
            },
            "user_engagement": {
                "active_shopping_groups": len(social_commerce.shopping_groups),
                "group_purchases_active": len([gp for gp in social_commerce.group_purchases.values() if gp.status == "active"]),
                "ugc_submissions_24h": random.randint(50, 200),
                "social_proof_updates": len(social_commerce.social_proof)
            },
            "alerts": [
                "3 campaigns ending this week - remind creators about deliverables",
                "15% increase in group purchase participation this month",
                "New trending hashtag detected: #EcoFriendlyFashion"
            ]
        }
        
        return overview
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard overview: {str(e)}")