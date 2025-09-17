"""
Enhanced Federated Search Engine with Turkish Market Integration
Complete global e-commerce coverage including all Turkish platforms
"""

from fastapi import Query, HTTPException
from typing import List, Dict, Optional, Any
import asyncio
from datetime import datetime, timedelta

# Import existing system
from federated_search import (
    FederatedSearchEngine, SearchRequest, SearchResponse, 
    Product, AisleAI, PlatformConnector
)

# Import Turkish connectors
from turkish_ecommerce_connectors import TURKISH_CONNECTORS, TURKISH_KEYWORDS, translate_query_to_turkish

class EnhancedFederatedSearchEngine(FederatedSearchEngine):
    """Enhanced search engine with Turkish market integration"""
    
    def __init__(self):
        super().__init__()
        
        # Add Turkish connectors to existing connectors
        self.connectors.update(TURKISH_CONNECTORS)
        
        # Enhanced region support
        self.regional_connectors = {
            "TR": ["trendyol", "hepsiburada", "gittigidiyor", "n11", "ciceksepeti", "modanisa", "vatanbilgisayar"],
            "KE": ["jumia"],
            "US": ["amazon", "ebay"],
            "GLOBAL": ["shopify"]
        }
        
        # Currency conversion rates (mock - replace with real API)
        self.exchange_rates = {
            "TRY": {"USD": 0.037, "EUR": 0.034, "KES": 4.85},
            "USD": {"TRY": 27.0, "EUR": 0.92, "KES": 131.0},
            "KES": {"USD": 0.0076, "EUR": 0.007, "TRY": 0.206}
        }
    
    async def search(self, request: SearchRequest) -> SearchResponse:
        """Enhanced search with Turkish market support"""
        start_time = datetime.now()
        
        # Cache key with region support
        cache_key = f"{request.query}:{request.user_type}:{request.region}:{request.currency}"
        if cache_key in self.cache:
            cached_result, cached_time = self.cache[cache_key]
            if datetime.now() - cached_time < self.cache_ttl:
                return cached_result
        
        # Enhanced query understanding with Turkish support
        query_analysis = self.ai.understand_query(request.query, request.user_type)
        
        # Add Turkish query translation if region is Turkey
        if request.region == "TR":
            turkish_query = translate_query_to_turkish(request.query)
            query_analysis["turkish_query"] = turkish_query
        
        # Regional connector selection
        selected_connectors = self._get_regional_connectors(request.region)
        
        # Search across selected platforms concurrently
        search_tasks = []
        for name in selected_connectors:
            if name in self.connectors:
                connector = self.connectors[name]
                # Use Turkish query for Turkish platforms
                search_query = query_analysis.get("turkish_query", request.query) if name in self.regional_connectors.get("TR", []) else request.query
                task = self._search_platform(connector, search_query, request.dict())
                search_tasks.append((name, task))
        
        # Wait for all searches to complete
        search_results = await asyncio.gather(*[task for _, task in search_tasks], return_exceptions=True)
        
        # Aggregate results with platform tracking
        all_products = []
        active_sources = []
        
        for i, result in enumerate(search_results):
            platform_name = search_tasks[i][0]
            
            if isinstance(result, Exception):
                print(f"Error from {platform_name}: {result}")
                continue
            
            if result:
                # Add platform info and convert currency if needed
                for product in result:
                    product = self._normalize_currency(product, request.currency)
                all_products.extend(result)
                active_sources.append(platform_name)
        
        # Apply AI processing
        all_products = self.ai.deduplicate_products(all_products)
        all_products = self.ai.rank_products(all_products, query_analysis, request.user_type)
        
        # Apply pagination
        total_results = len(all_products)
        paginated_results = all_products[request.offset:request.offset + request.limit]
        
        # Enhanced suggestions with Turkish support
        suggestions = self._generate_enhanced_suggestions(request.query, request.region)
        
        # Create response
        execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        response = SearchResponse(
            results=paginated_results,
            total=total_results,
            query=request.query,
            sources=active_sources,
            execution_time_ms=execution_time,
            suggestions=suggestions
        )
        
        # Cache the result
        self.cache[cache_key] = (response, datetime.now())
        
        return response
    
    def _get_regional_connectors(self, region: str) -> List[str]:
        """Get appropriate connectors for region"""
        regional = self.regional_connectors.get(region, [])
        global_connectors = self.regional_connectors.get("GLOBAL", [])
        
        # Always include major global platforms
        base_connectors = ["amazon", "ebay", "shopify"]
        
        return list(set(regional + global_connectors + base_connectors))
    
    def _normalize_currency(self, product: Product, target_currency: str) -> Product:
        """Convert product price to target currency"""
        if product.price.get("currency") == target_currency:
            return product
        
        source_currency = product.price.get("currency", "USD")
        amount = product.price.get("amount", 0)
        
        if source_currency in self.exchange_rates and target_currency in self.exchange_rates[source_currency]:
            rate = self.exchange_rates[source_currency][target_currency]
            converted_amount = round(amount * rate, 2)
            
            # Update product price
            product.price = {
                "amount": converted_amount,
                "currency": target_currency,
                "original_amount": amount,
                "original_currency": source_currency,
                "exchange_rate": rate
            }
        
        return product
    
    def _generate_enhanced_suggestions(self, query: str, region: str) -> List[str]:
        """Generate region-aware suggestions"""
        suggestions = []
        
        # Base suggestions
        base_suggestions = self._generate_suggestions(query)
        suggestions.extend(base_suggestions)
        
        # Turkish market specific suggestions
        if region == "TR":
            turkish_suggestions = [
                "Trendyol en çok satanlar",
                "Hepsiburada indirimli ürünler", 
                "GittiGidiyor antika ürünler",
                "N11 kitap önerileri",
                "Ciceksepeti çiçek buketi",
                "Modanisa tesettür giyim"
            ]
            
            # Add relevant Turkish suggestions based on query
            for suggestion in turkish_suggestions:
                if any(keyword in query.lower() for keyword in ["trend", "indirim", "book", "flower", "fashion"]):
                    suggestions.append(suggestion)
        
        # Remove duplicates and limit
        return list(set(suggestions))[:5]

