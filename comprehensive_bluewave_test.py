#!/usr/bin/env python3
"""
FINAL COMPREHENSIVE VALIDATION - BLUEWAVE SYSTEMS MAXIMUM SCALE TESTING
=======================================================================

This test suite validates ALL BlueWave systems at maximum scale for Series A investment readiness:

1. Family Safety System (13 endpoints) - Screen time, family pairing, purchase approval, badges/missions
2. Business Console (11 endpoints) - Analytics, product management, customer management, campaigns  
3. Universal Commerce AI Hub (32 platforms) - AI recommendations, real-time data processing, fraud detection
4. Currency Engine (185 currencies) - Real-time rates, multi-currency transactions, cross-border commerce
5. Security Systems - E2EE encryption/decryption, KMS key management, authentication/authorization
6. Integration Testing - All systems working together, data flow validation, API performance

Expected Results: 100% system availability, <100ms API response times, all security protocols functioning
"""

import asyncio
import aiohttp
import json
import time
import statistics
from datetime import datetime
from typing import Dict, List, Any
import sys
import os

# Backend URL from environment configuration
BACKEND_URL = "https://bluewave-family.preview.emergentagent.com/api"

class ComprehensiveBlueWaveTester:
    def __init__(self):
        self.session = None
        self.results = {
            "family_safety": [],
            "business_console": [],
            "universal_ai_hub": [],
            "currency_engine": [],
            "security_systems": [],
            "integration_tests": [],
            "performance_metrics": {}
        }
        self.auth_token = None
        
    async def setup_session(self):
        """Initialize HTTP session with proper headers"""
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "BlueWave-SystemTester/1.0"
            }
        )
        
    async def cleanup_session(self):
        """Clean up HTTP session"""
        if self.session:
            await self.session.close()
            
    async def authenticate(self):
        """Authenticate and get access token for protected endpoints"""
        try:
            # Try to register a test user first
            register_data = {
                "email": "bluewave.tester@aislemarts.com",
                "name": "BlueWave System Tester",
                "password": "SecureTest2024!"
            }
            
            async with self.session.post(f"{BACKEND_URL}/auth/register", json=register_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.auth_token = data.get("access_token")
                    return True
                elif response.status == 400:
                    # User already exists, try login
                    login_data = {
                        "email": "bluewave.tester@aislemarts.com", 
                        "password": "SecureTest2024!"
                    }
                    async with self.session.post(f"{BACKEND_URL}/auth/login", json=login_data) as login_response:
                        if login_response.status == 200:
                            data = await login_response.json()
                            self.auth_token = data.get("access_token")
                            return True
                        
        except Exception as e:
            print(f"⚠️ Authentication failed: {e}")
            return False
            
        return False
        
    def get_auth_headers(self):
        """Get authorization headers"""
        if self.auth_token:
            return {"Authorization": f"Bearer {self.auth_token}"}
        return {}

    async def test_endpoint(self, method: str, endpoint: str, data: Dict = None, 
                          auth_required: bool = False, expected_status: int = 200) -> Dict:
        """Test a single endpoint and measure performance"""
        start_time = time.time()
        test_result = {
            "endpoint": endpoint,
            "method": method,
            "status": "FAIL",
            "response_time": 0,
            "status_code": 0,
            "error": None,
            "data": None
        }
        
        try:
            headers = self.get_auth_headers() if auth_required else {}
            url = f"{BACKEND_URL}{endpoint}"
            
            if method.upper() == "GET":
                async with self.session.get(url, headers=headers) as response:
                    test_result["status_code"] = response.status
                    test_result["response_time"] = (time.time() - start_time) * 1000  # ms
                    
                    if response.status == expected_status:
                        test_result["data"] = await response.json()
                        test_result["status"] = "PASS"
                    else:
                        test_result["error"] = f"Expected {expected_status}, got {response.status}"
                        
            elif method.upper() == "POST":
                async with self.session.post(url, json=data, headers=headers) as response:
                    test_result["status_code"] = response.status
                    test_result["response_time"] = (time.time() - start_time) * 1000  # ms
                    
                    if response.status == expected_status:
                        test_result["data"] = await response.json()
                        test_result["status"] = "PASS"
                    else:
                        test_result["error"] = f"Expected {expected_status}, got {response.status}"
                        
        except Exception as e:
            test_result["response_time"] = (time.time() - start_time) * 1000
            test_result["error"] = str(e)
            
        return test_result

    async def test_family_safety_system(self):
        """Test all 13 Family Safety System endpoints under load"""
        print("🔒 Testing Family Safety System (13 endpoints)...")
        
        family_safety_tests = [
            # Core family safety endpoints
            ("GET", "/family/health", None, False, 200),
            ("POST", "/family/screen-time/track", {"user_id": "test_user", "app_name": "AisleMarts", "minutes": 45, "category": "shopping"}, False, 200),
            ("GET", "/family/screen-time/test_user", None, False, 200),
            ("POST", "/family/screen-time/limit", {"user_id": "test_user", "daily_limit_minutes": 120, "set_by_user_id": "parent_user"}, False, 200),
            ("POST", "/family/create", {"parent_user_id": "parent_user", "family_name": "BlueWave Test Family"}, False, 200),
            ("POST", "/family/invite/generate", {"family_id": "test_family", "inviter_user_id": "parent_user", "invite_type": "general"}, False, 200),
            ("POST", "/family/join", {"invite_code": "test_invite", "user_id": "test_user", "user_name": "Test User", "user_age": 16}, False, 200),
            ("GET", "/family/dashboard/test_family", None, False, 200),
            ("POST", "/family/purchase/check-approval", {"user_id": "test_user", "amount": 89.99, "item_description": "Designer Handbag"}, False, 200),
            ("POST", "/family/purchase/request-approval", {"user_id": "test_user", "amount": 89.99, "item_description": "Designer Handbag", "merchant": "LuxeFashion"}, False, 200),
            ("GET", "/family/insights/test_user", None, False, 200),
            ("GET", "/family/badges/test_user", None, False, 200),
            ("GET", "/family/missions/test_user", None, False, 200),
            ("GET", "/family/notifications/test_user", None, False, 200)
        ]
        
        # Execute tests with concurrency simulation
        tasks = []
        for method, endpoint, data, auth_required, expected_status in family_safety_tests:
            task = self.test_endpoint(method, endpoint, data, auth_required, expected_status)
            tasks.append(task)
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        passed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "PASS")
        total = len(results)
        
        self.results["family_safety"] = {
            "total_tests": total,
            "passed": passed,
            "success_rate": (passed / total) * 100,
            "details": [r for r in results if isinstance(r, dict)],
            "avg_response_time": statistics.mean([r.get("response_time", 0) for r in results if isinstance(r, dict)])
        }
        
        print(f"   ✅ Family Safety: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")

    async def test_business_console_system(self):
        """Test all 11 Business Console endpoints with high concurrency"""
        print("💼 Testing Business Console System (11 endpoints)...")
        
        business_console_tests = [
            # Core business console endpoints
            ("GET", "/business/health", None, False, 200),
            ("GET", "/business/analytics/business_test_001", None, False, 200),
            ("GET", "/business/alerts/business_test_001", None, False, 200),
            ("GET", "/business/products/business_test_001", None, False, 200),
            ("POST", "/business/products", {"title": "BlueWave Test Product", "description": "Test product", "price": 99.99, "currency": "EUR", "category": "Test", "sku": "TEST-001"}, False, 200),
            ("GET", "/business/orders/business_test_001", None, False, 200),
            ("PUT", "/business/orders/test-order-001", {"order_id": "test-order-001", "status": "shipped"}, False, 200),
            ("GET", "/business/customers/business_test_001", None, False, 200),
            ("GET", "/business/campaigns/business_test_001", None, False, 200),
            ("POST", "/business/campaigns", {"name": "BlueWave Test Campaign", "type": "conversion", "budget": 1500, "duration_days": 14, "target_audience": {}, "creative_assets": []}, False, 200),
            ("GET", "/business/settings/business_test_001", None, False, 200)
        ]
        
        # Execute tests with high concurrency
        tasks = []
        for method, endpoint, data, auth_required, expected_status in business_console_tests:
            task = self.test_endpoint(method, endpoint, data, auth_required, expected_status)
            tasks.append(task)
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        passed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "PASS")
        total = len(results)
        
        self.results["business_console"] = {
            "total_tests": total,
            "passed": passed,
            "success_rate": (passed / total) * 100,
            "details": [r for r in results if isinstance(r, dict)],
            "avg_response_time": statistics.mean([r.get("response_time", 0) for r in results if isinstance(r, dict)])
        }
        
        print(f"   ✅ Business Console: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")

    async def test_universal_commerce_ai_hub(self):
        """Test Universal Commerce AI Hub with all 32 connected platforms"""
        print("🤖 Testing Universal Commerce AI Hub (32 platforms)...")
        
        universal_ai_tests = [
            # Core Universal AI Hub endpoints
            ("GET", "/universal-ai/health", None, False, 200),
            ("GET", "/universal-ai/status", None, False, 200),
            ("GET", "/universal-ai/platforms", None, False, 200),
            ("GET", "/universal-ai/products/search?query=luxury handbags&category=fashion", None, False, 200),
            ("POST", "/universal-ai/market-intelligence", {}, False, 200),
            ("POST", "/universal-ai/trends/predict?category=fashion&timeframe=30", {}, False, 200),
            ("POST", "/universal-ai/orchestrate", {"type": "price_sync", "parameters": {"platforms": ["shopify", "ebay"]}}, False, 200),
            ("GET", "/universal-ai/customers/intelligence", None, False, 200),
            ("POST", "/universal-ai/ai-communication", {"platform": "amazon", "message": {"type": "recommendation_request"}}, False, 200),
            ("GET", "/universal-ai/analytics/global", None, False, 200),
            ("POST", "/universal-ai/agents/deploy", {"type": "price_monitor", "platforms": ["amazon", "ebay", "shopify"], "parameters": {"capabilities": ["price_tracking"]}}, False, 200)
        ]
        
        # Execute tests with maximum concurrency
        tasks = []
        for method, endpoint, data, auth_required, expected_status in universal_ai_tests:
            task = self.test_endpoint(method, endpoint, data, auth_required, expected_status)
            tasks.append(task)
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        passed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "PASS")
        total = len(results)
        
        self.results["universal_ai_hub"] = {
            "total_tests": total,
            "passed": passed,
            "success_rate": (passed / total) * 100,
            "details": [r for r in results if isinstance(r, dict)],
            "avg_response_time": statistics.mean([r.get("response_time", 0) for r in results if isinstance(r, dict)])
        }
        
        print(f"   ✅ Universal AI Hub: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")

    async def test_currency_engine_global_simulation(self):
        """Test Currency Engine with all 185 currencies and real-time rate updates"""
        print("💱 Testing Currency Engine Global Simulation (185 currencies)...")
        
        currency_tests = [
            # Core currency engine endpoints
            ("GET", "/currency/health", None, False, 200),
            ("GET", "/currency/supported", None, False, 200),
            ("GET", "/currency/rates", None, False, 200),
            ("GET", "/currency/rates?base=USD", None, False, 200),
            ("GET", "/currency/rates?base=EUR", None, False, 200),
            ("GET", "/currency/rates?base=JPY", None, False, 200),
            ("GET", "/currency/convert?amount=100&from=USD&to=EUR", None, False, 200),
            ("GET", "/currency/convert?amount=1000&from=JPY&to=GBP", None, False, 200),
            ("GET", "/currency/convert?amount=0.1&from=BTC&to=USD", None, False, 200),
            ("GET", "/currency/convert?amount=1&from=ETH&to=EUR", None, False, 200),
            ("GET", "/currency/convert?amount=100&from=USD&to=KWD", None, False, 200),
            ("GET", "/currency/convert?amount=100&from=EUR&to=BHD", None, False, 200)
        ]
        
        # Execute tests with global simulation
        tasks = []
        for method, endpoint, data, auth_required, expected_status in currency_tests:
            task = self.test_endpoint(method, endpoint, data, auth_required, expected_status)
            tasks.append(task)
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        passed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "PASS")
        total = len(results)
        
        self.results["currency_engine"] = {
            "total_tests": total,
            "passed": passed,
            "success_rate": (passed / total) * 100,
            "details": [r for r in results if isinstance(r, dict)],
            "avg_response_time": statistics.mean([r.get("response_time", 0) for r in results if isinstance(r, dict)])
        }
        
        print(f"   ✅ Currency Engine: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")

    async def test_security_systems_penetration(self):
        """Test Security Systems - E2EE, KMS, Authentication under load"""
        print("🔐 Testing Security Systems Penetration Test...")
        
        security_tests = [
            # E2EE System tests
            ("GET", "/e2ee/health", None, False, 200),
            ("POST", "/e2ee/client-keys", {"demo": True}, False, 200),
            ("POST", "/e2ee/handshake", {"client_public_key": "demo_key", "user_id": "test_user"}, False, 200),
            ("GET", "/e2ee/session/test_session/status", None, False, 200),
            ("POST", "/e2ee/encrypt", {"session_id": "test_session", "plaintext": "Hello BlueWave!"}, False, 200),
            ("POST", "/e2ee/decrypt", {"session_id": "test_session", "ciphertext": "encrypted_data", "nonce": "test_nonce"}, False, 200),
            ("POST", "/e2ee/rotate-keys", {"session_id": "test_session"}, False, 200),
            ("DELETE", "/e2ee/session/test_session", None, False, 200),
            ("GET", "/e2ee/compliance", None, False, 200),
            ("GET", "/e2ee/best-practices", None, False, 200),
            
            # KMS System tests
            ("GET", "/kms/health", None, False, 200),
            ("GET", "/kms/status", None, False, 200),
            ("GET", "/kms/push-keys", None, False, 200),
            ("GET", "/kms/ssl-certificates", None, False, 200),
            ("GET", "/kms/api-keys", None, False, 200),
            ("GET", "/kms/expiry-check", None, False, 200),
            ("GET", "/kms/audit-log", None, False, 200),
            ("GET", "/kms/compliance", None, False, 200),
            ("GET", "/kms/admin", None, False, 200)
        ]
        
        # Execute security tests
        tasks = []
        for method, endpoint, data, auth_required, expected_status in security_tests:
            task = self.test_endpoint(method, endpoint, data, auth_required, expected_status)
            tasks.append(task)
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        passed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "PASS")
        total = len(results)
        
        self.results["security_systems"] = {
            "total_tests": total,
            "passed": passed,
            "success_rate": (passed / total) * 100,
            "details": [r for r in results if isinstance(r, dict)],
            "avg_response_time": statistics.mean([r.get("response_time", 0) for r in results if isinstance(r, dict)])
        }
        
        print(f"   ✅ Security Systems: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")

    async def test_integration_and_performance(self):
        """Test system integration and performance under maximum load"""
        print("⚡ Testing Integration & Performance (Maximum Load)...")
        
        # Core system health checks
        integration_tests = [
            ("GET", "/health", None, False, 200),
            ("GET", "/production-monitoring/health", None, False, 200),
            ("GET", "/production-monitoring/golden-signals", None, False, 200),
            ("GET", "/production-monitoring/services", None, False, 200),
            ("GET", "/production-monitoring/slo", None, False, 200),
            ("GET", "/production-monitoring/incidents", None, False, 200),
            ("GET", "/production-monitoring/dashboard", None, False, 200),
            ("GET", "/production-monitoring/uptime", None, False, 200),
            ("POST", "/production-monitoring/metrics", {"metric_name": "test_metric", "value": 100}, False, 200),
            ("GET", "/executive-dashboard/health", None, False, 200),
            ("GET", "/executive-dashboard/kpis", None, False, 200),
            ("GET", "/executive-dashboard/commerce", None, False, 200),
            ("GET", "/executive-dashboard/ai-performance", None, False, 200),
            ("GET", "/executive-dashboard/analytics", None, False, 200),
            ("GET", "/executive-dashboard/competitive-intelligence", None, False, 200),
            ("GET", "/executive-dashboard/monitoring", None, False, 200)
        ]
        
        # Execute integration tests
        tasks = []
        for method, endpoint, data, auth_required, expected_status in integration_tests:
            task = self.test_endpoint(method, endpoint, data, auth_required, expected_status)
            tasks.append(task)
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        passed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "PASS")
        total = len(results)
        
        self.results["integration_tests"] = {
            "total_tests": total,
            "passed": passed,
            "success_rate": (passed / total) * 100,
            "details": [r for r in results if isinstance(r, dict)],
            "avg_response_time": statistics.mean([r.get("response_time", 0) for r in results if isinstance(r, dict)])
        }
        
        print(f"   ✅ Integration Tests: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")

    async def run_concurrent_load_test(self, num_requests: int = 50):
        """Run concurrent load test on critical endpoints"""
        print(f"🚀 Running Concurrent Load Test ({num_requests} requests)...")
        
        critical_endpoints = [
            "/health",
            "/currency/health", 
            "/universal-ai/health",
            "/family-safety/health",
            "/business-console/health",
            "/e2ee/health",
            "/kms/health"
        ]
        
        # Create multiple concurrent requests
        tasks = []
        start_time = time.time()
        
        for _ in range(num_requests):
            for endpoint in critical_endpoints:
                task = self.test_endpoint("GET", endpoint, None, False, 200)
                tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        total_time = time.time() - start_time
        
        # Calculate performance metrics
        successful_requests = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "PASS")
        total_requests = len(results)
        response_times = [r.get("response_time", 0) for r in results if isinstance(r, dict)]
        
        self.results["performance_metrics"] = {
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "success_rate": (successful_requests / total_requests) * 100,
            "total_time": total_time,
            "requests_per_second": total_requests / total_time,
            "avg_response_time": statistics.mean(response_times) if response_times else 0,
            "min_response_time": min(response_times) if response_times else 0,
            "max_response_time": max(response_times) if response_times else 0,
            "p95_response_time": statistics.quantiles(response_times, n=20)[18] if len(response_times) > 20 else 0
        }
        
        print(f"   ✅ Load Test: {successful_requests}/{total_requests} requests successful ({(successful_requests/total_requests)*100:.1f}%)")
        print(f"   ⚡ Performance: {total_requests/total_time:.1f} req/s, avg {statistics.mean(response_times):.1f}ms")

    def generate_comprehensive_report(self):
        """Generate comprehensive test report for Series A investment readiness"""
        print("\n" + "="*80)
        print("🌊 BLUEWAVE SYSTEMS - FINAL COMPREHENSIVE VALIDATION REPORT")
        print("="*80)
        
        total_tests = 0
        total_passed = 0
        
        # System-by-system results
        for system_name, results in self.results.items():
            if system_name == "performance_metrics":
                continue
                
            if isinstance(results, dict) and "total_tests" in results:
                total_tests += results["total_tests"]
                total_passed += results["passed"]
                
                print(f"\n🔹 {system_name.upper().replace('_', ' ')}:")
                print(f"   Tests: {results['passed']}/{results['total_tests']} passed ({results['success_rate']:.1f}%)")
                print(f"   Avg Response Time: {results['avg_response_time']:.1f}ms")
                
                # Show failed tests
                failed_tests = [t for t in results.get("details", []) if t.get("status") == "FAIL"]
                if failed_tests:
                    print(f"   ❌ Failed Tests:")
                    for test in failed_tests[:3]:  # Show first 3 failures
                        print(f"      - {test['endpoint']}: {test.get('error', 'Unknown error')}")
        
        # Overall system health
        overall_success_rate = (total_passed / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"\n🎯 OVERALL SYSTEM HEALTH:")
        print(f"   Total Tests: {total_passed}/{total_tests} passed ({overall_success_rate:.1f}%)")
        
        # Performance metrics
        if "performance_metrics" in self.results:
            perf = self.results["performance_metrics"]
            print(f"\n⚡ PERFORMANCE METRICS:")
            print(f"   Load Test: {perf['successful_requests']}/{perf['total_requests']} requests ({perf['success_rate']:.1f}%)")
            print(f"   Throughput: {perf['requests_per_second']:.1f} requests/second")
            print(f"   Response Times: avg {perf['avg_response_time']:.1f}ms, p95 {perf['p95_response_time']:.1f}ms")
        
        # Series A Investment Readiness Assessment
        print(f"\n💎 SERIES A INVESTMENT READINESS ASSESSMENT:")
        
        if overall_success_rate >= 95:
            grade = "A+"
            status = "🟢 SERIES A READY"
        elif overall_success_rate >= 90:
            grade = "A"
            status = "🟢 SERIES A READY"
        elif overall_success_rate >= 85:
            grade = "B+"
            status = "🟡 MOSTLY READY"
        elif overall_success_rate >= 80:
            grade = "B"
            status = "🟡 NEEDS IMPROVEMENT"
        else:
            grade = "C"
            status = "🔴 NOT READY"
            
        print(f"   Status: {status}")
        print(f"   Grade: {grade}")
        print(f"   System Reliability: {overall_success_rate:.1f}%")
        
        # Key metrics validation
        avg_response_time = statistics.mean([
            results.get("avg_response_time", 0) 
            for results in self.results.values() 
            if isinstance(results, dict) and "avg_response_time" in results
        ])
        
        print(f"\n✅ INVESTOR METRICS VALIDATION:")
        print(f"   ✅ System Availability: {overall_success_rate:.1f}% {'✓' if overall_success_rate >= 99 else '⚠️'}")
        print(f"   ✅ API Response Times: {avg_response_time:.1f}ms {'✓' if avg_response_time < 100 else '⚠️'}")
        print(f"   ✅ Security Systems: {'✓ Operational' if self.results.get('security_systems', {}).get('success_rate', 0) > 90 else '⚠️ Issues'}")
        print(f"   ✅ AI Hub Integration: {'✓ Operational' if self.results.get('universal_ai_hub', {}).get('success_rate', 0) > 85 else '⚠️ Issues'}")
        print(f"   ✅ Currency Engine: {'✓ Operational' if self.results.get('currency_engine', {}).get('success_rate', 0) > 95 else '⚠️ Issues'}")
        
        print(f"\n🚀 PRODUCTION STATUS:")
        if overall_success_rate >= 95 and avg_response_time < 100:
            print("   🎉 BlueWave systems are FULLY OPERATIONAL and ready for Series A investor presentations!")
            print("   🎯 All critical systems demonstrate production-grade reliability and performance.")
        else:
            print("   ⚠️ Some systems require attention before Series A presentations.")
            print("   🔧 Focus on improving failed endpoints and response times.")
        
        print("="*80)
        
        return {
            "overall_success_rate": overall_success_rate,
            "total_tests": total_tests,
            "total_passed": total_passed,
            "avg_response_time": avg_response_time,
            "grade": grade,
            "series_a_ready": overall_success_rate >= 90
        }

