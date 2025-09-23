from fastapi import APIRouter, HTTPException, Query, Body, Depends
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import uuid
import random

from services.social_media_advertising_service import SocialMediaAdvertisingService
from models.social_media_advertising import (
    SocialMediaCampaign, CampaignPerformance, Influencer, InfluencerCampaign,
    InfluencerPerformance, OptimizationRecommendation, CrossPlatformInsight,
    PlatformIntegration, AudienceSegment, AdPlatform, CampaignObjective
)

router = APIRouter()
service = SocialMediaAdvertisingService()

@router.get("/health")
async def social_media_advertising_health():
    """Health check for social media advertising system"""
    try:
        overview = await service.get_platform_overview()
        influencer_overview = await service.get_influencer_marketplace_overview()
        ai_summary = await service.get_ai_optimization_summary()
        
        return {
            "status": "operational",
            "service": "Social Media Advertising Suite",
            "version": "1.0.0",
            "features": [
                "Multi-Platform Campaign Management",
                "Influencer Partnership Platform", 
                "AI-Powered Optimization",
                "Cross-Platform Analytics",
                "Real-time Performance Tracking",
                "Audience Segmentation",
                "Creative Optimization",
                "ROAS Optimization"
            ],
            "platforms_supported": 8,
            "active_campaigns": overview["active_campaigns"],
            "total_influencers": influencer_overview["total_influencers"],
            "ai_recommendations_today": ai_summary["recommendations_generated_today"],
            "overall_performance": {
                "roas": overview["overall_roas"],
                "total_spend_today": overview["total_spend_today"],
                "total_revenue_today": overview["total_revenue_today"],
                "influencer_avg_roas": influencer_overview["performance_metrics"]["average_roas"],
                "ai_improvement_avg": ai_summary["avg_performance_improvement"]
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# Campaign Management Endpoints
@router.post("/campaigns/create")
async def create_campaign(campaign_data: Dict = Body(...)):
    """Create a new social media advertising campaign"""
    try:
        campaign = await service.create_campaign(campaign_data)
        return {
            "success": True,
            "campaign_id": campaign.campaign_id,
            "campaign": campaign.dict(),
            "message": f"Campaign '{campaign.campaign_name}' created successfully for {campaign.platform.value}"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Campaign creation failed: {str(e)}")

@router.get("/campaigns/{campaign_id}/performance")
async def get_campaign_performance(
    campaign_id: str,
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get performance data for a specific campaign"""
    try:
        date_range = None
        if start_date and end_date:
            date_range = {
                "start": datetime.fromisoformat(start_date),
                "end": datetime.fromisoformat(end_date)
            }
        
        performance_data = await service.get_campaign_performance(campaign_id, date_range)
        
        # Calculate summary metrics
        if performance_data:
            total_spend = sum(p.spend for p in performance_data)
            total_revenue = sum(p.revenue for p in performance_data)
            total_impressions = sum(p.impressions for p in performance_data)
            total_clicks = sum(p.clicks for p in performance_data)
            total_conversions = sum(p.conversions for p in performance_data)
            
            summary = {
                "total_spend": total_spend,
                "total_revenue": total_revenue,
                "overall_roas": total_revenue / total_spend if total_spend > 0 else 0,
                "total_impressions": total_impressions,
                "total_clicks": total_clicks,
                "total_conversions": total_conversions,
                "overall_ctr": total_clicks / total_impressions * 100 if total_impressions > 0 else 0,
                "overall_conversion_rate": total_conversions / total_clicks * 100 if total_clicks > 0 else 0,
                "average_cpc": total_spend / total_clicks if total_clicks > 0 else 0,
                "average_cpa": total_spend / total_conversions if total_conversions > 0 else 0
            }
        else:
            summary = {}
        
        return {
            "campaign_id": campaign_id,
            "performance_summary": summary,
            "daily_performance": [p.dict() for p in performance_data],
            "data_points": len(performance_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance data: {str(e)}")

@router.get("/campaigns/overview")
async def get_campaigns_overview():
    """Get overview of all campaigns across platforms"""
    try:
        overview = await service.get_platform_overview()
        return {
            "platforms_overview": overview,
            "recommendations": [
                f"Top performing platform: {max(overview['platform_breakdown'].keys(), key=lambda k: overview['platform_breakdown'][k]['daily_revenue'] / overview['platform_breakdown'][k]['daily_spend'])}",
                "Consider reallocating budget to higher ROAS platforms",
                "Test cross-platform audience exclusions to reduce overlap"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get campaigns overview: {str(e)}")

# Influencer Management Endpoints
@router.post("/influencers/create")
async def create_influencer_profile(influencer_data: Dict = Body(...)):
    """Create a new influencer profile"""
    try:
        influencer = await service.create_influencer_profile(influencer_data)
        return {
            "success": True,
            "influencer_id": influencer.influencer_id,
            "influencer": influencer.dict(),
            "message": f"Influencer profile created for @{influencer.username} ({influencer.tier.value} tier)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Influencer profile creation failed: {str(e)}")

@router.post("/influencers/campaigns/create")
async def create_influencer_campaign(campaign_data: Dict = Body(...)):
    """Create a new influencer campaign"""
    try:
        campaign = await service.create_influencer_campaign(campaign_data)
        return {
            "success": True,
            "campaign_id": campaign.campaign_id,
            "campaign": campaign.dict(),
            "message": f"Influencer campaign '{campaign.campaign_name}' created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Influencer campaign creation failed: {str(e)}")

@router.get("/influencers/campaigns/{campaign_id}/performance")
async def get_influencer_campaign_performance(campaign_id: str):
    """Get performance data for an influencer campaign"""
    try:
        performance = await service.get_influencer_performance(campaign_id)
        return {
            "campaign_id": campaign_id,
            "performance": performance.dict(),
            "summary": {
                "engagement_quality": "high" if performance.engagement_rate > 5 else "medium" if performance.engagement_rate > 2 else "low",
                "conversion_quality": "high" if performance.conversion_rate > 3 else "medium" if performance.conversion_rate > 1 else "low",
                "sentiment_quality": "positive" if performance.sentiment_score > 0.8 else "neutral" if performance.sentiment_score > 0.6 else "needs_attention"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get influencer performance: {str(e)}")

@router.get("/influencers/marketplace")
async def get_influencer_marketplace():
    """Get influencer marketplace overview and available influencers"""
    try:
        marketplace_overview = await service.get_influencer_marketplace_overview()
        
        # Generate sample influencers for demonstration
        sample_influencers = []
        for i in range(10):
            tier_options = ["nano", "micro", "macro", "mega", "celebrity"]
            tier = tier_options[i % len(tier_options)]
            
            followers_ranges = {
                "nano": (1000, 10000),
                "micro": (10000, 100000), 
                "macro": (100000, 1000000),
                "mega": (1000000, 10000000),
                "celebrity": (10000000, 50000000)
            }
            
            followers = random.randint(*followers_ranges[tier])
            
            sample_influencers.append({
                "influencer_id": f"inf_{uuid.uuid4().hex[:8]}",
                "username": f"@influencer_{i+1}",
                "full_name": f"Influencer {i+1}",
                "platform": random.choice(["instagram", "tiktok", "youtube"]),
                "followers_count": followers,
                "engagement_rate": round(random.uniform(2.5, 7.8), 2),
                "tier": tier,
                "categories": random.sample(["fashion", "beauty", "lifestyle", "tech", "food", "travel"], 2),
                "rate_per_post": round(followers * random.uniform(0.01, 0.05), 2),
                "average_cpm": round(random.uniform(5, 25), 2),
                "verified": random.choice([True, False]),
                "brand_safety_score": round(random.uniform(0.85, 0.98), 2)
            })
        
        return {
            "marketplace_overview": marketplace_overview,
            "featured_influencers": sample_influencers,
            "search_filters": {
                "platforms": ["instagram", "tiktok", "youtube", "facebook", "twitter"],
                "tiers": ["nano", "micro", "macro", "mega", "celebrity"],
                "categories": ["fashion", "beauty", "lifestyle", "tech", "food", "travel", "fitness", "gaming"],
                "engagement_rates": ["2-4%", "4-6%", "6%+"],
                "follower_ranges": ["1K-10K", "10K-100K", "100K-1M", "1M+"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get influencer marketplace: {str(e)}")

# AI Optimization Endpoints
@router.get("/ai/recommendations/{campaign_id}")
async def get_ai_recommendations(campaign_id: str):
    """Get AI-powered optimization recommendations for a campaign"""
    try:
        recommendations = await service.generate_optimization_recommendations(campaign_id)
        
        # Categorize recommendations by priority
        high_priority = [r for r in recommendations if r.priority == "high"]
        medium_priority = [r for r in recommendations if r.priority == "medium"]
        low_priority = [r for r in recommendations if r.priority == "low"]
        
        return {
            "campaign_id": campaign_id,
            "recommendations_count": len(recommendations),
            "priority_breakdown": {
                "high": len(high_priority),
                "medium": len(medium_priority),
                "low": len(low_priority)
            },
            "recommendations": [r.dict() for r in recommendations],
            "implementation_roadmap": {
                "immediate_actions": [r.title for r in high_priority],
                "next_week": [r.title for r in medium_priority],
                "future_optimizations": [r.title for r in low_priority]
            },
            "expected_impact": {
                "total_improvement": sum(r.estimated_impact_percentage for r in recommendations),
                "confidence_score": sum(r.confidence_score for r in recommendations) / len(recommendations) if recommendations else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI recommendations: {str(e)}")

@router.get("/ai/optimization/summary")
async def get_ai_optimization_summary():
    """Get AI optimization capabilities and current status"""
    try:
        ai_summary = await service.get_ai_optimization_summary()
        return ai_summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI optimization summary: {str(e)}")

# Cross-Platform Analytics Endpoints
@router.get("/analytics/cross-platform")
async def get_cross_platform_analytics(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)")
):
    """Get cross-platform analytics and insights"""
    try:
        date_range = {
            "start": datetime.fromisoformat(start_date),
            "end": datetime.fromisoformat(end_date)
        }
        
        insights = await service.generate_cross_platform_insights(date_range)
        
        return {
            "insights": insights.dict(),
            "executive_summary": {
                "total_spend": insights.key_metrics["total_spend"],
                "total_revenue": insights.key_metrics["total_revenue"],
                "overall_roas": insights.key_metrics["overall_roas"],
                "best_platform": insights.key_metrics["best_performing_platform"],
                "highest_volume": insights.key_metrics["highest_volume_platform"],
                "optimization_potential": f"{insights.potential_improvement['roas_improvement']:.1f}% ROAS improvement available"
            },
            "action_plan": {
                "priority_1": insights.priority_actions[0] if insights.priority_actions else None,
                "priority_2": insights.priority_actions[1] if len(insights.priority_actions) > 1 else None,
                "priority_3": insights.priority_actions[2] if len(insights.priority_actions) > 2 else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate cross-platform analytics: {str(e)}")

# Platform Integration Endpoints
@router.post("/integrations/connect")
async def connect_platform(integration_data: Dict = Body(...)):
    """Connect a new social media platform"""
    try:
        integration = await service.create_platform_integration(integration_data)
        return {
            "success": True,
            "integration_id": integration.integration_id,
            "platform": integration.platform.value,
            "account_name": integration.account_name,
            "status": integration.sync_status,
            "message": f"Successfully connected to {integration.platform.value}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Platform integration failed: {str(e)}")

@router.get("/integrations/status")
async def get_integrations_status():
    """Get status of all platform integrations"""
    try:
        # Simulate integration status
        integrations = []
        platforms = ["facebook", "instagram", "tiktok", "youtube", "twitter", "linkedin", "pinterest", "snapchat"]
        
        for platform in platforms:
            integrations.append({
                "platform": platform,
                "status": random.choice(["connected", "disconnected", "error", "syncing"]),
                "account_name": f"AisleMarts {platform.title()}",
                "last_sync": datetime.utcnow() - timedelta(minutes=random.randint(5, 120)),
                "permissions": ["read_insights", "manage_ads", "create_content"],
                "data_freshness": random.randint(1, 30)  # minutes
            })
        
        return {
            "integrations": integrations,
            "summary": {
                "total_platforms": len(integrations),
                "connected": len([i for i in integrations if i["status"] == "connected"]),
                "issues": len([i for i in integrations if i["status"] == "error"]),
                "sync_health": "good" if all(i["status"] in ["connected", "syncing"] for i in integrations) else "needs_attention"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get integrations status: {str(e)}")

# Audience Management Endpoints
@router.post("/audiences/create")
async def create_audience_segment(segment_data: Dict = Body(...)):
    """Create a new audience segment"""
    try:
        segment = await service.create_audience_segment(segment_data)
        return {
            "success": True,
            "segment_id": segment.segment_id,
            "segment": segment.dict(),
            "message": f"Audience segment '{segment.segment_name}' created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audience segment creation failed: {str(e)}")

@router.get("/audiences/segments")
async def get_audience_segments():
    """Get all audience segments"""
    try:
        # Simulate audience segments
        segments = []
        segment_types = ["custom", "lookalike", "interest", "behavioral", "demographic"]
        
        for i in range(8):
            segments.append({
                "segment_id": f"aud_{uuid.uuid4().hex[:8]}",
                "segment_name": f"Segment {i+1}",
                "segment_type": segment_types[i % len(segment_types)],
                "estimated_size": random.randint(100000, 2000000),
                "platforms": random.sample(["facebook", "instagram", "tiktok", "youtube"], random.randint(2, 4)),
                "performance": {
                    "average_ctr": round(random.uniform(0.8, 2.5), 2),
                    "average_cpc": round(random.uniform(0.50, 3.00), 2),
                    "conversion_rate": round(random.uniform(1.5, 6.0), 2)
                },
                "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30))
            })
        
        return {
            "segments": segments,
            "summary": {
                "total_segments": len(segments),
                "total_reach": sum(s["estimated_size"] for s in segments),
                "best_performing": max(segments, key=lambda s: s["performance"]["conversion_rate"]),
                "segment_types": list(set(s["segment_type"] for s in segments))
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get audience segments: {str(e)}")

# Advanced Analytics Endpoints
@router.get("/analytics/performance/summary")
async def get_performance_summary(
    date_range: str = Query("30d", description="Date range (7d, 30d, 90d)")
):
    """Get comprehensive performance summary"""
    try:
        days = int(date_range.replace('d', ''))
        start_date = datetime.utcnow() - timedelta(days=days)
        end_date = datetime.utcnow()
        
        # Generate comprehensive performance data
        performance_summary = {
            "date_range": f"{start_date.date()} to {end_date.date()}",
            "overview": {
                "total_campaigns": random.randint(15, 45),
                "active_campaigns": random.randint(8, 25),
                "total_spend": round(random.uniform(25000, 100000), 2),
                "total_revenue": round(random.uniform(75000, 400000), 2),
                "overall_roas": round(random.uniform(2.5, 5.2), 2),
                "total_impressions": random.randint(5000000, 20000000),
                "total_clicks": random.randint(50000, 200000),
                "total_conversions": random.randint(2000, 8000)
            },
            "platform_performance": {},
            "top_campaigns": [],
            "optimization_opportunities": {
                "budget_reallocation": "15% ROAS improvement available by shifting budget to top-performing platforms",
                "audience_expansion": "23% reach increase possible through lookalike audience expansion",
                "creative_refresh": "18% CTR improvement expected with video creative testing",
                "bid_optimization": "12% CPA reduction through automated bidding adoption"
            },
            "trends": {
                "spend_trend": random.choice(["increasing", "stable", "decreasing"]),
                "roas_trend": random.choice(["improving", "stable", "declining"]),
                "volume_trend": random.choice(["growing", "stable", "shrinking"]),
                "efficiency_trend": random.choice(["optimizing", "stable", "needs_attention"])
            }
        }
        
        # Platform performance breakdown
        platforms = ["facebook", "instagram", "tiktok", "youtube", "twitter", "linkedin"]
        for platform in platforms:
            spend = random.uniform(3000, 15000)
            revenue = spend * random.uniform(2.0, 6.0)
            performance_summary["platform_performance"][platform] = {
                "spend": round(spend, 2),
                "revenue": round(revenue, 2),
                "roas": round(revenue / spend, 2),
                "impressions": random.randint(500000, 3000000),
                "clicks": random.randint(5000, 30000),
                "conversions": random.randint(200, 1200),
                "ctr": round(random.uniform(0.5, 2.5), 2),
                "cpc": round(random.uniform(0.30, 2.50), 2),
                "cpa": round(spend / random.randint(200, 1200), 2)
            }
        
        # Top performing campaigns
        for i in range(5):
            campaign_spend = random.uniform(2000, 8000)
            campaign_revenue = campaign_spend * random.uniform(3.0, 7.0)
            performance_summary["top_campaigns"].append({
                "campaign_id": f"camp_{uuid.uuid4().hex[:8]}",
                "campaign_name": f"Campaign {i+1}",
                "platform": random.choice(platforms),
                "spend": round(campaign_spend, 2),
                "revenue": round(campaign_revenue, 2),
                "roas": round(campaign_revenue / campaign_spend, 2),
                "conversions": random.randint(150, 600)
            })
        
        return performance_summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate performance summary: {str(e)}")

@router.get("/analytics/roi/breakdown")
async def get_roi_breakdown():
    """Get detailed ROI breakdown by various dimensions"""
    try:
        roi_breakdown = {
            "by_platform": {},
            "by_campaign_objective": {},
            "by_audience_type": {},
            "by_creative_format": {},
            "by_time_period": {},
            "insights": {
                "best_performing_segment": None,
                "worst_performing_segment": None,
                "optimization_recommendations": []
            }
        }
        
        # Platform ROI
        platforms = ["facebook", "instagram", "tiktok", "youtube", "twitter", "linkedin", "pinterest", "snapchat"]
        for platform in platforms:
            roi = random.uniform(150, 450)  # 150% to 450% ROI
            roi_breakdown["by_platform"][platform] = {
                "roi_percentage": round(roi, 1),
                "spend": round(random.uniform(2000, 12000), 2),
                "revenue": round(random.uniform(2000, 12000) * (roi/100 + 1), 2),
                "profit_margin": round(roi - 100, 1)
            }
        
        # Campaign Objective ROI
        objectives = ["awareness", "traffic", "engagement", "leads", "sales", "video_views"]
        for objective in objectives:
            roi = random.uniform(120, 380)
            roi_breakdown["by_campaign_objective"][objective] = {
                "roi_percentage": round(roi, 1),
                "campaigns_count": random.randint(3, 12),
                "avg_cpa": round(random.uniform(15, 85), 2),
                "conversion_rate": round(random.uniform(1.2, 5.8), 2)
            }
        
        # Audience Type ROI
        audience_types = ["custom", "lookalike", "interest", "demographic", "behavioral"]
        for audience_type in audience_types:
            roi = random.uniform(140, 420)
            roi_breakdown["by_audience_type"][audience_type] = {
                "roi_percentage": round(roi, 1),
                "audience_size": random.randint(500000, 5000000),
                "ctr": round(random.uniform(0.8, 3.2), 2),
                "quality_score": round(random.uniform(7.5, 9.8), 1)
            }
        
        # Creative Format ROI
        creative_formats = ["image", "video", "carousel", "collection", "story"]
        for format_type in creative_formats:
            roi = random.uniform(130, 400)
            roi_breakdown["by_creative_format"][format_type] = {
                "roi_percentage": round(roi, 1),
                "engagement_rate": round(random.uniform(2.1, 6.8), 2),
                "ctr": round(random.uniform(0.9, 2.8), 2),
                "cost_per_engagement": round(random.uniform(0.25, 1.50), 2)
            }
        
        # Time Period ROI
        time_periods = ["morning", "afternoon", "evening", "night", "weekend", "weekday"]
        for period in time_periods:
            roi = random.uniform(110, 350)
            roi_breakdown["by_time_period"][period] = {
                "roi_percentage": round(roi, 1),
                "impression_share": round(random.uniform(10, 25), 1),
                "avg_cpc": round(random.uniform(0.40, 2.20), 2),
                "competition_level": random.choice(["low", "medium", "high"])
            }
        
        # Generate insights
        best_platform = max(roi_breakdown["by_platform"].keys(), 
                          key=lambda k: roi_breakdown["by_platform"][k]["roi_percentage"])
        worst_platform = min(roi_breakdown["by_platform"].keys(), 
                           key=lambda k: roi_breakdown["by_platform"][k]["roi_percentage"])
        
        roi_breakdown["insights"] = {
            "best_performing_segment": {
                "category": "platform",
                "name": best_platform,
                "roi": roi_breakdown["by_platform"][best_platform]["roi_percentage"]
            },
            "worst_performing_segment": {
                "category": "platform", 
                "name": worst_platform,
                "roi": roi_breakdown["by_platform"][worst_platform]["roi_percentage"]
            },
            "optimization_recommendations": [
                f"Increase budget allocation to {best_platform} by 20% for better ROI",
                "Test video creatives on all platforms to improve engagement",
                "Implement lookalike audiences from top converters",
                f"Reduce spending on {worst_platform} during optimization period"
            ]
        }
        
        return roi_breakdown
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate ROI breakdown: {str(e)}")