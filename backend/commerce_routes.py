"""
Commerce Routes - Federated Search Integration
Adds federated search endpoints to the main FastAPI app
"""

from fastapi import APIRouter, Query, HTTPException
from federated_search import federated_search_endpoint, search_health_check, SearchResponse
from typing import Optional

# Create router for commerce endpoints
commerce_router = APIRouter(prefix="/api/commerce", tags=["commerce"])

@commerce_router.get("/search", response_model=SearchResponse)
async def search_all_platforms(
    q: str = Query(..., description="Search query", example="nike shoes under 5000"),
    user_type: str = Query("shopper", description="User type: shopper, vendor, business"),
    limit: int = Query(20, description="Number of results", ge=1, le=100),
    offset: int = Query(0, description="Pagination offset", ge=0),
    region: str = Query("KE", description="Country code (ISO 2-letter)"),
    currency: str = Query("KES", description="Currency code (ISO 3-letter)"),
    sort_by: str = Query("relevance", description="Sort by: relevance, price_asc, price_desc, rating"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    brand: Optional[str] = Query(None, description="Filter by brand")
):
    """
    🔍 **Federated Search Across All E-Commerce Platforms**
    
    Search products from Amazon, Jumia, eBay, Shopify stores, and more platforms simultaneously.
    Results are AI-normalized, deduplicated, and ranked for relevance.
    
    **Features:**
    - **Universal Search**: Products from all major platforms
    - **AI-Powered**: Intelligent query understanding and ranking
    - **User-Aware**: Results optimized for shopper/vendor/business needs
    - **Real-Time**: Live inventory and pricing data
    - **Localized**: Supports regional preferences and currencies
    """
    
    try:
        # Call the federated search engine
        response = await federated_search_endpoint(
            q=q,
            user_type=user_type,
            limit=limit,
            offset=offset,
            region=region,
            currency=currency
        )
        
        # Add metadata for API response
        response_dict = response.dict()
        response_dict["api_version"] = "2.0"
        response_dict["powered_by"] = "AisleMarts AI-Commerce"
        
        return response_dict
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail={
                "error": "Federated search failed",
                "message": str(e),
                "suggestion": "Try a simpler query or check your network connection"
            }
        )

@commerce_router.get("/search/health")
async def search_system_health():
    """
    🏥 **Search System Health Check**
    
    Returns the status of all platform connectors and search engine health.
    """
    try:
        health_data = await search_health_check()
        return {
            **health_data,
            "api_version": "2.0",
            "documentation": "/docs#/commerce/search_all_platforms_api_commerce_search_get"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}")

@commerce_router.get("/search/platforms")
async def get_supported_platforms():
    """
    🌐 **Supported E-Commerce Platforms**
    
    Returns a list of all integrated e-commerce platforms and their capabilities.
    """
    return {
        "platforms": [
            {
                "name": "Amazon",
                "code": "amazon",
                "regions": ["US", "UK", "CA", "DE", "FR", "IT", "ES", "JP", "AU"],
                "categories": ["electronics", "fashion", "home", "books", "sports"],
                "features": ["prime_shipping", "reviews", "ratings", "bulk_pricing"]
            },
            {
                "name": "Jumia",
                "code": "jumia",
                "regions": ["KE", "NG", "EG", "MA", "GH", "CI", "UG", "TN"],
                "categories": ["electronics", "fashion", "home", "beauty", "automotive"],
                "features": ["local_delivery", "cash_on_delivery", "jumia_pay"]
            },
            {
                "name": "eBay",
                "code": "ebay",
                "regions": ["US", "UK", "DE", "AU", "CA", "FR", "IT", "ES"],
                "categories": ["electronics", "collectibles", "automotive", "fashion", "home"],
                "features": ["auctions", "buy_it_now", "global_shipping", "seller_ratings"]
            },
            {
                "name": "Shopify Stores",
                "code": "shopify",
                "regions": ["global"],
                "categories": ["fashion", "home", "beauty", "food", "crafts"],
                "features": ["independent_sellers", "custom_products", "direct_to_consumer"]
            }
        ],
        "total_platforms": 4,
        "expanding_to": ["AliExpress", "Flipkart", "Mercado Libre", "Noon", "Takealot"],
        "last_updated": "2025-06-17"
    }

@commerce_router.get("/search/categories")
async def get_product_categories():
    """
    📂 **Product Categories**
    
    Returns all supported product categories across platforms.
    """
    return {
        "categories": [
            {
                "name": "Electronics",
                "code": "electronics",
                "subcategories": ["smartphones", "laptops", "tablets", "audio", "gaming"],
                "platforms": ["amazon", "jumia", "ebay"]
            },
            {
                "name": "Fashion",
                "code": "fashion", 
                "subcategories": ["clothing", "shoes", "accessories", "bags", "jewelry"],
                "platforms": ["amazon", "jumia", "ebay", "shopify"]
            },
            {
                "name": "Home & Garden",
                "code": "home",
                "subcategories": ["furniture", "decor", "kitchen", "garden", "appliances"],
                "platforms": ["amazon", "jumia", "shopify"]
            },
            {
                "name": "Sports & Outdoors",
                "code": "sports",
                "subcategories": ["fitness", "outdoor_gear", "sports_equipment", "activewear"],
                "platforms": ["amazon", "ebay", "shopify"]
            },
            {
                "name": "Beauty & Personal Care",
                "code": "beauty",
                "subcategories": ["skincare", "makeup", "haircare", "fragrance", "wellness"],
                "platforms": ["jumia", "shopify", "amazon"]
            }
        ],
        "total_categories": 5,
        "ai_classification": True,
        "auto_detection": True
    }

# Export router for main app integration
__all__ = ["commerce_router"]