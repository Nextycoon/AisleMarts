"""
💰🎯 AisleMarts Lead Economy Routes
0% Commission, Pay-Per-Lead Business Model - World's Fairest Commerce Platform
"""

from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import json
import logging

from services.lead_economy_service import lead_economy_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/lead-economy", tags=["Lead Economy 💰🎯"])

class VendorOnboardingRequest(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=100)
    business_type: str = Field(..., description="retail, service, digital, manufacturing, etc.")
    industry: str = Field(..., description="Fashion, Electronics, Home, etc.")
    business_size: str = Field(default="small", description="small, medium, large, enterprise")
    contact_info: Dict[str, Any] = Field(...)
    target_market: Dict[str, Any] = Field(default_factory=dict)
    marketing_budget: Optional[float] = Field(None, description="Monthly marketing budget")

class LeadGenerationRequest(BaseModel):
    shopper_data: Dict[str, Any] = Field(...)
    vendor_filters: Dict[str, Any] = Field(...)
    lead_source: str = Field(default="for_you_feed")
    priority: str = Field(default="standard", description="standard, high, urgent")

class CreditPurchaseRequest(BaseModel):
    package_id: str = Field(..., description="Package to purchase")
    auto_renewal: bool = Field(default=False)
    payment_method: str = Field(default="aislemarts_balance")

@router.post("/onboard-vendor")
async def onboard_vendor_zero_commission(request: VendorOnboardingRequest):
    """
    🎯 Onboard vendor with 0% commission guarantee and free lead credits
    """
    try:
        result = await lead_economy_service.onboard_vendor_zero_commission(request.model_dump())
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Onboarding failed"))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Vendor onboarding error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-lead")
async def generate_qualified_lead(request: LeadGenerationRequest):
    """
    🤖 Generate AI-qualified lead for vendor (internal system use)
    """
    try:
        result = await lead_economy_service.generate_qualified_lead(
            request.shopper_data,
            request.vendor_filters
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Lead generation failed"))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lead generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/packages")
async def get_lead_packages():
    """
    📦 Get all available lead credit packages
    """
    try:
        packages = lead_economy_service.lead_packages
        
        return {
            "success": True,
            "lead_packages": packages,
            "pricing_philosophy": {
                "no_commission": "0% commission on all sales - keep 100% revenue",
                "pay_for_results": "Pay only for qualified leads delivered",
                "transparent_pricing": "No hidden fees, no setup costs, no minimums",
                "scalable_costs": "Free tier to enterprise - scales with your business"
            },
            "competitive_comparison": {
                "aislemarts": {
                    "commission": "0%",
                    "setup_fee": "$0",
                    "monthly_minimum": "$0",
                    "lead_cost": "$0.10-$0.20",
                    "hidden_fees": "None"
                },
                "amazon": {
                    "commission": "15-30%",
                    "setup_fee": "Varies",
                    "monthly_minimum": "$39.99+",
                    "advertising_cost": "$0.50-$3.00+ per click",
                    "hidden_fees": "Multiple"
                },
                "shopify": {
                    "commission": "2.9% + 30¢",
                    "setup_fee": "$0",
                    "monthly_minimum": "$29-$2,000+",
                    "app_costs": "$20-$500+/month",
                    "hidden_fees": "Transaction fees"
                }
            },
            "roi_calculator": {
                "example_scenario": "Monthly revenue: $10,000",
                "aislemarts_cost": "$0 commission + $150 lead costs = $150 total",
                "amazon_cost": "$1,500-$3,000 commission + advertising = $2,000-$4,000 total",
                "savings": "$1,850-$3,850 per month with AisleMarts"
            }
        }
    except Exception as e:
        logger.error(f"Packages retrieval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/purchase-credits")
async def purchase_lead_credits(
    request: CreditPurchaseRequest,
    vendor_id: str = Query(..., description="Vendor ID"),
    background_tasks: BackgroundTasks = None
):
    """
    💳 Purchase lead credit package
    """
    try:
        result = await lead_economy_service.purchase_lead_credits(vendor_id, request.package_id)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Purchase failed"))
        
        # Add background tasks for purchase processing
        if background_tasks:
            background_tasks.add_task(_process_credit_purchase, vendor_id, request.model_dump())
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Credit purchase error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def _process_credit_purchase(vendor_id: str, purchase_data: Dict[str, Any]):
    """Background task for credit purchase processing"""
    logger.info(f"Processing credit purchase for vendor {vendor_id}")

@router.get("/analytics/{vendor_id}")
async def get_vendor_lead_analytics(vendor_id: str):
    """
    📊 Get comprehensive lead performance analytics
    """
    try:
        result = await lead_economy_service.get_vendor_lead_analytics(vendor_id)
        
        if not result.get("success"):
            raise HTTPException(status_code=404, detail="Vendor analytics not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/vendor-dashboard/{vendor_id}")
