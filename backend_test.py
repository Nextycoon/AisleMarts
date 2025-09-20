#!/usr/bin/env python3
"""
AisleMarts Universal Commerce AI Hub - Production Systems Testing
================================================================
Comprehensive testing for A/B Testing Framework, Executive Dashboard, 
and Production Monitoring endpoints for Series A investment readiness.

Test Coverage:
- A/B Testing Framework endpoints
- Executive Dashboard endpoints  
- Production Monitoring endpoints
- Integration Testing
- Performance Testing
"""

import asyncio
import aiohttp
import json
import time
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
import sys
import os

# Add backend directory to path for imports
sys.path.append('/app/backend')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://lifestyle-universe.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class ProductionSystemsTester:
    """
    Comprehensive tester for AisleMarts production-grade systems:
    - A/B Testing Framework
    - Executive Dashboard  
    - Production Monitoring
    """
    
    def __init__(self):
        self.session = None
        self.test_results = {
            "ab_testing": {"passed": 0, "failed": 0, "tests": []},
            "executive_dashboard": {"passed": 0, "failed": 0, "tests": []},
            "production_monitoring": {"passed": 0, "failed": 0, "tests": []},
            "integration": {"passed": 0, "failed": 0, "tests": []},
            "performance": {"passed": 0, "failed": 0, "tests": []}
        }
        self.start_time = time.time()
        
    async def setup(self):
        """Setup test environment"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={"Content-Type": "application/json"}
        )
        print("🚀 AisleMarts Universal Commerce AI Hub Production Systems Testing")
        print(f"📡 Backend URL: {BACKEND_URL}")
        print(f"🔗 API Base: {API_BASE}")
        print("=" * 80)
        
    async def cleanup(self):
        """Cleanup test environment"""
        if self.session:
            await self.session.close()
    
    def log_test(self, category: str, test_name: str, success: bool, details: str, response_time: float = 0):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} [{category.upper()}] {test_name} ({response_time:.3f}s)")
        if not success or details:
            print(f"    Details: {details}")
        
        self.test_results[category]["tests"].append({
            "name": test_name,
            "success": success,
            "details": details,
            "response_time": response_time
        })
        
        if success:
            self.test_results[category]["passed"] += 1
        else:
            self.test_results[category]["failed"] += 1
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, response_time)"""
        start_time = time.time()
        
        try:
            url = f"{API_BASE}{endpoint}"
            
            if method.upper() == "GET":
                async with self.session.get(url, params=params) as response:
                    response_time = time.time() - start_time
                    response_data = await response.json()
                    return response.status == 200, response_data, response_time
            
            elif method.upper() == "POST":
                async with self.session.post(url, json=data, params=params) as response:
                    response_time = time.time() - start_time
                    response_data = await response.json()
                    return response.status == 200, response_data, response_time
            
            else:
                return False, {"error": f"Unsupported method: {method}"}, 0
                
        except Exception as e:
            response_time = time.time() - start_time
            return False, {"error": str(e)}, response_time
    
    # ==================== A/B TESTING FRAMEWORK TESTS ====================
    
    async def test_ab_testing_health(self):
        """Test A/B testing system health endpoint"""
        success, data, response_time = await self.make_request("GET", "/ab-testing/health")
        
        if success:
            required_fields = ["system_name", "status", "total_experiments", "active_experiments"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                self.log_test("ab_testing", "Health Check", False, 
                            f"Missing fields: {missing_fields}", response_time)
            else:
                self.log_test("ab_testing", "Health Check", True, 
                            f"System operational with {data.get('active_experiments', 0)} active experiments", response_time)
        else:
            self.log_test("ab_testing", "Health Check", False, 
                        f"Request failed: {data.get('error', 'Unknown error')}", response_time)
    
    async def test_ab_testing_experiments(self):
        """Test getting active experiments"""
        success, data, response_time = await self.make_request("GET", "/ab-testing/experiments")
        
        if success:
            if "experiments" in data and "total_active" in data:
                experiments = data["experiments"]
                self.log_test("ab_testing", "Active Experiments", True, 
                            f"Found {len(experiments)} active experiments", response_time)
            else:
                self.log_test("ab_testing", "Active Experiments", False, 
                            "Missing experiments or total_active fields", response_time)
        else:
            self.log_test("ab_testing", "Active Experiments", False, 
                        f"Request failed: {data.get('error', 'Unknown error')}", response_time)
    
    async def test_ab_testing_user_assignment(self):
        """Test user assignment to experiment variants"""
        test_user_id = f"test_user_{uuid.uuid4().hex[:8]}"
        assignment_data = {
            "user_id": test_user_id,
            "experiment_id": "personalized_recs_v1",
            "context": {"source": "test", "timestamp": datetime.now().isoformat()}
        }
        
        success, data, response_time = await self.make_request("POST", "/ab-testing/assign", assignment_data)
        
        if success:
            required_fields = ["user_id", "experiment_id", "variant_id", "configuration"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                self.log_test("ab_testing", "User Assignment", False, 
                            f"Missing fields: {missing_fields}", response_time)
            else:
                variant_id = data.get("variant_id")
                self.log_test("ab_testing", "User Assignment", True, 
                            f"User assigned to variant: {variant_id}", response_time)
        else:
            self.log_test("ab_testing", "User Assignment", False, 
                        f"Request failed: {data.get('error', 'Unknown error')}", response_time)
    
    async def test_ab_testing_analytics_summary(self):
        """Test A/B testing analytics summary"""
        success, data, response_time = await self.make_request("GET", "/ab-testing/analytics/summary")
        
        if success:
            if "summary" in data and "experiment_performance" in data:
                summary = data["summary"]
                performance = data["experiment_performance"]
                self.log_test("ab_testing", "Analytics Summary", True, 
                            f"Analytics retrieved: {summary.get('total_experiments', 0)} experiments, {len(performance)} performance metrics", response_time)
            else:
                self.log_test("ab_testing", "Analytics Summary", False, 
                            "Missing summary or experiment_performance fields", response_time)
        else:
            self.log_test("ab_testing", "Analytics Summary", False, 
                        f"Request failed: {data.get('error', 'Unknown error')}", response_time)
    
    # ==================== EXECUTIVE DASHBOARD TESTS ====================
    
    async def test_dashboard_health(self):
        """Test executive dashboard system health"""
        success, data, response_time = await self.make_request("GET", "/dashboard/health")
        
        if success:
            required_fields = ["system_name", "status", "capabilities"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                self.log_test("executive_dashboard", "Health Check", False, 
                            f"Missing fields: {missing_fields}", response_time)
            else:
                capabilities = len(data.get("capabilities", []))
                self.log_test("executive_dashboard", "Health Check", True, 
                            f"Dashboard operational with {capabilities} capabilities", response_time)
        else:
            self.log_test("executive_dashboard", "Health Check", False, 
                        f"Request failed: {data.get('error', 'Unknown error')}", response_time)
    
    async def test_dashboard_kpis(self):
        """Test executive KPI dashboard"""
        success, data, response_time = await self.make_request("GET", "/dashboard/kpis")
        
        if success:
            if "kpis" in data and "overall_health" in data:
                kpis = data["kpis"]
                health = data["overall_health"]
                self.log_test("executive_dashboard", "KPI Dashboard", True, 
                            f"KPIs retrieved: {len(kpis)} metrics, overall health: {health}", response_time)
            else:
                self.log_test("executive_dashboard", "KPI Dashboard", False, 
                            "Missing kpis or overall_health fields", response_time)
        else:
            self.log_test("executive_dashboard", "KPI Dashboard", False, 
                        f"Request failed: {data.get('error', 'Unknown error')}", response_time)
    
    async def test_dashboard_commerce_metrics(self):
        """Test commerce metrics and analytics"""
        success, data, response_time = await self.make_request("GET", "/dashboard/commerce")
        
        if success:
            if "commerce_metrics" in data:
                metrics = data["commerce_metrics"]
                required_metrics = ["gmv", "orders", "conversion_rate", "aov"]
                missing_metrics = [m for m in required_metrics if m not in metrics]
                
                if missing_metrics:
                    self.log_test("executive_dashboard", "Commerce Metrics", False, 
                                f"Missing metrics: {missing_metrics}", response_time)
                else:
                    gmv = metrics["gmv"]["formatted"]
                    cvr = metrics["conversion_rate"]["formatted"]
                    self.log_test("executive_dashboard", "Commerce Metrics", True, 
                                f"Commerce data retrieved: GMV {gmv}, CVR {cvr}", response_time)
            else:
                self.log_test("executive_dashboard", "Commerce Metrics", False, 
                            "Missing commerce_metrics field", response_time)
        else:
            self.log_test("executive_dashboard", "Commerce Metrics", False, 
                        f"Request failed: {data.get('error', 'Unknown error')}", response_time)
    
    async def test_dashboard_comprehensive_analytics(self):
        """Test comprehensive business analytics"""
        success, data, response_time = await self.make_request("GET", "/dashboard/analytics/comprehensive")
        
        if success:
            required_sections = ["executive_summary", "detailed_metrics", "kpi_dashboard", "insights", "recommendations"]
            missing_sections = [s for s in required_sections if s not in data]
            
            if missing_sections:
                self.log_test("executive_dashboard", "Comprehensive Analytics", False, 
                            f"Missing sections: {missing_sections}", response_time)
            else:
                insights_count = len(data.get("insights", []))
                recommendations_count = len(data.get("recommendations", []))
                self.log_test("executive_dashboard", "Comprehensive Analytics", True, 
                            f"Comprehensive analytics retrieved: {insights_count} insights, {recommendations_count} recommendations", response_time)
        else:
            self.log_test("executive_dashboard", "Comprehensive Analytics", False, 
                        f"Request failed: {data.get('error', 'Unknown error')}", response_time)
    
    # ==================== PRODUCTION MONITORING TESTS ====================
    
    async def test_monitoring_health(self):
        """Test production monitoring system health"""
        success, data, response_time = await self.make_request("GET", "/monitoring/health")
        
        if success:
            required_fields = ["system_name", "status", "capabilities"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                self.log_test("production_monitoring", "Health Check", False, 
                            f"Missing fields: {missing_fields}", response_time)
            else:
                capabilities = len(data.get("capabilities", []))
                self.log_test("production_monitoring", "Health Check", True, 
                            f"Monitoring system operational with {capabilities} capabilities", response_time)
        else:
            self.log_test("production_monitoring", "Health Check", False, 
                        f"Request failed: {data.get('error', 'Unknown error')}", response_time)
    
    async def test_monitoring_golden_signals(self):
        """Test four golden signals monitoring"""
        success, data, response_time = await self.make_request("GET", "/monitoring/golden-signals")
        
        if success:
            if "golden_signals" in data:
                signals = data["golden_signals"]
                required_signals = ["latency", "traffic", "errors", "saturation"]
                missing_signals = [s for s in required_signals if s not in signals]
                
                if missing_signals:
                    self.log_test("production_monitoring", "Golden Signals", False, 
                                f"Missing signals: {missing_signals}", response_time)
                else:
                    latency_p95 = signals["latency"]["p95"]
                    error_rate = signals["errors"]["error_rate"]
                    self.log_test("production_monitoring", "Golden Signals", True, 
                                f"Golden signals retrieved: P95 latency {latency_p95}ms, error rate {error_rate}%", response_time)
            else:
                self.log_test("production_monitoring", "Golden Signals", False, 
                            "Missing golden_signals field", response_time)
        else:
            self.log_test("production_monitoring", "Golden Signals", False, 
                        f"Request failed: {data.get('error', 'Unknown error')}", response_time)
    
    async def test_monitoring_service_health(self):
        """Test service health monitoring"""
        success, data, response_time = await self.make_request("GET", "/monitoring/service/universal_ai_hub/health")
        
        if success:
            required_fields = ["service", "status", "health_score"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                self.log_test("production_monitoring", "Service Health", False, 
                            f"Missing fields: {missing_fields}", response_time)
            else:
                service = data.get("service")
                status = data.get("status")
                health_score = data.get("health_score")
                self.log_test("production_monitoring", "Service Health", True, 
                            f"Service {service} status: {status}, health score: {health_score}", response_time)
        else:
            self.log_test("production_monitoring", "Service Health", False, 
                        f"Request failed: {data.get('error', 'Unknown error')}", response_time)
    
    # ==================== PERFORMANCE TESTS ====================
    
    async def test_performance_response_times(self):
        """Test that all endpoints respond within 2 seconds"""
        endpoints = [
            "/ab-testing/health",
            "/dashboard/health", 
            "/monitoring/health",
            "/ab-testing/experiments",
            "/dashboard/kpis",
            "/monitoring/golden-signals"
        ]
        
        slow_endpoints = []
        total_time = 0
        
        for endpoint in endpoints:
            success, data, response_time = await self.make_request("GET", endpoint)
            total_time += response_time
            
            if response_time > 2.0:
                slow_endpoints.append(f"{endpoint} ({response_time:.3f}s)")
        
        if slow_endpoints:
            self.log_test("performance", "Response Times", False, 
                        f"Slow endpoints: {', '.join(slow_endpoints)}", total_time)
        else:
            avg_time = total_time / len(endpoints)
            self.log_test("performance", "Response Times", True, 
                        f"All endpoints under 2s (avg: {avg_time:.3f}s)", total_time)
    
    async def test_performance_concurrent_requests(self):
        """Test system handles concurrent requests"""
        start_time = time.time()
        
        # Create 5 concurrent requests to different endpoints
        tasks = []
        endpoints = [
            "/ab-testing/health",
            "/dashboard/health",
            "/monitoring/health",
            "/ab-testing/experiments",
            "/dashboard/kpis"
        ]
        
        for endpoint in endpoints:
            task = self.make_request("GET", endpoint)
            tasks.append(task)
        
        # Execute all requests concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        
        # Count successful requests
        successful = 0
        failed = 0
        
        for result in results:
            if isinstance(result, Exception):
                failed += 1
            else:
                success, data, response_time = result
                if success:
                    successful += 1
                else:
                    failed += 1
        
        if failed == 0:
            self.log_test("performance", "Concurrent Requests", True, 
                        f"All {successful} concurrent requests successful", total_time)
        else:
            self.log_test("performance", "Concurrent Requests", False, 
                        f"{failed} out of {len(endpoints)} requests failed", total_time)
    
    # ==================== MAIN TEST EXECUTION ====================
    
    async def run_all_tests(self):
        """Run all production systems tests"""
        await self.setup()
        
        try:
            print("\n📊 A/B TESTING FRAMEWORK TESTS")
            print("-" * 40)
            await self.test_ab_testing_health()
            await self.test_ab_testing_experiments()
            await self.test_ab_testing_user_assignment()
            await self.test_ab_testing_analytics_summary()
            
            print("\n📈 EXECUTIVE DASHBOARD TESTS")
            print("-" * 40)
            await self.test_dashboard_health()
            await self.test_dashboard_kpis()
            await self.test_dashboard_commerce_metrics()
            await self.test_dashboard_comprehensive_analytics()
            
            print("\n🔍 PRODUCTION MONITORING TESTS")
            print("-" * 40)
            await self.test_monitoring_health()
            await self.test_monitoring_golden_signals()
            await self.test_monitoring_service_health()
            
            print("\n⚡ PERFORMANCE TESTS")
            print("-" * 40)
            await self.test_performance_response_times()
            await self.test_performance_concurrent_requests()
            
            # Print final results
            self.print_final_results()
            
        finally:
            await self.cleanup()
    
    def print_final_results(self):
        """Print comprehensive test results summary"""
        print("\n" + "=" * 80)
        print("🎯 FINAL TEST RESULTS SUMMARY")
        print("=" * 80)
        
        total_passed = 0
        total_failed = 0
        
        for category, results in self.test_results.items():
            passed = results["passed"]
            failed = results["failed"]
            total = passed + failed
            success_rate = (passed / total * 100) if total > 0 else 0
            
            status_icon = "✅" if failed == 0 else "⚠️" if success_rate >= 80 else "❌"
            
            print(f"{status_icon} {category.upper().replace('_', ' ')}: {passed}/{total} passed ({success_rate:.1f}%)")
            
            total_passed += passed
            total_failed += failed
        
        print("-" * 80)
        overall_total = total_passed + total_failed
        overall_success_rate = (total_passed / overall_total * 100) if overall_total > 0 else 0
        
        print(f"🎯 OVERALL: {total_passed}/{overall_total} tests passed ({overall_success_rate:.1f}%)")
        
        # Series A Investment Readiness Assessment
        print("\n💎 SERIES A INVESTMENT READINESS ASSESSMENT")
        print("-" * 50)
        
        if overall_success_rate >= 90:
            print("🚀 EXCELLENT: Production systems are Series A ready")
            print("   ✅ All critical systems operational")
            print("   ✅ Performance meets enterprise standards")
            print("   ✅ Integration between systems working")
        elif overall_success_rate >= 80:
            print("✅ GOOD: Production systems mostly ready with minor issues")
            print("   ⚠️ Some non-critical issues to address")
            print("   ✅ Core functionality operational")
        elif overall_success_rate >= 70:
            print("⚠️ FAIR: Production systems need attention before Series A")
            print("   ❌ Several issues need resolution")
            print("   ⚠️ Performance or integration concerns")
        else:
            print("❌ POOR: Significant issues prevent Series A readiness")
            print("   ❌ Critical systems failing")
            print("   ❌ Major performance or functionality issues")
        
        # Test execution time
        total_time = time.time() - self.start_time
        print(f"\n⏱️ Total test execution time: {total_time:.2f} seconds")
        print(f"📊 Tests per second: {overall_total / total_time:.1f}")
        
        print("\n" + "=" * 80)

async def main():
    """Main test execution function"""
    tester = ProductionSystemsTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())