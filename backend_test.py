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
    
    async def test_universal_ai_health(self):
        """Test Universal AI health endpoint"""
        print("\n🏥 Testing Universal AI Health Check...")
        
        result = await self.test_endpoint("GET", "/universal-ai/health")
        
        if result["success"]:
            data = result["data"]
            capabilities = data.get("capabilities", [])
            platforms_connected = data.get("platforms_connected", 0)
            ai_agents_active = data.get("ai_agents_active", 0)
            
            details = f"Service operational, {platforms_connected} platforms, {ai_agents_active} AI agents, {len(capabilities)} capabilities"
            self.log_test("Universal AI Health Check", True, details, result["response_time"])
            
            # Validate expected capabilities
            expected_capabilities = [
                "universal_product_discovery",
                "cross_platform_intelligence", 
                "global_trend_prediction",
                "ai_to_ai_communication"
            ]
            
            missing_capabilities = [cap for cap in expected_capabilities if cap not in capabilities]
            if missing_capabilities:
                self.log_test("Universal AI Capabilities Check", False, f"Missing: {missing_capabilities}", 0)
            else:
                self.log_test("Universal AI Capabilities Check", True, f"All {len(expected_capabilities)} core capabilities present", 0)
        else:
            self.log_test("Universal AI Health Check", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
    
    async def test_platforms_info(self):
        """Test platforms information endpoint"""
        print("\n🌐 Testing Platforms Information...")
        
        result = await self.test_endpoint("GET", "/universal-ai/platforms")
        
        if result["success"]:
            data = result["data"]
            total_platforms = data.get("total_platforms", 0)
            connected_platforms = data.get("connected_platforms", 0)
            platforms = data.get("platforms", {})
            
            details = f"{connected_platforms}/{total_platforms} platforms connected"
            self.log_test("Platforms Information", True, details, result["response_time"])
            
            # Test platform details
            if platforms:
                sample_platform = list(platforms.keys())[0]
                platform_data = platforms[sample_platform]
                required_fields = ["status", "capabilities", "rate_limit"]
                
                missing_fields = [field for field in required_fields if field not in platform_data]
                if missing_fields:
                    self.log_test("Platform Data Structure", False, f"Missing fields: {missing_fields}", 0)
                else:
                    self.log_test("Platform Data Structure", True, f"All required fields present for {sample_platform}", 0)
            else:
                self.log_test("Platform Data Structure", False, "No platform data available", 0)
        else:
            self.log_test("Platforms Information", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
    
    async def test_market_intelligence(self):
        """Test market intelligence collection"""
        print("\n📊 Testing Market Intelligence Collection...")
        
        result = await self.test_endpoint("POST", "/universal-ai/market-intelligence")
        
        if result["success"]:
            data = result["data"]
            platforms_analyzed = data.get("platforms_analyzed", 0)
            categories_covered = data.get("categories_covered", [])
            global_avg_price = data.get("global_avg_price", 0)
            
            details = f"{platforms_analyzed} platforms analyzed, {len(categories_covered)} categories, avg price: ${global_avg_price:.2f}"
            self.log_test("Market Intelligence Collection", True, details, result["response_time"])
            
            # Validate intelligence structure
            if "detailed_intelligence" in data and "ai_insights" in data:
                self.log_test("Market Intelligence Structure", True, "Complete intelligence data structure", 0)
            else:
                self.log_test("Market Intelligence Structure", False, "Missing intelligence data fields", 0)
        else:
            self.log_test("Market Intelligence Collection", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
    
    async def test_universal_product_search(self):
        """Test universal product search across platforms"""
        print("\n🔍 Testing Universal Product Search...")
        
        # Test basic search
        result = await self.test_endpoint("GET", "/universal-ai/products/search?query=smartphone")
        
        if result["success"]:
            data = result["data"]
            total_results = data.get("total_results", 0)
            platforms_searched = data.get("platforms_searched", 0)
            top_results = data.get("top_results", [])
            
            details = f"{total_results} products found across {platforms_searched} platforms"
            self.log_test("Universal Product Search", True, details, result["response_time"])
            
            # Validate search results structure
            if top_results and len(top_results) > 0:
                sample_product = top_results[0]
                required_fields = ["title", "price", "currency", "platform"]
                missing_fields = [field for field in required_fields if field not in sample_product]
                
                if missing_fields:
                    self.log_test("Product Search Results Structure", False, f"Missing fields: {missing_fields}", 0)
                else:
                    self.log_test("Product Search Results Structure", True, f"Complete product data structure", 0)
            else:
                self.log_test("Product Search Results Structure", False, "No search results returned", 0)
        else:
            self.log_test("Universal Product Search", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
        
        # Test search with filters
        result = await self.test_endpoint("GET", "/universal-ai/products/search?query=laptop&category=electronics&min_price=500&max_price=2000")
        
        if result["success"]:
            data = result["data"]
            filters_applied = data.get("filters_applied", {})
            
            expected_filters = ["category", "min_price", "max_price"]
            applied_filters = list(filters_applied.keys())
            
            if all(f in applied_filters for f in expected_filters):
                self.log_test("Product Search with Filters", True, f"Filters applied: {applied_filters}", result["response_time"])
            else:
                self.log_test("Product Search with Filters", False, f"Missing filters: {set(expected_filters) - set(applied_filters)}", result["response_time"])
        else:
            self.log_test("Product Search with Filters", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
    
    async def test_trend_prediction(self):
        """Test AI-powered trend prediction"""
        print("\n🔮 Testing AI Trend Prediction...")
        
        # Test basic trend prediction
        result = await self.test_endpoint("POST", "/universal-ai/trends/predict?category=electronics&timeframe=30")
        
        if result["success"]:
            data = result["data"]
            ai_model_info = data.get("ai_model_info", {})
            predictions = data.get("predictions", [])
            key_insights = data.get("key_insights", [])
            
            model_accuracy = ai_model_info.get("accuracy", 0)
            details = f"Model accuracy: {model_accuracy:.2%}, {len(predictions)} predictions, {len(key_insights)} insights"
            self.log_test("AI Trend Prediction", True, details, result["response_time"])
            
            # Validate prediction structure
            if predictions and len(predictions) > 0:
                sample_prediction = predictions[0]
                required_fields = ["date", "predicted_growth", "confidence"]
                missing_fields = [field for field in required_fields if field not in sample_prediction]
                
                if missing_fields:
                    self.log_test("Trend Prediction Structure", False, f"Missing fields: {missing_fields}", 0)
                else:
                    self.log_test("Trend Prediction Structure", True, "Complete prediction data structure", 0)
            else:
                self.log_test("Trend Prediction Structure", False, "No predictions returned", 0)
        else:
            self.log_test("AI Trend Prediction", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
    
    async def test_cross_platform_orchestration(self):
        """Test cross-platform operation orchestration"""
        print("\n🎯 Testing Cross-Platform Orchestration...")
        
        # Test price sync operation
        operation_data = {
            "type": "price_sync",
            "parameters": {
                "products": ["product_1", "product_2"],
                "target_margin": 0.15
            }
        }
        
        result = await self.test_endpoint("POST", "/universal-ai/orchestrate", operation_data)
        
        if result["success"]:
            data = result["data"]
            execution_result = data.get("execution_result", {})
            platforms_affected = execution_result.get("platforms_affected", 0)
            
            details = f"Operation executed across {platforms_affected} platforms"
            self.log_test("Cross-Platform Orchestration", True, details, result["response_time"])
            
            # Validate orchestration result
            if "orchestration_id" in data and "execution_result" in data:
                self.log_test("Orchestration Response Structure", True, "Complete orchestration response", 0)
            else:
                self.log_test("Orchestration Response Structure", False, "Missing orchestration response fields", 0)
        else:
            self.log_test("Cross-Platform Orchestration", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
        
        # Test invalid operation
        invalid_operation = {"type": "invalid_operation"}
        result = await self.test_endpoint("POST", "/universal-ai/orchestrate", invalid_operation)
        
        if result["status_code"] == 500:  # Expecting error for invalid operation
            self.log_test("Invalid Operation Handling", True, "Properly rejected invalid operation", result["response_time"])
        else:
            self.log_test("Invalid Operation Handling", False, f"Unexpected response: {result['status_code']}", result["response_time"])
    
    async def test_customer_intelligence(self):
        """Test unified customer intelligence"""
        print("\n👤 Testing Unified Customer Intelligence...")
        
        result = await self.test_endpoint("GET", "/universal-ai/customers/intelligence")
        
        if result["success"]:
            data = result["data"]
            intelligence = data.get("intelligence", {})
            data_sources = data.get("data_sources", 0)
            ai_recommendations = data.get("ai_recommendations", [])
            
            details = f"{data_sources} data sources, {len(ai_recommendations)} AI recommendations"
            self.log_test("Unified Customer Intelligence", True, details, result["response_time"])
            
            # Validate intelligence structure
            expected_sections = ["customer_segments", "cross_platform_behavior", "ai_insights"]
            missing_sections = [section for section in expected_sections if section not in intelligence]
            
            if missing_sections:
                self.log_test("Customer Intelligence Structure", False, f"Missing sections: {missing_sections}", 0)
            else:
                self.log_test("Customer Intelligence Structure", True, "Complete intelligence structure", 0)
        else:
            self.log_test("Unified Customer Intelligence", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
    
    async def test_ai_communication(self):
        """Test AI-to-AI platform communication"""
        print("\n🤖 Testing AI-to-AI Communication...")
        
        # Test valid AI communication
        communication_data = {
            "platform": "amazon",
            "message": {
                "type": "optimization_request",
                "data": {
                    "category": "electronics",
                    "optimization_type": "pricing"
                }
            }
        }
        
        result = await self.test_endpoint("POST", "/universal-ai/ai-communication", communication_data)
        
        if result["success"]:
            data = result["data"]
            ai_response = data.get("ai_response", {})
            communication_status = data.get("communication_status", "")
            
            details = f"Communication {communication_status} with {communication_data['platform']}"
            self.log_test("AI-to-AI Communication", True, details, result["response_time"])
            
            # Validate AI response structure
            if "ai_response" in ai_response and "recommendations" in ai_response.get("ai_response", {}):
                self.log_test("AI Communication Response Structure", True, "Complete AI response structure", 0)
            else:
                self.log_test("AI Communication Response Structure", False, "Missing AI response fields", 0)
        else:
            self.log_test("AI-to-AI Communication", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
        
        # Test communication with non-existent platform
        invalid_communication = {
            "platform": "non_existent_platform",
            "message": {"type": "test"}
        }
        
        result = await self.test_endpoint("POST", "/universal-ai/ai-communication", invalid_communication, expected_status=404)
        
        if result["status_code"] == 404:
            self.log_test("Invalid Platform Communication", True, "Properly rejected non-existent platform", result["response_time"])
        else:
            self.log_test("Invalid Platform Communication", False, f"Unexpected response: {result['status_code']}", result["response_time"])
    
    async def test_global_analytics(self):
        """Test comprehensive global analytics"""
        print("\n📈 Testing Global Analytics...")
        
        result = await self.test_endpoint("GET", "/universal-ai/analytics/global")
        
        if result["success"]:
            data = result["data"]
            analytics = data.get("analytics", {})
            recommendations = data.get("recommendations", [])
            
            # Check analytics sections
            expected_sections = ["global_metrics", "platform_performance", "market_insights", "ai_performance"]
            missing_sections = [section for section in expected_sections if section not in analytics]
            
            if missing_sections:
                self.log_test("Global Analytics", False, f"Missing sections: {missing_sections}", result["response_time"])
            else:
                global_metrics = analytics.get("global_metrics", {})
                total_products = global_metrics.get("total_products_tracked", 0)
                platforms_monitored = global_metrics.get("platforms_monitored", 0)
                
                details = f"{total_products:,} products tracked, {platforms_monitored} platforms monitored, {len(recommendations)} recommendations"
                self.log_test("Global Analytics", True, details, result["response_time"])
                
                # Validate performance metrics
                ai_performance = analytics.get("ai_performance", {})
                if "prediction_models_accuracy" in ai_performance:
                    self.log_test("AI Performance Metrics", True, "AI performance metrics available", 0)
                else:
                    self.log_test("AI Performance Metrics", False, "Missing AI performance metrics", 0)
        else:
            self.log_test("Global Analytics", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
    
    async def test_ai_agent_deployment(self):
        """Test AI agent deployment"""
        print("\n🚀 Testing AI Agent Deployment...")
        
        agent_config = {
            "type": "price_monitor",
            "platforms": ["amazon", "alibaba", "shopify"],
            "parameters": {
                "capabilities": ["real_time_monitoring", "price_alerts", "trend_analysis"],
                "monitoring_interval": 300
            }
        }
        
        result = await self.test_endpoint("POST", "/universal-ai/agents/deploy", agent_config)
        
        if result["success"]:
            data = result["data"]
            deployment_results = data.get("deployment_results", {})
            platforms_targeted = data.get("platforms_targeted", [])
            
            successful_deployments = sum(1 for r in deployment_results.values() if r.get("status") == "deployed")
            details = f"{successful_deployments}/{len(platforms_targeted)} agents deployed successfully"
            self.log_test("AI Agent Deployment", True, details, result["response_time"])
            
            # Validate deployment structure
            if "deployment_id" in data and "monitoring_enabled" in data:
                self.log_test("Agent Deployment Structure", True, "Complete deployment response", 0)
            else:
                self.log_test("Agent Deployment Structure", False, "Missing deployment response fields", 0)
        else:
            self.log_test("AI Agent Deployment", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
    
    async def test_system_status(self):
        """Test system status endpoint"""
        print("\n⚡ Testing System Status...")
        
        result = await self.test_endpoint("GET", "/universal-ai/status")
        
        if result["success"]:
            data = result["data"]
            system_name = data.get("system_name", "")
            status = data.get("status", "")
            platforms_connected = data.get("platforms_connected", 0)
            ai_agents_deployed = data.get("ai_agents_deployed", 0)
            
            details = f"Status: {status}, {platforms_connected} platforms, {ai_agents_deployed} AI agents"
            self.log_test("System Status", True, details, result["response_time"])
            
            # Validate performance metrics
            performance_metrics = data.get("performance_metrics", {})
            if performance_metrics:
                self.log_test("Performance Metrics", True, f"Performance data available", 0)
            else:
                self.log_test("Performance Metrics", False, "Missing performance metrics", 0)
        else:
            self.log_test("System Status", False, f"HTTP {result['status_code']}: {result['data']}", result["response_time"])
    
    async def test_error_handling(self):
        """Test error handling and edge cases"""
        print("\n🛡️ Testing Error Handling...")
        
        # Test missing required parameters
        result = await self.test_endpoint("POST", "/universal-ai/orchestrate", {}, expected_status=400)
        
        if result["status_code"] == 400:
            self.log_test("Missing Parameters Handling", True, "Properly rejected missing parameters", result["response_time"])
        else:
            self.log_test("Missing Parameters Handling", False, f"Unexpected response: {result['status_code']}", result["response_time"])
        
        # Test invalid JSON
        try:
            url = f"{API_BASE}/universal-ai/ai-communication"
            async with self.session.post(url, data="invalid json") as response:
                if response.status in [400, 422]:
                    self.log_test("Invalid JSON Handling", True, "Properly rejected invalid JSON", 0)
                else:
                    self.log_test("Invalid JSON Handling", False, f"Unexpected response: {response.status}", 0)
        except Exception as e:
            self.log_test("Invalid JSON Handling", False, f"Exception: {str(e)}", 0)
    
    async def test_performance(self):
        """Test system performance"""
        print("\n⚡ Testing Performance...")
        
        # Test concurrent requests
        tasks = []
        for i in range(5):
            task = self.test_endpoint("GET", "/universal-ai/health")
            tasks.append(task)
        
        start_time = time.time()
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        successful_requests = sum(1 for r in results if r["success"])
        avg_response_time = sum(r["response_time"] for r in results) / len(results)
        
        if successful_requests == len(tasks) and avg_response_time < 5.0:
            details = f"{successful_requests}/{len(tasks)} requests successful, avg: {avg_response_time:.2f}s"
            self.log_test("Concurrent Requests Performance", True, details, total_time)
        else:
            details = f"{successful_requests}/{len(tasks)} requests successful, avg: {avg_response_time:.2f}s"
            self.log_test("Concurrent Requests Performance", False, details, total_time)
    
    async def run_all_tests(self):
        """Run all Universal Commerce AI Hub tests"""
        await self.setup()
        
        try:
            # Core system tests
            await self.test_universal_ai_health()
            await self.test_system_status()
            await self.test_platforms_info()
            
            # AI functionality tests
            await self.test_market_intelligence()
            await self.test_universal_product_search()
            await self.test_trend_prediction()
            await self.test_cross_platform_orchestration()
            await self.test_customer_intelligence()
            await self.test_ai_communication()
            await self.test_global_analytics()
            await self.test_ai_agent_deployment()
            
            # System reliability tests
            await self.test_error_handling()
            await self.test_performance()
            
        finally:
            await self.cleanup()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("🏆 UNIVERSAL COMMERCE AI HUB TEST SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"📊 Total Tests: {self.total_tests}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.total_tests - self.passed_tests}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        print(f"\n🎯 TEST RESULTS:")
        for result in self.test_results:
            print(f"{result['status']} | {result['test']} | {result['response_time']} | {result['details']}")
        
        # Categorize results
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        critical_tests = [
            "Universal AI Health Check",
            "Universal Product Search", 
            "AI Trend Prediction",
            "Cross-Platform Orchestration"
        ]
        
        critical_failures = [t for t in failed_tests if t['test'] in critical_tests]
        if critical_failures:
            print(f"\n🚨 CRITICAL FAILURES ({len(critical_failures)}):")
            for test in critical_failures:
                print(f"   • {test['test']}: {test['details']}")
        
        print("\n" + "=" * 80)
        
        if success_rate >= 80:
            print("🎉 UNIVERSAL COMMERCE AI HUB: PRODUCTION READY")
        elif success_rate >= 60:
            print("⚠️ UNIVERSAL COMMERCE AI HUB: NEEDS ATTENTION")
        else:
            print("🚨 UNIVERSAL COMMERCE AI HUB: CRITICAL ISSUES")
        
        print("=" * 80)

async def main():
    """Main test execution"""
    tester = UniversalCommerceAITester()
    await tester.run_all_tests()
    tester.print_summary()

if __name__ == "__main__":
    asyncio.run(main())