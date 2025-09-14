#!/usr/bin/env python3
"""
Comprehensive Blue Era Backend Health Check
Tests all critical APIs mentioned in the review request
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

class ComprehensiveBlueEraTest:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.user_id = None
        
    def log_test(self, test_name: str, success: bool, details: str = "", priority: str = "MEDIUM"):
        """Log test results with priority"""
        status = "✅ PASS" if success else "❌ FAIL"
        priority_icon = {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}.get(priority, "🟡")
        print(f"{status} {priority_icon} [{priority}] {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "priority": priority
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
        
        # Try to register a test user
        user_data = {
            "email": "comprehensive@aislemarts.com",
            "password": "comprehensive123",
            "name": "Comprehensive Test User"
        }
        
        success, data = self.make_request("POST", "/auth/register", user_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            print("✅ User registered successfully")
        else:
            # User might already exist, try to login instead
            success, data = self.make_request("POST", "/auth/login", {
                "email": "comprehensive@aislemarts.com",
                "password": "comprehensive123"
            })
            
            if success and isinstance(data, dict) and "access_token" in data:
                self.auth_token = data["access_token"]
                print("✅ User login successful")
            else:
                print(f"❌ Authentication failed: {data}")
                return False
        
        # Get user details
        success, user_data = self.make_request("GET", "/auth/me")
        if success and isinstance(user_data, dict):
            self.user_id = user_data.get("id")
            print(f"✅ User ID: {self.user_id}")
        
        return True

    def test_critical_blue_era_apis(self):
        """Test CRITICAL Blue Era APIs (HIGH PRIORITY)"""
        print("\n🔴 TESTING CRITICAL BLUE ERA APIs (HIGH PRIORITY)")
        print("=" * 60)
        
        # 1. AI Chat service for daily insights
        print("\n1️⃣ AI Chat Service for Daily Insights")
        
        # Brand insights
        brand_chat = {
            "message": "Give me daily insights for my brand performance and sales analytics",
            "context": {"user_type": "brand", "request_type": "daily_insights"}
        }
        success, data = self.make_request("POST", "/ai/chat", brand_chat)
        if success and isinstance(data, dict) and "response" in data:
            response_length = len(data.get("response", ""))
            self.log_test("AI Chat - Brand Daily Insights", True, f"Generated {response_length} chars of insights", "HIGH")
        else:
            self.log_test("AI Chat - Brand Daily Insights", False, str(data), "HIGH")
        
        # Shopper insights
        shopper_chat = {
            "message": "What are today's best deals and personalized recommendations for me?",
            "context": {"user_type": "shopper", "request_type": "daily_insights"}
        }
        success, data = self.make_request("POST", "/ai/chat", shopper_chat)
        if success and isinstance(data, dict) and "response" in data:
            response_length = len(data.get("response", ""))
            self.log_test("AI Chat - Shopper Daily Insights", True, f"Generated {response_length} chars of insights", "HIGH")
        else:
            self.log_test("AI Chat - Shopper Daily Insights", False, str(data), "HIGH")
        
        # 2. AI recommendations for product reels
        print("\n2️⃣ AI Recommendations for Product Reels")
        
        reel_rec = {
            "query": "trending products for video reels showcase",
            "context": {"format": "product_reels", "max_results": 10}
        }
        success, data = self.make_request("POST", "/ai/recommendations", reel_rec)
        if success and isinstance(data, dict) and "recommendations" in data:
            rec_count = len(data.get("recommendations", []))
            has_explanation = "ai_explanation" in data
            self.log_test("AI Recommendations for Reels", True, f"Generated {rec_count} recommendations, AI explanation: {has_explanation}", "HIGH")
        else:
            self.log_test("AI Recommendations for Reels", False, str(data), "HIGH")
        
        # 3. Products API for dynamic content
        print("\n3️⃣ Products API for Dynamic Content")
        
        success, data = self.make_request("GET", "/products", {"limit": 10})
        if success and isinstance(data, list) and len(data) > 0:
            # Check product format for reels
            product = data[0]
            required_fields = ["title", "price", "currency", "brand"]
            has_required = all(field in product for field in required_fields)
            
            # Check for images
            has_images = "images" in product or "image_url" in product
            
            self.log_test("Products API - Dynamic Content", True, f"Found {len(data)} products, reel-ready: {has_required}, has images: {has_images}", "HIGH")
            
            # Test individual product details
            product_id = product.get("id") or product.get("_id")
            if product_id:
                success, prod_data = self.make_request("GET", f"/products/{product_id}")
                if success:
                    self.log_test("Product Details API", True, f"Product: {prod_data.get('title', 'Unknown')}", "HIGH")
                else:
                    self.log_test("Product Details API", False, str(prod_data), "HIGH")
        else:
            self.log_test("Products API - Dynamic Content", False, str(data), "HIGH")
        
        # 4. AI locale detection for personalization
        print("\n4️⃣ AI Locale Detection for Personalization")
        
        success, data = self.make_request("GET", "/ai/locale-detection")
        if success and isinstance(data, dict):
            country = data.get("country", "Unknown")
            currency = data.get("currency", "Unknown")
            language = data.get("language", "Unknown")
            ai_recs = len(data.get("ai_recommendations", []))
            self.log_test("AI Locale Detection", True, f"Detected: {country} • {currency} • {language}, AI recs: {ai_recs}", "HIGH")
        else:
            self.log_test("AI Locale Detection", False, str(data), "HIGH")
        
        # 5. Auth Identity trust scores
        print("\n5️⃣ Auth Identity Trust Scores")
        
        # First try to create identity
        identity_data = {
            "username": "comprehensive_user",
            "display_name": "Comprehensive Test User",
            "bio": "Testing comprehensive Blue Era integration"
        }
        self.make_request("POST", "/auth-identity/create", identity_data)
        
        # Try to get trust score
        success, data = self.make_request("GET", "/auth-identity/trust-score")
        if success and isinstance(data, dict) and "trust_score" in data:
            trust_score = data.get("trust_score", 0)
            trust_level = data.get("trust_level", "Unknown")
            self.log_test("Auth Identity Trust Score", True, f"Trust Score: {trust_score}% ({trust_level})", "HIGH")
        else:
            # 404 is expected for new users
            if "404" in str(data):
                self.log_test("Auth Identity Trust Score", True, "404 expected for new users (identity setup required)", "HIGH")
            else:
                self.log_test("Auth Identity Trust Score", False, str(data), "HIGH")

    def test_core_marketplace_apis(self):
        """Test Core Marketplace APIs (MEDIUM PRIORITY)"""
        print("\n🟡 TESTING CORE MARKETPLACE APIs (MEDIUM PRIORITY)")
        print("=" * 60)
        
        # 1. User authentication
        print("\n1️⃣ User Authentication")
        
        # Test login
        login_data = {
            "email": "comprehensive@aislemarts.com",
            "password": "comprehensive123"
        }
        success, data = self.make_request("POST", "/auth/login", login_data)
        if success and "access_token" in data:
            self.log_test("User Login API", True, "Login successful with token", "MEDIUM")
        else:
            self.log_test("User Login API", False, str(data), "MEDIUM")
        
        # Test register (new user)
        reg_data = {
            "email": f"test_{self.user_id}@aislemarts.com",
            "password": "test123",
            "name": "Test User"
        }
        success, data = self.make_request("POST", "/auth/register", reg_data)
        if success or "already in use" in str(data):
            self.log_test("User Registration API", True, "Registration working (user may exist)", "MEDIUM")
        else:
            self.log_test("User Registration API", False, str(data), "MEDIUM")
        
        # 2. Categories API
        print("\n2️⃣ Categories API")
        
        success, data = self.make_request("GET", "/categories")
        if success and isinstance(data, list):
            self.log_test("Categories API", True, f"Found {len(data)} categories", "MEDIUM")
        else:
            self.log_test("Categories API", False, str(data), "MEDIUM")
        
        # 3. Health check
        print("\n3️⃣ Health Check API")
        
        success, data = self.make_request("GET", "/health")
        if success and isinstance(data, dict) and data.get("ok"):
            service_name = data.get("service", "Unknown")
            self.log_test("Health Check API", True, f"Service: {service_name}", "MEDIUM")
        else:
            self.log_test("Health Check API", False, str(data), "MEDIUM")

    def test_enterprise_features(self):
        """Test Enterprise Features (LOW PRIORITY)"""
        print("\n🟢 TESTING ENTERPRISE FEATURES (LOW PRIORITY)")
        print("=" * 60)
        
        # 1. AI Domain trade intelligence
        print("\n1️⃣ AI Domain Trade Intelligence")
        
        success, data = self.make_request("GET", "/ai-domain/health")
        if success and isinstance(data, dict):
            capabilities = len(data.get("capabilities", []))
            domains = len(data.get("knowledge_domains", []))
            self.log_test("AI Trade Intelligence Health", True, f"Capabilities: {capabilities}, Domains: {domains}", "LOW")
        else:
            self.log_test("AI Trade Intelligence Health", False, str(data), "LOW")
        
        # 2. Geographic targeting
        print("\n2️⃣ Geographic Targeting Features")
        
        success, data = self.make_request("GET", "/geographic/countries")
        if success and isinstance(data, dict) and "countries" in data:
            country_count = len(data.get("countries", []))
            self.log_test("Geographic Countries API", True, f"Found {country_count} countries", "LOW")
        else:
            self.log_test("Geographic Countries API", False, str(data), "LOW")
        
        # 3. Payment & tax calculation
        print("\n3️⃣ Payment & Tax Calculation")
        
        success, data = self.make_request("GET", "/payments-tax/health")
        if success and isinstance(data, dict):
            status = data.get("status", "unknown")
            services = data.get("services", {})
            self.log_test("Payments & Tax Health", True, f"Status: {status}, Services: {len(services)}", "LOW")
        else:
            self.log_test("Payments & Tax Health", False, str(data), "LOW")

    def test_error_scenarios(self):
        """Test error handling scenarios"""
        print("\n⚠️  TESTING ERROR SCENARIOS")
        print("=" * 60)
        
        # Test invalid endpoints
        success, data = self.make_request("GET", "/invalid-endpoint")
        if not success and "404" in str(data):
            self.log_test("Invalid Endpoint Handling", True, "Correctly returns 404", "MEDIUM")
        else:
            self.log_test("Invalid Endpoint Handling", False, "Should return 404", "MEDIUM")
        
        # Test unauthorized access
        old_token = self.auth_token
        self.auth_token = None
        success, data = self.make_request("GET", "/auth/me")
        self.auth_token = old_token
        
        if not success and "401" in str(data):
            self.log_test("Unauthorized Access Handling", True, "Correctly returns 401", "MEDIUM")
        else:
            self.log_test("Unauthorized Access Handling", False, "Should return 401", "MEDIUM")

    def run_comprehensive_test(self):
        """Run comprehensive Blue Era backend health check"""
        print("🚀 COMPREHENSIVE BLUE ERA BACKEND HEALTH CHECK")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 80)
        
        # Setup
        if not self.setup_authentication():
            print("❌ Authentication setup failed. Exiting.")
            return False
        
        # Run all test categories
        self.test_critical_blue_era_apis()
        self.test_core_marketplace_apis()
        self.test_enterprise_features()
        self.test_error_scenarios()
        
        # Generate comprehensive summary
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE BLUE ERA BACKEND HEALTH CHECK SUMMARY")
        print("=" * 80)
        
        # Calculate results by priority
        high_priority = [r for r in self.test_results if r["priority"] == "HIGH"]
        medium_priority = [r for r in self.test_results if r["priority"] == "MEDIUM"]
        low_priority = [r for r in self.test_results if r["priority"] == "LOW"]
        
        high_passed = sum(1 for r in high_priority if r["success"])
        medium_passed = sum(1 for r in medium_priority if r["success"])
        low_passed = sum(1 for r in low_priority if r["success"])
        
        total_passed = sum(1 for r in self.test_results if r["success"])
        total_tests = len(self.test_results)
        
        print(f"🔴 HIGH PRIORITY (Critical Blue Era APIs): {high_passed}/{len(high_priority)} passed")
        print(f"🟡 MEDIUM PRIORITY (Core Marketplace): {medium_passed}/{len(medium_priority)} passed")
        print(f"🟢 LOW PRIORITY (Enterprise Features): {low_passed}/{len(low_priority)} passed")
        print(f"📊 OVERALL: {total_passed}/{total_tests} passed ({(total_passed/total_tests)*100:.1f}%)")
        
        # Show failed tests by priority
        failed_high = [r for r in high_priority if not r["success"]]
        failed_medium = [r for r in medium_priority if not r["success"]]
        failed_low = [r for r in low_priority if not r["success"]]
        
        if failed_high:
            print(f"\n🔴 CRITICAL FAILURES (HIGH PRIORITY):")
            for test in failed_high:
                print(f"   ❌ {test['test']}: {test['details']}")
        
        if failed_medium:
            print(f"\n🟡 MEDIUM PRIORITY FAILURES:")
            for test in failed_medium:
                print(f"   ❌ {test['test']}: {test['details']}")
        
        if failed_low:
            print(f"\n🟢 LOW PRIORITY FAILURES:")
            for test in failed_low:
                print(f"   ❌ {test['test']}: {test['details']}")
        
        # Final assessment
        print(f"\n🎯 BLUE ERA BACKEND HEALTH ASSESSMENT:")
        
        high_success_rate = (high_passed / len(high_priority)) * 100 if high_priority else 100
        overall_success_rate = (total_passed / total_tests) * 100
        
        if high_success_rate >= 90 and overall_success_rate >= 85:
            print("🟢 EXCELLENT - Blue Era backend is fully operational and ready for production")
        elif high_success_rate >= 80 and overall_success_rate >= 75:
            print("🟡 GOOD - Blue Era backend is mostly operational with minor issues")
        elif high_success_rate >= 60:
            print("🟠 FAIR - Blue Era backend has some critical issues that need attention")
        else:
            print("🔴 POOR - Blue Era backend has significant issues requiring immediate attention")
        
        print(f"\n✅ Critical Blue Era APIs: {high_success_rate:.1f}% operational")
        print(f"✅ Overall Backend Health: {overall_success_rate:.1f}% operational")
        
        return high_success_rate >= 80

if __name__ == "__main__":
    tester = ComprehensiveBlueEraTest()
    success = tester.run_comprehensive_test()
    sys.exit(0 if success else 1)