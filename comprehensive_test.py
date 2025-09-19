#!/usr/bin/env python3
"""
AisleMarts Comprehensive Final Testing
Tests all newly implemented features and communication suite
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

class ComprehensiveTester:
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
    
    def setup_auth(self):
        """Setup authentication"""
        print("\n🔐 Setting up authentication...")
        
        # Try to login first
        login_data = {
            "email": "buyer@aislemarts.com",
            "password": "password123"
        }
        
        success, data = self.make_request("POST", "/auth/login", login_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("Authentication Setup", True, "Successfully logged in")
            
            # Get user details
            success, user_data = self.make_request("GET", "/auth/me")
            if success:
                self.user_id = user_data.get("id") or user_data.get("_id")
        else:
            # Try to register
            user_data = {
                "email": "buyer@aislemarts.com",
                "password": "password123",
                "name": "Test Buyer"
            }
            
            success, data = self.make_request("POST", "/auth/register", user_data)
            
            if success and isinstance(data, dict) and "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("Authentication Setup", True, "Successfully registered and logged in")
            else:
                self.log_test("Authentication Setup", False, str(data))
    
    # PHASE 1: NEWLY IMPLEMENTED FEATURES
    def test_advanced_ai_recommendations(self):
        """Test Advanced AI Recommendations System"""
        print("\n🤖 Testing Advanced AI Recommendations System...")
        
        # Health check
        success, data = self.make_request("GET", "/ai/advanced/health")
        if success and isinstance(data, dict) and data.get("status") == "operational":
            self.log_test("Advanced AI Recommendations Health", True, f"Service operational")
        else:
            self.log_test("Advanced AI Recommendations Health", False, str(data))
        
        # Generate recommendations
        if self.auth_token:
            rec_request = {
                "user_preferences": {
                    "categories": ["electronics", "fashion"],
                    "budget_range": {"min": 50, "max": 500},
                    "style": "luxury"
                },
                "context": {"occasion": "work", "season": "winter"},
                "max_results": 5
            }
            
            success, data = self.make_request("POST", "/ai/advanced/recommendations", rec_request)
            if success and isinstance(data, dict) and "recommendations" in data:
                recommendations = data.get("recommendations", [])
                self.log_test("Advanced AI Recommendations Generate", True, f"Generated {len(recommendations)} recommendations")
            else:
                self.log_test("Advanced AI Recommendations Generate", False, str(data))
        
        # Trending insights
        success, data = self.make_request("GET", "/ai/advanced/trending-insights")
        if success and isinstance(data, dict) and "insights" in data:
            insights = data.get("insights", [])
            self.log_test("Advanced AI Trending Insights", True, f"Found {len(insights)} insights")
        else:
            self.log_test("Advanced AI Trending Insights", False, str(data))
        
        # Smart search
        search_request = {
            "query": "luxury headphones for work",
            "filters": {"price_range": {"min": 100, "max": 300}},
            "user_context": {"previous_purchases": ["electronics"]}
        }
        
        success, data = self.make_request("POST", "/ai/advanced/smart-search", search_request)
        if success and isinstance(data, dict) and "results" in data:
            results = data.get("results", [])
            self.log_test("Advanced AI Smart Search", True, f"Found {len(results)} results")
        else:
            self.log_test("Advanced AI Smart Search", False, str(data))
    
    def test_performance_analytics(self):
        """Test Performance Analytics System"""
        print("\n📊 Testing Performance Analytics System...")
        
        # Health check
        success, data = self.make_request("GET", "/analytics/performance/health")
        if success and isinstance(data, dict) and data.get("status") == "operational":
            self.log_test("Performance Analytics Health", True, "Service operational")
        else:
            self.log_test("Performance Analytics Health", False, str(data))
        
        # Real-time metrics
        success, data = self.make_request("GET", "/analytics/performance/realtime")
        if success and isinstance(data, dict) and "metrics" in data:
            self.log_test("Performance Analytics Real-time", True, "Real-time metrics available")
        else:
            self.log_test("Performance Analytics Real-time", False, str(data))
        
        # Analytics
        success, data = self.make_request("GET", "/analytics/performance/analytics")
        if success and isinstance(data, dict) and "analytics" in data:
            self.log_test("Performance Analytics Analytics", True, "Analytics data available")
        else:
            self.log_test("Performance Analytics Analytics", False, str(data))
        
        # System health
        success, data = self.make_request("GET", "/analytics/performance/system-health")
        if success and isinstance(data, dict) and "health" in data:
            self.log_test("Performance Analytics System Health", True, "System health data available")
        else:
            self.log_test("Performance Analytics System Health", False, str(data))
        
        # Feature usage
        success, data = self.make_request("GET", "/analytics/performance/feature-usage")
        if success and isinstance(data, dict) and "features" in data:
            self.log_test("Performance Analytics Feature Usage", True, "Feature usage data available")
        else:
            self.log_test("Performance Analytics Feature Usage", False, str(data))
        
        # Alerts
        success, data = self.make_request("GET", "/analytics/performance/alerts")
        if success and isinstance(data, dict) and "alerts" in data:
            alerts = data.get("alerts", [])
            self.log_test("Performance Analytics Alerts", True, f"Found {len(alerts)} alerts")
        else:
            self.log_test("Performance Analytics Alerts", False, str(data))
    
    def test_business_livesale_fixed(self):
        """Test Fixed Business LiveSale System"""
        print("\n🛍️ Testing Business LiveSale System (Fixed Schema)...")
        
        if not self.auth_token:
            self.log_test("Business LiveSale Fixed Schema", False, "No auth token available")
            return
        
        # Test with correct product_id structure
        livesale_data = {
            "title": "Luxury Electronics Sale",
            "description": "Premium headphones and accessories",
            "product_id": "prod_headphones_001",  # Fixed: string instead of object
            "start_time": "2024-01-15T10:00:00Z",
            "duration_minutes": 60,
            "max_participants": 100,
            "starting_price": 299.99,
            "reserve_price": 250.00
        }
        
        success, data = self.make_request("POST", "/livesale/biz/livesales", livesale_data)
        
        if success and isinstance(data, dict) and data.get("id"):
            self.log_test("Business LiveSale Fixed Schema", True, f"Created LiveSale with correct schema")
        else:
            self.log_test("Business LiveSale Fixed Schema", False, str(data))
    
    # PHASE 2: COMMUNICATION SUITE VALIDATION
    def test_voice_video_calls(self):
        """Test Voice/Video Calls System"""
        print("\n📞 Testing Voice/Video Calls System...")
        
        if not self.auth_token:
            self.log_test("Voice/Video Calls", False, "No auth token available")
            return
        
        # Test call initiation with correct schema
        call_data = {
            "callee_id": "user_alice_123",  # Correct field name
            "call_type": "video",
            "metadata": {"quality": "hd", "encryption": True}
        }
        
        success, data = self.make_request("POST", "/calls/initiate", call_data)
        
        if success and isinstance(data, dict) and data.get("call_id"):
            call_id = data.get("call_id")
            self.log_test("Voice/Video Calls Schema Validation", True, f"Call initiated: {call_id}")
        else:
            self.log_test("Voice/Video Calls Schema Validation", False, str(data))
    
    def test_channels_groups(self):
        """Test Channels & Groups System"""
        print("\n📢 Testing Channels & Groups System...")
        
        if not self.auth_token:
            self.log_test("Channels & Groups", False, "No auth token available")
            return
        
        # Test channel creation with correct schema
        channel_data = {
            "type": "group",  # Correct field name
            "title": "Tech Enthusiasts",
            "description": "Discussion about latest technology trends",
            "privacy": "public",
            "theme": "gold"
        }
        
        success, data = self.make_request("POST", "/channels", channel_data)
        
        if success and isinstance(data, dict) and data.get("id"):
            channel_id = data.get("id")
            self.log_test("Channels & Groups Schema Validation", True, f"Created channel: {channel_id}")
        else:
            self.log_test("Channels & Groups Schema Validation", False, str(data))
    
    def test_direct_messaging(self):
        """Test Direct Messaging System"""
        print("\n💬 Testing Direct Messaging System...")
        
        if not self.auth_token:
            self.log_test("Direct Messaging", False, "No auth token available")
            return
        
        # Test conversation creation
        conversation_data = {
            "participants": ["user_alice", "user_bob"],
            "title": "Direct Chat",
            "channel_type": "direct"
        }
        
        success, data = self.make_request("POST", "/dm/conversations", conversation_data)
        
        if success and isinstance(data, dict) and data.get("id"):
            conversation_id = data.get("id")
            self.log_test("Direct Messaging Conversation Creation", True, f"Created conversation: {conversation_id}")
            
            # Test listing conversations
            success, data = self.make_request("GET", "/dm/conversations")
            if success and isinstance(data, list):
                self.log_test("Direct Messaging List Conversations", True, f"Found {len(data)} conversations")
            else:
                self.log_test("Direct Messaging List Conversations", False, str(data))
        else:
            self.log_test("Direct Messaging Conversation Creation", False, str(data))
    
    # PHASE 3: CORE AI FEATURES
    def test_mood_to_cart(self):
        """Test AI Mood-to-Cart System"""
        print("\n🎭 Testing AI Mood-to-Cart System...")
        
        # Health check
        success, data = self.make_request("GET", "/mood/health")
        if success and isinstance(data, dict) and data.get("status") == "operational":
            service = data.get("service", "unknown")
            self.log_test("Mood-to-Cart Health Check", True, f"Service: {service}")
        else:
            self.log_test("Mood-to-Cart Health Check", False, str(data))
        
        # Test mood profiles
        success, data = self.make_request("GET", "/mood/moods")
        if success and isinstance(data, list) and len(data) > 0:
            moods = [mood.get("name", "unknown") for mood in data]
            self.log_test("Mood-to-Cart Profiles", True, f"Available moods: {', '.join(moods[:3])}")
        else:
            self.log_test("Mood-to-Cart Profiles", False, str(data))
        
        # Test cart generation
        cart_request = {
            "mood": "luxurious",
            "budget": {"min": 100, "max": 1000},
            "preferences": {"categories": ["electronics", "fashion"]}
        }
        
        success, data = self.make_request("POST", "/mood/generate-cart", cart_request)
        if success and isinstance(data, dict) and "items" in data:
            items = data.get("items", [])
            total = data.get("total", 0)
            self.log_test("Mood-to-Cart Generation", True, f"Generated {len(items)} items, total: ${total}")
        else:
            self.log_test("Mood-to-Cart Generation", False, str(data))
    
    # PHASE 4: BUSINESS FEATURES
    def test_business_leads(self):
        """Test Business Leads Kanban System"""
        print("\n📋 Testing Business Leads Kanban System...")
        
        if not self.auth_token:
            self.log_test("Business Leads", False, "No auth token available")
            return
        
        # Test leads listing
        success, data = self.make_request("GET", "/biz/leads")
        if success and isinstance(data, list):
            self.log_test("Business Leads List", True, f"Found {len(data)} leads")
        else:
            self.log_test("Business Leads List", False, str(data))
        
        # Test leads analytics
        success, data = self.make_request("GET", "/biz/leads/analytics")
        if success and isinstance(data, dict) and "analytics" in data:
            analytics = data.get("analytics", {})
            total_leads = analytics.get("total_leads", 0)
            self.log_test("Business Leads Analytics", True, f"Total leads: {total_leads}")
        else:
            self.log_test("Business Leads Analytics", False, str(data))
        
        # Test Kanban summary
        success, data = self.make_request("GET", "/biz/leads/kanban/summary")
        if success and isinstance(data, dict) and "columns" in data:
            columns = data.get("columns", [])
            self.log_test("Business Leads Kanban Summary", True, f"Kanban columns: {len(columns)}")
        else:
            self.log_test("Business Leads Kanban Summary", False, str(data))
    
    def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        print("🚀 Starting AisleMarts Comprehensive Final Testing")
        print(f"🔗 Testing against: {API_URL}")
        print("=" * 80)
        
        # Setup authentication
        self.setup_auth()
        
        # PHASE 1: NEWLY IMPLEMENTED FEATURES
        print("\n" + "🆕" * 20 + " PHASE 1: NEWLY IMPLEMENTED FEATURES " + "🆕" * 20)
        self.test_advanced_ai_recommendations()
        self.test_performance_analytics()
        self.test_business_livesale_fixed()
        
        # PHASE 2: COMMUNICATION SUITE VALIDATION
        print("\n" + "📞" * 20 + " PHASE 2: COMMUNICATION SUITE VALIDATION " + "📞" * 20)
        self.test_voice_video_calls()
        self.test_channels_groups()
        self.test_direct_messaging()
        
        # PHASE 3: CORE AI FEATURES
        print("\n" + "🤖" * 20 + " PHASE 3: CORE AI FEATURES " + "🤖" * 20)
        self.test_mood_to_cart()
        
        # PHASE 4: BUSINESS FEATURES
        print("\n" + "📋" * 20 + " PHASE 4: BUSINESS FEATURES " + "📋" * 20)
        self.test_business_leads()
        
        # Print Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 80)
        print("🎯 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📊 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        # Categorize results
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({failed_tests}):")
            
            newly_implemented_failures = []
            communication_suite_failures = []
            core_ai_failures = []
            business_features_failures = []
            other_failures = []
            
            for result in self.test_results:
                if not result["success"]:
                    test_name = result['test']
                    if any(keyword in test_name.lower() for keyword in ['advanced ai', 'performance analytics', 'business livesale fixed']):
                        newly_implemented_failures.append(result)
                    elif any(keyword in test_name.lower() for keyword in ['voice/video', 'channels', 'direct messaging']):
                        communication_suite_failures.append(result)
                    elif any(keyword in test_name.lower() for keyword in ['mood-to-cart']):
                        core_ai_failures.append(result)
                    elif any(keyword in test_name.lower() for keyword in ['business leads']):
                        business_features_failures.append(result)
                    else:
                        other_failures.append(result)
            
            if newly_implemented_failures:
                print(f"\n   🆕 NEWLY IMPLEMENTED FEATURES ({len(newly_implemented_failures)}):")
                for result in newly_implemented_failures:
                    print(f"      • {result['test']}: {result['details']}")
            
            if communication_suite_failures:
                print(f"\n   📞 COMMUNICATION SUITE ({len(communication_suite_failures)}):")
                for result in communication_suite_failures:
                    print(f"      • {result['test']}: {result['details']}")
            
            if core_ai_failures:
                print(f"\n   🤖 CORE AI FEATURES ({len(core_ai_failures)}):")
                for result in core_ai_failures:
                    print(f"      • {result['test']}: {result['details']}")
            
            if business_features_failures:
                print(f"\n   📋 BUSINESS FEATURES ({len(business_features_failures)}):")
                for result in business_features_failures:
                    print(f"      • {result['test']}: {result['details']}")
            
            if other_failures:
                print(f"\n   🔧 OTHER FEATURES ({len(other_failures)}):")
                for result in other_failures:
                    print(f"      • {result['test']}: {result['details']}")
        
        print(f"\n🎯 OVERALL STATUS: {'✅ PASS' if success_rate >= 80 else '❌ FAIL'}")
        print("=" * 80)

if __name__ == "__main__":
    tester = ComprehensiveTester()
    tester.run_comprehensive_tests()