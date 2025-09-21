"""
👑 AisleMarts Premium Membership Routes
Luxury tier membership with exclusive benefits and personalization endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import json
import logging

from services.premium_membership_service import premium_membership_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/premium-membership", tags=["Premium Membership 👑"])

class MembershipUpgradeRequest(BaseModel):
    target_tier: str = Field(..., description="premium, elite, sovereign")
    billing_cycle: str = Field(default="monthly", description="monthly, annual")
    payment_method_id: Optional[str] = Field(None, description="Stripe payment method ID")
    promotional_code: Optional[str] = Field(None, description="Promotional or discount code")

class MembershipPreferencesRequest(BaseModel):
    communication_preferences: Dict[str, bool] = Field(default_factory=dict)
    luxury_categories: List[str] = Field(default_factory=list)
    shopping_style: str = Field(default="balanced", description="impulsive, research_heavy, balanced")
    concierge_availability: Optional[str] = Field(None, description="business_hours, 24_7, weekends")

@router.get("/tiers")
async def get_membership_tiers():
    """
    👑 Get all available membership tiers with benefits and pricing
    """
    try:
        result = await premium_membership_service.get_membership_tiers()
        return result
        
    except Exception as e:
        logger.error(f"Membership tiers error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upgrade")
async def upgrade_membership(
    request: MembershipUpgradeRequest,
    user_id: str = "current_user",
    background_tasks: BackgroundTasks = None
):
    """
    ⬆️ Upgrade to premium membership tier with immediate activation
    """
    try:
        # Validate tier
        valid_tiers = ["premium", "elite", "sovereign"]
        if request.target_tier not in valid_tiers:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid tier. Must be one of: {valid_tiers}"
            )
        
        result = await premium_membership_service.upgrade_membership(
            user_id,
            request.target_tier,
            request.billing_cycle
        )
        
        # Add background tasks for membership activation
        if background_tasks and result.get("success"):
            background_tasks.add_task(
                _activate_membership_benefits,
                user_id,
                request.target_tier
            )
            background_tasks.add_task(
                _send_welcome_communication,
                user_id,
                request.target_tier
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Membership upgrade error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def _activate_membership_benefits(user_id: str, tier: str):
    """Background task to activate membership benefits"""
    logger.info(f"Activating {tier} membership benefits for user {user_id}")

async def _send_welcome_communication(user_id: str, tier: str):
    """Background task to send welcome communications"""
    logger.info(f"Sending {tier} welcome package to user {user_id}")

@router.get("/benefits/{user_id}")
async def get_member_benefits(user_id: str):
    """
    🎁 Get current member benefits, usage statistics, and ROI analysis
    """
    try:
        result = await premium_membership_service.get_member_benefits(user_id)
        return result
        
    except Exception as e:
        logger.error(f"Member benefits error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-monthly-benefits")
async def process_monthly_benefits(
    user_id: str = "current_user",
    background_tasks: BackgroundTasks = None
):
    """
    📦 Process and deliver monthly premium member benefits
    """
    try:
        result = await premium_membership_service.process_monthly_benefits(user_id)
        
        # Schedule delivery and notifications
        if background_tasks and result.get("success"):
            background_tasks.add_task(
                _schedule_luxury_box_delivery,
                user_id,
                result.get("monthly_delivery", {})
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Monthly benefits processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def _schedule_luxury_box_delivery(user_id: str, delivery_data: Dict[str, Any]):
    """Background task to schedule luxury box delivery"""
    logger.info(f"Scheduling luxury box delivery for user {user_id}")

@router.put("/preferences")
async def update_membership_preferences(
    preferences: MembershipPreferencesRequest,
    user_id: str = "current_user"
):
    """
    ⚙️ Update premium membership preferences and personalization
    """
    try:
        # Process preference updates (mock implementation)
        return {
            "success": True,
            "preferences_updated": preferences.model_dump(),
            "personalization_impact": {
                "curated_content": "Improved product recommendations",
                "communication": "Optimized notification frequency", 
                "concierge_services": "Tailored service availability",
                "luxury_box_curation": "Enhanced monthly selections"
            },
            "immediate_changes": [
                "Product feed algorithm updated",
                "Notification preferences applied",
                "Concierge availability set",
                "Personal shopper briefed on style preferences"
            ]
        }
        
    except Exception as e:
        logger.error(f"Preferences update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/exclusive-access")
async def get_exclusive_member_access():
    """
    🔐 Get exclusive member-only products, sales, and experiences
    """
    try:
        return {
            "success": True,
            "exclusive_collections": [
                {
                    "collection": "AisleMarts Reserve Collection",
                    "description": "Ultra-exclusive luxury items available only to Premium+ members",
                    "items_count": 24,
                    "price_range": "$5,000 - $250,000",
                    "member_discount": "15-25% exclusive pricing"
                },
                {
                    "collection": "Designer Collaborations",
                    "description": "Limited edition collaborations with world-renowned designers",
                    "items_count": 12,
                    "price_range": "$1,500 - $50,000",
                    "member_discount": "Early access + 20% off"
                }
            ],
            "member_only_sales": [
                {
                    "event": "Elite Flash Sale",
                    "starts": "2025-01-22T00:00:00Z",
                    "duration": "24 hours",
                    "discount": "Up to 40% off luxury brands",
                    "eligible_tiers": ["premium", "elite", "sovereign"]
                },
                {
                    "event": "Sovereign Pre-Launch",
                    "starts": "2025-01-25T00:00:00Z", 
                    "duration": "48 hours",
                    "discount": "30% off + exclusive access",
                    "eligible_tiers": ["sovereign"]
                }
            ],
            "exclusive_experiences": [
                {
                    "experience": "Private Shopping Session",
                    "description": "One-on-one session with luxury consultant",
                    "duration": "2 hours",
                    "value": "$500",
                    "member_price": "Complimentary for Elite+",
                    "booking_required": True
                },
                {
                    "experience": "Luxury Brand Showcase",
                    "description": "Exclusive preview of upcoming luxury collections",
                    "date": "2025-02-15",
                    "location": "New York Showroom",
                    "member_price": "Invitation only",
                    "eligible_tiers": ["elite", "sovereign"]
                },
                {
                    "experience": "Annual Luxury Retreat",
                    "description": "3-day luxury lifestyle retreat in Switzerland",
                    "date": "2025-06-20 to 2025-06-23",
                    "value": "$15,000",
                    "member_price": "Complimentary for Sovereign",
                    "eligible_tiers": ["sovereign"]
                }
            ]
        }
        
    except Exception as e:
        logger.error(f"Exclusive access error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/member-analytics/{user_id}")
async def get_member_analytics(
    user_id: str,
    period: str = Query("monthly", description="monthly, quarterly, yearly")
):
    """
    📊 Get detailed membership analytics and value optimization insights
    """
    try:
        return {
            "success": True,
            "analytics_period": period,
            "membership_roi": {
                "membership_cost": 99.99,
                "total_savings": 387.45,
                "roi_percentage": 287.5,
                "break_even_point": "Day 8 of membership"
            },
            "usage_analytics": {
                "free_shipping_used": 15,
                "shipping_savings": 127.50,
                "exclusive_discounts_used": 8,
                "discount_savings": 189.25,
                "concierge_requests": 4,
                "concierge_value": 200.00,
                "early_access_items": 3,
                "early_access_value": 67.20
            },
            "engagement_metrics": {
                "monthly_logins": 23,
                "luxury_box_satisfaction": 4.8,
                "concierge_satisfaction": 4.9,
                "referrals_made": 2,
                "member_events_attended": 1
            },
            "recommendations": [
                "You're saving 3.9x your membership cost - excellent value!",
                "Consider booking a personal shopping session - you've earned 2 hours free",
                "Your luxury box preferences show interest in watches - new collection launching soon",
                "You qualify for Sovereign tier upgrade based on usage patterns"
            ],
            "tier_progress": {
                "current_tier": "elite",
                "next_tier": "sovereign",
                "progress": 0.73,
                "requirements_remaining": [
                    "Maintain spending level for 2 more months",
                    "Use concierge service 2 more times"
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Member analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel-membership")
async def cancel_membership(
    user_id: str = "current_user",
    reason: str = Query(..., description="Cancellation reason"),
    feedback: Optional[str] = Query(None, description="Optional feedback")
):
    """
    ❌ Cancel premium membership with retention offers
    """
    try:
        # Mock cancellation process with retention offers
        return {
            "success": True,
            "cancellation_processed": False,  # Not immediate
            "retention_offers": [
                {
                    "offer": "50% off next 3 months",
                    "value": "$149.97 savings",
                    "expires": "2025-01-28T23:59:59Z",
                    "accept_url": "/api/premium-membership/retention/accept/50_percent"
                },
                {
                    "offer": "Pause membership for 3 months",
                    "value": "Resume anytime with full benefits",
                    "expires": "2025-01-28T23:59:59Z",
                    "accept_url": "/api/premium-membership/retention/pause"
                },
                {
                    "offer": "Downgrade to Premium tier",
                    "value": "$70/month savings with core benefits",
                    "expires": "2025-01-28T23:59:59Z",
                    "accept_url": "/api/premium-membership/retention/downgrade"
                }
            ],
            "immediate_action": "Cancellation scheduled for end of billing period",
            "benefits_retain_until": "2025-02-21T23:59:59Z",
            "what_youll_miss": [
                "24/7 concierge service ($200/month value)",
                "Same-day delivery in major cities",
                "Exclusive member events and previews",
                "3x reward points on all purchases",
                "Monthly luxury box ($250 value)"
            ],
            "easy_return": "Reactivate anytime with one click - no re-enrollment needed"
        }
        
    except Exception as e:
        logger.error(f"Membership cancellation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def premium_membership_health_check():
    """
    🏥 Premium membership service health check
    """
    return {
        "status": "operational",
        "service": "AisleMarts Premium Membership Platform",
        "features": [
            "tier_management",
            "benefit_tracking",
            "exclusive_access_control",
            "monthly_benefit_processing",
            "member_analytics"
        ],
        "active_members": {
            "premium": 45000,
            "elite": 8500,
            "sovereign": 1200
        },
        "member_satisfaction": 4.8,
        "retention_rate": "94.2%",
        "average_roi": "320%"
    }