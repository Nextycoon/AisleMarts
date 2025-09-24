#!/usr/bin/env python3
"""
Comprehensive Backend Testing Suite for CLP Engine Integration
Testing all CLP Engine endpoints for content lead purchase optimization
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
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://social-ecosystem.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class CLPEngineTester:
    """Comprehensive tester for CLP Engine Suite"""
    
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
    
    # 1. CLP Engine Health Check Tests
    async def test_clp_engine_health_check(self):
        """Test CLP Engine health check endpoint"""
        print("\n🏥 TESTING CLP ENGINE HEALTH CHECK")
        
        result = await self.test_endpoint(
            "GET", "/clp-engine/health",
            test_name="CLP Engine Health Check"
        )
        
        if "error" not in result:
            # Validate health check response structure
            required_fields = ["status", "service", "version", "features", "ai_capabilities", "business_model"]
            missing_fields = [field for field in required_fields if field not in result]
            
            if not missing_fields:
                self.log_test("Health Check Structure Validation", True, 
                            f"All required fields present: {len(required_fields)} fields")
                
                # Validate features
                features = result.get("features", [])
                expected_features = [
                    "Content Lead Purchase Optimization",
                    "Infinite Discovery Algorithm", 
                    "Real-time Engagement Tracking",
                    "AI-Powered Content Optimization"
                ]
                features_found = sum(1 for feature in expected_features if feature in features)
                
                if features_found >= 3:
                    self.log_test("CLP Features Validation", True, f"{features_found}/{len(expected_features)} key features present")
                else:
                    self.log_test("CLP Features Validation", False, f"Only {features_found}/{len(expected_features)} key features found")
                    
                # Validate AI capabilities
                ai_capabilities = result.get("ai_capabilities", [])
                if len(ai_capabilities) >= 4:
                    self.log_test("AI Capabilities Validation", True, f"{len(ai_capabilities)} AI capabilities available")
                else:
                    self.log_test("AI Capabilities Validation", False, f"Only {len(ai_capabilities)} AI capabilities found")
                    
                # Validate business model
                business_model = result.get("business_model", {})
                if "clp_formula" in business_model and "conversion_efficiency" in business_model:
                    self.log_test("Business Model Validation", True, "CLP business model properly defined")
                else:
                    self.log_test("Business Model Validation", False, "Business model incomplete")
                    
            else:
                self.log_test("Health Check Structure Validation", False, f"Missing fields: {missing_fields}")
    
    # 2. Content Engagement Tracking Tests
    async def test_content_engagement_tracking(self):
        """Test content engagement tracking functionality"""
        print("\n📊 TESTING CONTENT ENGAGEMENT TRACKING")
        
        # Test engagement tracking
        engagement_data = {
            "content_id": "test_content_123",
            "user_id": "test_user_456",
            "action": "click",
            "duration_seconds": 45.5,
            "engagement_depth": 0.8,
            "device_type": "mobile",
            "platform": "aislemarts",
            "social_context": {
                "friend_also_engaged": True,
                "high_engagement_content": True
            },
            "previous_actions": ["view", "like"],
            "session_context": {
                "browsing_intent": "shopping",
                "time_spent_shopping": 600
            }
        }
        
        result = await self.test_endpoint(
            "POST", "/clp-engine/engagement/track",
            data=engagement_data,
            test_name="Track Content Engagement"
        )
        
        if "error" not in result and result.get("success"):
            # Validate engagement tracking response
            required_fields = ["engagement_id", "engagement_score", "purchase_intent_score", "content_resonance"]
            missing_fields = [field for field in required_fields if field not in result]
            
            if not missing_fields:
                self.log_test("Engagement Tracking Response Validation", True, "All tracking metrics present")
                
                # Validate score ranges
                engagement_score = result.get("engagement_score", 0)
                purchase_intent = result.get("purchase_intent_score", 0)
                content_resonance = result.get("content_resonance", 0)
                
                if 0 <= engagement_score <= 1 and 0 <= purchase_intent <= 1 and 0 <= content_resonance <= 1:
                    self.log_test("Engagement Scores Validation", True, "All scores within valid range (0-1)")
                else:
                    self.log_test("Engagement Scores Validation", False, "Scores outside valid range")
            else:
                self.log_test("Engagement Tracking Response Validation", False, f"Missing fields: {missing_fields}")
        
        # Test engagement analytics
        analytics_result = await self.test_endpoint(
            "GET", "/clp-engine/engagement/analytics",
            data={"time_range": "24h", "content_id": "test_content_123"},
            test_name="Get Engagement Analytics"
        )
        
        if "error" not in analytics_result:
            # Validate analytics structure
            required_analytics = ["total_engagements", "unique_users", "avg_engagement_score", "top_engagement_actions"]
            missing_analytics = [field for field in required_analytics if field not in analytics_result]
            
            if not missing_analytics:
                self.log_test("Engagement Analytics Structure", True, "Complete analytics data available")
                
                # Validate engagement actions
                top_actions = analytics_result.get("top_engagement_actions", [])
                if len(top_actions) >= 3:
                    self.log_test("Engagement Actions Analysis", True, f"{len(top_actions)} engagement actions analyzed")
                else:
                    self.log_test("Engagement Actions Analysis", False, f"Only {len(top_actions)} actions found")
            else:
                self.log_test("Engagement Analytics Structure", False, f"Missing analytics: {missing_analytics}")
    
    # 3. Content Optimization Tests
    async def test_content_optimization(self):
        """Test content optimization functionality"""
        print("\n🎯 TESTING CONTENT OPTIMIZATION")
        
        # Test content optimization
        content_data = {
            "content_type": "video",
            "title": "Amazing Limited Edition Fashion Collection - Shop Now!",
            "description": "Exclusive designer pieces with free shipping today only. Don't miss out!",
            "creator_id": "creator_789",
            "creator_type": "influencer",
            "media_urls": ["https://example.com/video.mp4"],
            "thumbnail_url": "https://example.com/thumb.jpg",
            "duration_seconds": 60.0,
            "featured_products": ["product_1", "product_2"],
            "shopping_tags": [
                {"product_id": "product_1", "timestamp": 15.0},
                {"product_id": "product_2", "timestamp": 45.0}
            ],
            "target_audience": {
                "age_range": "25-35",
                "interests": ["fashion", "luxury"]
            }
        }
        
        result = await self.test_endpoint(
            "POST", "/clp-engine/content/optimize",
            data=content_data,
            test_name="Create Optimized Content"
        )
        
        if "error" not in result and result.get("success"):
            content_id = result.get("content_id")
            optimization = result.get("optimization", {})
            
            # Validate optimization response
            required_fields = ["content_triggers_added", "product_placement_score", "optimization_score"]
            missing_fields = [field for field in required_fields if field not in optimization]
            
            if not missing_fields:
                self.log_test("Content Optimization Response", True, "Complete optimization data provided")
                
                # Validate optimization scores
                placement_score = optimization.get("product_placement_score", 0)
                opt_score = optimization.get("optimization_score", 0)
                
                if 0 <= placement_score <= 1 and 0 <= opt_score <= 1:
                    self.log_test("Optimization Scores Validation", True, "Optimization scores within valid range")
                else:
                    self.log_test("Optimization Scores Validation", False, "Optimization scores invalid")
                    
                # Validate recommendations
                recommendations = optimization.get("recommendations", [])
                if len(recommendations) >= 3:
                    self.log_test("Optimization Recommendations", True, f"{len(recommendations)} recommendations provided")
                else:
                    self.log_test("Optimization Recommendations", False, f"Only {len(recommendations)} recommendations")
                    
                # Test content performance retrieval
                if content_id:
                    perf_result = await self.test_endpoint(
                        "GET", f"/clp-engine/content/performance/{content_id}",
                        test_name="Get Content Performance"
                    )
                    
                    if "error" not in perf_result:
                        perf_metrics = perf_result.get("performance_metrics", {})
                        if "clp_efficiency" in perf_metrics and "conversion_rate" in perf_metrics:
                            self.log_test("Content Performance Metrics", True, "Performance metrics available")
                        else:
                            self.log_test("Content Performance Metrics", False, "Performance metrics incomplete")
            else:
                self.log_test("Content Optimization Response", False, f"Missing fields: {missing_fields}")
    
    # 4. Infinite Discovery Engine Tests
    async def test_infinite_discovery_engine(self):
        """Test infinite discovery engine functionality"""
        print("\n🔄 TESTING INFINITE DISCOVERY ENGINE")
        
        # Test discovery feed generation
        feed_request = {
            "user_id": "test_user_discovery",
            "context": {
                "feed_size": 15,
                "current_mood": "shopping",
                "session_intent": "discover"
            }
        }
        
        result = await self.test_endpoint(
            "POST", "/clp-engine/discovery/generate-feed",
            data=feed_request,
            test_name="Generate Infinite Discovery Feed"
        )
        
        if "error" not in result and result.get("success"):
            feed_data = result.get("feed_data", {})
            
            # Validate feed structure
            required_fields = ["feed_items", "engine_status", "feed_metadata"]
            missing_fields = [field for field in required_fields if field not in feed_data]
            
            if not missing_fields:
                self.log_test("Discovery Feed Structure", True, "Complete feed data structure")
                
                # Validate feed items
                feed_items = feed_data.get("feed_items", [])
                if len(feed_items) >= 10:
                    self.log_test("Discovery Feed Items", True, f"{len(feed_items)} personalized items generated")
                    
                    # Validate item structure
                    sample_item = feed_items[0] if feed_items else {}
                    item_fields = ["content_id", "content_type", "engagement_prediction", "conversion_prediction"]
                    missing_item_fields = [field for field in item_fields if field not in sample_item]
                    
                    if not missing_item_fields:
                        self.log_test("Feed Item Structure", True, "Feed items properly structured")
                    else:
                        self.log_test("Feed Item Structure", False, f"Missing item fields: {missing_item_fields}")
                else:
                    self.log_test("Discovery Feed Items", False, f"Only {len(feed_items)} items generated")
                    
                # Validate engine status
                engine_status = feed_data.get("engine_status", {})
                if "personalization_level" in engine_status and "predicted_engagement" in engine_status:
                    self.log_test("Discovery Engine Status", True, "Engine status properly reported")
                else:
                    self.log_test("Discovery Engine Status", False, "Engine status incomplete")
            else:
                self.log_test("Discovery Feed Structure", False, f"Missing fields: {missing_fields}")
        
        # Test discovery engine status
        status_result = await self.test_endpoint(
            "GET", "/clp-engine/discovery/engine-status/test_user_discovery",
            test_name="Get Discovery Engine Status"
        )
        
        if "error" not in status_result:
            # Validate status structure
            required_status = ["engine_status", "personalization_level", "learning_progress", "feed_performance"]
            missing_status = [field for field in required_status if field not in status_result]
            
            if not missing_status:
                self.log_test("Engine Status Structure", True, "Complete engine status available")
                
                # Validate learning progress
                learning_progress = status_result.get("learning_progress", {})
                if len(learning_progress) >= 3:
                    self.log_test("Engine Learning Progress", True, f"{len(learning_progress)} learning metrics tracked")
                else:
                    self.log_test("Engine Learning Progress", False, "Learning progress incomplete")
            else:
                self.log_test("Engine Status Structure", False, f"Missing status fields: {missing_status}")
    
    # 5. Conversion Tracking Tests
    async def test_conversion_tracking(self):
        """Test CLP conversion tracking functionality"""
        print("\n💰 TESTING CONVERSION TRACKING")
        
        # Test conversion tracking
        conversion_data = {
            "user_id": "test_user_conversion",
            "content_id": "converting_content_123",
            "primary_content_id": "converting_content_123",
            "first_exposure": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            "product_ids": ["product_conv_1", "product_conv_2"],
            "order_value": 299.99,
            "profit_margin": 0.35,
            "conversion_path": ["content_1", "content_2", "converting_content_123"],
            "touchpoints": [
                {"content_id": "content_1", "action": "view", "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat()},
                {"content_id": "content_2", "action": "like", "timestamp": (datetime.utcnow() - timedelta(hours=1)).isoformat()},
                {"content_id": "converting_content_123", "action": "click", "timestamp": datetime.utcnow().isoformat()}
            ],
            "customer_lifetime_value": 850.0
        }
        
        result = await self.test_endpoint(
            "POST", "/clp-engine/conversion/track",
            data=conversion_data,
            test_name="Track CLP Conversion"
        )
        
        if "error" not in result and result.get("success"):
            conversion = result.get("conversion", {})
            insights = result.get("insights", {})
            
            # Validate conversion tracking response
            required_fields = ["conversion_id", "attribution_analysis", "journey_efficiency", "revenue_impact"]
            missing_fields = [field for field in required_fields if field not in result or field not in insights]
            
            if not missing_fields:
                self.log_test("Conversion Tracking Response", True, "Complete conversion data tracked")
                
                # Validate journey efficiency
                journey_efficiency = insights.get("journey_efficiency", {})
                if "time_to_conversion_minutes" in journey_efficiency and "touchpoints_count" in journey_efficiency:
                    self.log_test("Journey Efficiency Analysis", True, "Conversion journey properly analyzed")
                else:
                    self.log_test("Journey Efficiency Analysis", False, "Journey analysis incomplete")
                    
                # Validate revenue impact
                revenue_impact = insights.get("revenue_impact", {})
                if "order_value" in revenue_impact and "customer_lifetime_value" in revenue_impact:
                    self.log_test("Revenue Impact Analysis", True, "Revenue impact properly calculated")
                else:
                    self.log_test("Revenue Impact Analysis", False, "Revenue impact incomplete")
            else:
                self.log_test("Conversion Tracking Response", False, f"Missing fields: {missing_fields}")
        
        # Test conversion funnel analysis
        funnel_result = await self.test_endpoint(
            "GET", "/clp-engine/conversion/funnel-analysis",
            data={"date_range": "7d"},
            test_name="Get Conversion Funnel Analysis"
        )
        
        if "error" not in funnel_result:
            # Validate funnel structure
            funnel_stages = funnel_result.get("funnel_stages", {})
            expected_stages = ["content_view", "product_interest", "consideration", "purchase_intent", "purchase"]
            stages_found = sum(1 for stage in expected_stages if stage in funnel_stages)
            
            if stages_found >= 4:
                self.log_test("Conversion Funnel Stages", True, f"{stages_found}/{len(expected_stages)} funnel stages analyzed")
                
                # Validate optimization opportunities
                opportunities = funnel_result.get("optimization_opportunities", [])
                if len(opportunities) >= 2:
                    self.log_test("Funnel Optimization Opportunities", True, f"{len(opportunities)} optimization opportunities identified")
                else:
                    self.log_test("Funnel Optimization Opportunities", False, f"Only {len(opportunities)} opportunities found")
            else:
                self.log_test("Conversion Funnel Stages", False, f"Only {stages_found}/{len(expected_stages)} stages found")
    
    # 6. Analytics and Insights Tests
    async def test_analytics_and_insights(self):
        """Test CLP analytics and insights functionality"""
        print("\n📈 TESTING ANALYTICS & INSIGHTS")
        
        # Test comprehensive analytics
        start_date = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
        end_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        result = await self.test_endpoint(
            "GET", "/clp-engine/analytics/comprehensive",
            data={"start_date": start_date, "end_date": end_date},
            test_name="Get Comprehensive CLP Analytics"
        )
        
        if "error" not in result:
            analytics = result.get("analytics", {})
            executive_summary = result.get("executive_summary", {})
            action_plan = result.get("action_plan", {})
            
            # Validate analytics structure
            required_analytics = ["top_performing_content", "content_optimization_opportunities", "clp_efficiency_scores"]
            missing_analytics = [field for field in required_analytics if field not in analytics]
            
            if not missing_analytics:
                self.log_test("Comprehensive Analytics Structure", True, "Complete analytics data available")
                
                # Validate executive summary
                summary_fields = ["total_revenue_attributed", "conversion_efficiency", "optimization_impact"]
                summary_complete = sum(1 for field in summary_fields if field in executive_summary)
                
                if summary_complete >= 2:
                    self.log_test("Executive Summary Completeness", True, f"{summary_complete}/{len(summary_fields)} summary metrics present")
                else:
                    self.log_test("Executive Summary Completeness", False, f"Only {summary_complete}/{len(summary_fields)} metrics found")
                    
                # Validate action plan
                if action_plan.get("priority_1") and action_plan.get("priority_2"):
                    self.log_test("Action Plan Generation", True, "Actionable priorities identified")
                else:
                    self.log_test("Action Plan Generation", False, "Action plan incomplete")
            else:
                self.log_test("Comprehensive Analytics Structure", False, f"Missing analytics: {missing_analytics}")
        
        # Test revenue attribution analysis
        attribution_result = await self.test_endpoint(
            "GET", "/clp-engine/analytics/revenue-attribution",
            test_name="Get Revenue Attribution Analysis"
        )
        
        if "error" not in attribution_result:
            # Validate attribution models
            attribution_models = attribution_result.get("attribution_models", {})
            expected_models = ["last_click", "first_click", "linear", "time_decay", "position_based"]
            models_found = sum(1 for model in expected_models if model in attribution_models)
            
            if models_found >= 4:
                self.log_test("Attribution Models Analysis", True, f"{models_found}/{len(expected_models)} attribution models analyzed")
                
                # Validate content attribution
                content_attribution = attribution_result.get("content_attribution", {})
                if len(content_attribution) >= 3:
                    self.log_test("Content Attribution Analysis", True, f"{len(content_attribution)} content types attributed")
                else:
                    self.log_test("Content Attribution Analysis", False, f"Only {len(content_attribution)} content types found")
                    
                # Validate creator attribution
                creator_attribution = attribution_result.get("creator_attribution", [])
                if len(creator_attribution) >= 5:
                    self.log_test("Creator Attribution Analysis", True, f"{len(creator_attribution)} creators analyzed")
                else:
                    self.log_test("Creator Attribution Analysis", False, f"Only {len(creator_attribution)} creators found")
            else:
                self.log_test("Attribution Models Analysis", False, f"Only {models_found}/{len(expected_models)} models found")
    
    # 7. Real-time Optimization Tests
    async def test_real_time_optimization(self):
        """Test real-time CLP optimization functionality"""
        print("\n⚡ TESTING REAL-TIME OPTIMIZATION")
        
        # Test real-time optimization trigger
        optimization_request = {
            "target_metrics": ["engagement", "conversion", "revenue"],
            "optimization_scope": "user_feed",
            "user_context": {
                "user_id": "test_user_optimization",
                "current_session_intent": "shopping",
                "engagement_history": ["high_engagement", "medium_conversion"]
            },
            "content_filters": {
                "content_types": ["video", "carousel"],
                "min_quality_score": 0.7
            }
        }
        
        result = await self.test_endpoint(
            "POST", "/clp-engine/optimization/real-time",
            data=optimization_request,
            test_name="Trigger Real-time Optimization"
        )
        
        if "error" not in result and result.get("success"):
            optimization = result.get("optimization", {})
            
            # Validate optimization response
            required_fields = ["optimization_id", "changes_applied", "expected_impact", "optimization_confidence"]
            missing_fields = [field for field in required_fields if field not in optimization]
            
            if not missing_fields:
                self.log_test("Real-time Optimization Response", True, "Complete optimization data provided")
                
                # Validate changes applied
                changes_applied = optimization.get("changes_applied", [])
                if len(changes_applied) >= 3:
                    self.log_test("Optimization Changes Applied", True, f"{len(changes_applied)} optimization changes applied")
                else:
                    self.log_test("Optimization Changes Applied", False, f"Only {len(changes_applied)} changes applied")
                    
                # Validate expected impact
                expected_impact = optimization.get("expected_impact", {})
                impact_metrics = ["engagement_improvement", "conversion_improvement", "revenue_impact"]
                impact_complete = sum(1 for metric in impact_metrics if metric in expected_impact)
                
                if impact_complete >= 2:
                    self.log_test("Optimization Impact Prediction", True, f"{impact_complete}/{len(impact_metrics)} impact metrics predicted")
                else:
                    self.log_test("Optimization Impact Prediction", False, f"Only {impact_complete}/{len(impact_metrics)} metrics predicted")
                    
                # Validate confidence score
                confidence = optimization.get("optimization_confidence", 0)
                if 0.7 <= confidence <= 1.0:
                    self.log_test("Optimization Confidence Score", True, f"High confidence: {confidence}")
                else:
                    self.log_test("Optimization Confidence Score", False, f"Low confidence: {confidence}")
            else:
                self.log_test("Real-time Optimization Response", False, f"Missing fields: {missing_fields}")
        
        # Test optimization impact analysis
        impact_result = await self.test_endpoint(
            "GET", "/clp-engine/optimization/impact-analysis",
            test_name="Get Optimization Impact Analysis"
        )
        
        if "error" not in impact_result:
            # Validate impact analysis structure
            required_sections = ["optimization_history", "cumulative_impact", "optimization_efficiency", "ai_learning_progress"]
            missing_sections = [section for section in required_sections if section not in impact_result]
            
            if not missing_sections:
                self.log_test("Impact Analysis Structure", True, "Complete impact analysis available")
                
                # Validate optimization history
                opt_history = impact_result.get("optimization_history", [])
                if len(opt_history) >= 5:
                    self.log_test("Optimization History Tracking", True, f"{len(opt_history)} optimization events tracked")
                else:
                    self.log_test("Optimization History Tracking", False, f"Only {len(opt_history)} events found")
                    
                # Validate cumulative impact
                cumulative_impact = impact_result.get("cumulative_impact", {})
                if "total_revenue_increase" in cumulative_impact and "engagement_improvement" in cumulative_impact:
                    self.log_test("Cumulative Impact Metrics", True, "Cumulative optimization impact tracked")
                else:
                    self.log_test("Cumulative Impact Metrics", False, "Cumulative impact incomplete")
            else:
                self.log_test("Impact Analysis Structure", False, f"Missing sections: {missing_sections}")
    
    # 8. Business Intelligence Tests
    async def test_business_intelligence(self):
        """Test CLP business intelligence functionality"""
        print("\n💼 TESTING BUSINESS INTELLIGENCE")
        
        # Test CLP ROI analysis
        result = await self.test_endpoint(
            "GET", "/clp-engine/business-intelligence/clp-roi",
            test_name="Get CLP ROI Analysis"
        )
        
        if "error" not in result:
            # Validate ROI analysis structure
            required_sections = ["investment_breakdown", "revenue_generation", "roi_metrics", "competitive_advantage"]
            missing_sections = [section for section in required_sections if section not in result]
            
            if not missing_sections:
                self.log_test("CLP ROI Analysis Structure", True, "Complete ROI analysis available")
                
                # Validate investment breakdown
                investment = result.get("investment_breakdown", {})
                if "total_investment" in investment and "content_creation_cost" in investment:
                    self.log_test("Investment Breakdown Analysis", True, "Investment costs properly tracked")
                else:
                    self.log_test("Investment Breakdown Analysis", False, "Investment breakdown incomplete")
                    
                # Validate revenue generation
                revenue = result.get("revenue_generation", {})
                if "total_revenue" in revenue and "attributed_clp_revenue" in revenue:
                    self.log_test("Revenue Generation Analysis", True, "Revenue attribution properly calculated")
                else:
                    self.log_test("Revenue Generation Analysis", False, "Revenue analysis incomplete")
                    
                # Validate ROI metrics
                roi_metrics = result.get("roi_metrics", {})
                if "overall_roi" in roi_metrics and "clp_specific_roi" in roi_metrics:
                    overall_roi = roi_metrics.get("overall_roi", 0)
                    if overall_roi > 100:  # ROI should be positive for a successful system
                        self.log_test("ROI Performance Validation", True, f"Positive ROI: {overall_roi}%")
                    else:
                        self.log_test("ROI Performance Validation", False, f"Low ROI: {overall_roi}%")
                else:
                    self.log_test("ROI Metrics Analysis", False, "ROI metrics incomplete")
                    
                # Validate competitive advantage
                competitive = result.get("competitive_advantage", {})
                if "market_conversion_rate" in competitive and "aislemarts_conversion_rate" in competitive:
                    market_rate = competitive.get("market_conversion_rate", 0)
                    aislemarts_rate = competitive.get("aislemarts_conversion_rate", 0)
                    
                    if aislemarts_rate > market_rate:
                        self.log_test("Competitive Advantage Validation", True, f"Above market performance: {aislemarts_rate} vs {market_rate}")
                    else:
                        self.log_test("Competitive Advantage Validation", False, f"Below market performance: {aislemarts_rate} vs {market_rate}")
                else:
                    self.log_test("Competitive Advantage Analysis", False, "Competitive analysis incomplete")
                    
                # Validate future projections
                projections = result.get("future_projections", {})
                if "12_month_roi_projection" in projections and "scalability_factor" in projections:
                    self.log_test("Future Projections Analysis", True, "Growth projections available")
                else:
                    self.log_test("Future Projections Analysis", False, "Projections incomplete")
            else:
                self.log_test("CLP ROI Analysis Structure", False, f"Missing sections: {missing_sections}")
    
    # 9. Performance and Load Testing
    async def test_performance_and_load(self):
        """Test system performance under load"""
        print("\n⚡ TESTING PERFORMANCE & LOAD HANDLING")
        
        # Test concurrent requests to health endpoint
        start_time = time.time()
        tasks = []
        
        for i in range(10):  # 10 concurrent requests
            task = self.test_endpoint(
                "GET", "/clp-engine/health",
                test_name=f"Concurrent CLP Health Check {i+1}"
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
            "GET", "/clp-engine/analytics/comprehensive",
            data={"start_date": "2024-01-01", "end_date": "2024-01-31"},
            test_name="Analytics Response Time Test"
        )
        response_time = time.time() - start_time
        
        if response_time < 5.0:  # Should respond within 5 seconds for complex analytics
            self.log_test("Analytics Response Time", True, f"Response time: {response_time:.3f}s")
        else:
            self.log_test("Analytics Response Time", False, f"Slow response: {response_time:.3f}s")
    
    # 10. Integration Tests
    async def test_existing_backend_integration(self):
        """Test that existing backend functionality remains intact"""
        print("\n🔗 TESTING EXISTING BACKEND INTEGRATION")
        
        # Test main API health
        result = await self.test_endpoint(
            "GET", "/health",
            test_name="Main API Health Check"
        )
        
        if "error" not in result and result.get("ok"):
            self.log_test("Main API Integration", True, "Main API remains operational")
        else:
            self.log_test("Main API Integration", False, "Main API integration issue")
        
        # Test currency system (existing functionality)
        currency_result = await self.test_endpoint(
            "GET", "/currency/health",
            test_name="Currency System Health Check"
        )
        
        if "error" not in currency_result:
            self.log_test("Currency System Integration", True, "Currency system operational")
        else:
            self.log_test("Currency System Integration", False, "Currency system integration issue")
        
        # Test AI Super Agent (existing functionality)
        ai_result = await self.test_endpoint(
            "GET", "/ai-super-agent/health",
            test_name="AI Super Agent Health Check"
        )
        
        if "error" not in ai_result:
            self.log_test("AI Super Agent Integration", True, "AI Super Agent operational")
        else:
            self.log_test("AI Super Agent Integration", False, "AI Super Agent integration issue")
        
        # Test rewards system (existing functionality)
        rewards_result = await self.test_endpoint(
            "GET", "/rewards/health",
            test_name="Rewards System Health Check"
        )
        
        if "error" not in rewards_result:
            self.log_test("Rewards System Integration", True, "Rewards system operational")
        else:
            self.log_test("Rewards System Integration", False, "Rewards system integration issue")

    async def run_all_tests(self):
        """Run all test suites"""
        print("🚀🎯💰 STARTING COMPREHENSIVE CLP ENGINE BACKEND TESTING")
        print("=" * 80)
        
        self.start_time = time.time()
        
        # Run all test suites
        await self.test_clp_engine_health_check()
        await self.test_content_engagement_tracking()
        await self.test_content_optimization()
        await self.test_infinite_discovery_engine()
        await self.test_conversion_tracking()
        await self.test_analytics_and_insights()
        await self.test_real_time_optimization()
        await self.test_business_intelligence()
        await self.test_performance_and_load()
        await self.test_existing_backend_integration()
        
        # Print final results
        total_time = time.time() - self.start_time
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print("\n" + "=" * 80)
        print("🏁 CLP ENGINE TESTING COMPLETE")
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
        
        print("\n🎯 CLP ENGINE TESTING FOCUS AREAS COVERED:")
        print("   ✅ CLP Engine Health Check & Status")
        print("   ✅ Content Engagement Tracking & Analytics")
        print("   ✅ Content Optimization & AI Enhancement")
        print("   ✅ Infinite Discovery Engine & Personalization")
        print("   ✅ Conversion Tracking & Attribution")
        print("   ✅ Analytics & Business Intelligence")
        print("   ✅ Real-time Optimization & AI Learning")
        print("   ✅ Business Intelligence & ROI Analysis")
        print("   ✅ Performance & Load Testing")
        print("   ✅ Existing Backend Integration Validation")
        
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
    async with CLPEngineTester() as tester:
        results = await tester.run_all_tests()
        
        # Determine overall system status
        if results["success_rate"] >= 90:
            print(f"\n🟢 SYSTEM STATUS: EXCELLENT - CLP Engine ready for Series A investor demonstrations")
        elif results["success_rate"] >= 75:
            print(f"\n🟡 SYSTEM STATUS: GOOD - Minor CLP Engine issues to address")
        elif results["success_rate"] >= 60:
            print(f"\n🟠 SYSTEM STATUS: FAIR - Several CLP Engine issues need attention")
        else:
            print(f"\n🔴 SYSTEM STATUS: NEEDS WORK - Major CLP Engine issues require immediate attention")
        
        return results

if __name__ == "__main__":
    asyncio.run(main())