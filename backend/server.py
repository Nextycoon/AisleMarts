"""
AisleMarts Backend Server - Enhanced with Shop Integration
"""

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
from datetime import datetime
import traceback
import time

# Load environment variables
load_dotenv()

# Import all existing routers
from routers.commerce_router import router as commerce_router
from routers.authentication_router import router as authentication_router
from routers.user_profile_router import router as user_profile_router
from routers.clp_engine_router import router as clp_engine_router
from routers.currency_router import router as currency_router
from routers.ai_super_agent_router import router as ai_super_agent_router
from routers.advanced_ai_router import router as advanced_ai_router
from routers.social_media_advertising_router import router as social_media_advertising_router
from routers.community_hub_router import router as community_hub_router
from routers.live_streaming_commerce_router import router as live_streaming_commerce_router
from routers.social_commerce_hub_router import router as social_commerce_hub_router
from routers.aislemarts_matrix_dashboard_router import router as aislemarts_matrix_dashboard_router
from routers.ai_analytics_dashboard_router import router as ai_analytics_dashboard_router
from routers.infinite_discovery_feed_router import router as infinite_discovery_feed_router
from routers.spin_wheel_router import router as spin_wheel_router
from routers.daily_challenges_router import router as daily_challenges_router
from routers.user_reviews_router import router as user_reviews_router
from routers.loyalty_dashboard_router import router as loyalty_dashboard_router
from routers.global_monetization_router import router as global_monetization_router
from routers.super_app_dashboard_router import router as super_app_dashboard_router
from routers.enhanced_features_router import router as enhanced_features_router
from routers.business_tools_routes import router as business_tools_router
from routers.operational_systems_router import router as operational_systems_router
from routers.international_expansion_routes import router as international_expansion_router
from routers.rewards_system_router import router as rewards_system_router
from routers.ai_personalization_router import router as ai_personalization_router
from routers.performance_optimization_router import router as performance_optimization_router
from routers.e2ee_router import router as e2ee_router
from routers.kms_router import router as kms_router
from routers.pickup_windows_router import router as pickup_windows_router

# NEW: Import Shop Router
from routers.shop_router import router as shop_router

# Import services
from services.universal_commerce_ai import UniversalCommerceAI
from services.production_monitoring import ProductionMonitoring
from services.nearby_cache import NearbyCache
from services.setup_logger import setup_logger

# Setup logging
logger = setup_logger(__name__)

app = FastAPI(
    title="AisleMarts API - Enhanced with TikTok Shop Features",
    description="0% Commission Global Commerce Platform with Social Shopping",
    version="2.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "path": str(request.url)}
    )

# Health check
@app.get("/api/health")
async def health_check():
    """Comprehensive health check including new Shop features"""
    return {
        "status": "healthy",
        "service": "AisleMarts API Server",
        "version": "2.1.0",
        "features": {
            "shop": "✅ Shop MVP with TikTok-style features",
            "shoppable_video": "✅ In-feed checkout enabled",
            "live_shopping": "✅ Live product pinning",
            "commerce": "✅ 0% Commission model",
            "ai_ranker": "✅ AI Commerce Ranker",
            "social": "✅ Social commerce integration"
        },
        "timestamp": datetime.now().isoformat(),
        "uptime_seconds": time.time()
    }

