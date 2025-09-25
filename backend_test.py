#!/usr/bin/env python3
"""
🎬 VERTICAL STORIES P1/P2 BACKEND VALIDATION SUITE
Testing the newly integrated vertical stories system with focus on:
- Event ingestion pipeline (impression/CTA/purchase tracking)
- AI ranking system validation (UCB1 algorithm)
- P1 performance infrastructure
- P0 hardening verification (HMAC, multi-currency, idempotency)
"""

import asyncio
import aiohttp
import json
import time
import hmac
import hashlib
from typing import Dict, List, Any
import os
from datetime import datetime

# Configuration
BACKEND_URL = "https://aislemart-shop.preview.emergentagent.com"  # FastAPI on port 8001
EXPRESS_URL = "http://localhost:8002"  # Express server on port 8002
HMAC_SECRET = "dev-secret-key-change-in-production"

class VerticalStoriesValidator:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            connector=aiohttp.TCPConnector(limit=100)
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            
        status = "✅ PASS" if success else "❌ FAIL"
        time_info = f" ({response_time:.3f}s)" if response_time > 0 else ""
        print(f"{status}: {test_name}{time_info}")
        if details:
            print(f"    {details}")
            
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_time": response_time
        })
    
    def generate_hmac_signature(self, timestamp: int, payload: str) -> str:
        """Generate HMAC signature for authenticated endpoints"""
        to_sign = f"{timestamp}.{payload}"
        signature = hmac.new(
            HMAC_SECRET.encode('utf-8'),
            to_sign.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    async def test_endpoint(self, method: str, url: str, data: Dict = None, 
                          headers: Dict = None, require_hmac: bool = False) -> Dict:
        """Test an endpoint with proper error handling"""
        start_time = time.time()
        
        try:
            # Prepare headers
            test_headers = {"Content-Type": "application/json"}
            if headers:
                test_headers.update(headers)
            
            # Add HMAC authentication if required
            if require_hmac and data:
                timestamp = int(time.time() * 1000)
                payload = json.dumps(data)
                signature = self.generate_hmac_signature(timestamp, payload)
                
                test_headers.update({
                    "X-Timestamp": str(timestamp),
                    "X-Signature": signature,
                    "Idempotency-Key": f"test-{timestamp}-{hash(payload)}"
                })
            
            # Make request
            if method.upper() == "GET":
                async with self.session.get(url, headers=test_headers) as response:
                    response_time = time.time() - start_time
                    text = await response.text()
                    try:
                        json_data = json.loads(text) if text else {}
                    except json.JSONDecodeError:
                        json_data = {"raw_response": text}
                    
                    return {
                        "status": response.status,
                        "data": json_data,
                        "response_time": response_time,
                        "success": 200 <= response.status < 300
                    }
            else:
                async with self.session.request(method, url, json=data, headers=test_headers) as response:
                    response_time = time.time() - start_time
                    text = await response.text()
                    try:
                        json_data = json.loads(text) if text else {}
                    except json.JSONDecodeError:
                        json_data = {"raw_response": text}
                    
                    return {
                        "status": response.status,
                        "data": json_data,
                        "response_time": response_time,
                        "success": 200 <= response.status < 300
                    }
                    
        except Exception as e:
            response_time = time.time() - start_time
            return {
                "status": 0,
                "data": {"error": str(e)},
                "response_time": response_time,
                "success": False
            }

    async def test_event_ingestion_pipeline(self):
        """Test all 3 event endpoints that VerticalStoriesScreen sends to"""
        print("\n🎯 TESTING EVENT INGESTION PIPELINE")
        
        # Test data for realistic vertical stories events
        test_user_id = "user_vertical_test_123"
        test_story_id = "luxefashion_story_0"
        test_product_id = "silk-scarf"
        test_creator_id = "luxefashion"
        
        # 1. Test POST /api/track/impression (story impressions with viewport=vertical_stories)
        impression_data = {
            "story_id": test_story_id,
            "creator_id": test_creator_id,
            "product_id": test_product_id,
            "timestamp": int(time.time() * 1000),
            "user_id": test_user_id,
            "viewport": "vertical_stories"
        }
        
        # Test FastAPI impression endpoint
        result = await self.test_endpoint(
            "POST", 
            f"{BACKEND_URL}/api/track/impression",
            data={"storyId": test_story_id, "userId": test_user_id}
        )
        
        self.log_test(
            "POST /api/track/impression (FastAPI)",
            result["success"],
            f"Status: {result['status']}, Response: {result['data']}",
            result["response_time"]
        )
        
        # Test Express impression endpoint
        result = await self.test_endpoint(
            "POST",
            f"{EXPRESS_URL}/api/track/impression", 
            data={"storyId": test_story_id, "userId": test_user_id}
        )
        
        self.log_test(
            "POST /api/track/impression (Express)",
            result["success"],
            f"Status: {result['status']}, Response: {result['data']}",
            result["response_time"]
        )
        
        # 2. Test POST /api/track/cta (like/comment/share/shop actions)
        cta_data = {
            "story_id": test_story_id,
            "creator_id": test_creator_id,
            "cta_type": "shop",
            "product_id": test_product_id,
            "timestamp": int(time.time() * 1000),
            "user_id": test_user_id
        }
        
        # Test FastAPI CTA endpoint
        result = await self.test_endpoint(
            "POST",
            f"{BACKEND_URL}/api/track/cta",
            data={"storyId": test_story_id, "productId": test_product_id, "userId": test_user_id}
        )
        
        self.log_test(
            "POST /api/track/cta (FastAPI)",
            result["success"],
            f"Status: {result['status']}, Response: {result['data']}",
            result["response_time"]
        )
        
        # Test Express CTA endpoint
        result = await self.test_endpoint(
            "POST",
            f"{EXPRESS_URL}/api/track/cta",
            data={"storyId": test_story_id, "productId": test_product_id, "userId": test_user_id}
        )
        
        self.log_test(
            "POST /api/track/cta (Express)",
            result["success"],
            f"Status: {result['status']}, Response: {result['data']}",
            result["response_time"]
        )
        
        # 3. Test POST /api/track/purchase (shop button taps with commission tracking)
        purchase_data = {
            "story_id": test_story_id,
            "creator_id": test_creator_id,
            "product_id": test_product_id,
            "purchase_amount": 999,
            "commission_rate": 0.12,
            "timestamp": int(time.time() * 1000),
            "user_id": test_user_id
        }
        
        # Test FastAPI purchase endpoint
        result = await self.test_endpoint(
            "POST",
            f"{BACKEND_URL}/api/track/purchase",
            data={
                "orderId": f"order_{int(time.time())}",
                "userId": test_user_id,
                "productId": test_product_id,
                "amount": 89.00,
                "currency": "USD",
                "referrerStoryId": test_story_id
            }
        )
        
        self.log_test(
            "POST /api/track/purchase (FastAPI)",
            result["success"],
            f"Status: {result['status']}, Response: {result['data']}",
            result["response_time"]
        )
        
        # Test Express purchase endpoint with HMAC
        result = await self.test_endpoint(
            "POST",
            f"{EXPRESS_URL}/api/track/purchase",
            data={
                "orderId": f"order_express_{int(time.time())}",
                "userId": test_user_id,
                "productId": test_product_id,
                "amount": 89.00,
                "currency": "USD",
                "referrerStoryId": test_story_id
            },
            require_hmac=True
        )
        
        self.log_test(
            "POST /api/track/purchase (Express + HMAC)",
            result["success"],
            f"Status: {result['status']}, Response: {result['data']}",
            result["response_time"]
        )

    async def test_ai_ranking_system(self):
        """Test the P2 ranker endpoints and UCB1 algorithm integration"""
        print("\n🤖 TESTING AI RANKING SYSTEM VALIDATION")
        
        # Test POST /api/rank (server-side UCB1 ranking for stories)
        rank_data = {
            "user_id": "test_user_ranking_123",
            "limit": 20,
            "country": "US",
            "currency": "USD"
        }
        
        result = await self.test_endpoint(
            "POST",
            f"{BACKEND_URL}/api/rank",
            data=rank_data
        )
        
        self.log_test(
            "POST /api/rank (UCB1 Algorithm)",
            result["success"],
            f"Status: {result['status']}, Algorithm: {result['data'].get('algo', 'unknown')}, Items: {len(result['data'].get('items', []))}",
            result["response_time"]
        )
        
        # Test creator fairness by checking if different creators are represented
        if result["success"] and "items" in result["data"]:
            items = result["data"]["items"]
            creator_ids = set(item.get("creator_id") for item in items if item.get("creator_id"))
            
            self.log_test(
                "UCB1 Creator Fairness Check",
                len(creator_ids) > 1,
                f"Unique creators in ranking: {len(creator_ids)} (should be > 1 for fairness)",
                0
            )
        
        # Test server-side ranking performance (should be < 500ms)
        performance_threshold = 0.5  # 500ms
        self.log_test(
            "Ranker Performance (<500ms)",
            result["response_time"] < performance_threshold,
            f"Response time: {result['response_time']:.3f}s (threshold: {performance_threshold}s)",
            0
        )
        
        # Test fallback behavior by testing with invalid user_id
        result = await self.test_endpoint(
            "POST",
            f"{BACKEND_URL}/api/rank",
            data={"user_id": "", "limit": 10}
        )
        
        self.log_test(
            "Ranker Fallback Behavior",
            result["status"] in [200, 400, 422],  # Should handle gracefully
            f"Status: {result['status']} for invalid user_id",
            result["response_time"]
        )

    async def test_p1_performance_infrastructure(self):
        """Test P1 performance infrastructure components"""
        print("\n⚡ TESTING P1 PERFORMANCE INFRASTRUCTURE")
        
        # Test Stories API performance under load (5+ concurrent requests)
        print("Testing Stories API concurrent performance...")
        
        async def fetch_stories():
            return await self.test_endpoint("GET", f"{BACKEND_URL}/api/stories?limit=10")
        
        # Run 5 concurrent requests
        start_time = time.time()
        tasks = [fetch_stories() for _ in range(5)]
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        successful_requests = sum(1 for r in results if r["success"])
        avg_response_time = sum(r["response_time"] for r in results) / len(results)
        
        self.log_test(
            "Stories API Concurrent Load (5 requests)",
            successful_requests >= 4,  # At least 4/5 should succeed
            f"Success rate: {successful_requests}/5, Avg response time: {avg_response_time:.3f}s, Total time: {total_time:.3f}s",
            total_time
        )
        
        # Test event ingestion performance (batch event processing)
        print("Testing batch event ingestion performance...")
        
        async def send_impression():
            return await self.test_endpoint(
                "POST",
                f"{BACKEND_URL}/api/track/impression",
                data={"storyId": f"test_story_{int(time.time() * 1000)}", "userId": "batch_test_user"}
            )
        
        # Send 10 impression events concurrently
        start_time = time.time()
        tasks = [send_impression() for _ in range(10)]
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        successful_events = sum(1 for r in results if r["success"])
        
        self.log_test(
            "Batch Event Ingestion (10 impressions)",
            successful_events >= 8,  # At least 8/10 should succeed
            f"Success rate: {successful_events}/10, Total time: {total_time:.3f}s",
            total_time
        )
        
        # Test HMAC authentication on tracking endpoints
        print("Testing HMAC authentication performance...")
        
        start_time = time.time()
        result = await self.test_endpoint(
            "POST",
            f"{EXPRESS_URL}/api/track/purchase",
            data={
                "orderId": f"perf_test_{int(time.time())}",
                "userId": "perf_test_user",
                "productId": "test-product",
                "amount": 50.00,
                "currency": "USD"
            },
            require_hmac=True
        )
        
        self.log_test(
            "HMAC Authentication Performance",
            result["success"] and result["response_time"] < 1.0,  # Should be under 1 second
            f"HMAC verification time: {result['response_time']:.3f}s",
            result["response_time"]
        )

    async def test_p0_hardening_verification(self):
        """Test P0 hardening features are still operational"""
        print("\n🛡️ TESTING P0 HARDENING VERIFICATION")
        
        # Test HMAC signature validation on purchase/CTA endpoints
        print("Testing HMAC signature validation...")
        
        # Test with missing HMAC signature (should return 400/401)
        result = await self.test_endpoint(
            "POST",
            f"{EXPRESS_URL}/api/track/purchase",
            data={
                "orderId": "test_no_hmac",
                "userId": "test_user",
                "productId": "test-product",
                "amount": 25.00,
                "currency": "USD"
            }
        )
        
        self.log_test(
            "HMAC Missing Signature Validation",
            result["status"] in [400, 401],
            f"Status: {result['status']} (expected 400/401 for missing HMAC)",
            result["response_time"]
        )
        
        # Test with invalid HMAC signature (should return 401)
        result = await self.test_endpoint(
            "POST",
            f"{EXPRESS_URL}/api/track/purchase",
            data={
                "orderId": "test_invalid_hmac",
                "userId": "test_user", 
                "productId": "test-product",
                "amount": 25.00,
                "currency": "USD"
            },
            headers={
                "X-Timestamp": str(int(time.time() * 1000)),
                "X-Signature": "invalid_signature_12345",
                "Idempotency-Key": "test-invalid-hmac"
            }
        )
        
        self.log_test(
            "HMAC Invalid Signature Validation",
            result["status"] == 401,
            f"Status: {result['status']} (expected 401 for invalid HMAC)",
            result["response_time"]
        )
        
        # Test multi-currency support
        print("Testing multi-currency support...")
        
        currencies = ["USD", "EUR", "GBP", "JPY"]
        amounts = [100.00, 92.50, 79.25, 15000]  # Appropriate amounts for each currency
        
        for currency, amount in zip(currencies, amounts):
            result = await self.test_endpoint(
                "POST",
                f"{EXPRESS_URL}/api/track/purchase",
                data={
                    "orderId": f"multicurrency_{currency}_{int(time.time())}",
                    "userId": "multicurrency_test_user",
                    "productId": "multicurrency-product",
                    "amount": amount,
                    "currency": currency
                },
                require_hmac=True
            )
            
            self.log_test(
                f"Multi-Currency Support ({currency})",
                result["success"],
                f"Status: {result['status']}, Amount: {amount} {currency}",
                result["response_time"]
            )
        
        # Test idempotency protection
        print("Testing idempotency protection...")
        
        idempotency_key = f"idempotency_test_{int(time.time())}"
        purchase_data = {
            "orderId": f"idempotency_order_{int(time.time())}",
            "userId": "idempotency_test_user",
            "productId": "idempotency-product",
            "amount": 75.00,
            "currency": "USD"
        }
        
        # First request
        result1 = await self.test_endpoint(
            "POST",
            f"{EXPRESS_URL}/api/track/purchase",
            data=purchase_data,
            headers={"Idempotency-Key": idempotency_key},
            require_hmac=True
        )
        
        # Second request with same idempotency key
        result2 = await self.test_endpoint(
            "POST",
            f"{EXPRESS_URL}/api/track/purchase",
            data=purchase_data,
            headers={"Idempotency-Key": idempotency_key},
            require_hmac=True
        )
        
        self.log_test(
            "Idempotency Protection",
            result1["success"] and (result2["status"] in [200, 409]),  # Second should be same response or conflict
            f"First: {result1['status']}, Second: {result2['status']} (expected 200 or 409 for duplicate)",
            result1["response_time"] + result2["response_time"]
        )
        
        # Test proper 4xx error responses
        print("Testing proper 4xx error responses...")
        
        # Test invalid currency
        result = await self.test_endpoint(
            "POST",
            f"{EXPRESS_URL}/api/track/purchase",
            data={
                "orderId": "invalid_currency_test",
                "userId": "test_user",
                "productId": "test-product",
                "amount": 50.00,
                "currency": "INVALID"
            },
            require_hmac=True
        )
        
        self.log_test(
            "Proper 4xx Error Response (Invalid Currency)",
            result["status"] == 422,
            f"Status: {result['status']} (expected 422 for invalid currency)",
            result["response_time"]
        )

    async def test_stories_api_endpoints(self):
        """Test core stories API endpoints"""
        print("\n📚 TESTING STORIES API ENDPOINTS")
        
        # Test GET /api/creators
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/creators")
        
        creators_count = len(result["data"]) if result["success"] and isinstance(result["data"], list) else 0
        self.log_test(
            "GET /api/creators",
            result["success"] and creators_count > 0,
            f"Status: {result['status']}, Creators count: {creators_count}",
            result["response_time"]
        )
        
        # Test GET /api/stories with pagination
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/stories?limit=5")
        
        stories_data = result["data"].get("data", []) if result["success"] else []
        self.log_test(
            "GET /api/stories (pagination)",
            result["success"] and len(stories_data) > 0,
            f"Status: {result['status']}, Stories count: {len(stories_data)}",
            result["response_time"]
        )
        
        # Test stories health endpoint
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/stories/health")
        
        features = result["data"].get("features", []) if result["success"] else []
        self.log_test(
            "GET /api/stories/health",
            result["success"] and len(features) > 10,  # Should have many features
            f"Status: {result['status']}, Features count: {len(features)}",
            result["response_time"]
        )
        
        # Test commerce analytics
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/commerce/analytics")
        
        has_summary = "summary" in result["data"] if result["success"] else False
        self.log_test(
            "GET /api/commerce/analytics",
            result["success"] and has_summary,
            f"Status: {result['status']}, Has summary: {has_summary}",
            result["response_time"]
        )

    async def test_express_server_endpoints(self):
        """Test Express server endpoints"""
        print("\n🚀 TESTING EXPRESS SERVER ENDPOINTS")
        
        # Test Express server health
        result = await self.test_endpoint("GET", f"{EXPRESS_URL}/health")
        
        features = result["data"].get("features", []) if result["success"] else []
        self.log_test(
            "Express Server Health Check",
            result["success"] and len(features) >= 5,
            f"Status: {result['status']}, Features: {features}",
            result["response_time"]
        )
        
        # Test Express root endpoint
        result = await self.test_endpoint("GET", f"{EXPRESS_URL}/")
        
        endpoints = result["data"].get("endpoints", []) if result["success"] else []
        self.log_test(
            "Express Server Root Endpoint",
            result["success"] and len(endpoints) > 5,
            f"Status: {result['status']}, Available endpoints: {len(endpoints)}",
            result["response_time"]
        )
        
        # Test Express creators endpoint
        result = await self.test_endpoint("GET", f"{EXPRESS_URL}/api/creators")
        
        creators = result["data"].get("creators", []) if result["success"] else []
        self.log_test(
            "Express GET /api/creators",
            result["success"] and len(creators) > 0,
            f"Status: {result['status']}, Creators count: {len(creators)}",
            result["response_time"]
        )
        
        # Test Express stories endpoint
        result = await self.test_endpoint("GET", f"{EXPRESS_URL}/api/stories?limit=5")
        
        stories = result["data"].get("stories", []) if result["success"] else []
        self.log_test(
            "Express GET /api/stories",
            result["success"] and len(stories) > 0,
            f"Status: {result['status']}, Stories count: {len(stories)}",
            result["response_time"]
        )

    async def run_all_tests(self):
        """Run all test suites"""
        print("🎬 STARTING VERTICAL STORIES P1/P2 BACKEND VALIDATION")
        print("=" * 80)
        
        start_time = time.time()
        
        # Run all test suites
        await self.test_stories_api_endpoints()
        await self.test_express_server_endpoints()
        await self.test_event_ingestion_pipeline()
        await self.test_ai_ranking_system()
        await self.test_p1_performance_infrastructure()
        await self.test_p0_hardening_verification()
        
        total_time = time.time() - start_time
        
        # Print summary
        print("\n" + "=" * 80)
        print("🏆 VERTICAL STORIES BACKEND VALIDATION SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS:")
        print(f"   Total Tests: {self.total_tests}")
        print(f"   Passed: {self.passed_tests}")
        print(f"   Failed: {self.total_tests - self.passed_tests}")
        print(f"   Success Rate: {success_rate:.1f}%")
        print(f"   Total Time: {total_time:.2f}s")
        
        # Success criteria check
        target_success_rate = 95.0
        if success_rate >= target_success_rate:
            print(f"\n✅ SUCCESS: {success_rate:.1f}% success rate EXCEEDS {target_success_rate}% target")
            print("🎯 VERTICAL STORIES SYSTEM IS READY FOR PRODUCTION")
        else:
            print(f"\n❌ NEEDS WORK: {success_rate:.1f}% success rate below {target_success_rate}% target")
            print("🔧 ISSUES NEED TO BE ADDRESSED BEFORE PRODUCTION")
        
        # Print failed tests for debugging
        failed_tests = [t for t in self.test_results if not t["success"]]
        if failed_tests:
            print(f"\n🚨 FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   ❌ {test['test']}: {test['details']}")
        
        return success_rate >= target_success_rate

async def main():
    """Main test execution"""
    async with VerticalStoriesValidator() as validator:
        success = await validator.run_all_tests()
        return success

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)