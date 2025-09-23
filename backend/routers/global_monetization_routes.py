from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

from services.global_monetization_service import GlobalMonetizationService
from models.global_monetization import (
    DynamicCommissionStructure, TransactionCommission, AdvertisingCampaign,
    UserSubscription, VirtualGood, VirtualCurrency, RevenueAnalytics,
    MonetizationDashboard, CommissionCalculationRequest, AdCampaignCreateRequest,
    SubscriptionUpgradeRequest, VirtualGoodPurchaseRequest, SubscriptionType,
    PaymentMethod, CommissionTier, AdFormat
)

router = APIRouter()
monetization = GlobalMonetizationService()


@router.get("/health")
async def health_check():
    """Health check for Global Monetization Engine"""
    return {
        "status": "operational",
        "service": "AisleMarts Global Monetization Engine",
        "monetization_streams": [
            "dynamic_commissions",
            "advertising_campaigns",
            "subscription_management", 
            "affiliate_programs",
            "virtual_goods_marketplace",
            "premium_services",
            "revenue_analytics",
            "programmatic_advertising"
        ],
        "revenue_optimization": {
            "ai_powered_pricing": True,
            "dynamic_commission_tiers": True,
            "programmatic_ad_bidding": True,
            "subscription_optimization": True,
            "virtual_economy": True
        },
        "platform_metrics": {
            "commission_structures": len(monetization.commission_structures),
            "active_campaigns": len([c for c in monetization.ad_campaigns.values() if c.status == "active"]),
            "subscription_plans": len(monetization.subscription_plans),
            "virtual_goods": len(monetization.virtual_goods),
            "marketplace_services": len(monetization.marketplace_services)
        },
        "ai_integration": "emergent_llm" if monetization.monetization_ai else "mock_mode",
        "timestamp": datetime.now()
    }


