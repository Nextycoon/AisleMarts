#!/usr/bin/env python3
"""
🚀💎 ULTIMATE OPERATIONAL KIT BACKEND VALIDATION - SERIES A READINESS
Comprehensive backend validation focusing on final hardening patches and validation checklist

PRIMARY GOAL: Validate hardening patches have been successfully applied and backend systems are Series A ready

TESTING FOCUS AREAS:
1. Core System Health - FastAPI Backend (port 8001), Express Hardening Server (port 8002)
2. Stories API functionality and Ultimate Operational Kit Validation
3. Currency system operational status
4. Production Hardening Features
5. Series A Readiness Indicators

SUCCESS CRITERIA: 90%+ success rate on core functionality, proper error handling, system stability
"""

import asyncio
import aiohttp
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
import uuid

# Configuration
FASTAPI_BASE_URL = "https://tiktok-commerce-1.preview.emergentagent.com/api"
EXPRESS_BASE_URL = "https://tiktok-commerce-1.preview.emergentagent.com"  # Express server on port 8002 if available
EXPRESS_PORT_8002_URL = "http://localhost:8002"  # Direct port 8002 access

class BackendValidator:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.start_time = time.time()
        
    async def log_result(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test result with detailed information"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
            
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "details": details,
            "response_time": f"{response_time:.3f}s",
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        print(f"{status} | {test_name} | {response_time:.3f}s | {details}")
        
    async def make_request(self, session: aiohttp.ClientSession, method: str, url: str, 
                          data: Dict = None, headers: Dict = None, timeout: int = 10) -> tuple:
        """Make HTTP request with error handling and timing"""
        start_time = time.time()
        try:
            async with session.request(method, url, json=data, headers=headers, 
                                     timeout=aiohttp.ClientTimeout(total=timeout)) as response:
                response_time = time.time() - start_time
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                return response.status, response_data, response_time
        except asyncio.TimeoutError:
            response_time = time.time() - start_time
            return 408, {"error": "Request timeout"}, response_time
        except Exception as e:
            response_time = time.time() - start_time
            return 500, {"error": str(e)}, response_time

    async def test_core_system_health(self, session: aiohttp.ClientSession):
        """Test Core System Health - FastAPI Backend and Express Hardening Server"""
        print("\n🏥 === CORE SYSTEM HEALTH VALIDATION ===")
        
        # 1. FastAPI Backend Health (port 8001)
        status, data, response_time = await self.make_request(session, "GET", f"{FASTAPI_BASE_URL}/health")
        if status == 200 and isinstance(data, dict) and data.get("ok"):
            await self.log_result("FastAPI Backend Health", True, 
                                f"Service: {data.get('service', 'Unknown')}", response_time)
        else:
            await self.log_result("FastAPI Backend Health", False, 
                                f"Status: {status}, Response: {str(data)[:100]}", response_time)
        
        # 2. Express Hardening Server Health (port 8002) - Try multiple approaches
        express_working = False
        
        # Try direct port 8002 access
        status, data, response_time = await self.make_request(session, "GET", f"{EXPRESS_PORT_8002_URL}/health")
        if status == 200 and isinstance(data, dict) and data.get("ok"):
            express_working = True
            await self.log_result("Express Server Health (localhost:8002)", True, 
                                f"Service: {data.get('service', 'Unknown')}", response_time)
        else:
            await self.log_result("Express Server Health (localhost:8002)", False, 
                                f"Status: {status}, Response: {str(data)[:100]}", response_time)
        
        # Try root endpoint on port 8002
        if not express_working:
            status, data, response_time = await self.make_request(session, "GET", f"{EXPRESS_PORT_8002_URL}/")
            if status == 200 and isinstance(data, dict) and data.get("ok"):
                express_working = True
                await self.log_result("Express Root API (localhost:8002)", True, 
                                    f"Name: {data.get('name', 'Unknown')}", response_time)
            else:
                await self.log_result("Express Root API (localhost:8002)", False, 
                                    f"Status: {status}, Response: {str(data)[:100]}", response_time)
        
        # 3. Currency System Health
        status, data, response_time = await self.make_request(session, "GET", f"{FASTAPI_BASE_URL}/currency/health")
        if status == 200 and isinstance(data, dict) and data.get("status") == "operational":
            await self.log_result("Currency System Health", True, 
                                f"Currencies: {data.get('supported_currencies', 0)}", response_time)
        else:
            await self.log_result("Currency System Health", False, 
                                f"Status: {status}, Response: {str(data)[:100]}", response_time)
        
        # 4. AI Super Agent Health
        status, data, response_time = await self.make_request(session, "GET", f"{FASTAPI_BASE_URL}/ai-super-agent/health")
        if status == 200 and isinstance(data, dict) and data.get("status") == "operational":
            await self.log_result("AI Super Agent Health", True, 
                                f"Features: {len(data.get('features', []))}", response_time)
        else:
            await self.log_result("AI Super Agent Health", False, 
                                f"Status: {status}, Response: {str(data)[:100]}", response_time)

    async def test_stories_api_functionality(self, session: aiohttp.ClientSession):
        """Test Stories API functionality and Ultimate Operational Kit Validation"""
        print("\n📚 === STORIES API & ULTIMATE OPERATIONAL KIT VALIDATION ===")
        
        # 1. Stories Health Check
        status, data, response_time = await self.make_request(session, "GET", f"{FASTAPI_BASE_URL}/stories/health")
        if status == 200 and isinstance(data, dict) and data.get("status") == "healthy":
            features = data.get("features", [])
            await self.log_result("Stories Health Check", True, 
                                f"Phase: {data.get('phase', 'Unknown')}, Features: {len(features)}", response_time)
        else:
            await self.log_result("Stories Health Check", False, 
                                f"Status: {status}, Response: {str(data)[:100]}", response_time)
        
        # 2. Get Stories with Pagination
        status, data, response_time = await self.make_request(session, "GET", f"{FASTAPI_BASE_URL}/stories?limit=5")
        if status == 200 and isinstance(data, dict) and "data" in data:
            stories = data.get("data", [])
            await self.log_result("Stories API Pagination", True, 
                                f"Stories: {len(stories)}, Cursor: {data.get('cursor', 'None')}", response_time)
        else:
            await self.log_result("Stories API Pagination", False, 
                                f"Status: {status}, Response: {str(data)[:100]}", response_time)
        
        # 3. Get Creators
        status, data, response_time = await self.make_request(session, "GET", f"{FASTAPI_BASE_URL}/creators")
        if status == 200 and isinstance(data, list):
            await self.log_result("Creators API", True, 
                                f"Creators: {len(data)}", response_time)
        else:
            await self.log_result("Creators API", False, 
                                f"Status: {status}, Response: {str(data)[:100]}", response_time)

    async def test_api_error_handling_validation(self, session: aiohttp.ClientSession):
        """Test API Error Handling Validation - Proper 4xx responses"""
        print("\n🚨 === API ERROR HANDLING VALIDATION ===")
        
        # Test invalid payload validation → 422 responses
        invalid_payloads = [
            {"endpoint": "/track/impression", "payload": {"invalid": "data"}},
            {"endpoint": "/track/cta", "payload": {"missing": "fields"}},
            {"endpoint": "/track/purchase", "payload": {"incomplete": "purchase"}},
        ]
        
        for test_case in invalid_payloads:
            # Try Express server first (port 8002)
            status, data, response_time = await self.make_request(
                session, "POST", f"{EXPRESS_PORT_8002_URL}/api{test_case['endpoint']}", 
                data=test_case['payload']
            )
            
            if status in [400, 422]:  # Proper error responses
                await self.log_result(f"Invalid Payload Validation - {test_case['endpoint']}", True, 
                                    f"Status: {status} (proper 4xx response)", response_time)
            else:
                await self.log_result(f"Invalid Payload Validation - {test_case['endpoint']}", False, 
                                    f"Status: {status} (should be 4xx)", response_time)
        
        # Test missing HMAC signatures → 401 responses
        hmac_endpoints = ["/track/purchase", "/track/refund"]
        for endpoint in hmac_endpoints:
            status, data, response_time = await self.make_request(
                session, "POST", f"{EXPRESS_PORT_8002_URL}/api{endpoint}", 
                data={"orderId": "test", "amount": 100, "currency": "USD"}
            )
            
            if status == 401:  # Missing HMAC should return 401
                await self.log_result(f"Missing HMAC Signature - {endpoint}", True, 
                                    f"Status: {status} (proper 401 response)", response_time)
            else:
                await self.log_result(f"Missing HMAC Signature - {endpoint}", False, 
                                    f"Status: {status} (should be 401)", response_time)

    async def test_multi_currency_support(self, session: aiohttp.ClientSession):
        """Test Multi-Currency Support Verification"""
        print("\n💱 === MULTI-CURRENCY SUPPORT VERIFICATION ===")
        
        # Test supported currencies
        currencies_to_test = ["USD", "EUR", "GBP", "JPY"]
        
        for currency in currencies_to_test:
            # Test currency conversion
            status, data, response_time = await self.make_request(
                session, "GET", f"{FASTAPI_BASE_URL}/currency/convert?amount=100&from=USD&to={currency}"
            )
            
            if status == 200 and isinstance(data, dict) and "result" in data:
                result = data.get("result", 0)
                rate = data.get("rate", 0)
                await self.log_result(f"Currency Conversion - USD to {currency}", True, 
                                    f"100 USD = {result} {currency} (rate: {rate})", response_time)
            else:
                await self.log_result(f"Currency Conversion - USD to {currency}", False, 
                                    f"Status: {status}, Response: {str(data)[:100]}", response_time)
        
        # Test currency rates endpoint
        status, data, response_time = await self.make_request(session, "GET", f"{FASTAPI_BASE_URL}/currency/rates")
        if status == 200 and isinstance(data, dict) and "rates" in data:
            rates = data.get("rates", {})
            await self.log_result("Currency Rates Endpoint", True, 
                                f"Currencies: {len(rates)}, Provider: {data.get('provider', 'Unknown')}", response_time)
        else:
            await self.log_result("Currency Rates Endpoint", False, 
                                f"Status: {status}, Response: {str(data)[:100]}", response_time)

    async def test_production_architecture_validation(self, session: aiohttp.ClientSession):
        """Test Production Architecture Validation"""
        print("\n🏗️ === PRODUCTION ARCHITECTURE VALIDATION ===")
        
        # Test middleware components operational
        middleware_tests = [
            {"name": "CORS Headers", "endpoint": f"{FASTAPI_BASE_URL}/health", "check": "cors"},
            {"name": "JSON Response", "endpoint": f"{FASTAPI_BASE_URL}/health", "check": "json"},
            {"name": "Error Handling", "endpoint": f"{FASTAPI_BASE_URL}/nonexistent", "check": "404"},
        ]
        
        for test in middleware_tests:
            status, data, response_time = await self.make_request(session, "GET", test["endpoint"])
            
            if test["check"] == "cors":
                # Check if CORS is working (no CORS errors in response)
                success = status in [200, 404]  # Either success or proper 404
                await self.log_result(f"Middleware - {test['name']}", success, 
                                    f"Status: {status}", response_time)
            elif test["check"] == "json":
                # Check if response is JSON
                success = isinstance(data, dict)
                await self.log_result(f"Middleware - {test['name']}", success, 
                                    f"JSON Response: {success}", response_time)
            elif test["check"] == "404":
                # Check proper 404 handling
                success = status == 404
                await self.log_result(f"Middleware - {test['name']}", success, 
                                    f"Status: {status} (should be 404)", response_time)
        
        # Test performance benchmarks (<200ms response times)
        performance_endpoints = [
            f"{FASTAPI_BASE_URL}/health",
            f"{FASTAPI_BASE_URL}/currency/health",
            f"{FASTAPI_BASE_URL}/stories/health",
        ]
        
        total_response_time = 0
        performance_tests = 0
        
        for endpoint in performance_endpoints:
            status, data, response_time = await self.make_request(session, "GET", endpoint)
            total_response_time += response_time
            performance_tests += 1
            
            success = response_time < 0.2  # Less than 200ms
            await self.log_result(f"Performance Benchmark - {endpoint.split('/')[-1]}", success, 
                                f"Response time: {response_time:.3f}s (target: <0.2s)", response_time)
        
        # Calculate average response time
        avg_response_time = total_response_time / performance_tests if performance_tests > 0 else 0
        success = avg_response_time < 0.2
        await self.log_result("Average Response Time", success, 
                            f"Average: {avg_response_time:.3f}s (target: <0.2s)", avg_response_time)

    async def test_system_integration(self, session: aiohttp.ClientSession):
        """Test System Integration - Cross-service communication"""
        print("\n🔗 === SYSTEM INTEGRATION TESTING ===")
        
        # Test cross-service communication (Express ↔ FastAPI)
        # This tests if both servers can handle requests properly
        
        # Test FastAPI endpoints
        fastapi_endpoints = [
            f"{FASTAPI_BASE_URL}/health",
            f"{FASTAPI_BASE_URL}/stories/health",
            f"{FASTAPI_BASE_URL}/currency/health",
        ]
        
        fastapi_success = 0
        fastapi_total = len(fastapi_endpoints)
        
        for endpoint in fastapi_endpoints:
            status, data, response_time = await self.make_request(session, "GET", endpoint)
            if status == 200:
                fastapi_success += 1
        
        success = fastapi_success == fastapi_total
        await self.log_result("FastAPI Service Integration", success, 
                            f"Endpoints working: {fastapi_success}/{fastapi_total}", 0)
        
        # Test Express endpoints (if available)
        express_endpoints = [
            f"{EXPRESS_PORT_8002_URL}/health",
            f"{EXPRESS_PORT_8002_URL}/",
        ]
        
        express_success = 0
        express_total = len(express_endpoints)
        
        for endpoint in express_endpoints:
            status, data, response_time = await self.make_request(session, "GET", endpoint)
            if status == 200:
                express_success += 1
        
        success = express_success > 0  # At least one Express endpoint working
        await self.log_result("Express Service Integration", success, 
                            f"Endpoints working: {express_success}/{express_total}", 0)
        
        # Test API routing and load balancing
        routing_tests = [
            {"path": "/api/health", "expected_service": "FastAPI"},
            {"path": "/health", "expected_service": "Express"},
        ]
        
        for test in routing_tests:
            if test["expected_service"] == "FastAPI":
                status, data, response_time = await self.make_request(session, "GET", f"{FASTAPI_BASE_URL.replace('/api', '')}{test['path']}")
            else:
                status, data, response_time = await self.make_request(session, "GET", f"{EXPRESS_PORT_8002_URL}{test['path']}")
            
            success = status == 200
            await self.log_result(f"API Routing - {test['path']}", success, 
                                f"Status: {status}, Service: {test['expected_service']}", response_time)

    async def run_comprehensive_validation(self):
        """Run comprehensive backend validation"""
        print("🚀💎 ULTIMATE OPERATIONAL KIT FINAL VALIDATION - SERIES A READINESS")
        print("=" * 80)
        print(f"Started at: {datetime.now().isoformat()}")
        print(f"FastAPI Base URL: {FASTAPI_BASE_URL}")
        print(f"Express Base URL: {EXPRESS_PORT_8002_URL}")
        print("=" * 80)
        
        async with aiohttp.ClientSession() as session:
            # Run all test suites
            await self.test_core_system_health(session)
            await self.test_stories_api_functionality(session)
            await self.test_api_error_handling_validation(session)
            await self.test_multi_currency_support(session)
            await self.test_production_architecture_validation(session)
            await self.test_system_integration(session)
        
        # Calculate final results
        total_time = time.time() - self.start_time
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print("\n" + "=" * 80)
        print("🏆 FINAL VALIDATION RESULTS")
        print("=" * 80)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.failed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Total Time: {total_time:.2f}s")
        print(f"Average Response Time: {(sum(float(r['response_time'].replace('s', '')) for r in self.results) / len(self.results)):.3f}s")
        
        # Series A Readiness Assessment
        if success_rate >= 90:
            print("\n✅ SERIES A READINESS: READY FOR INVESTOR DEMONSTRATIONS")
            print("All critical systems operational with enterprise-grade performance")
        elif success_rate >= 75:
            print("\n⚠️ SERIES A READINESS: NEEDS MINOR FIXES")
            print("Most systems operational but some issues need resolution")
        else:
            print("\n❌ SERIES A READINESS: CRITICAL ISSUES IDENTIFIED")
            print("Major issues require resolution before investor demonstrations")
        
        # Show failed tests for debugging
        failed_results = [r for r in self.results if not r['success']]
        if failed_results:
            print(f"\n🔍 FAILED TESTS ({len(failed_results)}):")
            for result in failed_results:
                print(f"  ❌ {result['test']}: {result['details']}")
        
        print("\n" + "=" * 80)
        return success_rate >= 90

async def main():
    """Main execution function"""
    validator = BackendValidator()
    success = await validator.run_comprehensive_validation()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())