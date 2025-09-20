#!/usr/bin/env python3
"""
AisleMarts Total Domination Features Backend Testing Suite
=========================================================
Comprehensive testing for the newly fixed backend router integration:
- Enhanced Features Router (/api/enhanced/*)
- Advanced Business Tools Router (/api/business/*)
- Operational Systems Router (/api/ops/*)
- International Expansion Router (/api/international/*)

Focus: Health checks, router imports, API accessibility, authentication, system integration
"""

import asyncio
import aiohttp
import json
import time
import os
from typing import Dict, List, Any
from datetime import datetime

# Configuration
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://seriesaready.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class TotalDominationTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.auth_token = None
        
    async def setup(self):
        """Initialize test session"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        
    async def cleanup(self):
        """Cleanup test session"""
        if self.session:
            await self.session.close()
            
    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    async def test_endpoint(self, endpoint: str, method: str = "GET", data: Dict = None, 
                          auth_required: bool = False, expected_status: int = 200) -> Dict:
        """Generic endpoint testing method"""
        url = f"{API_BASE}{endpoint}"
        headers = {}
        
        if auth_required and self.auth_token:
            headers['Authorization'] = f"Bearer {self.auth_token}"
            
        try:
            if method == "GET":
                async with self.session.get(url, headers=headers) as response:
                    response_data = await response.json()
                    return {
                        "success": response.status == expected_status,
                        "status": response.status,
                        "data": response_data
                    }
            elif method == "POST":
                async with self.session.post(url, headers=headers, json=data) as response:
                    response_data = await response.json()
                    return {
                        "success": response.status == expected_status,
                        "status": response.status,
                        "data": response_data
                    }
        except Exception as e:
            return {
                "success": False,
                "status": 0,
                "data": {"error": str(e)}
            }

    # ============================================================================
    # ENHANCED FEATURES ROUTER TESTS (/api/enhanced/*)
    # ============================================================================
    
    async def test_enhanced_features_health(self):
        """Test Enhanced Features Router health check"""
        result = await self.test_endpoint("/enhanced/health")
        
        if result["success"]:
            data = result["data"]
            expected_components = ["dynamic_pricing", "llm_router", "trust_scoring", "market_intelligence"]
            has_components = all(comp in str(data) for comp in expected_components)
            
            self.log_result(
                "Enhanced Features Health Check",
                has_components and data.get("status") == "operational",
                f"Service: {data.get('service', 'unknown')}, Components: {data.get('components', {})}"
            )
        else:
            self.log_result(
                "Enhanced Features Health Check",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_dynamic_pricing_health(self):
        """Test Dynamic Pricing AI Engine health"""
        result = await self.test_endpoint("/enhanced/pricing/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Dynamic Pricing AI Health",
                data.get("service") == "dynamic-pricing-ai" and data.get("status") == "operational",
                f"Accuracy: {data.get('accuracy')}, Response Time: {data.get('response_time')}"
            )
        else:
            self.log_result(
                "Dynamic Pricing AI Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_pricing_recommendation(self):
        """Test Dynamic Pricing recommendation endpoint"""
        test_data = {
            "product_id": "TEST-PROD-001",
            "platform": "amazon",
            "strategy": "competitive",
            "min_margin": 0.15,
            "max_discount": 0.30
        }
        
        result = await self.test_endpoint("/enhanced/pricing/recommend", "POST", test_data)
        
        if result["success"]:
            data = result["data"]
            has_required_fields = all(field in data for field in 
                ["product_id", "current_price", "recommended_price", "confidence_score"])
            
            self.log_result(
                "Dynamic Pricing Recommendation",
                has_required_fields,
                f"Price: ${data.get('current_price')} → ${data.get('recommended_price')}, Confidence: {data.get('confidence_score')}"
            )
        else:
            self.log_result(
                "Dynamic Pricing Recommendation",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_llm_router_health(self):
        """Test Multi-LLM Router health"""
        result = await self.test_endpoint("/enhanced/llm-router/health")
        
        if result["success"]:
            data = result["data"]
            expected_providers = ["openai", "anthropic", "google", "emergent"]
            has_providers = all(provider in data.get("providers", {}) for provider in expected_providers)
            
            self.log_result(
                "Multi-LLM Router Health",
                has_providers and data.get("status") == "operational",
                f"Cost Savings: {data.get('cost_savings')}, Total Requests: {data.get('total_requests')}"
            )
        else:
            self.log_result(
                "Multi-LLM Router Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_trust_scoring_health(self):
        """Test Vendor Trust Scoring Engine health"""
        result = await self.test_endpoint("/enhanced/trust/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Vendor Trust Scoring Health",
                data.get("service") == "vendor-trust-engine" and data.get("status") == "operational",
                f"Vendors Scored: {data.get('vendors_scored')}, Accuracy: {data.get('accuracy')}"
            )
        else:
            self.log_result(
                "Vendor Trust Scoring Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_market_intelligence_health(self):
        """Test Real-time Market Intelligence health"""
        result = await self.test_endpoint("/enhanced/market-intel/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Market Intelligence Health",
                data.get("service") == "market-intelligence" and data.get("status") == "operational",
                f"Data Sources: {data.get('data_sources')}, Markets: {data.get('markets_tracked')}"
            )
        else:
            self.log_result(
                "Market Intelligence Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    # ============================================================================
    # BUSINESS TOOLS ROUTER TESTS (/api/business/*)
    # ============================================================================
    
    async def test_business_tools_health(self):
        """Test Business Tools Router health check"""
        result = await self.test_endpoint("/business/health")
        
        if result["success"]:
            data = result["data"]
            expected_components = ["vendor_analytics", "buyer_lifestyle", "compliance_toolkit", "revenue_optimization"]
            has_components = all(comp in data.get("components", {}) for comp in expected_components)
            
            self.log_result(
                "Business Tools Health Check",
                has_components and data.get("status") == "operational",
                f"Service: {data.get('service')}, Components: {list(data.get('components', {}).keys())}"
            )
        else:
            self.log_result(
                "Business Tools Health Check",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_vendor_tools_health(self):
        """Test Vendor Business Tools health"""
        result = await self.test_endpoint("/business/vendor/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Vendor Business Tools Health",
                data.get("service") == "vendor-business-tools" and data.get("status") == "operational",
                f"Active Vendors: {data.get('vendors_active')}, Insights: {data.get('insights_generated')}"
            )
        else:
            self.log_result(
                "Vendor Business Tools Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_buyer_tools_health(self):
        """Test Buyer Lifestyle Tools health"""
        result = await self.test_endpoint("/business/buyer/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Buyer Lifestyle Tools Health",
                data.get("service") == "buyer-lifestyle-tools" and data.get("status") == "operational",
                f"Active Users: {data.get('active_users')}, Satisfaction: {data.get('avg_satisfaction')}"
            )
        else:
            self.log_result(
                "Buyer Lifestyle Tools Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_compliance_health(self):
        """Test Cross-border Compliance Toolkit health"""
        result = await self.test_endpoint("/business/compliance/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Cross-border Compliance Health",
                data.get("service") == "cross-border-compliance" and data.get("status") == "operational",
                f"Countries: {data.get('countries_covered')}, Accuracy: {data.get('accuracy')}"
            )
        else:
            self.log_result(
                "Cross-border Compliance Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_revenue_optimization_health(self):
        """Test Revenue Optimization Suite health"""
        result = await self.test_endpoint("/business/revenue/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Revenue Optimization Health",
                data.get("service") == "revenue-optimization" and data.get("status") == "operational",
                f"Optimizations: {data.get('optimizations_run')}, Avg Improvement: {data.get('avg_improvement')}"
            )
        else:
            self.log_result(
                "Revenue Optimization Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    # ============================================================================
    # OPERATIONAL SYSTEMS ROUTER TESTS (/api/ops/*)
    # ============================================================================
    
    async def test_operational_systems_health(self):
        """Test Operational Systems Router health check"""
        result = await self.test_endpoint("/ops/health")
        
        if result["success"]:
            data = result["data"]
            expected_components = ["e2ee_management", "fraud_prevention", "observability_v2", "cost_optimization"]
            has_components = all(comp in data.get("components", {}) for comp in expected_components)
            
            self.log_result(
                "Operational Systems Health Check",
                has_components and data.get("status") == "operational",
                f"Service: {data.get('service')}, Security Level: {data.get('security_level')}"
            )
        else:
            self.log_result(
                "Operational Systems Health Check",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_e2ee_health(self):
        """Test End-to-End Encryption health"""
        result = await self.test_endpoint("/ops/e2ee/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "E2EE Management Health",
                data.get("service") == "e2ee-management" and data.get("status") == "operational",
                f"Encryption: {data.get('encryption_level')}, Standards: {len(data.get('security_standards', []))}"
            )
        else:
            self.log_result(
                "E2EE Management Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_fraud_prevention_health(self):
        """Test Fraud Prevention AI Engine health"""
        result = await self.test_endpoint("/ops/fraud/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Fraud Prevention Health",
                data.get("service") == "fraud-prevention-ai" and data.get("status") == "operational",
                f"Accuracy: {data.get('detection_accuracy')}, Fraud Prevented: {data.get('fraud_prevented')}"
            )
        else:
            self.log_result(
                "Fraud Prevention Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_observability_health(self):
        """Test Production Observability v2 health"""
        result = await self.test_endpoint("/ops/observability/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Production Observability Health",
                data.get("service") == "production-observability-v2" and data.get("status") == "operational",
                f"Components: {len(data.get('monitoring_components', []))}, Dashboards: {data.get('dashboards')}"
            )
        else:
            self.log_result(
                "Production Observability Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_optimization_health(self):
        """Test Cost & Performance Optimization health"""
        result = await self.test_endpoint("/ops/optimization/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Cost & Performance Optimization Health",
                data.get("service") == "cost-performance-optimization" and data.get("status") == "operational",
                f"Monthly Savings: {data.get('monthly_savings')}, Performance Improvements: {data.get('performance_improvements')}"
            )
        else:
            self.log_result(
                "Cost & Performance Optimization Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    # ============================================================================
    # INTERNATIONAL EXPANSION ROUTER TESTS (/api/international/*)
    # ============================================================================
    
    async def test_international_expansion_health(self):
        """Test International Expansion Router health check"""
        result = await self.test_endpoint("/international/health")
        
        if result["success"]:
            data = result["data"]
            expected_components = ["market_expansion", "compliance_engine", "localization", "partnership_management"]
            has_components = all(comp in data.get("components", {}) for comp in expected_components)
            
            self.log_result(
                "International Expansion Health Check",
                has_components and data.get("status") == "operational",
                f"Service: {data.get('service')}, Active Markets: {data.get('global_coverage', {}).get('active_markets')}"
            )
        else:
            self.log_result(
                "International Expansion Health Check",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_expansion_health(self):
        """Test Market Expansion health"""
        result = await self.test_endpoint("/international/expansion/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Market Expansion Health",
                data.get("service") == "international-expansion" and data.get("status") == "operational",
                f"Active Markets: {data.get('active_markets')}, Success Rate: {data.get('success_rate')}"
            )
        else:
            self.log_result(
                "Market Expansion Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_international_compliance_health(self):
        """Test Regional Compliance Engine health"""
        result = await self.test_endpoint("/international/compliance/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Regional Compliance Health",
                data.get("service") == "regional-compliance" and data.get("status") == "operational",
                f"Regions: {data.get('regions_covered')}, Compliance Score: {data.get('compliance_score')}"
            )
        else:
            self.log_result(
                "Regional Compliance Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_localization_health(self):
        """Test Currency & Tax Localization health"""
        result = await self.test_endpoint("/international/localization/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Localization Engine Health",
                data.get("service") == "localization-engine" and data.get("status") == "operational",
                f"Countries: {data.get('supported_countries')}, Currencies: {data.get('supported_currencies')}"
            )
        else:
            self.log_result(
                "Localization Engine Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_partnerships_health(self):
        """Test Global Partnership Management health"""
        result = await self.test_endpoint("/international/partnerships/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Partnership Management Health",
                data.get("service") == "partnership-management" and data.get("status") == "operational",
                f"Active Partnerships: {data.get('active_partnerships')}, Revenue: {data.get('partnership_revenue')}"
            )
        else:
            self.log_result(
                "Partnership Management Health",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    # ============================================================================
    # SYSTEM INTEGRATION TESTS
    # ============================================================================
    
    async def test_main_health_endpoint(self):
        """Test main API health endpoint"""
        result = await self.test_endpoint("/health")
        
        if result["success"]:
            data = result["data"]
            self.log_result(
                "Main API Health Check",
                data.get("ok") == True and "AisleMarts" in data.get("service", ""),
                f"Service: {data.get('service')}, Status: {data.get('status')}"
            )
        else:
            self.log_result(
                "Main API Health Check",
                False,
                f"HTTP {result['status']}: {result['data']}"
            )

    async def test_router_accessibility(self):
        """Test that all routers are accessible and not returning 404s"""
        router_endpoints = [
            "/enhanced/health",
            "/business/health", 
            "/ops/health",
            "/international/health"
        ]
        
        accessible_count = 0
        for endpoint in router_endpoints:
            result = await self.test_endpoint(endpoint)
            if result["success"]:
                accessible_count += 1
        
        self.log_result(
            "Router Accessibility Test",
            accessible_count == len(router_endpoints),
            f"Accessible routers: {accessible_count}/{len(router_endpoints)}"
        )

    # ============================================================================
    # MAIN TEST EXECUTION
    # ============================================================================
    
    async def run_all_tests(self):
        """Run all Total Domination feature tests"""
        print("🚀 Starting AisleMarts Total Domination Features Backend Testing")
        print("=" * 80)
        
        await self.setup()
        
        try:
            # Main system health
            await self.test_main_health_endpoint()
            await self.test_router_accessibility()
            
            # Enhanced Features Router Tests
            print("\n🎯 ENHANCED FEATURES ROUTER TESTS")
            print("-" * 50)
            await self.test_enhanced_features_health()
            await self.test_dynamic_pricing_health()
            await self.test_pricing_recommendation()
            await self.test_llm_router_health()
            await self.test_trust_scoring_health()
            await self.test_market_intelligence_health()
            
            # Business Tools Router Tests
            print("\n💼 BUSINESS TOOLS ROUTER TESTS")
            print("-" * 50)
            await self.test_business_tools_health()
            await self.test_vendor_tools_health()
            await self.test_buyer_tools_health()
            await self.test_compliance_health()
            await self.test_revenue_optimization_health()
            
            # Operational Systems Router Tests
            print("\n⚙️ OPERATIONAL SYSTEMS ROUTER TESTS")
            print("-" * 50)
            await self.test_operational_systems_health()
            await self.test_e2ee_health()
            await self.test_fraud_prevention_health()
            await self.test_observability_health()
            await self.test_optimization_health()
            
            # International Expansion Router Tests
            print("\n🌍 INTERNATIONAL EXPANSION ROUTER TESTS")
            print("-" * 50)
            await self.test_international_expansion_health()
            await self.test_expansion_health()
            await self.test_international_compliance_health()
            await self.test_localization_health()
            await self.test_partnerships_health()
            
        finally:
            await self.cleanup()
        
        # Generate summary
        self.generate_summary()

    def generate_summary(self):
        """Generate test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print("\n" + "=" * 80)
        print("🏆 TOTAL DOMINATION FEATURES TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
        
        # Router-specific summary
        router_results = {
            "Enhanced Features": [r for r in self.test_results if "Enhanced" in r["test"] or "Dynamic" in r["test"] or "LLM" in r["test"] or "Trust" in r["test"] or "Market" in r["test"]],
            "Business Tools": [r for r in self.test_results if "Business" in r["test"] or "Vendor" in r["test"] or "Buyer" in r["test"] or "Compliance" in r["test"] or "Revenue" in r["test"]],
            "Operational Systems": [r for r in self.test_results if "Operational" in r["test"] or "E2EE" in r["test"] or "Fraud" in r["test"] or "Observability" in r["test"] or "Optimization" in r["test"]],
            "International Expansion": [r for r in self.test_results if "International" in r["test"] or "Expansion" in r["test"] or "Regional" in r["test"] or "Localization" in r["test"] or "Partnership" in r["test"]]
        }
        
        print(f"\n📋 ROUTER-SPECIFIC RESULTS:")
        for router_name, router_tests in router_results.items():
            if router_tests:
                router_passed = sum(1 for t in router_tests if t["success"])
                router_total = len(router_tests)
                router_rate = (router_passed / router_total * 100) if router_total > 0 else 0
                status = "✅" if router_rate >= 80 else "⚠️" if router_rate >= 60 else "❌"
                print(f"   {status} {router_name}: {router_passed}/{router_total} ({router_rate:.1f}%)")
        
        print(f"\n🎯 CRITICAL ISSUES IDENTIFIED:")
        critical_failures = [r for r in self.test_results if not r["success"] and "Health" in r["test"]]
        if critical_failures:
            for failure in critical_failures:
                print(f"   🚨 {failure['test']}: {failure['details']}")
        else:
            print("   ✅ No critical health check failures detected")
        
        print(f"\n🔧 ROUTER IMPORT STATUS:")
        router_health_tests = [r for r in self.test_results if r["test"].endswith("Health Check")]
        for test in router_health_tests:
            status = "✅ LOADED" if test["success"] else "❌ FAILED"
            print(f"   {status}: {test['test'].replace(' Health Check', '')}")
        
        if success_rate >= 90:
            print(f"\n🎉 EXCELLENT: Total Domination features are fully operational!")
        elif success_rate >= 80:
            print(f"\n👍 GOOD: Total Domination features are mostly operational with minor issues")
        elif success_rate >= 60:
            print(f"\n⚠️ WARNING: Total Domination features have significant issues requiring attention")
        else:
            print(f"\n🚨 CRITICAL: Total Domination features have major failures requiring immediate fix")

async def main():
    """Main test execution"""
    tester = TotalDominationTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())