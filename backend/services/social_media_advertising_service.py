from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import uuid
import random
import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

from models.social_media_advertising import (
    SocialMediaCampaign, CampaignPerformance, Influencer, InfluencerCampaign,
    InfluencerPerformance, OptimizationRecommendation, CrossPlatformInsight,
    PlatformIntegration, AudienceSegment, AdPlatform, CampaignObjective,
    AdFormat, CampaignStatus, InfluencerTier, CollaborationType
)

class SocialMediaAdvertisingService:
    """
    Comprehensive Social Media Advertising Service
    Handles multi-platform campaign management, influencer partnerships, and AI optimization
    """
    
    def __init__(self):
        self.platforms_data = self._initialize_platform_data()
        self.ai_insights_enabled = True
        
    def _initialize_platform_data(self) -> Dict:
        """Initialize platform-specific data and capabilities"""
        return {
            "facebook": {
                "name": "Facebook",
                "max_daily_budget": 50000,
                "min_daily_budget": 5,
                "supported_objectives": ["awareness", "traffic", "engagement", "leads", "sales"],
                "supported_formats": ["image", "video", "carousel", "collection"],
                "targeting_options": ["demographics", "interests", "behaviors", "custom", "lookalike"],
                "average_cpm": 7.19,
                "average_ctr": 0.90,
                "user_base": 3065000000
            },
            "instagram": {
                "name": "Instagram", 
                "max_daily_budget": 50000,
                "min_daily_budget": 5,
                "supported_objectives": ["awareness", "traffic", "engagement", "leads", "sales"],
                "supported_formats": ["image", "video", "carousel", "story", "reel", "shopping"],
                "targeting_options": ["demographics", "interests", "behaviors", "custom", "lookalike"],
                "average_cpm": 5.97,
                "average_ctr": 1.08,
                "user_base": 2000000000
            },
            "tiktok": {
                "name": "TikTok",
                "max_daily_budget": 20000,
                "min_daily_budget": 20,
                "supported_objectives": ["awareness", "traffic", "engagement", "app_installs", "video_views"],
                "supported_formats": ["video", "story", "ar_filter"],
                "targeting_options": ["demographics", "interests", "behaviors", "custom", "lookalike"],
                "average_cpm": 10.0,
                "average_ctr": 1.52,
                "user_base": 1120000000
            },
            "youtube": {
                "name": "YouTube",
                "max_daily_budget": 100000,
                "min_daily_budget": 10,
                "supported_objectives": ["awareness", "traffic", "video_views", "leads"],
                "supported_formats": ["video", "image"],
                "targeting_options": ["demographics", "interests", "keywords", "topics", "remarketing"],
                "average_cpm": 3.21,
                "average_ctr": 0.65,
                "user_base": 2500000000
            },
            "twitter": {
                "name": "X (Twitter)",
                "max_daily_budget": 25000,
                "min_daily_budget": 10,
                "supported_objectives": ["awareness", "traffic", "engagement", "leads"],
                "supported_formats": ["image", "video", "sponsored_post"],
                "targeting_options": ["demographics", "interests", "keywords", "events", "followers"],
                "average_cpm": 6.46,
                "average_ctr": 1.01,
                "user_base": 388000000
            },
            "linkedin": {
                "name": "LinkedIn",
                "max_daily_budget": 30000,
                "min_daily_budget": 10,
                "supported_objectives": ["awareness", "traffic", "leads", "video_views"],
                "supported_formats": ["image", "video", "carousel", "sponsored_post"],
                "targeting_options": ["professional", "demographics", "interests", "skills", "company"],
                "average_cpm": 6.59,
                "average_ctr": 0.39,
                "user_base": 930000000
            },
            "pinterest": {
                "name": "Pinterest",
                "max_daily_budget": 15000,
                "min_daily_budget": 5,
                "supported_objectives": ["awareness", "traffic", "engagement"],
                "supported_formats": ["image", "video", "carousel", "shopping"],
                "targeting_options": ["demographics", "interests", "keywords", "actalike"],
                "average_cpm": 3.50,
                "average_ctr": 0.20,
                "user_base": 553000000
            },
            "snapchat": {
                "name": "Snapchat",
                "max_daily_budget": 20000,
                "min_daily_budget": 5,
                "supported_objectives": ["awareness", "traffic", "app_installs", "video_views"],
                "supported_formats": ["image", "video", "story", "ar_filter", "collection"],
                "targeting_options": ["demographics", "interests", "behaviors", "custom", "lookalike"],
                "average_cpm": 2.95,
                "average_ctr": 0.60,
                "user_base": 443000000
            }
        }
    
    # Campaign Management Methods
    async def create_campaign(self, campaign_data: Dict) -> SocialMediaCampaign:
        """Create a new social media campaign"""
        campaign_id = f"camp_{uuid.uuid4().hex[:12]}"
        
        # Validate platform capabilities
        platform = campaign_data.get("platform")
        if platform not in self.platforms_data:
            raise ValueError(f"Unsupported platform: {platform}")
            
        platform_info = self.platforms_data[platform]
        
        # Validate budget constraints
        daily_budget = campaign_data.get("daily_budget", 0)
        if daily_budget < platform_info["min_daily_budget"]:
            raise ValueError(f"Daily budget too low for {platform}. Minimum: ${platform_info['min_daily_budget']}")
        if daily_budget > platform_info["max_daily_budget"]:
            raise ValueError(f"Daily budget too high for {platform}. Maximum: ${platform_info['max_daily_budget']}")
        
        # Create campaign object
        campaign = SocialMediaCampaign(
            campaign_id=campaign_id,
            campaign_name=campaign_data["campaign_name"],
            platform=AdPlatform(platform),
            objective=CampaignObjective(campaign_data["objective"]),
            daily_budget=daily_budget,
            total_budget=campaign_data.get("total_budget"),
            bid_strategy=campaign_data.get("bid_strategy", "auto"),
            target_audience=campaign_data.get("target_audience", {}),
            demographics=campaign_data.get("demographics", {}),
            interests=campaign_data.get("interests", []),
            behaviors=campaign_data.get("behaviors", []),
            custom_audiences=campaign_data.get("custom_audiences", []),
            lookalike_audiences=campaign_data.get("lookalike_audiences", []),
            ad_format=AdFormat(campaign_data["ad_format"]),
            creative_assets=campaign_data.get("creative_assets", {}),
            call_to_action=campaign_data["call_to_action"],
            start_date=datetime.fromisoformat(campaign_data["start_date"]) if isinstance(campaign_data["start_date"], str) else campaign_data["start_date"],
            end_date=datetime.fromisoformat(campaign_data["end_date"]) if campaign_data.get("end_date") and isinstance(campaign_data["end_date"], str) else campaign_data.get("end_date"),
            tracking_pixels=campaign_data.get("tracking_pixels", []),
            utm_parameters=campaign_data.get("utm_parameters", {}),
            created_by=campaign_data["created_by"]
        )
        
        return campaign
    
    async def get_campaign_performance(self, campaign_id: str, date_range: Optional[Dict] = None) -> List[CampaignPerformance]:
        """Get performance data for a campaign"""
        if not date_range:
            date_range = {
                "start": datetime.utcnow() - timedelta(days=30),
                "end": datetime.utcnow()
            }
        
        # Simulate performance data generation
        performance_data = []
        current_date = date_range["start"]
        
        while current_date <= date_range["end"]:
            # Generate realistic performance metrics
            platform = random.choice(list(AdPlatform))
            platform_info = self.platforms_data.get(platform.value, self.platforms_data["facebook"])
            
            impressions = random.randint(1000, 50000)
            reach = int(impressions * random.uniform(0.7, 0.9))
            clicks = int(impressions * (platform_info["average_ctr"] / 100) * random.uniform(0.8, 1.2))
            conversions = int(clicks * random.uniform(0.02, 0.08))
            spend = impressions / 1000 * platform_info["average_cpm"] * random.uniform(0.9, 1.1)
            revenue = conversions * random.uniform(25, 150)
            
            performance = CampaignPerformance(
                campaign_id=campaign_id,
                platform=platform,
                date=current_date,
                impressions=impressions,
                reach=reach,
                frequency=impressions / reach if reach > 0 else 0,
                clicks=clicks,
                ctr=clicks / impressions * 100 if impressions > 0 else 0,
                engagements=int(clicks * random.uniform(1.2, 2.5)),
                engagement_rate=clicks / impressions * 100 * random.uniform(1.2, 2.5) if impressions > 0 else 0,
                conversions=conversions,
                conversion_rate=conversions / clicks * 100 if clicks > 0 else 0,
                cost_per_conversion=spend / conversions if conversions > 0 else 0,
                spend=spend,
                cpm=spend / impressions * 1000 if impressions > 0 else 0,
                cpc=spend / clicks if clicks > 0 else 0,
                revenue=revenue,
                roas=revenue / spend if spend > 0 else 0,
                video_views=int(impressions * random.uniform(0.3, 0.8)) if platform in [AdPlatform.TIKTOK, AdPlatform.YOUTUBE, AdPlatform.INSTAGRAM] else 0,
                video_completion_rate=random.uniform(0.25, 0.75),
                platform_metrics=self._generate_platform_specific_metrics(platform)
            )
            performance_data.append(performance)
            current_date += timedelta(days=1)
        
        return performance_data
    
    def _generate_platform_specific_metrics(self, platform: AdPlatform) -> Dict:
        """Generate platform-specific metrics"""
        if platform == AdPlatform.FACEBOOK:
            return {
                "page_likes": random.randint(10, 100),
                "post_saves": random.randint(5, 50),
                "link_clicks": random.randint(50, 500)
            }
        elif platform == AdPlatform.INSTAGRAM:
            return {
                "profile_visits": random.randint(20, 200),
                "story_replies": random.randint(5, 30),
                "saves": random.randint(10, 100)
            }
        elif platform == AdPlatform.TIKTOK:
            return {
                "hashtag_clicks": random.randint(10, 80),
                "profile_clicks": random.randint(15, 120),
                "follows": random.randint(5, 50)
            }
        elif platform == AdPlatform.YOUTUBE:
            return {
                "subscribers_gained": random.randint(5, 40),
                "watch_time_minutes": random.randint(500, 5000),
                "channel_views": random.randint(100, 1000)
            }
        elif platform == AdPlatform.TWITTER:
            return {
                "retweets": random.randint(10, 100),
                "quote_tweets": random.randint(2, 20),
                "profile_clicks": random.randint(20, 150)
            }
        elif platform == AdPlatform.LINKEDIN:
            return {
                "company_page_clicks": random.randint(5, 50),
                "follows": random.randint(3, 25),
                "lead_form_submissions": random.randint(1, 10)
            }
        elif platform == AdPlatform.PINTEREST:
            return {
                "pin_saves": random.randint(50, 300),
                "closeup_views": random.randint(20, 150),
                "outbound_clicks": random.randint(10, 80)
            }
        elif platform == AdPlatform.SNAPCHAT:
            return {
                "swipe_ups": random.randint(30, 200),
                "app_installs": random.randint(5, 40),
                "lens_shares": random.randint(10, 80)
            }
        return {}
    
    # Influencer Management Methods
    async def create_influencer_profile(self, influencer_data: Dict) -> Influencer:
        """Create a new influencer profile"""
        influencer_id = f"inf_{uuid.uuid4().hex[:12]}"
        
        # Determine tier based on follower count
        followers = influencer_data["followers_count"]
        if followers < 10000:
            tier = InfluencerTier.NANO
        elif followers < 100000:
            tier = InfluencerTier.MICRO
        elif followers < 1000000:
            tier = InfluencerTier.MACRO
        elif followers < 10000000:
            tier = InfluencerTier.MEGA
        else:
            tier = InfluencerTier.CELEBRITY
        
        # Calculate rates based on tier and engagement
        base_rate = self._calculate_influencer_rates(followers, influencer_data.get("engagement_rate", 3.0))
        
        influencer = Influencer(
            influencer_id=influencer_id,
            username=influencer_data["username"],
            platform=AdPlatform(influencer_data["platform"]),
            full_name=influencer_data["full_name"],
            bio=influencer_data.get("bio", ""),
            profile_image=influencer_data.get("profile_image", ""),
            followers_count=followers,
            engagement_rate=influencer_data.get("engagement_rate", 3.0),
            tier=tier,
            audience_demographics=influencer_data.get("audience_demographics", {}),
            top_locations=influencer_data.get("top_locations", []),
            audience_age_groups=influencer_data.get("audience_age_groups", {}),
            content_categories=influencer_data.get("content_categories", []),
            brand_affinity=influencer_data.get("brand_affinity", []),
            rate_per_post=base_rate["post"],
            rate_per_story=base_rate["story"],
            rate_per_video=base_rate["video"],
            average_cpm=base_rate["cpm"],
            email=influencer_data["email"],
            phone=influencer_data.get("phone"),
            verified=influencer_data.get("verified", False)
        )
        
        return influencer
    
    def _calculate_influencer_rates(self, followers: int, engagement_rate: float) -> Dict[str, float]:
        """Calculate influencer rates based on followers and engagement"""
        # Base rate calculation (simplified model)
        base_cpm = max(5, min(50, (followers / 1000) * (engagement_rate / 3) * 0.1))
        
        return {
            "post": base_cpm * followers / 1000,
            "story": base_cpm * followers / 1000 * 0.7,
            "video": base_cpm * followers / 1000 * 1.5,
            "cpm": base_cpm
        }
    
    async def create_influencer_campaign(self, campaign_data: Dict) -> InfluencerCampaign:
        """Create an influencer campaign"""
        campaign_id = f"inf_camp_{uuid.uuid4().hex[:12]}"
        
        campaign = InfluencerCampaign(
            campaign_id=campaign_id,
            influencer_id=campaign_data["influencer_id"],
            brand_campaign_id=campaign_data.get("brand_campaign_id"),
            campaign_name=campaign_data["campaign_name"],
            collaboration_type=CollaborationType(campaign_data["collaboration_type"]),
            platform=AdPlatform(campaign_data["platform"]),
            content_requirements=campaign_data.get("content_requirements", {}),
            deliverables=campaign_data.get("deliverables", []),
            hashtags=campaign_data.get("hashtags", []),
            mentions=campaign_data.get("mentions", []),
            compensation_amount=campaign_data["compensation_amount"],
            compensation_type=campaign_data.get("compensation_type", "fixed"),
            revenue_share_percentage=campaign_data.get("revenue_share_percentage", 0.0),
            bonus_thresholds=campaign_data.get("bonus_thresholds", {}),
            brief_date=datetime.fromisoformat(campaign_data["brief_date"]) if isinstance(campaign_data["brief_date"], str) else campaign_data["brief_date"],
            content_due_date=datetime.fromisoformat(campaign_data["content_due_date"]) if isinstance(campaign_data["content_due_date"], str) else campaign_data["content_due_date"],
            publish_date=datetime.fromisoformat(campaign_data["publish_date"]) if isinstance(campaign_data["publish_date"], str) else campaign_data["publish_date"],
            campaign_end_date=datetime.fromisoformat(campaign_data["campaign_end_date"]) if isinstance(campaign_data["campaign_end_date"], str) else campaign_data["campaign_end_date"],
            target_impressions=campaign_data.get("target_impressions", 0),
            target_engagement=campaign_data.get("target_engagement", 0),
            target_conversions=campaign_data.get("target_conversions", 0)
        )
        
        return campaign
    
    async def get_influencer_performance(self, campaign_id: str) -> InfluencerPerformance:
        """Get influencer campaign performance"""
        # Simulate performance tracking
        impressions = random.randint(5000, 100000)
        reach = int(impressions * random.uniform(0.8, 0.95))
        engagements = int(impressions * random.uniform(0.03, 0.08))
        clicks = int(engagements * random.uniform(0.1, 0.3))
        conversions = int(clicks * random.uniform(0.02, 0.05))
        
        performance = InfluencerPerformance(
            campaign_id=campaign_id,
            influencer_id=f"inf_{uuid.uuid4().hex[:12]}",
            platform=random.choice(list(AdPlatform)),
            content_url=f"https://example.com/content/{uuid.uuid4().hex[:8]}",
            impressions=impressions,
            reach=reach,
            likes=int(engagements * 0.7),
            comments=int(engagements * 0.2),
            shares=int(engagements * 0.1),
            saves=int(engagements * 0.15),
            engagement_rate=engagements / impressions * 100 if impressions > 0 else 0,
            cpm=random.uniform(5, 25),
            cpe=random.uniform(0.5, 3),
            clicks=clicks,
            conversions=conversions,
            conversion_rate=conversions / clicks * 100 if clicks > 0 else 0,
            revenue_generated=conversions * random.uniform(30, 120),
            sentiment_score=random.uniform(0.7, 0.95),
            brand_mention_sentiment=random.uniform(0.8, 0.98)
        )
        
        return performance
    
    # AI Optimization Methods
    async def generate_optimization_recommendations(self, campaign_id: str) -> List[OptimizationRecommendation]:
        """Generate AI-powered optimization recommendations"""
        recommendations = []
        
        # Targeting optimization recommendations
        targeting_rec = OptimizationRecommendation(
            recommendation_id=f"rec_{uuid.uuid4().hex[:12]}",
            campaign_id=campaign_id,
            recommendation_type="targeting_optimization",
            title="Expand Lookalike Audience Targeting",
            description="Based on your best-performing audience segments, expanding to 2% lookalike audiences could increase conversions by 23% while maintaining similar CPA.",
            predicted_impact={
                "conversions_increase": 23,
                "cpa_change": -2,
                "reach_increase": 45,
                "budget_efficiency": 15
            },
            confidence_score=0.87,
            action_required="Create 2% lookalike audiences from your top 10% converters",
            implementation_difficulty="easy",
            estimated_impact_percentage=23.0,
            suggested_audiences=[
                {
                    "audience_type": "lookalike",
                    "source": "top_converters",
                    "similarity": "2%",
                    "estimated_size": "2.1M"
                }
            ],
            priority="high"
        )
        recommendations.append(targeting_rec)
        
        # Creative optimization recommendation
        creative_rec = OptimizationRecommendation(
            recommendation_id=f"rec_{uuid.uuid4().hex[:12]}",
            campaign_id=campaign_id,
            recommendation_type="creative_optimization",
            title="Test Video Creative Formats",
            description="Video ads are showing 34% higher engagement rates in your category. Testing short-form video creatives could improve CTR by 28%.",
            predicted_impact={
                "ctr_increase": 28,
                "engagement_increase": 34,
                "video_completion": 65,
                "cost_efficiency": 18
            },
            confidence_score=0.92,
            action_required="Create 3-5 short video variations (15-30 seconds) highlighting product benefits",
            implementation_difficulty="medium",
            estimated_impact_percentage=28.0,
            suggested_creatives=[
                {
                    "format": "video",
                    "duration": "15-30s",
                    "style": "user_generated",
                    "cta": "shop_now"
                },
                {
                    "format": "video",
                    "duration": "15-30s", 
                    "style": "product_demo",
                    "cta": "learn_more"
                }
            ],
            priority="high"
        )
        recommendations.append(creative_rec)
        
        # Bidding optimization recommendation
        bidding_rec = OptimizationRecommendation(
            recommendation_id=f"rec_{uuid.uuid4().hex[:12]}",
            campaign_id=campaign_id,
            recommendation_type="bidding_optimization",
            title="Switch to Value-Based Bidding",
            description="Your conversion values vary significantly. Switching to value-based bidding could improve ROAS by 31% by focusing on high-value customers.",
            predicted_impact={
                "roas_increase": 31,
                "high_value_conversions": 42,
                "average_order_value": 18,
                "profit_margin": 25
            },
            confidence_score=0.84,
            action_required="Implement value-based bidding with customer lifetime value data",
            implementation_difficulty="medium",
            estimated_impact_percentage=31.0,
            suggested_bidding={
                "strategy": "target_roas",
                "target_value": 4.2,
                "optimization_goal": "conversion_value"
            },
            priority="medium"
        )
        recommendations.append(bidding_rec)
        
        # Schedule optimization recommendation
        schedule_rec = OptimizationRecommendation(
            recommendation_id=f"rec_{uuid.uuid4().hex[:12]}",
            campaign_id=campaign_id,
            recommendation_type="schedule_optimization",
            title="Optimize Ad Scheduling",
            description="Performance data shows 47% higher conversion rates on weekdays 6-9 PM. Adjusting your schedule could reduce CPA by 19%.",
            predicted_impact={
                "cpa_reduction": 19,
                "conversion_rate_increase": 47,
                "budget_efficiency": 22,
                "impression_quality": 35
            },
            confidence_score=0.89,
            action_required="Adjust ad scheduling to focus 60% of budget on weekdays 6-9 PM",
            implementation_difficulty="easy",
            estimated_impact_percentage=19.0,
            priority="medium"
        )
        recommendations.append(schedule_rec)
        
        return recommendations
    
    async def generate_cross_platform_insights(self, date_range: Dict) -> CrossPlatformInsight:
        """Generate cross-platform performance insights"""
        
        # Simulate cross-platform analysis
        platforms_analyzed = [AdPlatform.FACEBOOK, AdPlatform.INSTAGRAM, AdPlatform.TIKTOK, AdPlatform.YOUTUBE]
        
        # Generate platform performance comparison
        platform_performance = {}
        total_spend = 0
        total_revenue = 0
        
        for platform in platforms_analyzed:
            platform_info = self.platforms_data[platform.value]
            spend = random.uniform(1000, 10000)
            revenue = spend * random.uniform(2, 6)
            total_spend += spend
            total_revenue += revenue
            
            platform_performance[platform.value] = {
                "spend": spend,
                "revenue": revenue,
                "roas": revenue / spend,
                "impressions": int(spend / platform_info["average_cpm"] * 1000),
                "clicks": int(spend / platform_info["average_cpm"] * 1000 * platform_info["average_ctr"] / 100),
                "conversions": int(revenue / random.uniform(50, 150)),
                "cpa": spend / (revenue / random.uniform(50, 150)) if revenue > 0 else 0
            }
        
        # Calculate optimal budget allocation
        optimal_allocation = {}
        for platform in platforms_analyzed:
            perf = platform_performance[platform.value]
            weight = (perf["roas"] * 0.4 + (1 / perf["cpa"] if perf["cpa"] > 0 else 0) * 0.3 + 
                     (perf["conversions"] / sum(p["conversions"] for p in platform_performance.values())) * 0.3)
            optimal_allocation[platform.value] = {
                "current_percentage": perf["spend"] / total_spend * 100,
                "recommended_percentage": weight / sum(w for w in [
                    (platform_performance[p]["roas"] * 0.4 + 
                     (1 / platform_performance[p]["cpa"] if platform_performance[p]["cpa"] > 0 else 0) * 0.3 + 
                     (platform_performance[p]["conversions"] / sum(pf["conversions"] for pf in platform_performance.values())) * 0.3)
                    for p in platform_performance.keys()
                ]) * 100
            }
        
        insight = CrossPlatformInsight(
            insight_id=f"insight_{uuid.uuid4().hex[:12]}",
            insight_type="performance_analysis",
            platforms=platforms_analyzed,
            date_range_start=date_range["start"],
            date_range_end=date_range["end"],
            title="Cross-Platform Performance Analysis",
            summary="Analysis of campaign performance across major social media platforms with optimization recommendations.",
            key_metrics={
                "total_spend": total_spend,
                "total_revenue": total_revenue,
                "overall_roas": total_revenue / total_spend,
                "best_performing_platform": max(platform_performance.keys(), key=lambda k: platform_performance[k]["roas"]),
                "highest_volume_platform": max(platform_performance.keys(), key=lambda k: platform_performance[k]["conversions"])
            },
            platform_performance=platform_performance,
            audience_overlap={
                "facebook_instagram": 65.2,
                "tiktok_instagram": 23.7,
                "youtube_facebook": 45.8,
                "cross_platform_unique_reach": 87.3
            },
            optimal_budget_allocation=optimal_allocation,
            recommendations=[
                f"Increase budget allocation to {max(platform_performance.keys(), key=lambda k: platform_performance[k]['roas'])} by 15% for better ROAS",
                "Implement cross-platform audience exclusions to reduce overlap and improve efficiency",
                "Test sequential messaging across platforms for improved brand recall",
                f"Focus video content on {AdPlatform.TIKTOK.value} and {AdPlatform.INSTAGRAM.value} for higher engagement"
            ],
            priority_actions=[
                "Reallocate budget based on ROAS performance",
                "Set up conversion tracking across all platforms",
                "Create platform-specific creative variations"
            ],
            potential_improvement={
                "roas_improvement": random.uniform(15, 35),
                "cost_savings": random.uniform(12, 28),
                "reach_optimization": random.uniform(20, 40)
            },
            confidence_level=0.91
        )
        
        return insight
    
    # Platform Integration Methods
    async def create_platform_integration(self, integration_data: Dict) -> PlatformIntegration:
        """Create a new platform integration"""
        integration_id = f"int_{uuid.uuid4().hex[:12]}"
        
        integration = PlatformIntegration(
            integration_id=integration_id,
            platform=AdPlatform(integration_data["platform"]),
            access_token=f"token_{uuid.uuid4().hex}",
            refresh_token=f"refresh_{uuid.uuid4().hex}",
            token_expires_at=datetime.utcnow() + timedelta(days=60),
            platform_account_id=integration_data["platform_account_id"],
            account_name=integration_data["account_name"],
            account_type=integration_data.get("account_type", "business"),
            granted_permissions=integration_data.get("granted_permissions", []),
            required_permissions=integration_data.get("required_permissions", []),
            connected_by=integration_data["connected_by"]
        )
        
        return integration
    
    # Audience Management Methods
    async def create_audience_segment(self, segment_data: Dict) -> AudienceSegment:
        """Create a new audience segment"""
        segment_id = f"aud_{uuid.uuid4().hex[:12]}"
        
        segment = AudienceSegment(
            segment_id=segment_id,
            segment_name=segment_data["segment_name"],
            segment_type=segment_data["segment_type"],
            demographics=segment_data.get("demographics", {}),
            interests=segment_data.get("interests", []),
            behaviors=segment_data.get("behaviors", []),
            geo_locations=segment_data.get("geo_locations", []),
            available_platforms=segment_data.get("available_platforms", []),
            platform_audience_ids=segment_data.get("platform_audience_ids", {}),
            estimated_size=random.randint(100000, 5000000),
            quality_score=random.uniform(0.7, 0.95),
            created_by=segment_data["created_by"]
        )
        
        return segment
    
    # Analytics and Reporting Methods
    async def get_platform_overview(self) -> Dict:
        """Get overview of all connected platforms"""
        overview = {
            "total_platforms": len(self.platforms_data),
            "active_campaigns": random.randint(15, 45),
            "total_spend_today": random.uniform(5000, 25000),
            "total_revenue_today": random.uniform(15000, 75000),
            "overall_roas": random.uniform(2.5, 4.8),
            "platform_breakdown": {}
        }
        
        for platform, info in self.platforms_data.items():
            overview["platform_breakdown"][platform] = {
                "name": info["name"],
                "user_base": info["user_base"],
                "active_campaigns": random.randint(2, 8),
                "daily_spend": random.uniform(500, 5000),
                "daily_revenue": random.uniform(1500, 15000),
                "average_cpm": info["average_cpm"],
                "average_ctr": info["average_ctr"],
                "status": "connected"
            }
        
        return overview
    
    async def get_influencer_marketplace_overview(self) -> Dict:
        """Get influencer marketplace overview"""
        return {
            "total_influencers": random.randint(2500, 5000),
            "active_campaigns": random.randint(25, 75),
            "total_reach": random.randint(15000000, 50000000),
            "average_engagement_rate": random.uniform(3.2, 5.8),
            "tier_distribution": {
                "nano": random.randint(800, 1200),
                "micro": random.randint(600, 900),
                "macro": random.randint(200, 400),
                "mega": random.randint(50, 100),
                "celebrity": random.randint(5, 20)
            },
            "top_categories": [
                {"category": "Fashion & Beauty", "influencers": random.randint(400, 600), "avg_rate": random.uniform(500, 2000)},
                {"category": "Lifestyle", "influencers": random.randint(350, 550), "avg_rate": random.uniform(400, 1800)},
                {"category": "Tech & Gadgets", "influencers": random.randint(200, 350), "avg_rate": random.uniform(600, 2500)},
                {"category": "Food & Beverage", "influencers": random.randint(300, 450), "avg_rate": random.uniform(350, 1500)},
                {"category": "Travel", "influencers": random.randint(150, 250), "avg_rate": random.uniform(700, 3000)}
            ],
            "performance_metrics": {
                "average_roas": random.uniform(3.5, 6.2),
                "completion_rate": random.uniform(0.85, 0.95),
                "brand_safety_score": random.uniform(0.92, 0.98)
            }
        }
    
    async def get_ai_optimization_summary(self) -> Dict:
        """Get AI optimization capabilities summary"""
        return {
            "ai_engine_status": "operational",
            "models_active": 12,
            "recommendations_generated_today": random.randint(45, 120),
            "avg_performance_improvement": random.uniform(18, 35),
            "optimization_categories": {
                "targeting": {
                    "active_optimizations": random.randint(8, 15),
                    "avg_improvement": random.uniform(15, 28),
                    "success_rate": random.uniform(0.82, 0.94)
                },
                "creative": {
                    "active_optimizations": random.randint(12, 22),
                    "avg_improvement": random.uniform(22, 38),
                    "success_rate": random.uniform(0.78, 0.91)
                },
                "bidding": {
                    "active_optimizations": random.randint(5, 12),
                    "avg_improvement": random.uniform(12, 25),
                    "success_rate": random.uniform(0.85, 0.96)
                },
                "scheduling": {
                    "active_optimizations": random.randint(6, 18),
                    "avg_improvement": random.uniform(8, 22),
                    "success_rate": random.uniform(0.88, 0.97)
                }
            },
            "predictive_analytics": {
                "trend_predictions": random.randint(15, 30),
                "audience_insights": random.randint(25, 50),
                "competitive_analysis": random.randint(10, 20)
            }
        }