# Include all existing routers
app.include_router(commerce_router, prefix="/api", tags=["commerce"])
app.include_router(authentication_router, prefix="/api", tags=["auth"])
app.include_router(user_profile_router, prefix="/api", tags=["user"])
app.include_router(clp_engine_router, prefix="/api", tags=["clp"])
app.include_router(currency_router, prefix="/api", tags=["currency"])
app.include_router(ai_super_agent_router, prefix="/api", tags=["ai"])
app.include_router(advanced_ai_router, prefix="/api", tags=["ai"])
app.include_router(social_media_advertising_router, prefix="/api", tags=["social"])
app.include_router(community_hub_router, prefix="/api", tags=["community"])
app.include_router(live_streaming_commerce_router, prefix="/api", tags=["live"])
app.include_router(social_commerce_hub_router, prefix="/api", tags=["social"])
app.include_router(aislemarts_matrix_dashboard_router, prefix="/api", tags=["dashboard"])
app.include_router(ai_analytics_dashboard_router, prefix="/api", tags=["analytics"])
app.include_router(infinite_discovery_feed_router, prefix="/api", tags=["discovery"])
app.include_router(spin_wheel_router, prefix="/api", tags=["gamification"])
app.include_router(daily_challenges_router, prefix="/api", tags=["gamification"])
app.include_router(user_reviews_router, prefix="/api", tags=["reviews"])
app.include_router(loyalty_dashboard_router, prefix="/api", tags=["loyalty"])
app.include_router(global_monetization_router, prefix="/api", tags=["monetization"])
app.include_router(super_app_dashboard_router, prefix="/api", tags=["dashboard"])
app.include_router(enhanced_features_router, prefix="/api", tags=["features"])
app.include_router(business_tools_router, prefix="/api", tags=["business"])
app.include_router(operational_systems_router, prefix="/api", tags=["operations"])
app.include_router(international_expansion_router, prefix="/api", tags=["international"])
app.include_router(rewards_system_router, prefix="/api", tags=["rewards"])
app.include_router(ai_personalization_router, prefix="/api", tags=["ai"])
app.include_router(performance_optimization_router, prefix="/api", tags=["performance"])
app.include_router(e2ee_router, prefix="/api", tags=["security"])
app.include_router(kms_router, prefix="/api", tags=["security"])
app.include_router(pickup_windows_router, prefix="/api", tags=["logistics"])

# Include AI Ranking System router
try:
    from ranker_mongodb import router as ranker_router
    app.include_router(ranker_router, tags=["ai_ranking"])
    print("✅ AI Ranking System (UCB1) loaded successfully")
except ImportError as e:
    print(f"⚠️ AI Ranking System not available: {e}")

# NEW: Include Shop Router - Priority Integration
app.include_router(shop_router, prefix="/api", tags=["shop"])
print("🛍️ AisleMarts Shop (TikTok Enhanced) loaded successfully")

# Global services initialization
universal_ai = None
monitoring = None
nearby_cache = None

@app.on_event("startup")
async def startup_event():
    """Enhanced startup with Shop services"""
    global universal_ai, monitoring, nearby_cache
    
    try:
        # Initialize Universal Commerce AI
        universal_ai = UniversalCommerceAI()
        await universal_ai.initialize()
        
        # Initialize production monitoring
        monitoring = ProductionMonitoring()
        await monitoring.initialize()
        
        # Initialize nearby cache
        nearby_cache = NearbyCache()
        await nearby_cache.initialize()
        
        print("🛍️💎🚀 AISLEMARTS SHOP ENHANCED BACKEND LIVE")
        print("✅ TikTok Shop Features: Shoppable Video + In-Feed Checkout + Live Shopping")
        print("✅ 0% Commission Model | AI Commerce Ranker | Social Commerce Integration")
        print("🎯 Phase 2 Priority: Scroll → Tap → Buy Experience Ready")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
        print(f"⚠️ Startup warning: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Enhanced shutdown with Shop services cleanup"""
    global universal_ai, monitoring, nearby_cache
    
    try:
        if universal_ai:
            await universal_ai.cleanup()
        if monitoring:
            await monitoring.cleanup()
        if nearby_cache:
            await nearby_cache.cleanup()
            
        print("🛍️ AisleMarts Shop Backend shutdown complete")
        
    except Exception as e:
        logger.error(f"Shutdown error: {e}")

# Root endpoint
@app.get("/")
async def root():
    """Enhanced root endpoint showcasing Shop integration"""
    return {
        "message": "🛍️ AisleMarts Shop API - TikTok Enhanced",
        "version": "2.1.0",
        "features": {
            "shoppable_videos": "Scroll → Tap → Buy in ForYou feed",
            "live_shopping": "Real-time product pinning in streams", 
            "zero_commission": "0% seller fees + creator monetization",
            "ai_commerce": "AI-powered product ranking and discovery",
            "social_integration": "Native shop integration with social features"
        },
        "api_docs": "/api/docs",
        "shop_health": "/api/shop/health",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)