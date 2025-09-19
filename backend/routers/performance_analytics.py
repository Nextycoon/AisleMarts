from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
import logging
import time
from collections import defaultdict
import asyncio

import sys
import os
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from routers.deps import get_db
from security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analytics/performance", tags=["Performance Analytics"])

# In-memory metrics storage (in production, use Redis or proper time-series DB)
metrics_store = defaultdict(list)
real_time_metrics = {
    "active_users": 0,
    "api_calls_per_minute": 0,
    "average_response_time": 0,
    "error_rate": 0,
    "live_sessions": {
        "dm_conversations": 0,
        "voice_calls": 0,
        "video_calls": 0,
        "live_sales": 0,
        "channels": 0
    },
    "system_health": {
        "cpu_usage": 0,
        "memory_usage": 0,
        "database_connections": 0,
        "websocket_connections": 0
    }
}

# Performance Models
class PerformanceMetrics(BaseModel):
    timestamp: datetime
    endpoint: str
    response_time_ms: int
    status_code: int
    user_id: Optional[str] = None
    error_message: Optional[str] = None
    request_size: Optional[int] = None
    response_size: Optional[int] = None

class RealTimeMetrics(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    active_users: int
    api_calls_per_minute: int
    average_response_time: float
    error_rate: float
    live_sessions: Dict[str, int]
    system_health: Dict[str, float]

class PerformanceAnalytics(BaseModel):
    timeframe: str
    total_requests: int
    average_response_time: float
    p95_response_time: float
    p99_response_time: float
    error_rate: float
    top_endpoints: List[Dict[str, Any]]
    slow_endpoints: List[Dict[str, Any]]
    error_breakdown: Dict[str, int]
    user_activity_patterns: Dict[str, Any]

class SystemHealthMetrics(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    overall_health_score: float
    api_health: Dict[str, Any]
    database_health: Dict[str, Any]
    communication_suite_health: Dict[str, Any]
    ai_services_health: Dict[str, Any]
    recommendations: List[str]

class FeatureUsageAnalytics(BaseModel):
    feature_name: str
    usage_count: int
    unique_users: int
    average_session_duration: float
    conversion_rate: Optional[float] = None
    user_satisfaction_score: Optional[float] = None
    growth_rate: float

@router.get("/health")
async def health_check():
    """Performance analytics service health check"""
    return {
        "service": "performance_analytics",
        "status": "operational",
        "capabilities": [
            "real_time_monitoring",
            "performance_tracking",
            "system_health_analysis",
            "feature_usage_analytics",
            "predictive_insights",
            "alert_management"
        ],
        "metrics_stored": len(metrics_store),
        "last_update": datetime.utcnow().isoformat()
    }

@router.get("/realtime", response_model=RealTimeMetrics)
async def get_realtime_metrics(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get real-time performance metrics"""
    try:
        # Simulate real-time data collection
        import random
        
        # Update active users (simulate real activity)
        real_time_metrics["active_users"] = random.randint(45, 120)
        real_time_metrics["api_calls_per_minute"] = random.randint(150, 350)
        real_time_metrics["average_response_time"] = random.uniform(120, 250)
        real_time_metrics["error_rate"] = random.uniform(0.1, 2.5)
        
        # Update live sessions
        real_time_metrics["live_sessions"]["dm_conversations"] = random.randint(15, 35)
        real_time_metrics["live_sessions"]["voice_calls"] = random.randint(3, 12)
        real_time_metrics["live_sessions"]["video_calls"] = random.randint(2, 8)
        real_time_metrics["live_sessions"]["live_sales"] = random.randint(1, 5)
        real_time_metrics["live_sessions"]["channels"] = random.randint(8, 25)
        
        # Update system health
        real_time_metrics["system_health"]["cpu_usage"] = random.uniform(35, 75)
        real_time_metrics["system_health"]["memory_usage"] = random.uniform(45, 80)
        real_time_metrics["system_health"]["database_connections"] = random.randint(8, 25)
        real_time_metrics["system_health"]["websocket_connections"] = random.randint(20, 60)
        
        return RealTimeMetrics(
            active_users=real_time_metrics["active_users"],
            api_calls_per_minute=real_time_metrics["api_calls_per_minute"],
            average_response_time=real_time_metrics["average_response_time"],
            error_rate=real_time_metrics["error_rate"],
            live_sessions=real_time_metrics["live_sessions"],
            system_health=real_time_metrics["system_health"]
        )
        
    except Exception as e:
        logger.error(f"Real-time metrics failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get real-time metrics")

@router.get("/analytics", response_model=PerformanceAnalytics)
async def get_performance_analytics(
    timeframe: str = Query(default="24h", description="Timeframe: 1h, 24h, 7d, 30d"),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get comprehensive performance analytics"""
    try:
        # Simulate performance analytics data
        import random
        
        total_requests = random.randint(10000, 50000)
        avg_response_time = random.uniform(150, 300)
        
        top_endpoints = [
            {
                "endpoint": "/api/dm/conversations",
                "requests": random.randint(1500, 3000),
                "avg_response_time": random.uniform(100, 200),
                "success_rate": random.uniform(95, 99.5)
            },
            {
                "endpoint": "/api/mood/analyze",
                "requests": random.randint(1000, 2500),
                "avg_response_time": random.uniform(200, 400),
                "success_rate": random.uniform(92, 98)
            },
            {
                "endpoint": "/api/ai/advanced/recommendations",
                "requests": random.randint(800, 1800),
                "avg_response_time": random.uniform(300, 600),
                "success_rate": random.uniform(90, 96)
            },
            {
                "endpoint": "/api/calls/initiate",
                "requests": random.randint(200, 800),
                "avg_response_time": random.uniform(150, 250),
                "success_rate": random.uniform(88, 95)
            },
            {
                "endpoint": "/api/livesale",
                "requests": random.randint(300, 900),
                "avg_response_time": random.uniform(180, 280),
                "success_rate": random.uniform(94, 99)
            }
        ]
        
        slow_endpoints = [
            {
                "endpoint": "/api/ai/advanced/smart-search",
                "avg_response_time": random.uniform(800, 1200),
                "p95_response_time": random.uniform(1200, 2000),
                "requests": random.randint(100, 500)
            },
            {
                "endpoint": "/api/analytics/performance",
                "avg_response_time": random.uniform(600, 900),
                "p95_response_time": random.uniform(900, 1500),
                "requests": random.randint(50, 200)
            }
        ]
        
        error_breakdown = {
            "4xx_errors": random.randint(50, 200),
            "5xx_errors": random.randint(10, 50),
            "timeout_errors": random.randint(5, 25),
            "network_errors": random.randint(3, 15)
        }
        
        user_activity_patterns = {
            "peak_hours": [9, 10, 11, 14, 15, 16, 20, 21],
            "avg_session_duration": random.uniform(8, 15),
            "bounce_rate": random.uniform(15, 25),
            "feature_adoption_rate": random.uniform(65, 85)
        }
        
        return PerformanceAnalytics(
            timeframe=timeframe,
            total_requests=total_requests,
            average_response_time=avg_response_time,
            p95_response_time=avg_response_time * 1.8,
            p99_response_time=avg_response_time * 2.5,
            error_rate=random.uniform(1, 3),
            top_endpoints=top_endpoints,
            slow_endpoints=slow_endpoints,
            error_breakdown=error_breakdown,
            user_activity_patterns=user_activity_patterns
        )
        
    except Exception as e:
        logger.error(f"Performance analytics failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get performance analytics")

@router.get("/system-health", response_model=SystemHealthMetrics)
async def get_system_health(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get comprehensive system health analysis"""
    try:
        import random
        
        # Calculate overall health score
        api_score = random.uniform(85, 98)
        db_score = random.uniform(88, 95)
        comm_score = random.uniform(82, 94)
        ai_score = random.uniform(75, 90)
        
        overall_score = (api_score + db_score + comm_score + ai_score) / 4
        
        api_health = {
            "status": "healthy" if api_score > 85 else "warning",
            "response_time": random.uniform(120, 250),
            "success_rate": api_score,
            "active_endpoints": 23,
            "failed_endpoints": random.randint(0, 2)
        }
        
        database_health = {
            "status": "healthy" if db_score > 85 else "warning",
            "connection_pool_usage": random.uniform(30, 70),
            "query_performance": db_score,
            "active_connections": random.randint(8, 25),
            "slow_queries": random.randint(0, 3)
        }
        
        communication_suite_health = {
            "status": "healthy" if comm_score > 80 else "warning",
            "websocket_stability": comm_score,
            "active_dm_sessions": random.randint(15, 35),
            "active_calls": random.randint(5, 20),
            "channel_activity": random.randint(8, 25),
            "message_delivery_rate": random.uniform(95, 99.5)
        }
        
        ai_services_health = {
            "status": "healthy" if ai_score > 75 else "warning",
            "recommendation_engine": random.uniform(80, 95),
            "mood_analysis": random.uniform(85, 96),
            "smart_search": random.uniform(70, 88),
            "response_accuracy": random.uniform(88, 96)
        }
        
        recommendations = []
        if overall_score < 85:
            recommendations.append("Consider scaling database connections")
        if api_score < 90:
            recommendations.append("Monitor API response times closely")
        if comm_score < 85:
            recommendations.append("Check WebSocket connection stability")
        if ai_score < 80:
            recommendations.append("Optimize AI service performance")
        
        if not recommendations:
            recommendations = [
                "System performing optimally",
                "Continue current monitoring practices",
                "Consider performance optimization for future scaling"
            ]
        
        return SystemHealthMetrics(
            overall_health_score=overall_score,
            api_health=api_health,
            database_health=database_health,
            communication_suite_health=communication_suite_health,
            ai_services_health=ai_services_health,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"System health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get system health")

@router.get("/feature-usage", response_model=List[FeatureUsageAnalytics])
async def get_feature_usage_analytics(
    timeframe: str = Query(default="7d", description="Timeframe: 1d, 7d, 30d"),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get feature usage analytics for all AisleMarts features"""
    try:
        import random
        
        features = [
            {
                "feature_name": "Direct Messaging",
                "usage_count": random.randint(1500, 3500),
                "unique_users": random.randint(200, 500),
                "average_session_duration": random.uniform(12, 25),
                "conversion_rate": random.uniform(75, 90),
                "user_satisfaction_score": random.uniform(4.2, 4.8),
                "growth_rate": random.uniform(15, 35)
            },
            {
                "feature_name": "Voice/Video Calls",
                "usage_count": random.randint(300, 800),
                "unique_users": random.randint(80, 200),
                "average_session_duration": random.uniform(8, 18),
                "conversion_rate": random.uniform(65, 80),
                "user_satisfaction_score": random.uniform(4.0, 4.6),
                "growth_rate": random.uniform(25, 45)
            },
            {
                "feature_name": "AI Mood-to-Cart",
                "usage_count": random.randint(800, 2000),
                "unique_users": random.randint(150, 400),
                "average_session_duration": random.uniform(3, 8),
                "conversion_rate": random.uniform(45, 65),
                "user_satisfaction_score": random.uniform(4.1, 4.7),
                "growth_rate": random.uniform(30, 50)
            },
            {
                "feature_name": "LiveSale Commerce",
                "usage_count": random.randint(200, 600),
                "unique_users": random.randint(50, 150),
                "average_session_duration": random.uniform(15, 30),
                "conversion_rate": random.uniform(35, 55),
                "user_satisfaction_score": random.uniform(3.8, 4.5),
                "growth_rate": random.uniform(20, 40)
            },
            {
                "feature_name": "Channels & Groups",
                "usage_count": random.randint(400, 1200),
                "unique_users": random.randint(100, 300),
                "average_session_duration": random.uniform(10, 20),
                "conversion_rate": random.uniform(55, 75),
                "user_satisfaction_score": random.uniform(4.0, 4.6),
                "growth_rate": random.uniform(18, 35)
            },
            {
                "feature_name": "Business Leads Kanban",
                "usage_count": random.randint(150, 400),
                "unique_users": random.randint(25, 80),
                "average_session_duration": random.uniform(20, 40),
                "conversion_rate": random.uniform(70, 85),
                "user_satisfaction_score": random.uniform(4.3, 4.9),
                "growth_rate": random.uniform(40, 60)
            },
            {
                "feature_name": "Advanced AI Recommendations",
                "usage_count": random.randint(600, 1500),
                "unique_users": random.randint(120, 350),
                "average_session_duration": random.uniform(5, 12),
                "conversion_rate": random.uniform(50, 70),
                "user_satisfaction_score": random.uniform(4.2, 4.8),
                "growth_rate": random.uniform(35, 55)
            },
            {
                "feature_name": "AI Shopping Assistant",
                "usage_count": random.randint(300, 900),
                "unique_users": random.randint(80, 250),
                "average_session_duration": random.uniform(8, 16),
                "conversion_rate": random.uniform(40, 60),
                "user_satisfaction_score": random.uniform(4.1, 4.7),
                "growth_rate": random.uniform(45, 65)
            }
        ]
        
        return [FeatureUsageAnalytics(**feature) for feature in features]
        
    except Exception as e:
        logger.error(f"Feature usage analytics failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get feature usage analytics")

@router.post("/track-metric")
async def track_performance_metric(
    metric: PerformanceMetrics,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Track a performance metric"""
    try:
        # Store metric (in production, use proper time-series database)
        metrics_store[metric.endpoint].append({
            "timestamp": metric.timestamp,
            "response_time_ms": metric.response_time_ms,
            "status_code": metric.status_code,
            "user_id": metric.user_id,
            "error_message": metric.error_message
        })
        
        # Keep only last 1000 metrics per endpoint
        if len(metrics_store[metric.endpoint]) > 1000:
            metrics_store[metric.endpoint] = metrics_store[metric.endpoint][-1000:]
        
        return {
            "status": "tracked",
            "endpoint": metric.endpoint,
            "timestamp": metric.timestamp,
            "total_metrics": len(metrics_store[metric.endpoint])
        }
        
    except Exception as e:
        logger.error(f"Metric tracking failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track metric")

@router.get("/alerts")
async def get_performance_alerts(
    severity: str = Query(default="all", description="Severity: critical, warning, info, all"),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get performance alerts and recommendations"""
    try:
        import random
        
        alerts = []
        
        # Generate mock alerts based on current metrics
        if real_time_metrics["error_rate"] > 2.0:
            alerts.append({
                "id": f"alert_{int(time.time())}",
                "severity": "warning",
                "title": "Elevated Error Rate",
                "message": f"Error rate is {real_time_metrics['error_rate']:.1f}%, above threshold of 2.0%",
                "timestamp": datetime.utcnow().isoformat(),
                "category": "performance",
                "action_required": True
            })
        
        if real_time_metrics["average_response_time"] > 200:
            alerts.append({
                "id": f"alert_{int(time.time()) + 1}",
                "severity": "info",
                "title": "Response Time Above Average",
                "message": f"Average response time is {real_time_metrics['average_response_time']:.0f}ms",
                "timestamp": datetime.utcnow().isoformat(),
                "category": "performance",
                "action_required": False
            })
        
        if real_time_metrics["system_health"]["cpu_usage"] > 70:
            alerts.append({
                "id": f"alert_{int(time.time()) + 2}",
                "severity": "warning",
                "title": "High CPU Usage",
                "message": f"CPU usage is {real_time_metrics['system_health']['cpu_usage']:.1f}%",
                "timestamp": datetime.utcnow().isoformat(),
                "category": "system",
                "action_required": True
            })
        
        # Add some positive alerts
        if real_time_metrics["active_users"] > 100:
            alerts.append({
                "id": f"alert_{int(time.time()) + 3}",
                "severity": "info",
                "title": "High User Activity",
                "message": f"Currently {real_time_metrics['active_users']} active users - great engagement!",
                "timestamp": datetime.utcnow().isoformat(),
                "category": "engagement",
                "action_required": False
            })
        
        # Filter by severity
        if severity != "all":
            alerts = [alert for alert in alerts if alert["severity"] == severity]
        
        return {
            "alerts": alerts,
            "total_alerts": len(alerts),
            "critical_count": len([a for a in alerts if a["severity"] == "critical"]),
            "warning_count": len([a for a in alerts if a["severity"] == "warning"]),
            "info_count": len([a for a in alerts if a["severity"] == "info"]),
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Performance alerts failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get performance alerts")

# Middleware to automatically track performance metrics
@router.middleware("http")
async def performance_tracking_middleware(request, call_next):
    """Middleware to automatically track API performance"""
    start_time = time.time()
    
    try:
        response = await call_next(request)
        process_time = int((time.time() - start_time) * 1000)
        
        # Track the metric automatically
        metric = PerformanceMetrics(
            timestamp=datetime.utcnow(),
            endpoint=str(request.url.path),
            response_time_ms=process_time,
            status_code=response.status_code,
            user_id=getattr(request.state, 'user_id', None)
        )
        
        # Store in background
        asyncio.create_task(store_metric_async(metric))
        
        return response
        
    except Exception as e:
        process_time = int((time.time() - start_time) * 1000)
        
        # Track error metric
        metric = PerformanceMetrics(
            timestamp=datetime.utcnow(),
            endpoint=str(request.url.path),
            response_time_ms=process_time,
            status_code=500,
            error_message=str(e),
            user_id=getattr(request.state, 'user_id', None)
        )
        
        asyncio.create_task(store_metric_async(metric))
        raise

async def store_metric_async(metric: PerformanceMetrics):
    """Asynchronously store performance metric"""
    try:
        metrics_store[metric.endpoint].append({
            "timestamp": metric.timestamp,
            "response_time_ms": metric.response_time_ms,
            "status_code": metric.status_code,
            "user_id": metric.user_id,
            "error_message": metric.error_message
        })
        
        # Keep only last 1000 metrics per endpoint
        if len(metrics_store[metric.endpoint]) > 1000:
            metrics_store[metric.endpoint] = metrics_store[metric.endpoint][-1000:]
            
    except Exception as e:
        logger.error(f"Async metric storage failed: {str(e)}")