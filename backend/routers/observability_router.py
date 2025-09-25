"""
AisleMarts Observability Router - Analytics & Metrics Endpoints
Handles event collection, metrics export, and health monitoring
"""

from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import logging

from observability.events import EventTracker, RFQEvents, AffiliateEvents, SystemEvents
from observability.metrics import get_metrics, MetricsCollector, calculate_sli_metrics
from middleware.auth import get_optional_user, AuthToken
from middleware.rate_limiting import rate_limit_general

router = APIRouter()
logger = logging.getLogger(__name__)

# ============================================================================
# Event Collection Endpoints
# ============================================================================

class EventRequest(BaseModel):
    """Client event request structure"""
    name: str = Field(..., min_length=1, max_length=100)
    props: Dict[str, Any] = Field(default_factory=dict)
    source: str = Field(default="frontend")
    user_id: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "name": "affiliate_click",
                "props": {
                    "link_id": "link_123",
                    "product_id": "prod_456", 
                    "campaign_id": "camp_789"
                },
                "source": "mobile_app"
            }
        }

class BatchEventRequest(BaseModel):
    """Batch event collection for better performance"""
    events: List[EventRequest] = Field(..., max_items=50)
    
    class Config:
        schema_extra = {
            "example": {
                "events": [
                    {
                        "name": "affiliate_click",
                        "props": {"link_id": "link_123", "product_id": "prod_456"}
                    },
                    {
                        "name": "rfq_view",
                        "props": {"rfq_id": "rfq_789", "category": "electronics"}
                    }
                ]
            }
        }

@router.post("/v1/events", tags=["analytics"])
async def track_single_event(
    event_request: EventRequest,
    request: Request,
    current_user: Optional[AuthToken] = Depends(get_optional_user),
    _: bool = Depends(rate_limit_general)
):
    """Track a single analytics event"""
    try:
        # Extract user info from auth if available
        user_id = event_request.user_id or (current_user.user_id if current_user else None)
        role = current_user.role if current_user else None
        
        # Track the event
        event_id = EventTracker.track(
            name=event_request.name,
            props=event_request.props,
            user_id=user_id,
            role=role,
            request=request,
            source=event_request.source
        )
        
        # Update metrics if it's a trackable event
        _update_metrics_for_event(event_request.name, event_request.props)
        
        return {
            "success": True,
            "event_id": event_id,
            "message": "Event tracked successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to track event {event_request.name}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track event")

@router.post("/v1/events/batch", tags=["analytics"])
async def track_batch_events(
    batch_request: BatchEventRequest,
    request: Request,
    current_user: Optional[AuthToken] = Depends(get_optional_user),
    _: bool = Depends(rate_limit_general)
):
    """Track multiple analytics events in batch for better performance"""
    try:
        event_ids = []
        
        for event_req in batch_request.events:
            user_id = event_req.user_id or (current_user.user_id if current_user else None)
            role = current_user.role if current_user else None
            
            event_id = EventTracker.track(
                name=event_req.name,
                props=event_req.props,
                user_id=user_id,
                role=role,
                request=request,
                source=event_req.source
            )
            
            event_ids.append(event_id)
            
            # Update metrics
            _update_metrics_for_event(event_req.name, event_req.props)
        
        return {
            "success": True,
            "event_ids": event_ids,
            "events_processed": len(batch_request.events),
            "message": f"Batch of {len(batch_request.events)} events tracked successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to track batch events: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track batch events")

def _update_metrics_for_event(event_name: str, props: Dict[str, Any]):
    """Update Prometheus metrics based on tracked events"""
    try:
        if event_name == "rfq_create":
            MetricsCollector.record_rfq_created(
                category=props.get("category", "unknown"),
                has_target_price=props.get("has_target_price", False),
                estimated_value=props.get("estimated_value_cents", 0) / 100 if props.get("estimated_value_cents") else None
            )
            
        elif event_name == "rfq_quote_submit":
            MetricsCollector.record_rfq_quote(
                category=props.get("category", "unknown"),
                supplier_tier=props.get("supplier_tier", "unknown")
            )
            
        elif event_name == "rfq_accept":
            MetricsCollector.record_rfq_accepted(
                category=props.get("category", "unknown"),
                value_usd=props.get("total_cents", 0) / 100
            )
            
        elif event_name == "affiliate_link_create":
            MetricsCollector.record_affiliate_link_created(
                campaign_type=props.get("campaign_type", "direct"),
                has_campaign=props.get("has_campaign", False)
            )
            
        elif event_name == "affiliate_click":
            MetricsCollector.record_affiliate_click(
                campaign_id=props.get("campaign_id", ""),
                product_category=props.get("product_category", "unknown")
            )
            
        elif event_name == "affiliate_purchase":
            MetricsCollector.record_affiliate_purchase(
                campaign_id=props.get("campaign_id", ""),
                product_category=props.get("product_category", "unknown"),
                gmv=props.get("amount_cents", 0) / 100,
                commission=props.get("commission_cents", 0) / 100
            )
            
    except Exception as e:
        logger.warning(f"Failed to update metrics for event {event_name}: {str(e)}")

# ============================================================================
# Metrics & Monitoring Endpoints
# ============================================================================

@router.get("/metrics", tags=["monitoring"])
async def prometheus_metrics():
    """Prometheus metrics endpoint - should be protected in production"""
    return get_metrics()

@router.get("/health", tags=["monitoring"])
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "aislemarts-backend",
        "version": "1.0.0"
    }

