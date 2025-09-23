from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from datetime import datetime

from ..services.live_streaming_ai_service import LiveStreamingAIService
from ..models.live_streaming import (
    LiveStream, CreateStreamRequest, UpdateStreamRequest, 
    StreamAnalyticsRequest, ViewerAction, ProductShowcase
)

router = APIRouter()
live_service = LiveStreamingAIService()


@router.get("/health")
async def health_check():
    """Health check for Live Streaming Commerce system"""
    return {
        "status": "operational",
        "service": "Live Streaming Commerce & Analytics",
        "ai_models": {
            "audience_predictor": live_service.ai_models_performance.get("audience_predictor", 0.887),
            "product_recommender": live_service.ai_models_performance.get("product_recommender", 0.923),
            "revenue_optimizer": live_service.ai_models_performance.get("revenue_optimizer", 0.856),
            "engagement_analyzer": live_service.ai_models_performance.get("engagement_analyzer", 0.901)
        },
        "features": [
            "ai_powered_analytics", 
            "real_time_insights", 
            "revenue_optimization",
            "audience_behavior_analysis",
            "product_recommendation",
            "live_commerce_integration"
        ],
        "total_streams": len(live_service.streams),
        "ai_integration": "emergent_llm" if live_service.ai_chat else "mock_mode",
        "timestamp": datetime.now()
    }


@router.post("/streams", response_model=LiveStream)
async def create_stream(request: CreateStreamRequest, host_id: str = "demo_host"):
    """Create a new live stream with AI-powered setup insights"""
    try:
        stream = await live_service.create_stream(
            host_id=host_id,
            host_name="Demo Host",  # In production, get from auth
            title=request.title,
            description=request.description,
            scheduled_start=request.scheduled_start,
            thumbnail_url=request.thumbnail_url,
            products=request.products,
            tags=request.tags,
            category=request.category
        )
        return stream
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create stream: {str(e)}")


@router.get("/streams/{stream_id}", response_model=LiveStream)
async def get_stream(stream_id: str):
    """Get stream details by ID"""
    stream = await live_service.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    return stream


@router.patch("/streams/{stream_id}", response_model=LiveStream)
async def update_stream(stream_id: str, request: UpdateStreamRequest):
    """Update stream details"""
    stream = await live_service.update_stream(stream_id, **request.dict(exclude_unset=True))
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    return stream


