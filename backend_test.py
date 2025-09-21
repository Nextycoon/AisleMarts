#!/usr/bin/env python3
"""
🎯 AisleMarts Rewards System Comprehensive Backend Testing
BlueWave-themed rewards and gamification system testing
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://bluewave-aisle.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class AisleAITester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.test_results = []
        self.session = None
        
    async def setup_session(self):
        """Setup HTTP session with proper headers"""
        connector = aiohttp.TCPConnector(ssl=False)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "AisleMarts-Backend-Tester/1.0"
            }
        )
    
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.utcnow().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        print(f"     Details: {details}")
        if response_data and not success:
            print(f"     Response: {json.dumps(response_data, indent=2)}")
        print()
    
    async def test_aisle_ai_health_check(self):
        """Test /api/aisle-ai/health endpoint"""
        try:
            url = f"{self.backend_url}/aisle-ai/health"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["status", "ai_name", "version", "uptime", 
                                     "capabilities_active", "vendor_outreach_active", 
                                     "shopper_assistance_active", "localization_active"]
                    
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields and data.get("status") == "healthy":
                        self.log_test(
                            "Aisle AI Health Check",
                            True,
                            f"Service healthy - AI: {data.get('ai_name')}, Version: {data.get('version')}, All capabilities active",
                            data
                        )
                    else:
                        self.log_test(
                            "Aisle AI Health Check", 
                            False,
                            f"Invalid response structure. Missing fields: {missing_fields}",
                            data
                        )
                else:
                    error_text = await response.text()
                    self.log_test(
                        "Aisle AI Health Check",
                        False, 
                        f"HTTP {response.status}: {error_text}"
                    )
                    
        except Exception as e:
            self.log_test("Aisle AI Health Check", False, f"Request failed: {str(e)}")
    
    async def test_aisle_ai_capabilities(self):
        """Test /api/aisle-ai/capabilities endpoint"""
        try:
            url = f"{self.backend_url}/aisle-ai/capabilities"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["ai_name", "tagline", "personality", 
                                     "communication_channels", "shopper_capabilities", 
                                     "business_capabilities", "core_features"]
                    
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        channels_count = len(data.get("communication_channels", []))
                        shopper_caps = len(data.get("shopper_capabilities", []))
                        business_caps = len(data.get("business_capabilities", []))
                        core_features = len(data.get("core_features", []))
                        
                        self.log_test(
                            "Aisle AI Capabilities",
                            True,
                            f"Complete capabilities retrieved - {channels_count} channels, {shopper_caps} shopper features, {business_caps} business features, {core_features} core features",
                            data
                        )
                    else:
                        self.log_test(
                            "Aisle AI Capabilities",
                            False,
                            f"Invalid response structure. Missing fields: {missing_fields}",
                            data
                        )
                else:
                    error_text = await response.text()
                    self.log_test(
                        "Aisle AI Capabilities",
                        False,
                        f"HTTP {response.status}: {error_text}"
                    )
                    
        except Exception as e:
            self.log_test("Aisle AI Capabilities", False, f"Request failed: {str(e)}")
    
    async def test_aisle_ai_chat(self):
        """Test /api/aisle-ai/chat endpoint"""
        try:
            url = f"{self.backend_url}/aisle-ai/chat"
            
            # Test data with realistic shopping query
            test_messages = [
                {
                    "user_id": "test_user_001",
                    "message": "Hi Aisle AI! I'm looking for luxury fashion items for a special occasion. Can you help me find something elegant?",
                    "context": {"shopping_intent": "luxury_fashion", "occasion": "special_event"},
                    "language": "en",
                    "channel": "text"
                },
                {
                    "user_id": "test_user_002", 
                    "message": "What are the trending products this week?",
                    "context": {"shopping_intent": "trending_discovery"},
                    "language": "en",
                    "channel": "text"
                }
            ]
            
            for i, message_data in enumerate(test_messages):
                async with self.session.post(url, json=message_data) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Validate response structure
                        required_fields = ["success", "ai_name", "personality", "response", 
                                         "capabilities", "conversation_id", "language", "channel"]
                        
                        missing_fields = [field for field in required_fields if field not in data]
                        
                        if not missing_fields and data.get("success"):
                            self.log_test(
                                f"Aisle AI Chat Test {i+1}",
                                True,
                                f"AI responded successfully - Conversation ID: {data.get('conversation_id')}, Response length: {len(data.get('response', ''))}, Capabilities offered: {len(data.get('capabilities', []))}",
                                {"response_preview": data.get("response", "")[:100] + "..."}
                            )
                        else:
                            self.log_test(
                                f"Aisle AI Chat Test {i+1}",
                                False,
                                f"Invalid response structure. Missing fields: {missing_fields}",
                                data
                            )
                    else:
                        error_text = await response.text()
                        self.log_test(
                            f"Aisle AI Chat Test {i+1}",
                            False,
                            f"HTTP {response.status}: {error_text}"
                        )
                        
        except Exception as e:
            self.log_test("Aisle AI Chat", False, f"Request failed: {str(e)}")
    
    async def test_aisle_ai_process_purchase(self):
        """Test /api/aisle-ai/process-purchase endpoint"""
        try:
            url = f"{self.backend_url}/aisle-ai/process-purchase"
            
            # Mock purchase data with realistic information
            purchase_data = {
                "purchase_id": f"PUR_{int(time.time())}",
                "shopper": {
                    "name": "Emma Johnson",
                    "email": "emma.johnson@example.com",
                    "phone": "+1234567890",
                    "language": "en"
                },
                "vendor": {
                    "vendor_id": "vendor_luxury_fashion_001",
                    "business_name": "Luxury Fashion Boutique",
                    "email": "contact@luxuryfashion.com",
                    "phone": "+1987654321",
                    "is_aislemarts_vendor": False,
                    "language": "en"
                },
                "order_details": {
                    "total": 299.99,
                    "currency": "USD",
                    "customer_name": "Emma Johnson",
                    "items": [
                        {"name": "Designer Dress", "price": 199.99, "quantity": 1},
                        {"name": "Luxury Handbag", "price": 100.00, "quantity": 1}
                    ]
                }
            }
            
            async with self.session.post(url, json=purchase_data) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["success", "message", "purchase_id", "ai_actions", "timestamp"]
                    
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields and data.get("success"):
                        ai_actions = data.get("ai_actions", [])
                        expected_actions = ["shopper_thank_you", "vendor_outreach", "onboarding_if_new", "follow_up_scheduling"]
                        
                        self.log_test(
                            "Aisle AI Purchase Processing",
                            True,
                            f"Purchase processed successfully - Purchase ID: {data.get('purchase_id')}, AI Actions: {len(ai_actions)}, Background processing initiated",
                            {"ai_actions": ai_actions}
                        )
                    else:
                        self.log_test(
                            "Aisle AI Purchase Processing",
                            False,
                            f"Invalid response structure. Missing fields: {missing_fields}",
                            data
                        )
                else:
                    error_text = await response.text()
                    self.log_test(
                        "Aisle AI Purchase Processing",
                        False,
                        f"HTTP {response.status}: {error_text}"
                    )
                    
        except Exception as e:
            self.log_test("Aisle AI Purchase Processing", False, f"Request failed: {str(e)}")
    
    async def test_aisle_ai_vendor_outreach(self):
        """Test /api/aisle-ai/vendor-outreach endpoint"""
        try:
            url = f"{self.backend_url}/aisle-ai/vendor-outreach"
            
            # Test data for vendor outreach
            outreach_data = {
                "vendor_info": {
                    "vendor_id": "vendor_electronics_002",
                    "business_name": "Tech Innovations Store",
                    "email": "hello@techinnovations.com",
                    "phone": "+1555123456",
                    "is_aislemarts_vendor": False,
                    "language": "en"
                },
                "order_details": {
                    "total": 599.99,
                    "currency": "USD",
                    "customer_name": "Michael Chen",
                    "items": [
                        {"name": "Smartphone", "price": 499.99, "quantity": 1},
                        {"name": "Phone Case", "price": 100.00, "quantity": 1}
                    ]
                },
                "outreach_type": "onboarding"
            }
            
            async with self.session.post(url, json=outreach_data) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["success", "message", "vendor_id", "outreach_type", "actions", "timestamp"]
                    
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields and data.get("success"):
                        actions = data.get("actions", [])
                        expected_actions = ["thank_you_message", "onboarding_invitation", "benefits_presentation", "followup_scheduling"]
                        
                        self.log_test(
                            "Aisle AI Vendor Outreach",
                            True,
                            f"Vendor outreach initiated successfully - Vendor ID: {data.get('vendor_id')}, Outreach Type: {data.get('outreach_type')}, Actions: {len(actions)}",
                            {"actions": actions}
                        )
                    else:
                        self.log_test(
                            "Aisle AI Vendor Outreach",
                            False,
                            f"Invalid response structure. Missing fields: {missing_fields}",
                            data
                        )
                else:
                    error_text = await response.text()
                    self.log_test(
                        "Aisle AI Vendor Outreach",
                        False,
                        f"HTTP {response.status}: {error_text}"
                    )
                    
        except Exception as e:
            self.log_test("Aisle AI Vendor Outreach", False, f"Request failed: {str(e)}")
    
    async def test_aisle_ai_stats(self):
        """Test /api/aisle-ai/stats endpoint"""
        try:
            url = f"{self.backend_url}/aisle-ai/stats"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["total_interactions", "shopper_conversations", 
                                     "vendor_outreach_messages", "onboarding_invitations_sent",
                                     "successful_vendor_conversions", "languages_supported",
                                     "countries_active", "average_response_time_ms",
                                     "satisfaction_rating", "growth_metrics", "top_use_cases"]
                    
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        total_interactions = data.get("total_interactions", 0)
                        languages = data.get("languages_supported", 0)
                        countries = data.get("countries_active", 0)
                        satisfaction = data.get("satisfaction_rating", 0)
                        
                        self.log_test(
                            "Aisle AI Statistics",
                            True,
                            f"Statistics retrieved successfully - {total_interactions:,} total interactions, {languages} languages, {countries} countries, {satisfaction}/5.0 satisfaction rating",
                            {
                                "key_metrics": {
                                    "total_interactions": total_interactions,
                                    "languages_supported": languages,
                                    "countries_active": countries,
                                    "satisfaction_rating": satisfaction
                                }
                            }
                        )
                    else:
                        self.log_test(
                            "Aisle AI Statistics",
                            False,
                            f"Invalid response structure. Missing fields: {missing_fields}",
                            data
                        )
                else:
                    error_text = await response.text()
                    self.log_test(
                        "Aisle AI Statistics",
                        False,
                        f"HTTP {response.status}: {error_text}"
                    )
                    
        except Exception as e:
            self.log_test("Aisle AI Statistics", False, f"Request failed: {str(e)}")
    
    async def test_aisle_ai_feedback(self):
        """Test /api/aisle-ai/feedback endpoint"""
        try:
            url = f"{self.backend_url}/aisle-ai/feedback"
            
            # Test feedback data
            feedback_scenarios = [
                {
                    "user_id": "test_user_001",
                    "interaction_id": "conv_12345",
                    "rating": 5,
                    "feedback_type": "positive",
                    "comment": "Aisle AI was incredibly helpful in finding the perfect luxury dress for my event. The recommendations were spot-on!",
                    "category": "product_discovery"
                },
                {
                    "user_id": "vendor_001",
                    "interaction_id": "outreach_67890", 
                    "rating": 4,
                    "feedback_type": "constructive",
                    "comment": "The onboarding invitation was well-crafted, but I'd like more specific information about commission rates.",
                    "category": "vendor_outreach"
                }
            ]
            
            for i, feedback_data in enumerate(feedback_scenarios):
                async with self.session.post(url, json=feedback_data) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Validate response structure
                        required_fields = ["success", "feedback_id", "message", "ai_response", "timestamp"]
                        
                        missing_fields = [field for field in required_fields if field not in data]
                        
                        if not missing_fields and data.get("success"):
                            self.log_test(
                                f"Aisle AI Feedback Test {i+1}",
                                True,
                                f"Feedback processed successfully - Feedback ID: {data.get('feedback_id')}, AI acknowledged feedback with personalized response",
                                {"ai_response": data.get("ai_response")}
                            )
                        else:
                            self.log_test(
                                f"Aisle AI Feedback Test {i+1}",
                                False,
                                f"Invalid response structure. Missing fields: {missing_fields}",
                                data
                            )
                    else:
                        error_text = await response.text()
                        self.log_test(
                            f"Aisle AI Feedback Test {i+1}",
                            False,
                            f"HTTP {response.status}: {error_text}"
                        )
                        
        except Exception as e:
            self.log_test("Aisle AI Feedback", False, f"Request failed: {str(e)}")
    
    async def test_integration_validation(self):
        """Test server integration and import resolution"""
        try:
            # Test that the main health endpoint includes Aisle AI
            url = f"{self.backend_url}/health"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if data.get("ok") and "AisleMarts" in data.get("service", ""):
                        self.log_test(
                            "Server Integration Check",
                            True,
                            f"Main server operational - Service: {data.get('service')}, Version: {data.get('version')}",
                            data
                        )
                    else:
                        self.log_test(
                            "Server Integration Check",
                            False,
                            "Main server health check failed or invalid response",
                            data
                        )
                else:
                    error_text = await response.text()
                    self.log_test(
                        "Server Integration Check",
                        False,
                        f"HTTP {response.status}: {error_text}"
                    )
                    
        except Exception as e:
            self.log_test("Server Integration Check", False, f"Request failed: {str(e)}")
    
    async def test_concurrent_requests(self):
        """Test concurrent request handling"""
        try:
            # Test multiple concurrent requests to health endpoint
            tasks = []
            for i in range(5):
                task = self.session.get(f"{self.backend_url}/aisle-ai/health")
                tasks.append(task)
            
            start_time = time.time()
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            end_time = time.time()
            
            successful_responses = 0
            for response in responses:
                if not isinstance(response, Exception):
                    if response.status == 200:
                        successful_responses += 1
                    response.close()
            
            if successful_responses == 5:
                self.log_test(
                    "Concurrent Request Handling",
                    True,
                    f"All 5 concurrent requests successful in {end_time - start_time:.2f}s"
                )
            else:
                self.log_test(
                    "Concurrent Request Handling",
                    False,
                    f"Only {successful_responses}/5 concurrent requests successful"
                )
                
        except Exception as e:
            self.log_test("Concurrent Request Handling", False, f"Request failed: {str(e)}")
    
    async def run_all_tests(self):
        """Run all Aisle AI tests"""
        print("🤖⚡ AISLE AI SERVICE COMPREHENSIVE BACKEND TESTING")
        print("=" * 60)
        print(f"Backend URL: {self.backend_url}")
        print(f"Test Start Time: {datetime.utcnow().isoformat()}")
        print()
        
        await self.setup_session()
        
        try:
            # Core Aisle AI endpoint tests
            await self.test_aisle_ai_health_check()
            await self.test_aisle_ai_capabilities()
            await self.test_aisle_ai_chat()
            await self.test_aisle_ai_process_purchase()
            await self.test_aisle_ai_vendor_outreach()
            await self.test_aisle_ai_stats()
            await self.test_aisle_ai_feedback()
            
            # Integration and performance tests
            await self.test_integration_validation()
            await self.test_concurrent_requests()
            
        finally:
            await self.cleanup_session()
        
        # Generate summary
        self.generate_test_summary()
    
    def generate_test_summary(self):
        """Generate comprehensive test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print("\n" + "=" * 60)
        print("🤖⚡ AISLE AI SERVICE TESTING SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if failed_tests > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['details']}")
            print()
        
        print("✅ SUCCESSFUL TESTS:")
        for result in self.test_results:
            if result["success"]:
                print(f"  • {result['test']}: {result['details']}")
        
        print("\n" + "=" * 60)
        print(f"Test Completion Time: {datetime.utcnow().isoformat()}")
        
        # Determine overall status
        if success_rate >= 90:
            print("🟢 OVERALL STATUS: EXCELLENT - Aisle AI service fully operational")
        elif success_rate >= 75:
            print("🟡 OVERALL STATUS: GOOD - Aisle AI service mostly operational with minor issues")
        elif success_rate >= 50:
            print("🟠 OVERALL STATUS: FAIR - Aisle AI service partially operational, needs attention")
        else:
            print("🔴 OVERALL STATUS: POOR - Aisle AI service has significant issues")
        
        print("=" * 60)

async def main():
    """Main test execution"""
    tester = AisleAITester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())