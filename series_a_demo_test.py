#!/usr/bin/env python3
"""
🏆💎 SERIES A INVESTOR DEMO SCENARIOS
Comprehensive validation of production-hardened features for investor demonstrations
"""

import asyncio
import aiohttp
import json
import time
import uuid
from datetime import datetime

BASE_URL = "https://aislemart-shop.preview.emergentagent.com/api"

class SeriesADemoValidator:
    def __init__(self):
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={"Content-Type": "application/json"}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "response_time": response_time
        })
        print(f"{status} {name} ({response_time:.3f}s): {details}")

    async def test_request(self, method: str, endpoint: str, data: dict = None) -> tuple:
        """Make HTTP request and measure response time"""
        start = time.time()
        try:
            url = f"{BASE_URL}{endpoint}"
            if method.upper() == "GET":
                async with self.session.get(url, params=data) as response:
                    response_time = time.time() - start
                    response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                    return response.status, response_data, response_time
            elif method.upper() == "POST":
                async with self.session.post(url, json=data) as response:
                    response_time = time.time() - start
                    response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                    return response.status, response_data, response_time
        except Exception as e:
            response_time = time.time() - start
            return 500, {"error": str(e)}, response_time

    async def test_luxury_commerce_scenario(self):
        """Test high-value luxury transactions with proper commission calculation"""
        print("\n💎 LUXURY COMMERCE SCENARIOS")
        
        # Luxury Fashion Scenario - High-value trench coat
        luxury_user = f"luxury_vip_{uuid.uuid4().hex[:8]}"
        
        # Create impression and CTA for luxury item
        await self.test_request("POST", "/track/impression", {
            "storyId": "luxefashion_story_1", "userId": luxury_user
        })
        
        await self.test_request("POST", "/track/cta", {
            "storyId": "luxefashion_story_1", "productId": "trench-coat", "userId": luxury_user
        })
        
        # High-value luxury purchase
        luxury_order = f"luxury_order_{uuid.uuid4().hex[:8]}"
        status, data, rt = await self.test_request("POST", "/track/purchase", {
            "orderId": luxury_order,
            "userId": luxury_user,
            "productId": "trench-coat",
            "amount": 2399.00,  # High-value luxury item
            "currency": "USD",
            "referrerStoryId": "luxefashion_story_1"
        })
        
        if status == 200:
            commission = data.get("commission", 0)
            expected_commission = 2399.00 * 0.12  # Gold tier 12%
            commission_accurate = abs(commission - expected_commission) < 0.01
            
            details = f"Luxury purchase: ${commission:.2f} commission on ${2399.00} (Gold tier 12%)"
            success = commission_accurate and commission > 200  # Significant commission
        else:
            success = False
            details = f"Luxury purchase failed: {status}"
        
        self.log_test("Luxury Commerce: High-Value Transaction", success, details, rt)

    async def test_global_markets_scenario(self):
        """Test multi-currency transactions across global markets"""
        print("\n🌍 GLOBAL MARKETS SCENARIOS")
        
        global_scenarios = [
            ("EUR", 1899.00, "European Luxury Market", "luxefashion"),
            ("GBP", 1599.00, "UK Premium Market", "beautyqueen"), 
            ("JPY", 299000, "Japanese High-End Market", "techguru"),
        ]
        
        for currency, amount, market_name, creator_id in global_scenarios:
            global_user = f"global_{currency}_{uuid.uuid4().hex[:8]}"
            story_id = f"{creator_id}_story_1"
            
            # Create attribution chain
            await self.test_request("POST", "/track/impression", {
                "storyId": story_id, "userId": global_user
            })
            
            await self.test_request("POST", "/track/cta", {
                "storyId": story_id, "productId": "smartwatch-pro", "userId": global_user
            })
            
            # Global market purchase
            global_order = f"global_{currency}_{uuid.uuid4().hex[:8]}"
            status, data, rt = await self.test_request("POST", "/track/purchase", {
                "orderId": global_order,
                "userId": global_user,
                "productId": "smartwatch-pro",
                "amount": amount,
                "currency": currency,
                "referrerStoryId": story_id
            })
            
            if status == 200:
                returned_currency = data.get("currency")
                commission_usd = data.get("commissionUsd", 0)
                fx_rate = data.get("fxRateUsd", 0)
                
                currency_correct = returned_currency == currency
                has_usd_conversion = commission_usd > 0
                has_fx_rate = fx_rate > 0
                
                success = currency_correct and has_usd_conversion and has_fx_rate
                details = f"{market_name}: {currency} {amount} -> ${commission_usd:.2f} USD (FX: {fx_rate})"
            else:
                success = False
                details = f"{market_name} failed: {status}"
            
            self.log_test(f"Global Markets: {market_name}", success, details, rt)

    async def test_scale_validation_scenario(self):
        """Test concurrent transaction handling and performance at scale"""
        print("\n🚀 SCALE VALIDATION SCENARIOS")
        
        # Concurrent high-volume transactions
        async def create_concurrent_purchase(i):
            user_id = f"scale_user_{i}_{uuid.uuid4().hex[:8]}"
            order_id = f"scale_order_{i}_{uuid.uuid4().hex[:8]}"
            
            # Random creator and product for diversity
            creators = ["luxefashion", "techguru", "fitnessjane", "beautyqueen"]
            products = ["trench-coat", "smartwatch-pro", "yoga-mat", "silk-scarf"]
            amounts = [239.00, 299.00, 49.99, 89.00]
            
            creator = creators[i % len(creators)]
            product = products[i % len(products)]
            amount = amounts[i % len(amounts)]
            
            # Create CTA for attribution
            await self.test_request("POST", "/track/cta", {
                "storyId": f"{creator}_story_1", "productId": product, "userId": user_id
            })
            
            # Make purchase
            start = time.time()
            status, data, rt = await self.test_request("POST", "/track/purchase", {
                "orderId": order_id,
                "userId": user_id,
                "productId": product,
                "amount": amount,
                "currency": "USD",
                "referrerStoryId": f"{creator}_story_1"
            })
            
            return {
                "success": status == 200,
                "response_time": rt,
                "commission": data.get("commission", 0) if status == 200 else 0
            }
        
        # Execute 50 concurrent transactions
        start_time = time.time()
        tasks = [create_concurrent_purchase(i) for i in range(50)]
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        successful_transactions = sum(1 for r in results if r["success"])
        avg_response_time = sum(r["response_time"] for r in results) / len(results)
        total_commission = sum(r["commission"] for r in results)
        
        # Scale validation criteria
        success_rate = (successful_transactions / 50) * 100
        performance_acceptable = avg_response_time < 0.5  # Under 500ms average
        volume_handled = successful_transactions >= 45  # 90%+ success rate
        
        scale_success = success_rate >= 90 and performance_acceptable and volume_handled
        details = f"50 concurrent: {successful_transactions}/50 success ({success_rate:.1f}%), {avg_response_time*1000:.1f}ms avg, ${total_commission:.2f} total commission"
        
        self.log_test("Scale Validation: Concurrent Transactions", scale_success, details, total_time)

    async def test_error_resilience_scenario(self):
        """Test graceful handling of invalid requests and edge cases"""
        print("\n🛡️ ERROR RESILIENCE SCENARIOS")
        
        # Test various error scenarios that should be handled gracefully
        error_scenarios = [
            # Malformed requests
            ("POST", "/track/purchase", {"invalid": "data"}, "Malformed purchase request"),
            ("POST", "/track/cta", {"storyId": "nonexistent_story"}, "Nonexistent story reference"),
            ("GET", "/stories", {"limit": "not_a_number"}, "Invalid parameter type"),
            
            # Edge case amounts
            ("POST", "/track/purchase", {
                "orderId": f"edge_{uuid.uuid4().hex[:8]}",
                "userId": "edge_user",
                "productId": "test_product",
                "amount": 0.01,  # Very small amount
                "currency": "USD"
            }, "Minimal amount purchase"),
            
            # Boundary testing
            ("GET", "/stories", {"limit": 1}, "Minimum limit boundary"),
            ("GET", "/stories", {"limit": 100}, "Maximum limit boundary"),
        ]
        
        resilience_score = 0
        total_scenarios = len(error_scenarios)
        
        for method, endpoint, data, description in error_scenarios:
            status, response, rt = await self.test_request(method, endpoint, data)
            
            # Error resilience means proper error codes (4xx) or successful handling
            resilient = (400 <= status < 500) or status == 200
            
            if resilient:
                resilience_score += 1
            
            details = f"Status: {status} ({'Resilient' if resilient else 'Not resilient'})"
            self.log_test(f"Error Resilience: {description}", resilient, details, rt)
        
        # Overall resilience assessment
        resilience_percentage = (resilience_score / total_scenarios) * 100
        overall_resilient = resilience_percentage >= 80
        
        self.log_test("Overall Error Resilience", overall_resilient, 
                     f"{resilience_score}/{total_scenarios} scenarios handled gracefully ({resilience_percentage:.1f}%)")

    async def test_real_time_analytics_scenario(self):
        """Test live commerce dashboard with accurate conversion rates"""
        print("\n📊 REAL-TIME ANALYTICS SCENARIOS")
        
        # Create controlled test data for analytics validation
        analytics_user = f"analytics_test_{uuid.uuid4().hex[:8]}"
        
        # Create a complete funnel: impression -> CTA -> purchase
        await self.test_request("POST", "/track/impression", {
            "storyId": "luxefashion_story_1", "userId": analytics_user
        })
        
        await self.test_request("POST", "/track/cta", {
            "storyId": "luxefashion_story_1", "productId": "trench-coat", "userId": analytics_user
        })
        
        purchase_order = f"analytics_order_{uuid.uuid4().hex[:8]}"
        await self.test_request("POST", "/track/purchase", {
            "orderId": purchase_order,
            "userId": analytics_user,
            "productId": "trench-coat",
            "amount": 239.00,
            "currency": "USD",
            "referrerStoryId": "luxefashion_story_1"
        })
        
        # Test real-time analytics
        status, analytics, rt = await self.test_request("GET", "/commerce/analytics")
        
        if status == 200:
            summary = analytics.get("summary", {})
            creator_stats = analytics.get("creatorStats", {})
            currency_breakdown = analytics.get("currencyBreakdown", {})
            
            # Validate analytics completeness
            has_summary = all(key in summary for key in [
                "totalImpressions", "totalCTAs", "totalPurchases", 
                "totalRevenue", "conversionRate"
            ])
            
            has_creator_data = len(creator_stats) > 0
            has_currency_data = len(currency_breakdown) > 0
            
            # Validate conversion rate calculation
            ctas = summary.get("totalCTAs", 0)
            purchases = summary.get("totalPurchases", 0)
            reported_rate = summary.get("conversionRate", 0)
            
            if ctas > 0:
                expected_rate = (purchases / ctas) * 100
                rate_accurate = abs(reported_rate - expected_rate) <= 1.0  # 1% tolerance
            else:
                rate_accurate = True
            
            analytics_complete = has_summary and has_creator_data and has_currency_data and rate_accurate
            details = f"Summary: ✓, Creators: {len(creator_stats)}, Currencies: {len(currency_breakdown)}, Rate: {reported_rate:.1f}%"
        else:
            analytics_complete = False
            details = f"Analytics API failed: {status}"
        
        self.log_test("Real-Time Analytics Dashboard", analytics_complete, details, rt)

    async def run_series_a_demo_validation(self):
        """Run comprehensive Series A investor demo scenarios"""
        print("🏆💎 SERIES A INVESTOR DEMO SCENARIOS VALIDATION")
        print("=" * 70)
        
        await self.test_luxury_commerce_scenario()
        await self.test_global_markets_scenario()
        await self.test_scale_validation_scenario()
        await self.test_error_resilience_scenario()
        await self.test_real_time_analytics_scenario()
        
        # Generate Series A demo report
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print("\n" + "=" * 70)
        print("🏆 SERIES A INVESTOR DEMO VALIDATION RESULTS")
        print("=" * 70)
        print(f"📊 DEMO READINESS: {success_rate:.1f}% ({passed_tests}/{total_tests} scenarios passed)")
        
        # Demo scenario categories
        scenario_categories = {
            "Luxury Commerce": [r for r in self.test_results if "Luxury Commerce" in r["name"]],
            "Global Markets": [r for r in self.test_results if "Global Markets" in r["name"]],
            "Scale Validation": [r for r in self.test_results if "Scale Validation" in r["name"]],
            "Error Resilience": [r for r in self.test_results if "Error Resilience" in r["name"]],
            "Real-Time Analytics": [r for r in self.test_results if "Real-Time Analytics" in r["name"]]
        }
        
        print(f"\n📈 DEMO SCENARIO BREAKDOWN:")
        for category, tests in scenario_categories.items():
            if tests:
                category_success = sum(1 for t in tests if t["success"]) / len(tests) * 100
                status_icon = "✅" if category_success >= 90 else "⚠️" if category_success >= 70 else "❌"
                print(f"   {status_icon} {category}: {category_success:.1f}% ({sum(1 for t in tests if t['success'])}/{len(tests)})")
        
        # Overall Series A readiness
        demo_ready = success_rate >= 95
        print(f"\n🎯 SERIES A INVESTOR DEMO: {'✅ READY' if demo_ready else '❌ NEEDS WORK'}")
        
        if demo_ready:
            print("   • ✅ Luxury commerce transactions validated")
            print("   • ✅ Global multi-currency markets operational")
            print("   • ✅ Scale and performance validated")
            print("   • ✅ Error resilience confirmed")
            print("   • ✅ Real-time analytics dashboard ready")
        else:
            failed_tests = [r for r in self.test_results if not r["success"]]
            print(f"   • ❌ {len(failed_tests)} scenarios need attention")
            for test in failed_tests[:3]:  # Show first 3 failures
                print(f"     - {test['name']}: {test['details']}")
        
        print("=" * 70)
        return demo_ready

async def main():
    """Main Series A demo validation execution"""
    async with SeriesADemoValidator() as validator:
        success = await validator.run_series_a_demo_validation()
        return success

if __name__ == "__main__":
    asyncio.run(main())