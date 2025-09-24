#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Infinity Stories System
Testing Core API Health, Currency System, AI Super Agent, Rewards System, 
CLP Engine, Universal AI Hub, Authentication, and Concurrent Performance
"""

import asyncio
import aiohttp
import json
import time
from typing import Dict, List, Any
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://social-ecosystem.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class InfinityStoriesBackendTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.auth_token = None
        self.test_user_id = None
        
    async def setup_session(self):
        """Setup HTTP session with proper headers"""
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'AisleMarts-InfinityStories-Tester/1.0'
            }
        )
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    async def log_test(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        result = {
            'test_name': test_name,
            'success': success,
            'details': details,
            'response_time': response_time,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name} ({response_time:.3f}s) - {details}")
        
    async def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, response_time)"""
        start_time = time.time()
        url = f"{API_BASE}{endpoint}"
        
        try:
            request_headers = {}
            if self.auth_token:
                request_headers['Authorization'] = f'Bearer {self.auth_token}'
            if headers:
                request_headers.update(headers)
                
            async with self.session.request(method, url, json=data, headers=request_headers) as response:
                response_time = time.time() - start_time
                
                if response.status == 200:
                    try:
                        response_data = await response.json()
                        return True, response_data, response_time
                    except:
                        response_text = await response.text()
                        return True, {'text': response_text}, response_time
                else:
                    error_text = await response.text()
                    return False, {'status': response.status, 'error': error_text}, response_time
                    
        except Exception as e:
            response_time = time.time() - start_time
            return False, {'error': str(e)}, response_time
            
    async def test_main_api_health(self):
        """Test main API health endpoint"""
        success, data, response_time = await self.make_request('GET', '/health')
        
        if success and data.get('ok') == True:
            await self.log_test(
                "Main API Health Check", 
                True, 
                f"Service: {data.get('service', 'Unknown')}, Status: {data.get('status', 'Unknown')}", 
                response_time
            )
        else:
            await self.log_test(
                "Main API Health Check", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
    async def test_currency_system(self):
        """Test Currency-Infinity Engine v2.0"""
        # Test currency health check
        success, data, response_time = await self.make_request('GET', '/currency/health')
        
        if success:
            await self.log_test(
                "Currency System Health", 
                True, 
                f"Currencies: {data.get('currencies_count', 0)}, Regions: {data.get('regions_count', 0)}", 
                response_time
            )
        else:
            await self.log_test(
                "Currency System Health", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
        # Test currency conversion
        success, data, response_time = await self.make_request('GET', '/currency/convert?from=USD&to=EUR&amount=100')
        
        if success and 'converted_amount' in data:
            await self.log_test(
                "Currency Conversion", 
                True, 
                f"100 USD = {data.get('converted_amount', 0)} EUR", 
                response_time
            )
        else:
            await self.log_test(
                "Currency Conversion", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
    async def test_ai_super_agent(self):
        """Test AI Super Agent system"""
        # Test AI Super Agent health
        success, data, response_time = await self.make_request('GET', '/ai-super-agent/health')
        
        if success:
            await self.log_test(
                "AI Super Agent Health", 
                True, 
                f"Status: {data.get('status', 'Unknown')}, Capabilities: {len(data.get('capabilities', []))}", 
                response_time
            )
        else:
            await self.log_test(
                "AI Super Agent Health", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
        # Test AI capabilities
        success, data, response_time = await self.make_request('GET', '/ai-super-agent/capabilities')
        
        if success and isinstance(data.get('capabilities'), list):
            await self.log_test(
                "AI Super Agent Capabilities", 
                True, 
                f"Available capabilities: {len(data.get('capabilities', []))}", 
                response_time
            )
        else:
            await self.log_test(
                "AI Super Agent Capabilities", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
    async def test_rewards_system(self):
        """Test Rewards System"""
        # Test rewards health
        success, data, response_time = await self.make_request('GET', '/rewards/health')
        
        if success:
            await self.log_test(
                "Rewards System Health", 
                True, 
                f"Status: {data.get('status', 'Unknown')}, Features: {len(data.get('features', []))}", 
                response_time
            )
        else:
            await self.log_test(
                "Rewards System Health", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
        # Test rewards balance (requires auth)
        if self.auth_token:
            success, data, response_time = await self.make_request('GET', '/rewards/balance')
            
            if success:
                await self.log_test(
                    "Rewards Balance Check", 
                    True, 
                    f"Balance retrieved successfully", 
                    response_time
                )
            else:
                await self.log_test(
                    "Rewards Balance Check", 
                    False, 
                    f"Failed: {data}", 
                    response_time
                )
                
    async def test_clp_engine(self):
        """Test CLP Engine (Content Lead Purchase)"""
        # Test CLP Engine health
        success, data, response_time = await self.make_request('GET', '/clp-engine/health')
        
        if success:
            await self.log_test(
                "CLP Engine Health", 
                True, 
                f"Status: {data.get('status', 'Unknown')}, Features: {len(data.get('features', []))}", 
                response_time
            )
        else:
            await self.log_test(
                "CLP Engine Health", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
        # Test content optimization
        success, data, response_time = await self.make_request('GET', '/clp-engine/content/optimize')
        
        if success:
            await self.log_test(
                "CLP Content Optimization", 
                True, 
                f"Optimization available", 
                response_time
            )
        else:
            await self.log_test(
                "CLP Content Optimization", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
    async def test_universal_ai_hub(self):
        """Test Universal AI Hub"""
        # Test Universal AI health
        success, data, response_time = await self.make_request('GET', '/universal-ai/health')
        
        if success:
            await self.log_test(
                "Universal AI Hub Health", 
                True, 
                f"Status: {data.get('status', 'Unknown')}, Platforms: {data.get('platforms_count', 0)}", 
                response_time
            )
        else:
            await self.log_test(
                "Universal AI Hub Health", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
        # Test AI product recommendations
        success, data, response_time = await self.make_request('GET', '/universal-ai/products/recommend?query=luxury+fashion')
        
        if success:
            await self.log_test(
                "Universal AI Product Recommendations", 
                True, 
                f"Recommendations available", 
                response_time
            )
        else:
            await self.log_test(
                "Universal AI Product Recommendations", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
    async def test_authentication_system(self):
        """Test Authentication & User Profile system"""
        # Test user registration
        test_email = f"infinity_user_{int(time.time())}@aislemarts.com"
        test_password = "InfinityStories2024!"
        
        register_data = {
            "email": test_email,
            "name": "Infinity Stories User",
            "password": test_password
        }
        
        success, data, response_time = await self.make_request('POST', '/auth/register', register_data)
        
        if success and 'access_token' in data:
            self.auth_token = data['access_token']
            await self.log_test(
                "User Registration", 
                True, 
                f"User registered successfully", 
                response_time
            )
            
            # Test user profile retrieval
            success, profile_data, response_time = await self.make_request('GET', '/auth/me')
            
            if success and 'email' in profile_data:
                self.test_user_id = profile_data.get('id')
                await self.log_test(
                    "User Profile Retrieval", 
                    True, 
                    f"Profile retrieved for: {profile_data.get('email')}", 
                    response_time
                )
            else:
                await self.log_test(
                    "User Profile Retrieval", 
                    False, 
                    f"Failed: {profile_data}", 
                    response_time
                )
        else:
            await self.log_test(
                "User Registration", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
    async def test_concurrent_performance(self):
        """Test system under concurrent load"""
        print("\n🚀 Starting Concurrent Performance Testing...")
        
        # Test concurrent requests to main health endpoint
        concurrent_requests = 20
        tasks = []
        
        start_time = time.time()
        
        for i in range(concurrent_requests):
            task = self.make_request('GET', '/health')
            tasks.append(task)
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        successful_requests = sum(1 for result in results if not isinstance(result, Exception) and result[0])
        
        success_rate = (successful_requests / concurrent_requests) * 100
        avg_response_time = total_time / concurrent_requests
        
        if success_rate >= 95:
            await self.log_test(
                "Concurrent Performance Test", 
                True, 
                f"Success rate: {success_rate:.1f}% ({successful_requests}/{concurrent_requests}), Avg time: {avg_response_time:.3f}s", 
                total_time
            )
        else:
            await self.log_test(
                "Concurrent Performance Test", 
                False, 
                f"Success rate: {success_rate:.1f}% ({successful_requests}/{concurrent_requests}) - Below 95% threshold", 
                total_time
            )
            
    async def test_additional_systems(self):
        """Test additional backend systems"""
        # Test Advanced AI & Personalization Engine
        success, data, response_time = await self.make_request('GET', '/advanced-ai/health')
        
        if success:
            await self.log_test(
                "Advanced AI Engine Health", 
                True, 
                f"AI capabilities operational", 
                response_time
            )
        else:
            await self.log_test(
                "Advanced AI Engine Health", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
        # Test Global Monetization Suite
        success, data, response_time = await self.make_request('GET', '/monetization/health')
        
        if success:
            await self.log_test(
                "Global Monetization Suite Health", 
                True, 
                f"Monetization systems operational", 
                response_time
            )
        else:
            await self.log_test(
                "Global Monetization Suite Health", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
        # Test Live Streaming Commerce
        success, data, response_time = await self.make_request('GET', '/live-streaming/health')
        
        if success:
            await self.log_test(
                "Live Streaming Commerce Health", 
                True, 
                f"Live streaming systems operational", 
                response_time
            )
        else:
            await self.log_test(
                "Live Streaming Commerce Health", 
                False, 
                f"Failed: {data}", 
                response_time
            )
            
    async def run_all_tests(self):
        """Run all backend tests"""
        print("🌊⚡ INFINITY STORIES SYSTEM - BACKEND TESTING INITIATED")
        print(f"Testing backend at: {API_BASE}")
        print("=" * 80)
        
        await self.setup_session()
        
        try:
            # Core API Health Checks
            print("\n1️⃣ CORE API HEALTH CHECKS")
            await self.test_main_api_health()
            await self.test_currency_system()
            await self.test_ai_super_agent()
            await self.test_rewards_system()
            
            # CLP Engine Functionality
            print("\n2️⃣ CLP ENGINE FUNCTIONALITY")
            await self.test_clp_engine()
            
            # Universal AI Hub
            print("\n3️⃣ UNIVERSAL AI HUB")
            await self.test_universal_ai_hub()
            
            # Authentication & User Profile
            print("\n4️⃣ AUTHENTICATION & USER PROFILE")
            await self.test_authentication_system()
            
            # Additional Systems
            print("\n5️⃣ ADDITIONAL BACKEND SYSTEMS")
            await self.test_additional_systems()
            
            # Concurrent Performance
            print("\n6️⃣ CONCURRENT PERFORMANCE TESTING")
            await self.test_concurrent_performance()
            
        finally:
            await self.cleanup_session()
            
        # Generate summary
        self.generate_summary()
        
    def generate_summary(self):
        """Generate test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        avg_response_time = sum(result['response_time'] for result in self.test_results) / total_tests if total_tests > 0 else 0
        
        print("\n" + "=" * 80)
        print("🎯 INFINITY STORIES BACKEND TESTING SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Average Response Time: {avg_response_time:.3f}s")
        
        if success_rate >= 95:
            print(f"\n🎉 BACKEND READY FOR INFINITY STORIES SYSTEM!")
            print(f"✅ {success_rate:.1f}% success rate exceeds 95% target")
        else:
            print(f"\n⚠️ BACKEND NEEDS ATTENTION")
            print(f"❌ {success_rate:.1f}% success rate below 95% target")
            
        # Show failed tests
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({failed_tests}):")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test_name']}: {result['details']}")
                    
        print("=" * 80)

async def main():
    """Main test execution"""
    tester = InfinityStoriesBackendTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())