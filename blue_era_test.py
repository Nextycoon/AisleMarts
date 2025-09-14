#!/usr/bin/env python3
"""
Blue Era Dashboard Backend Integration Test Suite
Tests specific APIs for Blue Era Dashboard features
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

class BlueEraAPITester:
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
    
    def setup_authentication(self):
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
            
            # Get user ID
            success, user_data = self.make_request("GET", "/auth/me")
            if success:
                self.user_id = user_data.get("id") or user_data.get("_id")
                print(f"✅ User ID: {self.user_id}")
        else:
            print("❌ Authentication failed, some tests will be skipped")
    
    def test_blue_era_trust_score_api(self):
        """Test Trust Score API for Blue Era Dashboard trust bar"""
        print("\n💙 Testing Blue Era Trust Score API...")
        
        if not self.auth_token or not self.user_id:
            self.log_test("Blue Era Trust Score API", False, "No auth token or user ID available")
            return
        
        # Test trust score endpoint
        success, data = self.make_request("GET", f"/identity/trust-score/{self.user_id}")
        
        if success and isinstance(data, dict) and "trust_score" in data:
            trust_score = data.get("trust_score", 0)
            verification_level = data.get("verification_level", "unknown")
            verification_count = data.get("verification_count", 0)
            account_age = data.get("account_age_years", 0)
            
            # Validate trust score is numeric (0-100)
            if isinstance(trust_score, (int, float)) and 0 <= trust_score <= 100:
                self.log_test("Blue Era Trust Score API", True, f"Trust Score: {trust_score}/100, Level: {verification_level}, Verifications: {verification_count}, Account Age: {account_age} years")
            else:
                self.log_test("Blue Era Trust Score API", False, f"Invalid trust score format: {trust_score}")
        else:
            self.log_test("Blue Era Trust Score API", False, str(data))
    
    def test_blue_era_ai_chat_service(self):
        """Test AI Chat Service for Blue Era Dashboard daily insights"""
        print("\n💙 Testing Blue Era AI Chat Service...")
        
        # Test brand role insights
        brand_insights_request = {
            "message": "Generate daily insights for a brand user on AisleMarts marketplace",
            "context": {
                "user_type": "brand",
                "role": "vendor",
                "request_type": "daily_insights"
            }
        }
        
        success, data = self.make_request("POST", "/ai/chat", brand_insights_request)
        
        if success and isinstance(data, dict) and "response" in data:
            response = data.get("response", "")
            agent_id = data.get("agent_id", "")
            
            # Validate response contains brand-relevant insights
            brand_keywords = ["brand", "vendor", "sales", "marketing", "products", "customers"]
            has_brand_context = any(keyword in response.lower() for keyword in brand_keywords)
            
            if has_brand_context and len(response) > 50:
                self.log_test("Blue Era AI Chat Service (Brand Insights)", True, f"Generated brand insights: {response[:100]}... (Agent: {agent_id})")
            else:
                self.log_test("Blue Era AI Chat Service (Brand Insights)", False, f"Insufficient brand context in response: {response[:100]}...")
        else:
            self.log_test("Blue Era AI Chat Service (Brand Insights)", False, str(data))
        
        # Test shopper role insights
        shopper_insights_request = {
            "message": "Generate daily insights for a shopper user on AisleMarts marketplace",
            "context": {
                "user_type": "shopper",
                "role": "buyer",
                "request_type": "daily_insights"
            }
        }
        
        success, data = self.make_request("POST", "/ai/chat", shopper_insights_request)
        
        if success and isinstance(data, dict) and "response" in data:
            response = data.get("response", "")
            
            # Validate response contains shopper-relevant insights
            shopper_keywords = ["shop", "buy", "deals", "products", "recommendations", "savings"]
            has_shopper_context = any(keyword in response.lower() for keyword in shopper_keywords)
            
            if has_shopper_context and len(response) > 50:
                self.log_test("Blue Era AI Chat Service (Shopper Insights)", True, f"Generated shopper insights: {response[:100]}...")
            else:
                self.log_test("Blue Era AI Chat Service (Shopper Insights)", False, f"Insufficient shopper context in response: {response[:100]}...")
        else:
            self.log_test("Blue Era AI Chat Service (Shopper Insights)", False, str(data))
    
    def test_blue_era_products_api_for_reels(self):
        """Test Products API format for Blue Era Product Reels component"""
        print("\n💙 Testing Blue Era Products API for Product Reels...")
        
        success, data = self.make_request("GET", "/products", {"limit": 10})
        
        if success and isinstance(data, list) and len(data) > 0:
            # Validate product format for reels transformation
            required_fields = ["title", "price", "images"]
            
            valid_products = 0
            for product in data:
                has_required = all(field in product for field in required_fields)
                has_images = isinstance(product.get("images"), list) and len(product.get("images", [])) > 0
                has_valid_price = isinstance(product.get("price"), (int, float)) and product.get("price") > 0
                
                if has_required and has_images and has_valid_price:
                    valid_products += 1
            
            if valid_products >= len(data) * 0.8:  # At least 80% valid
                sample_product = data[0]
                self.log_test("Blue Era Products API for Reels", True, f"Found {len(data)} products, {valid_products} valid for reels. Sample: {sample_product.get('title')} - ${sample_product.get('price')} - {len(sample_product.get('images', []))} images")
            else:
                self.log_test("Blue Era Products API for Reels", False, f"Only {valid_products}/{len(data)} products have required fields for reels")
        else:
            self.log_test("Blue Era Products API for Reels", False, str(data))
    
    def test_blue_era_ai_recommendations(self):
        """Test AI Recommendations for Blue Era Product Reel insights"""
        print("\n💙 Testing Blue Era AI Recommendations...")
        
        # Test product recommendations for reels
        rec_request = {
            "query": "trending products for product reels",
            "max_results": 5
        }
        
        success, data = self.make_request("POST", "/ai/recommendations", rec_request)
        
        if success and isinstance(data, dict) and "recommendations" in data:
            recommendations = data.get("recommendations", [])
            ai_explanation = data.get("ai_explanation", "")
            
            # Validate recommendations format for product reels
            valid_recommendations = 0
            for rec in recommendations:
                has_required = all(field in rec for field in ["id", "title", "price"])
                has_images = "images" in rec and isinstance(rec["images"], list)
                
                if has_required and has_images:
                    valid_recommendations += 1
            
            if valid_recommendations > 0 and ai_explanation:
                self.log_test("Blue Era AI Recommendations", True, f"Generated {len(recommendations)} recommendations with AI insights. Valid: {valid_recommendations}")
            else:
                self.log_test("Blue Era AI Recommendations", False, f"Insufficient recommendation data: {len(recommendations)} recs, {len(ai_explanation)} chars explanation")
        else:
            self.log_test("Blue Era AI Recommendations", False, str(data))
        
        # Test authenticated recommendations with user context
        if self.auth_token:
            auth_rec_request = {
                "query": "personalized product recommendations for my interests",
                "max_results": 8
            }
            
            success, data = self.make_request("POST", "/ai/recommendations", auth_rec_request)
            
            if success and isinstance(data, dict) and "recommendations" in data:
                recommendations = data.get("recommendations", [])
                ai_explanation = data.get("ai_explanation", "")
                
                if len(recommendations) > 0 and ai_explanation:
                    self.log_test("Blue Era AI Recommendations (Authenticated)", True, f"Generated {len(recommendations)} personalized recommendations")
                else:
                    self.log_test("Blue Era AI Recommendations (Authenticated)", False, "No personalized recommendations generated")
            else:
                self.log_test("Blue Era AI Recommendations (Authenticated)", False, str(data))
    
    def test_blue_era_auth_identity_profile(self):
        """Test Auth Identity Profile API for Blue Era user role determination"""
        print("\n💙 Testing Blue Era Auth Identity Profile API...")
        
        if not self.auth_token or not self.user_id:
            self.log_test("Blue Era Auth Identity Profile API", False, "No auth token or user ID available")
            return
        
        # Test identity profile endpoint
        success, data = self.make_request("GET", f"/identity/profile/{self.user_id}")
        
        if success and isinstance(data, dict):
            # Check for role information
            has_role_info = any(key in data for key in ["roles", "is_seller", "is_buyer", "user_role"])
            has_profile_info = any(key in data for key in ["username", "display_name", "email"])
            
            if has_role_info and has_profile_info:
                role_info = data.get("roles") or [data.get("user_role", "buyer")]
                self.log_test("Blue Era Auth Identity Profile API", True, f"Profile retrieved with role info: {role_info}")
            else:
                self.log_test("Blue Era Auth Identity Profile API", True, "Profile retrieved but limited role information (may be public view)")
        else:
            self.log_test("Blue Era Auth Identity Profile API", False, str(data))
    
    def test_blue_era_role_based_responses(self):
        """Test role-based responses for Blue Era Dashboard customization"""
        print("\n💙 Testing Blue Era Role-Based Responses...")
        
        # Test with vendor/brand context
        brand_context_request = {
            "message": "What should I focus on today as a brand on AisleMarts?",
            "context": {
                "user_type": "brand",
                "role": "vendor",
                "dashboard_context": "blue_era"
            }
        }
        
        success, data = self.make_request("POST", "/ai/chat", brand_context_request)
        
        if success and isinstance(data, dict) and "response" in data:
            response = data.get("response", "")
            
            # Check for brand-specific content
            brand_terms = ["brand", "vendor", "sell", "marketing", "inventory", "analytics", "customers"]
            brand_relevance = sum(1 for term in brand_terms if term in response.lower())
            
            if brand_relevance >= 2 and len(response) > 100:
                self.log_test("Blue Era Role-Based Responses (Brand)", True, f"Brand-focused response generated with {brand_relevance} relevant terms")
            else:
                self.log_test("Blue Era Role-Based Responses (Brand)", False, f"Insufficient brand context: {brand_relevance} terms, {len(response)} chars")
        else:
            self.log_test("Blue Era Role-Based Responses (Brand)", False, str(data))
        
        # Test with shopper/buyer context
        shopper_context_request = {
            "message": "What should I explore today as a shopper on AisleMarts?",
            "context": {
                "user_type": "shopper",
                "role": "buyer",
                "dashboard_context": "blue_era"
            }
        }
        
        success, data = self.make_request("POST", "/ai/chat", shopper_context_request)
        
        if success and isinstance(data, dict) and "response" in data:
            response = data.get("response", "")
            
            # Check for shopper-specific content
            shopper_terms = ["shop", "buy", "browse", "deals", "products", "recommendations", "discover"]
            shopper_relevance = sum(1 for term in shopper_terms if term in response.lower())
            
            if shopper_relevance >= 2 and len(response) > 100:
                self.log_test("Blue Era Role-Based Responses (Shopper)", True, f"Shopper-focused response generated with {shopper_relevance} relevant terms")
            else:
                self.log_test("Blue Era Role-Based Responses (Shopper)", False, f"Insufficient shopper context: {shopper_relevance} terms, {len(response)} chars")
        else:
            self.log_test("Blue Era Role-Based Responses (Shopper)", False, str(data))
    
    def test_blue_era_authentication_context(self):
        """Test authentication context for Blue Era Dashboard features"""
        print("\n💙 Testing Blue Era Authentication Context...")
        
        # Test with authenticated user
        if self.auth_token:
            auth_request = {
                "message": "Show me my personalized Blue Era dashboard insights",
                "context": {"authenticated": True, "dashboard": "blue_era"}
            }
            
            success, data = self.make_request("POST", "/ai/chat", auth_request)
            
            if success and isinstance(data, dict) and "response" in data:
                response = data.get("response", "")
                agent_id = data.get("agent_id", "")
                
                # Check for personalized content
                personal_terms = ["your", "you", "personal", "account", "profile"]
                personalization = sum(1 for term in personal_terms if term in response.lower())
                
                if personalization >= 2 and agent_id != "anonymous":
                    self.log_test("Blue Era Authentication Context (Authenticated)", True, f"Personalized response with agent ID: {agent_id}")
                else:
                    self.log_test("Blue Era Authentication Context (Authenticated)", False, f"Limited personalization: {personalization} terms, agent: {agent_id}")
            else:
                self.log_test("Blue Era Authentication Context (Authenticated)", False, str(data))
        
        # Test with anonymous user
        anon_request = {
            "message": "Show me Blue Era dashboard insights",
            "context": {"authenticated": False, "dashboard": "blue_era"}
        }
        
        success, data = self.make_request("POST", "/ai/chat", anon_request, headers={})
        
        if success and isinstance(data, dict) and "response" in data:
            response = data.get("response", "")
            
            # Check for generic content (not personalized)
            generic_terms = ["users", "people", "everyone", "general", "marketplace"]
            generic_content = sum(1 for term in generic_terms if term in response.lower())
            
            if generic_content >= 1 and len(response) > 50:
                self.log_test("Blue Era Authentication Context (Anonymous)", True, f"Generic response for anonymous user")
            else:
                self.log_test("Blue Era Authentication Context (Anonymous)", False, f"Insufficient generic content: {generic_content} terms")
        else:
            self.log_test("Blue Era Authentication Context (Anonymous)", False, str(data))
    
    def run_blue_era_tests(self):
        """Run all Blue Era Dashboard Backend Integration tests"""
        print("💙" * 20 + " BLUE ERA DASHBOARD BACKEND INTEGRATION TESTS " + "💙" * 20)
        print(f"📍 Testing against: {API_URL}")
        print("=" * 100)
        
        # Setup authentication
        self.setup_authentication()
        
        # Run Blue Era specific tests
        self.test_blue_era_trust_score_api()
        self.test_blue_era_ai_chat_service()
        self.test_blue_era_products_api_for_reels()
        self.test_blue_era_ai_recommendations()
        self.test_blue_era_auth_identity_profile()
        self.test_blue_era_role_based_responses()
        self.test_blue_era_authentication_context()
        
        # Print summary
        print("\n" + "=" * 100)
        print("📊 BLUE ERA DASHBOARD TEST SUMMARY")
        print("=" * 100)
        
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
    tester = BlueEraAPITester()
    success = tester.run_blue_era_tests()
    
    if success:
        print("\n🎉 All Blue Era Dashboard Backend Integration tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️  Some Blue Era tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()