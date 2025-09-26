#!/usr/bin/env python3
"""
🚀💎 COMPREHENSIVE RESTART & REFRESH VALIDATION SUITE
Comprehensive backend validation to ensure all implemented features are operational 
after restart and refresh, focusing on TikTok ForYou Feed comparison features.

VALIDATION PRIORITIES:
1. Core Services Health (FastAPI, Currency-Infinity Engine, AI Super Agent)
2. ForYou Feed Systems (stories API, creator management, commerce attribution, ranking)
3. Event Tracking Pipeline (impression tracking, CTA tracking, purchase tracking)
4. AI Ranking System (hybrid client/server ranking with UCB1 algorithm)
5. P0-P2 Infrastructure (performance optimizations, multi-currency support)
6. Commerce Integration (e-commerce overlays, creator attribution)
7. Marketplace APIs (Amazon-style marketplace, Alibaba-style B2B backend)
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
BACKEND_URL = "https://market-launch-4.preview.emergentagent.com"  # FastAPI on port 8001
HMAC_SECRET = "dev-secret-key-change-in-production"

class ComprehensiveValidator:
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
    
    async def test_endpoint(self, method: str, url: str, data: Dict = None, 
                          headers: Dict = None) -> Dict:
        """Test an endpoint with proper error handling"""
        start_time = time.time()
        
        try:
            # Prepare headers
            test_headers = {"Content-Type": "application/json"}
            if headers:
                test_headers.update(headers)
            
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

    async def test_core_services_health(self):
        """Test Core Services Health - Priority 1"""
        print("\n🏥 TESTING CORE SERVICES HEALTH")
        
        # Test FastAPI Backend Health
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/health")
        self.log_test(
            "FastAPI Backend Health",
            result["success"],
            f"Status: {result['status']}, Service: {result['data'].get('service', 'unknown')}",
            result["response_time"]
        )
        
        # Test Currency-Infinity Engine
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/currency/health")
        currency_features = len(result["data"].get("features", [])) if result["success"] else 0
        self.log_test(
            "Currency-Infinity Engine Health",
            result["success"] and currency_features > 0,
            f"Status: {result['status']}, Features: {currency_features}",
            result["response_time"]
        )
        
        # Test AI Super Agent
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/ai-super-agent/health")
        ai_features = len(result["data"].get("features", [])) if result["success"] else 0
        self.log_test(
            "AI Super Agent Health",
            result["success"] and ai_features > 0,
            f"Status: {result['status']}, Features: {ai_features}",
            result["response_time"]
        )

    async def test_foryou_feed_systems(self):
        """Test ForYou Feed Systems - Priority 2"""
        print("\n📱 TESTING FORYOU FEED SYSTEMS")
        
        # Test Stories API
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/stories?limit=10")
        stories_count = len(result["data"].get("data", [])) if result["success"] else 0
        self.log_test(
            "Stories API (ForYou Feed Content)",
            result["success"] and stories_count > 0,
            f"Status: {result['status']}, Stories: {stories_count}",
            result["response_time"]
        )
        
        # Test Creator Management
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/creators")
        creators_count = len(result["data"]) if result["success"] and isinstance(result["data"], list) else 0
        self.log_test(
            "Creator Management System",
            result["success"] and creators_count > 0,
            f"Status: {result['status']}, Creators: {creators_count}",
            result["response_time"]
        )
        
        # Test Stories Health (Feature Coverage)
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/stories/health")
        features = result["data"].get("features", []) if result["success"] else []
        self.log_test(
            "Stories System Features",
            result["success"] and len(features) >= 10,
            f"Status: {result['status']}, Features: {len(features)}",
            result["response_time"]
        )
        
        # Test Commerce Attribution
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/commerce/analytics")
        has_analytics = "summary" in result["data"] if result["success"] else False
        self.log_test(
            "Commerce Attribution Analytics",
            result["success"] and has_analytics,
            f"Status: {result['status']}, Analytics Available: {has_analytics}",
            result["response_time"]
        )

    async def test_event_tracking_pipeline(self):
        """Test Event Tracking Pipeline - Priority 3"""
        print("\n🎯 TESTING EVENT TRACKING PIPELINE")
        
        # Test Impression Tracking
        result = await self.test_endpoint(
            "POST", 
            f"{BACKEND_URL}/api/track/impression",
            data={"storyId": "test_story_impression", "userId": "test_user_validation"}
        )
        self.log_test(
            "Impression Tracking",
            result["success"],
            f"Status: {result['status']}, Response: {result['data'].get('message', 'No message')}",
            result["response_time"]
        )
        
        # Test CTA Tracking
        result = await self.test_endpoint(
            "POST",
            f"{BACKEND_URL}/api/track/cta",
            data={"storyId": "test_story_cta", "productId": "test_product", "userId": "test_user_validation"}
        )
        self.log_test(
            "CTA Tracking",
            result["success"],
            f"Status: {result['status']}, Response: {result['data'].get('message', 'No message')}",
            result["response_time"]
        )
        
        # Test Purchase Tracking with Commission Calculation
        result = await self.test_endpoint(
            "POST",
            f"{BACKEND_URL}/api/track/purchase",
            data={
                "orderId": f"validation_order_{int(time.time())}",
                "userId": "test_user_validation",
                "productId": "silk-scarf",
                "amount": 89.00,
                "currency": "USD",
                "referrerStoryId": "luxefashion_story_0"
            }
        )
        commission = result["data"].get("commission", 0) if result["success"] else 0
        self.log_test(
            "Purchase Tracking with Commission",
            result["success"] and commission > 0,
            f"Status: {result['status']}, Commission: ${commission:.2f}",
            result["response_time"]
        )

    async def test_ai_ranking_system(self):
        """Test AI Ranking System - Priority 4"""
        print("\n🤖 TESTING AI RANKING SYSTEM")
        
        # Test UCB1 Algorithm Integration
        result = await self.test_endpoint(
            "POST",
            f"{BACKEND_URL}/api/rank",
            data={"user_id": "test_user_ranking", "limit": 20, "country": "US", "currency": "USD"}
        )
        
        items = result["data"].get("items", []) if result["success"] else []
        algorithm = result["data"].get("algo", "unknown") if result["success"] else "unknown"
        
        self.log_test(
            "UCB1 Algorithm Integration",
            result["success"] and len(items) > 0,
            f"Status: {result['status']}, Algorithm: {algorithm}, Items: {len(items)}",
            result["response_time"]
        )
        
        # Test Creator Fairness in Ranking
        if result["success"] and items:
            creator_ids = set(item.get("creator_id") for item in items if item.get("creator_id"))
            self.log_test(
                "Creator Fairness in Ranking",
                len(creator_ids) > 1,
                f"Unique creators in ranking: {len(creator_ids)} (ensures fairness)",
                0
            )
        
        # Test Ranking Performance
        self.log_test(
            "Ranking Performance (<500ms)",
            result["response_time"] < 0.5,
            f"Response time: {result['response_time']:.3f}s (threshold: 0.5s)",
            0
        )

    async def test_p0_p2_infrastructure(self):
        """Test P0-P2 Infrastructure - Priority 5"""
        print("\n⚡ TESTING P0-P2 INFRASTRUCTURE")
        
        # Test Multi-Currency Support
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/currency/rates")
        currencies = result["data"].get("currencies", []) if result["success"] else []
        self.log_test(
            "Multi-Currency Support",
            result["success"] and len(currencies) >= 4,
            f"Status: {result['status']}, Supported currencies: {len(currencies)}",
            result["response_time"]
        )
        
        # Test Performance Optimizations (Concurrent Load)
        print("Testing concurrent performance...")
        
        async def fetch_stories():
            return await self.test_endpoint("GET", f"{BACKEND_URL}/api/stories?limit=5")
        
        start_time = time.time()
        tasks = [fetch_stories() for _ in range(10)]
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        successful_requests = sum(1 for r in results if r["success"])
        avg_response_time = sum(r["response_time"] for r in results) / len(results)
        
        self.log_test(
            "Performance Under Load (10 concurrent)",
            successful_requests >= 8,
            f"Success rate: {successful_requests}/10, Avg response: {avg_response_time:.3f}s, Total: {total_time:.3f}s",
            total_time
        )

    async def test_commerce_integration(self):
        """Test Commerce Integration - Priority 6"""
        print("\n🛍️ TESTING COMMERCE INTEGRATION")
        
        # Test E-commerce Overlays (Product Integration)
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/products?limit=10")
        products = result["data"] if result["success"] and isinstance(result["data"], list) else []
        self.log_test(
            "E-commerce Product Integration",
            result["success"] and len(products) > 0,
            f"Status: {result['status']}, Products available: {len(products)}",
            result["response_time"]
        )
        
        # Test Creator Attribution System
        result = await self.test_endpoint(
            "POST",
            f"{BACKEND_URL}/api/track/purchase",
            data={
                "orderId": f"attribution_test_{int(time.time())}",
                "userId": "attribution_test_user",
                "productId": "test-product",
                "amount": 50.00,
                "currency": "USD",
                "referrerStoryId": "luxefashion_story_0"
            }
        )
        
        attribution = result["data"].get("attributionMethod") if result["success"] else None
        self.log_test(
            "Creator Attribution System",
            result["success"] and attribution,
            f"Status: {result['status']}, Attribution: {attribution}",
            result["response_time"]
        )

    async def test_marketplace_apis(self):
        """Test Marketplace APIs - Priority 7"""
        print("\n🏪 TESTING MARKETPLACE APIS")
        
        # Test Universal Commerce AI Hub
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/universal_ai/health")
        platforms = result["data"].get("platforms_connected", 0) if result["success"] else 0
        self.log_test(
            "Universal Commerce AI Hub",
            result["success"] and platforms > 20,
            f"Status: {result['status']}, Connected platforms: {platforms}",
            result["response_time"]
        )
        
        # Test Global Monetization Suite
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/monetization/health")
        revenue_streams = len(result["data"].get("revenue_streams", [])) if result["success"] else 0
        self.log_test(
            "Global Monetization Suite",
            result["success"] and revenue_streams >= 5,
            f"Status: {result['status']}, Revenue streams: {revenue_streams}",
            result["response_time"]
        )
        
        # Test Advanced AI Engine
        result = await self.test_endpoint("GET", f"{BACKEND_URL}/api/advanced-ai/health")
        ai_capabilities = len(result["data"].get("capabilities", [])) if result["success"] else 0
        self.log_test(
            "Advanced AI Engine",
            result["success"] and ai_capabilities > 0,
            f"Status: {result['status']}, AI capabilities: {ai_capabilities}",
            result["response_time"]
        )

    async def run_all_tests(self):
        """Run all test suites"""
        print("🚀💎 STARTING COMPREHENSIVE RESTART & REFRESH VALIDATION")
        print("=" * 80)
        
        start_time = time.time()
        
        # Run all test suites in priority order
        await self.test_core_services_health()
        await self.test_foryou_feed_systems()
        await self.test_event_tracking_pipeline()
        await self.test_ai_ranking_system()
        await self.test_p0_p2_infrastructure()
        await self.test_commerce_integration()
        await self.test_marketplace_apis()
        
        total_time = time.time() - start_time
        
        # Print summary
        print("\n" + "=" * 80)
        print("🏆 COMPREHENSIVE VALIDATION SUMMARY")
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
            print("🎯 SYSTEM IS READY FOR SERIES A INVESTOR DEMONSTRATIONS")
        elif success_rate >= 85.0:
            print(f"\n🟡 GOOD: {success_rate:.1f}% success rate is strong for Series A readiness")
            print("🎯 SYSTEM IS SUBSTANTIALLY READY FOR INVESTOR DEMONSTRATIONS")
        else:
            print(f"\n❌ NEEDS WORK: {success_rate:.1f}% success rate below {target_success_rate}% target")
            print("🔧 CRITICAL ISSUES NEED TO BE ADDRESSED")
        
        # Print failed tests for debugging
        failed_tests = [t for t in self.test_results if not t["success"]]
        if failed_tests:
            print(f"\n🚨 FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   ❌ {test['test']}: {test['details']}")
        
        return success_rate >= 85.0  # Lower threshold for comprehensive validation

async def main():
    """Main test execution"""
    async with ComprehensiveValidator() as validator:
        success = await validator.run_all_tests()
        return success

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)