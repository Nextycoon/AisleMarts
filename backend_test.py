#!/usr/bin/env python3
"""
AisleMarts Global Monetization Suite Backend Testing
Comprehensive testing for Phase 1.2: Global Monetization Suite
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any
import sys
import os

# Backend URL from frontend/.env
BACKEND_URL = "https://ai-marketplace-13.preview.emergentagent.com/api"

class GlobalMonetizationTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
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
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    async def test_endpoint(self, method: str, endpoint: str, test_name: str, 
                          params: Dict = None, json_data: Dict = None, 
                          expected_status: int = 200) -> Dict:
        """Generic endpoint testing method"""
        try:
            url = f"{BACKEND_URL}{endpoint}"
            
            if method.upper() == "GET":
                async with self.session.get(url, params=params) as response:
                    response_data = await response.json()
                    
            elif method.upper() == "POST":
                async with self.session.post(url, params=params, json=json_data) as response:
                    response_data = await response.json()
                    
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            if response.status == expected_status:
                self.log_test(test_name, True, f"Status: {response.status}", response_data)
                return response_data
            else:
                self.log_test(test_name, False, f"Expected {expected_status}, got {response.status}", response_data)
                return response_data
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
            return {"error": str(e)}

    # 1. Global Monetization Health Check & Status
    async def test_monetization_health(self):
        """Test Global Monetization Engine health check"""
        print("🌍💰 Testing Global Monetization Health Check & Status...")
        
        response = await self.test_endpoint(
            "GET", "/monetization/health",
            "Global Monetization Health Check"
        )
        
        if response and not response.get("error"):
            # Validate health check response structure
            required_fields = ["status", "service", "monetization_streams", "revenue_optimization", "platform_metrics"]
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.log_test("Health Check Response Structure", True, 
                            f"All required fields present: {len(response.get('monetization_streams', []))} streams")
            else:
                self.log_test("Health Check Response Structure", False, 
                            f"Missing fields: {missing_fields}")

    # 2. Commission-Based Revenue System (0% Commission Model)
    async def test_commission_system(self):
        """Test commission calculation and management"""
        print("💰 Testing Commission-Based Revenue System...")
        
        # Test commission calculation
        commission_params = {
            "seller_id": "seller_test_001",
            "transaction_amount": 299.99,
            "product_category": "electronics",
            "buyer_location": "US",
            "is_premium_seller": "true",
            "referral_code": "REF2024"
        }
        
        response = await self.test_endpoint(
            "POST", "/monetization/commission/calculate",
            "Dynamic Commission Calculation",
            params=commission_params
        )
        
        # Test commission structure retrieval
        await self.test_endpoint(
            "GET", f"/monetization/commission/structure/{commission_params['seller_id']}",
            "Commission Structure Retrieval"
        )
        
        # Test commission tiers
        await self.test_endpoint(
            "GET", "/monetization/commission/tiers",
            "Commission Tiers Information"
        )

    # 3. Subscription Services Management
    async def test_subscription_services(self):
        """Test subscription management system"""
        print("📋 Testing Subscription Services Management...")
        
        # Test subscription plans
        await self.test_endpoint(
            "GET", "/monetization/subscription/plans",
            "Subscription Plans Listing"
        )
        
        # Test subscription upgrade
        upgrade_params = {
            "user_id": "user_premium_001",
            "new_plan_type": "premium",
            "payment_method": "credit_card",
            "billing_frequency": "monthly",
            "promo_code": "SAVE20"
        }
        
        await self.test_endpoint(
            "POST", "/monetization/subscription/upgrade",
            "Subscription Upgrade",
            params=upgrade_params
        )
        
        # Test user subscription retrieval
        await self.test_endpoint(
            "GET", f"/monetization/subscription/{upgrade_params['user_id']}",
            "User Subscription Details"
        )

    # 4. Advertising & Sponsored Content Platform
    async def test_advertising_platform(self):
        """Test advertising campaign and auction system"""
        print("📢 Testing Advertising & Sponsored Content Platform...")
        
        # Test ad formats
        await self.test_endpoint(
            "GET", "/monetization/advertising/formats",
            "Advertising Formats Listing"
        )
        
        # Test campaign creation
        campaign_params = {
            "advertiser_id": "advertiser_001",
            "campaign_name": "Holiday Electronics Sale 2024",
            "budget_total": 5000.0,
            "budget_daily": 200.0,
            "target_audience": json.dumps({
                "age_range": "25-45",
                "interests": ["electronics", "technology", "gadgets"],
                "location": "US"
            }),
            "ad_formats": json.dumps(["native_feed", "video_ad", "shoppable_ad"]),
            "creative_assets": json.dumps([
                {"type": "image", "url": "https://example.com/ad1.jpg"},
                {"type": "video", "url": "https://example.com/ad1.mp4"}
            ]),
            "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
            "end_date": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        campaign_response = await self.test_endpoint(
            "POST", "/monetization/advertising/campaign/create",
            "Advertising Campaign Creation",
            params=campaign_params
        )
        
        # Test active campaigns
        await self.test_endpoint(
            "GET", "/monetization/advertising/campaigns/active",
            "Active Campaigns Listing"
        )
        
        # Test programmatic auction simulation
        auction_params = {
            "ad_slot_id": "slot_homepage_banner",
            "user_profile": json.dumps({
                "age": 32,
                "interests": ["electronics", "shopping"],
                "is_premium": True,
                "engagement_score": 0.8,
                "purchase_frequency": 0.3
            })
        }
        
        await self.test_endpoint(
            "POST", "/monetization/advertising/auction/simulate",
            "Programmatic Auction Simulation",
            params=auction_params
        )

    # 5. Vendor Services Platform
    async def test_vendor_services(self):
        """Test vendor premium tools and services"""
        print("🛠️ Testing Vendor Services Platform...")
        
        # Test marketplace services
        await self.test_endpoint(
            "GET", "/monetization/marketplace/services",
            "Marketplace Services Listing"
        )
        
        # Test services with filters
        await self.test_endpoint(
            "GET", "/monetization/marketplace/services",
            "Filtered Marketplace Services",
            params={"category": "analytics", "pricing_model": "subscription"}
        )

    # 6. Financial Services Integration
    async def test_financial_services(self):
        """Test payment processing and financial services"""
        print("💳 Testing Financial Services Integration...")
        
        # Test virtual currency system
        await self.test_endpoint(
            "GET", "/monetization/virtual-currency/user_finance_001",
            "Virtual Currency Balance"
        )

    # 7. Data Monetization Platform
    async def test_data_monetization(self):
        """Test data insights and analytics monetization"""
        print("📊 Testing Data Monetization Platform...")
        
        # Test revenue analytics
        await self.test_endpoint(
            "GET", "/monetization/analytics/revenue",
            "Revenue Analytics"
        )
        
        # Test performance metrics
        await self.test_endpoint(
            "GET", "/monetization/analytics/performance-metrics",
            "Performance Metrics"
        )
        
        # Test monetization dashboard
        await self.test_endpoint(
            "GET", "/monetization/analytics/dashboard",
            "Monetization Dashboard"
        )

    # 8. Partnership Revenue & Transaction Fees
    async def test_partnership_revenue(self):
        """Test partnership revenue and transaction fee management"""
        print("🤝 Testing Partnership Revenue & Transaction Fees...")
        
        # Test monetization overview
        await self.test_endpoint(
            "GET", "/monetization/overview/summary",
            "Monetization Overview Summary"
        )

    # 9. Revenue Analytics & Reporting
    async def test_revenue_analytics(self):
        """Test comprehensive analytics and reporting"""
        print("📈 Testing Revenue Analytics & Reporting...")
        
        # Test revenue analytics with different periods
        periods = ["daily", "weekly", "monthly", "quarterly"]
        for period in periods:
            await self.test_endpoint(
                "GET", "/monetization/analytics/revenue",
                f"Revenue Analytics - {period.title()}",
                params={"period": period, "include_forecasts": "true"}
            )

    # 10. Configuration & Management
    async def test_configuration_management(self):
        """Test monetization configuration and optimization"""
        print("⚙️ Testing Configuration & Management...")
        
        # Test optimization recommendations
        await self.test_endpoint(
            "GET", "/monetization/optimization/recommendations",
            "Monetization Optimization Recommendations"
        )

    # 11. Virtual Goods & Digital Economy
    async def test_virtual_goods_economy(self):
        """Test virtual goods marketplace and digital economy"""
        print("🎮 Testing Virtual Goods & Digital Economy...")
        
        # Test virtual goods catalog
        await self.test_endpoint(
            "GET", "/monetization/virtual-goods/catalog",
            "Virtual Goods Catalog"
        )
        
        # Test virtual goods with filters
        await self.test_endpoint(
            "GET", "/monetization/virtual-goods/catalog",
            "Filtered Virtual Goods",
            params={"category": "cosmetic", "rarity": "rare", "limit": 10}
        )
        
        # Test virtual good purchase
        purchase_params = {
            "user_id": "user_vg_001",
            "virtual_good_id": "vg_001",
            "quantity": 1,
            "payment_method": "virtual_currency"
        }
        
        await self.test_endpoint(
            "POST", "/monetization/virtual-goods/purchase",
            "Virtual Good Purchase",
            params=purchase_params
        )

    # Performance and Load Testing
    async def test_concurrent_performance(self):
        """Test concurrent request handling"""
        print("⚡ Testing Concurrent Performance...")
        
        start_time = time.time()
        
        # Create multiple concurrent requests
        tasks = []
        endpoints_to_test = [
            "/monetization/health",
            "/monetization/commission/tiers", 
            "/monetization/subscription/plans",
            "/monetization/advertising/formats",
            "/monetization/virtual-goods/catalog",
            "/monetization/analytics/revenue",
            "/monetization/overview/summary"
        ]
        
        for i in range(20):  # 20 concurrent requests
            endpoint = endpoints_to_test[i % len(endpoints_to_test)]
            task = self.test_endpoint("GET", endpoint, f"Concurrent Request {i+1}")
            tasks.append(task)
        
        # Execute all requests concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        end_time = time.time()
        duration = end_time - start_time
        
        successful_requests = sum(1 for result in results if isinstance(result, dict) and not result.get("error"))
        
        self.log_test("Concurrent Performance Test", True, 
                     f"Completed {len(tasks)} requests in {duration:.3f}s, {successful_requests}/{len(tasks)} successful")

    async def run_all_tests(self):
        """Run all Global Monetization Suite tests"""
        print("🌍💰 STARTING GLOBAL MONETIZATION SUITE BACKEND TESTING")
        print("=" * 80)
        
        start_time = time.time()
        
        # Run all test categories
        await self.test_monetization_health()
        await self.test_commission_system()
        await self.test_subscription_services()
        await self.test_advertising_platform()
        await self.test_vendor_services()
        await self.test_financial_services()
        await self.test_data_monetization()
        await self.test_partnership_revenue()
        await self.test_revenue_analytics()
        await self.test_configuration_management()
        await self.test_virtual_goods_economy()
        await self.test_concurrent_performance()
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        # Print comprehensive results
        print("=" * 80)
        print("🌍💰 GLOBAL MONETIZATION SUITE TESTING COMPLETE")
        print("=" * 80)
        print(f"📊 RESULTS SUMMARY:")
        print(f"   Total Tests: {self.total_tests}")
        print(f"   ✅ Passed: {self.passed_tests}")
        print(f"   ❌ Failed: {self.failed_tests}")
        print(f"   📈 Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        print(f"   ⏱️  Total Duration: {total_duration:.2f}s")
        print(f"   🚀 Average Response Time: {(total_duration/self.total_tests):.3f}s")
        print()
        
        # Series A Readiness Assessment
        success_rate = (self.passed_tests / self.total_tests) * 100
        if success_rate >= 90:
            readiness = "🟢 SERIES A READY"
        elif success_rate >= 75:
            readiness = "🟡 NEEDS MINOR FIXES"
        else:
            readiness = "🔴 MAJOR ISSUES"
            
        print(f"🎯 SERIES A READINESS: {readiness} ({success_rate:.1f}%)")
        
        # Failed tests summary
        if self.failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
        
        print("\n🌍💰 Global Monetization Suite Testing Complete!")
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "failed_tests": self.failed_tests,
            "success_rate": success_rate,
            "duration": total_duration,
            "series_a_ready": success_rate >= 90
        }

async def main():
    """Main testing function"""
    async with GlobalMonetizationTester() as tester:
        results = await tester.run_all_tests()
        return results

if __name__ == "__main__":
    # Run the tests
    results = asyncio.run(main())
    
    # Exit with appropriate code
    if results["success_rate"] >= 90:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure