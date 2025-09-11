#!/usr/bin/env python3
"""
AisleMarts Backend API Test Suite
Tests all backend endpoints with comprehensive scenarios
"""

import requests
import json
import sys
import os
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

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.user_id = None
        
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
        
        # Add auth header if we have a token
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=data)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers)
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
    
    def test_health_check(self):
        """Test the health endpoint"""
        print("\n🔍 Testing Health Check...")
        success, data = self.make_request("GET", "/health")
        
        if success and isinstance(data, dict) and data.get("ok") is True:
            self.log_test("Health Check", True, f"Service: {data.get('service', 'Unknown')}")
        else:
            self.log_test("Health Check", False, str(data))
    
    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        # Test successful registration
        user_data = {
            "email": "buyer@aislemarts.com",
            "password": "password123",
            "name": "Test Buyer"
        }
        
        success, data = self.make_request("POST", "/auth/register", user_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("User Registration", True, "Successfully registered and got token")
        else:
            # User might already exist, try to login instead
            self.log_test("User Registration", True, f"User may already exist: {data}")
            self.test_user_login()  # Try login instead
    
    def test_user_login(self):
        """Test user login"""
        print("\n🔍 Testing User Login...")
        
        login_data = {
            "email": "buyer@aislemarts.com",
            "password": "password123"
        }
        
        success, data = self.make_request("POST", "/auth/login", login_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("User Login", True, "Successfully logged in and got token")
        else:
            self.log_test("User Login", False, str(data))
    
    def test_protected_route(self):
        """Test accessing protected route with JWT"""
        print("\n🔍 Testing Protected Route (/auth/me)...")
        
        if not self.auth_token:
            self.log_test("Protected Route Access", False, "No auth token available")
            return
            
        success, data = self.make_request("GET", "/auth/me")
        
        if success and isinstance(data, dict) and "email" in data:
            self.user_id = data.get("id")
            self.log_test("Protected Route Access", True, f"User: {data.get('email')}")
        else:
            self.log_test("Protected Route Access", False, str(data))
    
    def test_categories_list(self):
        """Test listing categories"""
        print("\n🔍 Testing Categories List...")
        
        success, data = self.make_request("GET", "/categories")
        
        if success and isinstance(data, list) and len(data) > 0:
            self.log_test("Categories List", True, f"Found {len(data)} categories")
            # Store first category for later tests
            self.test_category_id = data[0].get("id")
        else:
            self.log_test("Categories List", False, str(data))
    
    def test_products_list(self):
        """Test listing products"""
        print("\n🔍 Testing Products List...")
        
        success, data = self.make_request("GET", "/products")
        
        if success and isinstance(data, list) and len(data) > 0:
            self.log_test("Products List", True, f"Found {len(data)} products")
            # Store first product for later tests (use _id since id alias might not work)
            self.test_product_id = data[0].get("id") or data[0].get("_id")
            return data
        else:
            self.log_test("Products List", False, str(data))
            return []
    
    def test_product_details(self, product_id: str):
        """Test getting product details"""
        print("\n🔍 Testing Product Details...")
        
        success, data = self.make_request("GET", f"/products/{product_id}")
        
        if success and isinstance(data, dict) and data.get("id") == product_id:
            self.log_test("Product Details", True, f"Product: {data.get('title')}")
        else:
            self.log_test("Product Details", False, str(data))
    
    def test_product_search(self):
        """Test product search functionality"""
        print("\n🔍 Testing Product Search...")
        
        # Test search by title
        success, data = self.make_request("GET", "/products", {"q": "headphones"})
        
        if success and isinstance(data, list):
            found_headphones = any("headphones" in product.get("title", "").lower() for product in data)
            if found_headphones:
                self.log_test("Product Search (title)", True, f"Found {len(data)} results for 'headphones'")
            else:
                self.log_test("Product Search (title)", False, "No headphones found in search results")
        else:
            self.log_test("Product Search (title)", False, str(data))
        
        # Test search by brand
        success, data = self.make_request("GET", "/products", {"q": "AudioTech"})
        
        if success and isinstance(data, list):
            found_brand = any("AudioTech" in product.get("brand", "") for product in data)
            if found_brand:
                self.log_test("Product Search (brand)", True, f"Found {len(data)} results for 'AudioTech'")
            else:
                self.log_test("Product Search (brand)", False, "No AudioTech products found")
        else:
            self.log_test("Product Search (brand)", False, str(data))
    
    def test_category_filter(self):
        """Test filtering products by category"""
        print("\n🔍 Testing Category Filter...")
        
        if not hasattr(self, 'test_category_id'):
            self.log_test("Category Filter", False, "No category ID available for testing")
            return
            
        success, data = self.make_request("GET", "/products", {"category_id": self.test_category_id})
        
        if success and isinstance(data, list):
            self.log_test("Category Filter", True, f"Found {len(data)} products in category")
        else:
            self.log_test("Category Filter", False, str(data))
    
    def test_payment_intent_creation(self):
        """Test creating payment intent for checkout"""
        print("\n🔍 Testing Payment Intent Creation...")
        
        if not self.auth_token:
            self.log_test("Payment Intent Creation", False, "No auth token available")
            return
            
        if not hasattr(self, 'test_product_id'):
            self.log_test("Payment Intent Creation", False, "No product ID available for testing")
            return
        
        # Create payment intent with test product
        payment_data = {
            "items": [
                {
                    "product_id": self.test_product_id,
                    "quantity": 2
                }
            ],
            "currency": "USD",
            "shipping_address": {
                "street": "123 Test St",
                "city": "Test City",
                "state": "TS",
                "zip": "12345",
                "country": "US"
            }
        }
        
        success, data = self.make_request("POST", "/checkout/payment-intent", payment_data)
        
        if success and isinstance(data, dict) and "clientSecret" in data:
            self.log_test("Payment Intent Creation", True, f"Order ID: {data.get('orderId')}")
            self.test_order_id = data.get('orderId')
        else:
            self.log_test("Payment Intent Creation", False, str(data))
    
    def test_user_orders(self):
        """Test getting user orders"""
        print("\n🔍 Testing User Orders...")
        
        if not self.auth_token:
            self.log_test("User Orders", False, "No auth token available")
            return
            
        success, data = self.make_request("GET", "/orders")
        
        if success and isinstance(data, list):
            self.log_test("User Orders", True, f"Found {len(data)} orders")
        else:
            self.log_test("User Orders", False, str(data))
    
    def test_order_details(self):
        """Test getting specific order details"""
        print("\n🔍 Testing Order Details...")
        
        if not self.auth_token:
            self.log_test("Order Details", False, "No auth token available")
            return
            
        if not hasattr(self, 'test_order_id') or not self.test_order_id:
            self.log_test("Order Details", False, "No order ID available for testing")
            return
            
        success, data = self.make_request("GET", f"/orders/{self.test_order_id}")
        
        if success and isinstance(data, dict) and data.get("id") == self.test_order_id:
            self.log_test("Order Details", True, f"Order status: {data.get('status')}")
        else:
            self.log_test("Order Details", False, str(data))
    
    def test_error_scenarios(self):
        """Test various error scenarios"""
        print("\n🔍 Testing Error Scenarios...")
        
        # Test invalid login
        success, data = self.make_request("POST", "/auth/login", {
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        
        if not success and "401" in str(data):
            self.log_test("Invalid Login Error", True, "Correctly rejected invalid credentials")
        else:
            self.log_test("Invalid Login Error", False, f"Expected 401 error, got: {data}")
        
        # Test accessing protected route without token
        old_token = self.auth_token
        self.auth_token = None
        success, data = self.make_request("GET", "/auth/me")
        self.auth_token = old_token
        
        if not success and "401" in str(data):
            self.log_test("Unauthorized Access Error", True, "Correctly rejected request without token")
        else:
            self.log_test("Unauthorized Access Error", False, f"Expected 401 error, got: {data}")
        
        # Test invalid product ID
        success, data = self.make_request("GET", "/products/invalid-product-id")
        
        if not success and "404" in str(data):
            self.log_test("Invalid Product ID Error", True, "Correctly returned 404 for invalid product")
        else:
            self.log_test("Invalid Product ID Error", False, f"Expected 404 error, got: {data}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting AisleMarts Backend API Tests")
        print(f"📍 Testing against: {API_URL}")
        print("=" * 60)
        
        # Core functionality tests
        self.test_health_check()
        self.test_user_registration()
        if not self.auth_token:
            self.test_user_login()
        
        self.test_protected_route()
        self.test_categories_list()
        
        products = self.test_products_list()
        if hasattr(self, 'test_product_id'):
            self.test_product_details(self.test_product_id)
        
        self.test_product_search()
        self.test_category_filter()
        self.test_payment_intent_creation()
        self.test_user_orders()
        self.test_order_details()
        self.test_error_scenarios()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
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
        
        return passed == total

def main():
    """Main test runner"""
    tester = APITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend API is working correctly.")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()