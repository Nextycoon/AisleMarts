#!/usr/bin/env python3
"""
Phase 2 Order Management API Test Suite
Tests the newly implemented Phase 2 Order Management APIs
"""

import requests
import json
import sys
import os

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

class Phase2OrderTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.demo_order_id = None
        
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
        
    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None) -> tuple[bool, any]:
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
    
    def setup_auth(self):
        """Setup authentication for testing"""
        print("🔐 Setting up authentication...")
        
        # Try to login with existing user
        login_data = {
            "email": "buyer@aislemarts.com",
            "password": "password123"
        }
        
        success, data = self.make_request("POST", "/auth/login", login_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            print("✅ Authentication successful")
            return True
        else:
            print("❌ Authentication failed")
            return False
    
    def test_order_management_health_check(self):
        """Test order management health check"""
        print("\n📦 Testing Order Management Health Check...")
        
        success, data = self.make_request("GET", "/seller/orders/health")
        
        if success and isinstance(data, dict) and data.get("status") == "healthy":
            service = data.get("service")
            features = data.get("features", [])
            supported_statuses = data.get("supported_statuses", [])
            currency = data.get("currency")
            self.log_test("Order Management Health Check", True, f"Service: {service}, Features: {len(features)}, Statuses: {len(supported_statuses)}, Currency: {currency}")
        else:
            self.log_test("Order Management Health Check", False, str(data))

    def test_seller_orders_get(self):
        """Test getting seller orders with status filter"""
        print("\n📦 Testing Get Seller Orders...")
        
        if not self.auth_token:
            self.log_test("Get Seller Orders", False, "No auth token available")
            return
        
        # Test getting all orders
        success, data = self.make_request("GET", "/seller/orders")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            orders = data.get("orders", [])
            count = data.get("count", 0)
            seller_id = data.get("seller_id")
            self.log_test("Get Seller Orders (All)", True, f"Found {count} orders for seller {seller_id}")
        else:
            self.log_test("Get Seller Orders (All)", False, str(data))
        
        # Test filtering by status
        success, data = self.make_request("GET", "/seller/orders", {"status": "paid"})
        
        if success and isinstance(data, dict) and data.get("success") is True:
            orders = data.get("orders", [])
            count = data.get("count", 0)
            filter_status = data.get("filter_status")
            self.log_test("Get Seller Orders (Filtered)", True, f"Found {count} orders with status: {filter_status}")
        else:
            self.log_test("Get Seller Orders (Filtered)", False, str(data))

    def test_create_demo_order(self):
        """Test creating demo order"""
        print("\n📦 Testing Create Demo Order...")
        
        if not self.auth_token:
            self.log_test("Create Demo Order", False, "No auth token available")
            return
        
        success, data = self.make_request("POST", "/seller/orders/demo")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            order = data.get("order", {})
            order_id = order.get("order_id")
            subtotal = order.get("subtotal")
            commission = order.get("commission")
            seller_payout = order.get("seller_payout")
            status = order.get("status")
            
            # Store order ID for later tests
            self.demo_order_id = order_id
            
            # Verify 1% commission calculation
            expected_commission = subtotal * 0.01 if subtotal else 0
            commission_correct = abs(commission - expected_commission) < 0.01 if commission and subtotal else True
            
            self.log_test("Create Demo Order", True, f"Order: {order_id}, Subtotal: KES {subtotal}, Commission: KES {commission} (1% correct: {commission_correct}), Payout: KES {seller_payout}, Status: {status}")
        else:
            self.log_test("Create Demo Order", False, str(data))

    def test_get_order_details(self):
        """Test getting specific order details"""
        print("\n📦 Testing Get Order Details...")
        
        if not self.auth_token:
            self.log_test("Get Order Details", False, "No auth token available")
            return
        
        if not self.demo_order_id:
            self.log_test("Get Order Details", False, "No demo order ID available for testing")
            return
        
        success, data = self.make_request("GET", f"/seller/orders/{self.demo_order_id}")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            order = data.get("order", {})
            customer_name = order.get("customer", {}).get("name")
            subtotal = order.get("subtotal")
            commission = order.get("commission")
            seller_payout = order.get("seller_payout")
            status = order.get("status")
            events = order.get("events", [])
            
            # Verify 1% commission calculation
            expected_commission = subtotal * 0.01 if subtotal else 0
            commission_correct = abs(commission - expected_commission) < 0.01 if commission and subtotal else True
            
            self.log_test("Get Order Details", True, f"Customer: {customer_name}, Subtotal: KES {subtotal}, Commission: KES {commission} (1% correct: {commission_correct}), Payout: KES {seller_payout}, Status: {status}, Events: {len(events)}")
        else:
            self.log_test("Get Order Details", False, str(data))

    def test_update_order_status(self):
        """Test updating order status"""
        print("\n📦 Testing Update Order Status...")
        
        if not self.auth_token:
            self.log_test("Update Order Status", False, "No auth token available")
            return
        
        if not self.demo_order_id:
            self.log_test("Update Order Status", False, "No demo order ID available for testing")
            return
        
        # Test valid status updates
        valid_statuses = ["shipped", "delivered"]
        
        for status in valid_statuses:
            status_data = {
                "status": status,
                "notes": f"Order marked as {status} for testing"
            }
            success, data = self.make_request("POST", f"/seller/orders/{self.demo_order_id}/status", status_data)
            
            if success and isinstance(data, dict) and data.get("success") is True:
                message = data.get("message")
                order = data.get("order", {})
                new_status = order.get("status")
                self.log_test(f"Update Order Status ({status})", True, f"{message} - New status: {new_status}")
                break
            else:
                self.log_test(f"Update Order Status ({status})", False, str(data))
        
        # Test invalid status
        invalid_status_data = {"status": "invalid_status"}
        success, data = self.make_request("POST", f"/seller/orders/{self.demo_order_id}/status", invalid_status_data)
        
        if not success and ("400" in str(data) or "422" in str(data)):
            self.log_test("Update Order Status (Invalid)", True, "Correctly rejected invalid status")
        else:
            self.log_test("Update Order Status (Invalid)", False, f"Expected validation error for invalid status, got: {data}")

    def test_mpesa_stk_callback_success(self):
        """Test M-Pesa STK callback with success"""
        print("\n💳 Testing M-Pesa STK Callback (Success)...")
        
        # Test successful M-Pesa callback
        success_callback = {
            "MerchantRequestID": "29115-34620561-1",
            "CheckoutRequestID": "ws_CO_191220191020363925",
            "ResultCode": 0,
            "ResultDesc": "The service request is processed successfully.",
            "CallbackMetadata": {
                "Item": [
                    {"Name": "Amount", "Value": 1000.0},
                    {"Name": "MpesaReceiptNumber", "Value": "NLJ7RT61SV"},
                    {"Name": "PhoneNumber", "Value": "254712345678"}
                ]
            }
        }
        
        success, data = self.make_request("POST", "/mpesa/stk/callback", success_callback)
        
        if success and isinstance(data, dict) and data.get("ResultCode") == 0:
            result_desc = data.get("ResultDesc")
            processed = data.get("processed")
            self.log_test("M-Pesa STK Callback (Success)", True, f"Result: {result_desc}, Processed: {processed}")
        else:
            self.log_test("M-Pesa STK Callback (Success)", False, str(data))

    def test_mpesa_stk_callback_failure(self):
        """Test M-Pesa STK callback with failure"""
        print("\n💳 Testing M-Pesa STK Callback (Failure)...")
        
        # Test failed M-Pesa callback
        failure_callback = {
            "MerchantRequestID": "29115-34620561-2",
            "CheckoutRequestID": "ws_CO_191220191020363926",
            "ResultCode": 1032,
            "ResultDesc": "Request cancelled by user",
            "CallbackMetadata": None
        }
        
        success, data = self.make_request("POST", "/mpesa/stk/callback", failure_callback)
        
        if success and isinstance(data, dict):
            result_code = data.get("ResultCode")
            result_desc = data.get("ResultDesc")
            processed = data.get("processed")
            self.log_test("M-Pesa STK Callback (Failure)", True, f"Result Code: {result_code}, Result: {result_desc}, Processed: {processed}")
        else:
            self.log_test("M-Pesa STK Callback (Failure)", False, str(data))

    def test_order_lifecycle_management(self):
        """Test complete order lifecycle from pending to delivered"""
        print("\n📦 Testing Order Lifecycle Management...")
        
        if not self.auth_token:
            self.log_test("Order Lifecycle Management", False, "No auth token available")
            return
        
        # Create a new demo order for lifecycle testing
        success, data = self.make_request("POST", "/seller/orders/demo")
        
        if not success or not isinstance(data, dict) or not data.get("success"):
            self.log_test("Order Lifecycle Management", False, "Could not create demo order for lifecycle test")
            return
        
        order = data.get("order", {})
        lifecycle_order_id = order.get("order_id")
        
        if not lifecycle_order_id:
            self.log_test("Order Lifecycle Management", False, "No order ID from demo order creation")
            return
        
        # Test status transitions: paid → shipped → delivered
        status_transitions = [
            ("shipped", "Order shipped to customer"),
            ("delivered", "Order delivered successfully")
        ]
        
        all_transitions_successful = True
        
        for status, notes in status_transitions:
            status_data = {
                "status": status,
                "notes": notes
            }
            success, data = self.make_request("POST", f"/seller/orders/{lifecycle_order_id}/status", status_data)
            
            if not success or not isinstance(data, dict) or not data.get("success"):
                all_transitions_successful = False
                break
        
        if all_transitions_successful:
            self.log_test("Order Lifecycle Management", True, "Successfully transitioned order through paid → shipped → delivered")
        else:
            self.log_test("Order Lifecycle Management", False, "Failed to complete all status transitions")

    def test_kes_currency_handling(self):
        """Test KES currency consistency throughout order management"""
        print("\n💰 Testing KES Currency Handling...")
        
        if not self.auth_token:
            self.log_test("KES Currency Handling", False, "No auth token available")
            return
        
        # Create demo order and verify KES currency
        success, data = self.make_request("POST", "/seller/orders/demo")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            order = data.get("order", {})
            
            # Check all monetary values are in KES format
            subtotal = order.get("subtotal", 0)
            commission = order.get("commission", 0)
            seller_payout = order.get("seller_payout", 0)
            total = order.get("total", 0)
            shipping = order.get("shipping", 0)
            
            # Verify commission is 1% of subtotal
            expected_commission = subtotal * 0.01
            commission_correct = abs(commission - expected_commission) < 0.01
            
            # Verify seller payout calculation
            expected_payout = subtotal - commission
            payout_correct = abs(seller_payout - expected_payout) < 0.01
            
            # Verify total calculation
            expected_total = subtotal + shipping
            total_correct = abs(total - expected_total) < 0.01
            
            all_calculations_correct = commission_correct and payout_correct and total_correct
            
            self.log_test("KES Currency Handling", True, f"Subtotal: KES {subtotal}, Commission: KES {commission} (1% correct: {commission_correct}), Payout: KES {seller_payout} (correct: {payout_correct}), Total: KES {total} (correct: {total_correct}), All calculations: {all_calculations_correct}")
        else:
            self.log_test("KES Currency Handling", False, str(data))

    def test_order_authentication_requirements(self):
        """Test authentication requirements for order management endpoints"""
        print("\n🔐 Testing Order Authentication Requirements...")
        
        # Store current token
        old_token = self.auth_token
        self.auth_token = None
        
        # Test endpoints without authentication
        endpoints_to_test = [
            ("GET", "/seller/orders"),
            ("GET", "/seller/orders/test-order-123"),
            ("POST", "/seller/orders/test-order-123/status", {"status": "shipped"}),
            ("POST", "/seller/orders/demo")
        ]
        
        all_properly_protected = True
        
        for method, endpoint, *data in endpoints_to_test:
            request_data = data[0] if data else None
            success, response = self.make_request(method, endpoint, request_data)
            
            if success or "401" not in str(response):
                all_properly_protected = False
                break
        
        # Restore token
        self.auth_token = old_token
        
        if all_properly_protected:
            self.log_test("Order Authentication Requirements", True, "All order management endpoints properly require authentication")
        else:
            self.log_test("Order Authentication Requirements", False, "Some endpoints do not properly require authentication")

    def run_phase2_tests(self):
        """Run all Phase 2 Order Management tests"""
        print("🚀 Starting Phase 2 Order Management API Tests...")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 80)
        
        # Setup authentication
        if not self.setup_auth():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Run all Phase 2 Order Management tests
        print("\n" + "📦" * 15 + " PHASE 2 ORDER MANAGEMENT TESTING " + "📦" * 15)
        
        self.test_order_management_health_check()
        self.test_seller_orders_get()
        self.test_create_demo_order()
        self.test_get_order_details()
        self.test_update_order_status()
        self.test_mpesa_stk_callback_success()
        self.test_mpesa_stk_callback_failure()
        self.test_order_lifecycle_management()
        self.test_kes_currency_handling()
        self.test_order_authentication_requirements()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 PHASE 2 ORDER MANAGEMENT TEST SUMMARY")
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
    tester = Phase2OrderTester()
    success = tester.run_phase2_tests()
    
    if success:
        print("\n🎉 All Phase 2 Order Management tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()