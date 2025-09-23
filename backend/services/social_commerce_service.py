import asyncio
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import random

# Load environment variables
load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    class LlmChat:
        def __init__(self, *args, **kwargs):
            pass
        async def send_message(self, message):
            return "AI Assistant: Advanced social commerce analytics available."
    class UserMessage:
        def __init__(self, text):
            self.text = text

from models.social_commerce import (
    ShoppableContent, ProductTag, InfluencerProfile, BrandProfile,
    InfluencerCampaign, CollaborationProposal, UserGeneratedContent,
    SocialShoppingGroup, GroupPurchase, SocialReview, SocialProof,
    ConversionTracking, InfluencerAnalytics, SocialCommerceMetrics,
    CreatorMonetization, ContentType, InfluencerTier, CampaignStatus,
    CreateShoppableContentRequest, InfluencerSearchRequest,
    CampaignCreateRequest, GroupPurchaseRequest, SocialFeedItem,
    PersonalizedFeed
)


class SocialCommerceService:
    def __init__(self):
        self.emergent_llm_key = os.getenv("EMERGENT_LLM_KEY", "sk-emergent-35d93F3CeFf0c7aD50")
        self.ai_assistant = None
        self.init_ai_assistant()
        
        # In-memory storage (replace with MongoDB in production)
        self.shoppable_content: Dict[str, ShoppableContent] = {}
        self.influencer_profiles: Dict[str, InfluencerProfile] = {}
        self.brand_profiles: Dict[str, BrandProfile] = {}
        self.campaigns: Dict[str, InfluencerCampaign] = {}
        self.collaboration_proposals: Dict[str, CollaborationProposal] = {}
        self.ugc_content: Dict[str, UserGeneratedContent] = {}
        self.shopping_groups: Dict[str, SocialShoppingGroup] = {}
        self.group_purchases: Dict[str, GroupPurchase] = {}
        self.social_reviews: Dict[str, SocialReview] = {}
        self.social_proof: Dict[str, SocialProof] = {}
        self.conversion_tracking: Dict[str, ConversionTracking] = {}
        self.creator_monetization: Dict[str, CreatorMonetization] = {}
        
        # Initialize sample data
        self._initialize_sample_data()

    def init_ai_assistant(self):
        """Initialize AI Assistant for social commerce analytics"""
        try:
            self.ai_assistant = LlmChat(
                api_key=self.emergent_llm_key,
                session_id=f"social_commerce_ai_{uuid.uuid4()}",
                system_message="""You are the AisleMarts Social Commerce AI - an expert in social commerce analytics, influencer marketing, and user-generated content optimization.

Your capabilities include:
1. Content performance analysis and optimization recommendations
2. Influencer matching and campaign strategy
3. Social proof and conversion optimization
4. Trend analysis and market insights
5. Creator monetization strategies

Provide actionable insights with specific metrics and recommendations."""
            ).with_model("openai", "gpt-4o-mini")
        except Exception as e:
            print(f"Social Commerce AI initialization error: {e}")
            self.ai_assistant = None

    def _initialize_sample_data(self):
        """Initialize sample social commerce data"""
        
        # Sample influencer profiles
        sample_influencers = [
            {
                "user_id": "inf_001",
                "username": "fashionista_alex",
                "display_name": "Alex Chen",
                "bio": "Fashion & lifestyle influencer | Sustainable fashion advocate | 500K+ followers",
                "profile_image": "https://example.com/alex.jpg",
                "tier": InfluencerTier.MACRO,
                "follower_count": 524000,
                "engagement_rate": 0.045,
                "average_views": 85000,
                "specialties": ["fashion", "sustainable_living", "beauty"],
                "commission_rate": 0.12,
                "min_campaign_budget": 2000.0,
                "collaboration_count": 47,
                "total_revenue_generated": 125000.0,
                "rating": 4.8,
                "is_verified": True,
                "verification_badges": ["fashion_expert", "top_creator"]
            },
            {
                "user_id": "inf_002", 
                "username": "tech_reviewer_sam",
                "display_name": "Sam Rodriguez",
                "bio": "Tech reviewer & gadget enthusiast | Honest reviews | Early adopter",
                "profile_image": "https://example.com/sam.jpg",
                "tier": InfluencerTier.MICRO,
                "follower_count": 85000,
                "engagement_rate": 0.065,
                "average_views": 25000,
                "specialties": ["technology", "gadgets", "reviews"],
                "commission_rate": 0.08,
                "min_campaign_budget": 800.0,
                "collaboration_count": 23,
                "total_revenue_generated": 45000.0,
                "rating": 4.9,
                "is_verified": True,
                "verification_badges": ["tech_expert"]
            }
        ]
        
        for inf_data in sample_influencers:
            influencer = InfluencerProfile(**inf_data)
            self.influencer_profiles[influencer.user_id] = influencer

        # Sample shoppable content
        sample_content = [
            {
                "id": "content_001",
                "creator_id": "inf_001",
                "creator_name": "Alex Chen",
                "content_type": ContentType.POST,
                "title": "Summer Fashion Must-Haves 2025",
                "description": "Check out these sustainable fashion pieces perfect for summer! #SustainableFashion #Summer2025",
                "media_urls": ["https://example.com/fashion1.jpg", "https://example.com/fashion2.jpg"],
                "tagged_products": [
                    {
                        "product_id": "prod_001",
                        "product_name": "Organic Cotton Dress",
                        "product_image": "https://example.com/dress.jpg",
                        "price": 89.99,
                        "x_position": 25.0,
                        "y_position": 60.0,
                        "affiliate_commission": 0.15
                    }
                ],
                "engagement_count": 15420,
                "view_count": 125000,
                "purchase_count": 247,
                "conversion_rate": 0.0197,
                "revenue_generated": 22227.53,
                "hashtags": ["sustainable_fashion", "summer2025", "ootd"]
            }
        ]
        
        for content_data in sample_content:
            content = ShoppableContent(**content_data)
            self.shoppable_content[content.id] = content

        # Sample social proof data
        sample_proof = {
            "prod_001": SocialProof(
                product_id="prod_001",
                total_purchases=2547,
                recent_purchases_24h=23,
                average_rating=4.7,
                review_count=342,
                social_mentions=156,
                trending_score=8.4,
                influencer_recommendations=["inf_001"],
                user_photos_count=89,
                wishlist_count=1247
            )
        }
        
        for product_id, proof in sample_proof.items():
            self.social_proof[product_id] = proof

    # Shoppable Content Management
    async def create_shoppable_content(self, creator_id: str, request: CreateShoppableContentRequest) -> ShoppableContent:
        """Create new shoppable content"""
        content_id = str(uuid.uuid4())
        
        # Get creator info
        creator_profile = self.influencer_profiles.get(creator_id)
        creator_name = creator_profile.display_name if creator_profile else f"Creator_{creator_id[-6:]}"
        
        content = ShoppableContent(
            id=content_id,
            creator_id=creator_id,
            creator_name=creator_name,
            content_type=request.content_type,
            title=request.title,
            description=request.description,
            media_urls=request.media_urls,
            tagged_products=[tag.dict() for tag in request.tagged_products],
            hashtags=request.hashtags,
            location=request.location,
            is_sponsored=request.is_sponsored,
            sponsor_brand=request.sponsor_brand,
            published_at=datetime.now()
        )
        
        self.shoppable_content[content_id] = content
        
        # Initialize social proof for tagged products
        for product_tag in request.tagged_products:
            if product_tag.product_id not in self.social_proof:
                self.social_proof[product_tag.product_id] = SocialProof(
                    product_id=product_tag.product_id
                )
        
        return content

    async def get_content_performance(self, content_id: str) -> Dict[str, Any]:
        """Get detailed performance analytics for content"""
        content = self.shoppable_content.get(content_id)
        if not content:
            raise ValueError(f"Content {content_id} not found")
        
        # Simulate performance data
        performance = {
            "content_id": content_id,
            "engagement_metrics": {
                "views": content.view_count,
                "engagement_count": content.engagement_count,
                "engagement_rate": content.engagement_count / max(content.view_count, 1),
                "shares": random.randint(50, 500),
                "saves": random.randint(100, 1000),
                "comments": random.randint(20, 200)
            },
            "conversion_metrics": {
                "click_through_rate": random.uniform(0.02, 0.08),
                "conversion_rate": content.conversion_rate,
                "purchases": content.purchase_count,
                "revenue_generated": content.revenue_generated,
                "average_order_value": content.revenue_generated / max(content.purchase_count, 1)
            },
            "audience_insights": {
                "top_demographics": {
                    "age_groups": {"18-24": 0.35, "25-34": 0.45, "35-44": 0.20},
                    "gender": {"female": 0.68, "male": 0.32},
                    "locations": {"US": 0.45, "CA": 0.15, "UK": 0.12, "AU": 0.08}
                },
                "engagement_by_time": {
                    "peak_hours": ["19:00", "20:00", "21:00"],
                    "best_days": ["Saturday", "Sunday", "Wednesday"]
                }
            },
            "product_performance": []
        }
        
        # Add product-specific performance
        for product_data in content.tagged_products:
            product_perf = {
                "product_id": product_data["product_id"],
                "product_name": product_data["product_name"],
                "clicks": random.randint(100, 1000),
                "purchases": random.randint(5, 50),
                "revenue": random.uniform(500, 5000),
                "conversion_rate": random.uniform(0.01, 0.05)
            }
            performance["product_performance"].append(product_perf)
        
        return performance

    # Influencer Marketplace
    async def search_influencers(self, request: InfluencerSearchRequest) -> List[InfluencerProfile]:
        """Search for influencers based on criteria"""
        results = []
        
        for influencer in self.influencer_profiles.values():
            # Filter by specialties
            if request.specialties:
                if not any(spec in influencer.specialties for spec in request.specialties):
                    continue
            
            # Filter by follower count
            if request.min_followers and influencer.follower_count < request.min_followers:
                continue
            if request.max_followers and influencer.follower_count > request.max_followers:
                continue
            
            # Filter by engagement rate
            if request.engagement_rate_min and influencer.engagement_rate < request.engagement_rate_min:
                continue
            
            results.append(influencer)
        
        # Sort by relevance score (engagement rate + follower count)
        results.sort(
            key=lambda x: x.engagement_rate * 100 + (x.follower_count / 10000),
            reverse=True
        )
        
        return results[:20]  # Return top 20 matches

    async def create_campaign(self, brand_id: str, request: CampaignCreateRequest) -> InfluencerCampaign:
        """Create new influencer campaign"""
        campaign_id = str(uuid.uuid4())
        
        # Convert timeline string dates to datetime
        timeline = {}
        for key, date_str in request.timeline.items():
            timeline[key] = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        
        campaign = InfluencerCampaign(
            id=campaign_id,
            brand_id=brand_id,
            brand_name=f"Brand_{brand_id[-6:]}",
            campaign_name=request.campaign_name,
            description=request.description,
            campaign_type=request.campaign_type,
            budget=request.budget,
            objectives=request.objectives,
            target_demographics=request.target_demographics,
            content_requirements=request.content_requirements,
            deliverables=request.deliverables,
            timeline=timeline,
            status=CampaignStatus.DRAFT
        )
        
        self.campaigns[campaign_id] = campaign
        return campaign

    async def get_campaign_analytics(self, campaign_id: str) -> Dict[str, Any]:
        """Get comprehensive campaign analytics"""
        campaign = self.campaigns.get(campaign_id)
        if not campaign:
            raise ValueError(f"Campaign {campaign_id} not found")
        
        # Simulate campaign analytics
        analytics = {
            "campaign_id": campaign_id,
            "campaign_name": campaign.campaign_name,
            "status": campaign.status.value,
            "performance_summary": {
                "total_reach": random.randint(100000, 1000000),
                "total_engagement": random.randint(10000, 100000),
                "total_conversions": random.randint(500, 5000),
                "roi": random.uniform(2.5, 8.0),
                "cost_per_engagement": campaign.budget / random.randint(10000, 100000),
                "cost_per_conversion": campaign.budget / random.randint(500, 5000)
            },
            "influencer_performance": [],
            "content_breakdown": {
                "posts_created": random.randint(10, 50),
                "videos_created": random.randint(5, 20),
                "stories_created": random.randint(20, 100)
            },
            "audience_insights": {
                "demographics": {
                    "age_distribution": {"18-24": 0.30, "25-34": 0.40, "35-44": 0.25, "45+": 0.05},
                    "gender_split": {"female": 0.65, "male": 0.35},
                    "top_locations": ["United States", "Canada", "United Kingdom", "Australia"]
                },
                "engagement_patterns": {
                    "peak_engagement_hours": ["19:00-21:00", "12:00-14:00"],
                    "best_performing_content_types": ["carousel", "video", "story"]
                }
            }
        }
        
        # Add influencer-specific performance
        for influencer_id in campaign.selected_influencers:
            influencer = self.influencer_profiles.get(influencer_id)
            if influencer:
                perf = {
                    "influencer_id": influencer_id,
                    "username": influencer.username,
                    "reach": random.randint(10000, influencer.follower_count),
                    "engagement": random.randint(1000, 10000),
                    "conversions": random.randint(50, 500),
                    "revenue_generated": random.uniform(1000, 10000)
                }
                analytics["influencer_performance"].append(perf)
        
        return analytics

    # Social Shopping Features
    async def create_shopping_group(self, admin_id: str, name: str, description: str, 
                                  group_type: str = "general") -> SocialShoppingGroup:
        """Create new social shopping group"""
        group_id = str(uuid.uuid4())
        
        group = SocialShoppingGroup(
            id=group_id,
            name=name,
            description=description,
            admin_id=admin_id,
            members=[admin_id],
            group_type=group_type
        )
        
        self.shopping_groups[group_id] = group
        return group

    async def create_group_purchase(self, organizer_id: str, request: GroupPurchaseRequest) -> GroupPurchase:
        """Create group purchase opportunity"""
        purchase_id = str(uuid.uuid4())
        
        # Calculate savings
        regular_price = 100.0  # Mock regular price
        savings_per_person = regular_price - request.group_price
        
        group_purchase = GroupPurchase(
            id=purchase_id,
            group_id=request.group_id,
            organizer_id=organizer_id,
            product_id=request.product_id,
            product_name=f"Product_{request.product_id[-6:]}",
            product_image="https://example.com/product.jpg",
            regular_price=regular_price,
            group_price=request.group_price,
            minimum_participants=request.minimum_participants,
            maximum_participants=request.maximum_participants,
            deadline=datetime.fromisoformat(request.deadline.replace('Z', '+00:00')),
            savings_per_person=savings_per_person
        )
        
        self.group_purchases[purchase_id] = group_purchase
        return group_purchase

    async def join_group_purchase(self, purchase_id: str, user_id: str) -> Dict[str, Any]:
        """Join a group purchase"""
        purchase = self.group_purchases.get(purchase_id)
        if not purchase:
            raise ValueError(f"Group purchase {purchase_id} not found")
        
        if user_id in purchase.current_participants:
            return {"error": "User already participating"}
        
        if len(purchase.current_participants) >= purchase.maximum_participants:
            return {"error": "Group purchase is full"}
        
        if purchase.deadline < datetime.now():
            return {"error": "Group purchase deadline has passed"}
        
        purchase.current_participants.append(user_id)
        
        # Check if minimum reached
        if len(purchase.current_participants) >= purchase.minimum_participants:
            purchase.status = "ready_to_complete"
        
        # Calculate total savings if completed
        if len(purchase.current_participants) == purchase.maximum_participants:
            purchase.status = "completed"
            purchase.total_savings = purchase.savings_per_person * len(purchase.current_participants)
        
        return {
            "success": True,
            "current_participants": len(purchase.current_participants),
            "spots_remaining": purchase.maximum_participants - len(purchase.current_participants),
            "status": purchase.status,
            "savings_if_completed": purchase.savings_per_person
        }

    # User Generated Content
    async def get_trending_ugc(self, category: Optional[str] = None, limit: int = 20) -> List[UserGeneratedContent]:
        """Get trending user-generated content"""
        # This would normally query from database with trending algorithms
        # For now, return sample data
        
        trending_content = []
        for i in range(limit):
            content = UserGeneratedContent(
                id=f"ugc_{i+1}",
                user_id=f"user_{i+1}",
                username=f"user_{i+1}",
                content_type=random.choice(list(ContentType)),
                media_urls=[f"https://example.com/ugc_{i+1}.jpg"],
                caption=f"Amazing product! Love it! #{category if category else 'trending'}",
                hashtags=[category if category else "trending", "product", "love"],
                engagement_metrics={
                    "likes": random.randint(100, 5000),
                    "comments": random.randint(10, 500),
                    "shares": random.randint(5, 200)
                },
                is_featured=random.choice([True, False]),
                moderation_status="approved"
            )
            trending_content.append(content)
        
        return trending_content

    # Social Proof & Analytics
    async def get_product_social_proof(self, product_id: str) -> SocialProof:
        """Get social proof data for a product"""
        if product_id not in self.social_proof:
            # Create new social proof entry
            self.social_proof[product_id] = SocialProof(
                product_id=product_id,
                total_purchases=random.randint(100, 5000),
                recent_purchases_24h=random.randint(1, 50),
                average_rating=round(random.uniform(4.0, 5.0), 1),
                review_count=random.randint(10, 500),
                social_mentions=random.randint(10, 200),
                trending_score=round(random.uniform(1.0, 10.0), 1),
                user_photos_count=random.randint(5, 100),
                wishlist_count=random.randint(50, 1000)
            )
        
        return self.social_proof[product_id]

    async def generate_personalized_feed(self, user_id: str, limit: int = 20) -> PersonalizedFeed:
        """Generate personalized social commerce feed"""
        feed_items = []
        
        # Mix different types of content
        content_types = [
            ("shoppable_content", list(self.shoppable_content.values())),
            ("ugc", await self.get_trending_ugc(limit=10)),
            ("group_purchase", list(self.group_purchases.values()))
        ]
        
        for content_type, items in content_types:
            for item in items[:7]:  # Take some from each category
                feed_item = SocialFeedItem(
                    id=f"{content_type}_{getattr(item, 'id', uuid.uuid4())}",
                    type=content_type,
                    content=item.dict() if hasattr(item, 'dict') else item.__dict__,
                    creator_info={
                        "id": getattr(item, 'creator_id', getattr(item, 'user_id', 'unknown')),
                        "name": getattr(item, 'creator_name', getattr(item, 'username', 'Unknown')),
                        "avatar": "https://example.com/avatar.jpg"
                    },
                    engagement_metrics={
                        "likes": random.randint(100, 5000),
                        "comments": random.randint(10, 500),
                        "shares": random.randint(5, 200)
                    },
                    timestamp=datetime.now() - timedelta(hours=random.randint(1, 48)),
                    algorithm_score=random.uniform(0.5, 1.0)
                )
                feed_items.append(feed_item)
        
        # Sort by algorithm score and timestamp
        feed_items.sort(key=lambda x: (x.algorithm_score, x.timestamp), reverse=True)
        
        return PersonalizedFeed(
            user_id=user_id,
            feed_items=feed_items[:limit],
            recommendation_reasons={
                item.id: random.choice([
                    "Based on your interests",
                    "Popular in your area",
                    "Trending now",
                    "From creators you follow",
                    "Similar to items you liked"
                ])
                for item in feed_items[:limit]
            }
        )

    # Analytics & Insights
    async def get_platform_analytics(self) -> SocialCommerceMetrics:
        """Get comprehensive platform analytics"""
        
        # Calculate metrics from stored data
        total_content = len(self.shoppable_content)
        total_influencers = len(self.influencer_profiles)
        total_campaigns = len(self.campaigns)
        
        # Revenue calculations
        total_revenue = sum([content.revenue_generated for content in self.shoppable_content.values()])
        avg_conversion_rate = sum([content.conversion_rate for content in self.shoppable_content.values()]) / max(total_content, 1)
        
        metrics = SocialCommerceMetrics(
            platform_metrics={
                "total_shoppable_content": total_content,
                "total_influencers": total_influencers,
                "active_campaigns": len([c for c in self.campaigns.values() if c.status == CampaignStatus.ACTIVE]),
                "total_revenue": total_revenue,
                "total_conversions": sum([content.purchase_count for content in self.shoppable_content.values()]),
                "platform_commission": total_revenue * 0.05  # 5% platform fee
            },
            content_metrics={
                "avg_engagement_rate": sum([content.engagement_count / max(content.view_count, 1) for content in self.shoppable_content.values()]) / max(total_content, 1),
                "avg_conversion_rate": avg_conversion_rate,
                "top_performing_content": [content.id for content in sorted(self.shoppable_content.values(), key=lambda x: x.revenue_generated, reverse=True)[:5]],
                "content_by_type": {
                    "posts": len([c for c in self.shoppable_content.values() if c.content_type == ContentType.POST]),
                    "videos": len([c for c in self.shoppable_content.values() if c.content_type == ContentType.VIDEO]),
                    "stories": len([c for c in self.shoppable_content.values() if c.content_type == ContentType.STORY])
                }
            },
            influencer_metrics={
                "total_verified_influencers": len([inf for inf in self.influencer_profiles.values() if inf.is_verified]),
                "avg_follower_count": sum([inf.follower_count for inf in self.influencer_profiles.values()]) / max(total_influencers, 1),
                "avg_engagement_rate": sum([inf.engagement_rate for inf in self.influencer_profiles.values()]) / max(total_influencers, 1),
                "top_earning_influencers": [inf.user_id for inf in sorted(self.influencer_profiles.values(), key=lambda x: x.total_revenue_generated, reverse=True)[:5]],
                "influencer_tiers": {
                    "nano": len([inf for inf in self.influencer_profiles.values() if inf.tier == InfluencerTier.NANO]),
                    "micro": len([inf for inf in self.influencer_profiles.values() if inf.tier == InfluencerTier.MICRO]),
                    "macro": len([inf for inf in self.influencer_profiles.values() if inf.tier == InfluencerTier.MACRO]),
                    "mega": len([inf for inf in self.influencer_profiles.values() if inf.tier == InfluencerTier.MEGA])
                }
            },
            user_engagement={
                "total_ugc_posts": len(self.ugc_content),
                "total_shopping_groups": len(self.shopping_groups),
                "active_group_purchases": len([gp for gp in self.group_purchases.values() if gp.status == "active"]),
                "total_social_reviews": len(self.social_reviews)
            },
            revenue_attribution={
                "influencer_driven": total_revenue * 0.65,
                "ugc_driven": total_revenue * 0.25,
                "group_purchase_driven": total_revenue * 0.10
            },
            social_proof_impact={
                "products_with_social_proof": len(self.social_proof),
                "avg_social_proof_score": sum([proof.trending_score for proof in self.social_proof.values()]) / max(len(self.social_proof), 1)
            }
        )
        
        return metrics

    async def get_creator_analytics(self, creator_id: str) -> Dict[str, Any]:
        """Get detailed analytics for a specific creator"""
        creator_content = [content for content in self.shoppable_content.values() if content.creator_id == creator_id]
        
        if not creator_content:
            return {"error": "No content found for creator"}
        
        total_views = sum([content.view_count for content in creator_content])
        total_engagement = sum([content.engagement_count for content in creator_content])
        total_revenue = sum([content.revenue_generated for content in creator_content])
        total_conversions = sum([content.purchase_count for content in creator_content])
        
        analytics = {
            "creator_id": creator_id,
            "overview": {
                "total_content": len(creator_content),
                "total_views": total_views,
                "total_engagement": total_engagement,
                "total_revenue": total_revenue,
                "total_conversions": total_conversions,
                "avg_engagement_rate": total_engagement / max(total_views, 1),
                "avg_conversion_rate": total_conversions / max(total_views, 1)
            },
            "content_performance": [
                {
                    "content_id": content.id,
                    "title": content.title,
                    "type": content.content_type.value,
                    "views": content.view_count,
                    "engagement": content.engagement_count,
                    "conversions": content.purchase_count,
                    "revenue": content.revenue_generated,
                    "created_at": content.created_at
                }
                for content in sorted(creator_content, key=lambda x: x.revenue_generated, reverse=True)
            ],
            "monetization": {
                "total_earnings": total_revenue * 0.85,  # 85% creator share
                "avg_earning_per_post": (total_revenue * 0.85) / max(len(creator_content), 1),
                "revenue_by_content_type": {
                    "posts": sum([c.revenue_generated for c in creator_content if c.content_type == ContentType.POST]) * 0.85,
                    "videos": sum([c.revenue_generated for c in creator_content if c.content_type == ContentType.VIDEO]) * 0.85,
                    "stories": sum([c.revenue_generated for c in creator_content if c.content_type == ContentType.STORY]) * 0.85
                }
            },
            "recommendations": [
                "Focus on video content for higher engagement",
                "Collaborate with trending brands in your niche", 
                "Post consistently during peak hours (7-9 PM)",
                "Use trending hashtags to increase discoverability"
            ]
        }
        
        return analytics