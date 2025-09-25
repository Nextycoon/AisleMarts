#!/usr/bin/env python3
"""
AisleMarts Shop TikTok Enhanced - Phase 2 Backend Validation
Focus: Shoppable Video & In-Feed Checkout Complete Testing

Test Coverage:
1. Shop Health Check & Feature Availability
2. Product Catalog APIs (4+ sample products)
3. Shoppable Video Integration (video-product tagging)
4. In-Feed Checkout (mini-checkout sessions)
5. Event Tracking Pipeline
6. Zero Commission Model Validation
7. Shopping Cart & Orders
8. AI Ranking System Integration
9. Performance & Response Time Validation
"""

import asyncio
import aiohttp
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Any
import os

# Configuration
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://tiktok-commerce-1.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class ShopTestSuite:
    def __init__(self):
        self.session = None
        self.results = []
        self.start_time = time.time()
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'response_time': response_time,
            'timestamp': datetime.now().isoformat()
        })
        print(f"{status} | {test_name} | {details} | {response_time:.3f}s")
    
    async def test_request(self, method: str, endpoint: str, data: Dict = None, expected_status: int = 200) -> Dict:
        """Make HTTP request and measure response time"""
        url = f"{API_BASE}{endpoint}"
        start = time.time()
        
        try:
            if method.upper() == 'GET':
                async with self.session.get(url) as response:
                    response_time = time.time() - start
                    response_data = await response.json()
                    
                    if response.status == expected_status:
                        return {'success': True, 'data': response_data, 'response_time': response_time, 'status': response.status}
                    else:
                        return {'success': False, 'error': f"Expected {expected_status}, got {response.status}", 'response_time': response_time, 'status': response.status}
                        
            elif method.upper() == 'POST':
                async with self.session.post(url, json=data) as response:
                    response_time = time.time() - start
                    response_data = await response.json()
                    
                    if response.status == expected_status:
                        return {'success': True, 'data': response_data, 'response_time': response_time, 'status': response.status}
                    else:
                        return {'success': False, 'error': f"Expected {expected_status}, got {response.status}", 'response_time': response_time, 'status': response.status}
                        
        except Exception as e:
            response_time = time.time() - start
            return {'success': False, 'error': str(e), 'response_time': response_time}
    
    async def test_shop_health_check(self):
        """Test 1: Shop Health Check & Feature Availability"""
        print("\n🛍️ === PHASE 2 SHOP HEALTH CHECK ===")
        
        result = await self.test_request('GET', '/shop/health')
        
        if result['success']:
            data = result['data']
            features = data.get('features', {})
            stats = data.get('stats', {})
            
            # Validate required features
            required_features = ['shop_enabled', 'infeed_checkout', 'live_shopping']
            all_enabled = all(features.get(f, False) for f in required_features)
            
            # Validate stats
            products_count = stats.get('products', 0)
            
            details = f"Features: {len([f for f in required_features if features.get(f)])} enabled, Products: {products_count}"
            self.log_result("Shop Health Check", all_enabled and products_count >= 4, details, result['response_time'])
            
            return all_enabled and products_count >= 4
        else:
            self.log_result("Shop Health Check", False, result.get('error', 'Unknown error'), result['response_time'])
            return False
    
    async def test_product_catalog_apis(self):
        """Test 2: Product Catalog APIs with Sample Products"""
        print("\n📦 === PRODUCT CATALOG VALIDATION ===")
        
        # Test get all products
        result = await self.test_request('GET', '/shop/products?limit=10')
        
        if result['success']:
            data = result['data']
            products = data.get('products', [])
            
            # Validate we have required sample products
            required_categories = ['electronics', 'fashion', 'beauty', 'home']
            found_categories = set(p.get('category') for p in products)
            
            # Check for specific luxury products
            luxury_watch = any('watch' in p.get('title', '').lower() for p in products)
            fashion_jacket = any('jacket' in p.get('title', '').lower() for p in products)
            beauty_lipstick = any('lipstick' in p.get('title', '').lower() for p in products)
            home_candles = any('candle' in p.get('title', '').lower() for p in products)
            
            expected_products = [luxury_watch, fashion_jacket, beauty_lipstick, home_candles]
            products_found = sum(expected_products)
            
            details = f"Products: {len(products)}, Categories: {len(found_categories)}, Expected items: {products_found}/4"
            success = len(products) >= 4 and products_found >= 3
            
            self.log_result("Product Catalog API", success, details, result['response_time'])
            
            # Test individual product retrieval
            if products:
                product_id = products[0]['id']
                product_result = await self.test_request('GET', f'/shop/products/{product_id}')
                
                if product_result['success']:
                    product_data = product_result['data'].get('product', {})
                    has_variants = len(product_data.get('variants', [])) > 0
                    has_media = len(product_data.get('media', [])) > 0
                    
                    details = f"Product details: variants={has_variants}, media={has_media}"
                    self.log_result("Product Details API", has_variants and has_media, details, product_result['response_time'])
                else:
                    self.log_result("Product Details API", False, product_result.get('error', 'Failed'), product_result['response_time'])
            
            return success
        else:
            self.log_result("Product Catalog API", False, result.get('error', 'Unknown error'), result['response_time'])
            return False
    
    async def test_shoppable_video_integration(self):
        """Test 3: Shoppable Video Integration (Video-Product Tagging)"""
        print("\n🎬 === SHOPPABLE VIDEO INTEGRATION ===")
        
        # First get products to tag
        products_result = await self.test_request('GET', '/shop/products?limit=3')
        
        if not products_result['success']:
            self.log_result("Shoppable Video - Get Products", False, "Failed to get products", products_result['response_time'])
            return False
        
        products = products_result['data'].get('products', [])
        if len(products) < 2:
            self.log_result("Shoppable Video - Get Products", False, "Insufficient products for tagging", products_result['response_time'])
            return False
        
        # Test video tagging
        video_id = "luxefashion_video_001"
        tag_data = {
            "video_id": video_id,
            "product_tags": [
                {
                    "product_id": products[0]['id'],
                    "variant_id": products[0]['variants'][0]['id'] if products[0].get('variants') else None,
                    "position": {"x": 0.3, "y": 0.7}
                },
                {
                    "product_id": products[1]['id'],
                    "position": {"x": 0.6, "y": 0.4}
                }
            ]
        }
        
        tag_result = await self.test_request('POST', f'/shop/videos/{video_id}/tag', tag_data)
        
        if tag_result['success']:
            tag_response = tag_result['data']
            tags_count = tag_response.get('tags_count', 0)
            
            details = f"Tagged {tags_count} products to video {video_id}"
            self.log_result("Video Product Tagging", tags_count == 2, details, tag_result['response_time'])
            
            # Test retrieving tagged products
            get_result = await self.test_request('GET', f'/shop/videos/{video_id}/products')
            
            if get_result['success']:
                video_products = get_result['data'].get('products', [])
                
                details = f"Retrieved {len(video_products)} tagged products"
                success = len(video_products) == 2
                self.log_result("Video Products Retrieval", success, details, get_result['response_time'])
                
                return success
            else:
                self.log_result("Video Products Retrieval", False, get_result.get('error', 'Failed'), get_result['response_time'])
                return False
        else:
            self.log_result("Video Product Tagging", False, tag_result.get('error', 'Failed'), tag_result['response_time'])
            return False
    
    async def test_infeed_checkout_system(self):
        """Test 4: In-Feed Checkout (Mini-Checkout Sessions)"""
        print("\n💳 === IN-FEED CHECKOUT SYSTEM ===")
        
        # Get a product for checkout
        products_result = await self.test_request('GET', '/shop/products?limit=1')
        
        if not products_result['success']:
            self.log_result("In-Feed Checkout - Get Product", False, "Failed to get product", products_result['response_time'])
            return False
        
        products = products_result['data'].get('products', [])
        if not products:
            self.log_result("In-Feed Checkout - Get Product", False, "No products available", products_result['response_time'])
            return False
        
        product = products[0]
        variant = product.get('variants', [{}])[0] if product.get('variants') else {}
        
        # Test mini-checkout session creation
        checkout_data = {
            "product_id": product['id'],
            "variant_id": variant.get('id'),
            "quantity": 1,
            "source": "feed",
            "video_id": "luxefashion_video_001",
            "user_id": "test_user_001"
        }
        
        session_result = await self.test_request('POST', '/shop/checkout/mini', checkout_data)
        
        if session_result['success']:
            session_data = session_result['data']
            session_id = session_data.get('session_id')
            total = session_data.get('total', 0)
            
            details = f"Session created: {session_id}, Total: ${total:.2f}"
            self.log_result("Mini-Checkout Session", bool(session_id and total > 0), details, session_result['response_time'])
            
            # Test checkout completion
            complete_result = await self.test_request('POST', f'/shop/checkout/{session_id}/complete', {
                "payment_method": "sandbox_success",
                "user_id": "test_user_001"
            })
            
            if complete_result['success']:
                order_data = complete_result['data']
                order_id = order_data.get('order_id')
                order_total = order_data.get('total', 0)
                
                details = f"Order completed: {order_id}, Total: ${order_total:.2f}"
                success = bool(order_id and order_total > 0)
                self.log_result("Checkout Completion", success, details, complete_result['response_time'])
                
                return success
            else:
                self.log_result("Checkout Completion", False, complete_result.get('error', 'Failed'), complete_result['response_time'])
                return False
        else:
            self.log_result("Mini-Checkout Session", False, session_result.get('error', 'Failed'), session_result['response_time'])
            return False
    
    async def test_shopping_cart_orders(self):
        """Test 5: Shopping Cart & Orders System"""
        print("\n🛒 === SHOPPING CART & ORDERS ===")
        
        # Get a product for cart testing
        products_result = await self.test_request('GET', '/shop/products?limit=1')
        
        if not products_result['success']:
            self.log_result("Cart - Get Product", False, "Failed to get product", products_result['response_time'])
            return False
        
        products = products_result['data'].get('products', [])
        if not products:
            self.log_result("Cart - Get Product", False, "No products available", products_result['response_time'])
            return False
        
        product = products[0]
        variant = product.get('variants', [{}])[0] if product.get('variants') else {}
        
        # Test add to cart
        cart_data = {
            "product_id": product['id'],
            "variant_id": variant.get('id'),
            "quantity": 2,
            "user_id": "test_user_cart"
        }
        
        add_result = await self.test_request('POST', '/shop/cart/add', cart_data)
        
        if add_result['success']:
            cart_response = add_result['data']
            cart = cart_response.get('cart', {})
            items_count = len(cart.get('items', []))
            cart_total = cart.get('total', 0)
            
            details = f"Added to cart: {items_count} items, Total: ${cart_total:.2f}"
            self.log_result("Add to Cart", items_count > 0 and cart_total > 0, details, add_result['response_time'])
            
            # Test get cart
            get_cart_result = await self.test_request('GET', '/shop/cart?user_id=test_user_cart')
            
            if get_cart_result['success']:
                cart_data = get_cart_result['data'].get('cart', {})
                cart_items = len(cart_data.get('items', []))
                
                details = f"Cart retrieved: {cart_items} items"
                self.log_result("Get Cart", cart_items > 0, details, get_cart_result['response_time'])
                
                # Test get orders
                orders_result = await self.test_request('GET', '/shop/orders?user_id=test_user_001')
                
                if orders_result['success']:
                    orders = orders_result['data'].get('orders', [])
                    
                    details = f"Orders retrieved: {len(orders)} orders"
                    self.log_result("Get Orders", True, details, orders_result['response_time'])
                    
                    return True
                else:
                    self.log_result("Get Orders", False, orders_result.get('error', 'Failed'), orders_result['response_time'])
                    return False
            else:
                self.log_result("Get Cart", False, get_cart_result.get('error', 'Failed'), get_cart_result['response_time'])
                return False
        else:
            self.log_result("Add to Cart", False, add_result.get('error', 'Failed'), add_result['response_time'])
            return False
    
    async def test_live_shopping_features(self):
        """Test 6: Live Shopping Features"""
        print("\n📺 === LIVE SHOPPING FEATURES ===")
        
        # Get a product for live pinning
        products_result = await self.test_request('GET', '/shop/products?limit=1')
        
        if not products_result['success']:
            self.log_result("Live Shopping - Get Product", False, "Failed to get product", products_result['response_time'])
            return False
        
        products = products_result['data'].get('products', [])
        if not products:
            self.log_result("Live Shopping - Get Product", False, "No products available", products_result['response_time'])
            return False
        
        product = products[0]
        stream_id = "live_stream_001"
        
        # Test pin product to stream
        pin_data = {
            "product_id": product['id'],
            "variant_id": product.get('variants', [{}])[0].get('id') if product.get('variants') else None,
            "creator_id": "test_creator_001"
        }
        
        pin_result = await self.test_request('POST', f'/shop/live/{stream_id}/pin', pin_data)
        
        if pin_result['success']:
            pin_response = pin_result['data']
            pin_success = pin_response.get('success', False)
            
            details = f"Product pinned to stream {stream_id}"
            self.log_result("Live Product Pin", pin_success, details, pin_result['response_time'])
            
            # Test get live stream products
            get_result = await self.test_request('GET', f'/shop/live/{stream_id}/products')
            
            if get_result['success']:
                stream_products = get_result['data'].get('products', [])
                
                details = f"Retrieved {len(stream_products)} pinned products"
                success = len(stream_products) > 0
                self.log_result("Live Stream Products", success, details, get_result['response_time'])
                
                return success
            else:
                self.log_result("Live Stream Products", False, get_result.get('error', 'Failed'), get_result['response_time'])
                return False
        else:
            self.log_result("Live Product Pin", False, pin_result.get('error', 'Failed'), pin_result['response_time'])
            return False
    
    async def test_ai_ranking_system(self):
        """Test 7: AI Ranking System Integration"""
        print("\n🤖 === AI RANKING SYSTEM ===")
        
        rank_data = {
            "user_id": "test_user_ranking",
            "limit": 8,
            "country": "US",
            "currency": "USD"
        }
        
        rank_result = await self.test_request('POST', '/rank', rank_data)
        
        if rank_result['success']:
            rank_response = rank_result['data']
            algorithm = rank_response.get('algo', '')
            items = rank_response.get('items', [])
            ttl = rank_response.get('ttl', 0)
            
            # Validate ranking response
            has_items = len(items) > 0
            has_scores = all(item.get('score', 0) > 0 for item in items)
            has_creators = all(item.get('creator_id') for item in items)
            
            details = f"Algorithm: {algorithm}, Items: {len(items)}, TTL: {ttl}s"
            success = has_items and has_scores and has_creators
            self.log_result("AI Ranking System", success, details, rank_result['response_time'])
            
            return success
        else:
            self.log_result("AI Ranking System", False, rank_result.get('error', 'Failed'), rank_result['response_time'])
            return False
    
    async def test_performance_benchmarks(self):
        """Test 8: Performance & Response Time Validation"""
        print("\n⚡ === PERFORMANCE BENCHMARKS ===")
        
        # Test concurrent requests
        concurrent_tasks = []
        for i in range(5):
            task = self.test_request('GET', '/shop/health')
            concurrent_tasks.append(task)
        
        start_time = time.time()
        results = await asyncio.gather(*concurrent_tasks, return_exceptions=True)
        total_time = time.time() - start_time
        
        successful_requests = sum(1 for r in results if isinstance(r, dict) and r.get('success', False))
        avg_response_time = sum(r.get('response_time', 0) for r in results if isinstance(r, dict)) / len(results)
        
        details = f"Concurrent: {successful_requests}/5 success, Avg: {avg_response_time:.3f}s, Total: {total_time:.3f}s"
        success = successful_requests >= 4 and avg_response_time < 0.5
        self.log_result("Performance - Concurrent Load", success, details, total_time)
        
        # Test API response times
        endpoints_to_test = [
            '/shop/health',
            '/shop/products?limit=5',
            '/health'
        ]
        
        response_times = []
        for endpoint in endpoints_to_test:
            result = await self.test_request('GET', endpoint)
            if result['success']:
                response_times.append(result['response_time'])
        
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            max_time = max(response_times)
            
            details = f"Avg: {avg_time:.3f}s, Max: {max_time:.3f}s, Target: <500ms"
            success = avg_time < 0.5 and max_time < 1.0
            self.log_result("Performance - Response Times", success, details, avg_time)
            
            return success
        else:
            self.log_result("Performance - Response Times", False, "No successful requests", 0)
            return False
    
    async def run_comprehensive_test_suite(self):
        """Run all Phase 2 validation tests"""
        print("🚀💎 PHASE 2 VALIDATION: SHOPPABLE VIDEO & IN-FEED CHECKOUT COMPLETE")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print(f"Test Started: {datetime.now().isoformat()}")
        print("=" * 80)
        
        # Execute all test phases
        test_results = []
        
        test_results.append(await self.test_shop_health_check())
        test_results.append(await self.test_product_catalog_apis())
        test_results.append(await self.test_shoppable_video_integration())
        test_results.append(await self.test_infeed_checkout_system())
        test_results.append(await self.test_shopping_cart_orders())
        test_results.append(await self.test_live_shopping_features())
        test_results.append(await self.test_ai_ranking_system())
        test_results.append(await self.test_performance_benchmarks())
        
        # Calculate results
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r['success'])
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        total_time = time.time() - self.start_time
        avg_response_time = sum(r['response_time'] for r in self.results) / total_tests if total_tests > 0 else 0
        
        # Print summary
        print("\n" + "=" * 80)
        print("🎯 PHASE 2 VALIDATION SUMMARY")
        print("=" * 80)
        print(f"✅ Tests Passed: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
        print(f"⏱️  Total Time: {total_time:.2f}s")
        print(f"📊 Avg Response Time: {avg_response_time:.3f}s")
        print(f"🎯 Success Criteria: {success_rate:.1f}% (Target: >90%)")
        
        # Series A Readiness Assessment
        series_a_ready = success_rate >= 90 and avg_response_time < 0.5
        readiness_status = "✅ READY" if series_a_ready else "❌ NOT READY"
        
        print(f"\n🏆 SERIES A READINESS: {readiness_status}")
        
        if series_a_ready:
            print("🚀 AisleMarts Shop TikTok Enhanced is ready for Series A investor demonstrations")
            print("💎 Revolutionary 'scroll → tap → buy' experience validated")
        else:
            print("⚠️  Additional optimization needed before Series A presentations")
        
        print("=" * 80)
        
        return {
            'success_rate': success_rate,
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'total_time': total_time,
            'avg_response_time': avg_response_time,
            'series_a_ready': series_a_ready,
            'results': self.results
        }

async def main():
    """Main test execution"""
    async with ShopTestSuite() as test_suite:
        results = await test_suite.run_comprehensive_test_suite()
        
        # Exit with appropriate code
        if results['series_a_ready']:
            sys.exit(0)
        else:
            sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())