"""
Phase 3: Nearby/Onsite Commerce - Redis Caching Layer
Handles caching for nearby search results, location data, and inventory snapshots
"""

import json
import redis.asyncio as redis
import os
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import hashlib
import logging

logger = logging.getLogger(__name__)

class NearbyCache:
    """Redis-based caching for nearby commerce operations"""
    
    def __init__(self):
        self.client: Optional[redis.Redis] = None
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.prefix = "nearby:"
        
        # Cache TTL settings (in seconds)
        self.ttl_search = 120      # Search results: 2 minutes
        self.ttl_offers = 60       # Product offers: 1 minute  
        self.ttl_locations = 300   # Location data: 5 minutes
        self.ttl_inventory = 30    # Live inventory: 30 seconds
        
        # Cache statistics
        self.stats = {
            "hits": 0,
            "misses": 0,
            "errors": 0,
            "writes": 0
        }
    
    async def init(self):
        """Initialize Redis connection"""
        try:
            if not self.client:
                self.client = await aioredis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    retry_on_timeout=True,
                    socket_timeout=5
                )
                await self.client.ping()
                logger.info(f"✅ Nearby cache connected to Redis: {self.redis_url}")
        except Exception as e:
            logger.warning(f"⚠️ Redis unavailable for nearby cache: {e}")
            self.client = None
    
    async def close(self):
        """Close Redis connection"""
        if self.client:
            await self.client.close()
            self.client = None
            logger.info("✅ Nearby cache connection closed")
    
    def _normalize_search_key(self, lat: float, lng: float, radius_m: int, 
                             mode: str, query: str = None, **kwargs) -> str:
        """Generate normalized cache key for search queries"""
        # Round coordinates to 3 decimal places (~100m precision)
        lat_norm = round(lat, 3)
        lng_norm = round(lng, 3)
        
        # Create deterministic key from parameters
        key_parts = [
            f"lat:{lat_norm}",
            f"lng:{lng_norm}", 
            f"radius:{radius_m}",
            f"mode:{mode}",
        ]
        
        if query:
            # Hash query to avoid key length issues
            query_hash = hashlib.md5(query.encode()).hexdigest()[:8]
            key_parts.append(f"q:{query_hash}")
        
        # Add other parameters
        for k, v in sorted(kwargs.items()):
            if v is not None:
                key_parts.append(f"{k}:{v}")
        
        return f"{self.prefix}search:{':'.join(key_parts)}"
    
    def _tile_key(self, lat: float, lng: float, zoom: int = 12) -> str:
        """Generate tile-based cache key for location grouping"""
        # Simple tile calculation for cache distribution
        tile_x = int((lng + 180) / 360 * (2 ** zoom))
        tile_y = int((1 - (lat + 90) / 180) * (2 ** zoom))
        return f"{self.prefix}tile:{zoom}:{tile_x}:{tile_y}"
    
    async def get_search_results(self, lat: float, lng: float, radius_m: int,
                               mode: str, query: str = None, **kwargs) -> Optional[List[Dict[str, Any]]]:
        """Get cached search results"""
        if not self.client:
            return None
        
        try:
            key = self._normalize_search_key(lat, lng, radius_m, mode, query, **kwargs)
            data = await self.client.get(key)
            
            if data:
                self.stats["hits"] += 1
                result = json.loads(data)
                logger.debug(f"Cache HIT for search: {key}")
                return result
            else:
                self.stats["misses"] += 1
                return None
                
        except Exception as e:
            logger.error(f"Cache read error: {e}")
            self.stats["errors"] += 1
            return None
    
    async def set_search_results(self, lat: float, lng: float, radius_m: int,
                               mode: str, results: List[Dict[str, Any]], 
                               query: str = None, **kwargs):
        """Cache search results"""
        if not self.client:
            return
        
        try:
            key = self._normalize_search_key(lat, lng, radius_m, mode, query, **kwargs)
            data = json.dumps(results, default=str)
            
            await self.client.setex(key, self.ttl_search, data)
            self.stats["writes"] += 1
            logger.debug(f"Cache SET for search: {key}")
            
        except Exception as e:
            logger.error(f"Cache write error: {e}")
            self.stats["errors"] += 1
    
    async def get_product_offers(self, product_id: str, lat: float = None, 
                               lng: float = None) -> Optional[Dict[str, Any]]:
        """Get cached product offers"""
        if not self.client:
            return None
        
        try:
            location_suffix = ""
            if lat is not None and lng is not None:
                location_suffix = f":{round(lat, 2)}:{round(lng, 2)}"
            
            key = f"{self.prefix}offers:{product_id}{location_suffix}"
            data = await self.client.get(key)
            
            if data:
                self.stats["hits"] += 1
                logger.debug(f"Cache HIT for offers: {key}")
                return json.loads(data)
            else:
                self.stats["misses"] += 1
                return None
                
        except Exception as e:
            logger.error(f"Cache read error: {e}")
            self.stats["errors"] += 1
            return None
    
    async def set_product_offers(self, product_id: str, offers: Dict[str, Any],
                               lat: float = None, lng: float = None):
        """Cache product offers"""
        if not self.client:
            return
        
        try:
            location_suffix = ""
            if lat is not None and lng is not None:
                location_suffix = f":{round(lat, 2)}:{round(lng, 2)}"
            
            key = f"{self.prefix}offers:{product_id}{location_suffix}"
            data = json.dumps(offers, default=str)
            
            await self.client.setex(key, self.ttl_offers, data)
            self.stats["writes"] += 1
            logger.debug(f"Cache SET for offers: {key}")
            
        except Exception as e:
            logger.error(f"Cache write error: {e}")
            self.stats["errors"] += 1
    
    async def get_locations_in_tile(self, lat: float, lng: float, 
                                  zoom: int = 12) -> Optional[List[Dict[str, Any]]]:
        """Get cached locations for a tile"""
        if not self.client:
            return None
        
        try:
            key = self._tile_key(lat, lng, zoom)
            data = await self.client.get(key)
            
            if data:
                self.stats["hits"] += 1
                return json.loads(data)
            else:
                self.stats["misses"] += 1
                return None
                
        except Exception as e:
            logger.error(f"Cache read error: {e}")
            self.stats["errors"] += 1
            return None
    
    async def set_locations_in_tile(self, lat: float, lng: float, 
                                  locations: List[Dict[str, Any]], zoom: int = 12):
        """Cache locations for a tile"""
        if not self.client:
            return
        
        try:
            key = self._tile_key(lat, lng, zoom)
            data = json.dumps(locations, default=str)
            
            await self.client.setex(key, self.ttl_locations, data)
            self.stats["writes"] += 1
            
        except Exception as e:
            logger.error(f"Cache write error: {e}")
            self.stats["errors"] += 1
    
    async def invalidate_location_cache(self, location_id: str):
        """Invalidate cache entries related to a location"""
        if not self.client:
            return
        
        try:
            # Pattern-based deletion for location-related cache entries
            patterns = [
                f"{self.prefix}search:*",  # Invalidate all search results
                f"{self.prefix}offers:*",  # Invalidate offer results
                f"{self.prefix}tile:*"     # Invalidate tile caches
            ]
            
            for pattern in patterns:
                keys = await self.client.keys(pattern)
                if keys:
                    await self.client.delete(*keys)
            
            logger.info(f"Cache invalidated for location: {location_id}")
            
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}")
    
    async def warm_popular_searches(self, popular_locations: List[Dict[str, Any]]):
        """Pre-warm cache for popular search locations"""
        if not self.client:
            return
        
        logger.info("🔥 Warming nearby cache for popular locations...")
        
        for location in popular_locations:
            try:
                lat, lng = location.get("lat", 0), location.get("lng", 0)
                if lat and lng:
                    # Pre-warm multiple radius searches
                    for radius in [1000, 2000, 5000]:
                        for mode in ["retail", "wholesale", "all"]:
                            # This would trigger actual search to populate cache
                            # Implementation depends on search service integration
                            logger.debug(f"Warming: {lat},{lng} r={radius} mode={mode}")
                            
            except Exception as e:
                logger.error(f"Cache warming error: {e}")
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        total_ops = self.stats["hits"] + self.stats["misses"]
        hit_rate = (self.stats["hits"] / total_ops * 100) if total_ops > 0 else 0
        
        cache_info = {
            "hit_rate_percent": round(hit_rate, 1),
            "total_operations": total_ops,
            "statistics": self.stats.copy(),
            "ttl_settings": {
                "search_ttl": self.ttl_search,
                "offers_ttl": self.ttl_offers,
                "locations_ttl": self.ttl_locations,
                "inventory_ttl": self.ttl_inventory
            },
            "redis_connected": self.client is not None
        }
        
        # Add Redis info if available
        if self.client:
            try:
                info = await self.client.info()
                cache_info["redis_info"] = {
                    "used_memory_human": info.get("used_memory_human"),
                    "connected_clients": info.get("connected_clients"),
                    "keyspace_hits": info.get("keyspace_hits"),
                    "keyspace_misses": info.get("keyspace_misses")
                }
            except Exception as e:
                logger.error(f"Redis info error: {e}")
        
        return cache_info
    
    async def clear_all_cache(self):
        """Clear all nearby-related cache entries"""
        if not self.client:
            return
        
        try:
            keys = await self.client.keys(f"{self.prefix}*")
            if keys:
                await self.client.delete(*keys)
                logger.info(f"✅ Cleared {len(keys)} nearby cache entries")
        except Exception as e:
            logger.error(f"Cache clear error: {e}")

# Global cache instance
nearby_cache = NearbyCache()

# Initialization functions for integration with FastAPI lifecycle
async def init_nearby_cache():
    """Initialize nearby cache connection"""
    await nearby_cache.init()

async def close_nearby_cache():
    """Close nearby cache connection"""
    await nearby_cache.close()