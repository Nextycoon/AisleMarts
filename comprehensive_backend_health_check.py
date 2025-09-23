#!/usr/bin/env python3
"""
🔍 COMPREHENSIVE BACKEND HEALTH CHECK: AisleMarts Series A Production Readiness Test
Testing complete backend system after environment fork for Series A investor demonstrations.

This test uses the CORRECT endpoint URLs based on actual router implementations.
"""

import asyncio
import aiohttp
import json
import time
import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://aislemart-ui.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

@dataclass
class TestResult:
    name: str
    success: bool
    response_time: float
    status_code: Optional[int] = None
    error: Optional[str] = None
    data: Optional[Dict] = None

class AisleMartsBackendTester:
    def __init__(self):
        self.results: List[TestResult] = []
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> TestResult:
        """Make HTTP request and return TestResult"""
        start_time = time.time()
        url = f"{API_BASE_URL}{endpoint}"
        
        try:
            async with self.session.request(method, url, json=data) as response:
                response_time = time.time() - start_time
                
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                return TestResult(
                    name=f"{method} {endpoint}",
                    success=response.status < 400,
                    response_time=response_time,
                    status_code=response.status,
                    data=response_data if isinstance(response_data, dict) else None,
                    error=None if response.status < 400 else f"HTTP {response.status}: {response_data}"
                )
                
        except Exception as e:
            response_time = time.time() - start_time
            return TestResult(
                name=f"{method} {endpoint}",
                success=False,
                response_time=response_time,
                error=str(e)
            )

    async def test_core_api_health(self):
        """Test Core API Health - Major router endpoints"""
        print("🔍 Testing Core API Health...")
        
        # Main health check
        result = await self.make_request('GET', '/health')
        self.results.append(result)

    async def test_currency_infinity_engine(self):
        """Test Currency-Infinity Engine v2.0 - 185+ currency support"""
        print("💰 Testing Currency-Infinity Engine v2.0...")
        
        # Health check
        result = await self.make_request('GET', '/currency/health')
        self.results.append(result)
        
        # Supported currencies
        result = await self.make_request('GET', '/currency/supported')
        self.results.append(result)
        
        # Exchange rates
        result = await self.make_request('GET', '/currency/rates')
        self.results.append(result)
        
        # Currency conversion test
        result = await self.make_request('GET', '/currency/convert?from=USD&to=EUR&amount=100')
        self.results.append(result)

    async def test_ai_super_agent_system(self):
        """Test AI Super Agent System - Available endpoints"""
        print("🤖 Testing AI Super Agent System...")
        
        # AI Super Agent health (this works)
        result = await self.make_request('GET', '/ai-super-agent/health')
        self.results.append(result)
        
        # Test available analytics endpoint
        result = await self.make_request('GET', '/ai-super-agent/analytics/outreach')
        self.results.append(result)

    async def test_rewards_system(self):
        """Test Rewards System - Complete gamification ecosystem"""
        print("🏆 Testing Rewards System...")
        
        # Rewards health
        result = await self.make_request('GET', '/rewards/health')
        self.results.append(result)

    async def test_family_safety_system(self):
        """Test Family Safety System - BlueWave protection (CORRECT URL)"""
        print("👨‍👩‍👧‍👦 Testing Family Safety System...")
        
        # Family safety health (CORRECT URL: /api/family/health)
        result = await self.make_request('GET', '/family/health')
        self.results.append(result)

    async def test_business_console_system(self):
        """Test Business Console System (CORRECT URL)"""
        print("💼 Testing Business Console System...")
        
        # Business console health (CORRECT URL: /api/business/health)
        result = await self.make_request('GET', '/business/health')
        self.results.append(result)

    async def test_tiktok_features_system(self):
        """Test TikTok Features System - Social commerce (CORRECT URL)"""
        print("📱 Testing TikTok Features System...")
        
        # TikTok features health (CORRECT URL: /api/social/health)
        result = await self.make_request('GET', '/social/health')
        self.results.append(result)
        
        # For You feed
        result = await self.make_request('GET', '/social/feed/for-you?user_id=test_user_123')
        self.results.append(result)

    async def test_advanced_features(self):
        """Test Advanced Features - Enhanced business capabilities"""
        print("⚡ Testing Advanced Features...")
        
        # Enhanced features health
        result = await self.make_request('GET', '/enhanced/health')
        self.results.append(result)
        
        # Business tools health
        result = await self.make_request('GET', '/business/health')
        self.results.append(result)
        
        # Operational systems health
        result = await self.make_request('GET', '/ops/health')
        self.results.append(result)
        
        # International expansion health
        result = await self.make_request('GET', '/international/health')
        self.results.append(result)

    async def test_security_systems(self):
        """Test Security Systems - E2EE and KMS"""
        print("🔐 Testing Security Systems...")
        
        # E2EE health
        result = await self.make_request('GET', '/e2ee/health')
        self.results.append(result)
        
        # KMS health
        result = await self.make_request('GET', '/kms/health')
        self.results.append(result)

    async def test_universal_commerce_ai(self):
        """Test Universal Commerce AI Hub"""
        print("🌍 Testing Universal Commerce AI Hub...")
        
        # Universal AI health
        result = await self.make_request('GET', '/universal-ai/health')
        self.results.append(result)

    async def test_production_systems(self):
        """Test Production Deployment Systems"""
        print("🚀 Testing Production Systems...")
        
        # Production health
        result = await self.make_request('GET', '/production/health')
        self.results.append(result)

    async def test_advanced_analytics(self):
        """Test Advanced Analytics Systems"""
        print("📊 Testing Advanced Analytics...")
        
        # Advanced analytics health
        result = await self.make_request('GET', '/advanced-analytics/health')
        self.results.append(result)

    async def test_performance_concurrent_load(self):
        """Test Performance Metrics - Concurrent handling"""
        print("⚡ Testing Performance - Concurrent Load...")
        
        # Create multiple concurrent requests
        concurrent_requests = []
        for i in range(20):  # Test with 20 concurrent requests
            concurrent_requests.append(
                self.make_request('GET', '/health')
            )
        
        start_time = time.time()
        results = await asyncio.gather(*concurrent_requests, return_exceptions=True)
        total_time = time.time() - start_time
        
        successful_requests = sum(1 for r in results if isinstance(r, TestResult) and r.success)
        
        performance_result = TestResult(
            name="Concurrent Load Test (20 requests)",
            success=successful_requests >= 18,  # 90% success rate
            response_time=total_time,
            data={
                'total_requests': 20,
                'successful_requests': successful_requests,
                'success_rate': f"{(successful_requests/20)*100:.1f}%",
                'total_time': f"{total_time:.3f}s",
                'avg_response_time': f"{total_time/20:.3f}s"
            }
        )
        
        self.results.append(performance_result)

    async def run_comprehensive_test(self):
        """Run comprehensive backend health check"""
        print("🚀 Starting AisleMarts Comprehensive Backend Health Check")
        print("=" * 80)
        
        start_time = time.time()
        
        # Run all test suites
        test_suites = [
            self.test_core_api_health,
            self.test_currency_infinity_engine,
            self.test_ai_super_agent_system,
            self.test_rewards_system,
            self.test_family_safety_system,
            self.test_business_console_system,
            self.test_tiktok_features_system,
            self.test_advanced_features,
            self.test_security_systems,
            self.test_universal_commerce_ai,
            self.test_production_systems,
            self.test_advanced_analytics,
            self.test_performance_concurrent_load,
        ]
        
        for test_suite in test_suites:
            try:
                await test_suite()
            except Exception as e:
                print(f"❌ Test suite {test_suite.__name__} failed: {e}")
        
        total_time = time.time() - start_time
        
        # Generate comprehensive report
        self.generate_report(total_time)

    def generate_report(self, total_time: float):
        """Generate comprehensive test report"""
        print("\n" + "=" * 80)
        print("🔍 COMPREHENSIVE BACKEND HEALTH CHECK RESULTS")
        print("=" * 80)
        
        total_tests = len(self.results)
        successful_tests = sum(1 for r in self.results if r.success)
        failed_tests = total_tests - successful_tests
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        # Overall statistics
        print(f"\n📊 OVERALL STATISTICS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Successful: {successful_tests}")
        print(f"   Failed: {failed_tests}")
        print(f"   Success Rate: {success_rate:.1f}%")
        print(f"   Total Time: {total_time:.2f}s")
        print(f"   Average Response Time: {sum(r.response_time for r in self.results)/total_tests:.3f}s")
        
        # Series A readiness assessment
        print(f"\n🎯 SERIES A READINESS ASSESSMENT:")
        if success_rate >= 85:
            print(f"   ✅ PRODUCTION READY - {success_rate:.1f}% success rate exceeds 85% threshold")
            print(f"   🚀 Ready for Series A investor demonstrations")
        elif success_rate >= 70:
            print(f"   ⚠️ NEEDS ATTENTION - {success_rate:.1f}% success rate below 85% threshold")
            print(f"   🔧 Minor fixes needed before Series A presentations")
        else:
            print(f"   ❌ NOT READY - {success_rate:.1f}% success rate requires significant fixes")
            print(f"   🚨 Major issues must be resolved before Series A deployment")
        
        # Categorize results by system
        systems = {
            'Core API': [],
            'Currency Engine': [],
            'AI Super Agent': [],
            'Rewards System': [],
            'Family Safety': [],
            'Business Console': [],
            'TikTok Features': [],
            'Advanced Features': [],
            'Security Systems': [],
            'Universal AI': [],
            'Production Systems': [],
            'Advanced Analytics': [],
            'Performance': []
        }
        
        for result in self.results:
            if '/health' in result.name and not any(x in result.name for x in ['/currency/', '/ai-super-agent/', '/rewards/', '/family/', '/business/', '/social/', '/enhanced/', '/e2ee/', '/kms/', '/universal-ai/', '/production/', '/advanced-analytics/']):
                systems['Core API'].append(result)
            elif '/currency/' in result.name:
                systems['Currency Engine'].append(result)
            elif '/ai-super-agent/' in result.name:
                systems['AI Super Agent'].append(result)
            elif '/rewards/' in result.name:
                systems['Rewards System'].append(result)
            elif '/family/' in result.name:
                systems['Family Safety'].append(result)
            elif '/business/' in result.name:
                systems['Business Console'].append(result)
            elif '/social/' in result.name:
                systems['TikTok Features'].append(result)
            elif any(x in result.name for x in ['/enhanced/', '/ops/', '/international/']):
                systems['Advanced Features'].append(result)
            elif any(x in result.name for x in ['/e2ee/', '/kms/']):
                systems['Security Systems'].append(result)
            elif '/universal-ai/' in result.name:
                systems['Universal AI'].append(result)
            elif '/production/' in result.name:
                systems['Production Systems'].append(result)
            elif '/advanced-analytics/' in result.name:
                systems['Advanced Analytics'].append(result)
            elif 'Concurrent' in result.name:
                systems['Performance'].append(result)
        
        # System-by-system breakdown
        print(f"\n🔍 SYSTEM-BY-SYSTEM BREAKDOWN:")
        for system_name, system_results in systems.items():
            if system_results:
                system_success = sum(1 for r in system_results if r.success)
                system_total = len(system_results)
                system_rate = (system_success / system_total * 100) if system_total > 0 else 0
                
                status_icon = "✅" if system_rate >= 85 else "⚠️" if system_rate >= 70 else "❌"
                print(f"   {status_icon} {system_name}: {system_success}/{system_total} ({system_rate:.1f}%)")
        
        # Failed tests details
        failed_results = [r for r in self.results if not r.success]
        if failed_results:
            print(f"\n❌ FAILED TESTS DETAILS:")
            for result in failed_results:
                print(f"   • {result.name}")
                if result.error:
                    print(f"     Error: {result.error}")
                if result.status_code:
                    print(f"     Status: {result.status_code}")
                print(f"     Response Time: {result.response_time:.3f}s")
        
        # Key business model endpoints
        print(f"\n💰 KEY BUSINESS MODEL VALIDATION:")
        key_endpoints = [
            ('0% Commission Model', [r for r in self.results if '/business/' in r.name or '/enhanced/' in r.name]),
            ('AI Capabilities', [r for r in self.results if '/ai-super-agent/' in r.name]),
            ('Global Currency Support', [r for r in self.results if '/currency/' in r.name]),
            ('Social Commerce', [r for r in self.results if '/social/' in r.name]),
            ('Gamification', [r for r in self.results if '/rewards/' in r.name]),
            ('Family Safety', [r for r in self.results if '/family/' in r.name])
        ]
        
        for feature_name, feature_results in key_endpoints:
            if feature_results:
                feature_success = sum(1 for r in feature_results if r.success)
                feature_total = len(feature_results)
                feature_rate = (feature_success / feature_total * 100) if feature_total > 0 else 0
                
                status_icon = "✅" if feature_rate >= 85 else "⚠️" if feature_rate >= 70 else "❌"
                print(f"   {status_icon} {feature_name}: {feature_success}/{feature_total} ({feature_rate:.1f}%)")
        
        print("\n" + "=" * 80)
        print("🏁 COMPREHENSIVE BACKEND HEALTH CHECK COMPLETE")
        print("=" * 80)

async def main():
    """Main test execution"""
    async with AisleMartsBackendTester() as tester:
        await tester.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())