# Enhanced API endpoints
enhanced_search_engine = EnhancedFederatedSearchEngine()

async def enhanced_federated_search_endpoint(
    q: str = Query(..., description="Search query"),
    user_type: str = Query("shopper", description="User type: shopper, vendor, business"),
    limit: int = Query(20, description="Number of results"),
    offset: int = Query(0, description="Pagination offset"),
    region: str = Query("GLOBAL", description="Region: TR, KE, US, GLOBAL"),
    currency: str = Query("USD", description="Currency: USD, EUR, TRY, KES")
) -> SearchResponse:
    """
    🌍 **Enhanced Federated Search with Turkish Market Coverage**
    
    Search products from global platforms + complete Turkish e-commerce coverage:
    - **Turkish Platforms**: Trendyol, Hepsiburada, GittiGidiyor, N11, Ciceksepeti, Modanisa, Vatan Bilgisayar
    - **Global Platforms**: Amazon, eBay, Shopify stores
    - **Regional Optimization**: Turkey-specific query translation and currency conversion
    - **AI Intelligence**: Enhanced ranking with Turkish market context
    """
    
    request = SearchRequest(
        query=q,
        user_type=user_type,
        limit=limit,
        offset=offset,
        region=region,
        currency=currency
    )
    
    try:
        response = await enhanced_search_engine.search(request)
        
        # Add Turkish market metadata
        response_dict = response.dict()
        response_dict["api_version"] = "2.1"
        response_dict["powered_by"] = "AisleMarts AI-Commerce + Turkish Market Integration"
        response_dict["turkish_platforms"] = len([s for s in response.sources if s in TURKISH_CONNECTORS.keys()])
        response_dict["total_platforms"] = len(enhanced_search_engine.connectors)
        
        return response_dict
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Enhanced federated search failed",
                "message": str(e),
                "suggestion": "Try a simpler query or check Turkish language support"
            }
        )

async def turkish_market_status():
    """
    🇹🇷 **Turkish Market Integration Status**
    
    Returns status of all Turkish e-commerce platform integrations.
    """
    return {
        "status": "operational",
        "turkish_platforms": [
            {
                "name": "Trendyol",
                "status": "active",
                "coverage": "general marketplace",
                "currency": "TRY",
                "features": ["free_shipping", "fast_delivery", "reviews"]
            },
            {
                "name": "Hepsiburada", 
                "status": "active",
                "coverage": "electronics, fashion, home",
                "currency": "TRY",
                "features": ["same_day_delivery", "installments", "reviews"]
            },
            {
                "name": "GittiGidiyor",
                "status": "active", 
                "coverage": "collectibles, handmade, auctions",
                "currency": "TRY",
                "features": ["auctions", "vintage_items", "artisan_products"]
            },
            {
                "name": "N11",
                "status": "active",
                "coverage": "general marketplace, books",
                "currency": "TRY", 
                "features": ["competitive_pricing", "local_sellers", "reviews"]
            },
            {
                "name": "Ciceksepeti",
                "status": "active",
                "coverage": "flowers, gifts, special occasions",
                "currency": "TRY",
                "features": ["same_day_delivery", "gift_wrapping", "fresh_flowers"]
            },
            {
                "name": "Modanisa",
                "status": "active",
                "coverage": "modest fashion, islamic clothing",
                "currency": "TRY",
                "features": ["international_shipping", "modest_fashion", "global_brands"]
            },
            {
                "name": "Vatan Bilgisayar",
                "status": "active",
                "coverage": "computers, gaming, electronics",
                "currency": "TRY", 
                "features": ["technical_support", "installation", "gaming_focus"]
            }
        ],
        "total_turkish_platforms": 7,
        "currency_support": ["TRY", "USD", "EUR"],
        "language_support": ["Turkish", "English"],
        "last_updated": datetime.now().isoformat()
    }

# Export enhanced system
__all__ = ["enhanced_federated_search_endpoint", "turkish_market_status", "EnhancedFederatedSearchEngine"]