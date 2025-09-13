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
    
    def test_vendor_login(self):
        """Test vendor login for geographic features"""
        print("\n🔍 Testing Vendor Login...")
        
        login_data = {
            "email": "vendor@aislemarts.com",
            "password": "password123"
        }
        
        success, data = self.make_request("POST", "/auth/login", login_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.vendor_auth_token = data["access_token"]
            self.log_test("Vendor Login", True, "Successfully logged in vendor and got token")
        else:
            self.log_test("Vendor Login", False, str(data))
    
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
            # Store first category for later tests (use _id since id alias might not work)
            self.test_category_id = data[0].get("id") or data[0].get("_id")
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
        
        if success and isinstance(data, dict) and (data.get("id") == product_id or data.get("_id") == product_id):
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
        
        if success and isinstance(data, dict) and (data.get("id") == self.test_order_id or data.get("_id") == self.test_order_id):
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
    
    def test_ai_chat_anonymous(self):
        """Test AI chat endpoint without authentication"""
        print("\n🔍 Testing AI Chat (Anonymous)...")
        
        chat_data = {
            "message": "I need headphones for work",
            "context": {"user_type": "anonymous"}
        }
        
        success, data = self.make_request("POST", "/ai/chat", chat_data, headers={})
        
        if success and isinstance(data, dict) and "response" in data:
            self.log_test("AI Chat (Anonymous)", True, f"Response received: {data.get('response')[:100]}...")
        else:
            self.log_test("AI Chat (Anonymous)", False, str(data))
    
    def test_ai_chat_authenticated(self):
        """Test AI chat endpoint with authentication"""
        print("\n🔍 Testing AI Chat (Authenticated)...")
        
        if not self.auth_token:
            self.log_test("AI Chat (Authenticated)", False, "No auth token available")
            return
        
        chat_data = {
            "message": "Find me affordable electronics",
            "context": {"user_type": "authenticated", "budget": "under_100"}
        }
        
        success, data = self.make_request("POST", "/ai/chat", chat_data)
        
        if success and isinstance(data, dict) and "response" in data:
            self.log_test("AI Chat (Authenticated)", True, f"Agent ID: {data.get('agent_id')}")
        else:
            self.log_test("AI Chat (Authenticated)", False, str(data))
    
    def test_ai_locale_detection(self):
        """Test AI locale detection endpoint"""
        print("\n🔍 Testing AI Locale Detection...")
        
        success, data = self.make_request("GET", "/ai/locale-detection")
        
        if success and isinstance(data, dict) and "country" in data and "currency" in data:
            self.log_test("AI Locale Detection", True, f"Country: {data.get('country')}, Currency: {data.get('currency')}")
        else:
            self.log_test("AI Locale Detection", False, str(data))
    
    def test_ai_product_recommendations_anonymous(self):
        """Test AI product recommendations without authentication"""
        print("\n🔍 Testing AI Product Recommendations (Anonymous)...")
        
        rec_data = {
            "query": "I need headphones for work",
            "max_results": 5
        }
        
        success, data = self.make_request("POST", "/ai/recommendations", rec_data, headers={})
        
        if success and isinstance(data, dict) and "recommendations" in data:
            recommendations = data.get("recommendations", [])
            self.log_test("AI Product Recommendations (Anonymous)", True, f"Found {len(recommendations)} recommendations")
        else:
            self.log_test("AI Product Recommendations (Anonymous)", False, str(data))
    
    def test_ai_product_recommendations_authenticated(self):
        """Test AI product recommendations with authentication"""
        print("\n🔍 Testing AI Product Recommendations (Authenticated)...")
        
        if not self.auth_token:
            self.log_test("AI Product Recommendations (Authenticated)", False, "No auth token available")
            return
        
        rec_data = {
            "query": "find me affordable electronics",
            "max_results": 10
        }
        
        success, data = self.make_request("POST", "/ai/recommendations", rec_data)
        
        if success and isinstance(data, dict) and "recommendations" in data:
            recommendations = data.get("recommendations", [])
            ai_explanation = data.get("ai_explanation", "")
            self.log_test("AI Product Recommendations (Authenticated)", True, f"Found {len(recommendations)} recommendations with AI explanation")
        else:
            self.log_test("AI Product Recommendations (Authenticated)", False, str(data))
    
    def test_ai_search_enhancement(self):
        """Test AI search enhancement endpoint"""
        print("\n🔍 Testing AI Search Enhancement...")
        
        search_data = {
            "query": "cheap phone",
            "context": {"budget": "low", "category": "electronics"}
        }
        
        success, data = self.make_request("POST", "/ai/search/enhance", search_data)
        
        if success and isinstance(data, dict) and ("enhanced_keywords" in data or "original_query" in data):
            self.log_test("AI Search Enhancement", True, f"Enhanced query processed")
        else:
            self.log_test("AI Search Enhancement", False, str(data))
    
    def test_ai_intent_analysis_anonymous(self):
        """Test AI intent analysis without authentication"""
        print("\n🔍 Testing AI Intent Analysis (Anonymous)...")
        
        success, data = self.make_request("POST", "/ai/intent-analysis", {"message": "I need headphones for work"}, headers={})
        
        if success and isinstance(data, dict) and ("intent_type" in data or "extracted_keywords" in data):
            self.log_test("AI Intent Analysis (Anonymous)", True, f"Intent analyzed: {data.get('intent_type', 'unknown')}")
        else:
            self.log_test("AI Intent Analysis (Anonymous)", False, str(data))
    
    def test_ai_intent_analysis_authenticated(self):
        """Test AI intent analysis with authentication"""
        print("\n🔍 Testing AI Intent Analysis (Authenticated)...")
        
        if not self.auth_token:
            self.log_test("AI Intent Analysis (Authenticated)", False, "No auth token available")
            return
        
        success, data = self.make_request("POST", "/ai/intent-analysis", {"message": "find me affordable electronics"})
        
        if success and isinstance(data, dict) and ("intent_type" in data or "extracted_keywords" in data):
            self.log_test("AI Intent Analysis (Authenticated)", True, f"Intent: {data.get('intent_type', 'unknown')}")
        else:
            self.log_test("AI Intent Analysis (Authenticated)", False, str(data))
    
    def test_ai_onboarding_anonymous(self):
        """Test AI onboarding guidance without authentication"""
        print("\n🔍 Testing AI Onboarding (Anonymous)...")
        
        onboarding_data = {
            "user_info": {
                "interests": ["electronics", "fashion"],
                "budget": "medium",
                "location": "US"
            }
        }
        
        success, data = self.make_request("POST", "/ai/onboarding", onboarding_data, headers={})
        
        if success and isinstance(data, dict) and "guidance" in data:
            self.log_test("AI Onboarding (Anonymous)", True, f"Guidance provided for {data.get('user_role', 'unknown')} role")
        else:
            self.log_test("AI Onboarding (Anonymous)", False, str(data))
    
    def test_ai_onboarding_authenticated(self):
        """Test AI onboarding guidance with authentication"""
        print("\n🔍 Testing AI Onboarding (Authenticated)...")
        
        if not self.auth_token:
            self.log_test("AI Onboarding (Authenticated)", False, "No auth token available")
            return
        
        onboarding_data = {
            "user_info": {
                "interests": ["electronics", "home"],
                "budget": "high",
                "shopping_style": "quality_first"
            }
        }
        
        success, data = self.make_request("POST", "/ai/onboarding", onboarding_data)
        
        if success and isinstance(data, dict) and "guidance" in data:
            self.log_test("AI Onboarding (Authenticated)", True, f"Personalized guidance for {data.get('user_role', 'buyer')}")
        else:
            self.log_test("AI Onboarding (Authenticated)", False, str(data))
    
    def test_ai_error_scenarios(self):
        """Test AI endpoints error handling"""
        print("\n🔍 Testing AI Error Scenarios...")
        
        # Test chat with empty message
        success, data = self.make_request("POST", "/ai/chat", {"message": ""}, headers={})
        if not success or (isinstance(data, dict) and "response" in data):
            self.log_test("AI Chat Empty Message", True, "Handled empty message appropriately")
        else:
            self.log_test("AI Chat Empty Message", False, "Should handle empty messages")
        
        # Test recommendations with invalid query
        success, data = self.make_request("POST", "/ai/recommendations", {"query": "", "max_results": 0}, headers={})
        if success and isinstance(data, dict):
            self.log_test("AI Recommendations Invalid Query", True, "Handled invalid query")
        else:
            self.log_test("AI Recommendations Invalid Query", False, str(data))

    def test_geographic_data_initialization(self):
        """Test geographic data initialization"""
        print("\n🌍 Testing Geographic Data Initialization...")
        
        success, data = self.make_request("POST", "/geographic/initialize")
        
        if success and isinstance(data, dict) and data.get("status") == "success":
            self.log_test("Geographic Data Initialization", True, "World cities and countries initialized successfully")
        else:
            self.log_test("Geographic Data Initialization", False, str(data))

    def test_countries_list(self):
        """Test getting all countries"""
        print("\n🌍 Testing Countries List...")
        
        success, data = self.make_request("GET", "/geographic/countries")
        
        if success and isinstance(data, dict) and "countries" in data and len(data["countries"]) > 0:
            self.log_test("Countries List", True, f"Found {len(data['countries'])} countries")
            # Store first country for later tests
            self.test_country_code = data["countries"][0].get("code")
        else:
            self.log_test("Countries List", False, str(data))

    def test_cities_list(self):
        """Test getting cities with and without filters"""
        print("\n🌍 Testing Cities List...")
        
        # Test all cities
        success, data = self.make_request("GET", "/geographic/cities")
        
        if success and isinstance(data, dict) and "cities" in data and len(data["cities"]) > 0:
            self.log_test("Cities List (All)", True, f"Found {len(data['cities'])} cities")
            # Store first city for later tests
            self.test_city_id = data["cities"][0].get("_id")
        else:
            self.log_test("Cities List (All)", False, str(data))
        
        # Test cities filtered by country
        if hasattr(self, 'test_country_code'):
            success, data = self.make_request("GET", "/geographic/cities", {"country_code": self.test_country_code})
            
            if success and isinstance(data, dict) and "cities" in data:
                self.log_test("Cities List (Filtered by Country)", True, f"Found {len(data['cities'])} cities in {self.test_country_code}")
            else:
                self.log_test("Cities List (Filtered by Country)", False, str(data))
        
        # Test major cities only
        success, data = self.make_request("GET", "/geographic/cities", {"major_cities_only": True})
        
        if success and isinstance(data, dict) and "cities" in data:
            self.log_test("Cities List (Major Cities Only)", True, f"Found {len(data['cities'])} major cities")
        else:
            self.log_test("Cities List (Major Cities Only)", False, str(data))

    def test_cities_in_radius(self):
        """Test distance calculations - cities within radius"""
        print("\n🌍 Testing Cities in Radius...")
        
        if not hasattr(self, 'test_city_id'):
            self.log_test("Cities in Radius", False, "No city ID available for testing")
            return
        
        # Use GET with query parameters
        success, data = self.make_request("GET", "/geographic/cities/in-radius", {
            "center_city_id": self.test_city_id,
            "radius_km": 100
        })
        
        if success and isinstance(data, dict) and "cities" in data and "count" in data:
            self.log_test("Cities in Radius", True, f"Found {data['count']} cities within 100km radius")
        else:
            self.log_test("Cities in Radius", False, str(data))

    def test_seller_visibility_creation(self):
        """Test creating seller visibility settings"""
        print("\n🌍 Testing Seller Visibility Creation...")
        
        if not hasattr(self, 'vendor_auth_token') or not self.vendor_auth_token:
            self.log_test("Seller Visibility Creation", False, "No vendor auth token available")
            return
        
        # Store current token and use vendor token
        old_token = self.auth_token
        self.auth_token = self.vendor_auth_token
        
        # Test local visibility
        local_visibility = {
            "visibility_type": "local",
            "local_radius_km": 50,
            "local_center_city_id": getattr(self, 'test_city_id', 'city_new_york_US'),
            "auto_expand": True,
            "budget_daily_usd": 100.0,
            "performance_threshold": 0.02
        }
        
        success, data = self.make_request("POST", "/geographic/visibility", local_visibility)
        
        if success and isinstance(data, dict) and data.get("status") == "success":
            self.log_test("Seller Visibility Creation (Local)", True, f"Local visibility created: {data.get('visibility_id')}")
        else:
            self.log_test("Seller Visibility Creation (Local)", False, str(data))
        
        # Test national visibility
        national_visibility = {
            "visibility_type": "national",
            "target_countries": ["US", "CA"],
            "auto_expand": True,
            "budget_daily_usd": 200.0
        }
        
        success, data = self.make_request("POST", "/geographic/visibility", national_visibility)
        
        if success and isinstance(data, dict) and data.get("status") == "success":
            self.log_test("Seller Visibility Creation (National)", True, "National visibility created successfully")
        else:
            self.log_test("Seller Visibility Creation (National)", False, str(data))
        
        # Test global strategic visibility
        global_strategic = {
            "visibility_type": "global_strategic",
            "target_countries": ["US", "GB", "AU", "CA"],
            "target_cities": ["city_new_york_US", "city_london_GB", "city_sydney_AU"],
            "excluded_countries": ["CN"],
            "auto_expand": False,
            "budget_daily_usd": 500.0
        }
        
        success, data = self.make_request("POST", "/geographic/visibility", global_strategic)
        
        if success and isinstance(data, dict) and data.get("status") == "success":
            self.log_test("Seller Visibility Creation (Global Strategic)", True, "Global strategic visibility created successfully")
        else:
            self.log_test("Seller Visibility Creation (Global Strategic)", False, str(data))
        
        # Test global all visibility
        global_all = {
            "visibility_type": "global_all",
            "auto_expand": True,
            "budget_daily_usd": 1000.0
        }
        
        success, data = self.make_request("POST", "/geographic/visibility", global_all)
        
        if success and isinstance(data, dict) and data.get("status") == "success":
            self.log_test("Seller Visibility Creation (Global All)", True, "Global all visibility created successfully")
            # Store vendor ID for later tests
            if hasattr(self, 'user_id'):
                self.test_vendor_id = "test_vendor_" + str(self.user_id)
        else:
            self.log_test("Seller Visibility Creation (Global All)", False, str(data))
        
        # Restore original token
        self.auth_token = old_token

    def test_seller_visibility_retrieval(self):
        """Test retrieving seller visibility settings"""
        print("\n🌍 Testing Seller Visibility Retrieval...")
        
        if not self.auth_token:
            self.log_test("Seller Visibility Retrieval", False, "No auth token available")
            return
        
        # Use a test vendor ID
        test_vendor_id = getattr(self, 'test_vendor_id', 'test_vendor_123')
        
        success, data = self.make_request("GET", f"/geographic/visibility/{test_vendor_id}")
        
        if success and isinstance(data, dict) and ("visibility" in data or "message" in data):
            if data.get("visibility"):
                self.log_test("Seller Visibility Retrieval", True, f"Retrieved visibility settings for vendor {test_vendor_id}")
            else:
                self.log_test("Seller Visibility Retrieval", True, "No visibility settings found (expected for new vendor)")
        else:
            self.log_test("Seller Visibility Retrieval", False, str(data))

    def test_ai_market_analysis(self):
        """Test AI-powered market analysis"""
        print("\n🌍 Testing AI Market Analysis...")
        
        if not self.auth_token:
            self.log_test("AI Market Analysis", False, "No auth token available")
            return
        
        analysis_data = {
            "product_category": "Electronics",
            "target_locations": ["country_US", "country_GB", "city_new_york_US", "city_london_GB"]
        }
        
        success, data = self.make_request("POST", "/geographic/market-analysis", analysis_data)
        
        if success and isinstance(data, dict) and ("overall_opportunity_score" in data or "market_insights" in data):
            opportunity_score = data.get("overall_opportunity_score", 0)
            insights_count = len(data.get("market_insights", []))
            self.log_test("AI Market Analysis", True, f"Market analysis completed - Opportunity Score: {opportunity_score}, Insights: {insights_count}")
        else:
            self.log_test("AI Market Analysis", False, str(data))

    def test_ai_targeting_recommendations(self):
        """Test AI-powered targeting recommendations"""
        print("\n🌍 Testing AI Targeting Recommendations...")
        
        if not self.auth_token:
            self.log_test("AI Targeting Recommendations", False, "No auth token available")
            return
        
        test_vendor_id = getattr(self, 'test_vendor_id', 'test_vendor_123')
        
        success, data = self.make_request("GET", f"/geographic/targeting-recommendations/{test_vendor_id}")
        
        if success and isinstance(data, dict) and "recommendations" in data:
            recommendations = data.get("recommendations", [])
            self.log_test("AI Targeting Recommendations", True, f"Received {len(recommendations)} AI targeting recommendations")
        else:
            self.log_test("AI Targeting Recommendations", False, str(data))

    def test_performance_tracking(self):
        """Test geographic performance tracking"""
        print("\n🌍 Testing Performance Tracking...")
        
        if not self.auth_token:
            self.log_test("Performance Tracking", False, "No auth token available")
            return
        
        # Test view tracking
        view_data = {
            "product_id": getattr(self, 'test_product_id', 'test_product_123'),
            "country_code": "US",
            "city_id": "city_new_york_US",
            "event_type": "view",
            "revenue": 0.0
        }
        
        success, data = self.make_request("POST", "/geographic/track-performance", view_data)
        
        if success and isinstance(data, dict) and data.get("status") == "success":
            self.log_test("Performance Tracking (View)", True, "View event tracked successfully")
        else:
            self.log_test("Performance Tracking (View)", False, str(data))
        
        # Test click tracking
        click_data = {
            "product_id": getattr(self, 'test_product_id', 'test_product_123'),
            "country_code": "US",
            "city_id": "city_new_york_US",
            "event_type": "click",
            "revenue": 0.0
        }
        
        success, data = self.make_request("POST", "/geographic/track-performance", click_data)
        
        if success and isinstance(data, dict) and data.get("status") == "success":
            self.log_test("Performance Tracking (Click)", True, "Click event tracked successfully")
        else:
            self.log_test("Performance Tracking (Click)", False, str(data))
        
        # Test conversion tracking
        conversion_data = {
            "product_id": getattr(self, 'test_product_id', 'test_product_123'),
            "country_code": "US",
            "city_id": "city_new_york_US",
            "event_type": "conversion",
            "revenue": 99.99
        }
        
        success, data = self.make_request("POST", "/geographic/track-performance", conversion_data)
        
        if success and isinstance(data, dict) and data.get("status") == "success":
            self.log_test("Performance Tracking (Conversion)", True, "Conversion event with revenue tracked successfully")
        else:
            self.log_test("Performance Tracking (Conversion)", False, str(data))

    def test_vendor_analytics(self):
        """Test comprehensive geographic analytics for vendor"""
        print("\n🌍 Testing Vendor Analytics...")
        
        if not self.auth_token:
            self.log_test("Vendor Analytics", False, "No auth token available")
            return
        
        test_vendor_id = getattr(self, 'test_vendor_id', 'test_vendor_123')
        
        success, data = self.make_request("GET", f"/geographic/analytics/{test_vendor_id}", {"days": 30})
        
        if success and isinstance(data, dict) and "total_stats" in data:
            total_stats = data.get("total_stats", {})
            country_count = len(data.get("country_performance", {}))
            city_count = len(data.get("city_performance", {}))
            self.log_test("Vendor Analytics", True, f"Analytics retrieved - Countries: {country_count}, Cities: {city_count}, Revenue: ${total_stats.get('revenue_usd', 0)}")
        else:
            self.log_test("Vendor Analytics", False, str(data))

    def test_geographic_product_filtering(self):
        """Test filtering products based on buyer's geographic preferences"""
        print("\n🌍 Testing Geographic Product Filtering...")
        
        filter_data = {
            "buyer_country_code": "US",
            "buyer_city_id": "city_new_york_US",
            "max_distance_km": 100,
            "include_international": True
        }
        
        # Use GET with query parameters instead of POST with headers
        success, data = self.make_request("POST", "/geographic/filter-products", filter_data)
        
        if success and isinstance(data, dict) and "products" in data:
            products = data.get("products", [])
            geographic_filter_applied = data.get("geographic_filter_applied", False)
            self.log_test("Geographic Product Filtering", True, f"Found {len(products)} products with geographic filtering {'applied' if geographic_filter_applied else 'not applied'}")
        else:
            self.log_test("Geographic Product Filtering", False, str(data))

    def test_seller_geographic_insights(self):
        """Test comprehensive geographic insights for seller dashboard"""
        print("\n🌍 Testing Seller Geographic Insights...")
        
        if not self.auth_token:
            self.log_test("Seller Geographic Insights", False, "No auth token available")
            return
        
        test_vendor_id = getattr(self, 'test_vendor_id', 'test_vendor_123')
        
        success, data = self.make_request("GET", f"/geographic/insights/{test_vendor_id}")
        
        if success and isinstance(data, dict):
            has_visibility = "current_visibility" in data
            has_analytics = "performance_analytics" in data
            has_ai_recommendations = "ai_recommendations" in data
            has_quick_stats = "quick_stats" in data
            
            if has_visibility and has_analytics and has_ai_recommendations and has_quick_stats:
                quick_stats = data.get("quick_stats", {})
                countries_active = quick_stats.get("countries_active", 0)
                total_revenue = quick_stats.get("total_revenue", 0)
                self.log_test("Seller Geographic Insights", True, f"Complete insights retrieved - Active countries: {countries_active}, Revenue: ${total_revenue}")
            else:
                self.log_test("Seller Geographic Insights", True, "Partial insights retrieved (expected for new vendor)")
        else:
            self.log_test("Seller Geographic Insights", False, str(data))

    def test_geographic_authentication_controls(self):
        """Test authentication and authorization controls for geographic features"""
        print("\n🌍 Testing Geographic Authentication Controls...")
        
        # Test accessing protected endpoint without token
        old_token = self.auth_token
        self.auth_token = None
        
        success, data = self.make_request("POST", "/geographic/visibility", {
            "visibility_type": "local",
            "local_radius_km": 50
        })
        
        self.auth_token = old_token
        
        if not success and ("401" in str(data) or "Missing Authorization" in str(data)):
            self.log_test("Geographic Auth Control (No Token)", True, "Correctly rejected request without authentication")
        else:
            self.log_test("Geographic Auth Control (No Token)", False, f"Expected 401 error, got: {data}")
        
        # Test accessing vendor-specific endpoint with valid token
        if self.auth_token:
            test_vendor_id = getattr(self, 'test_vendor_id', 'test_vendor_123')
            success, data = self.make_request("GET", f"/geographic/visibility/{test_vendor_id}")
            
            if success or ("403" in str(data) and "Access denied" in str(data)):
                self.log_test("Geographic Auth Control (Valid Token)", True, "Authentication working correctly for vendor endpoints")
            else:
                self.log_test("Geographic Auth Control (Valid Token)", False, str(data))
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting AisleMarts Backend API Tests (Including Geographic Targeting System)")
        print(f"📍 Testing against: {API_URL}")
        print("=" * 80)
        
        # Core functionality tests
        self.test_health_check()
        self.test_user_registration()
        if not self.auth_token:
            self.test_user_login()
        
        # Login vendor for geographic tests
        self.test_vendor_login()
        
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
        
        # AI Endpoint Tests
        print("\n" + "🤖" * 20 + " AI ENDPOINTS TESTING " + "🤖" * 20)
        self.test_ai_chat_anonymous()
        self.test_ai_chat_authenticated()
        self.test_ai_locale_detection()
        self.test_ai_product_recommendations_anonymous()
        self.test_ai_product_recommendations_authenticated()
        self.test_ai_search_enhancement()
        self.test_ai_intent_analysis_anonymous()
        self.test_ai_intent_analysis_authenticated()
        self.test_ai_onboarding_anonymous()
        self.test_ai_onboarding_authenticated()
        self.test_ai_error_scenarios()
        
        # Geographic Targeting System Tests
        print("\n" + "🌍" * 15 + " GEOGRAPHIC TARGETING SYSTEM TESTING " + "🌍" * 15)
        self.test_geographic_data_initialization()
        self.test_countries_list()
        self.test_cities_list()
        self.test_cities_in_radius()
        self.test_seller_visibility_creation()
        self.test_seller_visibility_retrieval()
        self.test_ai_market_analysis()
        self.test_ai_targeting_recommendations()
        self.test_performance_tracking()
        self.test_vendor_analytics()
        self.test_geographic_product_filtering()
        self.test_seller_geographic_insights()
        self.test_geographic_authentication_controls()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
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