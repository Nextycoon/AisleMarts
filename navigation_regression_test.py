#!/usr/bin/env python3
"""
🎯 AisleMarts Backend Testing Suite - Tab Navigation Fix Impact Assessment

This script tests backend systems to ensure the AisleMarts tab navigation fix 
hasn't broken any existing functionality.

PRIORITY TESTING AREAS:
1. Core API Health Checks - Verify all main API endpoints are responding correctly
2. Navigation-Related Routes - Test any backend routes that might be related to navigation or user sessions
3. Currency System - Ensure the Currency-Infinity Engine is still operational since it's used in the Live Marketplace
4. Auth System - Verify authentication endpoints are working since we made changes to AuthProvider integration
5. Live Marketplace APIs - Test any APIs that the Live Marketplace screen might be calling

Expected Success Rate: 95%+ (No regression from navigation changes)
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
import os
import sys

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://social-commerce-14.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class NavigationRegressionTester:
    def __init__(self):
        self.session = None
        self.results = {
            "core_api_health": [],
            "currency_system": [],
            "auth_system": [],
            "live_marketplace": [],
            "navigation_routes": [],
            "performance_metrics": {},
            "overall_stats": {
                "total_tests": 0,
                "passed": 0,
                "failed": 0,
                "success_rate": 0.0,
                "total_time": 0.0
            }
        }
        self.start_time = time.time()
        self.auth_token = None
        self.test_user_id = None

    async def __aenter__(self):
        """Async context manager entry"""
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(timeout=timeout)
        await self.setup_test_user()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()

    async def setup_test_user(self):
        """Setup test user for authentication"""
        try:
            # Register test user
            register_data = {
                "email": f"navtest_{int(time.time())}@aislemarts.com",
                "password": "NavigationTest123!"
            }
            
            async with self.session.post(f"{API_BASE}/auth/register", json=register_data) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    self.auth_token = data.get('token')
                    self.test_user_id = data.get('user_id')
                    print(f"✅ Test user created for navigation testing")
                else:
                    print(f"⚠️ Test user setup failed: {resp.status}")
                    
        except Exception as e:
            print(f"⚠️ Test user setup error: {e}")

    def get_auth_headers(self):
        """Get authorization headers"""
        if self.auth_token:
            return {'Authorization': f'Bearer {self.auth_token}'}
        return {}

    async def test_endpoint(self, endpoint: str, method: str = "GET", data: Dict = None, 
                          category: str = "general", description: str = "", 
                          headers: Dict = None, expected_status: int = 200) -> Dict[str, Any]:
        """Test a single endpoint and return results"""
        test_start = time.time()
        url = f"{API_BASE}{endpoint}"
        
        # Merge headers
        request_headers = {}
        if headers:
            request_headers.update(headers)
        
        try:
            if method.upper() == "GET":
                async with self.session.get(url, headers=request_headers) as response:
                    try:
                        response_data = await response.json()
                    except:
                        response_data = await response.text()
                    status_code = response.status
            elif method.upper() == "POST":
                async with self.session.post(url, json=data, headers=request_headers) as response:
                    try:
                        response_data = await response.json()
                    except:
                        response_data = await response.text()
                    status_code = response.status
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            test_time = time.time() - test_start
            success = status_code == expected_status
            
            result = {
                "endpoint": endpoint,
                "method": method,
                "description": description,
                "status_code": status_code,
                "expected_status": expected_status,
                "success": success,
                "response_time": round(test_time, 3),
                "response_data": response_data if success else None,
                "error": None if success else f"Expected {expected_status}, got {status_code}",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Add to appropriate category
            self.results[category].append(result)
            
            # Update overall stats
            self.results["overall_stats"]["total_tests"] += 1
            if success:
                self.results["overall_stats"]["passed"] += 1
                print(f"✅ {description}: {status_code} ({test_time:.3f}s)")
            else:
                self.results["overall_stats"]["failed"] += 1
                print(f"❌ {description}: {status_code} (expected {expected_status}) ({test_time:.3f}s)")
            
            return result
            
        except Exception as e:
            test_time = time.time() - test_start
            result = {
                "endpoint": endpoint,
                "method": method,
                "description": description,
                "status_code": 0,
                "expected_status": expected_status,
                "success": False,
                "response_time": round(test_time, 3),
                "response_data": None,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            self.results[category].append(result)
            self.results["overall_stats"]["total_tests"] += 1
            self.results["overall_stats"]["failed"] += 1
            print(f"❌ {description}: ERROR - {str(e)} ({test_time:.3f}s)")
            
            return result

    async def test_core_api_health(self):
        """Test core API health endpoints"""
        print("\n🔍 Testing Core API Health Checks...")
        
        # Main API health
        await self.test_endpoint(
            "/health",
            description="Main API Health Check",
            category="core_api_health"
        )
        
        # Currency system health
        await self.test_endpoint(
            "/currency/health",
            description="Currency System Health",
            category="core_api_health"
        )
        
        # AI Super Agent health
        await self.test_endpoint(
            "/ai-super-agent/health",
            description="AI Super Agent Health",
            category="core_api_health"
        )
        
        # Rewards system health
        await self.test_endpoint(
            "/rewards/health",
            description="Rewards System Health",
            category="core_api_health"
        )
        
        # Universal AI health
        await self.test_endpoint(
            "/universal-ai/health",
            description="Universal AI Health",
            category="core_api_health"
        )

    async def test_currency_system(self):
        """Test Currency-Infinity Engine functionality"""
        print("\n💰 Testing Currency-Infinity Engine...")
        
        # Get supported currencies
        await self.test_endpoint(
            "/currency/supported",
            description="Get Supported Currencies",
            category="currency_system"
        )
        
        # Get exchange rates (USD base)
        await self.test_endpoint(
            "/currency/rates?base=USD",
            description="Get Exchange Rates (USD base)",
            category="currency_system"
        )
        
        # Get exchange rates (EUR base)
        await self.test_endpoint(
            "/currency/rates?base=EUR",
            description="Get Exchange Rates (EUR base)",
            category="currency_system"
        )
        
        # Currency conversion
        await self.test_endpoint(
            "/currency/convert?amount=100&from=USD&to=EUR",
            description="Currency Conversion (USD to EUR)",
            category="currency_system"
        )
        
        # Currency conversion (JPY to GBP)
        await self.test_endpoint(
            "/currency/convert?amount=1000&from=JPY&to=GBP",
            description="Currency Conversion (JPY to GBP)",
            category="currency_system"
        )
        
        # Test crypto currency support
        await self.test_endpoint(
            "/currency/convert?amount=1&from=BTC&to=USD",
            description="Crypto Currency Conversion (BTC to USD)",
            category="currency_system"
        )
        
        # Test invalid currency (should fail)
        await self.test_endpoint(
            "/currency/convert?amount=100&from=INVALID&to=USD",
            description="Invalid Currency Conversion (should fail)",
            category="currency_system",
            expected_status=400
        )

    async def test_auth_system(self):
        """Test authentication system"""
        print("\n🔐 Testing Authentication System...")
        
        # Test protected endpoint without auth (should fail)
        await self.test_endpoint(
            "/auth/me",
            description="Protected Endpoint (No Auth - should fail)",
            category="auth_system",
            expected_status=401
        )
        
        # Test protected endpoint with auth
        if self.auth_token:
            await self.test_endpoint(
                "/auth/me",
                description="Protected Endpoint (With Auth)",
                category="auth_system",
                headers=self.get_auth_headers()
            )
            
            # Test user info endpoint
            if self.test_user_id:
                await self.test_endpoint(
                    f"/auth/users/{self.test_user_id}",
                    description="Get User Info",
                    category="auth_system",
                    headers=self.get_auth_headers()
                )
                
                # Test user preferences
                preferences_data = {
                    "language": "en",
                    "styles": ["luxury", "modern"],
                    "budget": "$$$",
                    "package": "Premium",
                    "onboarded": True
                }
                await self.test_endpoint(
                    f"/auth/users/{self.test_user_id}/preferences",
                    method="POST",
                    data=preferences_data,
                    description="Save User Preferences",
                    category="auth_system",
                    headers=self.get_auth_headers()
                )

    async def test_live_marketplace_apis(self):
        """Test Live Marketplace related APIs"""
        print("\n🛍️ Testing Live Marketplace APIs...")
        
        if not self.auth_token:
            print("⚠️ Skipping Live Marketplace tests - no auth token")
            return
            
        auth_headers = self.get_auth_headers()
        
        # Test LiveSale endpoints
        await self.test_endpoint(
            "/livesale",
            description="Get LiveSales",
            category="live_marketplace",
            headers=auth_headers
        )
        
        # Test active LiveSales
        await self.test_endpoint(
            "/livesale/active/all",
            description="Get Active LiveSales",
            category="live_marketplace",
            headers=auth_headers
        )
        
        # Test products endpoint
        await self.test_endpoint(
            "/products?limit=10",
            description="Get Products",
            category="live_marketplace"
        )
        
        # Test categories
        await self.test_endpoint(
            "/categories",
            description="Get Categories",
            category="live_marketplace"
        )
        
        # Test AI recommendations
        await self.test_endpoint(
            "/universal-ai/recommendations/products?category=electronics&limit=5",
            description="AI Product Recommendations",
            category="live_marketplace"
        )
        
        # Test TikTok-style feed
        await self.test_endpoint(
            "/social/feed/for-you?user_id=test_user_001&limit=10&family_safe_only=true",
            description="TikTok-Style For You Feed",
            category="live_marketplace"
        )

    async def test_navigation_related_routes(self):
        """Test navigation and session related routes"""
        print("\n🧭 Testing Navigation-Related Routes...")
        
        if not self.auth_token:
            print("⚠️ Skipping navigation tests - no auth token")
            return
            
        auth_headers = self.get_auth_headers()
        
        # Test rewards dashboard data
        await self.test_endpoint(
            "/rewards/dashboard",
            description="Rewards Dashboard Data",
            category="navigation_routes",
            headers=auth_headers
        )
        
        # Test AI Super Agent capabilities
        await self.test_endpoint(
            "/ai-super-agent/capabilities?user_id=test_user_123",
            description="AI Super Agent Capabilities",
            category="navigation_routes",
            headers=auth_headers
        )
        
        # Test user profile data
        await self.test_endpoint(
            "/auth/me",
            description="User Profile Data",
            category="navigation_routes",
            headers=auth_headers
        )
        
        # Test notifications (if available)
        await self.test_endpoint(
            "/notifications",
            description="User Notifications",
            category="navigation_routes",
            headers=auth_headers
        )
        
        # Test family safety features
        await self.test_endpoint(
            "/family-safety/health",
            description="Family Safety System",
            category="navigation_routes"
        )

    async def test_concurrent_performance(self):
        """Test concurrent performance on critical endpoints"""
        print("\n⚡ Testing Concurrent Performance...")
        
        # Test multiple concurrent requests to health endpoint
        tasks = []
        critical_endpoints = [
            "/health",
            "/currency/health",
            "/ai-super-agent/health",
            "/rewards/health"
        ]
        
        start_time = time.time()
        for i in range(5):  # 5 concurrent requests per endpoint
            for endpoint in critical_endpoints:
                task = self.test_endpoint(
                    endpoint,
                    description=f"Concurrent {endpoint} #{i+1}",
                    category="navigation_routes"
                )
                tasks.append(task)
        
        # Execute all concurrent requests
        await asyncio.gather(*tasks, return_exceptions=True)
        
        concurrent_time = time.time() - start_time
        self.results["performance_metrics"]["concurrent_test"] = {
            "total_requests": len(tasks),
            "total_time": round(concurrent_time, 3),
            "requests_per_second": round(len(tasks) / concurrent_time, 2),
            "average_response_time": round(concurrent_time / len(tasks), 3)
        }
        
        print(f"✅ Concurrent Load Test: {len(tasks)} requests in {concurrent_time:.3f}s")

    def calculate_final_stats(self):
        """Calculate final statistics"""
        total_time = time.time() - self.start_time
        total_tests = self.results["overall_stats"]["total_tests"]
        passed = self.results["overall_stats"]["passed"]
        
        self.results["overall_stats"]["total_time"] = round(total_time, 3)
        self.results["overall_stats"]["success_rate"] = round((passed / total_tests * 100), 1) if total_tests > 0 else 0.0
        self.results["overall_stats"]["average_response_time"] = round(total_time / total_tests, 3) if total_tests > 0 else 0.0

    def print_results(self):
        """Print comprehensive test results"""
        print("\n" + "="*80)
        print("🎯 NAVIGATION REGRESSION TESTING RESULTS")
        print("="*80)
        
        # Overall Statistics
        stats = self.results["overall_stats"]
        print(f"\n📊 OVERALL STATISTICS:")
        print(f"   Total Tests: {stats['total_tests']}")
        print(f"   Passed: {stats['passed']}")
        print(f"   Failed: {stats['failed']}")
        print(f"   Success Rate: {stats['success_rate']}%")
        print(f"   Total Time: {stats['total_time']}s")
        print(f"   Average Response Time: {stats.get('average_response_time', 0)}s")
        
        # Category Results
        categories = [
            ("core_api_health", "🔍 CORE API HEALTH CHECKS"),
            ("currency_system", "💰 CURRENCY-INFINITY ENGINE"),
            ("auth_system", "🔐 AUTHENTICATION SYSTEM"),
            ("live_marketplace", "🛍️ LIVE MARKETPLACE APIs"),
            ("navigation_routes", "🧭 NAVIGATION-RELATED ROUTES")
        ]
        
        for category_key, category_name in categories:
            results = self.results[category_key]
            if results:
                passed = sum(1 for r in results if r["success"])
                total = len(results)
                success_rate = round((passed / total * 100), 1) if total > 0 else 0.0
                
                print(f"\n{category_name}:")
                print(f"   Tests: {total} | Passed: {passed} | Success Rate: {success_rate}%")
                
                # Show failed tests
                failed_tests = [r for r in results if not r["success"]]
                if failed_tests:
                    print(f"   ❌ FAILED TESTS:")
                    for test in failed_tests:
                        print(f"      - {test['endpoint']}: {test['error']}")
                        if test.get('response_data'):
                            print(f"        Response: {str(test['response_data'])[:100]}...")
                else:
                    print(f"   ✅ ALL TESTS PASSED")
        
        # Performance Metrics
        if "concurrent_test" in self.results["performance_metrics"]:
            perf = self.results["performance_metrics"]["concurrent_test"]
            print(f"\n⚡ CONCURRENT PERFORMANCE:")
            print(f"   Requests: {perf['total_requests']}")
            print(f"   Total Time: {perf['total_time']}s")
            print(f"   Requests/Second: {perf['requests_per_second']}")
            print(f"   Avg Response Time: {perf['average_response_time']}s")
        
        # Navigation Fix Impact Assessment
        overall_success = stats['success_rate']
        print(f"\n🎯 NAVIGATION FIX IMPACT ASSESSMENT:")
        
        if overall_success >= 95:
            print("   ✅ NO REGRESSION DETECTED - Navigation fix successful")
            print("   Status: BACKEND SYSTEMS FULLY OPERATIONAL")
        elif overall_success >= 90:
            print("   ⚠️ MINOR ISSUES DETECTED - Mostly successful")
            print("   Status: MINOR INVESTIGATION NEEDED")
        elif overall_success >= 80:
            print("   ⚠️ MODERATE ISSUES DETECTED - Some failures")
            print("   Status: INVESTIGATION REQUIRED")
        else:
            print("   ❌ SIGNIFICANT REGRESSION DETECTED - Major issues")
            print("   Status: IMMEDIATE ATTENTION REQUIRED")
        
        print("\n" + "="*80)

async def main():
    """Main testing function"""
    print("🎯 AisleMarts Navigation Regression Testing")
    print("Testing backend impact of tab navigation fix")
    print("="*80)
    
    async with NavigationRegressionTester() as tester:
        # Run all test suites
        await tester.test_core_api_health()
        await tester.test_currency_system()
        await tester.test_auth_system()
        await tester.test_live_marketplace_apis()
        await tester.test_navigation_related_routes()
        await tester.test_concurrent_performance()
        
        # Calculate and display results
        tester.calculate_final_stats()
        tester.print_results()
        
        # Save results to file
        with open('/app/navigation_test_results.json', 'w') as f:
            json.dump(tester.results, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: /app/navigation_test_results.json")
        
        return tester.results["overall_stats"]["success_rate"]

if __name__ == "__main__":
    try:
        success_rate = asyncio.run(main())
        
        # Exit with appropriate code
        if success_rate >= 95:
            sys.exit(0)  # No regression
        elif success_rate >= 90:
            sys.exit(1)  # Minor issues
        else:
            sys.exit(2)  # Significant issues
            
    except KeyboardInterrupt:
        print("\n⚠️ Testing interrupted by user")
        sys.exit(3)
    except Exception as e:
        print(f"\n❌ Testing failed with error: {e}")
        sys.exit(4)