async def get_vendor_lead_dashboard(vendor_id: str):
    """
    📈 Get vendor lead management dashboard
    """
    try:
        # Mock dashboard data (in production: real dashboard)
        dashboard = {
            "vendor_id": vendor_id,
            "current_credits": {
                "package": "Growth Pack",
                "credits_remaining": 847,
                "credits_used_this_month": 153,
                "reset_date": "2025-02-21",
                "auto_renewal": True
            },
            "recent_leads": [
                {
                    "lead_id": "lead_001",
                    "received_at": "2025-01-21T10:30:00",
                    "quality_score": 0.87,
                    "category": "Luxury Fashion",
                    "estimated_value": "$450",
                    "status": "contacted",
                    "source": "For You Feed"
                },
                {
                    "lead_id": "lead_002", 
                    "received_at": "2025-01-21T09:15:00",
                    "quality_score": 0.72,
                    "category": "Home Decor",
                    "estimated_value": "$280",
                    "status": "converted",
                    "source": "Search Discovery"
                }
            ],
            "quick_stats": {
                "today_leads": 5,
                "this_week_leads": 34,
                "this_month_leads": 153,
                "conversion_rate": "17.4%",
                "avg_lead_score": 0.78
            },
            "revenue_summary": {
                "commission_rate": "0% - Keep 100% of revenue",
                "revenue_this_month": "$12,847.50",
                "commission_saved": "$1,927.13 vs traditional platforms",
                "lead_roi": "420%",
                "cost_per_acquisition": "$8.33"
            },
            "notifications": [
                {
                    "type": "high_quality_lead",
                    "message": "New high-quality lead (score: 0.87) waiting for response",
                    "timestamp": "2025-01-21T10:30:00",
                    "action_required": "Respond within 1 hour for best conversion"
                },
                {
                    "type": "credit_usage",
                    "message": "Credits usage: 847 remaining (85% left)",
                    "timestamp": "2025-01-21T00:00:00",
                    "action_required": None
                }
            ],
            "optimization_tips": [
                "Response time under 2 hours increases conversion by 40%",
                "Personalized outreach based on lead intelligence performs 60% better",
                "Consider upgrading to Scale Pack for advanced lead filtering"
            ]
        }
        
        return {
            "success": True,
            "vendor_dashboard": dashboard,
            "zero_commission_benefits": {
                "revenue_kept": "100%",
                "savings_vs_competitors": "$1,927.13 this month",
                "transparent_costs": "Only pay for qualified leads",
                "no_hidden_fees": "What you see is what you pay"
            }
        }
    except Exception as e:
        logger.error(f"Vendor dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/business-model")
async def get_lead_economy_overview():
    """
    🌍 Get comprehensive overview of AisleMarts 0% commission lead economy
    """
    try:
        result = await lead_economy_service.get_lead_economy_overview()
        return result
    except Exception as e:
        logger.error(f"Business model overview error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/competitive-analysis")
async def get_competitive_analysis():
    """
    🥊 Get detailed competitive analysis vs traditional platforms
    """
    try:
        return {
            "success": True,
            "competitive_positioning": {
                "aislemarts_advantage": "World's First 0% Commission Commerce Platform",
                "market_disruption": "Pay-Per-Lead vs Pay-Per-Sale Commission Model"
            },
            "detailed_comparison": {
                "amazon_marketplace": {
                    "commission": "15-30% of sale value",
                    "fees": "Referral fees, fulfillment fees, storage fees",
                    "advertising": "$0.50-$3.00+ per click",
                    "control": "Limited control over customer data",
                    "aislemarts_advantage": "0% commission, pay only for qualified leads, full customer relationship control"
                },
                "shopify": {
                    "monthly_cost": "$29-$2,000+",
                    "transaction_fees": "2.9% + 30¢ per transaction",
                    "app_costs": "$20-$500+ monthly for essential apps",
                    "advertising": "Separate advertising costs", 
                    "aislemarts_advantage": "Free tier available, no transaction fees, no app costs, built-in AI targeting"
                },
                "alibaba": {
                    "membership": "$2,000-$40,000+ annually",
                    "commission": "2-5% + payment processing",
                    "advertising": "Pay-per-click + membership fees",
                    "complexity": "Complex fee structure",
                    "aislemarts_advantage": "Simple transparent pricing, no membership fees, better for small/medium businesses"
                },
                "etsy": {
                    "listing_fee": "$0.20 per listing",
                    "transaction_fee": "6.5% of sale price", 
                    "payment_processing": "3-4%",
                    "advertising": "Pay-per-click advertising",
                    "aislemarts_advantage": "No listing fees, 0% transaction fees, qualified leads vs broad advertising"
                }
            },
            "roi_scenarios": {
                "small_business": {
                    "monthly_revenue": "$5,000",
                    "aislemarts_cost": "$0 commission + ~$75 leads = $75",
                    "amazon_cost": "$750-$1,500 commission + advertising = $1,000+",
                    "savings": "$925+ monthly"
                },
                "medium_business": {
                    "monthly_revenue": "$25,000", 
                    "aislemarts_cost": "$0 commission + ~$300 leads = $300",
                    "traditional_cost": "$3,750-$7,500 commission + advertising = $5,000+",
                    "savings": "$4,700+ monthly"
                },
                "large_business": {
                    "monthly_revenue": "$100,000",
                    "aislemarts_cost": "$0 commission + ~$1,000 leads = $1,000",
                    "traditional_cost": "$15,000-$30,000 commission + advertising = $20,000+",
                    "savings": "$19,000+ monthly"
                }
            },
            "vendor_testimonials": [
                {
                    "business": "Luxury Fashion Boutique",
                    "savings": "$2,400/month",
                    "quote": "Finally, a platform that doesn't take our hard-earned revenue. Lead quality is exceptional."
                },
                {
                    "business": "Home Decor Store",
                    "savings": "$1,800/month", 
                    "quote": "Best decision we made. 0% commission means we can offer better prices to customers."
                }
            ]
        }
    except Exception as e:
        logger.error(f"Competitive analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/success-stories")
