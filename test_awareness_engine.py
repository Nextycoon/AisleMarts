#!/usr/bin/env python3
"""
AisleMarts Awareness Engine Test Suite
Tests the comprehensive awareness engine functionality
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

class AwarenessEngineTest:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.user_id = None
        self.test_awareness_session_id = None
        
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
        
        # Try to login first
        login_data = {
            "email": "buyer@aislemarts.com",
            "password": "password123"
        }
        
        success, data = self.make_request("POST", "/auth/login", login_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            print("✅ Authentication successful")
            
            # Get user info
            success, user_data = self.make_request("GET", "/auth/me")
            if success and isinstance(user_data, dict):
                self.user_id = user_data.get("id") or user_data.get("_id")
                print(f"✅ User ID: {self.user_id}")
        else:
            print("❌ Authentication failed, trying registration...")
            # Try registration
            reg_data = {
                "email": "buyer@aislemarts.com",
                "password": "password123",
                "name": "Test Buyer"
            }
            
            success, data = self.make_request("POST", "/auth/register", reg_data)
            if success and isinstance(data, dict) and "access_token" in data:
                self.auth_token = data["access_token"]
                print("✅ Registration and authentication successful")
            else:
                print("❌ Both login and registration failed")
                return False
        
        return True
    
    def test_awareness_health_check(self):
        """Test Awareness Engine health check"""
        print("\n🧠 Testing Awareness Engine - Health Check...")
        
        success, data = self.make_request("GET", "/awareness/health")
        
        if success and isinstance(data, dict) and data.get("status") == "operational":
            service = data.get("service")
            capabilities = data.get("capabilities", [])
            active_profiles = data.get("active_profiles", 0)
            supported_languages = data.get("supported_languages", [])
            supported_currencies = data.get("supported_currencies", [])
            self.log_test("Awareness Engine Health Check", True, f"Service: {service}, Capabilities: {len(capabilities)}, Languages: {len(supported_languages)}, Currencies: {len(supported_currencies)}, Active Profiles: {active_profiles}")
        else:
            self.log_test("Awareness Engine Health Check", False, str(data))
    
    def test_awareness_detect_context(self):
        """Test comprehensive context detection"""
        print("\n🧠 Testing Awareness Engine - Context Detection...")
        
        if not self.auth_token:
            self.log_test("Awareness Context Detection", False, "No auth token available")
            return
        
        # Test context detection with various headers
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
            "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
            "X-Forwarded-For": "192.168.1.100"
        }
        
        success, data = self.make_request("POST", "/awareness/detect-context", {}, headers)
        
        if success and isinstance(data, dict) and data.get("session_id"):
            self.test_awareness_session_id = data.get("session_id")
            user_context = data.get("user_context", {})
            location_context = data.get("location_context", {})
            time_context = data.get("time_context", {})
            currency_context = data.get("currency_context", {})
            device_context = data.get("device_context", {})
            language = data.get("language")
            personalization_score = data.get("personalization_score", 0)
            
            self.log_test("Awareness Context Detection", True, f"Session: {self.test_awareness_session_id[:12]}..., Language: {language}, Score: {personalization_score}, Device: {device_context.get('device_type')}, Location: {location_context.get('country')}")
        else:
            self.log_test("Awareness Context Detection", False, str(data))
    
    def test_awareness_adaptive_response(self):
        """Test adaptive response generation"""
        print("\n🧠 Testing Awareness Engine - Adaptive Response...")
        
        if not self.auth_token:
            self.log_test("Awareness Adaptive Response", False, "No auth token available")
            return
        
        if not hasattr(self, 'test_awareness_session_id') or not self.test_awareness_session_id:
            self.log_test("Awareness Adaptive Response", False, "No awareness session ID available")
            return
        
        # Test adaptive response for homepage
        success, data = self.make_request("GET", f"/awareness/adaptive-response/{self.test_awareness_session_id}", {"content_type": "homepage"})
        
        if success and isinstance(data, dict):
            ui_config = data.get("ui_config", {})
            content_adaptations = data.get("content_adaptations", {})
            pricing_adjustments = data.get("pricing_adjustments", {})
            language_pack = data.get("language_pack", {})
            recommendations = data.get("recommendations", [])
            notifications = data.get("notifications", [])
            
            self.log_test("Awareness Adaptive Response (Homepage)", True, f"UI Config: {len(ui_config)} settings, Content: {len(content_adaptations)} adaptations, Pricing: {len(pricing_adjustments)} adjustments, Language Pack: {len(language_pack)} translations, Recommendations: {len(recommendations)}, Notifications: {len(notifications)}")
        else:
            self.log_test("Awareness Adaptive Response (Homepage)", False, str(data))
    
    def test_awareness_update_preferences(self):
        """Test updating user preferences"""
        print("\n🧠 Testing Awareness Engine - Update Preferences...")
        
        if not self.auth_token:
            self.log_test("Awareness Update Preferences", False, "No auth token available")
            return
        
        if not hasattr(self, 'test_awareness_session_id') or not self.test_awareness_session_id:
            self.log_test("Awareness Update Preferences", False, "No awareness session ID available")
            return
        
        # Test updating language preference
        language_preferences = {
            "language": "es",
            "currency": "EUR",
            "privacy_settings": {
                "location_sharing": False,
                "behavioral_tracking": True,
                "personalized_ads": True
            }
        }
        
        success, data = self.make_request("PUT", f"/awareness/update-preferences/{self.test_awareness_session_id}", language_preferences)
        
        if success and isinstance(data, dict) and data.get("status") == "updated":
            session_id = data.get("session_id")
            personalization_score = data.get("personalization_score", 0)
            updated_preferences = data.get("updated_preferences", [])
            self.log_test("Awareness Update Preferences", True, f"Session: {session_id[:12]}..., Score: {personalization_score}, Updated: {updated_preferences}")
        else:
            self.log_test("Awareness Update Preferences", False, str(data))
    
    def test_awareness_currency_rates(self):
        """Test real-time currency exchange rates"""
        print("\n🧠 Testing Awareness Engine - Currency Rates...")
        
        # Test getting all currency rates
        success, data = self.make_request("GET", "/awareness/currency-rates")
        
        if success and isinstance(data, dict) and "rates" in data:
            base_currency = data.get("base_currency")
            rates = data.get("rates", {})
            last_updated = data.get("last_updated")
            source = data.get("source")
            self.log_test("Awareness Currency Rates (All)", True, f"Base: {base_currency}, Rates: {len(rates)} currencies, Source: {source}")
        else:
            self.log_test("Awareness Currency Rates (All)", False, str(data))
    
    def run_all_tests(self):
        """Run all awareness engine tests"""
        print("🚀 Starting AisleMarts Awareness Engine Test Suite...")
        print(f"🔗 Testing against: {BASE_URL}")
        print("=" * 80)
        
        # Setup authentication
        if not self.setup_auth():
            print("❌ Authentication setup failed, cannot continue")
            return False
        
        # Run awareness engine tests
        print("\n" + "🧠" * 15 + " AWARENESS ENGINE TESTING " + "🧠" * 15)
        
        self.test_awareness_health_check()
        self.test_awareness_detect_context()
        self.test_awareness_adaptive_response()
        self.test_awareness_update_preferences()
        self.test_awareness_currency_rates()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 AWARENESS ENGINE TEST SUMMARY")
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
    tester = AwarenessEngineTest()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All awareness engine tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️  Some awareness engine tests failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()