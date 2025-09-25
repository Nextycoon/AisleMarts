#!/usr/bin/env python3
"""
🚀 PHASE 2 INFINITY STORIES BACKEND VALIDATION
Comprehensive testing suite for Stories API endpoints and Phase 2 implementation
"""

import asyncio
import aiohttp
import time
import json
from typing import List, Dict, Any
import os
from concurrent.futures import ThreadPoolExecutor
import statistics

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://tiktok-commerce-1.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class InfinityStoriesValidator:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.performance_metrics = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'response_time': response_time
        })
        
        if response_time > 0:
            self.performance_metrics.append(response_time)
    
    async def test_api_endpoint(self, endpoint: str, method: str = "GET", data: dict = None) -> tuple:
        """Test API endpoint and return (success, response, response_time)"""
        start_time = time.time()
        try:
            if method == "GET":
                async with self.session.get(f"{BASE_URL}{endpoint}") as response:
                    response_time = time.time() - start_time
                    if response.status == 200:
                        json_data = await response.json()
                        return True, json_data, response_time
                    else:
                        error_text = await response.text()
                        return False, f"HTTP {response.status}: {error_text}", response_time
            elif method == "POST":
                async with self.session.post(f"{BASE_URL}{endpoint}", json=data) as response:
                    response_time = time.time() - start_time
                    if response.status == 200:
                        json_data = await response.json()
                        return True, json_data, response_time
                    else:
                        error_text = await response.text()
                        return False, f"HTTP {response.status}: {error_text}", response_time
        except Exception as e:
            response_time = time.time() - start_time
            return False, f"Request failed: {str(e)}", response_time
    
    # 🎯 CORE STORIES API TESTING
    async def test_creators_endpoint(self):
        """Test GET /api/creators - Validate creator list with tiers"""
        success, response, response_time = await self.test_api_endpoint("/creators")
        
        if success:
            # Validate creator structure and tiers
            creators = response
            if not isinstance(creators, list):
                self.log_test("GET /api/creators", False, "Response is not a list", response_time)
                return
            
            # Check for required tiers
            tiers_found = set()
            required_fields = ['id', 'displayName', 'tier', 'avatarUrl', 'popularity']
            
            for creator in creators:
                # Validate required fields
                missing_fields = [field for field in required_fields if field not in creator]
                if missing_fields:
                    self.log_test("GET /api/creators", False, f"Missing fields in creator: {missing_fields}", response_time)
                    return
                
                tiers_found.add(creator['tier'])
            
            # Validate tier diversity
            expected_tiers = {'gold', 'blue', 'grey', 'unverified'}
            if not expected_tiers.issubset(tiers_found):
                missing_tiers = expected_tiers - tiers_found
                self.log_test("GET /api/creators", False, f"Missing tiers: {missing_tiers}", response_time)
                return
            
            self.log_test("GET /api/creators", True, f"Found {len(creators)} creators with all required tiers: {tiers_found}", response_time)
        else:
            self.log_test("GET /api/creators", False, str(response), response_time)
    
    async def test_stories_endpoint(self):
        """Test GET /api/stories - Test cursor-based pagination with proper story structure"""
        success, response, response_time = await self.test_api_endpoint("/stories")
        
        if success:
            # Validate response structure
            if 'data' not in response or 'cursor' not in response:
                self.log_test("GET /api/stories", False, "Missing 'data' or 'cursor' in response", response_time)
                return
            
            stories = response['data']
            if not isinstance(stories, list):
                self.log_test("GET /api/stories", False, "'data' is not a list", response_time)
                return
            
            # Validate story structure
            required_story_fields = ['id', 'creatorId', 'type', 'mediaUrl', 'expiresAt']
            story_types_found = set()
            
            for story in stories:
                # Check required fields
                missing_fields = [field for field in required_story_fields if field not in story]
                if missing_fields:
                    self.log_test("GET /api/stories", False, f"Missing fields in story: {missing_fields}", response_time)
                    return
                
                story_types_found.add(story['type'])
                
                # Validate story types
                if story['type'] not in ['moment', 'product', 'bts']:
                    self.log_test("GET /api/stories", False, f"Invalid story type: {story['type']}", response_time)
                    return
                
                # Validate product stories have productId
                if story['type'] == 'product' and 'productId' not in story:
                    self.log_test("GET /api/stories", False, "Product story missing productId", response_time)
                    return
            
            self.log_test("GET /api/stories", True, f"Found {len(stories)} stories with types: {story_types_found}, cursor: {response.get('cursor')}", response_time)
        else:
            self.log_test("GET /api/stories", False, str(response), response_time)
    
    async def test_stories_health_check(self):
        """Test Stories Health Check - Verify stories system status and feature support"""
        success, response, response_time = await self.test_api_endpoint("/stories/health")
        
        if success:
            # Validate health check structure
            required_fields = ['status', 'creators_count', 'stories_per_creator', 'total_stories', 'features']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                self.log_test("GET /api/stories/health", False, f"Missing fields: {missing_fields}", response_time)
                return
            
            # Validate required features
            required_features = [
                'cursor_pagination',
                'virtual_scrolling_ready', 
                'preload_coordinator_compatible',
                '24h_expiry_simulation',
                'commerce_integration'
            ]
            
            features = response.get('features', [])
            missing_features = [feature for feature in required_features if feature not in features]
            
            if missing_features:
                self.log_test("GET /api/stories/health", False, f"Missing features: {missing_features}", response_time)
                return
            
            self.log_test("GET /api/stories/health", True, f"Status: {response['status']}, Features: {len(features)}, Total Stories: {response['total_stories']}", response_time)
        else:
            self.log_test("GET /api/stories/health", False, str(response), response_time)
    
    async def test_cursor_pagination(self):
        """Test Cursor Pagination - Test multiple pages with cursor parameter"""
        # Get first page
        success1, response1, response_time1 = await self.test_api_endpoint("/stories?limit=5")
        
        if not success1:
            self.log_test("Cursor Pagination - Page 1", False, str(response1), response_time1)
            return
        
        first_page_cursor = response1.get('cursor')
        first_page_count = len(response1.get('data', []))
        
        if not first_page_cursor:
            self.log_test("Cursor Pagination - Page 1", False, "No cursor returned for pagination", response_time1)
            return
        
        # Get second page using cursor
        success2, response2, response_time2 = await self.test_api_endpoint(f"/stories?cursor={first_page_cursor}&limit=5")
        
        if not success2:
            self.log_test("Cursor Pagination - Page 2", False, str(response2), response_time2)
            return
        
        second_page_count = len(response2.get('data', []))
        
        # Validate pagination works
        if first_page_count == 0 or second_page_count == 0:
            self.log_test("Cursor Pagination", False, f"Empty pages: Page1={first_page_count}, Page2={second_page_count}", response_time1 + response_time2)
            return
        
        # Check for different content (no duplicates)
        first_page_ids = {story['id'] for story in response1.get('data', [])}
        second_page_ids = {story['id'] for story in response2.get('data', [])}
        
        if first_page_ids.intersection(second_page_ids):
            self.log_test("Cursor Pagination", False, "Duplicate stories found between pages", response_time1 + response_time2)
            return
        
        self.log_test("Cursor Pagination", True, f"Page1: {first_page_count} stories, Page2: {second_page_count} stories, No duplicates", response_time1 + response_time2)
    
    async def test_story_data_integrity(self):
        """Test Story Data Integrity - Validate story types and metadata"""
        success, response, response_time = await self.test_api_endpoint("/stories?limit=50")
        
        if not success:
            self.log_test("Story Data Integrity", False, str(response), response_time)
            return
        
        stories = response.get('data', [])
        
        # Count story types
        type_counts = {'moment': 0, 'product': 0, 'bts': 0}
        product_stories_with_id = 0
        expired_stories = 0
        current_time = int(time.time() * 1000)
        
        for story in stories:
            story_type = story.get('type')
            if story_type in type_counts:
                type_counts[story_type] += 1
            
            # Check product stories have productId
            if story_type == 'product' and 'productId' in story:
                product_stories_with_id += 1
            
            # Check expiry logic (24h simulation)
            expires_at = story.get('expiresAt', 0)
            if expires_at < current_time:
                expired_stories += 1
        
        # Validate distribution
        total_stories = len(stories)
        if total_stories == 0:
            self.log_test("Story Data Integrity", False, "No stories found", response_time)
            return
        
        # Check all story types are present
        missing_types = [t for t, count in type_counts.items() if count == 0]
        if missing_types:
            self.log_test("Story Data Integrity", False, f"Missing story types: {missing_types}", response_time)
            return
        
        # Validate product stories have productId
        if type_counts['product'] > 0 and product_stories_with_id != type_counts['product']:
            self.log_test("Story Data Integrity", False, f"Product stories without productId: {type_counts['product'] - product_stories_with_id}", response_time)
            return
        
        self.log_test("Story Data Integrity", True, f"Types: {type_counts}, Product IDs: {product_stories_with_id}/{type_counts['product']}, Expired: {expired_stories}", response_time)
    
    # 📊 PHASE 2 PERFORMANCE TESTING
    async def test_concurrent_story_requests(self):
        """Test Concurrent Story Requests - Test multiple simultaneous API calls for preloading"""
        concurrent_requests = 10
        
        async def make_request():
            return await self.test_api_endpoint("/stories?limit=10")
        
        start_time = time.time()
        
        # Execute concurrent requests
        tasks = [make_request() for _ in range(concurrent_requests)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        
        # Analyze results
        successful_requests = 0
        failed_requests = 0
        response_times = []
        
        for result in results:
            if isinstance(result, Exception):
                failed_requests += 1
            else:
                success, response, response_time = result
                if success:
                    successful_requests += 1
                    response_times.append(response_time)
                else:
                    failed_requests += 1
        
        success_rate = (successful_requests / concurrent_requests) * 100
        avg_response_time = statistics.mean(response_times) if response_times else 0
        
        if success_rate >= 90:  # 90% success rate threshold
            self.log_test("Concurrent Story Requests", True, f"Success rate: {success_rate:.1f}%, Avg response: {avg_response_time:.3f}s, Total time: {total_time:.3f}s", total_time)
        else:
            self.log_test("Concurrent Story Requests", False, f"Low success rate: {success_rate:.1f}%, Failed: {failed_requests}/{concurrent_requests}", total_time)
    
    async def test_large_dataset_handling(self):
        """Test Large Dataset Handling - Test pagination with different limit sizes"""
        limit_sizes = [10, 25, 50, 100]
        
        for limit in limit_sizes:
            success, response, response_time = await self.test_api_endpoint(f"/stories?limit={limit}")
            
            if not success:
                self.log_test(f"Large Dataset (limit={limit})", False, str(response), response_time)
                continue
            
            stories_count = len(response.get('data', []))
            has_cursor = response.get('cursor') is not None
            
            # Validate response
            if stories_count == 0:
                self.log_test(f"Large Dataset (limit={limit})", False, "No stories returned", response_time)
                continue
            
            self.log_test(f"Large Dataset (limit={limit})", True, f"Returned {stories_count} stories, Has cursor: {has_cursor}", response_time)
    
    async def test_response_time_validation(self):
        """Test Response Time Validation - Ensure sub-200ms response times for mobile UX"""
        endpoints = ["/creators", "/stories", "/stories/health"]
        fast_responses = 0
        total_tests = len(endpoints)
        
        for endpoint in endpoints:
            success, response, response_time = await self.test_api_endpoint(endpoint)
            
            if success and response_time < 0.2:  # Sub-200ms
                fast_responses += 1
                self.log_test(f"Response Time {endpoint}", True, f"{response_time*1000:.1f}ms (target: <200ms)", response_time)
            else:
                self.log_test(f"Response Time {endpoint}", False, f"{response_time*1000:.1f}ms (target: <200ms)", response_time)
        
        # Overall performance assessment
        performance_rate = (fast_responses / total_tests) * 100
        if performance_rate >= 80:  # 80% of endpoints should be fast
            self.log_test("Overall Response Time Performance", True, f"{performance_rate:.1f}% of endpoints under 200ms", 0)
        else:
            self.log_test("Overall Response Time Performance", False, f"Only {performance_rate:.1f}% of endpoints under 200ms", 0)
    
    async def test_error_handling(self):
        """Test Error Handling - Test invalid cursor and pagination edge cases"""
        error_test_cases = [
            ("/stories?cursor=invalid_cursor", "Invalid cursor handling"),
            ("/stories?limit=-1", "Negative limit handling"),
            ("/stories?limit=0", "Zero limit handling"),
            ("/stories?cursor=999999", "Out of range cursor handling"),
        ]
        
        for endpoint, test_name in error_test_cases:
            success, response, response_time = await self.test_api_endpoint(endpoint)
            
            # For error handling, we expect either success with graceful handling or proper error response
            if success:
                # Check if response is valid (graceful error handling)
                if isinstance(response, dict) and 'data' in response:
                    self.log_test(test_name, True, f"Graceful handling - returned valid response", response_time)
                else:
                    self.log_test(test_name, False, f"Invalid response structure", response_time)
            else:
                # Check if it's a proper error response (not a server crash)
                if "500" not in str(response):  # Not internal server error
                    self.log_test(test_name, True, f"Proper error response: {response}", response_time)
                else:
                    self.log_test(test_name, False, f"Server error: {response}", response_time)
    
    # 🛍️ COMMERCE INTEGRATION
    async def test_product_stories_validation(self):
        """Test Product Stories - Validate product-type stories include productId metadata"""
        success, response, response_time = await self.test_api_endpoint("/stories?limit=50")
        
        if not success:
            self.log_test("Product Stories Validation", False, str(response), response_time)
            return
        
        stories = response.get('data', [])
        product_stories = [story for story in stories if story.get('type') == 'product']
        
        if not product_stories:
            self.log_test("Product Stories Validation", False, "No product stories found", response_time)
            return
        
        # Validate all product stories have productId
        stories_with_product_id = [story for story in product_stories if 'productId' in story]
        
        if len(stories_with_product_id) != len(product_stories):
            missing_count = len(product_stories) - len(stories_with_product_id)
            self.log_test("Product Stories Validation", False, f"{missing_count} product stories missing productId", response_time)
            return
        
        # Validate productId format
        valid_product_ids = 0
        for story in stories_with_product_id:
            product_id = story.get('productId', '')
            if product_id.startswith('product_') and len(product_id) > 8:
                valid_product_ids += 1
        
        if valid_product_ids == len(stories_with_product_id):
            self.log_test("Product Stories Validation", True, f"All {len(product_stories)} product stories have valid productId", response_time)
        else:
            invalid_count = len(stories_with_product_id) - valid_product_ids
            self.log_test("Product Stories Validation", False, f"{invalid_count} product stories have invalid productId format", response_time)
    
    async def test_creator_product_mapping(self):
        """Test Creator-Product Mapping - Test product catalog per creator correlation"""
        # Get creators
        success1, creators_response, response_time1 = await self.test_api_endpoint("/creators")
        if not success1:
            self.log_test("Creator-Product Mapping", False, f"Failed to get creators: {creators_response}", response_time1)
            return
        
        # Get stories
        success2, stories_response, response_time2 = await self.test_api_endpoint("/stories?limit=100")
        if not success2:
            self.log_test("Creator-Product Mapping", False, f"Failed to get stories: {stories_response}", response_time2)
            return
        
        creators = creators_response
        stories = stories_response.get('data', [])
        
        # Map creators to their product stories
        creator_product_mapping = {}
        for story in stories:
            if story.get('type') == 'product':
                creator_id = story.get('creatorId')
                if creator_id not in creator_product_mapping:
                    creator_product_mapping[creator_id] = []
                creator_product_mapping[creator_id].append(story.get('productId'))
        
        # Validate mapping
        creators_with_products = len(creator_product_mapping)
        total_creators = len(creators)
        
        if creators_with_products == 0:
            self.log_test("Creator-Product Mapping", False, "No creators have product stories", response_time1 + response_time2)
            return
        
        # Check that product IDs are unique per creator
        unique_products_per_creator = {}
        for creator_id, product_ids in creator_product_mapping.items():
            unique_products_per_creator[creator_id] = len(set(product_ids))
        
        avg_products_per_creator = sum(unique_products_per_creator.values()) / len(unique_products_per_creator)
        
        self.log_test("Creator-Product Mapping", True, f"{creators_with_products}/{total_creators} creators have products, Avg {avg_products_per_creator:.1f} products/creator", response_time1 + response_time2)
    
    async def test_story_expiry_logic(self):
        """Test Story Expiry Logic - Validate 24h expiry simulation works correctly"""
        success, response, response_time = await self.test_api_endpoint("/stories?limit=50")
        
        if not success:
            self.log_test("Story Expiry Logic", False, str(response), response_time)
            return
        
        stories = response.get('data', [])
        current_time = int(time.time() * 1000)  # Current time in milliseconds
        
        # Analyze expiry times
        valid_expiry_stories = 0
        future_expiry_stories = 0
        expiry_times = []
        
        for story in stories:
            expires_at = story.get('expiresAt', 0)
            
            if expires_at > 0:
                valid_expiry_stories += 1
                expiry_times.append(expires_at)
                
                # Check if expiry is in the future (24h simulation)
                if expires_at > current_time:
                    future_expiry_stories += 1
        
        if valid_expiry_stories == 0:
            self.log_test("Story Expiry Logic", False, "No stories have expiry times", response_time)
            return
        
        # Calculate expiry range (should be around 24 hours from now)
        min_expiry = min(expiry_times)
        max_expiry = max(expiry_times)
        
        # 24 hours in milliseconds
        twenty_four_hours = 24 * 60 * 60 * 1000
        
        # Check if expiry times are reasonable (within 24-25 hours from now)
        reasonable_expiry_stories = 0
        for expires_at in expiry_times:
            time_until_expiry = expires_at - current_time
            if 0 < time_until_expiry <= (twenty_four_hours + 3600000):  # 24h + 1h buffer
                reasonable_expiry_stories += 1
        
        expiry_percentage = (reasonable_expiry_stories / valid_expiry_stories) * 100
        
        if expiry_percentage >= 90:  # 90% should have reasonable expiry times
            self.log_test("Story Expiry Logic", True, f"{expiry_percentage:.1f}% stories have valid 24h expiry, Future expiry: {future_expiry_stories}/{valid_expiry_stories}", response_time)
        else:
            self.log_test("Story Expiry Logic", False, f"Only {expiry_percentage:.1f}% stories have valid 24h expiry", response_time)
    
    async def run_all_tests(self):
        """Run all Phase 2 Infinity Stories tests"""
        print("🚀 PHASE 2 INFINITY STORIES BACKEND VALIDATION STARTING...")
        print(f"Testing against: {BASE_URL}")
        print("=" * 80)
        
        # 🎯 CORE STORIES API TESTING
        print("\n🎯 CORE STORIES API TESTING:")
        await self.test_creators_endpoint()
        await self.test_stories_endpoint()
        await self.test_stories_health_check()
        await self.test_cursor_pagination()
        await self.test_story_data_integrity()
        
        # 📊 PHASE 2 PERFORMANCE TESTING
        print("\n📊 PHASE 2 PERFORMANCE TESTING:")
        await self.test_concurrent_story_requests()
        await self.test_large_dataset_handling()
        await self.test_response_time_validation()
        await self.test_error_handling()
        
        # 🛍️ COMMERCE INTEGRATION
        print("\n🛍️ COMMERCE INTEGRATION:")
        await self.test_product_stories_validation()
        await self.test_creator_product_mapping()
        await self.test_story_expiry_logic()
        
        # Generate summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 80)
        print("🎯 PHASE 2 INFINITY STORIES BACKEND VALIDATION SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests}")
        print(f"   Failed: {failed_tests}")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        if self.performance_metrics:
            avg_response_time = statistics.mean(self.performance_metrics)
            max_response_time = max(self.performance_metrics)
            min_response_time = min(self.performance_metrics)
            
            print(f"\n⚡ PERFORMANCE METRICS:")
            print(f"   Average Response Time: {avg_response_time*1000:.1f}ms")
            print(f"   Fastest Response: {min_response_time*1000:.1f}ms")
            print(f"   Slowest Response: {max_response_time*1000:.1f}ms")
        
        # Show failed tests
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['details']}")
        
        # Series A readiness assessment
        print(f"\n🏆 SERIES A READINESS ASSESSMENT:")
        if success_rate >= 95:
            print("   ✅ EXCELLENT - Ready for Series A investor demonstrations")
        elif success_rate >= 90:
            print("   ✅ GOOD - Ready for Series A with minor improvements needed")
        elif success_rate >= 80:
            print("   ⚠️  ACCEPTABLE - Address critical issues before Series A")
        else:
            print("   ❌ NOT READY - Significant issues need resolution")
        
        print("=" * 80)

async def main():
    """Main test execution"""
    async with InfinityStoriesValidator() as validator:
        await validator.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())