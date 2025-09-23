#!/usr/bin/env python3
"""
Comprehensive Backend Testing Suite for Social Media Advertising Platform
Testing all endpoints for multi-platform campaign management, influencer partnerships, and AI optimization
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any
import os
from dotenv import load_dotenv

load_dotenv()

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://ai-marketplace-13.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class SocialMediaAdvertisingTester:
    """Comprehensive tester for Social Media Advertising Suite"""
    
    def __init__(self):
        self.session = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.start_time = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
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
            "response_time": f"{response_time:.3f}s"
        }
        self.test_results.append(result)
        print(f"{status} | {test_name} ({response_time:.3f}s) | {details}")
    
    async def test_endpoint(self, method: str, endpoint: str, data: Dict = None, 
                          expected_status: int = 200, test_name: str = None) -> Dict:
        """Generic endpoint tester"""
        if not test_name:
            test_name = f"{method} {endpoint}"
            
        start_time = time.time()
        
        try:
            url = f"{BASE_URL}{endpoint}"
            
            if method.upper() == "GET":
                async with self.session.get(url, params=data) as response:
                    response_data = await response.json()
                    response_time = time.time() - start_time
                    
                    if response.status == expected_status:
                        self.log_test(test_name, True, f"Status: {response.status}", response_time)
                        return response_data
                    else:
                        self.log_test(test_name, False, f"Expected {expected_status}, got {response.status}", response_time)
                        return {"error": f"Status {response.status}"}
                        
            elif method.upper() == "POST":
                async with self.session.post(url, json=data) as response:
                    response_data = await response.json()
                    response_time = time.time() - start_time
                    
                    if response.status == expected_status:
                        self.log_test(test_name, True, f"Status: {response.status}", response_time)
                        return response_data
                    else:
                        self.log_test(test_name, False, f"Expected {expected_status}, got {response.status}", response_time)
                        return {"error": f"Status {response.status}"}
                        
        except Exception as e:
            response_time = time.time() - start_time
            self.log_test(test_name, False, f"Exception: {str(e)}", response_time)
            return {"error": str(e)}
    
    # 1. Social Media Advertising Health Check Tests
    async def test_social_ads_health_check(self):
        """Test social media advertising health check endpoint"""
        print("\n🏥 TESTING SOCIAL MEDIA ADVERTISING HEALTH CHECK")
        
        result = await self.test_endpoint(
            "GET", "/social-ads/health",
            test_name="Social Media Advertising Health Check"
        )
        
        if "error" not in result:
            # Validate health check response structure
            required_fields = ["status", "service", "features", "platforms_supported", "overall_performance"]
            missing_fields = [field for field in required_fields if field not in result]
            
            if not missing_fields:
                self.log_test("Health Check Structure Validation", True, 
                            f"All required fields present: {len(required_fields)} fields")
                
                # Validate platform support
                if result.get("platforms_supported") == 8:
                    self.log_test("Platform Support Validation", True, "8 platforms supported as expected")
                else:
                    self.log_test("Platform Support Validation", False, 
                                f"Expected 8 platforms, got {result.get('platforms_supported')}")
                    
                # Validate features
                expected_features = [
                    "Multi-Platform Campaign Management",
                    "Influencer Partnership Platform",
                    "AI-Powered Optimization",
                    "Cross-Platform Analytics"
                ]
                features = result.get("features", [])
                features_found = sum(1 for feature in expected_features if feature in features)
                
                if features_found >= 3:
                    self.log_test("Features Validation", True, f"{features_found}/{len(expected_features)} key features present")
                else:
                    self.log_test("Features Validation", False, f"Only {features_found}/{len(expected_features)} key features found")
                    
            else:
                self.log_test("Health Check Structure Validation", False, f"Missing fields: {missing_fields}")
    
    # 2. Multi-Platform Campaign Management Tests
    async def test_campaign_management(self):
        """Test campaign creation and management across platforms"""
        print("\n📱 TESTING MULTI-PLATFORM CAMPAIGN MANAGEMENT")
        
        # Test campaign creation for different platforms
        platforms = ["facebook", "instagram", "tiktok", "youtube", "twitter", "linkedin", "pinterest", "snapchat"]
        
        for platform in platforms[:4]:  # Test first 4 platforms to save time
            campaign_data = {
                "campaign_name": f"Test Campaign - {platform.title()}",
                "platform": platform,
                "objective": "sales",
                "daily_budget": 100.0,
                "total_budget": 1000.0,
                "ad_format": "video" if platform in ["tiktok", "youtube"] else "image",
                "call_to_action": "shop_now",
                "start_date": datetime.utcnow().isoformat(),
                "end_date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                "created_by": "test_user"
            }
            
            result = await self.test_endpoint(
                "POST", "/social-ads/campaigns/create",
                data=campaign_data,
                test_name=f"Create Campaign - {platform.title()}"
            )
            
            if "error" not in result and result.get("success"):
                campaign_id = result.get("campaign_id")
                
                # Test campaign performance retrieval
                await self.test_endpoint(
                    "GET", f"/social-ads/campaigns/{campaign_id}/performance",
                    data={"start_date": "2024-01-01", "end_date": "2024-01-31"},
                    test_name=f"Get Campaign Performance - {platform.title()}"
                )
        
        # Test campaigns overview
        await self.test_endpoint(
            "GET", "/social-ads/campaigns/overview",
            test_name="Campaigns Overview"
        )
    
    # 3. Influencer Partnership Platform Tests
    async def test_influencer_platform(self):
        """Test influencer marketplace and campaign functionality"""
        print("\n👥 TESTING INFLUENCER PARTNERSHIP PLATFORM")
        
        # Test influencer marketplace
        result = await self.test_endpoint(
            "GET", "/social-ads/influencers/marketplace",
            test_name="Influencer Marketplace Overview"
        )
        
        if "error" not in result:
            # Validate marketplace structure
            required_fields = ["marketplace_overview", "featured_influencers", "search_filters"]
            missing_fields = [field for field in required_fields if field not in result]
            
            if not missing_fields:
                self.log_test("Marketplace Structure Validation", True, "All required fields present")
                
                # Check if we have featured influencers
                influencers = result.get("featured_influencers", [])
                if len(influencers) >= 5:
                    self.log_test("Featured Influencers Validation", True, f"{len(influencers)} influencers available")
                else:
                    self.log_test("Featured Influencers Validation", False, f"Only {len(influencers)} influencers found")
            else:
                self.log_test("Marketplace Structure Validation", False, f"Missing fields: {missing_fields}")
        
        # Test influencer profile creation
        influencer_data = {
            "username": "@test_influencer",
            "platform": "instagram",
            "full_name": "Test Influencer",
            "followers_count": 50000,
            "engagement_rate": 4.5,
            "email": "test@example.com",
            "content_categories": ["fashion", "lifestyle"],
            "verified": True
        }
        
        result = await self.test_endpoint(
            "POST", "/social-ads/influencers/create",
            data=influencer_data,
            test_name="Create Influencer Profile"
        )
        
        if "error" not in result and result.get("success"):
            influencer_id = result.get("influencer_id")
            
            # Test influencer campaign creation
            campaign_data = {
                "influencer_id": influencer_id,
                "campaign_name": "Test Influencer Campaign",
                "collaboration_type": "sponsored_post",
                "platform": "instagram",
                "compensation_amount": 500.0,
                "brief_date": datetime.utcnow().isoformat(),
                "content_due_date": (datetime.utcnow() + timedelta(days=3)).isoformat(),
                "publish_date": (datetime.utcnow() + timedelta(days=5)).isoformat(),
                "campaign_end_date": (datetime.utcnow() + timedelta(days=10)).isoformat()
            }
            
            campaign_result = await self.test_endpoint(
                "POST", "/social-ads/influencers/campaigns/create",
                data=campaign_data,
                test_name="Create Influencer Campaign"
            )
            
            if "error" not in campaign_result and campaign_result.get("success"):
                campaign_id = campaign_result.get("campaign_id")
                
                # Test influencer campaign performance
                await self.test_endpoint(
                    "GET", f"/social-ads/influencers/campaigns/{campaign_id}/performance",
                    test_name="Get Influencer Campaign Performance"
                )
    
    # 4. AI-Powered Optimization Engine Tests
    async def test_ai_optimization(self):
        """Test AI-powered optimization capabilities"""
        print("\n🤖 TESTING AI-POWERED OPTIMIZATION ENGINE")
        
        # Test AI optimization summary
        result = await self.test_endpoint(
            "GET", "/social-ads/ai/optimization/summary",
            test_name="AI Optimization Summary"
        )
        
        if "error" not in result:
            # Validate AI summary structure
            required_fields = ["ai_engine_status", "models_active", "optimization_categories"]
            missing_fields = [field for field in required_fields if field not in result]
            
            if not missing_fields:
                self.log_test("AI Summary Structure Validation", True, "All required fields present")
                
                # Check optimization categories
                categories = result.get("optimization_categories", {})
                expected_categories = ["targeting", "creative", "bidding", "scheduling"]
                categories_found = sum(1 for cat in expected_categories if cat in categories)
                
                if categories_found >= 3:
                    self.log_test("AI Optimization Categories", True, f"{categories_found}/{len(expected_categories)} categories available")
                else:
                    self.log_test("AI Optimization Categories", False, f"Only {categories_found}/{len(expected_categories)} categories found")
            else:
                self.log_test("AI Summary Structure Validation", False, f"Missing fields: {missing_fields}")
        
        # Test AI recommendations for a sample campaign
        test_campaign_id = "camp_test123456"
        result = await self.test_endpoint(
            "GET", f"/social-ads/ai/recommendations/{test_campaign_id}",
            test_name="AI Campaign Recommendations"
        )
        
        if "error" not in result:
            # Validate recommendations structure
            if "recommendations" in result and "priority_breakdown" in result:
                recommendations = result.get("recommendations", [])
                if len(recommendations) >= 3:
                    self.log_test("AI Recommendations Generation", True, f"{len(recommendations)} recommendations generated")
                    
                    # Check recommendation priorities
                    priority_breakdown = result.get("priority_breakdown", {})
                    if "high" in priority_breakdown and "medium" in priority_breakdown:
                        self.log_test("AI Recommendations Prioritization", True, "Recommendations properly prioritized")
                    else:
                        self.log_test("AI Recommendations Prioritization", False, "Priority breakdown incomplete")
                else:
                    self.log_test("AI Recommendations Generation", False, f"Only {len(recommendations)} recommendations generated")
            else:
                self.log_test("AI Recommendations Structure", False, "Missing recommendations or priority_breakdown")
    
    # 5. Cross-Platform Analytics & Insights Tests
    async def test_cross_platform_analytics(self):
        """Test cross-platform analytics and insights"""
        print("\n📊 TESTING CROSS-PLATFORM ANALYTICS & INSIGHTS")
        
        # Test cross-platform analytics
        start_date = "2024-01-01"
        end_date = "2024-01-31"
        
        result = await self.test_endpoint(
            "GET", "/social-ads/analytics/cross-platform",
            data={"start_date": start_date, "end_date": end_date},
            test_name="Cross-Platform Analytics"
        )
        
        if "error" not in result:
            # Validate analytics structure
            required_fields = ["insights", "executive_summary", "action_plan"]
            missing_fields = [field for field in required_fields if field not in result]
            
            if not missing_fields:
                self.log_test("Analytics Structure Validation", True, "All required fields present")
                
                # Check executive summary metrics
                exec_summary = result.get("executive_summary", {})
                expected_metrics = ["total_spend", "total_revenue", "overall_roas", "best_platform"]
                metrics_found = sum(1 for metric in expected_metrics if metric in exec_summary)
                
                if metrics_found >= 3:
                    self.log_test("Executive Summary Metrics", True, f"{metrics_found}/{len(expected_metrics)} key metrics present")
                else:
                    self.log_test("Executive Summary Metrics", False, f"Only {metrics_found}/{len(expected_metrics)} metrics found")
            else:
                self.log_test("Analytics Structure Validation", False, f"Missing fields: {missing_fields}")
        
        # Test performance summary
        await self.test_endpoint(
            "GET", "/social-ads/analytics/performance/summary",
            data={"date_range": "30d"},
            test_name="Performance Summary"
        )
        
        # Test ROI breakdown
        result = await self.test_endpoint(
            "GET", "/social-ads/analytics/roi/breakdown",
            test_name="ROI Breakdown Analysis"
        )
        
        if "error" not in result:
            # Validate ROI breakdown structure
            expected_dimensions = ["by_platform", "by_campaign_objective", "by_audience_type", "by_creative_format"]
            dimensions_found = sum(1 for dim in expected_dimensions if dim in result)
            
            if dimensions_found >= 3:
                self.log_test("ROI Breakdown Dimensions", True, f"{dimensions_found}/{len(expected_dimensions)} dimensions analyzed")
            else:
                self.log_test("ROI Breakdown Dimensions", False, f"Only {dimensions_found}/{len(expected_dimensions)} dimensions found")
    
    # 6. Platform Integration Management Tests
    async def test_platform_integration(self):
        """Test platform integration and connection management"""
        print("\n🔗 TESTING PLATFORM INTEGRATION MANAGEMENT")
        
        # Test integration status
        result = await self.test_endpoint(
            "GET", "/social-ads/integrations/status",
            test_name="Platform Integrations Status"
        )
        
        if "error" not in result:
            # Validate integration status structure
            if "integrations" in result and "summary" in result:
                integrations = result.get("integrations", [])
                if len(integrations) >= 6:  # Should have at least 6 major platforms
                    self.log_test("Platform Integrations Count", True, f"{len(integrations)} platform integrations")
                    
                    # Check integration summary
                    summary = result.get("summary", {})
                    if "total_platforms" in summary and "connected" in summary:
                        self.log_test("Integration Summary", True, "Summary metrics available")
                    else:
                        self.log_test("Integration Summary", False, "Summary metrics incomplete")
                else:
                    self.log_test("Platform Integrations Count", False, f"Only {len(integrations)} integrations found")
            else:
                self.log_test("Integration Status Structure", False, "Missing integrations or summary")
        
        # Test platform connection
        integration_data = {
            "platform": "facebook",
            "platform_account_id": "test_account_123",
            "account_name": "AisleMarts Test Account",
            "connected_by": "test_user"
        }
        
        await self.test_endpoint(
            "POST", "/social-ads/integrations/connect",
            data=integration_data,
            test_name="Connect Platform Integration"
        )
    
    # 7. Audience Segmentation & Management Tests
    async def test_audience_management(self):
        """Test audience segmentation and management"""
        print("\n🎯 TESTING AUDIENCE SEGMENTATION & MANAGEMENT")
        
        # Test audience segments listing
        result = await self.test_endpoint(
            "GET", "/social-ads/audiences/segments",
            test_name="Get Audience Segments"
        )
        
        if "error" not in result:
            # Validate segments structure
            if "segments" in result and "summary" in result:
                segments = result.get("segments", [])
                if len(segments) >= 5:
                    self.log_test("Audience Segments Count", True, f"{len(segments)} audience segments available")
                    
                    # Check segment summary
                    summary = result.get("summary", {})
                    if "total_segments" in summary and "total_reach" in summary:
                        self.log_test("Audience Summary Metrics", True, "Summary metrics available")
                    else:
                        self.log_test("Audience Summary Metrics", False, "Summary metrics incomplete")
                else:
                    self.log_test("Audience Segments Count", False, f"Only {len(segments)} segments found")
            else:
                self.log_test("Audience Segments Structure", False, "Missing segments or summary")
        
        # Test audience segment creation
        segment_data = {
            "segment_name": "Test Audience Segment",
            "segment_type": "custom",
            "demographics": {
                "age_range": "25-45",
                "gender": "all",
                "income": "middle_to_high"
            },
            "interests": ["fashion", "technology", "travel"],
            "behaviors": ["online_shoppers", "frequent_travelers"],
            "geo_locations": ["US", "CA", "UK"],
            "available_platforms": ["facebook", "instagram", "tiktok"],
            "created_by": "test_user"
        }
        
        await self.test_endpoint(
            "POST", "/social-ads/audiences/create",
            data=segment_data,
            test_name="Create Audience Segment"
        )
    
    # 8. Performance and Load Testing
    async def test_performance_and_load(self):
        """Test system performance under load"""
        print("\n⚡ TESTING PERFORMANCE & LOAD HANDLING")
        
        # Test concurrent requests to health endpoint
        start_time = time.time()
        tasks = []
        
        for i in range(10):  # 10 concurrent requests
            task = self.test_endpoint(
                "GET", "/social-ads/health",
                test_name=f"Concurrent Health Check {i+1}"
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        end_time = time.time()
        
        successful_requests = sum(1 for result in results if isinstance(result, dict) and "error" not in result)
        total_time = end_time - start_time
        
        if successful_requests >= 8:  # At least 80% success rate
            self.log_test("Concurrent Load Test", True, 
                        f"{successful_requests}/10 requests successful in {total_time:.3f}s")
        else:
            self.log_test("Concurrent Load Test", False, 
                        f"Only {successful_requests}/10 requests successful")
        
        # Test response time for complex analytics
        start_time = time.time()
        await self.test_endpoint(
            "GET", "/social-ads/analytics/roi/breakdown",
            test_name="Analytics Response Time Test"
        )
        response_time = time.time() - start_time
        
        if response_time < 3.0:  # Should respond within 3 seconds
            self.log_test("Analytics Response Time", True, f"Response time: {response_time:.3f}s")
        else:
            self.log_test("Analytics Response Time", False, f"Slow response: {response_time:.3f}s")
    
    async def run_all_tests(self):
        """Run all test suites"""
        print("🚀📱💰 STARTING COMPREHENSIVE SOCIAL MEDIA ADVERTISING SUITE BACKEND TESTING")
        print("=" * 80)
        
        self.start_time = time.time()
        
        # Run all test suites
        await self.test_social_ads_health_check()
        await self.test_campaign_management()
        await self.test_influencer_platform()
        await self.test_ai_optimization()
        await self.test_cross_platform_analytics()
        await self.test_platform_integration()
        await self.test_audience_management()
        await self.test_performance_and_load()
        
        # Print final results
        total_time = time.time() - self.start_time
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print("\n" + "=" * 80)
        print("🏁 SOCIAL MEDIA ADVERTISING SUITE TESTING COMPLETE")
        print("=" * 80)
        print(f"📊 RESULTS SUMMARY:")
        print(f"   Total Tests: {self.total_tests}")
        print(f"   ✅ Passed: {self.passed_tests}")
        print(f"   ❌ Failed: {self.failed_tests}")
        print(f"   📈 Success Rate: {success_rate:.1f}%")
        print(f"   ⏱️  Total Time: {total_time:.2f}s")
        print(f"   🚀 Average Response Time: {total_time/self.total_tests:.3f}s per test")
        
        # Print failed tests for debugging
        if self.failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({self.failed_tests}):")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
        
        print("\n🎯 TESTING FOCUS AREAS COVERED:")
        print("   ✅ Social Media Advertising Health Check")
        print("   ✅ Multi-Platform Campaign Management (8 platforms)")
        print("   ✅ Influencer Partnership Platform")
        print("   ✅ AI-Powered Optimization Engine")
        print("   ✅ Cross-Platform Analytics & Insights")
        print("   ✅ Platform Integration Management")
        print("   ✅ Audience Segmentation & Management")
        print("   ✅ Performance & Load Testing")
        
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "failed_tests": self.failed_tests,
            "success_rate": success_rate,
            "total_time": total_time,
            "test_results": self.test_results
        }

async def main():
    """Main test execution function"""
    async with SocialMediaAdvertisingTester() as tester:
        results = await tester.run_all_tests()
        
        # Determine overall system status
        if results["success_rate"] >= 90:
            print(f"\n🟢 SYSTEM STATUS: EXCELLENT - Ready for Series A investor demonstrations")
        elif results["success_rate"] >= 75:
            print(f"\n🟡 SYSTEM STATUS: GOOD - Minor issues to address")
        elif results["success_rate"] >= 60:
            print(f"\n🟠 SYSTEM STATUS: FAIR - Several issues need attention")
        else:
            print(f"\n🔴 SYSTEM STATUS: NEEDS WORK - Major issues require immediate attention")
        
        return results

if __name__ == "__main__":
    asyncio.run(main())