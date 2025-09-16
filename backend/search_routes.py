"""
Enhanced Search API Routes
RESTful endpoints for Universal AI Commerce Engine Phase 1
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
import asyncio
from datetime import datetime

from db import db
from search_service import SearchService, create_search_indexes, seed_sample_data
from search_cache import get_search_cache
from search_models import (
    SearchResponse, OffersResponse, SearchModes, SearchLanguages
)

# Create router with /api/v1 prefix for new enhanced search endpoints
router = APIRouter(prefix="/api/v1", tags=["Enhanced Search"])

# Initialize search service
search_service = None

async def get_search_service() -> SearchService:
    """Dependency to get search service instance"""
    global search_service
    if not search_service:
        search_service = SearchService(db())
    return search_service


@router.get("/search/health")
async def search_health():
    """Health check for enhanced search system"""  
    try:
        # Check database connection
        db_status = await db().products.count_documents({"active": True})
        
        # Check cache status
        cache = get_search_cache()
        cache_stats = await cache.get_cache_stats() if cache else {"redis_connected": False}
        
        # Check collections
        merchants_count = await db().merchants.count_documents({})
        offers_count = await db().offers.count_documents({})
        locations_count = await db().locations.count_documents({})
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": {
                "products": db_status,
                "merchants": merchants_count,
                "offers": offers_count,
                "locations": locations_count
            },
            "cache": cache_stats,
            "features": {
                "multilingual_search": True,
                "best_pick_scoring": True,
                "offer_deduplication": True,
                "redis_caching": cache_stats.get("redis_connected", False)
            },
            "supported_languages": SearchLanguages.ALL,
            "supported_modes": [SearchModes.RETAIL, SearchModes.B2B, SearchModes.ALL]
        }
    except Exception as e:
        raise HTTPException(500, f"Search system health check failed: {str(e)}")


@router.get("/search", response_model=SearchResponse)
async def enhanced_search(
    q: str = Query(..., description="Search query"),
    mode: str = Query(SearchModes.ALL, description="Search mode: retail, b2b, or all"),
    lang: str = Query(SearchLanguages.ENGLISH, description="Search language"),
    lat: Optional[float] = Query(None, description="Latitude for geo-filtering"),
    lon: Optional[float] = Query(None, description="Longitude for geo-filtering"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(24, ge=1, le=100, description="Results per page"),
    image: Optional[str] = Query(None, description="Base64 image for visual search"),
    barcode: Optional[str] = Query(None, description="Barcode/GTIN for exact search"),
    search_service: SearchService = Depends(get_search_service)
):
    """
    Enhanced product search with multilingual support, Best Pick scoring, and deduplication
    
    **Features:**
    - Multilingual search (EN, SW, AR, TR, FR)
    - Mode filtering (retail, wholesale/B2B, all)
    - Best Pick algorithm with transparent scoring
    - Offer deduplication by GTIN/brand/title
    - Geo-spatial filtering (lat/lon)
    - Image and barcode search hooks
    - Redis caching for performance
    
    **Best Pick Scoring:**
    - Price: 35% weight (lower is better)
    - Delivery ETA: 20% weight (faster is better)  
    - Merchant Trust: 25% weight (higher is better)
    - Cultural Fit: 15% weight (locale matching)
    - Stock Availability: 5% weight (in-stock preferred)
    """
    try:
        # Validate parameters
        if mode not in [SearchModes.RETAIL, SearchModes.B2B, SearchModes.ALL]:
            raise HTTPException(400, f"Invalid mode. Must be one of: {SearchModes.RETAIL}, {SearchModes.B2B}, {SearchModes.ALL}")
        
        if lang not in SearchLanguages.ALL:
            raise HTTPException(400, f"Invalid language. Supported: {', '.join(SearchLanguages.ALL)}")
        
        if len(q.strip()) == 0:
            raise HTTPException(400, "Search query cannot be empty")
        
        # Check cache first
        cache = get_search_cache()
        if cache:
            cached_result = await cache.get_search_results(
                query=q, mode=mode, lang=lang, lat=lat, lon=lon, page=page, limit=limit
            )
            if cached_result and not cached_result.model_dump().get("_prewarmed"):
                return cached_result
        
        # Execute search
        search_response = await search_service.search_products(
            query=q,
            mode=mode,
            lang=lang,
            lat=lat,
            lon=lon,
            page=page,
            limit=limit,
            image=image,
            barcode=barcode
        )
        
        # Cache result
        if cache and search_response.results:
            await cache.set_search_results(
                search_response, q, mode, lang, lat, lon, page, limit
            )
        
        return search_response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Search failed: {str(e)}")


@router.get("/products/{product_id}/offers", response_model=OffersResponse)
async def get_product_offers(
    product_id: str,
    search_service: SearchService = Depends(get_search_service)
):
    """
    Get all offers for a specific product with comparison data
    
    **Features:**
    - All merchant offers for the product
    - Sorted by total landed cost (price + delivery)
    - Merchant trust indicators
    - Stock levels and delivery ETAs
    - Deduplication cluster information
    """
    try:
        # Check cache first
        cache = get_search_cache()
        if cache:
            cached_offers = await cache.get_product_offers(product_id)
            if cached_offers:
                return cached_offers
        
        # Get offers from service
        offers_response = await search_service.get_product_offers(product_id)
        
        if offers_response.total_offers == 0:
            # Check if product exists
            product = await db().products.find_one({"_id": product_id, "active": True})
            if not product:
                raise HTTPException(404, "Product not found")
            
            # Product exists but no offers
            return offers_response
        
        # Cache result
        if cache:
            await cache.set_product_offers(offers_response)
        
        return offers_response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to get product offers: {str(e)}")


@router.get("/search/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=2, description="Partial search query"),
    lang: str = Query(SearchLanguages.ENGLISH, description="Language for suggestions"),
    limit: int = Query(5, ge=1, le=10, description="Number of suggestions")
):
    """
    Get search query suggestions and auto-complete
    """
    try:
        if lang not in SearchLanguages.ALL:
            raise HTTPException(400, f"Invalid language. Supported: {', '.join(SearchLanguages.ALL)}")
        
        # Simple implementation using product titles and brands
        pipeline = [
            {
                "$match": {
                    "active": True,
                    "$or": [
                        {"title": {"$regex": q, "$options": "i"}},
                        {"brand": {"$regex": q, "$options": "i"}},
                        {"description": {"$regex": q, "$options": "i"}}
                    ]
                }
            },
            {
                "$group": {
                    "_id": None,
                    "titles": {"$addToSet": "$title"},
                    "brands": {"$addToSet": "$brand"}
                }
            }
        ]
        
        cursor = db().products.aggregate(pipeline)
        result = await cursor.to_list(length=1)
        
        suggestions = []
        if result:
            data = result[0]
            # Add matching titles
            for title in data.get("titles", [])[:limit//2]:
                if title and q.lower() in title.lower():
                    suggestions.append({
                        "text": title,
                        "type": "product",
                        "highlight": q
                    })
            
            # Add matching brands
            for brand in data.get("brands", [])[:limit//2]:
                if brand and q.lower() in brand.lower():
                    suggestions.append({
                        "text": brand,
                        "type": "brand", 
                        "highlight": q
                    })
        
        return {
            "query": q,
            "suggestions": suggestions[:limit],
            "language": lang
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to get suggestions: {str(e)}")


@router.post("/search/initialize")
async def initialize_search_system():
    """
    Initialize enhanced search system (indexes, sample data)
    For development and testing purposes
    """
    try:
        database = db()
        
        # Create indexes
        print("🔄 Creating search indexes...")
        await create_search_indexes(database)
        
        # Seed sample data  
        print("🔄 Seeding sample data...")
        await seed_sample_data(database)
        
        # Initialize cache
        cache = get_search_cache()
        if cache:
            await cache.clear_all_cache()
            print("🔄 Cache cleared")
        
        return {
            "status": "success",
            "message": "Enhanced search system initialized successfully",
            "timestamp": datetime.utcnow().isoformat(),
            "actions": [
                "Created MongoDB indexes for products, merchants, offers, locations",
                "Seeded sample merchants and offers data",
                "Cleared Redis cache"
            ]
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to initialize search system: {str(e)}")


@router.get("/search/analytics")
async def get_search_analytics():
    """
    Get search system analytics and performance metrics
    """
    try:
        # Cache statistics
        cache = get_search_cache()
        cache_stats = await cache.get_cache_stats() if cache else {}
        
        # Database statistics
        db_stats = {
            "products": await db().products.count_documents({"active": True}),
            "total_products": await db().products.count_documents({}),
            "merchants": await db().merchants.count_documents({}),
            "offers": await db().offers.count_documents({}),
            "locations": await db().locations.count_documents({})
        }
        
        # Index statistics (simplified)
        index_stats = {
            "products_indexes": len(await db().products.list_indexes().to_list(length=None)),
            "merchants_indexes": len(await db().merchants.list_indexes().to_list(length=None)),
            "offers_indexes": len(await db().offers.list_indexes().to_list(length=None))
        }
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "cache": cache_stats,
            "database": db_stats,
            "indexes": index_stats,
            "system_health": "operational"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to get analytics: {str(e)}")


@router.delete("/search/cache")
async def clear_search_cache():
    """
    Clear all search-related cache entries
    For development and debugging
    """
    try:
        cache = get_search_cache()
        if not cache:
            return {"status": "no_cache", "message": "Redis cache not available"}
        
        success = await cache.clear_all_cache()
        
        if success:
            return {
                "status": "success",
                "message": "Search cache cleared successfully",
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "status": "error",
                "message": "Failed to clear cache"
            }
            
    except Exception as e:
        raise HTTPException(500, f"Failed to clear cache: {str(e)}")


@router.post("/search/warm-cache")
async def warm_search_cache(
    popular_queries: List[dict] = [
        {"query": "smartphone", "mode": "retail", "lang": "en"},
        {"query": "laptop", "mode": "retail", "lang": "en"},
        {"query": "simu", "mode": "retail", "lang": "sw"},
        {"query": "headphones", "mode": "all", "lang": "en"}
    ]
):
    """
    Pre-warm cache with popular search queries
    """
    try:
        cache = get_search_cache()
        if not cache:
            return {"status": "no_cache", "message": "Redis cache not available"}
        
        warmed_count = await cache.warm_popular_searches(popular_queries)
        
        return {
            "status": "success",
            "message": f"Pre-warmed {warmed_count} search queries",
            "queries": popular_queries,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to warm cache: {str(e)}")


# ============= BACKGROUND TASKS =============

@router.on_event("startup")
async def startup_search_system():
    """Initialize search system on startup""" 
    try:
        # Initialize search service
        global search_service
        search_service = SearchService(db())
        
        print("✅ Enhanced search system startup complete")
        
    except Exception as e:
        print(f"⚠️ Search system startup error: {e}")


@router.on_event("shutdown") 
async def shutdown_search_system():
    """Cleanup search system on shutdown"""
    try:
        # Close cache connections
        cache = get_search_cache()
        if cache:
            await cache.disconnect()
        
        print("✅ Enhanced search system shutdown complete")
        
    except Exception as e:
        print(f"⚠️ Search system shutdown error: {e}")


# Include this router in main server.py:
# from search_routes import router as search_router
# app.include_router(search_router)