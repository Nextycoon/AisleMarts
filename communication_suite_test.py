#!/usr/bin/env python3
"""
AisleMarts Communication Suite Backend Test
Tests the luxury communication suite features specifically
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

class CommunicationSuiteTester:
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

    def setup_authentication(self):
        """Setup authentication for testing"""
        print("\n🔐 Setting up authentication...")
        
        # Try to register a test user
        user_data = {
            "email": "comms_tester@aislemarts.com",
            "password": "password123",
            "name": "Communication Suite Tester"
        }
        
        success, data = self.make_request("POST", "/auth/register", user_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("Authentication Setup", True, "Successfully registered and got token")
        else:
            # User might already exist, try to login instead
            login_data = {
                "email": "comms_tester@aislemarts.com",
                "password": "password123"
            }
            
            success, data = self.make_request("POST", "/auth/login", login_data)
            
            if success and isinstance(data, dict) and "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("Authentication Setup", True, "Successfully logged in and got token")
            else:
                self.log_test("Authentication Setup", False, str(data))
                return False
        
        # Get user details
        success, data = self.make_request("GET", "/auth/me")
        if success and isinstance(data, dict):
            self.user_id = data.get("id") or data.get("_id")
            
        return True

    def test_dm_system(self):
        """Test Direct Messaging system"""
        print("\n💬 Testing Direct Messaging System...")
        
        # Test creating conversation
        conversation_data = {
            "participants": ["user_alice", "user_bob"],
            "title": "Test Direct Chat",
            "channel_type": "direct"
        }
        
        success, data = self.make_request("POST", "/dm/conversations", conversation_data)
        
        if success and isinstance(data, dict) and data.get("id"):
            conversation_id = data.get("id")
            self.log_test("DM Create Conversation", True, f"Created conversation: {conversation_id[:8]}...")
            
            # Test sending message
            message_data = {
                "conversation_id": conversation_id,
                "ciphertext": "encrypted_test_message",
                "nonce": "test_nonce_12_bytes",
                "key_id": "test_key_id",
                "message_type": "text"
            }
            
            success, msg_data = self.make_request("POST", "/dm/messages", message_data)
            
            if success and isinstance(msg_data, dict) and msg_data.get("id"):
                self.log_test("DM Send Message", True, f"Sent message: {msg_data.get('id')[:8]}...")
            else:
                self.log_test("DM Send Message", False, str(msg_data))
                
            # Test getting messages
            success, messages = self.make_request("GET", f"/dm/conversations/{conversation_id}/messages")
            
            if success and isinstance(messages, list):
                self.log_test("DM Get Messages", True, f"Retrieved {len(messages)} messages")
            else:
                self.log_test("DM Get Messages", False, str(messages))
                
        else:
            self.log_test("DM Create Conversation", False, str(data))

    def test_calls_system(self):
        """Test Voice/Video Calls system"""
        print("\n📞 Testing Voice/Video Calls System...")
        
        # Test initiating call
        call_data = {
            "callee_id": "user_test_callee",
            "mode": "voice",
            "context": "test_call"
        }
        
        success, data = self.make_request("POST", "/calls/initiate", call_data)
        
        if success and isinstance(data, dict) and data.get("id"):
            call_id = data.get("id")
            self.log_test("Calls Initiate", True, f"Initiated call: {call_id[:8]}...")
            
            # Test call history
            success, history = self.make_request("GET", "/calls/history")
            
            if success and isinstance(history, list):
                self.log_test("Calls History", True, f"Retrieved {len(history)} calls")
            else:
                self.log_test("Calls History", False, str(history))
                
            # Test active calls
            success, active = self.make_request("GET", "/calls/active")
            
            if success and isinstance(active, dict):
                active_count = len(active.get("active_calls", {}))
                self.log_test("Calls Active", True, f"Found {active_count} active calls")
            else:
                self.log_test("Calls Active", False, str(active))
                
        else:
            self.log_test("Calls Initiate", False, str(data))

    def test_channels_system(self):
        """Test Channels & Groups system"""
        print("\n📺 Testing Channels & Groups System...")
        
        # Test creating channel
        channel_data = {
            "title": "Test Tech Channel",
            "description": "Test channel for technology discussions",
            "channel_type": "public",
            "tags": ["tech", "test"]
        }
        
        success, data = self.make_request("POST", "/channels", channel_data)
        
        if success and isinstance(data, dict) and data.get("id"):
            channel_id = data.get("id")
            self.log_test("Channels Create", True, f"Created channel: {channel_id[:8]}...")
            
            # Test posting message
            message_data = {
                "content": "Hello from test channel!",
                "message_type": "text"
            }
            
            success, msg_data = self.make_request("POST", f"/channels/{channel_id}/messages", message_data)
            
            if success and isinstance(msg_data, dict) and msg_data.get("id"):
                self.log_test("Channels Post Message", True, f"Posted message: {msg_data.get('id')[:8]}...")
            else:
                self.log_test("Channels Post Message", False, str(msg_data))
                
            # Test getting messages
            success, messages = self.make_request("GET", f"/channels/{channel_id}/messages")
            
            if success and isinstance(messages, list):
                self.log_test("Channels Get Messages", True, f"Retrieved {len(messages)} messages")
            else:
                self.log_test("Channels Get Messages", False, str(messages))
                
        else:
            self.log_test("Channels Create", False, str(data))

    def test_livesale_system(self):
        """Test LiveSale Commerce system"""
        print("\n🎥 Testing LiveSale Commerce System...")
        
        # Test getting all livesales
        success, data = self.make_request("GET", "/livesale")
        
        if success and isinstance(data, list):
            self.log_test("LiveSale Get All", True, f"Found {len(data)} LiveSales")
            
            # Test getting active livesales
            success, active = self.make_request("GET", "/livesale/active/all")
            
            if success and isinstance(active, dict):
                active_count = active.get("count", 0)
                self.log_test("LiveSale Get Active", True, f"Found {active_count} active LiveSales")
            else:
                self.log_test("LiveSale Get Active", False, str(active))
                
        else:
            self.log_test("LiveSale Get All", False, str(data))
            
        # Test business livesale creation
        livesale_data = {
            "title": "Test Product Showcase",
            "description": "Test live showcase",
            "starts_at": "2024-12-20T15:00:00Z",
            "duration_minutes": 60,
            "products": [
                {
                    "product_id": "test_product_001",
                    "special_price": 99.99,
                    "discount_percent": 10
                }
            ]
        }
        
        success, data = self.make_request("POST", "/biz/livesales", livesale_data)
        
        if success and isinstance(data, dict) and data.get("id"):
            livesale_id = data.get("id")
            self.log_test("Biz LiveSale Create", True, f"Created LiveSale: {livesale_id[:8]}...")
            
            # Test getting vendor's livesales
            success, my_livesales = self.make_request("GET", "/biz/livesales")
            
            if success and isinstance(my_livesales, list):
                self.log_test("Biz LiveSale Get My", True, f"Found {len(my_livesales)} vendor LiveSales")
            else:
                self.log_test("Biz LiveSale Get My", False, str(my_livesales))
                
        else:
            self.log_test("Biz LiveSale Create", False, str(data))

    def test_leads_system(self):
        """Test Business Leads Kanban system"""
        print("\n📊 Testing Business Leads Kanban System...")
        
        # Test getting leads
        success, data = self.make_request("GET", "/biz/leads")
        
        if success and isinstance(data, list):
            self.log_test("Leads Get All", True, f"Found {len(data)} leads")
            
            # Test analytics
            success, analytics = self.make_request("GET", "/biz/leads/analytics")
            
            if success and isinstance(analytics, dict):
                total_leads = analytics.get("total_leads", 0)
                conversion_rate = analytics.get("conversion_rate", 0)
                self.log_test("Leads Analytics", True, f"Analytics: {total_leads} leads, {conversion_rate}% conversion")
            else:
                self.log_test("Leads Analytics", False, str(analytics))
                
            # Test kanban summary
            success, kanban = self.make_request("GET", "/biz/leads/kanban/summary")
            
            if success and isinstance(kanban, dict) and "columns" in kanban:
                columns = kanban.get("columns", {})
                self.log_test("Leads Kanban Summary", True, f"Kanban columns: {len(columns)}")
            else:
                self.log_test("Leads Kanban Summary", False, str(kanban))
                
        else:
            self.log_test("Leads Get All", False, str(data))

    def test_mood_to_cart_system(self):
        """Test AI Mood-to-Cart system"""
        print("\n🎭 Testing AI Mood-to-Cart System...")
        
        # Test health check
        success, data = self.make_request("GET", "/mood/health")
        
        if success and isinstance(data, dict):
            service = data.get("service")
            status = data.get("status")
            self.log_test("Mood-to-Cart Health", True, f"Service: {service}, Status: {status}")
            
            # Test getting moods
            success, moods = self.make_request("GET", "/mood/moods")
            
            if success and isinstance(moods, list):
                self.log_test("Mood-to-Cart Moods", True, f"Found {len(moods)} mood profiles")
                
                if len(moods) > 0:
                    # Test generating cart for first mood
                    first_mood = moods[0].get("id", "luxurious")
                    cart_data = {
                        "mood": first_mood,
                        "budget": "medium"
                    }
                    
                    success, cart = self.make_request("POST", "/mood/generate-cart", cart_data)
                    
                    if success and isinstance(cart, dict):
                        items = cart.get("items", [])
                        total = cart.get("total", 0)
                        self.log_test("Mood-to-Cart Generate", True, f"Generated cart: {len(items)} items, Total: ${total}")
                    else:
                        self.log_test("Mood-to-Cart Generate", False, str(cart))
                        
            else:
                self.log_test("Mood-to-Cart Moods", False, str(moods))
                
        else:
            self.log_test("Mood-to-Cart Health", False, str(data))

    def run_communication_suite_tests(self):
        """Run all communication suite tests"""
        print("🚀 Starting AisleMarts Communication Suite Backend Tests...")
        print(f"🔗 Testing against: {BASE_URL}")
        print("=" * 80)
        
        # Setup authentication
        if not self.setup_authentication():
            print("❌ Authentication setup failed. Cannot proceed with tests.")
            return False
        
        # Test each communication suite component
        print("\n" + "💬" * 20 + " DIRECT MESSAGING TESTS " + "💬" * 20)
        self.test_dm_system()
        
        print("\n" + "📞" * 20 + " VOICE/VIDEO CALLS TESTS " + "📞" * 20)
        self.test_calls_system()
        
        print("\n" + "📺" * 20 + " CHANNELS & GROUPS TESTS " + "📺" * 20)
        self.test_channels_system()
        
        print("\n" + "🎥" * 20 + " LIVESALE COMMERCE TESTS " + "🎥" * 20)
        self.test_livesale_system()
        
        print("\n" + "📊" * 20 + " BUSINESS LEADS TESTS " + "📊" * 20)
        self.test_leads_system()
        
        print("\n" + "🎭" * 20 + " AI MOOD-TO-CART TESTS " + "🎭" * 20)
        self.test_mood_to_cart_system()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 COMMUNICATION SUITE TEST SUMMARY")
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
    tester = CommunicationSuiteTester()
    success = tester.run_communication_suite_tests()
    
    if success:
        print("\n🎉 All communication suite tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()