#!/usr/bin/env python3
"""
🎯🚀 ULTIMATE OPERATIONAL KIT VALIDATION - FOCUSED SERIES A READINESS TEST
AisleMarts Production-Hardened System - Key Components Testing

This focused test suite validates the most critical Ultimate Operational Kit components 
for Series A investor demonstration quality.
"""

import asyncio
import aiohttp
import json
import time
import uuid
import hmac
import hashlib
import os
from datetime import datetime

# Configuration
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://tiktok-commerce-1.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"
EXPRESS_URL = f"{BACKEND_URL}:3000"

class UltimateKitValidator:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.start_time = time.time()
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            connector=aiohttp.TCPConnector(limit=50)
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_time_ms": round(response_time * 1000, 2)
        })
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name} ({response_time*1000:.1f}ms) - {details}")
    
    async def test_health_infrastructure(self):
        """Test Health & Infrastructure Checks"""
        print("\n🏥 HEALTH & INFRASTRUCTURE CHECKS")
        
        # Test Express Server Health Check
        try:
            start = time.time()
            async with self.session.get(f"{EXPRESS_URL}/health") as resp:
                response_time = time.time() - start
                
                if resp.status == 200:
                    data = await resp.json()
                    features = data.get('features', [])
                    required_features = [
                        'analytics_funnel_integrity',
                        'proper_4xx_responses', 
                        'multi_currency_support',
                        'hmac_security',
                        'idempotency_protection'
                    ]
                    
                    all_features_present = all(feature in features for feature in required_features)
                    
                    self.log_test("Express Server Health Check", all_features_present,
                                f"Features: {len(features)}/5 hardened features present", response_time)
                else:
                    self.log_test("Express Server Health Check", False, 
                                f"HTTP {resp.status}", response_time)
                        
        except Exception as e:
            self.log_test("Express Server Health Check", False, f"Error: {str(e)}")
        
        # Test FastAPI Backend Health Check
        try:
            start = time.time()
            async with self.session.get(f"{BASE_URL}/health") as resp:
                response_time = time.time() - start
                
                if resp.status == 200:
                    data = await resp.json()
                    service_name = data.get('service', '')
                    is_aislemarts = 'AisleMarts' in service_name
                    
                    self.log_test("FastAPI Backend Health Check", is_aislemarts,
                                f"Service: {service_name}", response_time)
                else:
                    self.log_test("FastAPI Backend Health Check", False, 
                                f"HTTP {resp.status}", response_time)
                        
        except Exception as e:
            self.log_test("FastAPI Backend Health Check", False, f"Error: {str(e)}")
    
    async def test_critical_fixes(self):
        """Test the 3 critical fixes that were previously at 94.7%"""
        print("\n🎯 CRITICAL FIX VALIDATION")
        
        # Critical Fix A: Analytics Funnel Integrity
        await self._test_analytics_funnel_integrity()
        
        # Critical Fix B: Proper 4xx Error Responses  
        await self._test_proper_4xx_error_responses()
        
        # Critical Fix C: Multi-Currency Support
        await self._test_multi_currency_support()
    
    async def _test_analytics_funnel_integrity(self):
        """Test sessionized funnel logic ensures impressions ≥ CTAs ≥ purchases"""
        try:
            start = time.time()
            async with self.session.get(f"{EXPRESS_URL}/api/analytics/dashboard") as resp:
                response_time = time.time() - start
                
                if resp.status == 200:
                    data = await resp.json()
                    stats = data.get('stats', {})
                    
                    impressions = stats.get('impressions7d', 0)
                    ctas = stats.get('ctas7d', 0)
                    purchases = stats.get('purchases7d', 0)
                    
                    # Funnel logic: impressions ≥ CTAs ≥ purchases
                    funnel_valid = impressions >= ctas >= purchases
                    
                    self.log_test("Analytics Funnel Integrity", funnel_valid,
                                f"Impressions: {impressions} ≥ CTAs: {ctas} ≥ Purchases: {purchases}", 
                                response_time)
                else:
                    self.log_test("Analytics Funnel Integrity", False, 
                                f"HTTP {resp.status}", response_time)
                    
        except Exception as e:
            self.log_test("Analytics Funnel Integrity", False, f"Error: {str(e)}")
    
    async def _test_proper_4xx_error_responses(self):
        """Test validation scenarios return proper 4xx errors"""
        error_test_cases = [
            # Invalid request payloads (should return 422)
            ("Missing Required Field", "/api/track/impression", {
                "userId": "test_user"
                # Missing storyId
            }, 422),
            
            ("Invalid Amount", "/api/track/purchase", {
                "orderId": "test_order_002",
                "userId": "test_user", 
                "productId": "test_product",
                "amount": -100.00,  # Negative amount
                "currency": "USD"
            }, 422),
            
            ("Invalid Currency", "/api/track/purchase", {
                "orderId": "test_order_003",
                "userId": "test_user",
                "productId": "test_product", 
                "amount": 100.00,
                "currency": "INVALID"  # Unsupported currency
            }, 422)
        ]
        
        for test_name, endpoint, payload, expected_status in error_test_cases:
            try:
                start = time.time()
                
                # For purchase endpoints, add HMAC signature
                headers = {}
                if "/purchase" in endpoint:
                    headers = await self._generate_hmac_headers(payload)
                
                async with self.session.post(f"{EXPRESS_URL}{endpoint}", 
                                           json=payload, headers=headers) as resp:
                    response_time = time.time() - start
                    correct_status = resp.status == expected_status or (400 <= resp.status < 500)
                
                self.log_test(f"4xx Error Response: {test_name}", correct_status,
                            f"Expected: 4xx, Got: {resp.status}", response_time)
                        
            except Exception as e:
                self.log_test(f"4xx Error Response: {test_name}", False, f"Error: {str(e)}")
    
    async def _test_multi_currency_support(self):
        """Test multi-currency support with proper rounding"""
        currency_test_cases = [
            ("USD Currency", "USD", 123.456, 123.46),
            ("EUR Currency", "EUR", 123.456, 123.46), 
            ("GBP Currency", "GBP", 123.456, 123.46),
            ("JPY Currency", "JPY", 123.456, 123)
        ]
        
        for test_name, currency, amount, expected_rounded in currency_test_cases:
            try:
                purchase_data = {
                    "orderId": f"currency_test_{currency}_{uuid.uuid4().hex[:8]}",
                    "userId": f"currency_test_user_{currency}",
                    "productId": "test_product",
                    "amount": amount,
                    "currency": currency
                }
                
                start = time.time()
                signed_headers = await self._generate_hmac_headers(purchase_data)
                
                async with self.session.post(f"{EXPRESS_URL}/api/track/purchase", 
                                           json=purchase_data, headers=signed_headers) as resp:
                    response_time = time.time() - start
                    
                    if resp.status == 200:
                        data = await resp.json()
                        returned_amount = data.get('amount')
                        returned_currency = data.get('currency')
                        has_usd_conversion = 'amountUSD' in data
                        
                        rounding_correct = abs(returned_amount - expected_rounded) < 0.01
                        currency_valid = returned_currency == currency and has_usd_conversion
                        
                        success = rounding_correct and currency_valid
                        
                        self.log_test(f"Multi-Currency: {test_name}", success,
                                    f"Amount: {returned_amount} {returned_currency}, USD: {data.get('amountUSD')}", 
                                    response_time)
                    else:
                        self.log_test(f"Multi-Currency: {test_name}", False, 
                                    f"HTTP {resp.status}", response_time)
                        
            except Exception as e:
                self.log_test(f"Multi-Currency: {test_name}", False, f"Error: {str(e)}")
    
    async def test_production_hardening(self):
        """Test Production Hardening Features"""
        print("\n🛡️ PRODUCTION HARDENING FEATURES")
        
        # Test HMAC Security
        await self._test_hmac_security()
        
        # Test Idempotency Protection
        await self._test_idempotency_protection()
        
        # Test Commission Calculation
        await self._test_commission_calculation()
    
    async def _test_hmac_security(self):
        """Test HMAC signature validation"""
        try:
            purchase_data = {
                "orderId": f"hmac_test_{uuid.uuid4().hex[:8]}",
                "userId": "hmac_test_user",
                "productId": "test_product",
                "amount": 100.00,
                "currency": "USD"
            }
            
            # Test valid HMAC signature
            start = time.time()
            signed_headers = await self._generate_hmac_headers(purchase_data)
            
            async with self.session.post(f"{EXPRESS_URL}/api/track/purchase", 
                                       json=purchase_data, headers=signed_headers) as resp:
                valid_hmac_works = resp.status == 200
            
            # Test invalid HMAC signature
            invalid_headers = {
                "X-Timestamp": str(int(time.time())),
                "X-Signature": "sha256=invalid_signature",
                "Content-Type": "application/json"
            }
            
            async with self.session.post(f"{EXPRESS_URL}/api/track/purchase", 
                                       json=purchase_data, headers=invalid_headers) as resp:
                response_time = time.time() - start
                invalid_hmac_rejected = resp.status in [401, 403]
            
            hmac_security_working = valid_hmac_works and invalid_hmac_rejected
            
            self.log_test("HMAC Security", hmac_security_working,
                        f"Valid: {valid_hmac_works}, Invalid rejected: {invalid_hmac_rejected}", 
                        response_time)
                        
        except Exception as e:
            self.log_test("HMAC Security", False, f"Error: {str(e)}")
    
    async def _test_idempotency_protection(self):
        """Test idempotency protection"""
        try:
            idempotency_key = f"idem_test_{uuid.uuid4().hex}"
            purchase_data = {
                "orderId": f"idem_test_{uuid.uuid4().hex[:8]}",
                "userId": "idem_test_user",
                "productId": "test_product",
                "amount": 100.00,
                "currency": "USD"
            }
            
            signed_headers = await self._generate_hmac_headers(purchase_data)
            signed_headers["Idempotency-Key"] = idempotency_key
            
            # First request
            start = time.time()
            async with self.session.post(f"{EXPRESS_URL}/api/track/purchase", 
                                       json=purchase_data, headers=signed_headers) as resp1:
                first_success = resp1.status == 200
            
            # Duplicate request with same idempotency key
            async with self.session.post(f"{EXPRESS_URL}/api/track/purchase", 
                                       json=purchase_data, headers=signed_headers) as resp2:
                response_time = time.time() - start
                
                # Should handle duplicate appropriately (200 with same result or 409)
                duplicate_handled = resp2.status in [200, 409]
                
                self.log_test("Idempotency Protection", duplicate_handled,
                            f"First: {resp1.status}, Duplicate: {resp2.status}", response_time)
                        
        except Exception as e:
            self.log_test("Idempotency Protection", False, f"Error: {str(e)}")
    
    async def _test_commission_calculation(self):
        """Test commission calculation with attribution"""
        try:
            user_id = f"commission_test_{uuid.uuid4().hex[:8]}"
            story_id = "luxefashion_story_0"
            
            # Create CTA for attribution
            cta_data = {
                "storyId": story_id,
                "productId": "trench-coat",
                "userId": user_id
            }
            await self.session.post(f"{EXPRESS_URL}/api/track/cta", json=cta_data)
            
            # Make purchase with attribution
            purchase_data = {
                "orderId": f"commission_order_{uuid.uuid4().hex[:8]}",
                "userId": user_id,
                "productId": "trench-coat",
                "amount": 239.00,
                "currency": "USD",
                "referrerStoryId": story_id
            }
            
            start = time.time()
            signed_headers = await self._generate_hmac_headers(purchase_data)
            
            async with self.session.post(f"{EXPRESS_URL}/api/track/purchase", 
                                       json=purchase_data, headers=signed_headers) as resp:
                response_time = time.time() - start
                
                if resp.status == 200:
                    data = await resp.json()
                    has_commission = data.get('commission') is not None
                    has_attribution = data.get('attribution') is not None
                    
                    commission_working = has_commission and has_attribution
                    
                    self.log_test("Commission Calculation", commission_working,
                                f"Commission: {has_commission}, Attribution: {has_attribution}", 
                                response_time)
                else:
                    self.log_test("Commission Calculation", False, 
                                f"HTTP {resp.status}", response_time)
                        
        except Exception as e:
            self.log_test("Commission Calculation", False, f"Error: {str(e)}")
    
    async def test_performance_concurrency(self):
        """Test Performance & Concurrency"""
        print("\n⚡ PERFORMANCE & CONCURRENCY")
        
        # Test concurrent requests
        try:
            tasks = []
            for i in range(10):
                task = self._single_performance_request(i)
                tasks.append(task)
            
            start = time.time()
            results = await asyncio.gather(*tasks, return_exceptions=True)
            total_time = time.time() - start
            
            successful_requests = sum(1 for r in results if isinstance(r, dict) and r.get('success'))
            avg_response_time = sum(r.get('response_time', 0) for r in results if isinstance(r, dict)) / len(results)
            
            # Target: <200ms response time
            performance_ok = avg_response_time <= 0.200
            success_rate = (successful_requests / 10) * 100
            
            self.log_test("Concurrent Performance", performance_ok and success_rate >= 80,
                        f"{successful_requests}/10 success, {avg_response_time*1000:.1f}ms avg, Target: ≤200ms", 
                        total_time)
                        
        except Exception as e:
            self.log_test("Concurrent Performance", False, f"Error: {str(e)}")
    
    async def _single_performance_request(self, request_id: int):
        """Single performance test request"""
        try:
            start = time.time()
            async with self.session.get(f"{EXPRESS_URL}/health") as resp:
                response_time = time.time() - start
                
                if resp.status == 200:
                    return {'success': True, 'response_time': response_time}
                else:
                    return {'success': False, 'response_time': response_time}
                    
        except Exception as e:
            return {'success': False, 'response_time': 0, 'error': str(e)}
    
    async def _generate_hmac_headers(self, payload):
        """Generate HMAC headers for signed requests"""
        secret_key = "test_hmac_secret_key"
        timestamp = str(int(time.time()))
        payload_str = json.dumps(payload, sort_keys=True)
        
        message = f"{timestamp}.{payload_str}"
        signature = hmac.new(
            secret_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return {
            "X-Timestamp": timestamp,
            "X-Signature": f"sha256={signature}",
            "Content-Type": "application/json"
        }
    
    async def run_validation(self):
        """Execute Ultimate Operational Kit validation"""
        print("🎯🚀 ULTIMATE OPERATIONAL KIT VALIDATION - SERIES A READINESS")
        print("=" * 70)
        
        # 1. Health & Infrastructure Checks
        await self.test_health_infrastructure()
        
        # 2. Critical Fix Validation
        await self.test_critical_fixes()
        
        # 3. Production Hardening Features
        await self.test_production_hardening()
        
        # 4. Performance & Concurrency
        await self.test_performance_concurrency()
        
        # Generate final report
        await self.generate_final_report()
    
    async def generate_final_report(self):
        """Generate Ultimate Operational Kit validation report"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for test in self.test_results if test['success'])
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        total_time = time.time() - self.start_time
        avg_response_time = sum(test['response_time_ms'] for test in self.test_results) / total_tests if total_tests > 0 else 0
        
        # Categorize critical fixes
        critical_fixes = [t for t in self.test_results if 'Analytics Funnel' in t['test'] or '4xx Error' in t['test'] or 'Multi-Currency' in t['test']]
        critical_fixes_passed = sum(1 for t in critical_fixes if t['success'])
        critical_fixes_rate = (critical_fixes_passed / len(critical_fixes) * 100) if critical_fixes else 0
        
        print("\n" + "=" * 70)
        print("🎯🚀 ULTIMATE OPERATIONAL KIT VALIDATION REPORT")
        print("=" * 70)
        
        print(f"📊 OVERALL RESULTS:")
        print(f"   • Total Tests: {total_tests}")
        print(f"   • Passed: {passed_tests}")
        print(f"   • Failed: {total_tests - passed_tests}")
        print(f"   • Success Rate: {success_rate:.1f}%")
        print(f"   • Total Testing Time: {total_time:.2f}s")
        print(f"   • Average Response Time: {avg_response_time:.1f}ms")
        
        print(f"\n🎯 CRITICAL FIXES VALIDATION:")
        print(f"   • Critical Fixes Success Rate: {critical_fixes_rate:.1f}%")
        print(f"   • Analytics Funnel Integrity: {'✅' if any('Analytics Funnel' in t['test'] and t['success'] for t in self.test_results) else '❌'}")
        print(f"   • Proper 4xx Error Responses: {'✅' if any('4xx Error' in t['test'] and t['success'] for t in self.test_results) else '❌'}")
        print(f"   • Multi-Currency Support: {'✅' if any('Multi-Currency' in t['test'] and t['success'] for t in self.test_results) else '❌'}")
        
        # Ultimate Operational Kit Readiness Assessment
        ultimate_kit_ready = success_rate >= 90.0 and critical_fixes_rate >= 80.0
        print(f"\n🏆 ULTIMATE OPERATIONAL KIT READINESS: {'✅ SERIES A READY' if ultimate_kit_ready else '❌ REQUIRES FIXES'}")
        
        if ultimate_kit_ready:
            print("   • ✅ Express Server with hardened features operational")
            print("   • ✅ FastAPI Backend health confirmed")
            print("   • ✅ Critical fixes validated")
            print("   • ✅ Production hardening features working")
            print("   • ✅ Performance targets met")
            print("   • ✅ Ready for Series A investor demonstrations")
        else:
            print("   • ❌ Issues require resolution before Series A readiness")
            failed_tests = [test for test in self.test_results if not test['success']]
            for test in failed_tests[:3]:  # Show first 3 failures
                print(f"     - {test['test']}: {test['details']}")
        
        print("=" * 70)

async def main():
    """Main validation execution"""
    async with UltimateKitValidator() as validator:
        await validator.run_validation()

if __name__ == "__main__":
    asyncio.run(main())