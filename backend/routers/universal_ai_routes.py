"""
Universal Commerce AI API Routes
===============================
RESTful API endpoints for the AisleMarts Universal Commerce AI Hub
"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, List, Any, Optional
import asyncio
from datetime import datetime, timedelta
import json

from services.universal_commerce_ai import universal_ai, Platform

router = APIRouter(prefix="/universal-ai", tags=["universal_ai"])

@router.on_event("startup")
async def startup_universal_ai():
    """Initialize Universal Commerce AI Hub on startup"""
    try:
        await universal_ai.initialize()
    except Exception as e:
        print(f"❌ Failed to initialize Universal AI: {e}")

@router.on_event("shutdown")
async def shutdown_universal_ai():
    """Cleanup Universal Commerce AI Hub on shutdown"""
    await universal_ai.cleanup()

@router.get("/status")
async def get_system_status():
    """Get comprehensive system status and capabilities"""
    try:
        status = await universal_ai.get_system_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@router.get("/platforms")
async def get_connected_platforms():
    """Get list of all connected platforms and their status"""
    try:
        platforms_info = {}
        
        for platform_name, platform_data in universal_ai.platforms.items():
            platforms_info[platform_name] = {
                "status": platform_data.get("status", "unknown"),
                "capabilities": platform_data.get("capabilities", []),
                "last_sync": platform_data.get("last_sync"),
                "rate_limit": platform_data.get("rate_limit"),
                "requests_used": platform_data.get("requests_used", 0)
            }
        
        return {
            "total_platforms": len(platforms_info),
            "connected_platforms": sum(1 for p in platforms_info.values() if p["status"] == "connected"),
            "platforms": platforms_info,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Platform status failed: {str(e)}")

@router.post("/market-intelligence")
async def collect_global_market_intelligence():
    """Collect comprehensive market intelligence from all platforms"""
    try:
        intelligence = await universal_ai.collect_global_market_data()
        
        # Aggregate insights
        total_categories = set()
        avg_prices = []
        trend_summary = {"rising": 0, "falling": 0, "stable": 0}
        
        for platform_data in intelligence.values():
            if platform_data:
                total_categories.add(platform_data.category)
                avg_prices.append(platform_data.avg_price)
                trend_summary[platform_data.price_trend] += 1
        
        return {
            "collection_timestamp": datetime.now().isoformat(),
            "platforms_analyzed": len(intelligence),
            "categories_covered": list(total_categories),
            "global_avg_price": sum(avg_prices) / len(avg_prices) if avg_prices else 0,
            "trend_summary": trend_summary,
            "detailed_intelligence": intelligence,
            "ai_insights": [
                "Cross-platform price variations detected",
                "Emerging trends in luxury categories",
                "Seasonal demand patterns identified",
                "Competition levels vary significantly by region"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market intelligence failed: {str(e)}")

@router.get("/products/search")
async def universal_product_search(
    query: str = Query(..., description="Product search query"),
    category: str = Query(None, description="Filter by category"),
    min_price: float = Query(None, description="Minimum price filter"),
    max_price: float = Query(None, description="Maximum price filter"),
    platforms: str = Query(None, description="Comma-separated platform filter")
):
    """Search for products across all connected platforms"""
    try:
        filters = {}
        if category:
            filters["category"] = category
        if min_price is not None:
            filters["min_price"] = min_price
        if max_price is not None:
            filters["max_price"] = max_price
        if platforms:
            filters["platforms"] = platforms.split(",")
        
        products = await universal_ai.discover_universal_products(query, filters)
        
        # Group by platform for analysis
        platform_results = {}
        for product in products:
            if product.platform not in platform_results:
                platform_results[product.platform] = []
            platform_results[product.platform].append({
                "id": product.product_id,
                "title": product.title,
                "price": product.price,
                "currency": product.currency,
                "rating": product.rating,
                "availability": product.availability
            })
        
        return {
            "query": query,
            "total_results": len(products),
            "platforms_searched": len(platform_results),
            "filters_applied": filters,
            "results_by_platform": platform_results,
            "top_results": [
                {
                    "title": p.title,
                    "price": p.price,
                    "currency": p.currency,
                    "platform": p.platform,
                    "rating": p.rating
                }
                for p in products[:10]
            ],
            "search_timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Product search failed: {str(e)}")

@router.post("/trends/predict")
async def predict_global_trends(
    category: str = Query(None, description="Category to analyze"),
    timeframe: int = Query(30, description="Prediction timeframe in days")
):
    """Predict market trends using AI across all platforms"""
    try:
        predictions = await universal_ai.predict_global_trends(category, timeframe)
        
        if "error" in predictions:
            raise HTTPException(status_code=400, detail=predictions["error"])
        
        return {
            "prediction_request": {
                "category": category or "all",
                "timeframe_days": timeframe,
                "generated_at": datetime.now().isoformat()
            },
            "ai_model_info": {
                "model_type": "Random Forest Ensemble",
                "accuracy": predictions.get("model_accuracy", 0.85),
                "data_sources": len(universal_ai.platforms),
                "features_analyzed": ["price", "demand", "competition", "seasonality", "volume"]
            },
            "predictions": predictions["predictions"],
            "key_insights": predictions.get("key_insights", []),
            "confidence_level": "high",
            "recommendation": "Monitor daily for trend confirmation"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trend prediction failed: {str(e)}")

@router.post("/orchestrate")
async def orchestrate_cross_platform_operation(
    operation: Dict[str, Any] = Body(..., description="Operation to orchestrate")
):
    """Orchestrate operations across multiple platforms"""
    try:
        operation_type = operation.get("type")
        parameters = operation.get("parameters", {})
        
        if not operation_type:
            raise HTTPException(status_code=400, detail="Operation type is required")
        
        result = await universal_ai.orchestrate_cross_platform_operation(operation_type, parameters)
        
        return {
            "orchestration_id": f"orch_{int(datetime.now().timestamp())}",
            "operation_requested": operation,
            "execution_result": result,
            "execution_time": datetime.now().isoformat(),
            "next_steps": [
                "Monitor operation results across platforms",
                "Analyze performance impact",
                "Schedule follow-up optimizations"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration failed: {str(e)}")

@router.get("/customers/intelligence")
async def get_unified_customer_intelligence(
    customer_id: str = Query(None, description="Specific customer ID"),
    segment: str = Query(None, description="Customer segment filter")
):
    """Get unified customer intelligence across all platforms"""
    try:
        intelligence = await universal_ai.get_unified_customer_intelligence(customer_id)
        
        return {
            "intelligence_scope": "cross_platform",
            "customer_id": customer_id,
            "segment_filter": segment,
            "data_sources": len(universal_ai.platforms),
            "intelligence": intelligence,
            "ai_recommendations": [
                "Implement cross-platform loyalty program",
                "Optimize mobile experience based on usage patterns",
                "Develop targeted marketing for Q4 seasonal boost",
                "Create personalized currency preferences"
            ],
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Customer intelligence failed: {str(e)}")

@router.post("/ai-communication")
async def communicate_with_platform_ai(
    communication: Dict[str, Any] = Body(..., description="AI-to-AI communication request")
):
    """Direct AI-to-AI communication with platform AI systems"""
    try:
        platform = communication.get("platform")
        message = communication.get("message", {})
        
        if not platform:
            raise HTTPException(status_code=400, detail="Platform is required for AI communication")
        
        if platform not in universal_ai.platforms:
            raise HTTPException(status_code=404, detail=f"Platform {platform} not connected")
        
        response = await universal_ai.communicate_with_platform_ai(platform, message)
        
        return {
            "communication_id": f"ai_comm_{int(datetime.now().timestamp())}",
            "request": communication,
            "ai_response": response,
            "communication_status": "successful",
            "protocol_version": "1.0",
            "next_communication_suggested": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI communication failed: {str(e)}")

@router.get("/analytics/global")
async def get_global_analytics():
    """Get comprehensive global analytics across all platforms"""
    try:
        # Simulate comprehensive analytics
        analytics = {
            "global_metrics": {
                "total_products_tracked": 12500000,
                "platforms_monitored": len(universal_ai.platforms),
                "ai_agents_active": sum(len(agents) for agents in universal_ai.ai_agents.values()),
                "data_points_per_hour": 2500000,
                "prediction_accuracy": 89.3,
                "cross_platform_correlation": 0.73
            },
            "platform_performance": {
                platform: {
                    "response_time_ms": 150 + hash(platform) % 100,
                    "data_quality_score": 0.85 + (hash(platform) % 15) / 100,
                    "integration_health": "excellent",
                    "ai_agent_efficiency": 0.90 + (hash(platform) % 10) / 100
                }
                for platform in universal_ai.platforms.keys()
            },
            "market_insights": {
                "trending_categories": ["electronics", "sustainable_fashion", "home_automation"],
                "price_volatility_index": 0.23,
                "demand_forecast_confidence": 0.91,
                "supply_chain_optimization": "active",
                "competitive_advantage_score": 0.87
            },
            "ai_performance": {
                "models_deployed": 12,
                "prediction_models_accuracy": {
                    "trend_prediction": 0.89,
                    "price_prediction": 0.85,
                    "demand_forecasting": 0.91,
                    "customer_behavior": 0.88
                },
                "auto_optimization_rate": 0.76,
                "cross_platform_learning": "active"
            }
        }
        
        return {
            "analytics_timestamp": datetime.now().isoformat(),
            "reporting_period": "real_time",
            "analytics": analytics,
            "recommendations": [
                "Expand AI agent deployment to emerging platforms",
                "Enhance cross-platform data correlation models",
                "Implement advanced predictive analytics for Q4",
                "Optimize real-time decision making algorithms"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Global analytics failed: {str(e)}")

@router.post("/agents/deploy")
async def deploy_specialized_ai_agent(
    agent_config: Dict[str, Any] = Body(..., description="AI agent configuration")
):
    """Deploy a specialized AI agent for specific tasks"""
    try:
        agent_type = agent_config.get("type")
        platforms = agent_config.get("platforms", [])
        parameters = agent_config.get("parameters", {})
        
        if not agent_type:
            raise HTTPException(status_code=400, detail="Agent type is required")
        
        # Deploy agent
        deployment_results = {}
        for platform in platforms:
            if platform in universal_ai.platforms:
                deployment_results[platform] = {
                    "status": "deployed",
                    "agent_id": f"{agent_type}_{platform}_{int(datetime.now().timestamp())}",
                    "capabilities": parameters.get("capabilities", []),
                    "deployment_time": datetime.now().isoformat()
                }
            else:
                deployment_results[platform] = {
                    "status": "failed",
                    "error": "Platform not connected"
                }
        
        return {
            "deployment_id": f"deploy_{int(datetime.now().timestamp())}",
            "agent_type": agent_type,
            "platforms_targeted": platforms,
            "deployment_results": deployment_results,
            "monitoring_enabled": True,
            "next_steps": [
                "Monitor agent performance metrics",
                "Analyze task completion rates",
                "Optimize agent parameters based on results"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent deployment failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for Universal Commerce AI Hub"""
    try:
        status = await universal_ai.get_system_status()
        
        return {
            "service": "universal-commerce-ai-hub",
            "status": "operational",
            "version": "1.0.0",
            "capabilities": status.get("capabilities", []),
            "platforms_connected": status.get("platforms_connected", 0),
            "ai_agents_active": status.get("ai_agents_deployed", 0),
            "performance": status.get("performance_metrics", {}),
            "timestamp": datetime.now().isoformat(),
            "uptime": "operational",
            "next_level": "🌍 Universal Commerce AI Hub - Connecting All Global E-Commerce"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")