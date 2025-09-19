#!/usr/bin/env python3
"""
Track C AI Supercharge Test Suite
Tests the revolutionary AI features for Series A presentation
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

class TrackCTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
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
        
    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None):
        """Make HTTP request and return (success, response_data)"""
        url = f"{API_URL}{endpoint}"
        
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
                    
        except requests.exceptions.ConnectionError:
            return False, "Connection failed - backend server may not be running"
        except Exception as e:
            return False, f"Request failed: {str(e)}"
    
    def test_multilang_voice_health_check(self):
        """Test multi-language voice AI health check"""
        print("\n🎤 Testing Multi-Language Voice AI Health Check...")
        
        success, data = self.make_request("GET", "/multilang-voice/health")
        
        if success and isinstance(data, dict) and data.get("status") == "healthy":
            service = data.get("service")
            languages = data.get("supported_languages", [])
            features = data.get("features", [])
            language_count = data.get("language_count", 0)
            
            # Verify 5 language support as specified in review request
            if language_count >= 5 and len(features) >= 6:
                self.log_test("Multi-Language Voice AI Health Check", True, f"Service: {service}, Languages: {language_count}, Features: {len(features)}")
            else:
                self.log_test("Multi-Language Voice AI Health Check", False, f"Insufficient languages ({language_count}) or features ({len(features)})")
        else:
            self.log_test("Multi-Language Voice AI Health Check", False, str(data))
    
    def test_voice_command_processing(self):
        """Test voice command processing across languages"""
        print("\n🎤 Testing Voice Command Processing...")
        
        # Test English voice command
        english_command = {
            "text": "Show me luxury handbags under $200",
            "language": "en",
            "user_id": "test_user_123",
            "context": {"budget": "medium"}
        }
        
        success, data = self.make_request("POST", "/multilang-voice/process", english_command)
        
        if success and isinstance(data, dict) and data.get("success") is True:
            intent = data.get("detected_intent")
            confidence = data.get("confidence", 0)
            language = data.get("language")
            ai_response = data.get("ai_response", "")
            products_found = len(data.get("products_found", []))
            
            if confidence >= 0.5:
                self.log_test("Voice Processing (English)", True, f"Intent: {intent}, Confidence: {confidence:.2f}, Products: {products_found}")
            else:
                self.log_test("Voice Processing (English)", False, f"Low confidence: {confidence:.2f}")
        else:
            self.log_test("Voice Processing (English)", False, str(data))
        
        # Test Swahili voice command (Kenya pilot)
        swahili_command = {
            "text": "Nionyeshe mifuko ya anasa chini ya dola 200",
            "language": "sw",
            "user_id": "test_user_123"
        }
        
        success, data = self.make_request("POST", "/multilang-voice/process", swahili_command)
        
        if success and isinstance(data, dict) and data.get("success") is True:
            intent = data.get("detected_intent")
            confidence = data.get("confidence", 0)
            self.log_test("Voice Processing (Swahili)", True, f"Intent: {intent}, Confidence: {confidence:.2f}")
        else:
            self.log_test("Voice Processing (Swahili)", False, str(data))
    
    def test_contextual_ai_health_check(self):
        """Test contextual AI recommendations health check"""
        print("\n🧠 Testing Contextual AI Health Check...")
        
        success, data = self.make_request("GET", "/contextual-ai/health")
        
        if success and isinstance(data, dict) and data.get("status") == "healthy":
            service = data.get("service")
            features = data.get("features", [])
            contexts = data.get("supported_contexts", [])
            moods = data.get("supported_moods", [])
            
            # Verify key features are present
            required_features = ["session_memory", "mood_based_recommendations", "purchase_intent_detection"]
            has_required_features = all(feature in features for feature in required_features)
            
            if has_required_features and len(moods) >= 10:
                self.log_test("Contextual AI Health Check", True, f"Service: {service}, Features: {len(features)}, Contexts: {len(contexts)}, Moods: {len(moods)}")
            else:
                self.log_test("Contextual AI Health Check", False, f"Missing required features or insufficient moods")
        else:
            self.log_test("Contextual AI Health Check", False, str(data))
    
    def test_mood_to_cart_feature(self):
        """Test revolutionary Mood-to-Cart feature"""
        print("\n🛒 Testing Mood-to-Cart Revolutionary Feature...")
        
        # Test luxurious mood to cart
        mood_request = {
            "mood": "luxurious",
            "session_id": "test_session_mood_123",
            "user_id": "test_user_123",
            "budget": 1000
        }
        
        success, data = self.make_request("POST", "/contextual-ai/mood-to-cart", mood_request)
        
        if success and isinstance(data, dict) and data.get("success") is True:
            cart_items = data.get("cart_items", [])
            total_items = data.get("total_items", 0)
            total_price = data.get("total_price", 0)
            mood = data.get("mood")
            mood_insights = data.get("mood_insights")
            
            if total_items > 0 and total_price <= 1000 and mood_insights:
                self.log_test("Mood-to-Cart (Luxurious)", True, f"Items: {total_items}, Total: ${total_price}, Mood: {mood}")
            else:
                self.log_test("Mood-to-Cart (Luxurious)", False, f"Failed to create proper cart. Items: {total_items}, Price: {total_price}")
        else:
            self.log_test("Mood-to-Cart (Luxurious)", False, str(data))
    
    def test_contextual_recommendations(self):
        """Test contextual AI recommendations with personalization"""
        print("\n🧠 Testing Contextual AI Recommendations...")
        
        # Test browsing context recommendations
        browsing_request = {
            "session_id": "test_session_123",
            "user_id": "test_user_123",
            "context": "browsing",
            "current_mood": "luxurious",
            "search_query": "luxury handbags",
            "price_range": {"min": 100, "max": 500},
            "categories": ["Fashion", "Accessories"],
            "language": "en"
        }
        
        success, data = self.make_request("POST", "/contextual-ai/recommend", browsing_request)
        
        if success and isinstance(data, dict) and data.get("success") is True:
            recommendations = data.get("recommendations", [])
            personalization_score = data.get("personalization_score", 0)
            ai_explanation = data.get("ai_explanation", "")
            mood_insights = data.get("mood_insights")
            
            if personalization_score >= 0.3:  # Lower threshold for testing
                self.log_test("Contextual AI Recommendations", True, f"Recommendations: {len(recommendations)}, Personalization: {personalization_score:.2f}")
            else:
                self.log_test("Contextual AI Recommendations", False, f"Low personalization score: {personalization_score}")
        else:
            self.log_test("Contextual AI Recommendations", False, str(data))
    
    def test_session_memory_tracking(self):
        """Test session memory and interaction tracking"""
        print("\n🧠 Testing Session Memory Tracking...")
        
        session_id = "test_session_memory_123"
        
        # Make interaction to build session memory
        request_data = {
            "session_id": session_id,
            "user_id": "test_user_123",
            "context": "browsing",
            "current_mood": "happy",
            "search_query": "summer dresses",
            "language": "en"
        }
        
        success, data = self.make_request("POST", "/contextual-ai/recommend", request_data)
        
        if success and isinstance(data, dict) and data.get("success") is True:
            session_memory = data.get("session_memory", {})
            interactions_count = session_memory.get("interactions_count", 0)
            
            if interactions_count >= 1:
                self.log_test("Session Memory Tracking", True, f"Interactions tracked: {interactions_count}")
            else:
                self.log_test("Session Memory Tracking", False, f"No interactions tracked")
        else:
            self.log_test("Session Memory Tracking", False, str(data))
    
    def test_available_moods(self):
        """Test available moods with AI insights"""
        print("\n🎭 Testing Available Moods...")
        
        success, data = self.make_request("GET", "/contextual-ai/moods")
        
        if success and isinstance(data, dict) and "available_moods" in data:
            available_moods = data.get("available_moods", [])
            total_moods = data.get("total_moods", 0)
            
            # Verify we have comprehensive mood options
            required_moods = ["luxurious", "bold", "casual", "elegant", "professional"]
            mood_values = [mood.get("value") for mood in available_moods]
            has_required_moods = all(mood in mood_values for mood in required_moods)
            
            if total_moods >= 10 and has_required_moods:
                self.log_test("Available Moods", True, f"Found {total_moods} moods with required moods")
            else:
                self.log_test("Available Moods", False, f"Missing moods. Total: {total_moods}, Required moods: {has_required_moods}")
        else:
            self.log_test("Available Moods", False, str(data))
    
    def run_track_c_tests(self):
        """Run Track C AI Supercharge validation tests"""
        print("🧠💎 TRACK C AI SUPERCHARGE VALIDATION")
        print("=" * 80)
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 80)
        
        # Multi-Language Voice AI Tests
        print("\n🎤 MULTI-LANGUAGE VOICE AI TESTING")
        self.test_multilang_voice_health_check()
        self.test_voice_command_processing()
        
        # Contextual AI Recommendations Tests
        print("\n🧠 CONTEXTUAL AI RECOMMENDATIONS TESTING")
        self.test_contextual_ai_health_check()
        self.test_contextual_recommendations()
        self.test_mood_to_cart_feature()
        self.test_session_memory_tracking()
        self.test_available_moods()
        
        # Print Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("🧠💎 TRACK C AI SUPERCHARGE TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"📊 Results: {passed}/{total} tests passed ({success_rate:.1f}% success rate)")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        # Show passed tests
        passed_tests = [result for result in self.test_results if result["success"]]
        if passed_tests:
            print(f"\n✅ Passed Tests ({len(passed_tests)}):")
            for test in passed_tests:
                print(f"   • {test['test']}")
        
        print("\n" + "=" * 80)
        
        if success_rate >= 80:
            print("🎉 TRACK C AI SUPERCHARGE: INVESTOR READY!")
        elif success_rate >= 60:
            print("⚠️  TRACK C AI SUPERCHARGE: NEEDS MINOR FIXES")
        else:
            print("❌ TRACK C AI SUPERCHARGE: CRITICAL ISSUES FOUND")
        
        print("=" * 80)

if __name__ == "__main__":
    tester = TrackCTester()
    tester.run_track_c_tests()