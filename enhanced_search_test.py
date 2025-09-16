#!/usr/bin/env python3
"""
Enhanced Search Backend Test Suite
Tests Phase 1 Enhanced Search/Discovery APIs
"""

import requests
import json
import sys
import time
from typing import Dict, Any, Optional

# Get the backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        pass
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

class EnhancedSearchTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple[bool, Any]:
        """Make HTTP request and return (success, response_data)"""
        url = f"{API_URL}{endpoint}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=data)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers)
            else:
                return False, f"Unsupported method: {method}"
                
            if response.status_code < 400:
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                try:
                    error_data = response.json()
                    return False, f"HTTP {response.status_code}: {error_data}"
                except:
                    return False, f"HTTP {response.status_code}: {response.text}"
                    
        except requests.exceptions.ConnectionError:
            return False, "Connection failed - backend server may not be running"
        except Exception as e:
            return False, f"Request failed: {str(e)}"
    
    def test_enhanced_search_system_health(self):
        """Test Enhanced Search System Health Check"""
        print("\n⚡ Testing Enhanced Search System Health...")
        
        success, data = self.make_request("GET", "/v1/search/health")
        
        if success and isinstance(data, dict) and data.get("status") == "healthy":
            database_stats = data.get("database", {})
            cache_stats = data.get("cache", {})
            features = data.get("features", {})
            
            products_count = database_stats.get("products", 0)
            merchants_count = database_stats.get("merchants", 0)
            offers_count = database_stats.get("offers", 0)
            redis_connected = cache_stats.get("redis_connected", False)
            
            details = f"Products: {products_count}, Merchants: {merchants_count}, Offers: {offers_count}, Redis: {redis_connected}"
            self.log_test("Enhanced Search System Health", True, details)
        else:
            self.log_test("Enhanced Search System Health", False, str(data))
    
    def test_enhanced_search_initialization(self):
        """Test Enhanced Search System Initialization"""
        print("\n⚡ Testing Enhanced Search System Initialization...")
        
        success, data = self.make_request("POST", "/v1/search/initialize")
        
        if success and isinstance(data, dict) and data.get("status") == "success":
            actions = data.get("actions", [])
            self.log_test("Enhanced Search System Initialization", True, f"Completed {len(actions)} initialization actions")
        else:
            self.log_test("Enhanced Search System Initialization", False, str(data))
    
    def test_enhanced_search_api(self):
        """Test Enhanced Search API with multilingual support"""
        print("\n⚡ Testing Enhanced Search API...")
        
        # Test 1: Basic smartphone search in English
        success, data = self.make_request("GET", "/v1/search", {
            "q": "smartphone",
            "mode": "retail",
            "lang": "en",
            "page": 1,
            "limit": 10
        })
        
        if success and isinstance(data, dict) and "results" in data:
            results_count = len(data.get("results", []))
            query = data.get("query", "")
            mode = data.get("mode", "")
            self.log_test("Enhanced Search API (English Smartphone)", True, f"Query: '{query}', Mode: {mode}, Results: {results_count}")
        else:
            self.log_test("Enhanced Search API (English Smartphone)", False, str(data))
        
        # Test 2: Swahili search
        success, data = self.make_request("GET", "/v1/search", {
            "q": "simu",
            "mode": "retail", 
            "lang": "sw",
            "page": 1,
            "limit": 5
        })
        
        if success and isinstance(data, dict):
            results_count = len(data.get("results", []))
            self.log_test("Enhanced Search API (Swahili)", True, f"Swahili search for 'simu' returned {results_count} results")
        else:
            self.log_test("Enhanced Search API (Swahili)", False, str(data))
        
        # Test 3: B2B mode search
        success, data = self.make_request("GET", "/v1/search", {
            "q": "laptop",
            "mode": "b2b",
            "lang": "en",
            "page": 1,
            "limit": 5
        })
        
        if success and isinstance(data, dict):
            results_count = len(data.get("results", []))
            mode = data.get("mode", "")
            self.log_test("Enhanced Search API (B2B Mode)", True, f"B2B search returned {results_count} results")
        else:
            self.log_test("Enhanced Search API (B2B Mode)", False, str(data))
    
    def test_product_offers_comparison(self):
        """Test Product Offers Comparison API"""
        print("\n⚡ Testing Product Offers Comparison...")
        
        # First get a product ID from products list
        success, products_data = self.make_request("GET", "/products", {"limit": 1})
        
        if not success or not isinstance(products_data, list) or len(products_data) == 0:
            self.log_test("Product Offers Comparison", False, "No products available for testing")
            return
        
        product_id = products_data[0].get("id") or products_data[0].get("_id")
        if not product_id:
            self.log_test("Product Offers Comparison", False, "Could not get product ID")
            return
        
        # Test offers endpoint
        success, data = self.make_request("GET", f"/v1/products/{product_id}/offers")
        
        if success and isinstance(data, dict) and "offers" in data:
            offers_count = data.get("total_offers", 0)
            product_id_returned = data.get("product_id", "")
            self.log_test("Product Offers Comparison", True, f"Product {product_id_returned} has {offers_count} offers")
        else:
            self.log_test("Product Offers Comparison", False, str(data))
    
    def test_search_suggestions(self):
        """Test Search Suggestions API"""
        print("\n⚡ Testing Search Suggestions...")
        
        # Test English suggestions
        success, data = self.make_request("GET", "/v1/search/suggestions", {
            "q": "smart",
            "lang": "en",
            "limit": 5
        })
        
        if success and isinstance(data, dict) and "suggestions" in data:
            suggestions_count = len(data.get("suggestions", []))
            query = data.get("query", "")
            self.log_test("Search Suggestions (English)", True, f"Query '{query}' returned {suggestions_count} suggestions")
        else:
            self.log_test("Search Suggestions (English)", False, str(data))
        
        # Test Swahili suggestions
        success, data = self.make_request("GET", "/v1/search/suggestions", {
            "q": "si",
            "lang": "sw",
            "limit": 3
        })
        
        if success and isinstance(data, dict):
            suggestions_count = len(data.get("suggestions", []))
            self.log_test("Search Suggestions (Swahili)", True, f"Swahili suggestions: {suggestions_count}")
        else:
            self.log_test("Search Suggestions (Swahili)", False, str(data))
    
    def test_search_analytics(self):
        """Test Search Analytics API"""
        print("\n⚡ Testing Search Analytics...")
        
        success, data = self.make_request("GET", "/v1/search/analytics")
        
        if success and isinstance(data, dict) and "cache" in data and "database" in data:
            cache_stats = data.get("cache", {})
            db_stats = data.get("database", {})
            
            hit_rate = cache_stats.get("hit_rate", 0)
            products_count = db_stats.get("products", 0)
            system_health = data.get("system_health", "unknown")
            
            self.log_test("Search Analytics", True, f"Cache hit rate: {hit_rate:.1f}%, Products: {products_count}, Health: {system_health}")
        else:
            self.log_test("Search Analytics", False, str(data))
    
    def test_cache_management(self):
        """Test Redis Cache Management"""
        print("\n⚡ Testing Cache Management...")
        
        # Test cache warming
        success, data = self.make_request("POST", "/v1/search/warm-cache", [
            {"query": "smartphone", "mode": "retail", "lang": "en"},
            {"query": "laptop", "mode": "all", "lang": "en"}
        ])
        
        if success and isinstance(data, dict) and data.get("status") == "success":
            warmed_count = data.get("message", "").split()[1] if "Pre-warmed" in data.get("message", "") else "0"
            self.log_test("Cache Warming", True, f"Pre-warmed {warmed_count} queries")
        else:
            self.log_test("Cache Warming", False, str(data))
        
        # Test cache clearing
        success, data = self.make_request("DELETE", "/v1/search/cache")
        
        if success and isinstance(data, dict) and data.get("status") == "success":
            self.log_test("Cache Clearing", True, "Cache cleared successfully")
        else:
            self.log_test("Cache Clearing", False, str(data))
    
    def test_multilingual_search(self):
        """Test Multilingual Search Capabilities"""
        print("\n⚡ Testing Multilingual Search...")
        
        languages = [
            ("en", "headphones", "English"),
            ("sw", "simu", "Swahili"),
            ("ar", "هاتف", "Arabic"),
            ("tr", "telefon", "Turkish")
        ]
        
        successful_searches = 0
        total_searches = len(languages)
        
        for lang_code, query, lang_name in languages:
            success, data = self.make_request("GET", "/v1/search", {
                "q": query,
                "mode": "all",
                "lang": lang_code,
                "limit": 3
            })
            
            if success and isinstance(data, dict):
                results_count = len(data.get("results", []))
                successful_searches += 1
                print(f"   ✅ {lang_name} ({lang_code}): '{query}' → {results_count} results")
            else:
                print(f"   ❌ {lang_name} ({lang_code}): '{query}' → Failed")
        
        success_rate = (successful_searches / total_searches) * 100
        if success_rate >= 75:  # 75% success rate threshold
            self.log_test("Multilingual Search", True, f"Success rate: {success_rate:.1f}% ({successful_searches}/{total_searches})")
        else:
            self.log_test("Multilingual Search", False, f"Low success rate: {success_rate:.1f}%")
    
    def test_best_pick_scoring(self):
        """Test Best Pick Scoring Algorithm"""
        print("\n⚡ Testing Best Pick Scoring Algorithm...")
        
        # Search for a product that should have multiple offers
        success, data = self.make_request("GET", "/v1/search", {
            "q": "smartphone",
            "mode": "retail",
            "lang": "en",
            "limit": 5
        })
        
        if success and isinstance(data, dict) and "results" in data:
            results = data.get("results", [])
            
            if len(results) > 0:
                # Check first result for Best Pick data
                first_result = results[0]
                best_pick = first_result.get("best_pick", {})
                
                if best_pick:
                    score = best_pick.get("score", 0)
                    reasons = best_pick.get("reasons", [])
                    explanation = best_pick.get("explanation", "")
                    price = best_pick.get("price_minor", 0)
                    currency = best_pick.get("currency", "")
                    
                    details = f"Score: {score:.2f}, Reasons: {len(reasons)}, Price: {price/100:.2f} {currency}"
                    self.log_test("Best Pick Scoring Algorithm", True, details)
                else:
                    self.log_test("Best Pick Scoring Algorithm", False, "No Best Pick data in search results")
            else:
                self.log_test("Best Pick Scoring Algorithm", False, "No search results to analyze")
        else:
            self.log_test("Best Pick Scoring Algorithm", False, str(data))
    
    def test_search_performance(self):
        """Test Search Performance and Response Times"""
        print("\n⚡ Testing Search Performance...")
        
        # Test search response time
        start_time = time.time()
        success, data = self.make_request("GET", "/v1/search", {
            "q": "laptop computer",
            "mode": "retail",
            "lang": "en",
            "limit": 24
        })
        end_time = time.time()
        
        response_time_ms = (end_time - start_time) * 1000
        
        if success and isinstance(data, dict) and "results" in data:
            results_count = len(data.get("results", []))
            total_results = data.get("total", 0)
            
            # Check if response time meets target (< 500ms p95)
            performance_ok = response_time_ms < 500
            
            details = f"Response time: {response_time_ms:.0f}ms, Results: {results_count}/{total_results}"
            self.log_test("Search Performance", performance_ok, details)
        else:
            self.log_test("Search Performance", False, f"Search failed in {response_time_ms:.0f}ms")
        
        # Test cache performance (second identical request should be faster)
        start_time = time.time()
        success, data = self.make_request("GET", "/v1/search", {
            "q": "laptop computer",
            "mode": "retail", 
            "lang": "en",
            "limit": 24
        })
        end_time = time.time()
        
        cached_response_time_ms = (end_time - start_time) * 1000
        
        if success:
            cache_improvement = response_time_ms - cached_response_time_ms
            details = f"Cached response: {cached_response_time_ms:.0f}ms (improvement: {cache_improvement:.0f}ms)"
            self.log_test("Search Cache Performance", True, details)
        else:
            self.log_test("Search Cache Performance", False, "Cached request failed")
    
    def run_enhanced_search_tests(self):
        """Run all Enhanced Search tests"""
        print("⚡💙 PHASE 1 ENHANCED SEARCH/DISCOVERY BACKEND TESTING")
        print(f"🔗 Testing against: {BASE_URL}")
        print("=" * 80)
        
        # Enhanced Search System Tests
        self.test_enhanced_search_system_health()
        self.test_enhanced_search_initialization()
        self.test_enhanced_search_api()
        self.test_product_offers_comparison()
        self.test_search_suggestions()
        self.test_search_analytics()
        self.test_cache_management()
        self.test_multilingual_search()
        self.test_best_pick_scoring()
        self.test_search_performance()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 ENHANCED SEARCH TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['details']}")
        
        print(f"\n🎯 Success Rate: {(passed/total)*100:.1f}%")
        
        return passed, total

def main():
    """Main test runner"""
    tester = EnhancedSearchTester()
    passed, total = tester.run_enhanced_search_tests()
    
    # Exit with appropriate code
    sys.exit(0 if passed == total else 1)

if __name__ == "__main__":
    main()