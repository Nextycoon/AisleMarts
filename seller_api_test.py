#!/usr/bin/env python3
"""
AisleMarts Seller APIs Test Suite
Tests the newly implemented multi-vendor seller APIs
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

class SellerAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.test_product_id = None
        
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

    def setup_authentication(self):
        """Setup authentication for testing"""
        print("\n🔐 Setting up authentication...")
        
        # Try to register a test user
        user_data = {
            "email": "seller@aislemarts.com",
            "password": "password123",
            "name": "Test Seller"
        }
        
        success, data = self.make_request("POST", "/auth/register", user_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("Authentication Setup (Register)", True, "Successfully registered and got token")
        else:
            # User might already exist, try to login instead
            login_data = {
                "email": "seller@aislemarts.com",
                "password": "password123"
            }
            
            success, data = self.make_request("POST", "/auth/login", login_data)
            
            if success and isinstance(data, dict) and "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("Authentication Setup (Login)", True, "Successfully logged in and got token")
            else:
                self.log_test("Authentication Setup", False, f"Failed to authenticate: {data}")

    def test_seller_products_health_check(self):
        """Test seller products health check"""
        print("\n🛍️ Testing Seller Products Health Check...")
        
        success, data = self.make_request("GET", "/seller/products/health")
        
        if success and isinstance(data, dict) and data.get("status") == "healthy":
            service = data.get("service")
            features = data.get("features", [])
            commission_rate = data.get("commission_rate")
            currency = data.get("currency")
            self.log_test("Seller Products Health Check", True, f"Service: {service}, Features: {len(features)}, Commission: {commission_rate}, Currency: {currency}")
        else:
            self.log_test("Seller Products Health Check", False, str(data))

    def test_seller_product_creation(self):
        """Test creating seller products with validation"""
        print("\n🛍️ Testing Seller Product Creation...")
        
        if not self.auth_token:
            self.log_test("Seller Product Creation", False, "No auth token available")
            return
        
        # Test valid product creation
        valid_product = {
            "title": "Kenyan Coffee Beans Premium",
            "description": "High-quality Arabica coffee beans from Mount Kenya region",
            "price": 1500.0,  # KES
            "stock": 50,
            "sku": "COFFEE-KE-001",
            "category": "Food & Beverages",
            "image_url": "https://example.com/coffee.jpg"
        }
        
        success, data = self.make_request("POST", "/seller/products", valid_product)
        
        if success and isinstance(data, dict) and data.get("success") is True:
            product = data.get("product", {})
            self.test_product_id = product.get("id") or product.get("product_id")
            self.log_test("Seller Product Creation (Valid)", True, f"Product created: {product.get('title')} - KES {product.get('price')}")
        else:
            self.log_test("Seller Product Creation (Valid)", False, str(data))
        
        # Test invalid product creation (negative price)
        invalid_product = {
            "title": "Invalid Product",
            "price": -100.0,  # Invalid negative price
            "stock": 10
        }
        
        success, data = self.make_request("POST", "/seller/products", invalid_product)
        
        if not success or (isinstance(data, dict) and "error" in str(data).lower()):
            self.log_test("Seller Product Creation (Invalid Price)", True, "Correctly rejected negative price")
        else:
            self.log_test("Seller Product Creation (Invalid Price)", False, "Should reject negative price")

    def test_seller_products_listing(self):
        """Test getting seller products with filters"""
        print("\n🛍️ Testing Seller Products Listing...")
        
        if not self.auth_token:
            self.log_test("Seller Products Listing", False, "No auth token available")
            return
        
        # Test getting all products
        success, data = self.make_request("GET", "/seller/products")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            products = data.get("products", [])
            count = data.get("count", 0)
            seller_id = data.get("seller_id")
            self.log_test("Seller Products Listing (All)", True, f"Found {count} products for seller {seller_id}")
        else:
            self.log_test("Seller Products Listing (All)", False, str(data))
        
        # Test getting active products only
        success, data = self.make_request("GET", "/seller/products", {"active_only": True})
        
        if success and isinstance(data, dict) and data.get("success") is True:
            products = data.get("products", [])
            count = data.get("count", 0)
            # Verify all returned products are active
            all_active = all(product.get("active", True) for product in products)
            self.log_test("Seller Products Listing (Active Only)", True, f"Found {count} active products, all active: {all_active}")
        else:
            self.log_test("Seller Products Listing (Active Only)", False, str(data))

    def test_seller_product_details(self):
        """Test getting specific product details"""
        print("\n🛍️ Testing Seller Product Details...")
        
        if not self.auth_token:
            self.log_test("Seller Product Details", False, "No auth token available")
            return
        
        if not self.test_product_id:
            self.log_test("Seller Product Details", False, "No product ID available for testing")
            return
        
        success, data = self.make_request("GET", f"/seller/products/{self.test_product_id}")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            product = data.get("product", {})
            title = product.get("title")
            price = product.get("price")
            stock = product.get("stock")
            self.log_test("Seller Product Details", True, f"Product: {title}, Price: KES {price}, Stock: {stock}")
        else:
            self.log_test("Seller Product Details", False, str(data))

    def test_seller_product_update(self):
        """Test updating seller products"""
        print("\n🛍️ Testing Seller Product Update...")
        
        if not self.auth_token:
            self.log_test("Seller Product Update", False, "No auth token available")
            return
        
        if not self.test_product_id:
            self.log_test("Seller Product Update", False, "No product ID available for testing")
            return
        
        # Test valid update
        update_data = {
            "title": "Kenyan Coffee Beans Premium - Updated",
            "price": 1800.0,  # Updated price in KES
            "stock": 75,
            "description": "Updated description with new features"
        }
        
        success, data = self.make_request("PUT", f"/seller/products/{self.test_product_id}", update_data)
        
        if success and isinstance(data, dict) and data.get("success") is True:
            product = data.get("product", {})
            new_title = product.get("title")
            new_price = product.get("price")
            self.log_test("Seller Product Update (Valid)", True, f"Updated: {new_title}, New Price: KES {new_price}")
        else:
            self.log_test("Seller Product Update (Valid)", False, str(data))

    def test_seller_product_toggle_status(self):
        """Test toggling product active status"""
        print("\n🛍️ Testing Seller Product Toggle Status...")
        
        if not self.auth_token:
            self.log_test("Seller Product Toggle Status", False, "No auth token available")
            return
        
        if not self.test_product_id:
            self.log_test("Seller Product Toggle Status", False, "No product ID available for testing")
            return
        
        # Toggle status
        success, data = self.make_request("POST", f"/seller/products/{self.test_product_id}/toggle")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            new_status = data.get("new_status")
            message = data.get("message")
            self.log_test("Seller Product Toggle Status", True, f"Status toggled: {new_status} - {message}")
        else:
            self.log_test("Seller Product Toggle Status", False, str(data))

    def test_seller_orders_listing(self):
        """Test getting seller orders with status filter"""
        print("\n📦 Testing Seller Orders Listing...")
        
        if not self.auth_token:
            self.log_test("Seller Orders Listing", False, "No auth token available")
            return
        
        # Test getting all orders
        success, data = self.make_request("GET", "/seller/orders")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            orders = data.get("orders", [])
            count = data.get("count", 0)
            seller_id = data.get("seller_id")
            self.log_test("Seller Orders Listing (All)", True, f"Found {count} orders for seller {seller_id}")
        else:
            self.log_test("Seller Orders Listing (All)", False, str(data))

    def test_seller_order_details(self):
        """Test getting specific order details"""
        print("\n📦 Testing Seller Order Details...")
        
        if not self.auth_token:
            self.log_test("Seller Order Details", False, "No auth token available")
            return
        
        # Test with a mock order ID
        test_order_id = "test-order-123"
        success, data = self.make_request("GET", f"/seller/orders/{test_order_id}")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            order = data.get("order", {})
            customer_name = order.get("customer_name")
            subtotal = order.get("subtotal")
            commission = order.get("commission")
            seller_payout = order.get("seller_payout")
            status = order.get("status")
            
            # Verify 1% commission calculation
            expected_commission = subtotal * 0.01 if subtotal else 0
            commission_correct = abs(commission - expected_commission) < 0.01 if commission and subtotal else True
            
            self.log_test("Seller Order Details", True, f"Order: {customer_name}, Subtotal: KES {subtotal}, Commission: KES {commission} (1% correct: {commission_correct}), Payout: KES {seller_payout}, Status: {status}")
        else:
            self.log_test("Seller Order Details", False, str(data))

    def test_seller_order_status_update(self):
        """Test updating order status"""
        print("\n📦 Testing Seller Order Status Update...")
        
        if not self.auth_token:
            self.log_test("Seller Order Status Update", False, "No auth token available")
            return
        
        test_order_id = "test-order-123"
        
        # Test valid status update
        status_data = {"status": "shipped"}
        success, data = self.make_request("POST", f"/seller/orders/{test_order_id}", status_data)
        
        if success and isinstance(data, dict) and data.get("success") is True:
            message = data.get("message")
            self.log_test("Seller Order Status Update (Valid)", True, message)
        else:
            self.log_test("Seller Order Status Update (Valid)", False, str(data))

    def test_seller_analytics_summary(self):
        """Test seller analytics summary for dashboard"""
        print("\n📊 Testing Seller Analytics Summary...")
        
        if not self.auth_token:
            self.log_test("Seller Analytics Summary", False, "No auth token available")
            return
        
        success, data = self.make_request("GET", "/seller/analytics/summary")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            analytics = data.get("analytics", {})
            seller_id = data.get("seller_id")
            
            # Check key metrics
            revenue_30d = analytics.get("revenue_30d", 0)
            orders_30d = analytics.get("orders_30d", 0)
            views_30d = analytics.get("views_30d", 0)
            commission_30d = analytics.get("commission_30d", 0)
            avg_order_value = analytics.get("average_order_value", 0)
            conversion_rate = analytics.get("conversion_rate", 0)
            ai_share = analytics.get("ai_share", 0)
            currency = analytics.get("currency")
            
            self.log_test("Seller Analytics Summary", True, f"Revenue: {currency} {revenue_30d}, Orders: {orders_30d}, Views: {views_30d}, Commission: {currency} {commission_30d}, AOV: {currency} {avg_order_value}, CR: {conversion_rate}%, AI Share: {ai_share*100}%")
        else:
            self.log_test("Seller Analytics Summary", False, str(data))

    def test_seller_analytics_timeseries(self):
        """Test seller analytics timeseries data for charts"""
        print("\n📊 Testing Seller Analytics Timeseries...")
        
        if not self.auth_token:
            self.log_test("Seller Analytics Timeseries", False, "No auth token available")
            return
        
        # Test revenue metric
        success, data = self.make_request("GET", "/seller/analytics/timeseries", {
            "metric": "revenue",
            "period": "30d"
        })
        
        if success and isinstance(data, dict) and data.get("success") is True:
            metric_name = data.get("metric")
            period = data.get("period")
            data_points = data.get("data", [])
            seller_id = data.get("seller_id")
            
            # Verify data structure
            valid_data = all(
                isinstance(point, dict) and 
                "date" in point and 
                "value" in point 
                for point in data_points
            )
            
            self.log_test("Seller Analytics Timeseries", True, f"Metric: {metric_name}, Period: {period}, Data points: {len(data_points)}, Valid structure: {valid_data}")
        else:
            self.log_test("Seller Analytics Timeseries", False, str(data))

    def test_authentication_requirements(self):
        """Test authentication requirements for seller APIs"""
        print("\n🔐 Testing Authentication Requirements...")
        
        # Store current token
        old_token = self.auth_token
        self.auth_token = None
        
        # Test endpoint that should require authentication
        success, response = self.make_request("GET", "/seller/products")
        
        # Restore token
        self.auth_token = old_token
        
        if not success and ("401" in str(response) or "Missing Authorization" in str(response)):
            self.log_test("Authentication Requirements", True, "Correctly requires authentication")
        else:
            self.log_test("Authentication Requirements", False, f"Expected 401 error, got: {response}")

    def run_seller_api_tests(self):
        """Run all seller API tests"""
        print(f"🚀 Starting AisleMarts Seller APIs Tests")
        print(f"📍 Testing against: {API_URL}")
        print("=" * 80)
        
        # Setup authentication
        self.setup_authentication()
        
        if not self.auth_token:
            print("❌ Cannot proceed without authentication")
            return False
        
        # Run seller API tests
        print("\n" + "🛍️" * 15 + " SELLER PRODUCTS MANAGEMENT APIS TESTING " + "🛍️" * 15)
        
        # Health check (doesn't require auth)
        self.test_seller_products_health_check()
        
        # Products management
        self.test_seller_product_creation()
        self.test_seller_products_listing()
        self.test_seller_product_details()
        self.test_seller_product_update()
        self.test_seller_product_toggle_status()
        
        # Orders management
        self.test_seller_orders_listing()
        self.test_seller_order_details()
        self.test_seller_order_status_update()
        
        # Analytics
        self.test_seller_analytics_summary()
        self.test_seller_analytics_timeseries()
        
        # Authentication testing
        self.test_authentication_requirements()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 SELLER APIS TEST SUMMARY")
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
    tester = SellerAPITester()
    success = tester.run_seller_api_tests()
    
    if success:
        print("\n🎉 All seller API tests passed! Seller APIs are working correctly.")
        sys.exit(0)
    else:
        print("\n⚠️  Some seller API tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()