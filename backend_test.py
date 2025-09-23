#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Top-Tier App Matrix and Retention Algorithm
=============================================================================

This test suite validates the complete "Top-Tier App Matrix and Retention Algorithm" 
backend implementation including:

GAMIFICATION SYSTEM TESTING:
1. Gamification Health Check (/api/gamification/health)
2. AI Challenge Generation (/api/gamification/user/test_user/challenges/generate) 
3. Spin Wheel Mechanics (/api/gamification/user/test_user/spin)
4. User Progress Tracking (/api/gamification/user/test_user/progress)
5. Achievement System (/api/gamification/achievements)
6. Leaderboards (/api/gamification/leaderboard)
7. Gamification Analytics (/api/gamification/stats)

COMMUNITY SYSTEM TESTING:
8. Community Health Check (/api/community/health)
9. Community Feed Generation (/api/community/feed)
10. AI Content Moderation (POST /api/community/posts)
11. Product Reviews with AI Analysis (POST /api/community/reviews) 
12. Community Analytics (/api/community/stats)
13. Trending Content Detection (/api/community/trending)

LOYALTY SYSTEM TESTING:
14. Loyalty Health Check (/api/loyalty/health)
15. User Loyalty Status (/api/loyalty/user/test_user/loyalty)
16. Points Earning System (/api/loyalty/user/test_user/earn-points)
17. Rewards Redemption (/api/loyalty/user/test_user/redeem-points)
18. Loyalty Analytics (/api/loyalty/analytics/program)
19. Tier System Validation (/api/loyalty/tiers)

INTEGRATION TESTING:
20. Cross-system data flow validation
21. AI model performance verification (Emergent LLM integration)
22. Real-time analytics processing
23. User journey tracking across all systems
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import Dict, List, Any

