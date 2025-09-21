"""
⚡ AisleMarts Performance Optimizer Service
Advanced caching, optimization, and performance monitoring
"""

import asyncio
import time
import logging
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta
import json
from functools import wraps
from collections import defaultdict, deque
import hashlib
import threading
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class InMemoryCache:
    def __init__(self, max_size: int = 10000, ttl_seconds: int = 300):
        self.cache = {}
        self.access_times = {}
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self._lock = threading.RLock()
    
    def _is_expired(self, key: str) -> bool:
        """Check if cache entry is expired"""
        if key not in self.access_times:
            return True
        
        elapsed = time.time() - self.access_times[key]
        return elapsed > self.ttl_seconds
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        with self._lock:
            if key in self.cache and not self._is_expired(key):
                self.access_times[key] = time.time()  # Update access time
                return self.cache[key]
            elif key in self.cache:
                # Remove expired entry
                del self.cache[key]
                del self.access_times[key]
            return None
    
    def set(self, key: str, value: Any) -> None:
        """Set value in cache"""
        with self._lock:
            # Check if we need to evict entries
            if len(self.cache) >= self.max_size:
                self._evict_oldest()
            
            self.cache[key] = value
            self.access_times[key] = time.time()
    
    def _evict_oldest(self):
        """Evict oldest cache entries"""
        if not self.access_times:
            return
        
        # Remove 10% of cache entries (oldest first)
        num_to_remove = max(1, len(self.cache) // 10)
        oldest_keys = sorted(self.access_times.keys(), 
                           key=lambda k: self.access_times[k])[:num_to_remove]
        
        for key in oldest_keys:
            del self.cache[key]
            del self.access_times[key]
    
    def clear(self):
        """Clear entire cache"""
        with self._lock:
            self.cache.clear()
            self.access_times.clear()
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self._lock:
            expired_count = sum(1 for key in self.cache.keys() if self._is_expired(key))
            return {
                "size": len(self.cache),
                "max_size": self.max_size,
                "expired_entries": expired_count,
                "ttl_seconds": self.ttl_seconds
            }

class PerformanceOptimizer:
    def __init__(self):
        # Multi-layer caching system
        self.l1_cache = InMemoryCache(max_size=1000, ttl_seconds=60)    # Fast, short-term
        self.l2_cache = InMemoryCache(max_size=5000, ttl_seconds=300)   # Medium-term
        self.l3_cache = InMemoryCache(max_size=10000, ttl_seconds=1800) # Long-term
        
        # Performance monitoring
        self.performance_metrics = defaultdict(list)
        self.request_times = deque(maxlen=1000)
        self.cache_hit_rates = defaultdict(int)
        self.cache_miss_rates = defaultdict(int)
        
        # Query optimization
        self.query_patterns = defaultdict(int)
        self.slow_queries = []
        
        # Background optimization tasks
        self.optimization_active = True
        asyncio.create_task(self._background_optimization())
    
    def cache_key_generator(self, *args, **kwargs) -> str:
        """Generate consistent cache key from function arguments"""
        key_data = {
            'args': args,
            'kwargs': sorted(kwargs.items())
        }
        key_str = json.dumps(key_data, sort_keys=True, default=str)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def smart_cache(self, cache_level: int = 2, ttl: Optional[int] = None):
        """
        Smart caching decorator with multiple cache levels
        Level 1: Ultra-fast (60s TTL)
        Level 2: Fast (300s TTL) 
        Level 3: Standard (1800s TTL)
        """
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = f"{func.__name__}:{self.cache_key_generator(*args, **kwargs)}"
                
                # Select appropriate cache
                cache = self.l1_cache if cache_level == 1 else \
                       self.l2_cache if cache_level == 2 else self.l3_cache
                
                # Try to get from cache
                cached_result = cache.get(cache_key)
                if cached_result is not None:
                    self.cache_hit_rates[f"l{cache_level}"] += 1
                    logger.debug(f"Cache HIT: {func.__name__} (L{cache_level})")
                    return cached_result
                
                # Cache miss - execute function
                self.cache_miss_rates[f"l{cache_level}"] += 1
                logger.debug(f"Cache MISS: {func.__name__} (L{cache_level})")
                
                start_time = time.time()
                try:
                    result = await func(*args, **kwargs)
                    execution_time = time.time() - start_time
                    
                    # Store in cache
                    cache.set(cache_key, result)
                    
                    # Record performance metrics
                    self.performance_metrics[func.__name__].append({
                        'execution_time': execution_time,
                        'timestamp': datetime.utcnow().isoformat(),
                        'cache_level': cache_level
                    })
                    
                    return result
                    
                except Exception as e:
                    execution_time = time.time() - start_time
                    logger.error(f"Function {func.__name__} failed after {execution_time:.3f}s: {e}")
                    raise
                    
            return wrapper
        return decorator
    
    def performance_monitor(self, threshold_ms: float = 1000.0):
        """Performance monitoring decorator"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                
                try:
                    result = await func(*args, **kwargs)
                    execution_time = (time.time() - start_time) * 1000  # Convert to ms
                    
                    # Record request time
                    self.request_times.append({
                        'function': func.__name__,
                        'execution_time': execution_time,
                        'timestamp': datetime.utcnow().isoformat()
                    })
                    
                    # Log slow queries
                    if execution_time > threshold_ms:
                        slow_query = {
                            'function': func.__name__,
                            'execution_time': execution_time,
                            'args': str(args)[:100],  # Truncate for logging
                            'timestamp': datetime.utcnow().isoformat()
                        }
                        self.slow_queries.append(slow_query)
                        logger.warning(f"SLOW QUERY: {func.__name__} took {execution_time:.2f}ms")
                    
                    # Track query patterns
                    self.query_patterns[func.__name__] += 1
                    
                    return result
                    
                except Exception as e:
                    execution_time = (time.time() - start_time) * 1000
                    logger.error(f"Function {func.__name__} failed after {execution_time:.2f}ms: {e}")
                    raise
                    
            return wrapper
        return decorator
    
    async def optimize_query_batch(self, queries: List[Dict[str, Any]]) -> List[Any]:
        """
        Batch query optimization - execute multiple queries efficiently
        """
        try:
            # Group similar queries
            grouped_queries = defaultdict(list)
            for i, query in enumerate(queries):
                query_type = query.get('type', 'unknown')
                grouped_queries[query_type].append((i, query))
            
            results = [None] * len(queries)
            
            # Execute each group concurrently
            tasks = []
            for query_type, query_group in grouped_queries.items():
                task = asyncio.create_task(
                    self._execute_query_group(query_type, query_group)
                )
                tasks.append(task)
            
            # Wait for all groups to complete
            group_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Merge results back into original order
            for group_result in group_results:
                if isinstance(group_result, Exception):
                    logger.error(f"Query group failed: {group_result}")
                    continue
                
                for index, result in group_result:
                    results[index] = result
            
            return results
            
        except Exception as e:
            logger.error(f"Batch query optimization failed: {e}")
            return [None] * len(queries)
    
    async def _execute_query_group(self, query_type: str, query_group: List[Tuple[int, Dict[str, Any]]]) -> List[Tuple[int, Any]]:
        """Execute a group of similar queries"""
        results = []
        
        try:
            # Optimize based on query type
            if query_type == "user_balance":
                # Batch balance queries
                user_ids = [query['user_id'] for _, query in query_group]
                batch_results = await self._batch_get_balances(user_ids)
                
                for (index, query), result in zip(query_group, batch_results):
                    results.append((index, result))
            
            elif query_type == "mission_progress":
                # Batch mission progress queries
                batch_results = await self._batch_get_mission_progress(query_group)
                results.extend(batch_results)
            
            else:
                # Execute individually for unknown types
                for index, query in query_group:
                    result = await self._execute_single_query(query)
                    results.append((index, result))
            
            return results
            
        except Exception as e:
            logger.error(f"Query group execution failed for {query_type}: {e}")
            return [(index, None) for index, _ in query_group]
    
    async def _batch_get_balances(self, user_ids: List[str]) -> List[Dict[str, Any]]:
        """Optimized batch balance retrieval"""
        # Simulate batch database query
        await asyncio.sleep(0.05)  # Simulate DB time
        
        results = []
        for user_id in user_ids:
            results.append({
                "user_id": user_id,
                "aisleCoins": 1250 + hash(user_id) % 1000,
                "blueWavePoints": 2500 + hash(user_id) % 2000,
                "vendorStars": 15 + hash(user_id) % 20,
                "cashbackCredits": 75.50 + (hash(user_id) % 100)
            })
        
        return results
    
    async def _batch_get_mission_progress(self, query_group: List[Tuple[int, Dict[str, Any]]]) -> List[Tuple[int, Any]]:
        """Optimized batch mission progress retrieval"""
        await asyncio.sleep(0.03)  # Simulate DB time
        
        results = []
        for index, query in query_group:
            user_id = query.get('user_id', 'unknown')
            progress = {
                "user_id": user_id,
                "missions": [
                    {"id": "stay_5m", "progress": 0.8, "completed": False},
                    {"id": "new_buyers_1", "progress": 1.0, "completed": True}
                ]
            }
            results.append((index, progress))
        
        return results
    
    async def _execute_single_query(self, query: Dict[str, Any]) -> Any:
        """Execute a single query"""
        await asyncio.sleep(0.01)  # Simulate processing
        return {"status": "completed", "query": query.get("type", "unknown")}
    
    def get_cache_statistics(self) -> Dict[str, Any]:
        """Get comprehensive cache statistics"""
        return {
            "l1_cache": self.l1_cache.stats(),
            "l2_cache": self.l2_cache.stats(),
            "l3_cache": self.l3_cache.stats(),
            "hit_rates": dict(self.cache_hit_rates),
            "miss_rates": dict(self.cache_miss_rates),
            "total_hits": sum(self.cache_hit_rates.values()),
            "total_misses": sum(self.cache_miss_rates.values())
        }
    
    def get_performance_statistics(self) -> Dict[str, Any]:
        """Get comprehensive performance statistics"""
        if not self.request_times:
            return {"error": "No performance data available"}
        
        # Calculate performance metrics
        recent_times = [req['execution_time'] for req in list(self.request_times)[-100:]]
        
        avg_response_time = sum(recent_times) / len(recent_times) if recent_times else 0
        p95_response_time = sorted(recent_times)[int(len(recent_times) * 0.95)] if recent_times else 0
        p99_response_time = sorted(recent_times)[int(len(recent_times) * 0.99)] if recent_times else 0
        
        return {
            "request_count": len(self.request_times),
            "avg_response_time_ms": round(avg_response_time, 2),
            "p95_response_time_ms": round(p95_response_time, 2),
            "p99_response_time_ms": round(p99_response_time, 2),
            "slow_queries_count": len(self.slow_queries),
            "top_query_patterns": dict(sorted(self.query_patterns.items(), 
                                            key=lambda x: x[1], reverse=True)[:10]),
            "cache_statistics": self.get_cache_statistics()
        }
    
    async def optimize_database_queries(self) -> Dict[str, Any]:
        """Optimize database query patterns"""
        optimizations = []
        
        # Analyze query patterns
        if self.slow_queries:
            slow_query_patterns = defaultdict(int)
            for query in self.slow_queries[-50:]:  # Analyze recent slow queries
                slow_query_patterns[query['function']] += 1
            
            # Suggest optimizations
            for func_name, count in slow_query_patterns.items():
                if count > 5:  # More than 5 slow queries
                    optimizations.append({
                        "type": "query_optimization",
                        "function": func_name,
                        "issue": f"{count} slow executions detected",
                        "suggestion": "Consider adding database indexes or query optimization"
                    })
        
        # Memory usage optimization
        l1_size = len(self.l1_cache.cache)
        l2_size = len(self.l2_cache.cache)
        l3_size = len(self.l3_cache.cache)
        
        if l1_size > 800:  # Near capacity
            optimizations.append({
                "type": "cache_optimization",
                "issue": "L1 cache near capacity",
                "suggestion": "Consider reducing TTL or increasing cache size"
            })
        
        # Hit rate optimization
        cache_stats = self.get_cache_statistics()
        total_requests = cache_stats.get("total_hits", 0) + cache_stats.get("total_misses", 0)
        hit_rate = cache_stats.get("total_hits", 0) / total_requests if total_requests > 0 else 0
        
        if hit_rate < 0.6:  # Less than 60% hit rate
            optimizations.append({
                "type": "cache_tuning",
                "issue": f"Low cache hit rate: {hit_rate:.2%}",
                "suggestion": "Consider adjusting cache TTL or improving cache key strategy"
            })
        
        return {
            "optimizations_found": len(optimizations),
            "suggestions": optimizations,
            "current_performance": self.get_performance_statistics()
        }
    
    async def _background_optimization(self):
        """Background task for continuous optimization"""
        while self.optimization_active:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                
                # Clear expired cache entries
                await self._cleanup_expired_cache()
                
                # Analyze performance patterns
                await self._analyze_performance_patterns()
                
                # Log optimization summary
                stats = self.get_performance_statistics()
                logger.info(f"Performance summary - Avg: {stats.get('avg_response_time_ms', 0):.2f}ms, "
                          f"Cache hit rate: {self._calculate_hit_rate():.2%}")
                
            except Exception as e:
                logger.error(f"Background optimization error: {e}")
    
    async def _cleanup_expired_cache(self):
        """Clean up expired cache entries"""
        # The cache automatically handles expiration, but we can trigger cleanup
        for cache in [self.l1_cache, self.l2_cache, self.l3_cache]:
            expired_keys = []
            with cache._lock:
                for key in list(cache.cache.keys()):
                    if cache._is_expired(key):
                        expired_keys.append(key)
                
                for key in expired_keys:
                    del cache.cache[key]
                    del cache.access_times[key]
        
        if expired_keys:
            logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")
    
    async def _analyze_performance_patterns(self):
        """Analyze performance patterns for optimization opportunities"""
        if len(self.request_times) < 10:
            return
        
        # Analyze recent performance trends
        recent_requests = list(self.request_times)[-100:]
        avg_time = sum(req['execution_time'] for req in recent_requests) / len(recent_requests)
        
        # If average response time is increasing, trigger optimizations
        if avg_time > 500:  # More than 500ms average
            logger.warning(f"Performance degradation detected: {avg_time:.2f}ms average")
            # Could trigger more aggressive caching or other optimizations
    
    def _calculate_hit_rate(self) -> float:
        """Calculate overall cache hit rate"""
        total_hits = sum(self.cache_hit_rates.values())
        total_requests = total_hits + sum(self.cache_miss_rates.values())
        return total_hits / total_requests if total_requests > 0 else 0.0
    
    def shutdown(self):
        """Shutdown performance optimizer"""
        self.optimization_active = False
        logger.info("Performance optimizer shutdown")

# Global performance optimizer instance
performance_optimizer = PerformanceOptimizer()

# Convenience decorators
smart_cache = performance_optimizer.smart_cache
performance_monitor = performance_optimizer.performance_monitor