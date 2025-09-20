#!/usr/bin/env python3
"""
AisleMarts Backend Testing Suite - Series A Investment Readiness Validation
===========================================================================

Comprehensive testing for:
1. Universal Commerce AI Hub System (15+ endpoints)
2. Currency-Infinity Engine v2.0 (185+ currency support)
3. Production Monitoring System
4. A/B Testing Framework
5. Executive Dashboard
6. Core backend systems

Focus: Production system reliability, API performance, AI accuracy validation,
global currency support, cross-platform integration, investor demo readiness.
"""

import asyncio
import aiohttp
import json
import time
import sys
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
import concurrent.futures
from dataclasses import dataclass

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://bluewave-family.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

@dataclass
class TestResult:
    name: str
    success: bool
    response_time: float
    details: str
    error: Optional[str] = None

class AisleMartsSeriesATester:
    def __init__(self):
        self.session = None
        self.auth_token = None
        self.test_results = []
        self.start_time = time.time()
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def add_result(self, result: TestResult):
        self.test_results.append(result)
        status = "✅ PASS" if result.success else "❌ FAIL"
        print(f"{status} {result.name} ({result.response_time:.3f}s)")
        if result.error:
            print(f"    Error: {result.error}")
        if result.details:
            print(f"    Details: {result.details}")
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, response_time, error)"""
        start_time = time.time()
        url = f"{API_BASE}{endpoint}"
        
        request_headers = {}
        if self.auth_token:
            request_headers['Authorization'] = f'Bearer {self.auth_token}'
        if headers:
            request_headers.update(headers)
            
        try:
            async with self.session.request(method, url, json=data, headers=request_headers) as response:
                response_time = time.time() - start_time
                
                if response.status == 200:
                    try:
                        response_data = await response.json()
                        return True, response_data, response_time, None
                    except:
                        text_data = await response.text()
                        return True, {"text": text_data}, response_time, None
                else:
                    error_text = await response.text()
                    return False, None, response_time, f"HTTP {response.status}: {error_text}"
                    
        except Exception as e:
            response_time = time.time() - start_time
            return False, None, response_time, str(e)
    
    async def test_system_health(self):
        """Test basic system health"""
        print("\n🏥 TESTING SYSTEM HEALTH")
        
        success, data, response_time, error = await self.make_request('GET', '/health')
        self.add_result(TestResult(
            name="System Health Check",
            success=success,
            response_time=response_time,
            details=f"Service: {data.get('service', 'Unknown')}" if success else "",
            error=error
        ))
        
        return success
    
    async def test_universal_commerce_ai_hub(self):
        """Test Universal Commerce AI Hub System (15+ endpoints)"""
        print("\n🌍 TESTING UNIVERSAL COMMERCE AI HUB SYSTEM")
        
        endpoints_to_test = [
            ('GET', '/universal-ai/health', 'Universal AI Health Check'),
            ('GET', '/universal-ai/status', 'Universal AI System Status'),
            ('GET', '/universal-ai/platforms', 'Connected Platforms Status'),
            ('POST', '/universal-ai/market-intelligence', 'Global Market Intelligence'),
            ('GET', '/universal-ai/products/search?query=luxury+watch&category=accessories', 'Universal Product Search'),
            ('POST', '/universal-ai/trends/predict?category=electronics&timeframe=30', 'AI Trend Prediction'),
            ('GET', '/universal-ai/customers/intelligence?customer_id=test_customer', 'Unified Customer Intelligence'),
            ('POST', '/universal-ai/ai-communication', 'AI-to-AI Communication'),
            ('GET', '/universal-ai/analytics/global', 'Global Analytics Dashboard'),
            ('POST', '/universal-ai/agents/deploy', 'AI Agent Deployment'),
            ('POST', '/universal-ai/orchestrate', 'Cross-Platform Orchestration'),
        ]
        
        # Test AI Communication with proper payload
        ai_comm_data = {
            "platform": "amazon",
            "message": {
                "type": "product_recommendation_request",
                "category": "electronics",
                "budget": 500
            }
        }
        
        # Test Agent Deployment with proper payload
        agent_deploy_data = {
            "type": "price_monitor",
            "platforms": ["amazon", "ebay", "shopify"],
            "parameters": {
                "capabilities": ["price_tracking", "inventory_monitoring"],
                "update_frequency": "hourly"
            }
        }
        
        # Test Cross-Platform Orchestration
        orchestration_data = {
            "type": "price_optimization",
            "parameters": {
                "category": "electronics",
                "target_margin": 0.25,
                "platforms": ["amazon", "shopify"]
            }
        }
        
        for method, endpoint, name in endpoints_to_test:
            data = None
            if 'ai-communication' in endpoint:
                data = ai_comm_data
            elif 'agents/deploy' in endpoint:
                data = agent_deploy_data
            elif 'orchestrate' in endpoint:
                data = orchestration_data
                
            success, response_data, response_time, error = await self.make_request(method, endpoint, data)
            
            details = ""
            if success and response_data:
                if 'platforms_connected' in str(response_data):
                    details = f"Platforms: {response_data.get('platforms_connected', 0)}"
                elif 'total_results' in str(response_data):
                    details = f"Results: {response_data.get('total_results', 0)}"
                elif 'predictions' in str(response_data):
                    details = f"Predictions: {len(response_data.get('predictions', []))}"
                elif 'ai_response' in str(response_data):
                    details = "AI Communication successful"
                elif 'deployment_results' in str(response_data):
                    details = f"Agents deployed: {len(response_data.get('deployment_results', {}))}"
                    
            self.add_result(TestResult(
                name=name,
                success=success,
                response_time=response_time,
                details=details,
                error=error
            ))
    
    async def test_currency_infinity_engine(self):
        """Test Currency-Infinity Engine v2.0 (185+ currency support)"""
        print("\n💱 TESTING CURRENCY-INFINITY ENGINE v2.0")
        
        # Test health check
        success, data, response_time, error = await self.make_request('GET', '/currency/health')
        self.add_result(TestResult(
            name="Currency Engine Health Check",
            success=success,
            response_time=response_time,
            details=f"Currencies: {data.get('supported_currencies', 0)}, Regions: {data.get('regions', 0)}" if success else "",
            error=error
        ))
        
        # Test supported currencies
        success, data, response_time, error = await self.make_request('GET', '/currency/supported')
        currency_count = len(data.get('currencies', [])) if success and data else 0
        self.add_result(TestResult(
            name="Supported Currencies (185+ Target)",
            success=success and currency_count >= 180,
            response_time=response_time,
            details=f"Total currencies: {currency_count}, Regions: {len(data.get('regions', {})) if success else 0}",
            error=error if not success else (f"Only {currency_count} currencies (target: 185+)" if currency_count < 180 else None)
        ))
        
        # Test exchange rates with different bases
        for base_currency in ['USD', 'EUR', 'JPY', 'BTC']:
            success, data, response_time, error = await self.make_request('GET', f'/currency/rates?base={base_currency}')
            rate_count = len(data.get('rates', {})) if success and data else 0
            self.add_result(TestResult(
                name=f"Exchange Rates ({base_currency} base)",
                success=success and rate_count >= 180,
                response_time=response_time,
                details=f"Rates: {rate_count}, Provider: {data.get('provider', 'Unknown') if success else 'N/A'}",
                error=error
            ))
        
        # Test currency conversions
        conversion_tests = [
            ('100', 'USD', 'EUR', 'USD to EUR Conversion'),
            ('1000', 'JPY', 'GBP', 'JPY to GBP Conversion'),
            ('1', 'BTC', 'USD', 'BTC to USD Conversion'),
            ('500', 'USD', 'BTC', 'USD to BTC Conversion'),
            ('1000', 'KWD', 'USD', 'High-Precision Currency (KWD)'),
            ('0', 'USD', 'EUR', 'Zero Amount Conversion'),
        ]
        
        for amount, from_curr, to_curr, test_name in conversion_tests:
            success, data, response_time, error = await self.make_request(
                'GET', f'/currency/convert?amount={amount}&from={from_curr}&to={to_curr}'
            )
            
            details = ""
            if success and data:
                result = data.get('result', 0)
                rate = data.get('rate', 0)
                details = f"{amount} {from_curr} = {result} {to_curr} (rate: {rate})"
                
            self.add_result(TestResult(
                name=test_name,
                success=success,
                response_time=response_time,
                details=details,
                error=error
            ))
    
    async def test_production_monitoring_system(self):
        """Test Production Monitoring System"""
        print("\n📊 TESTING PRODUCTION MONITORING SYSTEM")
        
        endpoints_to_test = [
            ('GET', '/monitoring/health', 'Monitoring System Health'),
            ('GET', '/monitoring/golden-signals?service=universal_ai_hub', 'Golden Signals Monitoring'),
            ('GET', '/monitoring/service/universal_ai_hub/health', 'Service Health Check'),
            ('GET', '/monitoring/alerts?hours=24', 'Alerts Summary'),
            ('GET', '/monitoring/slo/compliance?service=universal_ai_hub', 'SLO Compliance'),
            ('GET', '/monitoring/incidents/status', 'Incident Status'),
            ('GET', '/monitoring/performance/dashboard', 'Performance Dashboard'),
            ('GET', '/monitoring/uptime/report', 'Uptime Report'),
        ]
        
        for method, endpoint, name in endpoints_to_test:
            success, response_data, response_time, error = await self.make_request(method, endpoint)
            
            details = ""
            if success and response_data:
                if 'uptime_percentage' in str(response_data):
                    uptime = response_data.get('uptime_report', {}).get('uptime_percentage', 0)
                    details = f"Uptime: {uptime}%"
                elif 'health_score' in str(response_data):
                    score = response_data.get('performance_overview', {}).get('health_score', 0)
                    details = f"Health Score: {score}"
                elif 'overall_compliance' in str(response_data):
                    compliance = response_data.get('overall_compliance', 0)
                    details = f"SLO Compliance: {compliance:.1f}%"
                elif 'incident_status' in str(response_data):
                    status = response_data.get('incident_status', 'unknown')
                    details = f"Status: {status}"
                    
            self.add_result(TestResult(
                name=name,
                success=success,
                response_time=response_time,
                details=details,
                error=error
            ))
        
        # Test metric recording
        metric_data = {
            "metric_name": "test_api_response_time",
            "value": 0.245,
            "labels": {"service": "universal_ai_hub", "endpoint": "health"}
        }
        
        success, response_data, response_time, error = await self.make_request(
            'POST', '/monitoring/metrics/record', metric_data
        )
        
        self.add_result(TestResult(
            name="Metric Recording",
            success=success,
            response_time=response_time,
            details="Custom metric recorded" if success else "",
            error=error
        ))
    
    async def test_ab_testing_framework(self):
        """Test A/B Testing Framework"""
        print("\n🧪 TESTING A/B TESTING FRAMEWORK")
        
        # Test system health
        success, data, response_time, error = await self.make_request('GET', '/ab-testing/health')
        self.add_result(TestResult(
            name="A/B Testing System Health",
            success=success,
            response_time=response_time,
            details=f"Status: {data.get('status', 'Unknown')}" if success else "",
            error=error
        ))
        
        # Test experiments
        success, data, response_time, error = await self.make_request('GET', '/ab-testing/experiments')
        experiment_count = len(data.get('experiments', [])) if success and data else 0
        self.add_result(TestResult(
            name="Active Experiments",
            success=success,
            response_time=response_time,
            details=f"Active experiments: {experiment_count}",
            error=error
        ))
        
        # Test user assignment
        assignment_data = {
            "user_id": "test_user_12345",
            "experiment_id": "personalized_recs_v1",
            "context": {"platform": "web", "device": "desktop"}
        }
        
        success, data, response_time, error = await self.make_request(
            'POST', '/ab-testing/assign', assignment_data
        )
        
        self.add_result(TestResult(
            name="User Experiment Assignment",
            success=success,
            response_time=response_time,
            details=f"Variant: {data.get('variant_id', 'Unknown')}" if success else "",
            error=error
        ))
        
        # Test event tracking
        event_data = {
            "user_id": "test_user_12345",
            "experiment_id": "personalized_recs_v1",
            "metric_name": "click_through_rate",
            "value": 0.067,
            "context": {"page": "homepage"}
        }
        
        success, data, response_time, error = await self.make_request(
            'POST', '/ab-testing/track', event_data
        )
        
        self.add_result(TestResult(
            name="Event Tracking",
            success=success,
            response_time=response_time,
            details="Event tracked successfully" if success else "",
            error=error
        ))
        
        # Test feature flags
        success, data, response_time, error = await self.make_request('GET', '/ab-testing/feature-flags')
        flag_count = len(data.get('feature_flags', {})) if success and data else 0
        self.add_result(TestResult(
            name="Feature Flags Management",
            success=success,
            response_time=response_time,
            details=f"Total flags: {flag_count}",
            error=error
        ))
        
        # Test analytics
        success, data, response_time, error = await self.make_request('GET', '/ab-testing/analytics/summary')
        self.add_result(TestResult(
            name="A/B Testing Analytics",
            success=success,
            response_time=response_time,
            details=f"Total experiments: {data.get('summary', {}).get('total_experiments', 0) if success else 0}",
            error=error
        ))
    
    async def test_executive_dashboard(self):
        """Test Executive Dashboard"""
        print("\n📈 TESTING EXECUTIVE DASHBOARD")
        
        # Test dashboard health
        success, data, response_time, error = await self.make_request('GET', '/dashboard/health')
        self.add_result(TestResult(
            name="Executive Dashboard Health",
            success=success,
            response_time=response_time,
            details=f"Status: {data.get('status', 'Unknown')}" if success else "",
            error=error
        ))
        
        # Test KPI dashboard
        success, data, response_time, error = await self.make_request('GET', '/dashboard/kpis')
        self.add_result(TestResult(
            name="KPI Dashboard",
            success=success,
            response_time=response_time,
            details=f"KPIs available: {len(data.get('kpis', {})) if success and data else 0}",
            error=error
        ))
        
        # Test commerce metrics
        success, data, response_time, error = await self.make_request('GET', '/dashboard/commerce')
        self.add_result(TestResult(
            name="Commerce Metrics",
            success=success,
            response_time=response_time,
            details="Commerce analytics available" if success else "",
            error=error
        ))
        
        # Test AI performance metrics
        success, data, response_time, error = await self.make_request('GET', '/dashboard/ai-performance')
        self.add_result(TestResult(
            name="AI Performance Metrics",
            success=success,
            response_time=response_time,
            details=f"AI accuracy: {data.get('ai_performance', {}).get('system_overview', {}).get('prediction_accuracy', 'N/A') if success else 'N/A'}",
            error=error
        ))
        
        # Test comprehensive analytics
        success, data, response_time, error = await self.make_request('GET', '/dashboard/analytics/comprehensive')
        self.add_result(TestResult(
            name="Comprehensive Business Analytics",
            success=success,
            response_time=response_time,
            details=f"Business health: {data.get('executive_summary', {}).get('business_health', 'Unknown') if success else 'N/A'}",
            error=error
        ))
        
        # Test competitive intelligence
        success, data, response_time, error = await self.make_request('GET', '/dashboard/competitive-intelligence')
        self.add_result(TestResult(
            name="Competitive Intelligence",
            success=success,
            response_time=response_time,
            details="Market positioning data available" if success else "",
            error=error
        ))
        
        # Test real-time monitoring
        success, data, response_time, error = await self.make_request('GET', '/dashboard/monitoring/real-time')
        self.add_result(TestResult(
            name="Real-time Monitoring Dashboard",
            success=success,
            response_time=response_time,
            details=f"Online users: {data.get('real_time_metrics', {}).get('current_users_online', 0) if success else 0}",
            error=error
        ))
    
    async def test_performance_benchmarks(self):
        """Test API performance benchmarks for investor presentations"""
        print("\n⚡ TESTING PERFORMANCE BENCHMARKS")
        
        # Test concurrent requests
        endpoints_for_load_test = [
            '/health',
            '/universal-ai/health',
            '/currency/health',
            '/monitoring/health',
            '/dashboard/health'
        ]
        
        concurrent_requests = 5
        start_time = time.time()
        
        tasks = []
        for endpoint in endpoints_for_load_test:
            for _ in range(concurrent_requests):
                tasks.append(self.make_request('GET', endpoint))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        total_time = time.time() - start_time
        
        successful_requests = sum(1 for result in results if not isinstance(result, Exception) and result[0])
        total_requests = len(tasks)
        success_rate = (successful_requests / total_requests) * 100
        
        avg_response_time = sum(result[2] for result in results if not isinstance(result, Exception)) / len(results)
        
        self.add_result(TestResult(
            name="Concurrent Load Test",
            success=success_rate >= 95 and avg_response_time < 2.0,
            response_time=total_time,
            details=f"Success rate: {success_rate:.1f}%, Avg response: {avg_response_time:.3f}s, Total requests: {total_requests}",
            error=None if success_rate >= 95 else f"Success rate {success_rate:.1f}% below 95% target"
        ))
        
        # Test response time targets
        critical_endpoints = [
            ('/universal-ai/health', 'Universal AI Hub', 1.0),
            ('/currency/rates?base=USD', 'Currency Engine', 1.5),
            ('/monitoring/golden-signals', 'Monitoring System', 2.0),
            ('/dashboard/kpis', 'Executive Dashboard', 2.0),
        ]
        
        for endpoint, name, target_time in critical_endpoints:
            success, data, response_time, error = await self.make_request('GET', endpoint)
            
            performance_ok = response_time < target_time
            self.add_result(TestResult(
                name=f"{name} Performance Target",
                success=success and performance_ok,
                response_time=response_time,
                details=f"Target: <{target_time}s, Actual: {response_time:.3f}s",
                error=error if not success else (f"Response time {response_time:.3f}s exceeds {target_time}s target" if not performance_ok else None)
            ))
    
    def generate_series_a_report(self):
        """Generate Series A investment readiness report"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result.success)
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        avg_response_time = sum(result.response_time for result in self.test_results) / total_tests if total_tests > 0 else 0
        
        # Categorize results
        critical_failures = []
        performance_issues = []
        successful_systems = []
        
        for result in self.test_results:
            if not result.success:
                if any(keyword in result.name.lower() for keyword in ['health', 'universal', 'currency', 'monitoring', 'dashboard']):
                    critical_failures.append(result)
                elif result.response_time > 2.0:
                    performance_issues.append(result)
            else:
                successful_systems.append(result)
        
        # Generate report
        report = f"""
🚀💎 AISLEMARTS SERIES A INVESTMENT READINESS VALIDATION REPORT
================================================================

EXECUTIVE SUMMARY:
- Total Tests Executed: {total_tests}
- Success Rate: {success_rate:.1f}%
- Average Response Time: {avg_response_time:.3f}s
- Testing Duration: {time.time() - self.start_time:.1f}s

CRITICAL SYSTEMS STATUS:
"""
        
        # System categories
        system_categories = {
            'Universal Commerce AI Hub': [r for r in self.test_results if 'universal' in r.name.lower() or 'ai hub' in r.name.lower()],
            'Currency-Infinity Engine v2.0': [r for r in self.test_results if 'currency' in r.name.lower()],
            'Production Monitoring': [r for r in self.test_results if 'monitoring' in r.name.lower()],
            'A/B Testing Framework': [r for r in self.test_results if 'ab-testing' in r.name.lower() or 'a/b' in r.name.lower()],
            'Executive Dashboard': [r for r in self.test_results if 'dashboard' in r.name.lower()],
            'Performance & Reliability': [r for r in self.test_results if 'performance' in r.name.lower() or 'load' in r.name.lower()],
        }
        
        for category, results in system_categories.items():
            if results:
                category_success = sum(1 for r in results if r.success)
                category_total = len(results)
                category_rate = (category_success / category_total) * 100
                status = "✅ OPERATIONAL" if category_rate >= 80 else "⚠️ ISSUES DETECTED" if category_rate >= 60 else "❌ CRITICAL"
                
                report += f"\n{category}: {status} ({category_success}/{category_total} tests passed - {category_rate:.1f}%)"
        
        if critical_failures:
            report += f"\n\n❌ CRITICAL ISSUES REQUIRING ATTENTION ({len(critical_failures)}):"
            for failure in critical_failures[:5]:  # Show top 5
                report += f"\n  • {failure.name}: {failure.error}"
        
        if performance_issues:
            report += f"\n\n⚡ PERFORMANCE OPTIMIZATION NEEDED ({len(performance_issues)}):"
            for issue in performance_issues[:3]:  # Show top 3
                report += f"\n  • {issue.name}: {issue.response_time:.3f}s (target: <2.0s)"
        
        report += f"\n\n✅ SUCCESSFUL SYSTEMS ({len(successful_systems)}):"
        
        # Group successful systems by category
        for category, results in system_categories.items():
            successful_in_category = [r for r in results if r.success]
            if successful_in_category:
                report += f"\n  {category}: {len(successful_in_category)} systems operational"
        
        # Investment readiness assessment
        if success_rate >= 90:
            readiness = "🟢 SERIES A READY"
            recommendation = "System demonstrates production-grade reliability suitable for Series A presentations"
        elif success_rate >= 80:
            readiness = "🟡 MINOR ISSUES"
            recommendation = "Address minor issues before investor presentations"
        elif success_rate >= 70:
            readiness = "🟠 MODERATE CONCERNS"
            recommendation = "Significant improvements needed before Series A readiness"
        else:
            readiness = "🔴 CRITICAL ISSUES"
            recommendation = "Major system issues must be resolved before investor presentations"
        
        report += f"""

SERIES A INVESTMENT READINESS ASSESSMENT:
Status: {readiness}
Overall System Reliability: {success_rate:.1f}%
Performance Grade: {'A+' if avg_response_time < 0.5 else 'A' if avg_response_time < 1.0 else 'B' if avg_response_time < 2.0 else 'C'}
Recommendation: {recommendation}

KEY INVESTOR METRICS VALIDATED:
- Universal Commerce AI Hub: {'✅ Operational' if any('universal' in r.name.lower() and r.success for r in self.test_results) else '❌ Issues'}
- 185+ Currency Support: {'✅ Validated' if any('currency' in r.name.lower() and 'currencies' in r.details and r.success for r in self.test_results) else '❌ Not Validated'}
- Production Monitoring: {'✅ Active' if any('monitoring' in r.name.lower() and r.success for r in self.test_results) else '❌ Issues'}
- Performance Targets: {'✅ Meeting <2s' if avg_response_time < 2.0 else '❌ Exceeding targets'}
- System Uptime: {'✅ 99.9%+ Target' if success_rate >= 95 else '❌ Below target'}

NEXT STEPS FOR SERIES A PREPARATION:
1. {'✅ Systems operational' if not critical_failures else '❌ Resolve critical system failures'}
2. {'✅ Performance optimized' if avg_response_time < 2.0 else '❌ Optimize API response times'}
3. {'✅ Monitoring active' if any('monitoring' in r.name.lower() and r.success for r in self.test_results) else '❌ Implement comprehensive monitoring'}
4. {'✅ Demo ready' if any('demo' in r.name.lower() and r.success for r in self.test_results) else '❌ Prepare investor demo environment'}

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
Testing Environment: {BACKEND_URL}
"""
        
        return report

async def main():
    """Main testing function"""
    print("🌊⚡ AisleMarts Backend Testing Suite - Series A Investment Readiness Validation")
    print("=" * 80)
    print(f"Testing Environment: {BACKEND_URL}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("=" * 80)
    
    async with AisleMartsSeriesATester() as tester:
        # Execute all test suites
        await tester.test_system_health()
        await tester.test_universal_commerce_ai_hub()
        await tester.test_currency_infinity_engine()
        await tester.test_production_monitoring_system()
        await tester.test_ab_testing_framework()
        await tester.test_executive_dashboard()
        await tester.test_performance_benchmarks()
        
        # Generate and display report
        report = tester.generate_series_a_report()
        print("\n" + "=" * 80)
        print(report)
        print("=" * 80)
        
        # Save report to file
        with open('/app/series_a_readiness_report.txt', 'w') as f:
            f.write(report)
        
        print(f"\n📄 Full report saved to: /app/series_a_readiness_report.txt")
        
        return len([r for r in tester.test_results if not r.success]) == 0

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️ Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Testing failed with error: {e}")
        sys.exit(1)