@router.post("/streams/{stream_id}/start")
async def start_stream(stream_id: str):
    """Start a live stream with real-time AI analytics"""
    result = await live_service.start_stream(stream_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/streams/{stream_id}/end")
async def end_stream(stream_id: str):
    """End stream and generate comprehensive analytics report"""
    result = await live_service.end_stream(stream_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/streams/{stream_id}/analytics")
async def get_real_time_analytics(stream_id: str):
    """Get real-time analytics and AI insights for active stream"""
    analytics = await live_service.get_real_time_analytics(stream_id)
    if "error" in analytics:
        raise HTTPException(status_code=404, detail=analytics["error"])
    return analytics


@router.post("/streams/{stream_id}/actions")
async def record_viewer_action(
    stream_id: str,
    action: ViewerAction,
    viewer_id: str = Query(..., description="ID of the viewer performing the action"),
    product_id: Optional[str] = Query(None, description="Product ID for purchase actions"),
    amount: Optional[float] = Query(None, description="Purchase amount")
):
    """Record viewer actions for real-time analytics"""
    metadata = {}
    if product_id:
        metadata["product_id"] = product_id
    if amount:
        metadata["amount"] = amount
    
    success = await live_service.record_viewer_action(stream_id, viewer_id, action, metadata)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to record action")
    
    return {"success": True, "action": action.value, "viewer_id": viewer_id}


@router.get("/analytics/dashboard")
async def get_analytics_dashboard(
    host_id: str = Query("demo_host", description="Host ID"),
    date_range: str = Query("last_7_days", description="Date range for analytics")
):
    """Get comprehensive analytics dashboard with AI insights"""
    dashboard = await live_service.get_analytics_dashboard(host_id, date_range)
    return dashboard


@router.get("/streams")
async def list_streams(
    host_id: Optional[str] = Query(None, description="Filter by host ID"),
    status: Optional[str] = Query(None, description="Filter by stream status"),
    limit: int = Query(20, description="Number of streams to return"),
    offset: int = Query(0, description="Offset for pagination")
):
    """List streams with optional filters"""
    all_streams = list(live_service.streams.values())
    
    # Apply filters
    if host_id:
        all_streams = [s for s in all_streams if s.host_id == host_id]
    if status:
        all_streams = [s for s in all_streams if s.status.value == status]
    
    # Sort by created_at descending
    all_streams.sort(key=lambda s: s.created_at, reverse=True)
    
    # Apply pagination
    paginated_streams = all_streams[offset:offset + limit]
    
    return {
        "streams": paginated_streams,
        "total": len(all_streams),
        "limit": limit,
        "offset": offset
    }


@router.get("/streams/{stream_id}/products")
async def get_stream_products(stream_id: str):
    """Get products featured in a stream"""
    stream = await live_service.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    return {"products": stream.products}


@router.post("/streams/{stream_id}/products")
async def add_stream_product(stream_id: str, product: ProductShowcase):
    """Add a product to stream showcase"""
    stream = await live_service.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    stream.products.append(product)
    stream.updated_at = datetime.now()
    
    return {"success": True, "product_added": product.name, "total_products": len(stream.products)}


@router.patch("/streams/{stream_id}/products/{product_id}")
async def update_stream_product(stream_id: str, product_id: str, updates: Dict[str, Any]):
    """Update a product in stream showcase"""
    stream = await live_service.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    # Find and update product
    for product in stream.products:
        if product.product_id == product_id:
            for key, value in updates.items():
                if hasattr(product, key):
                    setattr(product, key, value)
            stream.updated_at = datetime.now()
            return {"success": True, "product_updated": product.name}
    
    raise HTTPException(status_code=404, detail="Product not found in stream")


@router.post("/streams/{stream_id}/feature-product")
async def feature_product(stream_id: str, product_id: str):
    """Feature a specific product during live stream"""
    stream = await live_service.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    # Check if product exists in stream
    product_exists = any(p.product_id == product_id for p in stream.products)
    if not product_exists:
        raise HTTPException(status_code=404, detail="Product not found in stream")
    
    # Update featured product
    stream.current_featured_product = product_id
    stream.updated_at = datetime.now()
    
    # Update product's featured timestamp
    for product in stream.products:
        if product.product_id == product_id:
            product.featured_timestamp = datetime.now()
            break
    
    return {
        "success": True,
        "featured_product": product_id,
        "timestamp": datetime.now()
    }


@router.get("/ai/insights/{stream_id}")
async def get_ai_insights(stream_id: str):
    """Get AI-generated insights for a specific stream"""
    stream = await live_service.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    return {
        "stream_id": stream_id,
        "ai_insights": [insight.dict() for insight in stream.ai_insights],
        "total_insights": len(stream.ai_insights),
        "latest_insight": stream.ai_insights[-1].dict() if stream.ai_insights else None
    }


@router.get("/ai/recommendations/{stream_id}")
async def get_ai_recommendations(stream_id: str):
    """Get real-time AI recommendations for optimizing stream performance"""
    stream = await live_service.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    # Get current viewer count and recent activity
    current_viewers = len(set([
        e.viewer_id for e in live_service.viewer_engagements 
        if e.stream_id == stream_id and 
        e.timestamp > datetime.now() - timedelta(minutes=5)
    ]))
    
    recent_purchases = len([
        e for e in live_service.viewer_engagements 
        if e.stream_id == stream_id and 
        e.action == ViewerAction.PURCHASE and 
        e.timestamp > datetime.now() - timedelta(minutes=30)
    ])
    
    # Generate AI recommendations
    recommendations = await live_service.generate_real_time_recommendations(
        stream, current_viewers, recent_purchases
    )
    
    # Get optimal product timing
    product_timing = await live_service.suggest_product_timing(stream)
    
    return {
        "stream_id": stream_id,
        "current_performance": {
            "viewers": current_viewers,
            "recent_purchases": recent_purchases,
            "engagement_trend": live_service.calculate_engagement_trend(stream_id)
        },
        "ai_recommendations": recommendations,
        "product_timing": product_timing,
        "ai_confidence": 0.89,
        "generated_at": datetime.now()
    }


@router.get("/analytics/performance")
async def get_performance_metrics():
    """Get overall platform performance metrics"""
    total_streams = len(live_service.streams)
    live_streams = len([s for s in live_service.streams.values() if s.status.value == "live"])
    total_viewers = sum([s.analytics.total_viewers for s in live_service.streams.values()])
    total_revenue = sum([s.analytics.total_revenue for s in live_service.streams.values()])
    
    return {
        "platform_metrics": {
            "total_streams": total_streams,
            "active_streams": live_streams,
            "total_viewers": total_viewers,
            "total_revenue": total_revenue,
            "average_revenue_per_stream": total_revenue / max(total_streams, 1),
            "ai_model_performance": live_service.ai_models_performance
        },
        "system_health": {
            "ai_service_status": "operational" if live_service.ai_chat else "mock_mode",
            "analytics_engine": "operational",
            "real_time_processing": "operational"
        },
        "generated_at": datetime.now()
    }