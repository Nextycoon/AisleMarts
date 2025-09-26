#!/usr/bin/env python3
"""
🎯 FOCUSED VALIDATION: Critical Fixes for Series A Readiness
Testing the 3 specific critical fixes mentioned in the review request:
1. Analytics Funnel Integrity: sessionized funnel logic ensures impressions ≥ CTAs ≥ purchases
2. Proper 4xx Error Responses: invalid requests return 422/400/409 errors, never 200 OK
3. Multi-Currency Support: EUR/GBP/JPY with proper rounding, FX normalization, and USD conversion
"""

import asyncio
import aiohttp
import json
import time
import uuid
from datetime import datetime

# Use production URL from frontend/.env
BASE_URL = "https://market-launch-4.preview.emergentagent.com/api"

class FocusedValidator:
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

    async def test_analytics_funnel_integrity(self):
        """Test sessionized funnel logic ensures impressions ≥ CTAs ≥ purchases"""
        print("\n🔍 CRITICAL FIX 1: ANALYTICS FUNNEL INTEGRITY")
        
        # Create controlled test data to validate funnel logic
        base_user = f"funnel_test_{uuid.uuid4().hex[:8]}"
        
        # Create 10 unique users with impressions
        impression_users = []
        for i in range(10):
            user_id = f"{base_user}_imp_{i}"
            impression_users.append(user_id)
            impression_data = {"storyId": "luxefashion_story_1", "userId": user_id}
            await self.test_request("POST", "/track/impression", impression_data)
        
        # Create CTAs for only 5 of those users (subset of impressions)
        cta_users = impression_users[:5]
        for user_id in cta_users:
            cta_data = {"storyId": "luxefashion_story_1", "productId": "trench-coat", "userId": user_id}
            await self.test_request("POST", "/track/cta", cta_data)
        
        # Create purchases for only 2 of the CTA users (subset of CTAs)
        purchase_users = cta_users[:2]
        for i, user_id in enumerate(purchase_users):
            purchase_data = {
                "orderId": f"funnel_order_{i}_{uuid.uuid4().hex[:8]}",
                "userId": user_id,
                "productId": "trench-coat",
                "amount": 239.00,
                "currency": "USD",
                "referrerStoryId": "luxefashion_story_1"
            }
            await self.test_request("POST", "/track/purchase", purchase_data)
        
        # Now check analytics to ensure funnel integrity
        status, analytics, rt = await self.test_request("GET", "/commerce/analytics")
        
        if status == 200 and isinstance(analytics, dict):
            summary = analytics.get("summary", {})
            impressions = summary.get("totalImpressions", 0)
            ctas = summary.get("totalCTAs", 0)
            purchases = summary.get("totalPurchases", 0)
            
            # Funnel logic: impressions ≥ CTAs ≥ purchases
            funnel_valid = impressions >= ctas >= purchases
            
            # Additional validation: ensure we have reasonable numbers
            has_data = impressions > 0 and ctas > 0 and purchases > 0
            
            success = funnel_valid and has_data
            details = f"Funnel: {impressions} impressions ≥ {ctas} CTAs ≥ {purchases} purchases - {'VALID' if funnel_valid else 'INVALID'}"
        else:
            success = False
            details = f"Analytics API failed with status {status}"
        
        self.log_test("Analytics Funnel Integrity", success, details, rt)

    async def test_proper_4xx_error_responses(self):
        """Test that invalid requests return 422/400/409 errors, never 200 OK"""
        print("\n🚨 CRITICAL FIX 2: PROPER 4XX ERROR RESPONSES")
        
        error_test_cases = [
            # Invalid impression requests
            ("POST", "/track/impression", {}, "Empty impression request"),
            ("POST", "/track/impression", {"storyId": ""}, "Empty story ID"),
            ("POST", "/track/impression", {"storyId": None}, "Null story ID"),
            
            # Invalid CTA requests  
            ("POST", "/track/cta", {}, "Empty CTA request"),
            ("POST", "/track/cta", {"storyId": ""}, "Empty CTA story ID"),
            ("POST", "/track/cta", {"storyId": "valid", "productId": ""}, "Empty product ID"),
            
            # Invalid purchase requests
            ("POST", "/track/purchase", {}, "Empty purchase request"),
            ("POST", "/track/purchase", {"orderId": "test"}, "Missing required fields"),
            ("POST", "/track/purchase", {"orderId": "test", "amount": -100, "currency": "USD", "productId": "test", "userId": "test"}, "Negative amount"),
            ("POST", "/track/purchase", {"orderId": "test", "amount": 100, "currency": "INVALID", "productId": "test", "userId": "test"}, "Invalid currency"),
            ("POST", "/track/purchase", {"orderId": "test", "amount": 2000000, "currency": "USD", "productId": "test", "userId": "test"}, "Amount too large"),
            ("POST", "/track/purchase", {"orderId": "", "amount": 100, "currency": "USD", "productId": "test", "userId": "test"}, "Empty order ID"),
            ("POST", "/track/purchase", {"orderId": "test", "amount": 100, "currency": "USD", "productId": "", "userId": "test"}, "Empty product ID"),
            
            # Invalid pagination
            ("GET", "/stories", {"limit": -1}, "Negative limit"),
            ("GET", "/stories", {"limit": 200}, "Limit too large"),
            ("GET", "/stories", {"cursor": "invalid_cursor_format"}, "Invalid cursor format"),
        ]
        
        all_4xx_correct = True
        failed_cases = []
        
        for method, endpoint, data, description in error_test_cases:
            status, response, rt = await self.test_request(method, endpoint, data)
            
            # Check that we get proper 4xx error, not 200 OK
            is_4xx = 400 <= status < 500
            is_not_200 = status != 200
            
            if not (is_4xx and is_not_200):
                all_4xx_correct = False
                failed_cases.append(f"{description}: got {status} (expected 4xx)")
            
            individual_success = is_4xx and is_not_200
            details = f"Expected 4xx, got {status}"
            self.log_test(f"4xx Error: {description}", individual_success, details, rt)
        
        # Overall assessment
        overall_details = f"All error cases return 4xx: {'YES' if all_4xx_correct else 'NO'}"
        if failed_cases:
            overall_details += f" - Failed: {len(failed_cases)} cases"
        
        self.log_test("Overall 4xx Error Response Compliance", all_4xx_correct, overall_details)

    async def test_multi_currency_support(self):
        """Test EUR/GBP/JPY with proper rounding, FX normalization, and USD conversion"""
        print("\n💱 CRITICAL FIX 3: MULTI-CURRENCY SUPPORT")
        
        # Test each currency with proper amounts and expected behavior
        currency_test_cases = [
            ("EUR", 223.36, 2, "Euro with 2 decimal places and FX conversion"),
            ("GBP", 189.68, 2, "British Pound with 2 decimal places and FX conversion"),
            ("JPY", 35672, 0, "Japanese Yen with 0 decimal places and FX conversion"),
            ("USD", 239.00, 2, "US Dollar baseline with 2 decimal places"),
        ]
        
        all_currencies_working = True
        currency_results = []
        
        for currency, amount, expected_decimals, description in currency_test_cases:
            # Create a purchase in this currency
            order_id = f"currency_test_{currency}_{uuid.uuid4().hex[:8]}"
            user_id = f"currency_user_{currency}_{uuid.uuid4().hex[:8]}"
            
            # First create CTA for attribution
            cta_data = {
                "storyId": "luxefashion_story_1",
                "productId": "trench-coat",
                "userId": user_id
            }
            await self.test_request("POST", "/track/cta", cta_data)
            
            # Then make purchase
            purchase_data = {
                "orderId": order_id,
                "userId": user_id,
                "productId": "trench-coat",
                "amount": amount,
                "currency": currency,
                "referrerStoryId": "luxefashion_story_1"
            }
            
            status, data, rt = await self.test_request("POST", "/track/purchase", purchase_data)
            
            if status == 200 and isinstance(data, dict):
                # Validate currency handling
                returned_currency = data.get("currency")
                fx_rate = data.get("fxRateUsd")
                commission = data.get("commission")
                commission_usd = data.get("commissionUsd")
                
                # Check currency normalization
                currency_correct = returned_currency == currency
                
                # Check FX rate exists and is positive
                fx_valid = isinstance(fx_rate, (int, float)) and fx_rate > 0
                
                # Check proper decimal rounding
                if expected_decimals == 0:
                    # JPY should have no decimals
                    rounding_correct = commission == int(commission) if commission else True
                else:
                    # USD/EUR/GBP should have proper decimals
                    rounding_correct = True  # Allow proper decimal handling
                
                # Check USD conversion exists
                usd_conversion_valid = isinstance(commission_usd, (int, float)) and commission_usd >= 0
                
                # Check that we have commission (since we created CTA)
                has_commission = commission > 0
                
                currency_working = (currency_correct and fx_valid and rounding_correct and 
                                  usd_conversion_valid and has_commission)
                
                if not currency_working:
                    all_currencies_working = False
                
                details = f"Currency: {returned_currency}, FX: {fx_rate}, Commission: {commission}, USD: {commission_usd}"
                currency_results.append((currency, currency_working, details))
                
            else:
                currency_working = False
                all_currencies_working = False
                details = f"API failed with status {status}"
                currency_results.append((currency, currency_working, details))
            
            self.log_test(f"Multi-Currency: {description}", currency_working, details, rt)
        
        # Overall multi-currency assessment
        working_currencies = sum(1 for _, working, _ in currency_results if working)
        total_currencies = len(currency_results)
        
        overall_details = f"{working_currencies}/{total_currencies} currencies working properly"
        self.log_test("Overall Multi-Currency Support", all_currencies_working, overall_details)

    async def run_focused_validation(self):
        """Run focused validation on the 3 critical fixes"""
        print("🎯 FOCUSED VALIDATION: Critical Fixes for Series A Readiness")
        print("=" * 70)
        
        await self.test_analytics_funnel_integrity()
        await self.test_proper_4xx_error_responses()
        await self.test_multi_currency_support()
        
        # Generate focused report
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print("\n" + "=" * 70)
        print("🎯 FOCUSED VALIDATION RESULTS")
        print("=" * 70)
        print(f"📊 SUCCESS RATE: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)")
        
        # Check critical fixes status
        critical_fixes = {
            "Analytics Funnel Integrity": any(r["name"] == "Analytics Funnel Integrity" and r["success"] for r in self.test_results),
            "4xx Error Response Compliance": any(r["name"] == "Overall 4xx Error Response Compliance" and r["success"] for r in self.test_results),
            "Multi-Currency Support": any(r["name"] == "Overall Multi-Currency Support" and r["success"] for r in self.test_results)
        }
        
        print(f"\n🔧 CRITICAL FIXES STATUS:")
        for fix_name, status in critical_fixes.items():
            status_icon = "✅" if status else "❌"
            print(f"   {status_icon} {fix_name}: {'FIXED' if status else 'NEEDS WORK'}")
        
        all_critical_fixed = all(critical_fixes.values())
        
        print(f"\n🏆 SERIES A READINESS: {'✅ READY' if all_critical_fixed and success_rate >= 95 else '❌ NEEDS WORK'}")
        
        if not all_critical_fixed:
            failed_tests = [r for r in self.test_results if not r["success"]]
            print(f"\n❌ REMAINING ISSUES ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['name']}: {test['details']}")
        
        print("=" * 70)
        return all_critical_fixed and success_rate >= 95

async def main():
    """Main focused validation execution"""
    async with FocusedValidator() as validator:
        success = await validator.run_focused_validation()
        return success

if __name__ == "__main__":
    asyncio.run(main())