"""
AisleMarts Backend Server - Enhanced with Shop Integration
"""

from fastapi import FastAPI, HTTPException, Request
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

# NEW: Import Shop Router
from routers.shop_router import router as shop_router

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
    print(f"Unhandled exception: {exc}")
    print(traceback.format_exc())
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

# Include existing routes dynamically
try:
    from routers.uploads_router import router as uploads_router
    app.include_router(uploads_router, prefix="", tags=["uploads"])
    print("✅ Signed upload system loaded successfully")
except ImportError as e:
    print(f"⚠️ Upload system not available: {e}")

try:
    import ai_routes
    if hasattr(ai_routes, 'router'):
        app.include_router(ai_routes.router, prefix="/api", tags=["ai"])
    print("✅ AI routes loaded")
except Exception as e:
    print(f"⚠️ AI routes not available: {e}")

try:
    import search_routes  
    if hasattr(search_routes, 'router'):
        app.include_router(search_routes.router, prefix="/api", tags=["search"])
    print("✅ Search routes loaded")
except Exception as e:
    print(f"⚠️ Search routes not available: {e}")

try:
    import order_management_routes
    if hasattr(order_management_routes, 'router'):
        app.include_router(order_management_routes.router, prefix="/api", tags=["orders"])
    print("✅ Order management routes loaded")
except Exception as e:
    print(f"⚠️ Order management routes not available: {e}")

try:
    import rfq_routes
    if hasattr(rfq_routes, 'router'):
        app.include_router(rfq_routes.router, prefix="/api", tags=["rfq"])
    print("✅ RFQ routes loaded")
except Exception as e:
    print(f"⚠️ RFQ routes not available: {e}")

try:
    from routers.affiliate_router import router as affiliate_router
    app.include_router(affiliate_router, tags=["affiliate"])
    print("✅ Affiliate system loaded successfully")
except ImportError as e:
    print(f"⚠️ Affiliate system not available: {e}")

try:
    from routers.rfq_router import router as rfq_router
    app.include_router(rfq_router, tags=["b2b_rfq"])
    print("✅ B2B RFQ system loaded successfully")
except ImportError as e:
    print(f"⚠️ B2B RFQ system not available: {e}")

# Include AI Ranking System router
try:
    from ranker_mongodb import router as ranker_router
    app.include_router(ranker_router, tags=["ai_ranking"])
    print("✅ AI Ranking System (UCB1) loaded successfully")
except ImportError as e:
    print(f"⚠️ AI Ranking System not available: {e}")

# Include Observability System
try:
    from routers.observability_router import router as observability_router
    app.include_router(observability_router, prefix="", tags=["observability"])
    print("✅ Observability system loaded successfully")
except ImportError as e:
    print(f"⚠️ Observability system not available: {e}")

# Add observability middleware
try:
    from observability.metrics import metrics_middleware
    app.middleware("http")(metrics_middleware)
    print("✅ Observability middleware activated")
except ImportError as e:
    print(f"⚠️ Observability middleware not available: {e}")

# NEW: Include Shop Router - Priority Integration
app.include_router(shop_router, tags=["shop"])
print("🛍️ AisleMarts Shop (TikTok Enhanced) loaded successfully")

@app.on_event("startup")
async def startup_event():
    """Enhanced startup with Shop services and Observability"""
    try:
        print("🛍️💎🚀 AISLEMARTS SHOP ENHANCED BACKEND LIVE")
        print("✅ TikTok Shop Features: Shoppable Video + In-Feed Checkout + Live Shopping")
        print("✅ 0% Commission Model | AI Commerce Ranker | Social Commerce Integration")
        print("🎯 Phase 2 Priority: Scroll → Tap → Buy Experience Ready")
        
        # Initialize observability event system
        try:
            from observability.events import start_event_system
            await start_event_system()
            print("🚀 Event analytics system initialized")
        except ImportError as e:
            print(f"⚠️ Event analytics system not available: {e}")
        
    except Exception as e:
        print(f"⚠️ Startup warning: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Enhanced shutdown with Shop services cleanup and Observability"""
    try:
        # Shutdown observability event system
        try:
            from observability.events import stop_event_system
            await stop_event_system()
            print("🛑 Event analytics system shutdown")
        except ImportError as e:
            print(f"⚠️ Event analytics system not available: {e}")
            
        print("🛍️ AisleMarts Shop Backend shutdown complete")
    except Exception as e:
        print(f"Shutdown error: {e}")

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