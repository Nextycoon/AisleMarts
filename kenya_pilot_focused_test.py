#!/usr/bin/env python3
"""
KENYA PILOT FOCUSED VALIDATION - P0 CRITICAL TESTS ONLY
Focus on the 6 critical areas mentioned in the review request
"""

import requests
import json
from datetime import datetime

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

class KenyaP0Tester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.p0_passed = 0
        self.p0_total = 0
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log P0 test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
        self.p0_total += 1
        if success:
            self.p0_passed += 1
        
    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None):
        """Make HTTP request"""
        url = f"{API_URL}{endpoint}"
        
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=data)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers)
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
                    
        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def setup_auth(self):
        """Setup authentication"""
        print("🔐 Setting up authentication...")
        
        # Try login first
        success, data = self.make_request("POST", "/auth/login", {
            "email": "buyer@aislemarts.com",
            "password": "password123"
        })
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            return True
        
        # If login fails, try registration
        success, data = self.make_request("POST", "/auth/register", {
            "email": "buyer@aislemarts.com",
            "password": "password123",
            "name": "Kenya Test Buyer"
        })
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            return True
        
        return False

    def test_p0_buyer_flow(self):
        """P0 TEST 1: End-to-End Buyer Flow"""
        print("\n🇰🇪 P0 TEST 1: END-TO-END BUYER FLOW VALIDATION")
        print("="*60)
        
        # Test product browsing
        success, data = self.make_request("GET", "/products")
        if success and isinstance(data, list) and len(data) > 0:
            self.log_test("Product Browsing", True, f"Found {len(data)} products")
            self.test_product_id = data[0].get("id") or data[0].get("_id")
        else:
            self.log_test("Product Browsing", False, str(data))
            return
        
        # Test AI recommendations
        success, data = self.make_request("POST", "/ai/recommendations", {
            "query": "I need electronics for business in Nairobi",
            "max_results": 5
        })
        if success and isinstance(data, dict) and "recommendations" in data:
            recs = data.get("recommendations", [])
            self.log_test("AI Product Recommendations", True, f"Found {len(recs)} AI recommendations")
        else:
            self.log_test("AI Product Recommendations", False, str(data))

    def test_p0_mpesa_system(self):
        """P0 TEST 2: M-Pesa Payment System"""
        print("\n🇰🇪 P0 TEST 2: M-PESA PAYMENT SYSTEM (CRITICAL FOR KENYA)")
        print("="*60)
        
        # Test M-Pesa health
        success, data = self.make_request("GET", "/mpesa/health")
        if success and isinstance(data, dict) and data.get("status") == "healthy":
            currency = data.get("supported_currency")
            if currency == "KES":
                self.log_test("M-Pesa Health Check", True, f"Currency: {currency}, Environment: {data.get('environment')}")
            else:
                self.log_test("M-Pesa Health Check", False, f"Wrong currency: {currency}")
        else:
            self.log_test("M-Pesa Health Check", False, str(data))
        
        # Test Kenya phone validation
        success, data = self.make_request("POST", "/mpesa/validate-phone", {
            "phone_number": "+254712345678"
        })
        if success and isinstance(data, dict) and data.get("valid") is True:
            formatted = data.get("formatted_number")
            self.log_test("Kenya Phone Validation (+254)", True, f"Formatted: {formatted}")
        else:
            self.log_test("Kenya Phone Validation (+254)", False, str(data))
        
        # Test payment simulation
        success, data = self.make_request("POST", "/mpesa/demo/simulate-payment", {
            "amount": 1000.0,
            "phone_number": "+254712345678"
        })
        if success and isinstance(data, dict) and data.get("success") is True:
            amount = data.get("payment_details", {}).get("amount", "")
            if "KSh" in amount:
                self.log_test("M-Pesa Payment Simulation", True, f"Simulated payment: {amount}")
            else:
                self.log_test("M-Pesa Payment Simulation", False, f"Wrong currency format: {amount}")
        else:
            self.log_test("M-Pesa Payment Simulation", False, str(data))

    def test_p0_seller_orders(self):
        """P0 TEST 3: Seller Orders Management"""
        print("\n🇰🇪 P0 TEST 3: SELLER ORDERS MANAGEMENT")
        print("="*60)
        
        # Test seller registration/profile
        success, data = self.make_request("GET", "/seller/profile")
        if success and isinstance(data, dict) and "seller_profile" in data:
            profile = data["seller_profile"]
            commission = profile.get("commission_rate")
            city = profile.get("business_city")
            self.log_test("Seller Profile", True, f"Business: {profile.get('business_name')}, City: {city}, Commission: {commission}")
        else:
            # Try to register seller
            success, data = self.make_request("POST", "/seller/register", {
                "business_name": "Kenya Test Store",
                "business_type": "individual",
                "phone_number": "+254712345678",
                "business_city": "Nairobi"
            })
            if success and isinstance(data, dict) and data.get("success") is True:
                self.log_test("Seller Registration", True, f"Seller ID: {data.get('seller_id')}")
            else:
                self.log_test("Seller Registration", False, str(data))
        
        # Test orders listing
        success, data = self.make_request("GET", "/seller/orders")
        if success and isinstance(data, dict) and data.get("success") is True:
            count = data.get("count", 0)
            self.log_test("Seller Orders Listing", True, f"Found {count} orders")
        else:
            self.log_test("Seller Orders Listing", False, str(data))

    def test_p0_commission_accuracy(self):
        """P0 TEST 4: Commission Engine Accuracy (1% verification)"""
        print("\n🇰🇪 P0 TEST 4: COMMISSION ENGINE ACCURACY (1% VERIFICATION)")
        print("="*60)
        
        # Test commission calculation with specific amounts
        test_amounts = [1000.0, 5000.0, 15000.0]
        
        for amount in test_amounts:
            success, data = self.make_request("POST", "/seller/demo/simulate-sale", {
                "amount": amount,
                "currency": "KES"
            })
            
            if success and isinstance(data, dict) and data.get("success") is True:
                details = data.get("details", {})
                gross = details.get("gross_amount", 0)
                commission = details.get("commission_amount", 0)
                payout = details.get("seller_payout", 0)
                
                # Verify 1% commission (1.00% ± 0.01%)
                if gross > 0:
                    commission_rate = (commission / gross) * 100
                    precision_ok = abs(commission_rate - 1.0) <= 0.01
                    
                    if precision_ok:
                        self.log_test(f"Commission Calculation (KES {amount})", True, f"Commission: KES {commission} ({commission_rate:.2f}%), Payout: KES {payout}")
                    else:
                        self.log_test(f"Commission Calculation (KES {amount})", False, f"Rate: {commission_rate:.4f}%, Expected: 1.00%")
                else:
                    self.log_test(f"Commission Calculation (KES {amount})", False, "No gross amount")
            else:
                self.log_test(f"Commission Calculation (KES {amount})", False, str(data))

    def test_p0_multilang_ai(self):
        """P0 TEST 5: Multi-Language AI (Kenya Focus - Swahili)"""
        print("\n🇰🇪 P0 TEST 5: MULTI-LANGUAGE AI (KENYA FOCUS - SWAHILI)")
        print("="*60)
        
        # Test multi-language health
        success, data = self.make_request("GET", "/multilang/health")
        if success and isinstance(data, dict) and data.get("status") == "healthy":
            languages = data.get("supported_languages", [])
            if "sw" in languages:
                self.log_test("Multi-Language AI Health", True, f"Languages: {len(languages)}, Swahili: ✓")
            else:
                self.log_test("Multi-Language AI Health", False, f"Swahili not supported: {languages}")
        else:
            self.log_test("Multi-Language AI Health", False, str(data))
        
        # Test Swahili greeting
        success, data = self.make_request("POST", "/multilang/greeting", {
            "language": "sw",
            "user_name": "Amina",
            "time_of_day": "morning"
        })
        if success and isinstance(data, dict) and data.get("success") is True:
            greeting = data.get("localized_greeting", {}).get("greeting", "")
            swahili_words = ["Habari", "Hujambo", "Karibu", "Amina"]
            has_swahili = any(word in greeting for word in swahili_words)
            if has_swahili:
                self.log_test("Swahili Greeting", True, f"Greeting: '{greeting[:50]}...'")
            else:
                self.log_test("Swahili Greeting", False, f"No Swahili detected: {greeting}")
        else:
            self.log_test("Swahili Greeting", False, str(data))
        
        # Test Swahili AI chat
        success, data = self.make_request("POST", "/multilang/chat", {
            "message": "Nahitaji simu ya biashara",
            "language": "sw",
            "user_name": "Wanjiku"
        })
        if success and isinstance(data, dict) and data.get("success") is True:
            response = data.get("ai_response", {}).get("response", "")
            if len(response) > 50:
                self.log_test("Swahili AI Chat", True, f"Response length: {len(response)} chars")
            else:
                self.log_test("Swahili AI Chat", False, f"Short response: {response}")
        else:
            self.log_test("Swahili AI Chat", False, str(data))

    def test_p0_analytics_monitoring(self):
        """P0 TEST 6: Analytics & Monitoring"""
        print("\n🇰🇪 P0 TEST 6: ANALYTICS & MONITORING")
        print("="*60)
        
        # Test seller analytics
        success, data = self.make_request("GET", "/seller/analytics/summary")
        if success and isinstance(data, dict) and data.get("success") is True:
            analytics = data.get("analytics", {})
            currency = analytics.get("currency")
            revenue = analytics.get("revenue_30d", 0)
            orders = analytics.get("orders_30d", 0)
            
            if currency == "KES":
                self.log_test("Seller Analytics Summary", True, f"Currency: {currency}, Revenue: {revenue}, Orders: {orders}")
            else:
                self.log_test("Seller Analytics Summary", False, f"Wrong currency: {currency}")
        else:
            self.log_test("Seller Analytics Summary", False, str(data))
        
        # Test analytics timeseries
        success, data = self.make_request("GET", "/seller/analytics/timeseries", {
            "metric": "revenue",
            "period": "30d"
        })
        if success and isinstance(data, dict) and data.get("success") is True:
            data_points = data.get("data", [])
            valid_structure = all(
                isinstance(point, dict) and "date" in point and "value" in point
                for point in data_points
            )
            if valid_structure:
                self.log_test("Analytics Timeseries Data", True, f"Data points: {len(data_points)}")
            else:
                self.log_test("Analytics Timeseries Data", False, "Invalid data structure")
        else:
            self.log_test("Analytics Timeseries Data", False, str(data))

    def run_p0_tests(self):
        """Run all P0 critical tests"""
        print("🇰🇪 KENYA PILOT READINESS VALIDATION - P0 CRITICAL TESTS")
        print("="*80)
        print(f"🌐 Testing against: {BASE_URL}")
        print("="*80)
        
        if not self.setup_auth():
            print("❌ CRITICAL: Authentication setup failed")
            return
        
        print("✅ Authentication setup successful")
        
        # Run all P0 tests
        self.test_p0_buyer_flow()
        self.test_p0_mpesa_system()
        self.test_p0_seller_orders()
        self.test_p0_commission_accuracy()
        self.test_p0_multilang_ai()
        self.test_p0_analytics_monitoring()
        
        # Final results
        self.print_results()

    def print_results(self):
        """Print final P0 test results"""
        print("\n" + "="*80)
        print("🇰🇪 KENYA PILOT P0 CRITICAL TESTS - FINAL RESULTS")
        print("="*80)
        
        success_rate = (self.p0_passed / self.p0_total) * 100 if self.p0_total > 0 else 0
        
        print(f"\n📊 P0 CRITICAL RESULTS:")
        print(f"   Total P0 Tests: {self.p0_total}")
        print(f"   Passed: {self.p0_passed}")
        print(f"   Failed: {self.p0_total - self.p0_passed}")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        # GO-LIVE DECISION
        go_live_ready = success_rate >= 96.0  # Target: ≥96% from requirements
        
        print(f"\n🚀 GO-LIVE READINESS:")
        if go_live_ready:
            print("   ✅ READY FOR KENYA PILOT LAUNCH")
            print("   All critical P0 tests meet the ≥96% success rate requirement")
        else:
            print("   ❌ NOT READY FOR GO-LIVE")
            print("   P0 success rate below 96% requirement")
        
        # Failed tests
        failed_tests = [r for r in self.test_results if not r["success"]]
        if failed_tests:
            print(f"\n❌ FAILED P0 TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        # Kenya-specific validations
        print(f"\n🇰🇪 KENYA PILOT SPECIFIC VALIDATIONS:")
        kenya_checks = [
            ("M-Pesa Integration", any("M-Pesa" in r["test"] and r["success"] for r in self.test_results)),
            ("KES Currency Support", any("KES" in r["details"] for r in self.test_results if r["success"])),
            ("Swahili Language", any("Swahili" in r["test"] and r["success"] for r in self.test_results)),
            ("1% Commission Rate", any("Commission" in r["test"] and "1%" in r["details"] and r["success"] for r in self.test_results)),
            ("+254 Phone Format", any("+254" in r["details"] and r["success"] for r in self.test_results))
        ]
        
        for check, status in kenya_checks:
            icon = "✅" if status else "❌"
            print(f"   {icon} {check}")
        
        print("="*80)

if __name__ == "__main__":
    tester = KenyaP0Tester()
    tester.run_p0_tests()