async def get_vendor_success_stories():
    """
    🏆 Get vendor success stories with 0% commission model
    """
    try:
        return {
            "success": True,
            "success_stories": [
                {
                    "vendor_name": "Milano Fashion House",
                    "business_type": "Luxury Fashion",
                    "results": {
                        "revenue_increase": "+340%",
                        "commission_savings": "$4,200/month",
                        "lead_conversion": "22.3%",
                        "roi_on_leads": "580%"
                    },
                    "testimonial": "AisleMarts changed our business. Keeping 100% of revenue means we can invest more in quality and customer service. The leads are incredibly qualified.",
                    "key_metrics": {
                        "monthly_revenue": "$28,500",
                        "leads_converted": "89 out of 399",
                        "average_order_value": "$320",
                        "customer_satisfaction": "4.9/5"
                    }
                },
                {
                    "vendor_name": "TechGadget Pro",
                    "business_type": "Electronics",
                    "results": {
                        "revenue_increase": "+280%",
                        "commission_savings": "$2,100/month",
                        "lead_conversion": "19.8%",
                        "roi_on_leads": "450%"
                    },
                    "testimonial": "The AI lead qualification is amazing. We only get shoppers who are genuinely interested in our products. No more wasted advertising spend.",
                    "key_metrics": {
                        "monthly_revenue": "$15,800", 
                        "leads_converted": "67 out of 338",
                        "average_order_value": "$235",
                        "customer_satisfaction": "4.7/5"
                    }
                },
                {
                    "vendor_name": "Artisan Home Crafts",
                    "business_type": "Home & Garden",
                    "results": {
                        "revenue_increase": "+420%",
                        "commission_savings": "$1,250/month",
                        "lead_conversion": "25.1%",
                        "roi_on_leads": "630%"
                    },
                    "testimonial": "As a small business, every dollar matters. Not paying commission means we can offer competitive prices and still maintain healthy margins.",
                    "key_metrics": {
                        "monthly_revenue": "$8,900",
                        "leads_converted": "45 out of 179",
                        "average_order_value": "$198",
                        "customer_satisfaction": "4.8/5"
                    }
                }
            ],
            "aggregate_results": {
                "average_revenue_increase": "+347%",
                "average_commission_savings": "$2,517/month",
                "average_lead_conversion": "22.4%",
                "average_roi": "553%",
                "vendor_satisfaction": "96% would recommend"
            },
            "platform_benefits": [
                "100% revenue retention vs 70-85% on traditional platforms",
                "Qualified leads vs spray-and-pray advertising",
                "Transparent, predictable costs",
                "AI-powered lead optimization",
                "Global reach with local personalization"
            ]
        }
    except Exception as e:
        logger.error(f"Success stories error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def lead_economy_health_check():
    """
    🏥 Lead economy service health check
    """
    return {
        "status": "operational",
        "service": "AisleMarts Lead Economy Platform",
        "business_model": "0% Commission, Pay-Per-Lead",
        "features": [
            "zero_commission_guarantee",
            "ai_lead_qualification",
            "transparent_pricing",
            "scalable_packages",
            "real_time_analytics"
        ],
        "competitive_advantages": [
            "World's first 0% commission commerce platform",
            "Pay only for qualified leads, not presence",
            "Free tier for risk-free vendor onboarding",
            "AI-powered lead scoring and matching",
            "Complete cost transparency"
        ],
        "vendor_benefits": {
            "revenue_retention": "100%",
            "cost_predictability": "Pay-per-lead only",
            "lead_quality": "AI-qualified leads",
            "global_reach": "4M+ cities worldwide"
        },
        "positioning": "World's Fairest Commerce Platform"
    }