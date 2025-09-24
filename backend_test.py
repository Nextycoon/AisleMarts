#!/usr/bin/env python3
"""
P0 HARDENING VALIDATION - COMPREHENSIVE BACKEND TESTING
========================================================

This test suite validates P0 hardening implementation to achieve 100% Series A readiness.

Focus Areas:
1. HMAC/Auth Error Code Standardization Validation
2. Multi-Currency Precision Testing  
3. Express Server Integration Validation
4. Performance & Concurrent Load Testing

Target: 100% success rate (up from 92.9%)
"""

import asyncio
import aiohttp
import json
import time
import hashlib
import hmac
import concurrent.futures
from datetime import datetime
from typing import Dict, List, Any, Optional
import os
import sys

# Configuration
BACKEND_URL = "https://infinity-stories.preview.emergentagent.com"
EXPRESS_PORT = 8002
FASTAPI_PORT = 8001
HMAC_SECRET = "dev-secret-key-change-in-production"

class P0HardeningValidator:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.start_time = time.time()
        
    def log_result(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_time": response_time,
            "status": status
        })
        
        self.total_tests += 1
        if success:
            self.passed_tests += 1
        else:
            self.failed_tests += 1
            
        print(f"{status} {test_name} ({response_time:.3f}s) - {details}")

    def generate_hmac_signature(self, timestamp: int, body: str) -> str:
        """Generate HMAC signature for authenticated requests"""
        message = f"{timestamp}.{body}"
        signature = hmac.new(
            HMAC_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature

    async def test_express_server_health(self, session: aiohttp.ClientSession):
        """Test Express server health and features"""
        start_time = time.time()
        try:
            # Test Express server on port 3000
            async with session.get(f"http://localhost:{EXPRESS_PORT}/health") as response:
                response_time = time.time() - start_time
                
                if response.status == 200:
                    data = await response.json()
                    features = data.get('features', [])
                    expected_features = [
                        'analytics_funnel_integrity',
                        'proper_4xx_responses',
                        'multi_currency_support',
                        'hmac_security',
                        'idempotency_protection'
                    ]
                    
                    missing_features = [f for f in expected_features if f not in features]
                    if not missing_features:
                        self.log_result(
                            "Express Server Health Check",
                            True,
                            f"All 5 hardening features operational: {', '.join(features)}",
                            response_time
                        )
                    else:
                        self.log_result(
                            "Express Server Health Check",
                            False,
                            f"Missing features: {missing_features}",
                            response_time
                        )
                else:
                    self.log_result(
                        "Express Server Health Check",
                        False,
                        f"HTTP {response.status}",
                        response_time
                    )
        except Exception as e:
            self.log_result(
                "Express Server Health Check",
                False,
                f"Connection error: {str(e)}",
                time.time() - start_time
            )

    async def test_fastapi_server_health(self, session: aiohttp.ClientSession):
        """Test FastAPI server health"""
        start_time = time.time()
        try:
            async with session.get(f"http://localhost:{FASTAPI_PORT}/api/health") as response:
                response_time = time.time() - start_time
                
                if response.status == 200:
                    data = await response.json()
                    service_name = data.get('service', '')
                    if 'AisleMarts' in service_name:
                        self.log_result(
                            "FastAPI Server Health Check",
                            True,
                            f"Service: {service_name}",
                            response_time
                        )
                    else:
                        self.log_result(
                            "FastAPI Server Health Check",
                            False,
                            f"Unexpected service: {service_name}",
                            response_time
                        )
                else:
                    self.log_result(
                        "FastAPI Server Health Check",
                        False,
                        f"HTTP {response.status}",
                        response_time
                    )
        except Exception as e:
            self.log_result(
                "FastAPI Server Health Check",
                False,
                f"Connection error: {str(e)}",
                time.time() - start_time
            )

    async def test_cors_headers(self, session: aiohttp.ClientSession):
        """Test CORS headers include all required values"""
        start_time = time.time()
        try:
            # Test OPTIONS request to purchase endpoint
            async with session.options(f"http://localhost:{EXPRESS_PORT}/api/track/purchase") as response:
                response_time = time.time() - start_time
                
                allow_headers = response.headers.get('Access-Control-Allow-Headers', '')
                required_headers = ['Content-Type', 'X-Timestamp', 'X-Signature', 'Idempotency-Key']
                
                missing_headers = [h for h in required_headers if h not in allow_headers]
                
                if not missing_headers:
                    self.log_result(
                        "CORS Headers Validation",
                        True,
                        f"All required headers present: {allow_headers}",
                        response_time
                    )
                else:
                    self.log_result(
                        "CORS Headers Validation",
                        False,
                        f"Missing headers: {missing_headers}",
                        response_time
                    )
        except Exception as e:
            self.log_result(
                "CORS Headers Validation",
                False,
                f"Error: {str(e)}",
                time.time() - start_time
            )

    async def test_hmac_auth_error_codes(self, session: aiohttp.ClientSession):
        """Test HMAC/Auth Error Code Standardization"""
        
        # Test 1: Missing headers should return 401 for missing auth headers
        start_time = time.time()
        try:
            payload = {"orderId": "test-order", "userId": "test-user", "productId": "test-product", "amount": 100.00, "currency": "USD"}
            async with session.post(
                f"http://localhost:{EXPRESS_PORT}/api/track/purchase",
                json=payload
            ) as response:
                response_time = time.time() - start_time
                
                if response.status == 401:  # Should be 401 for missing auth headers
                    data = await response.json()
                    self.log_result(
                        "Missing Headers Error Code",
                        True,
                        f"Returns 401 for missing auth headers: {data.get('error', '')}",
                        response_time
                    )
                else:
                    self.log_result(
                        "Missing Headers Error Code",
                        False,
                        f"Expected 401, got {response.status}",
                        response_time
                    )
        except Exception as e:
            self.log_result(
                "Missing Headers Error Code",
                False,
                f"Error: {str(e)}",
                time.time() - start_time
            )

        # Test 2: Invalid HMAC signatures should return 401 (not 500)
        start_time = time.time()
        try:
            timestamp = int(time.time() * 1000)
            payload = {"orderId": "test-order-2", "userId": "test-user", "productId": "test-product", "amount": 100.00, "currency": "USD"}
            
            headers = {
                'Content-Type': 'application/json',
                'X-Timestamp': str(timestamp),
                'X-Signature': 'invalid_signature_here'
            }
            
            async with session.post(
                f"http://localhost:{EXPRESS_PORT}/api/track/purchase",
                json=payload,
                headers=headers
            ) as response:
                response_time = time.time() - start_time
                
                if response.status == 401:
                    data = await response.json()
                    self.log_result(
                        "Invalid HMAC Signature Error Code",
                        True,
                        f"Returns 401 for invalid signature: {data.get('error', '')}",
                        response_time
                    )
                else:
                    self.log_result(
                        "Invalid HMAC Signature Error Code",
                        False,
                        f"Expected 401, got {response.status}",
                        response_time
                    )
        except Exception as e:
            self.log_result(
                "Invalid HMAC Signature Error Code",
                False,
                f"Error: {str(e)}",
                time.time() - start_time
            )

        # Test 3: Valid HMAC signature should work
        start_time = time.time()
        try:
            timestamp = int(time.time() * 1000)
            payload = {"orderId": f"test-order-{timestamp}", "userId": "test-user", "productId": "test-product", "amount": 100.00, "currency": "USD"}
            body_str = json.dumps(payload)
            signature = self.generate_hmac_signature(timestamp, body_str)
            
            headers = {
                'Content-Type': 'application/json',
                'X-Timestamp': str(timestamp),
                'X-Signature': signature,
                'Idempotency-Key': f'test-key-{timestamp}'
            }
            
            async with session.post(
                f"http://localhost:{EXPRESS_PORT}/api/track/purchase",
                json=payload,
                headers=headers
            ) as response:
                response_time = time.time() - start_time
                
                if response.status in [200, 201]:
                    data = await response.json()
                    self.log_result(
                        "Valid HMAC Signature",
                        True,
                        f"Purchase successful: {data.get('purchaseId', 'N/A')}",
                        response_time
                    )
                else:
                    data = await response.json() if response.content_type == 'application/json' else {}
                    self.log_result(
                        "Valid HMAC Signature",
                        False,
                        f"Expected 200/201, got {response.status}: {data.get('error', '')}",
                        response_time
                    )
        except Exception as e:
            self.log_result(
                "Valid HMAC Signature",
                False,
                f"Error: {str(e)}",
                time.time() - start_time
            )

        # Test 4: Schema violations should return 422 (not 500)
        start_time = time.time()
        try:
            timestamp = int(time.time() * 1000)
            # Invalid payload - missing required fields
            payload = {"invalid": "payload"}
            body_str = json.dumps(payload)
            signature = self.generate_hmac_signature(timestamp, body_str)
            
            headers = {
                'Content-Type': 'application/json',
                'X-Timestamp': str(timestamp),
                'X-Signature': signature
            }
            
            async with session.post(
                f"http://localhost:{EXPRESS_PORT}/api/track/purchase",
                json=payload,
                headers=headers
            ) as response:
                response_time = time.time() - start_time
                
                if response.status == 422:
                    data = await response.json()
                    self.log_result(
                        "Schema Violation Error Code",
                        True,
                        f"Returns 422 for invalid schema: {data.get('error', '')}",
                        response_time
                    )
                else:
                    self.log_result(
                        "Schema Violation Error Code",
                        False,
                        f"Expected 422, got {response.status}",
                        response_time
                    )
        except Exception as e:
            self.log_result(
                "Schema Violation Error Code",
                False,
                f"Error: {str(e)}",
                time.time() - start_time
            )

    async def test_idempotency_protection(self, session: aiohttp.ClientSession):
        """Test idempotency replays return 409 (not 200 with cached response)"""
        start_time = time.time()
        try:
            timestamp = int(time.time() * 1000)
            idempotency_key = f'test-idempotency-{timestamp}'
            payload = {"orderId": f"test-order-idem-{timestamp}", "userId": "test-user", "productId": "test-product", "amount": 100.00, "currency": "USD"}
            body_str = json.dumps(payload)
            signature = self.generate_hmac_signature(timestamp, body_str)
            
            headers = {
                'Content-Type': 'application/json',
                'X-Timestamp': str(timestamp),
                'X-Signature': signature,
                'Idempotency-Key': idempotency_key
            }
            
            # First request should succeed
            async with session.post(
                f"http://localhost:{EXPRESS_PORT}/api/track/purchase",
                json=payload,
                headers=headers
            ) as response:
                first_status = response.status
                first_data = await response.json() if response.content_type == 'application/json' else {}
            
            # Second request with same idempotency key should return 409
            async with session.post(
                f"http://localhost:{EXPRESS_PORT}/api/track/purchase",
                json=payload,
                headers=headers
            ) as response:
                response_time = time.time() - start_time
                second_status = response.status
                second_data = await response.json() if response.content_type == 'application/json' else {}
                
                if first_status in [200, 201] and second_status == 409:
                    self.log_result(
                        "Idempotency Protection",
                        True,
                        f"First: {first_status}, Second: {second_status} (409 conflict)",
                        response_time
                    )
                else:
                    self.log_result(
                        "Idempotency Protection",
                        False,
                        f"First: {first_status}, Second: {second_status} (expected 409)",
                        response_time
                    )
        except Exception as e:
            self.log_result(
                "Idempotency Protection",
                False,
                f"Error: {str(e)}",
                time.time() - start_time
            )

    async def test_multi_currency_precision(self, session: aiohttp.ClientSession):
        """Test Multi-Currency Precision with banker's rounding"""
        
        currencies_to_test = [
            {"currency": "EUR", "amount": 123.456, "expected_decimals": 2},
            {"currency": "GBP", "amount": 987.654, "expected_decimals": 2},
            {"currency": "JPY", "amount": 1234.56, "expected_decimals": 0}
        ]
        
        for test_case in currencies_to_test:
            start_time = time.time()
            try:
                timestamp = int(time.time() * 1000)
                payload = {
                    "orderId": f"test-order-{test_case['currency']}-{timestamp}",
                    "userId": "test-user",
                    "productId": "test-product",
                    "amount": test_case["amount"],
                    "currency": test_case["currency"]
                }
                body_str = json.dumps(payload)
                signature = self.generate_hmac_signature(timestamp, body_str)
                
                headers = {
                    'Content-Type': 'application/json',
                    'X-Timestamp': str(timestamp),
                    'X-Signature': signature,
                    'Idempotency-Key': f'test-currency-{test_case["currency"]}-{timestamp}'
                }
                
                async with session.post(
                    f"http://localhost:{EXPRESS_PORT}/api/track/purchase",
                    json=payload,
                    headers=headers
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status in [200, 201]:
                        data = await response.json()
                        returned_amount = data.get('amount', 0)
                        
                        # Check decimal places
                        if test_case["currency"] == "JPY":
                            # JPY should be whole numbers (0 decimal places)
                            if returned_amount == int(returned_amount):
                                self.log_result(
                                    f"Multi-Currency Precision ({test_case['currency']})",
                                    True,
                                    f"JPY rounded to whole number: {returned_amount}",
                                    response_time
                                )
                            else:
                                self.log_result(
                                    f"Multi-Currency Precision ({test_case['currency']})",
                                    False,
                                    f"JPY should be whole number, got: {returned_amount}",
                                    response_time
                                )
                        else:
                            # EUR/GBP should have 2 decimal places
                            decimal_places = len(str(returned_amount).split('.')[-1]) if '.' in str(returned_amount) else 0
                            if decimal_places <= 2:
                                self.log_result(
                                    f"Multi-Currency Precision ({test_case['currency']})",
                                    True,
                                    f"{test_case['currency']} rounded to 2dp: {returned_amount}",
                                    response_time
                                )
                            else:
                                self.log_result(
                                    f"Multi-Currency Precision ({test_case['currency']})",
                                    False,
                                    f"{test_case['currency']} should have ≤2dp, got: {returned_amount}",
                                    response_time
                                )
                    else:
                        data = await response.json() if response.content_type == 'application/json' else {}
                        self.log_result(
                            f"Multi-Currency Precision ({test_case['currency']})",
                            False,
                            f"HTTP {response.status}: {data.get('error', '')}",
                            response_time
                        )
            except Exception as e:
                self.log_result(
                    f"Multi-Currency Precision ({test_case['currency']})",
                    False,
                    f"Error: {str(e)}",
                    time.time() - start_time
                )

    async def test_commission_calculations(self, session: aiohttp.ClientSession):
        """Test commission calculations with minor units precision"""
        start_time = time.time()
        try:
            timestamp = int(time.time() * 1000)
            payload = {
                "orderId": f"test-commission-{timestamp}",
                "userId": "test-user",
                "productId": "test-product",
                "amount": 1000.00,
                "currency": "USD",
                "referrerStoryId": 1  # Assuming story ID 1 exists
            }
            body_str = json.dumps(payload)
            signature = self.generate_hmac_signature(timestamp, body_str)
            
            headers = {
                'Content-Type': 'application/json',
                'X-Timestamp': str(timestamp),
                'X-Signature': signature,
                'Idempotency-Key': f'test-commission-{timestamp}'
            }
            
            async with session.post(
                f"http://localhost:{EXPRESS_PORT}/api/track/purchase",
                json=payload,
                headers=headers
            ) as response:
                response_time = time.time() - start_time
                
                if response.status in [200, 201]:
                    data = await response.json()
                    commission = data.get('commission')
                    
                    if commission:
                        commission_amount = commission.get('amount', 0)
                        commission_rate = commission.get('rate', 0)
                        creator_tier = commission.get('creatorTier', '')
                        
                        # Validate commission calculation
                        expected_commission = 1000.00 * commission_rate
                        if abs(commission_amount - expected_commission) < 0.01:  # Allow small floating point differences
                            self.log_result(
                                "Commission Calculation",
                                True,
                                f"Tier: {creator_tier}, Rate: {commission_rate*100}%, Amount: ${commission_amount}",
                                response_time
                            )
                        else:
                            self.log_result(
                                "Commission Calculation",
                                False,
                                f"Expected ${expected_commission}, got ${commission_amount}",
                                response_time
                            )
                    else:
                        self.log_result(
                            "Commission Calculation",
                            False,
                            "No commission data returned",
                            response_time
                        )
                else:
                    data = await response.json() if response.content_type == 'application/json' else {}
                    self.log_result(
                        "Commission Calculation",
                        False,
                        f"HTTP {response.status}: {data.get('error', '')}",
                        response_time
                    )
        except Exception as e:
            self.log_result(
                "Commission Calculation",
                False,
                f"Error: {str(e)}",
                time.time() - start_time
            )

    async def test_concurrent_performance(self, session: aiohttp.ClientSession):
        """Test performance under concurrent requests"""
        start_time = time.time()
        
        async def make_concurrent_request(request_id: int):
            try:
                timestamp = int(time.time() * 1000) + request_id  # Unique timestamp
                payload = {
                    "orderId": f"concurrent-order-{request_id}-{timestamp}",
                    "userId": f"user-{request_id}",
                    "productId": "test-product",
                    "amount": 50.00,
                    "currency": "USD"
                }
                body_str = json.dumps(payload)
                signature = self.generate_hmac_signature(timestamp, body_str)
                
                headers = {
                    'Content-Type': 'application/json',
                    'X-Timestamp': str(timestamp),
                    'X-Signature': signature,
                    'Idempotency-Key': f'concurrent-{request_id}-{timestamp}'
                }
                
                async with session.post(
                    f"http://localhost:{EXPRESS_PORT}/api/track/purchase",
                    json=payload,
                    headers=headers
                ) as response:
                    return response.status in [200, 201]
            except:
                return False
        
        # Run 10 concurrent requests
        tasks = [make_concurrent_request(i) for i in range(10)]
        results = await asyncio.gather(*tasks)
        
        response_time = time.time() - start_time
        success_count = sum(results)
        success_rate = (success_count / len(results)) * 100
        
        if success_rate >= 90:  # 90% success rate threshold
            self.log_result(
                "Concurrent Performance Test",
                True,
                f"{success_count}/{len(results)} requests successful ({success_rate:.1f}%)",
                response_time
            )
        else:
            self.log_result(
                "Concurrent Performance Test",
                False,
                f"Only {success_count}/{len(results)} requests successful ({success_rate:.1f}%)",
                response_time
            )

    async def test_response_time_sla(self, session: aiohttp.ClientSession):
        """Test all endpoints respond within SLA targets"""
        endpoints_to_test = [
            {"url": f"http://localhost:{EXPRESS_PORT}/health", "method": "GET", "sla_ms": 200},
            {"url": f"http://localhost:{EXPRESS_PORT}/api/creators", "method": "GET", "sla_ms": 500},
            {"url": f"http://localhost:{EXPRESS_PORT}/api/stories?limit=5", "method": "GET", "sla_ms": 500},
            {"url": f"http://localhost:{FASTAPI_PORT}/api/health", "method": "GET", "sla_ms": 200}
        ]
        
        for endpoint in endpoints_to_test:
            start_time = time.time()
            try:
                if endpoint["method"] == "GET":
                    async with session.get(endpoint["url"]) as response:
                        response_time = time.time() - start_time
                        response_time_ms = response_time * 1000
                        
                        if response.status == 200 and response_time_ms <= endpoint["sla_ms"]:
                            self.log_result(
                                f"Response Time SLA ({endpoint['url'].split('/')[-1]})",
                                True,
                                f"{response_time_ms:.1f}ms (SLA: {endpoint['sla_ms']}ms)",
                                response_time
                            )
                        else:
                            self.log_result(
                                f"Response Time SLA ({endpoint['url'].split('/')[-1]})",
                                False,
                                f"{response_time_ms:.1f}ms exceeds SLA of {endpoint['sla_ms']}ms",
                                response_time
                            )
            except Exception as e:
                self.log_result(
                    f"Response Time SLA ({endpoint['url'].split('/')[-1]})",
                    False,
                    f"Error: {str(e)}",
                    time.time() - start_time
                )

    async def run_all_tests(self):
        """Run all P0 hardening validation tests"""
        print("🚀💎 P0 HARDENING VALIDATION - COMPREHENSIVE BACKEND TESTING")
        print("=" * 80)
        print(f"Target: 100% Series A readiness (up from 92.9%)")
        print(f"Express Server: localhost:{EXPRESS_PORT}")
        print(f"FastAPI Server: localhost:{FASTAPI_PORT}")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 80)
        
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            
            # 1. Health Checks
            print("\n🏥 HEALTH CHECKS")
            print("-" * 40)
            await self.test_express_server_health(session)
            await self.test_fastapi_server_health(session)
            
            # 2. CORS Headers Validation
            print("\n🌐 CORS HEADERS VALIDATION")
            print("-" * 40)
            await self.test_cors_headers(session)
            
            # 3. HMAC/Auth Error Code Standardization
            print("\n🔐 HMAC/AUTH ERROR CODE STANDARDIZATION")
            print("-" * 40)
            await self.test_hmac_auth_error_codes(session)
            await self.test_idempotency_protection(session)
            
            # 4. Multi-Currency Precision Testing
            print("\n💰 MULTI-CURRENCY PRECISION TESTING")
            print("-" * 40)
            await self.test_multi_currency_precision(session)
            await self.test_commission_calculations(session)
            
            # 5. Performance & Concurrent Load Testing
            print("\n⚡ PERFORMANCE & CONCURRENT LOAD TESTING")
            print("-" * 40)
            await self.test_concurrent_performance(session)
            await self.test_response_time_sla(session)
        
        # Generate final report
        return self.generate_final_report()

    def generate_final_report(self):
        """Generate comprehensive final report"""
        total_time = time.time() - self.start_time
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print("\n" + "=" * 80)
        print("🏆 P0 HARDENING VALIDATION COMPLETE - FINAL REPORT")
        print("=" * 80)
        
        print(f"📊 OVERALL RESULTS:")
        print(f"   • Total Tests: {self.total_tests}")
        print(f"   • Passed: {self.passed_tests}")
        print(f"   • Failed: {self.failed_tests}")
        print(f"   • Success Rate: {success_rate:.1f}%")
        print(f"   • Total Time: {total_time:.2f}s")
        print(f"   • Average Response Time: {sum(r['response_time'] for r in self.results) / len(self.results):.3f}s")
        
        # Series A Readiness Assessment
        if success_rate >= 100.0:
            print(f"\n🎯 SERIES A READINESS: ✅ ACHIEVED - 100% SUCCESS RATE")
            print(f"   All P0 hardening components validated and operational")
        elif success_rate >= 95.0:
            print(f"\n🎯 SERIES A READINESS: ⚠️ NEAR READY - {success_rate:.1f}% SUCCESS RATE")
            print(f"   Minor issues identified, mostly ready for investor demonstrations")
        else:
            print(f"\n🎯 SERIES A READINESS: ❌ NOT READY - {success_rate:.1f}% SUCCESS RATE")
            print(f"   Critical issues require resolution before investor demonstrations")
        
        # Failed tests summary
        failed_results = [r for r in self.results if not r['success']]
        if failed_results:
            print(f"\n❌ FAILED TESTS REQUIRING ATTENTION:")
            for result in failed_results:
                print(f"   • {result['test']}: {result['details']}")
        
        # Success summary
        passed_results = [r for r in self.results if r['success']]
        if passed_results:
            print(f"\n✅ SUCCESSFUL VALIDATIONS:")
            for result in passed_results:
                print(f"   • {result['test']}: {result['details']}")
        
        print("\n" + "=" * 80)
        
        # Return success rate for external use
        return success_rate

async def main():
    """Main test execution"""
    validator = P0HardeningValidator()
    success_rate = await validator.run_all_tests()
    
    # Exit with appropriate code
    if success_rate >= 100.0:
        sys.exit(0)  # Perfect success
    elif success_rate >= 95.0:
        sys.exit(1)  # Near success but some issues
    else:
        sys.exit(2)  # Significant issues

if __name__ == "__main__":
    asyncio.run(main())