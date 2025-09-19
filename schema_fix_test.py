#!/usr/bin/env python3
"""
Schema Fix Validation Test Suite
Focus on the 3 specific endpoints that were failing with schema issues
"""

import requests
import json
import sys

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

class SchemaFixTester:
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
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=headers)
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
        """Setup authentication"""
        print("🔐 Setting up authentication...")
        
        # Try to login
        login_data = {
            "email": "buyer@aislemarts.com",
            "password": "password123"
        }
        
        success, data = self.make_request("POST", "/auth/login", login_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            print("✅ Authentication successful")
            
            # Get user details
            success, user_data = self.make_request("GET", "/auth/me")
            if success:
                self.user_id = user_data.get("id") or user_data.get("_id")
                print(f"✅ User ID: {self.user_id}")
            return True
        else:
            print(f"❌ Authentication failed: {data}")
            return False
    
    def test_calls_initiate_schema_fix(self):
        """Test Voice/Video Calls initiate endpoint with schema fix (callee_id only)"""
        print("\n📞 Testing Calls Initiate - Schema Fix (callee_id only)...")
        
        if not self.auth_token:
            self.log_test("Calls Initiate Schema Fix", False, "No auth token available")
            return
        
        # Test with callee_id only (the fix should accept this)
        call_request = {
            "callee_id": "user_alice_123",
            "mode": "voice"
        }
        
        success, data = self.make_request("POST", "/calls/initiate", call_request)
        
        if success and isinstance(data, dict) and data.get("call_id"):
            call_id = data.get("call_id")
            caller_id = data.get("caller_id")
            callee_id = data.get("callee_id")
            mode = data.get("mode")
            status = data.get("status")
            self.log_test("Calls Initiate Schema Fix", True, f"Call initiated: {call_id[:8]}..., caller: {caller_id}, callee: {callee_id}, mode: {mode}, status: {status}")
        else:
            self.log_test("Calls Initiate Schema Fix", False, str(data))
    
    def test_channels_create_schema_fix(self):
        """Test Channels create endpoint with schema fix (channel_type field)"""
        print("\n📺 Testing Channels Create - Schema Fix (channel_type field)...")
        
        if not self.auth_token:
            self.log_test("Channels Create Schema Fix", False, "No auth token available")
            return
        
        # Test with type field (the correct field name based on alias)
        channel_request = {
            "type": "group",
            "title": "Test Group Channel",
            "description": "A test group channel for schema validation",
            "is_public": True,
            "theme": "gold"
        }
        
        success, data = self.make_request("POST", "/channels", channel_request)
        
        if success and isinstance(data, dict) and data.get("id"):
            channel_id = data.get("id")
            title = data.get("title")
            channel_type = data.get("type")
            owner_id = data.get("owner_id")
            theme = data.get("theme")
            self.log_test("Channels Create Schema Fix", True, f"Channel created: {channel_id[:8]}..., title: {title}, type: {channel_type}, owner: {owner_id}, theme: {theme}")
        else:
            self.log_test("Channels Create Schema Fix", False, str(data))
    
    def test_business_livesale_routing_fix(self):
        """Test Business LiveSale Management routing fix (POST /api/biz/livesales)"""
        print("\n🏢 Testing Business LiveSale Management - Routing Fix...")
        
        if not self.auth_token:
            self.log_test("Business LiveSale Routing Fix", False, "No auth token available")
            return
        
        # Test creating a business LiveSale
        livesale_request = {
            "title": "Test Business LiveSale",
            "description": "Testing the routing fix for business LiveSale creation",
            "starts_at": "2024-12-20T15:00:00Z",
            "duration_minutes": 60,
            "products": [
                {
                    "product_id": "prod_test_123",
                    "special_price": 99.99,
                    "quantity_available": 50
                }
            ],
            "thumbnail_url": "https://example.com/thumbnail.jpg"
        }
        
        success, data = self.make_request("POST", "/biz/livesales", livesale_request)
        
        if success and isinstance(data, dict) and data.get("id"):
            livesale_id = data.get("id")
            title = data.get("title")
            vendor_id = data.get("vendor_id")
            status = data.get("status")
            starts_at = data.get("starts_at")
            self.log_test("Business LiveSale Routing Fix", True, f"LiveSale created: {livesale_id[:8]}..., title: {title}, vendor: {vendor_id}, status: {status}, starts: {starts_at}")
        else:
            # Check if it's a 404 (routing issue) or other error
            if "404" in str(data):
                self.log_test("Business LiveSale Routing Fix", False, f"ROUTING ISSUE: {data} - business_router not properly included")
            else:
                self.log_test("Business LiveSale Routing Fix", False, str(data))
    
    def test_existing_working_features(self):
        """Quick validation that existing working features still work"""
        print("\n✅ Testing Existing Working Features...")
        
        # Test DM system
        dm_request = {
            "participants": ["user_alice", "user_bob"],
            "title": "Test DM",
            "channel_type": "direct"
        }
        
        success, data = self.make_request("POST", "/dm/conversations", dm_request)
        if success:
            self.log_test("DM System Still Working", True, "Direct messaging conversation created successfully")
        else:
            self.log_test("DM System Still Working", False, str(data))
        
        # Test Consumer LiveSale APIs
        success, data = self.make_request("GET", "/livesale")
        if success:
            self.log_test("Consumer LiveSale APIs Still Working", True, f"Found {len(data)} LiveSales")
        else:
            self.log_test("Consumer LiveSale APIs Still Working", False, str(data))
        
        # Test Business Leads
        success, data = self.make_request("GET", "/biz/leads")
        if success:
            self.log_test("Business Leads Still Working", True, f"Found {len(data)} leads")
        else:
            self.log_test("Business Leads Still Working", False, str(data))
        
        # Test AI Mood-to-Cart
        success, data = self.make_request("GET", "/mood/health")
        if success:
            self.log_test("AI Mood-to-Cart Still Working", True, f"Service: {data.get('service')}, Status: {data.get('status')}")
        else:
            self.log_test("AI Mood-to-Cart Still Working", False, str(data))
    
    def run_schema_fix_tests(self):
        """Run focused schema fix validation tests"""
        print("🎯 LUXURY COMMUNICATION SUITE SCHEMA FIX VALIDATION")
        print("=" * 80)
        print(f"🔗 Testing against: {BASE_URL}")
        print("=" * 80)
        
        # Setup authentication
        if not self.setup_auth():
            print("❌ Cannot proceed without authentication")
            return False
        
        print("\n🎯 PRIORITY: Testing Schema Fixes for 3 Critical Endpoints")
        print("-" * 60)
        
        # Test the 3 specific endpoints that were failing
        self.test_calls_initiate_schema_fix()
        self.test_channels_create_schema_fix()
        self.test_business_livesale_routing_fix()
        
        print("\n✅ VALIDATION: Testing Existing Working Features")
        print("-" * 60)
        
        # Quick validation that existing features still work
        self.test_existing_working_features()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 SCHEMA FIX TEST SUMMARY")
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
        
        # Specific analysis for the 3 critical endpoints
        critical_tests = [
            "Calls Initiate Schema Fix",
            "Channels Create Schema Fix", 
            "Business LiveSale Routing Fix"
        ]
        
        critical_passed = 0
        print(f"\n🎯 CRITICAL ENDPOINT ANALYSIS:")
        for result in self.test_results:
            if result["test"] in critical_tests:
                status = "✅" if result["success"] else "❌"
                print(f"   {status} {result['test']}")
                if result["success"]:
                    critical_passed += 1
        
        print(f"\n🎯 Critical Endpoints Fixed: {critical_passed}/3")
        
        return critical_passed == 3

if __name__ == "__main__":
    tester = SchemaFixTester()
    success = tester.run_schema_fix_tests()
    sys.exit(0 if success else 1)