#!/usr/bin/env python3
"""
Federated Search Endpoints Test
Focus on testing federated search functionality as requested
"""

import requests
import json
import sys
import time

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

class FederatedSearchTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
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
        
    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None, timeout: int = 10) -> tuple[bool, any]:
        """Make HTTP request and return (success, response_data)"""
        url = f"{BASE_URL}{endpoint}"
        
        # Add auth header if we have a token
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            start_time = time.time()
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=data, timeout=timeout)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=timeout)
            else:
                return False, f"Unsupported method: {method}"
            
            response_time = (time.time() - start_time) * 1000  # Convert to ms
                
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
        except requests.exceptions.Timeout:
            return False, f"Request timeout after {timeout}s"
        except Exception as e:
            return False, f"Request failed: {str(e)}"
    
    def setup_auth(self):
        """Setup authentication for protected endpoints"""
        print("🔐 Setting up authentication...")
        
        # Try to login with test user
        login_data = {
            "email": "buyer@aislemarts.com",
            "password": "password123"
        }
        
        success, data = self.make_request("POST", "/api/auth/login", login_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            print("✅ Authentication successful")
            return True
        else:
            print(f"❌ Authentication failed: {data}")
            return False
    
    def test_federated_search_health(self):
        """Test federated search health endpoint"""
        print("\n🔍 Testing Federated Search Health...")
        
        endpoints_to_test = [
            "/v1/search/health",
            "/api/v1/search/health",
            "/search/health"
        ]
        
        for endpoint in endpoints_to_test:
            success, data = self.make_request("GET", endpoint)
            
            if success and isinstance(data, dict):
                status = data.get("status", "unknown")
                features = data.get("features", [])
                self.log_test(f"Federated Search Health ({endpoint})", True, f"Status: {status}, Features: {len(features)}")
                return True
        
        self.log_test("Federated Search Health", False, "No working health endpoint found")
        return False
    
    def test_federated_search_query(self):
        """Test federated search query functionality"""
        print("\n🔍 Testing Federated Search Query...")
        
        search_endpoints = [
            "/v1/search",
            "/api/v1/search", 
            "/search"
        ]
        
        search_queries = [
            {"query": "electronics"},
            {"query": "headphones", "mode": "retail"},
            {"query": "laptop", "mode": "b2b"},
            {"q": "phone"}  # Alternative query parameter
        ]
        
        for endpoint in search_endpoints:
            for query_data in search_queries:
                # Try GET method
                success, data = self.make_request("GET", endpoint, query_data)
                
                if success and isinstance(data, dict):
                    results = data.get("results", data.get("products", []))
                    query_str = query_data.get("query", query_data.get("q", "unknown"))
                    self.log_test(f"Federated Search GET ({endpoint})", True, f"Query '{query_str}' returned {len(results)} results")
                    return True
                
                # Try POST method
                success, data = self.make_request("POST", endpoint, query_data)
                
                if success and isinstance(data, dict):
                    results = data.get("results", data.get("products", []))
                    query_str = query_data.get("query", query_data.get("q", "unknown"))
                    self.log_test(f"Federated Search POST ({endpoint})", True, f"Query '{query_str}' returned {len(results)} results")
                    return True
        
        self.log_test("Federated Search Query", False, "No working search endpoint found")
        return False
    
    def test_nearby_search(self):
        """Test nearby search functionality"""
        print("\n🔍 Testing Nearby Search...")
        
        # Test nearby health
        success, data = self.make_request("GET", "/v1/nearby/health")
        
        if success and isinstance(data, dict):
            status = data.get("status", "unknown")
            locations = data.get("locations_count", 0)
            inventory = data.get("inventory_count", 0)
            self.log_test("Nearby Search Health", True, f"Status: {status}, Locations: {locations}, Inventory: {inventory}")
        else:
            self.log_test("Nearby Search Health", False, str(data))
        
        # Test nearby search query
        nearby_search_data = {
            "latitude": -1.2685,
            "longitude": 36.8065,
            "radius": 5000,
            "query": "electronics"
        }
        
        success, data = self.make_request("POST", "/v1/nearby/search", nearby_search_data)
        
        if success and isinstance(data, dict):
            results = data.get("results", [])
            best_picks = data.get("best_picks", [])
            self.log_test("Nearby Search Query", True, f"Found {len(results)} results, {len(best_picks)} best picks")
        else:
            self.log_test("Nearby Search Query", False, str(data))
        
        # Test nearby locations
        success, data = self.make_request("GET", "/v1/nearby/locations", {
            "latitude": -1.2685,
            "longitude": 36.8065,
            "radius": 10000
        })
        
        if success and isinstance(data, dict):
            locations = data.get("locations", [])
            self.log_test("Nearby Locations", True, f"Found {len(locations)} nearby locations")
        else:
            self.log_test("Nearby Locations", False, str(data))
    
    def test_commerce_routes(self):
        """Test commerce routes (federated search system)"""
        print("\n🔍 Testing Commerce Routes...")
        
        # Test commerce health
        success, data = self.make_request("GET", "/commerce/health")
        
        if success and isinstance(data, dict):
            status = data.get("status", "unknown")
            self.log_test("Commerce Health", True, f"Status: {status}")
        else:
            self.log_test("Commerce Health", False, str(data))
        
        # Test commerce search
        commerce_search_data = {
            "query": "electronics",
            "filters": {
                "category": "electronics",
                "price_range": {"min": 0, "max": 1000}
            }
        }
        
        success, data = self.make_request("POST", "/commerce/search", commerce_search_data)
        
        if success and isinstance(data, dict):
            results = data.get("results", [])
            self.log_test("Commerce Search", True, f"Found {len(results)} commerce results")
        else:
            self.log_test("Commerce Search", False, str(data))
    
    def test_search_suggestions(self):
        """Test search suggestions and autocomplete"""
        print("\n🔍 Testing Search Suggestions...")
        
        suggestion_endpoints = [
            "/v1/search/suggestions",
            "/api/v1/search/suggestions",
            "/search/suggestions"
        ]
        
        for endpoint in suggestion_endpoints:
            success, data = self.make_request("GET", endpoint, {"q": "elect"})
            
            if success and isinstance(data, dict):
                suggestions = data.get("suggestions", [])
                self.log_test(f"Search Suggestions ({endpoint})", True, f"Found {len(suggestions)} suggestions for 'elect'")
                return True
        
        self.log_test("Search Suggestions", False, "No working suggestions endpoint found")
    
    def test_product_offers(self):
        """Test product offers comparison"""
        print("\n🔍 Testing Product Offers...")
        
        # First get a product ID
        success, products_data = self.make_request("GET", "/api/products")
        
        if success and isinstance(products_data, list) and len(products_data) > 0:
            product_id = products_data[0].get("id") or products_data[0].get("_id")
            
            if product_id:
                # Test offers endpoint
                offers_endpoints = [
                    f"/v1/products/{product_id}/offers",
                    f"/api/v1/products/{product_id}/offers"
                ]
                
                for endpoint in offers_endpoints:
                    success, data = self.make_request("GET", endpoint)
                    
                    if success and isinstance(data, dict):
                        offers = data.get("offers", [])
                        self.log_test(f"Product Offers ({endpoint})", True, f"Found {len(offers)} offers for product")
                        return True
        
        self.log_test("Product Offers", False, "Could not test product offers")
    
    def test_barcode_scanning(self):
        """Test barcode scanning functionality"""
        print("\n🔍 Testing Barcode Scanning...")
        
        # Test barcode scan endpoint
        barcode_data = {
            "gtin": "0840244706610",  # Sample GTIN
            "location": {
                "latitude": -1.2685,
                "longitude": 36.8065
            }
        }
        
        success, data = self.make_request("POST", "/v1/nearby/scan", barcode_data)
        
        if success and isinstance(data, dict):
            product = data.get("product", {})
            offers = data.get("offers", [])
            self.log_test("Barcode Scanning", True, f"Scanned product: {product.get('title', 'Unknown')}, {len(offers)} offers")
        else:
            self.log_test("Barcode Scanning", False, str(data))
    
    def run_all_tests(self):
        """Run all federated search tests"""
        print(f"🚀 Starting Federated Search Endpoints Test")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 60)
        
        # Setup authentication
        auth_ok = self.setup_auth()
        
        # Core federated search tests
        self.test_federated_search_health()
        self.test_federated_search_query()
        
        # Nearby search tests
        self.test_nearby_search()
        
        # Commerce routes tests
        self.test_commerce_routes()
        
        # Additional search features
        self.test_search_suggestions()
        self.test_product_offers()
        self.test_barcode_scanning()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 FEDERATED SEARCH TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"✅ Passed: {passed}/{total} tests ({success_rate:.1f}%)")
        
        if success_rate >= 80:
            print("🟢 FEDERATED SEARCH STATUS: HEALTHY - Search endpoints functioning well")
        elif success_rate >= 60:
            print("🟡 FEDERATED SEARCH STATUS: WARNING - Some search issues detected")
        else:
            print("🔴 FEDERATED SEARCH STATUS: CRITICAL - Major search issues detected")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        return success_rate >= 70

if __name__ == "__main__":
    tester = FederatedSearchTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)