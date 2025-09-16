"""
Redis Search Caching Layer
High-performance caching for search results with intelligent cache warming
"""
import json
import hashlib
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
import redis.asyncio as redis
from redis.asyncio import Redis

from search_models import SearchResponse, OffersResponse


class SearchCache:
    """Redis-based caching for search results"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self.redis_client: Optional[Redis] = None
        self.default_ttl = 60  # 60 seconds for search results
        self.offers_ttl = 120  # 2 minutes for offers
        self.stats = {"hits": 0, "misses": 0, "errors": 0}
    
    async def connect(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Test connection
            await self.redis_client.ping()
            print("✅ Redis cache connected successfully")
        except Exception as e:
            print(f"⚠️ Redis cache connection failed: {e}")
            self.redis_client = None
    
    async def disconnect(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
            print("✅ Redis cache disconnected")
    
    def _normalize_search_key(
        self,
        query: str,
        mode: str = "all",
        lang: str = "en",
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        page: int = 1,
        limit: int = 24
    ) -> str:
        """Generate normalized cache key for search"""
        # Normalize query (lowercase, strip, handle special chars)
        normalized_query = query.lower().strip()
        normalized_query = ''.join(c for c in normalized_query if c.isalnum() or c.isspace())
        normalized_query = ' '.join(normalized_query.split())  # Remove extra spaces
        
        # Create deterministic key
        key_components = [
            f"q:{normalized_query}",
            f"mode:{mode}",
            f"lang:{lang}",
            f"page:{page}",
            f"limit:{limit}"
        ]
        
        # Add location if provided
        if lat is not None and lon is not None:
            # Round to 3 decimal places for cache efficiency
            lat_rounded = round(lat, 3)
            lon_rounded = round(lon, 3)
            key_components.append(f"geo:{lat_rounded},{lon_rounded}")
        
        # Create hash for long keys
        key_string = "|".join(key_components)
        if len(key_string) > 200:
            key_hash = hashlib.md5(key_string.encode()).hexdigest()
            return f"search:{key_hash}"
        
        return f"search:{key_string}"
    
    def _normalize_offers_key(self, product_id: str) -> str:
        """Generate cache key for product offers"""
        return f"offers:{product_id}"
    
    async def get_search_results(
        self,
        query: str,
        mode: str = "all",
        lang: str = "en",
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        page: int = 1,
        limit: int = 24
    ) -> Optional[SearchResponse]:
        """Get cached search results"""
        if not self.redis_client:
            return None
        
        try:                    
            cache_key = self._normalize_search_key(query, mode, lang, lat, lon, page, limit)
            cached_data = await self.redis_client.get(cache_key)
            
            if cached_data:
                self.stats["hits"] += 1
                data = json.loads(cached_data)
                return SearchResponse(**data)
            else:
                self.stats["misses"] += 1
                return None
                
        except Exception as e:
            self.stats["errors"] += 1
            print(f"Cache get error: {e}")
            return None
    
    async def set_search_results(
        self,
        search_response: SearchResponse,
        query: str,
        mode: str = "all",
        lang: str = "en",
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        page: int = 1,
        limit: int = 24,
        ttl: Optional[int] = None
    ) -> bool:
        """Cache search results"""
        if not self.redis_client:
            return False
        
        try:
            cache_key = self._normalize_search_key(query, mode, lang, lat, lon, page, limit)
            data = search_response.model_dump()
            
            # Add cache metadata
            data["_cached_at"] = datetime.utcnow().isoformat()
            
            ttl = ttl or self.default_ttl
            await self.redis_client.setex(
                cache_key,
                ttl,
                json.dumps(data, default=str)
            )
            return True
            
        except Exception as e:
            self.stats["errors"] += 1
            print(f"Cache set error: {e}")
            return False
    
    async def get_product_offers(self, product_id: str) -> Optional[OffersResponse]:
        """Get cached product offers"""
        if not self.redis_client:
            return None
        
        try:
            cache_key = self._normalize_offers_key(product_id)
            cached_data = await self.redis_client.get(cache_key)
            
            if cached_data:
                self.stats["hits"] += 1
                data = json.loads(cached_data)
                return OffersResponse(**data)
            else:
                self.stats["misses"] += 1
                return None
                
        except Exception as e:
            self.stats["errors"] += 1
            print(f"Cache get error: {e}")
            return None
    
    async def set_product_offers(
        self,
        offers_response: OffersResponse,
        ttl: Optional[int] = None
    ) -> bool:
        """Cache product offers"""
        if not self.redis_client:
            return False
        
        try:
            cache_key = self._normalize_offers_key(offers_response.product_id)
            data = offers_response.model_dump()
            
            # Add cache metadata
            data["_cached_at"] = datetime.utcnow().isoformat()
            
            ttl = ttl or self.offers_ttl
            await self.redis_client.setex(
                cache_key,
                ttl,
                json.dumps(data, default=str)
            )
            return True
            
        except Exception as e:
            self.stats["errors"] += 1
            print(f"Cache set error: {e}")
            return False
    
    async def invalidate_product_offers(self, product_id: str) -> bool:
        """Invalidate cached offers for a product"""
        if not self.redis_client:
            return False
        
        try:
            cache_key = self._normalize_offers_key(product_id)
            await self.redis_client.delete(cache_key)
            return True
            
        except Exception as e:
            self.stats["errors"] += 1
            print(f"Cache invalidation error: {e}")
            return False
    
    async def invalidate_search_pattern(self, pattern: str) -> int:
        """Invalidate multiple cache keys matching pattern"""
        if not self.redis_client:
            return 0
        
        try:
            keys = await self.redis_client.keys(f"search:*{pattern}*")
            if keys:
                deleted = await self.redis_client.delete(*keys)
                return deleted
            return 0
            
        except Exception as e:
            self.stats["errors"] += 1
            print(f"Cache pattern invalidation error: {e}")
            return 0
    
    async def warm_popular_searches(self, popular_queries: List[Dict[str, Any]]) -> int:
        """Pre-warm cache with popular search queries"""
        if not self.redis_client:
            return 0
        
        warmed = 0
        for query_info in popular_queries:
            try:
                query = query_info.get("query", "")
                mode = query_info.get("mode", "all")
                lang = query_info.get("lang", "en")
                
                cache_key = self._normalize_search_key(query, mode, lang)
                
                # Check if already cached
                if await self.redis_client.exists(cache_key):
                    continue
                
                # Pre-warm with placeholder that triggers actual search
                placeholder = {
                    "query": query,
                    "mode": mode,
                    "results": [],
                    "page": 1,
                    "limit": 24,
                    "total": 0,
                    "_prewarmed": True,
                    "_cached_at": datetime.utcnow().isoformat()
                }
                
                await self.redis_client.setex(
                    cache_key,
                    30,  # Short TTL for pre-warm placeholders
                    json.dumps(placeholder, default=str)
                )
                warmed += 1
                
            except Exception as e:
                print(f"Cache warm error for query {query_info}: {e}")
        
        return warmed
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        stats = self.stats.copy()
        
        # Calculate hit rate
        total_requests = stats["hits"] + stats["misses"]
        stats["hit_rate"] = (stats["hits"] / total_requests * 100) if total_requests > 0 else 0.0
        
        # Get Redis info if available
        if self.redis_client:
            try:
                redis_info = await self.redis_client.info()
                stats["redis_memory"] = redis_info.get("used_memory_human", "N/A")
                stats["redis_keys"] = await self.redis_client.dbsize()
                stats["redis_connected"] = True
            except Exception as e:
                stats["redis_connected"] = False
                stats["redis_error"] = str(e)
        else:
            stats["redis_connected"] = False
        
        return stats
    
    async def clear_all_cache(self) -> bool:
        """Clear all search-related cache entries"""
        if not self.redis_client:
            return False
        
        try:
            # Get all search and offers keys
            search_keys = await self.redis_client.keys("search:*")
            offers_keys = await self.redis_client.keys("offers:*")
            
            all_keys = search_keys + offers_keys
            if all_keys:
                await self.redis_client.delete(*all_keys)
            
            # Reset stats
            self.stats = {"hits": 0, "misses": 0, "errors": 0}
            
            print(f"✅ Cleared {len(all_keys)} cache entries")
            return True
            
        except Exception as e:
            print(f"Cache clear error: {e}")
            return False
    
    async def setup_cache_monitoring(self) -> None:
        """Setup cache monitoring and cleanup tasks"""
        if not self.redis_client:
            return
        
        # Start background cleanup task
        asyncio.create_task(self._cleanup_expired_keys())
        
        print("✅ Cache monitoring setup complete")
    
    async def _cleanup_expired_keys(self) -> None:
        """Background task to clean up expired keys"""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                
                if not self.redis_client:
                    continue
                
                # Get keys that are close to expiring
                search_keys = await self.redis_client.keys("search:*")
                
                expired_count = 0
                for key in search_keys:
                    ttl = await self.redis_client.ttl(key)
                    if ttl == -1:  # No expiration set
                        await self.redis_client.expire(key, self.default_ttl)
                    elif ttl < 10:  # Less than 10 seconds
                        await self.redis_client.delete(key)
                        expired_count += 1
                
                if expired_count > 0:
                    print(f"🧹 Cleaned up {expired_count} expired cache keys")
                    
            except Exception as e:
                print(f"Cache cleanup error: {e}")
                await asyncio.sleep(60)  # Wait before retrying


# ============= CACHE DECORATORS =============

def cached_search(ttl: int = 60):
    """Decorator for caching search functions"""
    def decorator(func):
        async def wrapper(self, *args, **kwargs):
            # Extract search parameters
            query = kwargs.get('query', args[0] if args else '')
            mode = kwargs.get('mode', args[1] if len(args) > 1 else 'all')
            
            cache = getattr(self, 'cache', None)
            if not cache:
                return await func(self, *args, **kwargs)
            
            # Try cache first
            cached_result = await cache.get_search_results(query, mode, **kwargs)
            if cached_result:
                return cached_result
            
            # Execute function and cache result
            result = await func(self, *args, **kwargs)
            if result:
                await cache.set_search_results(result, query, mode, ttl=ttl, **kwargs)
            
            return result
        return wrapper
    return decorator


# ============= CACHE INITIALIZATION =============

# Global cache instance  
search_cache: Optional[SearchCache] = None

async def init_search_cache(redis_url: str = "redis://localhost:6379") -> SearchCache:
    """Initialize global search cache"""  
    global search_cache
    
    search_cache = SearchCache(redis_url)
    await search_cache.connect()
    await search_cache.setup_cache_monitoring()
    
    return search_cache

async def close_search_cache() -> None:
    """Close global search cache"""
    global search_cache
    
    if search_cache:
        await search_cache.disconnect()
        search_cache = None

def get_search_cache() -> Optional[SearchCache]:
    """Get global cache instance"""
    return search_cache