@router.get("/health/detailed", tags=["monitoring"])
async def detailed_health_check():
    """Detailed health check with SLI metrics"""
    try:
        sli_metrics = calculate_sli_metrics()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "aislemarts-backend", 
            "version": "1.0.0",
            "sli_metrics": sli_metrics,
            "components": {
                "database": "healthy",  # Would check actual DB
                "redis": "healthy",     # Would check actual Redis
                "event_system": "healthy"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": "Health check failed"
        }

# ============================================================================
# Analytics Query Endpoints (for dashboards)
# ============================================================================

@router.get("/analytics/rfq/funnel", tags=["analytics"])
async def get_rfq_funnel_metrics(
    days: int = 30,
    current_user: Optional[AuthToken] = Depends(get_optional_user)
):
    """Get RFQ funnel conversion metrics"""
    # In production, this would query the actual events table
    # For now, return mock data showing the structure
    
    mock_data = {
        "period_days": days,
        "funnel_data": {
            "rfq_created": 1247,
            "rfq_quoted": 892, 
            "rfq_accepted": 234
        },
        "conversion_rates": {
            "created_to_quoted": 0.715,  # 71.5%
            "quoted_to_accepted": 0.262,  # 26.2%
            "created_to_accepted": 0.188   # 18.8%
        },
        "by_category": {
            "electronics": {"created": 423, "quoted": 312, "accepted": 89},
            "fashion": {"created": 298, "quoted": 201, "accepted": 52}, 
            "home_garden": {"created": 276, "quoted": 189, "accepted": 47}
        },
        "avg_time_to_quote_hours": 18.5,
        "avg_time_to_acceptance_hours": 72.3
    }
    
    return mock_data

@router.get("/analytics/affiliate/performance", tags=["analytics"])  
async def get_affiliate_performance_metrics(
    days: int = 30,
    current_user: Optional[AuthToken] = Depends(get_optional_user)
):
    """Get affiliate performance and conversion metrics"""
    # Mock data structure for affiliate analytics
    
    mock_data = {
        "period_days": days,
        "overview": {
            "total_clicks": 15642,
            "total_purchases": 892,
            "total_gmv_usd": 47234.56,
            "total_commission_usd": 7085.18,
            "conversion_rate": 0.057,  # 5.7%
            "epc_usd": 0.453          # Earnings per click
        },
        "top_campaigns": [
            {
                "campaign_id": "summer_fashion_2024",
                "clicks": 3421,
                "purchases": 194,
                "gmv_usd": 12456.78,
                "commission_usd": 1868.52,
                "cvr": 0.057
            },
            {
                "campaign_id": "tech_gadgets_q4",
                "clicks": 2987,
                "purchases": 167,
                "gmv_usd": 18234.91,
                "commission_usd": 2735.24,
                "cvr": 0.056
            }
        ],
        "traffic_sources": [
            {"source": "instagram", "clicks": 6847, "purchases": 391, "cvr": 0.057},
            {"source": "tiktok", "clicks": 4523, "purchases": 267, "cvr": 0.059},
            {"source": "youtube", "clicks": 2891, "purchases": 142, "cvr": 0.049},
            {"source": "direct", "clicks": 1381, "purchases": 92, "cvr": 0.067}
        ]
    }
    
    return mock_data

@router.get("/analytics/live/dashboard", tags=["analytics"])
async def get_live_dashboard_metrics(current_user: Optional[AuthToken] = Depends(get_optional_user)):
    """Get real-time metrics for live dashboard"""
    
    mock_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "live_metrics": {
            "rfq_created_today": 47,
            "rfq_accepted_today": 12, 
            "affiliate_clicks_today": 1247,
            "affiliate_purchases_today": 89,
            "affiliate_gmv_today_usd": 4567.89,
            "active_users_now": 342,
            "api_requests_per_minute": 1834,
            "avg_response_time_ms": 187
        },
        "trending": {
            "top_rfq_categories": ["electronics", "fashion", "home_garden"],
            "top_affiliate_products": ["wireless_headphones", "smart_watch", "yoga_mat"],
            "busiest_hours": [14, 15, 16, 20, 21]  # Hours of day (UTC)
        }
    }
    
    return mock_data

# ============================================================================
# Debug & Development Endpoints
# ============================================================================

@router.post("/debug/trigger-test-events", tags=["debug"])
async def trigger_test_events(
    request: Request,
    current_user: Optional[AuthToken] = Depends(get_optional_user)
):
    """Trigger test events for development and testing - remove in production"""
    
    try:
        # Generate test RFQ events
        RFQEvents.created("test_rfq_123", "electronics", 1000, 15.50, "test_user", request)
        RFQEvents.quote_submitted("test_rfq_123", "test_quote_456", "test_supplier", 14800.00, 25, request)
        RFQEvents.quote_accepted("test_rfq_123", "test_quote_456", "test_buyer", "test_supplier", 14800.00, request)
        
        # Generate test affiliate events  
        AffiliateEvents.link_created("test_link_789", "test_creator", "test_campaign", ["prod_1", "prod_2"], 0.15, request)
        AffiliateEvents.link_clicked("test_link_789", "prod_1", "test_campaign", "instagram", request)
        AffiliateEvents.purchase_completed("test_link_789", "order_321", "prod_1", "test_campaign", 99.99, 14.99, "customer_123", request)
        
        return {
            "success": True,
            "message": "Test events generated successfully",
            "events_generated": 6
        }
        
    except Exception as e:
        logger.error(f"Failed to generate test events: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate test events")