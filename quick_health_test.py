#!/usr/bin/env python3
"""
Quick Backend Health Check for AisleMarts API
Focus on basic health, MongoDB connectivity, and federated search endpoints
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
API_URL = f"{BASE_URL}/api"

class QuickHealthTester:
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
        url = f"{API_URL}{endpoint}"
        
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
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=headers, timeout=timeout)
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
    
    def test_basic_health_check(self):
        """Test the basic health endpoint"""
        print("\n🔍 Testing Basic Health Check...")
        success, data = self.make_request("GET", "/health")
        
        if success and isinstance(data, dict) and data.get("ok") is True:
            service_name = data.get("service", "Unknown")
            self.log_test("Basic Health Check", True, f"Service: {service_name}")
            return True
        else:
            self.log_test("Basic Health Check", False, str(data))
            return False
    
    def test_mongodb_connectivity(self):
        """Test MongoDB connectivity through categories endpoint"""
        print("\n🔍 Testing MongoDB Connectivity...")
        success, data = self.make_request("GET", "/categories")
        
        if success and isinstance(data, list):
            self.log_test("MongoDB Connectivity", True, f"Found {len(data)} categories")
            return True
        else:
            self.log_test("MongoDB Connectivity", False, str(data))
            return False
    
    def test_user_authentication(self):
        """Test user authentication system"""
        print("\n🔍 Testing User Authentication...")
        
        # Try to login with test user
        login_data = {
            "email": "buyer@aislemarts.com",
            "password": "password123"
        }
        
        success, data = self.make_request("POST", "/auth/login", login_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("User Authentication", True, "Successfully logged in and got JWT token")
            return True
        else:
            # Try to register if login fails
            register_data = {
                "email": "buyer@aislemarts.com",
                "password": "password123",
                "name": "Test Buyer"
            }
            
            success, data = self.make_request("POST", "/auth/register", register_data)
            
            if success and isinstance(data, dict) and "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("User Authentication", True, "Successfully registered and got JWT token")
                return True
            else:
                self.log_test("User Authentication", False, str(data))
                return False
    
    def test_protected_routes(self):
        """Test protected routes with JWT"""
        print("\n🔍 Testing Protected Routes...")
        
        if not self.auth_token:
            self.log_test("Protected Routes", False, "No auth token available")
            return False
            
        success, data = self.make_request("GET", "/auth/me")
        
        if success and isinstance(data, dict) and "email" in data:
            user_id = data.get("id") or data.get("_id")
            self.user_id = user_id
            self.log_test("Protected Routes", True, f"User: {data.get('email')}, ID: {user_id}")
            return True
        else:
            self.log_test("Protected Routes", False, str(data))
            return False
    
    def test_main_api_routes(self):
        """Test main API routes accessibility"""
        print("\n🔍 Testing Main API Routes...")
        
        routes_to_test = [
            ("/products", "GET", "Products API"),
            ("/categories", "GET", "Categories API"),
            ("/orders", "GET", "Orders API (requires auth)")
        ]
        
        all_passed = True
        
        for endpoint, method, description in routes_to_test:
            success, data = self.make_request(method, endpoint)
            
            if success and isinstance(data, list):
                self.log_test(f"Main API Route - {description}", True, f"Endpoint accessible, returned {len(data)} items")
            elif success:
                self.log_test(f"Main API Route - {description}", True, "Endpoint accessible")
            else:
                self.log_test(f"Main API Route - {description}", False, str(data))
                all_passed = False
        
        return all_passed
    
    def test_federated_search_endpoints(self):
        """Test federated search endpoints"""
        print("\n🔍 Testing Federated Search Endpoints...")
        
        # Test search health check
        success, data = self.make_request("GET", "/v1/search/health")
        
        if success and isinstance(data, dict):
            status = data.get("status", "unknown")
            self.log_test("Federated Search Health", True, f"Status: {status}")
        else:
            self.log_test("Federated Search Health", False, str(data))
        
        # Test basic search
        search_data = {"query": "electronics", "mode": "retail"}
        success, data = self.make_request("POST", "/v1/search", search_data)
        
        if success and isinstance(data, dict):
            results = data.get("results", [])
            self.log_test("Federated Search Query", True, f"Found {len(results)} search results")
        else:
            self.log_test("Federated Search Query", False, str(data))
        
        # Test nearby search health
        success, data = self.make_request("GET", "/v1/nearby/health")
        
        if success and isinstance(data, dict):
            status = data.get("status", "unknown")
            locations = data.get("locations_count", 0)
            self.log_test("Nearby Search Health", True, f"Status: {status}, Locations: {locations}")
        else:
            self.log_test("Nearby Search Health", False, str(data))
    
    def test_ai_endpoints(self):
        """Test AI endpoints"""
        print("\n🔍 Testing AI Endpoints...")
        
        # Test AI chat
        chat_data = {"message": "Hello, I need help finding products"}
        success, data = self.make_request("POST", "/ai/chat", chat_data, headers={})
        
        if success and isinstance(data, dict) and "response" in data:
            self.log_test("AI Chat Endpoint", True, "AI chat responding correctly")
        else:
            self.log_test("AI Chat Endpoint", False, str(data))
        
        # Test AI locale detection
        success, data = self.make_request("GET", "/ai/locale-detection")
        
        if success and isinstance(data, dict) and "country" in data:
            country = data.get("country")
            currency = data.get("currency")
            self.log_test("AI Locale Detection", True, f"Country: {country}, Currency: {currency}")
        else:
            self.log_test("AI Locale Detection", False, str(data))
    
    def test_avatar_endpoint(self):
        """Test avatar endpoint functionality"""
        print("\n🔍 Testing Avatar Endpoint...")
        
        if not self.auth_token or not hasattr(self, 'user_id') or not self.user_id:
            self.log_test("Avatar Endpoint", False, "No auth token or user ID available")
            return
        
        # Test avatar update
        avatar_data = {"role": "buyer"}
        success, data = self.make_request("PATCH", f"/users/{self.user_id}/avatar", avatar_data)
        
        if success and isinstance(data, dict) and data.get("role") == "buyer":
            is_setup = data.get("isAvatarSetup", False)
            self.log_test("Avatar Endpoint", True, f"Avatar updated successfully, Setup: {is_setup}")
        else:
            self.log_test("Avatar Endpoint", False, str(data))
    
    def test_critical_errors(self):
        """Check for critical system errors"""
        print("\n🔍 Testing for Critical Errors...")
        
        # Test invalid endpoints to check error handling
        success, data = self.make_request("GET", "/invalid-endpoint")
        
        if not success and ("404" in str(data) or "not found" in str(data).lower()):
            self.log_test("Error Handling", True, "404 errors handled correctly")
        else:
            self.log_test("Error Handling", False, "Error handling may have issues")
        
        # Test unauthorized access
        old_token = self.auth_token
        self.auth_token = None
        success, data = self.make_request("GET", "/auth/me")
        self.auth_token = old_token
        
        if not success and "401" in str(data):
            self.log_test("Authorization Check", True, "Unauthorized access properly blocked")
        else:
            self.log_test("Authorization Check", False, "Authorization may have issues")
    
    def run_all_tests(self):
        """Run all health check tests"""
        print(f"🚀 Starting Quick Backend Health Check for AisleMarts API")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 60)
        
        # Core health tests
        health_ok = self.test_basic_health_check()
        if not health_ok:
            print("\n❌ CRITICAL: Basic health check failed - backend may not be running")
            return False
        
        mongodb_ok = self.test_mongodb_connectivity()
        if not mongodb_ok:
            print("\n❌ CRITICAL: MongoDB connectivity failed")
            return False
        
        # Authentication tests
        auth_ok = self.test_user_authentication()
        if auth_ok:
            self.test_protected_routes()
            self.test_avatar_endpoint()
        
        # API route tests
        self.test_main_api_routes()
        
        # Federated search tests
        self.test_federated_search_endpoints()
        
        # AI endpoints tests
        self.test_ai_endpoints()
        
        # Error handling tests
        self.test_critical_errors()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 QUICK HEALTH CHECK SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"✅ Passed: {passed}/{total} tests ({success_rate:.1f}%)")
        
        if success_rate >= 80:
            print("🟢 OVERALL STATUS: HEALTHY - Backend is functioning well")
        elif success_rate >= 60:
            print("🟡 OVERALL STATUS: WARNING - Some issues detected")
        else:
            print("🔴 OVERALL STATUS: CRITICAL - Major issues detected")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        return success_rate >= 80

if __name__ == "__main__":
    tester = QuickHealthTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)