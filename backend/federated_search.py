"""
Federated Search Engine - AisleMarts AI-Commerce
Unified product search across all e-commerce platforms with AI normalization
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import asyncio
import aiohttp
import hashlib
import json
from datetime import datetime, timedelta
from dataclasses import dataclass
import re

# Product schema - unified across all platforms
class Product(BaseModel):
    id: str
    title: str
    brand: Optional[str] = None
    price: Dict[str, Any]  # {"amount": float, "currency": str}
    images: List[str] = []
    image: str  # Primary image
    condition: str = "new"
    merchant: str
    source: str  # Platform identifier
    url: str
    attributes: Dict[str, str] = {}
    shipping: Optional[Dict[str, Any]] = None
    availability: str = "in_stock"
    region: str = "global"
    category: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None

class SearchResponse(BaseModel):
    results: List[Product]
    total: int
    query: str
    sources: List[str]
    execution_time_ms: int
    suggestions: List[str] = []

class SearchRequest(BaseModel):
    query: str
    user_type: str = "shopper"  # shopper, vendor, business
    limit: int = 20
    offset: int = 0
    filters: Dict[str, Any] = {}
    sort_by: str = "relevance"  # relevance, price_asc, price_desc, rating
    region: str = "KE"  # ISO country code
    currency: str = "KES"

# Platform connectors
class PlatformConnector:
    """Base class for e-commerce platform connectors"""
    
    def __init__(self, name: str, base_url: str, api_key: Optional[str] = None):
        self.name = name
        self.base_url = base_url
        self.api_key = api_key
        self.rate_limit = 10  # requests per second
        self.timeout = 5  # seconds
    
    async def search(self, query: str, **kwargs) -> List[Product]:
        """Search products on this platform"""
        raise NotImplementedError
    
    def normalize_product(self, raw_product: Dict) -> Product:
        """Convert platform-specific product to unified schema"""
        raise NotImplementedError

# Mock connectors for demo (replace with real API integrations)
class AmazonConnector(PlatformConnector):
    def __init__(self):
        super().__init__("Amazon", "https://api.amazon.com")
    
    async def search(self, query: str, **kwargs) -> List[Product]:
        # Mock Amazon products
        return [
            Product(
                id="amzn_001",
                title="Nike Air Zoom Pegasus 40 Running Shoes",
                brand="Nike",
                price={"amount": 7999, "currency": "KES"},
                image="https://via.placeholder.com/400x400/FF9900/FFFFFF?text=Amazon+Nike",
                images=["https://via.placeholder.com/400x400/FF9900/FFFFFF?text=Amazon+Nike"],
                merchant="Amazon",
                source="amazon",
                url="https://amazon.com/nike-pegasus-40",
                attributes={"size": "US 9", "color": "black/white", "material": "mesh"},
                shipping={"etaDays": 5, "cost": 699, "free_threshold": 2000},
                category="Footwear",
                rating=4.5,
                reviews_count=1247
            )
        ] if "nike" in query.lower() or "shoes" in query.lower() else []

class JumiaConnector(PlatformConnector):
    def __init__(self):
        super().__init__("Jumia", "https://api.jumia.co.ke")
    
    async def search(self, query: str, **kwargs) -> List[Product]:
        # Mock Jumia products
        return [
            Product(
                id="jumia_001",
                title="Samsung Galaxy Buds Pro - Active Noise Cancelling",
                brand="Samsung",
                price={"amount": 12500, "currency": "KES"},
                image="https://via.placeholder.com/400x400/FF6600/FFFFFF?text=Jumia+Samsung",
                images=["https://via.placeholder.com/400x400/FF6600/FFFFFF?text=Jumia+Samsung"],
                merchant="Jumia",
                source="jumia",
                url="https://jumia.co.ke/samsung-galaxy-buds-pro",
                attributes={"color": "phantom black", "connectivity": "bluetooth 5.0"},
                shipping={"etaDays": 2, "cost": 250, "free_threshold": 1000},
                category="Electronics",
                rating=4.3,
                reviews_count=892
            )
        ] if "samsung" in query.lower() or "earbuds" in query.lower() or "headphones" in query.lower() else []

class EbayConnector(PlatformConnector):
    def __init__(self):
        super().__init__("eBay", "https://api.ebay.com")
    
    async def search(self, query: str, **kwargs) -> List[Product]:
        # Mock eBay products
        return [
            Product(
                id="ebay_001",
                title="Apple MacBook Air M2 13-inch 256GB SSD",
                brand="Apple",
                price={"amount": 145000, "currency": "KES"},
                image="https://via.placeholder.com/400x400/0066CC/FFFFFF?text=eBay+Apple",
                images=["https://via.placeholder.com/400x400/0066CC/FFFFFF?text=eBay+Apple"],
                merchant="eBay",
                source="ebay",
                url="https://ebay.com/macbook-air-m2-256gb",
                attributes={"storage": "256GB", "color": "midnight", "chip": "M2"},
                shipping={"etaDays": 7, "cost": 1500, "international": True},
                category="Computers",
                rating=4.8,
                reviews_count=2134
            )
        ] if "macbook" in query.lower() or "laptop" in query.lower() or "apple" in query.lower() else []

class ShopifyConnector(PlatformConnector):
    def __init__(self):
        super().__init__("Shopify Stores", "https://api.shopify.com")
    
    async def search(self, query: str, **kwargs) -> List[Product]:
        # Mock Shopify store products
        return [
            Product(
                id="shopify_001",
                title="Artisan Coffee Beans - Premium Kenyan Blend",
                brand="Highland Coffee Co",
                price={"amount": 1200, "currency": "KES"},
                image="https://via.placeholder.com/400x400/6B4226/FFFFFF?text=Coffee",
                images=["https://via.placeholder.com/400x400/6B4226/FFFFFF?text=Coffee"],
                merchant="Highland Coffee Co",
                source="shopify",
                url="https://highland-coffee.myshopify.com/products/kenyan-blend",
                attributes={"origin": "Kenya", "roast": "medium", "weight": "500g"},
                shipping={"etaDays": 1, "cost": 200, "local": True},
                category="Food & Beverages",
                rating=4.9,
                reviews_count=156
            )
        ] if "coffee" in query.lower() or "kenyan" in query.lower() else []

# AI-powered query understanding and product normalization
class AisleAI:
    """AI service for query understanding and product normalization"""
    
    @staticmethod
    def understand_query(query: str, user_type: str = "shopper") -> Dict[str, Any]:
        """Parse user query into structured search parameters"""
        query_lower = query.lower()
        
        # Extract intent and entities
        intent = "product_search"
        entities = {
            "category": None,
            "brand": None,
            "price_range": None,
            "attributes": {}
        }
        
        # Simple rule-based NLP (replace with actual LLM)
        if "under" in query_lower or "below" in query_lower:
            price_match = re.search(r'under|below\s+(?:kes\s*)?(\d+)', query_lower)
            if price_match:
                entities["price_range"] = {"max": int(price_match.group(1))}
        
        # Brand detection
        brands = ["nike", "samsung", "apple", "sony", "adidas", "puma"]
        for brand in brands:
            if brand in query_lower:
                entities["brand"] = brand.capitalize()
                break
        
        # Category detection
        categories = {
            "shoes": ["shoes", "sneakers", "boots", "sandals"],
            "electronics": ["phone", "laptop", "tablet", "earbuds", "headphones"],
            "clothing": ["shirt", "pants", "dress", "jacket"],
            "food": ["coffee", "tea", "snacks"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in query_lower for keyword in keywords):
                entities["category"] = category
                break
        
        return {
            "intent": intent,
            "entities": entities,
            "original_query": query,
            "processed_query": query,
            "user_context": {"type": user_type}
        }
    
    @staticmethod
    def rank_products(products: List[Product], query_analysis: Dict, user_type: str) -> List[Product]:
        """AI-powered product ranking"""
        
        def calculate_score(product: Product) -> float:
            score = 0.0
            
            # Text relevance (simple keyword matching)
            query_words = query_analysis["processed_query"].lower().split()
            title_words = product.title.lower().split()
            
            # Keyword match bonus
            matches = sum(1 for word in query_words if any(word in title_word for title_word in title_words))
            score += matches * 2.0
            
            # Brand match bonus
            if query_analysis["entities"].get("brand"):
                if product.brand and query_analysis["entities"]["brand"].lower() in product.brand.lower():
                    score += 3.0
            
            # Rating bonus
            if product.rating:
                score += product.rating * 0.5
            
            # Reviews count bonus (logarithmic)
            if product.reviews_count:
                import math
                score += math.log(product.reviews_count + 1) * 0.2
            
            # Price range filter
            price_range = query_analysis["entities"].get("price_range")
            if price_range:
                product_price = product.price.get("amount", 0)
                if "max" in price_range and product_price <= price_range["max"]:
                    score += 1.0
                elif "max" in price_range and product_price > price_range["max"]:
                    score -= 2.0  # Penalty for exceeding budget
            
            # User type preferences
            if user_type == "shopper":
                # Prefer consumer products with good ratings
                if product.rating and product.rating >= 4.0:
                    score += 1.0
            elif user_type == "vendor":
                # Prefer products with good margin potential
                if product.price.get("amount", 0) < 10000:  # Lower cost items
                    score += 0.5
            elif user_type == "business":
                # Prefer bulk-available or B2B products
                if "bulk" in product.title.lower() or product.merchant in ["Alibaba", "ThomasNet"]:
                    score += 1.5
            
            return score
        
        # Sort by score (descending)
        scored_products = [(product, calculate_score(product)) for product in products]
        scored_products.sort(key=lambda x: x[1], reverse=True)
        
        return [product for product, score in scored_products]
    
    @staticmethod
    def deduplicate_products(products: List[Product]) -> List[Product]:
        """Remove duplicate products across platforms"""
        seen_titles = set()
        unique_products = []
        
        for product in products:
            # Simple deduplication by normalized title
            normalized_title = re.sub(r'[^\w\s]', '', product.title.lower()).strip()
            title_hash = hashlib.md5(normalized_title.encode()).hexdigest()[:8]
            
            if title_hash not in seen_titles:
                seen_titles.add(title_hash)
                unique_products.append(product)
        
        return unique_products

# Main federated search engine
class FederatedSearchEngine:
    def __init__(self):
        # Initialize platform connectors
        self.connectors = {
            "amazon": AmazonConnector(),
            "jumia": JumiaConnector(),
            "ebay": EbayConnector(),
            "shopify": ShopifyConnector(),
        }
        
        self.ai = AisleAI()
        
        # Cache for performance
        self.cache = {}
        self.cache_ttl = timedelta(minutes=15)
    
    async def search(self, request: SearchRequest) -> SearchResponse:
        """Main federated search function"""
        start_time = datetime.now()
        
        # Check cache first
        cache_key = f"{request.query}:{request.user_type}:{request.region}"
        if cache_key in self.cache:
            cached_result, cached_time = self.cache[cache_key]
            if datetime.now() - cached_time < self.cache_ttl:
                return cached_result
        
        # AI query understanding
        query_analysis = self.ai.understand_query(request.query, request.user_type)
        
        # Search across all platforms concurrently
        search_tasks = []
        for name, connector in self.connectors.items():
            task = self._search_platform(connector, request.query, request.dict())
            search_tasks.append(task)
        
        # Wait for all searches to complete
        platform_results = await asyncio.gather(*search_tasks, return_exceptions=True)
        
        # Aggregate results
        all_products = []
        active_sources = []
        
        for i, result in enumerate(platform_results):
            if isinstance(result, Exception):
                print(f"Error from {list(self.connectors.keys())[i]}: {result}")
                continue
            
            if result:
                all_products.extend(result)
                active_sources.append(list(self.connectors.keys())[i])
        
        # Apply AI processing
        all_products = self.ai.deduplicate_products(all_products)
        all_products = self.ai.rank_products(all_products, query_analysis, request.user_type)
        
        # Apply pagination
        total_results = len(all_products)
        paginated_results = all_products[request.offset:request.offset + request.limit]
        
        # Create response
        execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        response = SearchResponse(
            results=paginated_results,
            total=total_results,
            query=request.query,
            sources=active_sources,
            execution_time_ms=execution_time,
            suggestions=self._generate_suggestions(request.query)
        )
        
        # Cache the result
        self.cache[cache_key] = (response, datetime.now())
        
        return response
    
    async def _search_platform(self, connector: PlatformConnector, query: str, params: Dict) -> List[Product]:
        """Search a single platform with error handling"""
        try:
            return await connector.search(query, **params)
        except Exception as e:
            print(f"Search failed for {connector.name}: {e}")
            return []
    
    def _generate_suggestions(self, query: str) -> List[str]:
        """Generate search suggestions"""
        suggestions = []
        
        if "nike" in query.lower():
            suggestions.extend(["nike air force 1", "nike running shoes", "nike sneakers"])
        elif "samsung" in query.lower():
            suggestions.extend(["samsung galaxy", "samsung earbuds", "samsung phone"])
        elif "apple" in query.lower():
            suggestions.extend(["apple iphone", "apple macbook", "apple airpods"])
        else:
            suggestions.extend([
                "trending electronics",
                "best deals fashion",
                "home appliances sale",
                "kenyan products"
            ])
        
        return suggestions[:3]

# FastAPI endpoints
search_engine = FederatedSearchEngine()

async def federated_search_endpoint(
    q: str = Query(..., description="Search query"),
    user_type: str = Query("shopper", description="User type: shopper, vendor, business"),
    limit: int = Query(20, description="Number of results"),
    offset: int = Query(0, description="Pagination offset"),
    region: str = Query("KE", description="Country code"),
    currency: str = Query("KES", description="Currency code")
) -> SearchResponse:
    """
    Federated search across all e-commerce platforms
    Returns unified, AI-ranked product results
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
        response = await search_engine.search(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# Health check for search engine
async def search_health_check():
    """Health check for federated search system"""
    return {
        "status": "healthy",
        "connectors": list(search_engine.connectors.keys()),
        "cache_size": len(search_engine.cache),
        "timestamp": datetime.now().isoformat()
    }

# Export for integration with main FastAPI app
__all__ = ["federated_search_endpoint", "search_health_check", "SearchResponse", "Product"]