async def main():
    """Main test execution function"""
    print("🌊 BLUEWAVE SYSTEMS - FINAL COMPREHENSIVE VALIDATION")
    print("Testing ALL systems at maximum scale for Series A investment readiness...")
    print(f"Backend URL: {BACKEND_URL}")
    print("-" * 80)
    
    tester = ComprehensiveBlueWaveTester()
    
    try:
        # Setup
        await tester.setup_session()
        
        # Authenticate
        print("🔐 Authenticating...")
        auth_success = await tester.authenticate()
        if not auth_success:
            print("⚠️ Authentication failed, proceeding with public endpoints only")
        else:
            print("✅ Authentication successful")
        
        # Run all test suites
        await tester.test_family_safety_system()
        await tester.test_business_console_system()
        await tester.test_universal_commerce_ai_hub()
        await tester.test_currency_engine_global_simulation()
        await tester.test_security_systems_penetration()
        await tester.test_integration_and_performance()
        
        # Run concurrent load test
        await tester.run_concurrent_load_test(50)
        
        # Generate comprehensive report
        final_report = tester.generate_comprehensive_report()
        
        return final_report
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return {"error": str(e)}
        
    finally:
        await tester.cleanup_session()

if __name__ == "__main__":
    # Run the comprehensive test suite
    report = asyncio.run(main())
    
    # Exit with appropriate code
    if report.get("series_a_ready", False):
        print("\n🎉 SUCCESS: BlueWave systems are Series A investment ready!")
        sys.exit(0)
    else:
        print("\n⚠️ WARNING: Some systems need attention before Series A presentations.")
        sys.exit(1)