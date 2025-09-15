#!/usr/bin/env python3
"""
Kenya Pilot Week 2 Backend API Test Suite
Tests seller onboarding, M-Pesa integration, and multi-language AI
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

class KenyaPilotTester:
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
    
    def setup_auth(self):
        """Setup authentication for testing"""
        print("🔐 Setting up authentication...")
        
        # Try to register a test user
        user_data = {
            "email": "kenya_seller@aislemarts.com",
            "password": "password123",
            "name": "Kenya Test Seller"
        }
        
        success, data = self.make_request("POST", "/auth/register", user_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("User Registration", True, "Successfully registered and got token")
        else:
            # User might already exist, try to login instead
            success, data = self.make_request("POST", "/auth/login", {
                "email": "kenya_seller@aislemarts.com",
                "password": "password123"
            })
            
            if success and isinstance(data, dict) and "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("User Login", True, "Successfully logged in and got token")
            else:
                self.log_test("Authentication Setup", False, "Could not authenticate")
                return False
        
        return True
    
    # Seller Onboarding & Commission Engine Tests
    def test_seller_health_check(self):
        """Test seller service health check"""
        print("\n🏪 Testing Seller Health Check...")
        
        success, data = self.make_request("GET", "/seller/health")
        
        if success and isinstance(data, dict) and data.get("status") == "healthy":
            service = data.get("service", "unknown")
            commission_rate = data.get("commission_rate", "unknown")
            currency = data.get("supported_currency", "unknown")
            self.log_test("Seller Health Check", True, f"Service: {service}, Commission: {commission_rate}, Currency: {currency}")
        else:
            self.log_test("Seller Health Check", False, str(data))
    
    def test_seller_registration(self):
        """Test seller registration flow"""
        print("\n🏪 Testing Seller Registration...")
        
        if not self.auth_token:
            self.log_test("Seller Registration", False, "No auth token available")
            return
        
        seller_data = {
            "business_name": "Nairobi Electronics Store",
            "business_type": "retail",
            "phone_number": "+254712345678",
            "business_permit": "BP123456",
            "m_pesa_number": "+254712345678",
            "tax_pin": "A123456789P",
            "business_description": "Electronics and mobile phones retailer in Nairobi",
            "business_address": "Tom Mboya Street, Nairobi",
            "business_city": "Nairobi"
        }
        
        success, data = self.make_request("POST", "/seller/register", seller_data)
        
        if success and isinstance(data, dict) and data.get("success") is True:
            seller_id = data.get("seller_id", "unknown")
            trust_score = data.get("trust_score", "unknown")
            verification_status = data.get("verification_status", "unknown")
            self.log_test("Seller Registration", True, f"Seller ID: {seller_id}, Trust Score: {trust_score}, Status: {verification_status}")
            self.seller_id = seller_id
        else:
            # May already be registered
            if "already registered" in str(data).lower():
                self.log_test("Seller Registration", True, "Seller already registered (expected)")
            else:
                self.log_test("Seller Registration", False, str(data))
    
    def test_seller_profile(self):
        """Test getting seller profile"""
        print("\n🏪 Testing Seller Profile...")
        
        if not self.auth_token:
            self.log_test("Seller Profile", False, "No auth token available")
            return
        
        success, data = self.make_request("GET", "/seller/profile")
        
        if success and isinstance(data, dict) and "seller_profile" in data:
            profile = data.get("seller_profile", {})
            business_name = profile.get("business_name", "unknown")
            trust_score = profile.get("trust_score", "unknown")
            commission_rate = profile.get("commission_rate", "unknown")
            self.log_test("Seller Profile", True, f"Business: {business_name}, Trust: {trust_score}, Commission: {commission_rate}")
        else:
            self.log_test("Seller Profile", False, str(data))
    
    def test_seller_demo_simulate_sale(self):
        """Test commission calculation simulation"""
        print("\n🏪 Testing Seller Demo Sale Simulation...")
        
        if not self.auth_token:
            self.log_test("Seller Demo Sale Simulation", False, "No auth token available")
            return
        
        success, data = self.make_request("POST", "/seller/demo/simulate-sale", {
            "amount": 15000.0,
            "currency": "KES"
        })
        
        if success and isinstance(data, dict) and data.get("success") is True:
            details = data.get("details", {})
            commission_amount = details.get("commission_amount", "unknown")
            seller_payout = details.get("seller_payout", "unknown")
            # Check if 1% commission is calculated correctly (15000 * 0.01 = 150)
            expected_commission = 150.0
            actual_commission = details.get("commission_amount", 0)
            if abs(actual_commission - expected_commission) < 0.01:
                self.log_test("Seller Demo Sale Simulation", True, f"✅ 1% Commission calculated correctly: KES {commission_amount}, Seller Payout: KES {seller_payout}")
            else:
                self.log_test("Seller Demo Sale Simulation", False, f"Commission calculation incorrect. Expected: {expected_commission}, Got: {actual_commission}")
        else:
            self.log_test("Seller Demo Sale Simulation", False, str(data))
    
    def test_seller_earnings_current_month(self):
        """Test seller earnings calculation"""
        print("\n🏪 Testing Seller Earnings (Current Month)...")
        
        if not self.auth_token:
            self.log_test("Seller Earnings Current Month", False, "No auth token available")
            return
        
        success, data = self.make_request("GET", "/seller/earnings/current_month")
        
        if success and isinstance(data, dict):
            total_earnings = data.get("total_earnings", 0)
            total_sales = data.get("total_sales", 0)
            commission_earned = data.get("commission_earned", 0)
            self.log_test("Seller Earnings Current Month", True, f"Earnings: KES {total_earnings}, Sales: {total_sales}, Commission: KES {commission_earned}")
        else:
            self.log_test("Seller Earnings Current Month", False, str(data))
    
    def test_seller_commissions(self):
        """Test seller commission history"""
        print("\n🏪 Testing Seller Commissions...")
        
        if not self.auth_token:
            self.log_test("Seller Commissions", False, "No auth token available")
            return
        
        success, data = self.make_request("GET", "/seller/commissions", {"limit": 10})
        
        if success and isinstance(data, dict) and "commissions" in data:
            commissions = data.get("commissions", [])
            total_count = data.get("total_count", 0)
            self.log_test("Seller Commissions", True, f"Found {len(commissions)} commissions, Total: {total_count}")
        else:
            self.log_test("Seller Commissions", False, str(data))
    
    # M-Pesa Integration Tests
    def test_mpesa_health_check(self):
        """Test M-Pesa service health check"""
        print("\n💰 Testing M-Pesa Health Check...")
        
        success, data = self.make_request("GET", "/mpesa/health")
        
        if success and isinstance(data, dict) and data.get("status") == "healthy":
            service = data.get("service", "unknown")
            currency = data.get("supported_currency", "unknown")
            min_amount = data.get("min_amount", "unknown")
            max_amount = data.get("max_amount", "unknown")
            environment = data.get("environment", "unknown")
            self.log_test("M-Pesa Health Check", True, f"Service: {service}, Currency: {currency}, Range: {min_amount}-{max_amount}, Env: {environment}")
        else:
            self.log_test("M-Pesa Health Check", False, str(data))
    
    def test_mpesa_validate_phone(self):
        """Test Kenya phone validation (+254712345678)"""
        print("\n💰 Testing M-Pesa Phone Validation...")
        
        # Test valid Kenya phone number as specified in requirements
        test_phone = "+254712345678"
        success, data = self.make_request("POST", "/mpesa/validate-phone", {
            "phone_number": test_phone
        })
        
        if success and isinstance(data, dict) and data.get("valid") is True:
            formatted_number = data.get("formatted_number", "unknown")
            self.log_test("M-Pesa Phone Validation (Kenya +254712345678)", True, f"✅ Valid Kenya number: {formatted_number}")
        else:
            self.log_test("M-Pesa Phone Validation (Kenya +254712345678)", False, str(data))
        
        # Test invalid phone number
        success, data = self.make_request("POST", "/mpesa/validate-phone", {
            "phone_number": "+1234567890"
        })
        
        if success and isinstance(data, dict) and data.get("valid") is False:
            self.log_test("M-Pesa Phone Validation (Invalid)", True, "✅ Correctly rejected invalid phone")
        else:
            self.log_test("M-Pesa Phone Validation (Invalid)", False, "Should reject invalid phone numbers")
    
    def test_mpesa_demo_simulate_payment(self):
        """Test M-Pesa payment simulation"""
        print("\n💰 Testing M-Pesa Demo Payment Simulation...")
        
        if not self.auth_token:
            self.log_test("M-Pesa Demo Payment Simulation", False, "No auth token available")
            return
        
        success, data = self.make_request("POST", "/mpesa/demo/simulate-payment", {
            "amount": 1000.0,
            "phone_number": "+254712345678"
        })
        
        if success and isinstance(data, dict) and data.get("success") is True:
            payment_details = data.get("payment_details", {})
            amount = payment_details.get("amount", "unknown")
            phone = payment_details.get("phone_number", "unknown")
            status = payment_details.get("status", "unknown")
            self.log_test("M-Pesa Demo Payment Simulation", True, f"✅ Payment simulated: {amount}, Phone: {phone}, Status: {status}")
        else:
            self.log_test("M-Pesa Demo Payment Simulation", False, str(data))
    
    def test_mpesa_test_integration(self):
        """Test M-Pesa integration status"""
        print("\n💰 Testing M-Pesa Integration Status...")
        
        success, data = self.make_request("GET", "/mpesa/test-integration")
        
        if success and isinstance(data, dict) and data.get("integration_status") == "healthy":
            tests = data.get("tests", {})
            phone_test = tests.get("phone_validation", {}).get("status", "unknown")
            currency_test = tests.get("currency_formatting", {}).get("status", "unknown")
            service_test = tests.get("service_connection", {}).get("status", "unknown")
            ready = data.get("ready_for_payments", False)
            self.log_test("M-Pesa Integration Test", True, f"✅ Integration healthy - Phone: {phone_test}, Currency: {currency_test}, Service: {service_test}, Ready: {ready}")
        else:
            self.log_test("M-Pesa Integration Test", False, str(data))
    
    # Multi-Language AI Tests
    def test_multilang_health_check(self):
        """Test multi-language AI service health check"""
        print("\n🌍 Testing Multi-Language AI Health Check...")
        
        success, data = self.make_request("GET", "/multilang/health")
        
        if success and isinstance(data, dict) and data.get("status") == "healthy":
            service = data.get("service", "unknown")
            total_languages = data.get("total_languages", 0)
            supported_languages = data.get("supported_languages", [])
            features = data.get("features", [])
            # Check for expected 5 languages: English, Turkish, Arabic, Swahili, French
            if total_languages >= 5:
                self.log_test("Multi-Language AI Health Check", True, f"✅ Service: {service}, Languages: {total_languages}/5, Features: {len(features)}")
            else:
                self.log_test("Multi-Language AI Health Check", False, f"Expected 5 languages, got {total_languages}")
        else:
            self.log_test("Multi-Language AI Health Check", False, str(data))
    
    def test_multilang_languages(self):
        """Test getting supported languages (English, Turkish, Arabic, Swahili, French)"""
        print("\n🌍 Testing Multi-Language Supported Languages...")
        
        success, data = self.make_request("GET", "/multilang/languages")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            languages_info = data.get("languages_info", {})
            language_count = len(languages_info)
            # Check for expected languages: English, Turkish, Arabic, Swahili, French
            expected_languages = ['en', 'tr', 'ar', 'sw', 'fr']
            found_languages = [lang for lang in expected_languages if lang in languages_info]
            if len(found_languages) >= 5:
                self.log_test("Multi-Language Supported Languages", True, f"✅ Found {language_count} languages, All expected languages present: {found_languages}")
            else:
                self.log_test("Multi-Language Supported Languages", False, f"Missing languages. Found: {found_languages}, Expected: {expected_languages}")
        else:
            self.log_test("Multi-Language Supported Languages", False, str(data))
    
    def test_multilang_greeting_swahili(self):
        """Test Swahili greeting (should respond with 'Hujambo')"""
        print("\n🌍 Testing Multi-Language Swahili Greeting...")
        
        success, data = self.make_request("POST", "/multilang/greeting", {
            "language": "sw",
            "user_name": "Amina",
            "time_of_day": "morning"
        })
        
        if success and isinstance(data, dict) and data.get("success") is True:
            greeting = data.get("localized_greeting", {})
            greeting_text = greeting.get("greeting", "")
            # Check if greeting contains "Hujambo" or similar Swahili greeting
            if "hujambo" in greeting_text.lower() or "habari" in greeting_text.lower() or "salama" in greeting_text.lower():
                self.log_test("Multi-Language Swahili Greeting", True, f"✅ Swahili greeting received: {greeting_text[:50]}...")
            else:
                self.log_test("Multi-Language Swahili Greeting", False, f"Expected Swahili greeting with 'Hujambo', got: {greeting_text}")
        else:
            self.log_test("Multi-Language Swahili Greeting", False, str(data))
    
    def test_multilang_chat_swahili(self):
        """Test Swahili AI chat with 'Nahitaji simu ya biashara'"""
        print("\n🌍 Testing Multi-Language Swahili Chat...")
        
        success, data = self.make_request("POST", "/multilang/chat", {
            "message": "Nahitaji simu ya biashara",
            "language": "sw",
            "user_name": "Amina"
        })
        
        if success and isinstance(data, dict) and data.get("success") is True:
            ai_response = data.get("ai_response", {})
            response_text = ai_response.get("response", "")
            cultural_style = ai_response.get("cultural_style", "")
            request_language = data.get("request_language", "")
            if request_language == "sw" and len(response_text) > 0:
                self.log_test("Multi-Language Swahili Chat", True, f"✅ Swahili AI response ({cultural_style} style): {response_text[:50]}...")
            else:
                self.log_test("Multi-Language Swahili Chat", False, f"Expected Swahili response, got: {response_text}")
        else:
            self.log_test("Multi-Language Swahili Chat", False, str(data))
    
    def test_multilang_demo_conversation_swahili(self):
        """Test Swahili conversation demo"""
        print("\n🌍 Testing Multi-Language Swahili Demo Conversation...")
        
        success, data = self.make_request("POST", "/multilang/demo/conversation", {
            "language": "sw",
            "user_name": "Amina"
        })
        
        if success and isinstance(data, dict) and data.get("success") is True:
            conversation_flow = data.get("conversation_flow", [])
            demo_language = data.get("demo_language", "")
            language_name = data.get("language_name", "")
            communication_style = data.get("communication_style", "")
            if demo_language == "sw" and len(conversation_flow) >= 4:
                self.log_test("Multi-Language Swahili Demo Conversation", True, f"✅ Complete Swahili conversation: {language_name}, Steps: {len(conversation_flow)}, Style: {communication_style}")
            else:
                self.log_test("Multi-Language Swahili Demo Conversation", False, f"Expected complete Swahili demo, got: {demo_language} with {len(conversation_flow)} steps")
        else:
            self.log_test("Multi-Language Swahili Demo Conversation", False, str(data))
    
    def test_multilang_test_languages(self):
        """Test all 5 languages (English, Turkish, Arabic, Swahili, French)"""
        print("\n🌍 Testing Multi-Language All Languages Test...")
        
        success, data = self.make_request("GET", "/multilang/test-languages")
        
        if success and isinstance(data, dict) and data.get("success") is True:
            summary = data.get("summary", {})
            total_languages = summary.get("total_languages", 0)
            successful_languages = summary.get("successful_languages", 0)
            success_rate = summary.get("success_rate", "0%")
            failed_languages = summary.get("failed_languages", [])
            
            # Expect at least 4/5 languages to work (80% success rate)
            if successful_languages >= 4 and total_languages >= 5:
                self.log_test("Multi-Language All Languages Test", True, f"✅ Excellent success rate: {success_rate} ({successful_languages}/{total_languages})")
            else:
                self.log_test("Multi-Language All Languages Test", False, f"Low success rate: {success_rate}, Failed: {failed_languages}")
        else:
            self.log_test("Multi-Language All Languages Test", False, str(data))
    
    def run_kenya_pilot_tests(self):
        """Run all Kenya pilot tests"""
        print("🇰🇪 KENYA PILOT WEEK 2 - TRI-TRACK EXECUTION TESTING")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 80)
        
        # Setup authentication
        if not self.setup_auth():
            print("❌ Authentication setup failed. Cannot proceed with tests.")
            return False
        
        print("\n" + "🏪" * 15 + " SELLER ONBOARDING & COMMISSION ENGINE " + "🏪" * 15)
        self.test_seller_health_check()
        self.test_seller_registration()
        self.test_seller_profile()
        self.test_seller_demo_simulate_sale()
        self.test_seller_earnings_current_month()
        self.test_seller_commissions()
        
        print("\n" + "💰" * 15 + " M-PESA INTEGRATION " + "💰" * 15)
        self.test_mpesa_health_check()
        self.test_mpesa_validate_phone()
        self.test_mpesa_demo_simulate_payment()
        self.test_mpesa_test_integration()
        
        print("\n" + "🌍" * 15 + " MULTI-LANGUAGE AI " + "🌍" * 15)
        self.test_multilang_health_check()
        self.test_multilang_languages()
        self.test_multilang_greeting_swahili()
        self.test_multilang_chat_swahili()
        self.test_multilang_demo_conversation_swahili()
        self.test_multilang_test_languages()
        
        # Print Summary
        print("\n" + "=" * 80)
        print("📊 KENYA PILOT TEST SUMMARY")
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
        
        success_rate = (passed/total)*100
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        # Kenya pilot specific success criteria
        if success_rate >= 85:
            print("🎉 EXCELLENT: Kenya pilot backend is ready for launch!")
        elif success_rate >= 70:
            print("⚠️  GOOD: Kenya pilot backend mostly working, minor issues to fix")
        else:
            print("❌ CRITICAL: Kenya pilot backend needs significant fixes before launch")
        
        return passed == total

def main():
    """Main test runner"""
    tester = KenyaPilotTester()
    success = tester.run_kenya_pilot_tests()
    
    if success:
        print("\n🎉 All Kenya pilot tests passed! Backend is ready for Kenya launch.")
        sys.exit(0)
    else:
        print("\n⚠️  Some Kenya pilot tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()