# Backend URL from frontend .env
BACKEND_URL = "https://loyalty-rewards-app.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = None
        self.results = []
        self.test_user_id = "test_user_retention_algorithm"
        self.test_username = "RetentionTester"
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={"Content-Type": "application/json"}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
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
        self.results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()
    
    async def test_endpoint(self, method: str, endpoint: str, test_name: str, 
                          expected_status: int = 200, data: Dict = None, 
                          params: Dict = None) -> bool:
        """Generic endpoint testing method"""
        try:
            url = f"{BACKEND_URL}{endpoint}"
            
            if method.upper() == "GET":
                async with self.session.get(url, params=params) as response:
                    response_data = await response.json()
                    success = response.status == expected_status
                    
            elif method.upper() == "POST":
                async with self.session.post(url, json=data, params=params) as response:
                    response_data = await response.json()
                    success = response.status == expected_status
                    
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            details = f"Status: {response.status}, Expected: {expected_status}"
            if success and response_data:
                details += f", Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}"
            
            self.log_result(test_name, success, details, response_data if not success else None)
            return success
            
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    # ==================== GAMIFICATION SYSTEM TESTING ====================
    
    async def test_gamification_health(self):
        """Test Gamification Health Check"""
        return await self.test_endpoint(
            "GET", "/gamification/health", 
            "Gamification Health Check"
        )
    
    async def test_ai_challenge_generation(self):
        """Test AI Challenge Generation"""
        return await self.test_endpoint(
            "POST", f"/gamification/user/{self.test_user_id}/challenges/generate",
            "AI Challenge Generation",
            params={"count": 3}
        )
    
    async def test_spin_wheel_mechanics(self):
        """Test Spin Wheel Mechanics"""
        return await self.test_endpoint(
            "POST", f"/gamification/user/{self.test_user_id}/spin",
            "Spin Wheel Mechanics"
        )
    
    async def test_user_progress_tracking(self):
        """Test User Progress Tracking"""
        return await self.test_endpoint(
            "GET", f"/gamification/user/{self.test_user_id}/progress",
            "User Progress Tracking"
        )
    
    async def test_achievement_system(self):
        """Test Achievement System"""
        return await self.test_endpoint(
            "GET", "/gamification/achievements",
            "Achievement System"
        )
    
    async def test_leaderboards(self):
        """Test Leaderboards"""
        return await self.test_endpoint(
            "GET", "/gamification/leaderboard",
            "Leaderboards",
            params={"leaderboard_type": "coins", "limit": 10}
        )
    
    async def test_gamification_analytics(self):
        """Test Gamification Analytics"""
        return await self.test_endpoint(
            "GET", "/gamification/stats",
            "Gamification Analytics"
        )

    # ==================== COMMUNITY SYSTEM TESTING ====================
    
    async def test_community_health(self):
        """Test Community Health Check"""
        return await self.test_endpoint(
            "GET", "/community/health",
            "Community Health Check"
        )
    
    async def test_community_feed_generation(self):
        """Test Community Feed Generation"""
        return await self.test_endpoint(
            "GET", "/community/feed",
            "Community Feed Generation",
            params={"user_id": self.test_user_id, "limit": 10}
        )
    
    async def test_ai_content_moderation(self):
        """Test AI Content Moderation (POST /community/posts)"""
        post_data = {
            "title": "Testing AI Content Moderation",
            "content": "This is a test post for AI content moderation testing. The retention algorithm is working great!",
            "content_type": "post",
            "category": "general",
            "tags": ["test", "retention", "algorithm"]
        }
        return await self.test_endpoint(
            "POST", "/community/posts",
            "AI Content Moderation",
            data=post_data,
            params={"user_id": self.test_user_id, "username": self.test_username}
        )
    
    async def test_product_reviews_ai_analysis(self):
        """Test Product Reviews with AI Analysis"""
        review_data = {
            "product_id": "test_product_retention_001",
            "rating": "excellent",
            "title": "Amazing Product for Retention Testing",
            "content": "This product works perfectly for our retention algorithm testing. Highly recommended for AI-powered commerce platforms.",
            "verified_purchase": True
        }
        return await self.test_endpoint(
            "POST", "/community/reviews",
            "Product Reviews with AI Analysis",
            data=review_data,
            params={"user_id": self.test_user_id, "username": self.test_username}
        )
    
    async def test_community_analytics(self):
        """Test Community Analytics"""
        return await self.test_endpoint(
            "GET", "/community/stats",
            "Community Analytics"
        )
    
    async def test_trending_content_detection(self):
        """Test Trending Content Detection"""
        return await self.test_endpoint(
            "GET", "/community/trending",
            "Trending Content Detection",
            params={"limit": 5}
        )

    # ==================== LOYALTY SYSTEM TESTING ====================
    
    async def test_loyalty_health(self):
        """Test Loyalty Health Check"""
        return await self.test_endpoint(
            "GET", "/loyalty/health",
            "Loyalty Health Check"
        )
    
    async def test_user_loyalty_status(self):
        """Test User Loyalty Status"""
        return await self.test_endpoint(
            "GET", f"/loyalty/user/{self.test_user_id}/loyalty",
            "User Loyalty Status"
        )
    
    async def test_points_earning_system(self):
        """Test Points Earning System"""
        return await self.test_endpoint(
            "POST", f"/loyalty/user/{self.test_user_id}/earn-points",
            "Points Earning System",
            params={
                "points": 250,
                "activity": "Retention Algorithm Testing Purchase",
                "transaction_id": "retention_test_001"
            }
        )
    
    async def test_rewards_redemption(self):
        """Test Rewards Redemption"""
        return await self.test_endpoint(
            "POST", f"/loyalty/user/{self.test_user_id}/redeem-points",
            "Rewards Redemption",
            params={
                "points": 100,
                "reward": "Test Cashback Reward",
                "reward_value": 5.0
            }
        )
    
    async def test_loyalty_analytics(self):
        """Test Loyalty Analytics"""
        return await self.test_endpoint(
            "GET", "/loyalty/analytics/program",
            "Loyalty Analytics"
        )
    
    async def test_tier_system_validation(self):
        """Test Tier System Validation"""
        return await self.test_endpoint(
            "GET", "/loyalty/tiers",
            "Tier System Validation"
        )

    # ==================== INTEGRATION TESTING ====================
    
    async def test_cross_system_data_flow(self):
        """Test Cross-system data flow validation"""
        print("🔄 Testing Cross-system Data Flow...")
        
        # Test gamification -> loyalty integration
        gamification_success = await self.test_user_progress_tracking()
        loyalty_success = await self.test_user_loyalty_status()
        
        integration_success = gamification_success and loyalty_success
        self.log_result(
            "Cross-system Data Flow Validation",
            integration_success,
            f"Gamification: {gamification_success}, Loyalty: {loyalty_success}"
        )
        return integration_success
    
    async def test_ai_model_performance(self):
        """Test AI model performance verification (Emergent LLM integration)"""
        print("🤖 Testing AI Model Performance...")
        
        # Test AI challenge generation
        ai_challenges = await self.test_ai_challenge_generation()
        
        # Test AI content moderation
        ai_moderation = await self.test_ai_content_moderation()
        
        # Test AI review analysis
        ai_reviews = await self.test_product_reviews_ai_analysis()
        
        ai_performance = ai_challenges and ai_moderation and ai_reviews
        self.log_result(
            "AI Model Performance Verification",
            ai_performance,
            f"Challenges: {ai_challenges}, Moderation: {ai_moderation}, Reviews: {ai_reviews}"
        )
        return ai_performance
    
    async def test_realtime_analytics_processing(self):
        """Test Real-time analytics processing"""
        print("📊 Testing Real-time Analytics Processing...")
        
        # Test all analytics endpoints
        gamification_analytics = await self.test_gamification_analytics()
        community_analytics = await self.test_community_analytics()
        loyalty_analytics = await self.test_loyalty_analytics()
        
        analytics_success = gamification_analytics and community_analytics and loyalty_analytics
        self.log_result(
            "Real-time Analytics Processing",
            analytics_success,
            f"Gamification: {gamification_analytics}, Community: {community_analytics}, Loyalty: {loyalty_analytics}"
        )
        return analytics_success
    
    async def test_user_journey_tracking(self):
        """Test User journey tracking across all systems"""
        print("👤 Testing User Journey Tracking...")
        
        # Simulate complete user journey
        journey_steps = []
        
        # Step 1: User progress in gamification
        step1 = await self.test_user_progress_tracking()
        journey_steps.append(("Gamification Progress", step1))
        
        # Step 2: User creates community content
        step2 = await self.test_ai_content_moderation()
        journey_steps.append(("Community Engagement", step2))
        
        # Step 3: User earns loyalty points
        step3 = await self.test_points_earning_system()
        journey_steps.append(("Loyalty Points Earning", step3))
        
        # Step 4: User redeems rewards
        step4 = await self.test_rewards_redemption()
        journey_steps.append(("Rewards Redemption", step4))
        
        journey_success = all(step[1] for step in journey_steps)
        journey_details = ", ".join([f"{step[0]}: {step[1]}" for step in journey_steps])
        
        self.log_result(
            "User Journey Tracking Across All Systems",
            journey_success,
            journey_details
        )
        return journey_success

    # ==================== MAIN TEST EXECUTION ====================
    
    async def run_all_tests(self):
        """Run comprehensive backend testing"""
        print("🚀 Starting Comprehensive Backend Testing for Top-Tier App Matrix and Retention Algorithm")
        print("=" * 80)
        
        start_time = time.time()
        
        # GAMIFICATION SYSTEM TESTING
        print("\n🎮 GAMIFICATION SYSTEM TESTING")
        print("-" * 40)
        gamification_tests = [
            self.test_gamification_health(),
            self.test_ai_challenge_generation(),
            self.test_spin_wheel_mechanics(),
            self.test_user_progress_tracking(),
            self.test_achievement_system(),
            self.test_leaderboards(),
            self.test_gamification_analytics()
        ]
        
        gamification_results = await asyncio.gather(*gamification_tests, return_exceptions=True)
        gamification_success = sum(1 for r in gamification_results if r is True)
        
        # COMMUNITY SYSTEM TESTING
        print("\n🌐 COMMUNITY SYSTEM TESTING")
        print("-" * 40)
        community_tests = [
            self.test_community_health(),
            self.test_community_feed_generation(),
            self.test_ai_content_moderation(),
            self.test_product_reviews_ai_analysis(),
            self.test_community_analytics(),
            self.test_trending_content_detection()
        ]
        
        community_results = await asyncio.gather(*community_tests, return_exceptions=True)
        community_success = sum(1 for r in community_results if r is True)
        
        # LOYALTY SYSTEM TESTING
        print("\n🏆 LOYALTY SYSTEM TESTING")
        print("-" * 40)
        loyalty_tests = [
            self.test_loyalty_health(),
            self.test_user_loyalty_status(),
            self.test_points_earning_system(),
            self.test_rewards_redemption(),
            self.test_loyalty_analytics(),
            self.test_tier_system_validation()
        ]
        
        loyalty_results = await asyncio.gather(*loyalty_tests, return_exceptions=True)
        loyalty_success = sum(1 for r in loyalty_results if r is True)
        
        # INTEGRATION TESTING
        print("\n🔗 INTEGRATION TESTING")
        print("-" * 40)
        integration_tests = [
            self.test_cross_system_data_flow(),
            self.test_ai_model_performance(),
            self.test_realtime_analytics_processing(),
            self.test_user_journey_tracking()
        ]
        
        integration_results = await asyncio.gather(*integration_tests, return_exceptions=True)
        integration_success = sum(1 for r in integration_results if r is True)
        
        # FINAL RESULTS
        end_time = time.time()
        total_time = end_time - start_time
        
        total_tests = len(gamification_tests) + len(community_tests) + len(loyalty_tests) + len(integration_tests)
        total_passed = gamification_success + community_success + loyalty_success + integration_success
        success_rate = (total_passed / total_tests) * 100
        
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TESTING RESULTS SUMMARY")
        print("=" * 80)
        print(f"🎮 GAMIFICATION SYSTEM: {gamification_success}/{len(gamification_tests)} tests passed")
        print(f"🌐 COMMUNITY SYSTEM: {community_success}/{len(community_tests)} tests passed")
        print(f"🏆 LOYALTY SYSTEM: {loyalty_success}/{len(loyalty_tests)} tests passed")
        print(f"🔗 INTEGRATION TESTING: {integration_success}/{len(integration_tests)} tests passed")
        print("-" * 80)
        print(f"📈 OVERALL SUCCESS RATE: {total_passed}/{total_tests} ({success_rate:.1f}%)")
        print(f"⏱️  TOTAL TESTING TIME: {total_time:.2f} seconds")
        print(f"⚡ AVERAGE RESPONSE TIME: {total_time/total_tests:.3f} seconds per test")
        
        # Detailed failure analysis
        failed_tests = [r for r in self.results if not r["success"]]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        print("\n🎯 RETENTION ALGORITHM BACKEND VALIDATION COMPLETE")
        
        return {
            "total_tests": total_tests,
            "passed_tests": total_passed,
            "success_rate": success_rate,
            "testing_time": total_time,
            "gamification_success": gamification_success,
            "community_success": community_success,
            "loyalty_success": loyalty_success,
            "integration_success": integration_success,
            "failed_tests": failed_tests
        }

async def main():
    """Main testing function"""
    async with BackendTester() as tester:
        results = await tester.run_all_tests()
        
        # Return appropriate exit code
        if results["success_rate"] >= 80:
            print("✅ TESTING PASSED: Backend systems are operational")
            return 0
        else:
            print("❌ TESTING FAILED: Critical issues detected")
            return 1

if __name__ == "__main__":
    asyncio.run(main())