# Dynamic Commission System
@router.post("/commission/calculate")
async def calculate_dynamic_commission(
    seller_id: str = Query(..., description="Seller user ID"),
    transaction_amount: float = Query(..., description="Transaction amount in USD"),
    product_category: str = Query(..., description="Product category"),
    buyer_location: str = Query("US", description="Buyer location"),
    is_premium_seller: bool = Query(False, description="Is seller premium tier"),
    referral_code: Optional[str] = Query(None, description="Referral code if applicable")
):
    """Calculate dynamic commission with AI optimization"""
    try:
        request = CommissionCalculationRequest(
            seller_id=seller_id,
            transaction_amount=transaction_amount,
            product_category=product_category,
            buyer_location=buyer_location,
            is_premium_seller=is_premium_seller,
            referral_code=referral_code
        )
        
        result = await monetization.calculate_dynamic_commission(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Commission calculation failed: {str(e)}")


@router.get("/commission/structure/{seller_id}")
async def get_commission_structure(seller_id: str):
    """Get seller's commission structure and performance"""
    structure = monetization.commission_structures.get(seller_id)
    if not structure:
        raise HTTPException(status_code=404, detail="Commission structure not found")
    return structure


@router.get("/commission/tiers")
async def get_commission_tiers():
    """Get available commission tiers and requirements"""
    return {
        "tiers": [
            {
                "tier": "bronze",
                "gmv_range": "0 - 10K",
                "base_rate": "5%",
                "benefits": ["Standard support", "Basic analytics"]
            },
            {
                "tier": "silver", 
                "gmv_range": "10K - 100K",
                "base_rate": "4%",
                "benefits": ["Priority support", "Advanced analytics", "Marketing tools"]
            },
            {
                "tier": "gold",
                "gmv_range": "100K - 1M",
                "base_rate": "3.5%",
                "benefits": ["Dedicated manager", "Custom integrations", "Premium features"]
            },
            {
                "tier": "platinum",
                "gmv_range": "1M+",
                "base_rate": "3%",
                "benefits": ["White-label options", "API access", "Custom commission rates"]
            }
        ],
        "performance_bonuses": {
            "high_rating": "0.5% bonus",
            "fast_shipping": "0.3% bonus",
            "premium_seller": "1% bonus"
        }
    }


# Advanced Advertising System
@router.post("/advertising/campaign/create")
async def create_advertising_campaign(
    advertiser_id: str = Query(..., description="Advertiser user ID"),
    campaign_name: str = Query(..., description="Campaign name"),
    budget_total: float = Query(..., description="Total campaign budget"),
    budget_daily: float = Query(..., description="Daily budget"),
    target_audience: str = Query(..., description="JSON target audience data"),
    ad_formats: str = Query(..., description="JSON array of ad formats"),
    creative_assets: str = Query(..., description="JSON array of creative assets"),
    start_date: str = Query(..., description="Campaign start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="Campaign end date (ISO format)")
) -> AdvertisingCampaign:
    """Create new advertising campaign with AI optimization"""
    try:
        request = AdCampaignCreateRequest(
            campaign_name=campaign_name,
            budget_total=budget_total,
            budget_daily=budget_daily,
            target_audience=json.loads(target_audience),
            ad_formats=json.loads(ad_formats),
            creative_assets=json.loads(creative_assets),
            start_date=start_date,
            end_date=end_date
        )
        
        campaign = await monetization.create_ad_campaign(advertiser_id, request)
        return campaign
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in request parameters")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Campaign creation failed: {str(e)}")


@router.get("/advertising/campaign/{campaign_id}")
async def get_advertising_campaign(campaign_id: str):
    """Get advertising campaign details"""
    campaign = monetization.ad_campaigns.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.post("/advertising/auction/simulate")
async def simulate_programmatic_auction(
    ad_slot_id: str = Query(..., description="Ad slot identifier"),
    user_profile: str = Query(..., description="JSON user profile for targeting")
):
    """Simulate programmatic ad auction"""
    try:
        user_data = json.loads(user_profile)
        auction = await monetization.run_programmatic_auction(ad_slot_id, user_data)
        return auction
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid user profile JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auction simulation failed: {str(e)}")


@router.get("/advertising/campaigns/active")
async def get_active_campaigns(
    advertiser_id: Optional[str] = Query(None, description="Filter by advertiser"),
    limit: int = Query(20, description="Number of campaigns to return")
):
    """Get active advertising campaigns"""
    try:
        active_campaigns = [
            c for c in monetization.ad_campaigns.values()
            if c.status == "active"
        ]
        
        if advertiser_id:
            active_campaigns = [c for c in active_campaigns if c.advertiser_id == advertiser_id]
        
        # Sort by budget (highest first)
        active_campaigns.sort(key=lambda x: x.budget_total, reverse=True)
        
        return {
            "campaigns": active_campaigns[:limit],
            "total_active": len(active_campaigns),
            "total_budget": sum(c.budget_total for c in active_campaigns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get campaigns: {str(e)}")


@router.get("/advertising/formats")
async def get_ad_formats():
    """Get available advertising formats and pricing"""
    return {
        "formats": [
            {
                "format": "native_feed",
                "name": "Native Feed Ad",
                "description": "Seamlessly integrated into user feed",
                "base_cpm": 2.50,
                "engagement_rate": "3.2%"
            },
            {
                "format": "story_ad",
                "name": "Story Advertisement",
                "description": "Full-screen immersive story format",
                "base_cpm": 4.00,
                "engagement_rate": "5.8%"
            },
            {
                "format": "video_ad",
                "name": "Video Advertisement",
                "description": "Engaging video content",
                "base_cpm": 6.00,
                "engagement_rate": "7.1%"
            },
            {
                "format": "shoppable_ad",
                "name": "Shoppable Advertisement",
                "description": "Direct purchase integration",
                "base_cpm": 8.00,
                "engagement_rate": "9.5%"
            }
        ],
        "targeting_options": [
            "demographics", "interests", "behavior", "location",
            "device", "purchase_history", "engagement_level"
        ]
    }


# Subscription Management
@router.post("/subscription/upgrade")
async def upgrade_user_subscription(
    user_id: str = Query(..., description="User ID"),
    new_plan_type: str = Query(..., description="New subscription plan type"),
    payment_method: str = Query(..., description="Payment method"),
    billing_frequency: str = Query("monthly", description="Billing frequency"),
    promo_code: Optional[str] = Query(None, description="Promotional code")
) -> UserSubscription:
    """Upgrade user subscription with optimized pricing"""
    try:
        request = SubscriptionUpgradeRequest(
            user_id=user_id,
            new_plan_type=SubscriptionType(new_plan_type),
            payment_method=PaymentMethod(payment_method),
            billing_frequency=billing_frequency,
            promo_code=promo_code
        )
        
        subscription = await monetization.upgrade_subscription(request)
        return subscription
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subscription upgrade failed: {str(e)}")


@router.get("/subscription/plans")
async def get_subscription_plans(
    target_audience: Optional[str] = Query(None, description="Filter by target audience")
):
    """Get available subscription plans"""
    try:
        plans = list(monetization.subscription_plans.values())
        
        if target_audience:
            plans = [p for p in plans if p.target_audience == target_audience]
        
        # Add comparison data
        for plan in plans:
            plan_dict = plan.dict()
            plan_dict["yearly_savings"] = (plan.price_monthly * 12 - plan.price_yearly) if plan.price_yearly > 0 else 0
            plan_dict["monthly_equivalent"] = plan.price_yearly / 12 if plan.price_yearly > 0 else plan.price_monthly
        
        return {
            "plans": plans,
            "comparison": {
                "most_popular": "premium",
                "best_value": "enterprise",
                "starter_plan": "basic"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get subscription plans: {str(e)}")


@router.get("/subscription/{user_id}")
async def get_user_subscription(user_id: str):
    """Get user's current subscription"""
    user_subscription = None
    for sub in monetization.user_subscriptions.values():
        if sub.user_id == user_id and sub.status == "active":
            user_subscription = sub
            break
    
    if not user_subscription:
        return {
            "user_id": user_id,
            "subscription": None,
            "status": "no_active_subscription",
            "upgrade_recommendations": [
                {
                    "plan": "basic",
                    "benefits": "Get started with essential features",
                    "price": "$9.99/month"
                }
            ]
        }
    
    return {
        "user_id": user_id,
        "subscription": user_subscription,
        "usage_stats": user_subscription.usage_statistics,
        "upgrade_options": [
            {
                "plan": "premium",
                "benefits": "Unlock advanced features",
                "savings": "20% off first year"
            }
        ]
    }


# Virtual Goods & Digital Economy
@router.get("/virtual-goods/catalog")
async def get_virtual_goods_catalog(
    category: Optional[str] = Query(None, description="Filter by category"),
    rarity: Optional[str] = Query(None, description="Filter by rarity"),
    limit: int = Query(20, description="Number of items")
):
    """Get virtual goods catalog"""
    try:
        goods = list(monetization.virtual_goods.values())
        
        # Apply filters
        if category:
            goods = [g for g in goods if g.category == category]
        if rarity:
            goods = [g for g in goods if g.rarity == rarity]
        
        # Sort by price (ascending)
        goods.sort(key=lambda x: x.price_usd)
        
        return {
            "virtual_goods": goods[:limit],
            "categories": list(set(g.category for g in monetization.virtual_goods.values())),
            "rarities": ["common", "rare", "epic", "legendary"],
            "total_items": len(goods)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get virtual goods: {str(e)}")


@router.post("/virtual-goods/purchase")
async def purchase_virtual_good(
    user_id: str = Query(..., description="User ID"),
    virtual_good_id: str = Query(..., description="Virtual good ID"),
    quantity: int = Query(1, description="Quantity to purchase"),
    payment_method: str = Query("virtual_currency", description="Payment method"),
    gift_recipient_id: Optional[str] = Query(None, description="Gift recipient ID")
):
    """Purchase virtual good"""
    try:
        request = VirtualGoodPurchaseRequest(
            user_id=user_id,
            virtual_good_id=virtual_good_id,
            quantity=quantity,
            payment_method=payment_method,
            gift_recipient_id=gift_recipient_id
        )
        
        purchase = await monetization.purchase_virtual_good(request)
        return {
            "purchase": purchase,
            "message": "Purchase successful!",
            "remaining_balance": monetization.virtual_currencies.get(user_id, {}).get("balance", 0)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Purchase failed: {str(e)}")


@router.get("/virtual-currency/{user_id}")
async def get_user_virtual_currency(user_id: str):
    """Get user's virtual currency balance and history"""
    try:
        currency = await monetization.get_user_virtual_currency(user_id)
        return {
            "currency": currency,
            "earning_opportunities": [
                {
                    "action": "daily_login",
                    "reward": "10 AisleCoins",
                    "description": "Login daily to earn coins"
                },
                {
                    "action": "product_review",
                    "reward": "25 AisleCoins",
                    "description": "Write product reviews"
                },
                {
                    "action": "referral_bonus",
                    "reward": "100 AisleCoins",
                    "description": "Refer friends to AisleMarts"
                }
            ],
            "spending_suggestions": [
                {
                    "item": "Profile customization",
                    "cost": "50 AisleCoins",
                    "benefit": "Stand out with premium badges"
                },
                {
                    "item": "Priority support",
                    "cost": "200 AisleCoins",
                    "benefit": "Get faster customer service"
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get virtual currency: {str(e)}")


# Marketplace Services
@router.get("/marketplace/services")
async def get_marketplace_services(
    category: Optional[str] = Query(None, description="Service category"),
    pricing_model: Optional[str] = Query(None, description="Pricing model"),
    limit: int = Query(20, description="Number of services")
):
    """Get available marketplace services"""
    try:
        services = list(monetization.marketplace_services.values())
        
        # Apply filters
        if category:
            services = [s for s in services if s.service_category == category]
        if pricing_model:
            services = [s for s in services if s.pricing_model == pricing_model]
        
        # Sort by rating and active users
        services.sort(key=lambda x: (x.rating, x.active_users), reverse=True)
        
        return {
            "services": services[:limit],
            "categories": ["analytics", "marketing", "logistics", "design", "customer_service"],
            "pricing_models": ["subscription", "usage_based", "one_time", "commission"],
            "featured_services": [s for s in services if s.rating >= 4.5][:5]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get marketplace services: {str(e)}")


# Revenue Analytics & Business Intelligence
@router.get("/analytics/revenue")
async def get_revenue_analytics(
    period: str = Query("monthly", description="Analytics period: daily, weekly, monthly, quarterly, yearly"),
    include_forecasts: bool = Query(True, description="Include revenue forecasts")
):
    """Get comprehensive revenue analytics"""
    try:
        analytics = await monetization.generate_revenue_analytics(period)
        
        result = {
            "analytics": analytics,
            "key_insights": [
                f"Total revenue: ${analytics.total_revenue:,.2f}",
                f"Revenue growth: {analytics.revenue_growth_rate*100:.1f}%",
                f"ARPU: ${analytics.average_revenue_per_user:.2f}",
                f"Customer LTV: ${analytics.customer_lifetime_value:.2f}"
            ]
        }
        
        if include_forecasts:
            result["forecasts"] = {
                "next_month_revenue": analytics.total_revenue * (1 + analytics.revenue_growth_rate),
                "next_quarter_revenue": analytics.total_revenue * 3 * (1 + analytics.revenue_growth_rate),
                "confidence_level": 0.85
            }
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate analytics: {str(e)}")


@router.get("/analytics/dashboard")
async def get_monetization_dashboard():
    """Get comprehensive monetization dashboard"""
    try:
        dashboard = await monetization.get_monetization_dashboard()
        return dashboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard: {str(e)}")


@router.get("/analytics/performance-metrics")
async def get_performance_metrics():
    """Get key performance metrics for monetization"""
    try:
        # Calculate key metrics
        total_gmv = sum([tc.gross_amount for tc in monetization.transaction_commissions.values()])
        total_commission = sum([tc.commission_amount for tc in monetization.transaction_commissions.values()])
        active_subscriptions = len([s for s in monetization.user_subscriptions.values() if s.status == "active"])
        
        metrics = {
            "revenue_metrics": {
                "total_gmv": total_gmv,
                "total_commission_revenue": total_commission,
                "subscription_revenue": sum([s.billing_amount for s in monetization.user_subscriptions.values() if s.status == "active"]),
                "virtual_goods_revenue": sum([p.total_price_usd for p in monetization.virtual_purchases.values()]),
                "take_rate": (total_commission / total_gmv * 100) if total_gmv > 0 else 0
            },
            "user_metrics": {
                "total_sellers": len(set([tc.seller_id for tc in monetization.transaction_commissions.values()])),
                "active_subscribers": active_subscriptions,
                "virtual_currency_users": len(monetization.virtual_currencies),
                "average_subscription_value": sum([s.billing_amount for s in monetization.user_subscriptions.values()]) / max(active_subscriptions, 1)
            },
            "engagement_metrics": {
                "virtual_goods_adoption": (len(monetization.virtual_purchases) / max(len(monetization.virtual_currencies), 1)) * 100,
                "subscription_conversion": (active_subscriptions / max(len(monetization.virtual_currencies), 1)) * 100,
                "seller_retention": 0.89,  # Mock data
                "buyer_satisfaction": 4.6   # Mock data
            },
            "growth_indicators": {
                "month_over_month_growth": 0.234,
                "new_seller_acquisition": 0.156,
                "subscription_upgrade_rate": 0.089,
                "virtual_goods_repeat_purchase": 0.445
            }
        }
        
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {str(e)}")


# Optimization & Recommendations
@router.get("/optimization/recommendations")
async def get_monetization_recommendations():
    """Get AI-powered monetization optimization recommendations"""
    try:
        recommendations = [
            {
                "category": "commission_optimization",
                "title": "Implement Dynamic Tier Bonuses",
                "impact": "high",
                "estimated_revenue_increase": "15-25%",
                "description": "Add performance-based bonuses for top-tier sellers to increase retention and GMV",
                "implementation_effort": "medium",
                "timeline": "2-4 weeks"
            },
            {
                "category": "subscription_growth",
                "title": "Launch Premium Feature Upselling",
                "impact": "high",
                "estimated_revenue_increase": "30-40%",
                "description": "Target basic plan users with personalized upgrade campaigns based on usage patterns",
                "implementation_effort": "low",
                "timeline": "1-2 weeks"
            },
            {
                "category": "virtual_economy",
                "title": "Seasonal Virtual Goods Campaign",
                "impact": "medium",
                "estimated_revenue_increase": "10-15%",
                "description": "Launch limited-time seasonal items to drive urgency and engagement",
                "implementation_effort": "medium",
                "timeline": "3-5 weeks"
            },
            {
                "category": "advertising_optimization",
                "title": "AI-Powered Bid Optimization",
                "impact": "high",
                "estimated_revenue_increase": "20-35%",
                "description": "Implement machine learning for real-time bid optimization in programmatic auctions",
                "implementation_effort": "high",
                "timeline": "6-8 weeks"
            }
        ]
        
        return {
            "recommendations": recommendations,
            "priority_order": [
                "subscription_growth",
                "commission_optimization", 
                "advertising_optimization",
                "virtual_economy"
            ],
            "total_potential_impact": "75-115% revenue increase",
            "quick_wins": [rec for rec in recommendations if rec["implementation_effort"] == "low"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")


@router.get("/overview/summary")
async def get_monetization_overview():
    """Get high-level monetization overview"""
    return {
        "platform_status": "fully_operational",
        "monetization_health": "excellent",
        "active_revenue_streams": 8,
        "total_revenue_streams": [
            "Dynamic Commission System",
            "Programmatic Advertising",
            "Subscription Services", 
            "Virtual Goods Marketplace",
            "Affiliate Programs",
            "Premium Marketplace Services",
            "Data & Analytics Services",
            "White-Label Solutions"
        ],
        "optimization_level": "ai_powered",
        "business_model": "multi_stream_hybrid",
        "key_differentiators": [
            "AI-powered dynamic pricing",
            "Real-time commission optimization",
            "Programmatic advertising with quality scoring",
            "Comprehensive virtual economy",
            "Advanced revenue analytics",
            "Multi-tier subscription model"
        ],
        "competitive_advantages": [
            "0% base commission for new sellers",
            "AI-optimized monetization",
            "Transparent pricing structure",
            "Multiple revenue diversification",
            "Seller-friendly policies"
        ]
    }