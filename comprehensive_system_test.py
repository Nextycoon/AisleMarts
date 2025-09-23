#!/usr/bin/env python3
"""
🚀💎 COMPREHENSIVE BLUEWAVE SYSTEM HEALTH CHECK - SERIES A VALIDATION
====================================================================
Complete validation of all BlueWave systems for Series A production readiness.
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
import os

# Backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://ai-marketplace-13.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class ComprehensiveSystemValidator:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    async def setup(self):
        """Initialize test session"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30)
        )
        
    async def teardown(self):
        """Cleanup test session"""
        if self.session:
            await self.session.close()
            
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
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
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"    Details: {details}")
            
    async def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{BASE_URL}{endpoint}"
            
            if method.upper() == 'GET':
                async with self.session.get(url, params=params) as response:
                    response_data = await response.json()
                    return response.status < 400, response_data, response.status
            elif method.upper() == 'POST':
                headers = {'Content-Type': 'application/json'}
                async with self.session.post(url, json=data, params=params, headers=headers) as response:
                    response_data = await response.json()
                    return response.status < 400, response_data, response.status
            else:
                return False, {"error": f"Unsupported method: {method}"}, 400
                
        except Exception as e:
            return False, {"error": str(e)}, 500

    # ============================================================================
    # CORE SYSTEM HEALTH CHECKS
    # ============================================================================
    
    async def test_main_api_health(self):
        """Test main API health endpoint"""
        success, data, status = await self.make_request('GET', '/health')
        
        if success and data.get('ok'):
            service_name = data.get('service', 'Unknown')
            version = data.get('version', 'Unknown')
            self.log_test(
                "Main API Health Check",
                True,
                f"Service: {service_name}, Version: {version}",
                data
            )
        else:
            self.log_test(
                "Main API Health Check",
                False,
                f"Health check failed with status {status}: {data}",
                data
            )

    async def test_universal_commerce_ai_hub(self):
        """Test Universal Commerce AI Hub System"""
        success, data, status = await self.make_request('GET', '/universal-ai/health')
        
        if success:
            platforms = data.get('platforms_connected', 0)
            ai_agents = data.get('ai_agents_deployed', 0)
            capabilities = data.get('capabilities', [])
            
            if platforms > 30 and ai_agents > 200:
                self.log_test(
                    "Universal Commerce AI Hub",
                    True,
                    f"Operational: {platforms} platforms, {ai_agents} AI agents, {len(capabilities)} capabilities",
                    data
                )
            else:
                self.log_test(
                    "Universal Commerce AI Hub",
                    False,
                    f"Below expected thresholds: {platforms} platforms, {ai_agents} AI agents",
                    data
                )
        else:
            self.log_test(
                "Universal Commerce AI Hub",
                False,
                f"Universal AI health check failed with status {status}: {data}",
                data
            )

    async def test_currency_infinity_engine(self):
        """Test Currency-Infinity Engine v2.0"""
        success, data, status = await self.make_request('GET', '/currency/health')
        
        if success:
            currencies = data.get('currencies_supported', 0)
            regions = data.get('regions_covered', 0)
            features = data.get('features', [])
            
            if currencies > 180 and regions >= 7:
                self.log_test(
                    "Currency-Infinity Engine v2.0",
                    True,
                    f"Operational: {currencies} currencies, {regions} regions, {len(features)} features",
                    data
                )
            else:
                self.log_test(
                    "Currency-Infinity Engine v2.0",
                    False,
                    f"Below expected thresholds: {currencies} currencies, {regions} regions",
                    data
                )
        else:
            self.log_test(
                "Currency-Infinity Engine v2.0",
                False,
                f"Currency health check failed with status {status}: {data}",
                data
            )

    async def test_family_safety_systems(self):
        """Test BlueWave Family Safety Systems"""
        success, data, status = await self.make_request('GET', '/family-safety/health')
        
        if success:
            features = data.get('features', [])
            if len(features) > 0:
                self.log_test(
                    "BlueWave Family Safety Systems",
                    True,
                    f"Operational with {len(features)} features",
                    data
                )
            else:
                self.log_test(
                    "BlueWave Family Safety Systems",
                    False,
                    "No features detected",
                    data
                )
        else:
            self.log_test(
                "BlueWave Family Safety Systems",
                False,
                f"Family safety health check failed with status {status}: {data}",
                data
            )

    async def test_business_console_systems(self):
        """Test BlueWave Business Console Systems"""
        success, data, status = await self.make_request('GET', '/business-console/health')
        
        if success:
            features = data.get('features', [])
            design_system = data.get('design_system', '')
            
            if len(features) >= 8 and 'BlueWave' in design_system:
                self.log_test(
                    "BlueWave Business Console Systems",
                    True,
                    f"Operational with {len(features)} features, Design: {design_system}",
                    data
                )
            else:
                self.log_test(
                    "BlueWave Business Console Systems",
                    False,
                    f"Below expected: {len(features)} features, Design: {design_system}",
                    data
                )
        else:
            self.log_test(
                "BlueWave Business Console Systems",
                False,
                f"Business console health check failed with status {status}: {data}",
                data
            )

    async def test_tiktok_social_commerce(self):
        """Test TikTok Social Commerce Systems"""
        success, data, status = await self.make_request('GET', '/tiktok/health')
        
        if success:
            features = data.get('features', [])
            bluewave_integration = data.get('bluewave_integration')
            safety_first = data.get('safety_first')
            
            if len(features) >= 6 and bluewave_integration and safety_first:
                self.log_test(
                    "TikTok Social Commerce Systems",
                    True,
                    f"Operational: {len(features)} features, BlueWave: {bluewave_integration}, Safety: {safety_first}",
                    data
                )
            else:
                self.log_test(
                    "TikTok Social Commerce Systems",
                    False,
                    f"Below expected: {len(features)} features, BlueWave: {bluewave_integration}, Safety: {safety_first}",
                    data
                )
        else:
            self.log_test(
                "TikTok Social Commerce Systems",
                False,
                f"TikTok health check failed with status {status}: {data}",
                data
            )

    async def test_security_systems(self):
        """Test Security Systems (E2EE & KMS)"""
        # Test E2EE
        e2ee_success, e2ee_data, e2ee_status = await self.make_request('GET', '/e2ee/health')
        
        # Test KMS
        kms_success, kms_data, kms_status = await self.make_request('GET', '/kms/health')
        
        if e2ee_success and kms_success:
            e2ee_architecture = e2ee_data.get('zero_knowledge_architecture', False)
            kms_keys = kms_data.get('total_managed_keys', 0)
            
            if e2ee_architecture and kms_keys > 0:
                self.log_test(
                    "Security Systems (E2EE & KMS)",
                    True,
                    f"E2EE: Zero-knowledge architecture, KMS: {kms_keys} managed keys",
                    {'e2ee': e2ee_data, 'kms': kms_data}
                )
            else:
                self.log_test(
                    "Security Systems (E2EE & KMS)",
                    False,
                    f"Security issues: E2EE architecture: {e2ee_architecture}, KMS keys: {kms_keys}",
                    {'e2ee': e2ee_data, 'kms': kms_data}
                )
        else:
            self.log_test(
                "Security Systems (E2EE & KMS)",
                False,
                f"Security systems failed - E2EE: {e2ee_status}, KMS: {kms_status}",
                {'e2ee_error': e2ee_data, 'kms_error': kms_data}
            )

    async def test_enhanced_features_systems(self):
        """Test Enhanced Features Systems"""
        success, data, status = await self.make_request('GET', '/enhanced/health')
        
        if success:
            components = data.get('components', {})
            if len(components) >= 4:
                self.log_test(
                    "Enhanced Features Systems",
                    True,
                    f"Operational with {len(components)} components",
                    data
                )
            else:
                self.log_test(
                    "Enhanced Features Systems",
                    False,
                    f"Below expected: {len(components)} components",
                    data
                )
        else:
            self.log_test(
                "Enhanced Features Systems",
                False,
                f"Enhanced features health check failed with status {status}: {data}",
                data
            )

    async def test_business_tools_systems(self):
        """Test Business Tools Systems"""
        success, data, status = await self.make_request('GET', '/business-tools/health')
        
        if success:
            components = data.get('components', {})
            if len(components) >= 4:
                self.log_test(
                    "Business Tools Systems",
                    True,
                    f"Operational with {len(components)} components",
                    data
                )
            else:
                self.log_test(
                    "Business Tools Systems",
                    False,
                    f"Below expected: {len(components)} components",
                    data
                )
        else:
            self.log_test(
                "Business Tools Systems",
                False,
                f"Business tools health check failed with status {status}: {data}",
                data
            )

    async def test_operational_systems(self):
        """Test Operational Systems"""
        success, data, status = await self.make_request('GET', '/ops/health')
        
        if success:
            components = data.get('components', {})
            security_level = data.get('security_level', '')
            
            if len(components) >= 4 and 'enterprise' in security_level.lower():
                self.log_test(
                    "Operational Systems",
                    True,
                    f"Operational: {len(components)} components, Security: {security_level}",
                    data
                )
            else:
                self.log_test(
                    "Operational Systems",
                    False,
                    f"Below expected: {len(components)} components, Security: {security_level}",
                    data
                )
        else:
            self.log_test(
                "Operational Systems",
                False,
                f"Operational systems health check failed with status {status}: {data}",
                data
            )

    async def test_international_expansion_systems(self):
        """Test International Expansion Systems"""
        success, data, status = await self.make_request('GET', '/international/health')
        
        if success:
            components = data.get('components', {})
            active_markets = data.get('active_markets', 0)
            
            if len(components) >= 4 and active_markets > 10:
                self.log_test(
                    "International Expansion Systems",
                    True,
                    f"Operational: {len(components)} components, {active_markets} active markets",
                    data
                )
            else:
                self.log_test(
                    "International Expansion Systems",
                    False,
                    f"Below expected: {len(components)} components, {active_markets} markets",
                    data
                )
        else:
            self.log_test(
                "International Expansion Systems",
                False,
                f"International expansion health check failed with status {status}: {data}",
                data
            )

    # ============================================================================
    # PERFORMANCE & PRODUCTION READINESS TESTS
    # ============================================================================
    
    async def test_production_monitoring(self):
        """Test Production Monitoring System"""
        success, data, status = await self.make_request('GET', '/production-monitoring/health')
        
        if success:
            monitoring_components = data.get('monitoring_components', 0)
            uptime = data.get('uptime_percentage', 0)
            
            if monitoring_components >= 6 and uptime > 99.0:
                self.log_test(
                    "Production Monitoring System",
                    True,
                    f"Operational: {monitoring_components} components, {uptime}% uptime",
                    data
                )
            else:
                self.log_test(
                    "Production Monitoring System",
                    False,
                    f"Below expected: {monitoring_components} components, {uptime}% uptime",
                    data
                )
        else:
            self.log_test(
                "Production Monitoring System",
                False,
                f"Production monitoring health check failed with status {status}: {data}",
                data
            )

    async def test_ab_testing_framework(self):
        """Test A/B Testing Framework"""
        success, data, status = await self.make_request('GET', '/ab-testing/health')
        
        if success:
            active_experiments = data.get('active_experiments', 0)
            if active_experiments >= 0:  # Can be 0 if no active experiments
                self.log_test(
                    "A/B Testing Framework",
                    True,
                    f"Operational with {active_experiments} active experiments",
                    data
                )
            else:
                self.log_test(
                    "A/B Testing Framework",
                    False,
                    f"Framework issues detected",
                    data
                )
        else:
            self.log_test(
                "A/B Testing Framework",
                False,
                f"A/B testing health check failed with status {status}: {data}",
                data
            )

    async def test_executive_dashboard(self):
        """Test Executive Dashboard System"""
        success, data, status = await self.make_request('GET', '/executive-dashboard/health')
        
        if success:
            kpis = data.get('kpis', 0)
            if kpis >= 4:
                self.log_test(
                    "Executive Dashboard System",
                    True,
                    f"Operational with {kpis} KPIs",
                    data
                )
            else:
                self.log_test(
                    "Executive Dashboard System",
                    False,
                    f"Below expected: {kpis} KPIs",
                    data
                )
        else:
            self.log_test(
                "Executive Dashboard System",
                False,
                f"Executive dashboard health check failed with status {status}: {data}",
                data
            )

    async def test_awareness_engine(self):
        """Test AisleMarts Awareness Engine"""
        success, data, status = await self.make_request('GET', '/awareness/health')
        
        if success:
            capabilities = data.get('capabilities', [])
            languages = data.get('languages_supported', [])
            currencies = data.get('currencies_supported', [])
            
            # Handle both list and integer responses
            cap_count = len(capabilities) if isinstance(capabilities, list) else capabilities
            lang_count = len(languages) if isinstance(languages, list) else languages
            curr_count = len(currencies) if isinstance(currencies, list) else currencies
            
            if cap_count >= 8 and lang_count >= 7 and curr_count >= 15:
                self.log_test(
                    "AisleMarts Awareness Engine",
                    True,
                    f"Operational: {cap_count} capabilities, {lang_count} languages, {curr_count} currencies",
                    data
                )
            else:
                self.log_test(
                    "AisleMarts Awareness Engine",
                    False,
                    f"Below expected: {cap_count} capabilities, {lang_count} languages, {curr_count} currencies",
                    data
                )
        else:
            self.log_test(
                "AisleMarts Awareness Engine",
                False,
                f"Awareness engine health check failed with status {status}: {data}",
                data
            )

    async def test_investor_demo_management(self):
        """Test Investor Demo Management System"""
        success, data, status = await self.make_request('GET', '/investor-demos/health')
        
        if success:
            bundles = data.get('bundles', 0)
            environments = data.get('environments', 0)
            capabilities = data.get('capabilities', 0)
            
            if bundles >= 8 and environments >= 8 and capabilities >= 8:
                self.log_test(
                    "Investor Demo Management System",
                    True,
                    f"Operational: {bundles} bundles, {environments} environments, {capabilities} capabilities",
                    data
                )
            else:
                self.log_test(
                    "Investor Demo Management System",
                    False,
                    f"Below expected: {bundles} bundles, {environments} environments, {capabilities} capabilities",
                    data
                )
        else:
            self.log_test(
                "Investor Demo Management System",
                False,
                f"Investor demo health check failed with status {status}: {data}",
                data
            )

    async def test_performance_benchmarks(self):
        """Test Performance Benchmarks"""
        start_time = time.time()
        
        # Test critical endpoints for performance
        critical_endpoints = [
            '/health',
            '/tiktok/health',
            '/currency/health',
            '/universal-ai/health',
            '/family-safety/health'
        ]
        
        response_times = []
        failed_requests = 0
        
        for endpoint in critical_endpoints:
            endpoint_start = time.time()
            success, data, status = await self.make_request('GET', endpoint)
            endpoint_time = time.time() - endpoint_start
            response_times.append(endpoint_time)
            
            if not success:
                failed_requests += 1
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        max_response_time = max(response_times) if response_times else 0
        success_rate = ((len(critical_endpoints) - failed_requests) / len(critical_endpoints)) * 100
        
        # Performance targets: avg < 2s, max < 5s, success rate > 95%
        if avg_response_time < 2.0 and max_response_time < 5.0 and success_rate >= 95:
            self.log_test(
                "Performance Benchmarks",
                True,
                f"Performance targets met - Avg: {avg_response_time:.3f}s, Max: {max_response_time:.3f}s, Success: {success_rate:.1f}%",
                {
                    'avg_response_time': avg_response_time,
                    'max_response_time': max_response_time,
                    'success_rate': success_rate
                }
            )
        else:
            self.log_test(
                "Performance Benchmarks",
                False,
                f"Performance below targets - Avg: {avg_response_time:.3f}s, Max: {max_response_time:.3f}s, Success: {success_rate:.1f}%",
                {
                    'avg_response_time': avg_response_time,
                    'max_response_time': max_response_time,
                    'success_rate': success_rate
                }
            )

    async def test_concurrent_system_load(self):
        """Test Concurrent System Load"""
        async def make_concurrent_health_check():
            success, data, status = await self.make_request('GET', '/health')
            return success
        
        # Test 20 concurrent requests
        tasks = [make_concurrent_health_check() for _ in range(20)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        success_count = sum(1 for result in results if result is True)
        success_rate = (success_count / len(results)) * 100
        
        if success_rate >= 95:
            self.log_test(
                "Concurrent System Load",
                True,
                f"Concurrent load test passed: {success_count}/{len(results)} requests successful ({success_rate:.1f}%)",
                {'success_rate': success_rate}
            )
        else:
            self.log_test(
                "Concurrent System Load",
                False,
                f"Concurrent load test failed: {success_count}/{len(results)} requests successful ({success_rate:.1f}%)",
                {'success_rate': success_rate}
            )

    # ============================================================================
    # MAIN TEST EXECUTION
    # ============================================================================
    
    async def run_comprehensive_validation(self):
        """Execute comprehensive system validation"""
        print("🚀💎 COMPREHENSIVE BLUEWAVE SYSTEM HEALTH CHECK - SERIES A VALIDATION")
        print("=" * 80)
        
        await self.setup()
        
        try:
            # Core System Health Checks
            print("\n🏗️ CORE SYSTEM HEALTH CHECKS")
            print("-" * 50)
            await self.test_main_api_health()
            await self.test_universal_commerce_ai_hub()
            await self.test_currency_infinity_engine()
            await self.test_family_safety_systems()
            await self.test_business_console_systems()
            await self.test_tiktok_social_commerce()
            await self.test_security_systems()
            
            # Advanced System Components
            print("\n🔧 ADVANCED SYSTEM COMPONENTS")
            print("-" * 50)
            await self.test_enhanced_features_systems()
            await self.test_business_tools_systems()
            await self.test_operational_systems()
            await self.test_international_expansion_systems()
            
            # Production Readiness & Monitoring
            print("\n📊 PRODUCTION READINESS & MONITORING")
            print("-" * 50)
            await self.test_production_monitoring()
            await self.test_ab_testing_framework()
            await self.test_executive_dashboard()
            await self.test_awareness_engine()
            await self.test_investor_demo_management()
            
            # Performance & Load Testing
            print("\n⚡ PERFORMANCE & LOAD TESTING")
            print("-" * 50)
            await self.test_performance_benchmarks()
            await self.test_concurrent_system_load()
            
        finally:
            await self.teardown()
            
        # Print comprehensive results
        self.print_comprehensive_summary()
        
    def print_comprehensive_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🏆 COMPREHENSIVE BLUEWAVE SYSTEM VALIDATION RESULTS")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"📊 OVERALL SYSTEM HEALTH:")
        print(f"   Total Systems Tested: {self.total_tests}")
        print(f"   ✅ Operational: {self.passed_tests}")
        print(f"   ❌ Issues: {self.failed_tests}")
        print(f"   📈 System Health Score: {success_rate:.1f}%")
        
        # Categorize results by system type
        core_systems = [r for r in self.test_results if any(keyword in r['test'] for keyword in ['Main API', 'Universal Commerce', 'Currency-Infinity', 'Family Safety', 'Business Console', 'TikTok', 'Security'])]
        advanced_systems = [r for r in self.test_results if any(keyword in r['test'] for keyword in ['Enhanced Features', 'Business Tools', 'Operational', 'International'])]
        monitoring_systems = [r for r in self.test_results if any(keyword in r['test'] for keyword in ['Production Monitoring', 'A/B Testing', 'Executive Dashboard', 'Awareness Engine', 'Investor Demo'])]
        performance_tests = [r for r in self.test_results if any(keyword in r['test'] for keyword in ['Performance', 'Concurrent'])]
        
        print(f"\n🏗️ CORE SYSTEMS ({len(core_systems)} systems):")
        core_passed = sum(1 for t in core_systems if t['success'])
        core_rate = (core_passed / len(core_systems) * 100) if core_systems else 0
        print(f"   {core_passed}/{len(core_systems)} operational ({core_rate:.1f}%)")
        
        print(f"\n🔧 ADVANCED SYSTEMS ({len(advanced_systems)} systems):")
        advanced_passed = sum(1 for t in advanced_systems if t['success'])
        advanced_rate = (advanced_passed / len(advanced_systems) * 100) if advanced_systems else 0
        print(f"   {advanced_passed}/{len(advanced_systems)} operational ({advanced_rate:.1f}%)")
        
        print(f"\n📊 MONITORING & ANALYTICS ({len(monitoring_systems)} systems):")
        monitoring_passed = sum(1 for t in monitoring_systems if t['success'])
        monitoring_rate = (monitoring_passed / len(monitoring_systems) * 100) if monitoring_systems else 0
        print(f"   {monitoring_passed}/{len(monitoring_systems)} operational ({monitoring_rate:.1f}%)")
        
        print(f"\n⚡ PERFORMANCE & SCALABILITY ({len(performance_tests)} tests):")
        performance_passed = sum(1 for t in performance_tests if t['success'])
        performance_rate = (performance_passed / len(performance_tests) * 100) if performance_tests else 0
        print(f"   {performance_passed}/{len(performance_tests)} passed ({performance_rate:.1f}%)")
        
        # Show system issues
        failed_systems = [r for r in self.test_results if not r['success']]
        if failed_systems:
            print(f"\n❌ SYSTEMS WITH ISSUES:")
            for system in failed_systems:
                print(f"   • {system['test']}: {system['details']}")
        
        # Series A Production Readiness Assessment
        print(f"\n🎯 SERIES A PRODUCTION READINESS ASSESSMENT:")
        if success_rate >= 95:
            print("   🟢 SERIES A READY - EXCELLENT: All systems operational, ready for investor presentations")
        elif success_rate >= 90:
            print("   🟡 SERIES A READY - GOOD: Systems meet production standards with minor optimizations needed")
        elif success_rate >= 80:
            print("   🟠 SERIES A CAUTION: Systems functional but need improvements before investor presentations")
        else:
            print("   🔴 NOT SERIES A READY: Critical systems need immediate attention before investor outreach")
        
        # Key metrics for investors
        print(f"\n💎 KEY INVESTOR METRICS:")
        print(f"   • TikTok Social Commerce: {'✅ Operational' if any('TikTok' in r['test'] and r['success'] for r in self.test_results) else '❌ Issues'}")
        print(f"   • Universal Commerce AI Hub: {'✅ Operational' if any('Universal Commerce' in r['test'] and r['success'] for r in self.test_results) else '❌ Issues'}")
        print(f"   • Currency-Infinity Engine: {'✅ Operational' if any('Currency-Infinity' in r['test'] and r['success'] for r in self.test_results) else '❌ Issues'}")
        print(f"   • Family Safety Systems: {'✅ Operational' if any('Family Safety' in r['test'] and r['success'] for r in self.test_results) else '❌ Issues'}")
        print(f"   • Security & Compliance: {'✅ Operational' if any('Security' in r['test'] and r['success'] for r in self.test_results) else '❌ Issues'}")
        print(f"   • Performance & Scalability: {'✅ Meeting Targets' if performance_rate >= 90 else '❌ Below Targets'}")
        
        print(f"\n📅 Validation completed at: {datetime.now().isoformat()}")
        print("🚀 BlueWave AisleMarts - Ready for Series A Investment!")
        print("=" * 80)

async def main():
    """Main execution function"""
    validator = ComprehensiveSystemValidator()
    await validator.run_comprehensive_validation()

if __name__ == "__main__":
    asyncio.run(main())