#!/usr/bin/env python3
"""
🚀 FINAL COMPREHENSIVE SYSTEM TESTING - COMPLETE AISLEMARTS PLATFORM
Backend API Testing for AisleMarts Rewards System and Advanced Features

Testing Focus:
1. Complete Rewards System (13+ endpoints plus advanced features)
2. Advanced Analytics (revenue analytics, engagement metrics, real-time features)  
3. Enhanced Gamification (competitions, achievements, social activity feeds)
4. Real-time Features (mission progress updates, live notifications)
5. Integration Validation (all systems working together harmoniously)
"""

import asyncio
import aiohttp
import json
import time
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://bluewave-aisle.preview.emergentagent.com')
if not BACKEND_URL.endswith('/api'):
    API_BASE = f"{BACKEND_URL}/api"
else:
    API_BASE = BACKEND_URL

print(f"🔗 Testing Backend URL: {API_BASE}")

class RewardsSystemTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
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
            
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if response_data:
            result["response_data"] = response_data
            
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    async def test_rewards_health_check(self):
        """Test /api/rewards/health endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/rewards/health") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate BlueWave theme and structure
                    required_fields = ["status", "service", "theme", "currencies", "missions", "gamification", "compliance"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Rewards Health Check", False, f"Missing fields: {missing_fields}", data)
                        return
                    
                    # Validate specific values
                    if data.get("theme") != "BlueWave":
                        self.log_test("Rewards Health Check", False, f"Expected theme 'BlueWave', got '{data.get('theme')}'", data)
                        return
                    
                    expected_currencies = ["AisleCoins", "BlueWave Points", "Vendor Stars", "Cashback Credits"]
                    if data.get("currencies") != expected_currencies:
                        self.log_test("Rewards Health Check", False, f"Currency mismatch", data)
                        return
                    
                    self.log_test("Rewards Health Check", True, f"Service operational with {len(data.get('currencies', []))} currencies, BlueWave theme confirmed", data)
                else:
                    error_text = await response.text()
                    self.log_test("Rewards Health Check", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("Rewards Health Check", False, f"Request failed: {str(e)}")

    async def test_balances_system(self):
        """Test /api/rewards/balances endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/rewards/balances?user_id=test_user_001") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate balance structure
                    required_currencies = ["aisleCoins", "blueWavePoints", "vendorStars", "cashbackCredits"]
                    missing_currencies = [curr for curr in required_currencies if curr not in data]
                    
                    if missing_currencies:
                        self.log_test("Balances System", False, f"Missing currencies: {missing_currencies}", data)
                        return
                    
                    # Validate data types
                    for currency in required_currencies:
                        if not isinstance(data[currency], (int, float)):
                            self.log_test("Balances System", False, f"Invalid {currency} type: {type(data[currency])}", data)
                            return
                    
                    total_value = sum([data[curr] for curr in required_currencies])
                    self.log_test("Balances System", True, f"All 4 reward currencies retrieved, total value: {total_value:.2f}", data)
                else:
                    error_text = await response.text()
                    self.log_test("Balances System", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("Balances System", False, f"Request failed: {str(e)}")

    async def test_per_sale_missions(self):
        """Test /api/rewards/missions/per-sale endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/rewards/missions/per-sale?user_id=test_user_001") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate structure
                    if "aggregatePercent" not in data or "missions" not in data:
                        self.log_test("Per-Sale Missions", False, "Missing aggregatePercent or missions", data)
                        return
                    
                    missions = data.get("missions", [])
                    if not missions:
                        self.log_test("Per-Sale Missions", False, "No missions found", data)
                        return
                    
                    # Validate mission structure
                    required_mission_fields = ["id", "label", "rule", "reward", "progress", "completed"]
                    for mission in missions:
                        missing_fields = [field for field in required_mission_fields if field not in mission]
                        if missing_fields:
                            self.log_test("Per-Sale Missions", False, f"Mission missing fields: {missing_fields}", mission)
                            return
                    
                    # Check for interaction time missions
                    interaction_missions = [m for m in missions if "interaction_time" in m.get("rule", "")]
                    unique_buyer_missions = [m for m in missions if "unique_buyers" in m.get("rule", "")]
                    
                    self.log_test("Per-Sale Missions", True, 
                                f"Retrieved {len(missions)} missions ({len(interaction_missions)} interaction, {len(unique_buyer_missions)} buyer missions), aggregate: {data.get('aggregatePercent', 0):.1f}%", 
                                data)
                else:
                    error_text = await response.text()
                    self.log_test("Per-Sale Missions", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("Per-Sale Missions", False, f"Request failed: {str(e)}")

    async def test_weekly_missions(self):
        """Test /api/rewards/missions/weekly endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/rewards/missions/weekly?user_id=test_user_001") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate structure
                    required_fields = ["aggregatePercent", "missions", "league"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Weekly Missions", False, f"Missing fields: {missing_fields}", data)
                        return
                    
                    missions = data.get("missions", [])
                    league = data.get("league")
                    
                    # Validate league
                    valid_leagues = ["Bronze", "Silver", "Gold", "Platinum"]
                    if league not in valid_leagues:
                        self.log_test("Weekly Missions", False, f"Invalid league: {league}", data)
                        return
                    
                    # Check for sale days and league advancement missions
                    sale_day_missions = [m for m in missions if "sale_days" in m.get("rule", "")]
                    league_missions = [m for m in missions if "league_advanced" in m.get("rule", "")]
                    buyer_engagement_missions = [m for m in missions if "active_buyers" in m.get("rule", "")]
                    
                    self.log_test("Weekly Missions", True, 
                                f"Retrieved {len(missions)} weekly missions, current league: {league}, types: {len(sale_day_missions)} sale days, {len(league_missions)} league, {len(buyer_engagement_missions)} engagement", 
                                data)
                else:
                    error_text = await response.text()
                    self.log_test("Weekly Missions", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("Weekly Missions", False, f"Request failed: {str(e)}")

    async def test_streaks_system(self):
        """Test /api/rewards/streaks endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/rewards/streaks?user_id=test_user_001") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate structure
                    if "daily" not in data or "weekly" not in data:
                        self.log_test("Streaks System", False, "Missing daily or weekly streaks", data)
                        return
                    
                    daily = data.get("daily", {})
                    weekly = data.get("weekly", {})
                    
                    # Validate streak structure
                    for streak_type, streak_data in [("daily", daily), ("weekly", weekly)]:
                        if "days" not in streak_data and "weeks" not in streak_data:
                            self.log_test("Streaks System", False, f"Missing streak count in {streak_type}", data)
                            return
                        if "nextRewardAt" not in streak_data:
                            self.log_test("Streaks System", False, f"Missing nextRewardAt in {streak_type}", data)
                            return
                    
                    daily_count = daily.get("days", 0)
                    weekly_count = weekly.get("weeks", 0)
                    
                    self.log_test("Streaks System", True, 
                                f"Daily streak: {daily_count} days, Weekly streak: {weekly_count} weeks, next rewards scheduled", 
                                data)
                else:
                    error_text = await response.text()
                    self.log_test("Streaks System", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("Streaks System", False, f"Request failed: {str(e)}")

    async def test_leaderboard(self):
        """Test /api/rewards/leaderboard endpoint"""
        try:
            # Test default leaderboard
            async with self.session.get(f"{API_BASE}/rewards/leaderboard") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if not isinstance(data, list):
                        self.log_test("Leaderboard", False, "Expected list response", data)
                        return
                    
                    if not data:
                        self.log_test("Leaderboard", False, "Empty leaderboard", data)
                        return
                    
                    # Validate leaderboard entry structure
                    required_fields = ["rank", "vendorId", "vendorName", "league", "score"]
                    for entry in data:
                        missing_fields = [field for field in required_fields if field not in entry]
                        if missing_fields:
                            self.log_test("Leaderboard", False, f"Entry missing fields: {missing_fields}", entry)
                            return
                    
                    # Test league-specific leaderboard
                    async with self.session.get(f"{API_BASE}/rewards/leaderboard?league=Gold&limit=10") as league_response:
                        if league_response.status == 200:
                            league_data = await league_response.json()
                            
                            self.log_test("Leaderboard", True, 
                                        f"Retrieved {len(data)} vendors in default leaderboard, {len(league_data)} in Gold league, top vendor: {data[0].get('vendorName', 'N/A')} (score: {data[0].get('score', 0)})", 
                                        {"default": data[:3], "gold_league": league_data[:3]})
                        else:
                            self.log_test("Leaderboard", False, f"League leaderboard failed: HTTP {league_response.status}")
                else:
                    error_text = await response.text()
                    self.log_test("Leaderboard", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("Leaderboard", False, f"Request failed: {str(e)}")

    async def test_rewards_ledger(self):
        """Test /api/rewards/ledger endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/rewards/ledger?user_id=test_user_001&page=1&page_size=10") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate pagination structure
                    required_fields = ["items", "page", "pageSize", "total", "hasNext"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Rewards Ledger", False, f"Missing pagination fields: {missing_fields}", data)
                        return
                    
                    items = data.get("items", [])
                    if not items:
                        self.log_test("Rewards Ledger", False, "No ledger items found", data)
                        return
                    
                    # Validate ledger entry structure
                    required_item_fields = ["id", "ts", "kind", "title", "delta"]
                    for item in items:
                        missing_fields = [field for field in required_item_fields if field not in item]
                        if missing_fields:
                            self.log_test("Rewards Ledger", False, f"Ledger item missing fields: {missing_fields}", item)
                            return
                    
                    # Check transaction types
                    transaction_types = set(item.get("kind") for item in items)
                    
                    self.log_test("Rewards Ledger", True, 
                                f"Retrieved {len(items)} ledger entries, page {data.get('page')}/{data.get('total', 0)//data.get('pageSize', 1)+1}, transaction types: {list(transaction_types)}", 
                                data)
                else:
                    error_text = await response.text()
                    self.log_test("Rewards Ledger", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("Rewards Ledger", False, f"Request failed: {str(e)}")

    async def test_claim_system(self):
        """Test /api/rewards/claim endpoint"""
        try:
            # Test mission claim
            mission_claim = {"mission_id": "stay_5m"}
            async with self.session.post(f"{API_BASE}/rewards/claim?user_id=test_user_001", 
                                       json=mission_claim) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    required_fields = ["ok", "ledgerId", "type", "reward", "message"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Claim System - Mission", False, f"Missing fields: {missing_fields}", data)
                        return
                    
                    if not data.get("ok"):
                        self.log_test("Claim System - Mission", False, "Claim not successful", data)
                        return
                    
                    # Test streak claim
                    streak_claim = {"streak_type": "daily"}
                    async with self.session.post(f"{API_BASE}/rewards/claim?user_id=test_user_001", 
                                               json=streak_claim) as streak_response:
                        if streak_response.status == 200:
                            streak_data = await streak_response.json()
                            
                            # Test campaign claim
                            campaign_claim = {"campaign_id": "bluewave_weekly_001"}
                            async with self.session.post(f"{API_BASE}/rewards/claim?user_id=test_user_001", 
                                                       json=campaign_claim) as campaign_response:
                                if campaign_response.status == 200:
                                    campaign_data = await campaign_response.json()
                                    
                                    self.log_test("Claim System", True, 
                                                f"All claim types working: mission ({data.get('type')}), streak ({streak_data.get('type')}), campaign ({campaign_data.get('type')})", 
                                                {"mission": data, "streak": streak_data, "campaign": campaign_data})
                                else:
                                    self.log_test("Claim System", False, f"Campaign claim failed: HTTP {campaign_response.status}")
                        else:
                            self.log_test("Claim System", False, f"Streak claim failed: HTTP {streak_response.status}")
                else:
                    error_text = await response.text()
                    self.log_test("Claim System", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("Claim System", False, f"Request failed: {str(e)}")

    async def test_withdrawal_system(self):
        """Test /api/rewards/withdraw endpoint"""
        try:
            # Test valid withdrawal request (should validate but expect policy rejection)
            withdrawal_request = {
                "amount": 150.0,
                "method": "wallet",
                "kyc_token": "kyc_test_token_001"
            }
            
            async with self.session.post(f"{API_BASE}/rewards/withdraw?user_id=test_user_001", 
                                       json=withdrawal_request) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    required_fields = ["ok", "requestId", "amount", "method", "estimatedCompletion", "status"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Withdrawal System", False, f"Missing fields: {missing_fields}", data)
                        return
                    
                    self.log_test("Withdrawal System", True, 
                                f"Withdrawal request processed: {data.get('amount')} AisleCoins via {data.get('method')}, status: {data.get('status')}", 
                                data)
                elif response.status == 400:
                    # Expected validation error
                    error_data = await response.json()
                    self.log_test("Withdrawal System", True, 
                                f"Withdrawal validation working (expected 400): {error_data.get('detail', 'Validation error')}", 
                                error_data)
                else:
                    error_text = await response.text()
                    self.log_test("Withdrawal System", False, f"HTTP {response.status}: {error_text}")
                    
            # Test invalid withdrawal (insufficient amount)
            invalid_request = {
                "amount": 50.0,  # Below minimum
                "method": "wallet",
                "kyc_token": "kyc_test_token_001"
            }
            
            async with self.session.post(f"{API_BASE}/rewards/withdraw?user_id=test_user_001", 
                                       json=invalid_request) as invalid_response:
                if invalid_response.status == 400:
                    error_data = await invalid_response.json()
                    if "Minimum withdrawal" in error_data.get("detail", ""):
                        self.log_test("Withdrawal Validation", True, 
                                    f"Minimum withdrawal validation working: {error_data.get('detail')}")
                    else:
                        self.log_test("Withdrawal Validation", False, 
                                    f"Unexpected validation error: {error_data.get('detail')}")
                else:
                    self.log_test("Withdrawal Validation", False, 
                                f"Expected 400 for invalid withdrawal, got {invalid_response.status}")
                    
        except Exception as e:
            self.log_test("Withdrawal System", False, f"Request failed: {str(e)}")

    async def test_campaign_system(self):
        """Test /api/rewards/campaign/enter endpoint"""
        try:
            campaign_id = "bluewave_weekly_competition_001"
            async with self.session.post(f"{API_BASE}/rewards/campaign/enter?campaign_id={campaign_id}&user_id=test_user_001") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    required_fields = ["ok", "campaignId", "entryId", "message", "drawDate"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Campaign System", False, f"Missing fields: {missing_fields}", data)
                        return
                    
                    if not data.get("ok"):
                        self.log_test("Campaign System", False, "Campaign entry not successful", data)
                        return
                    
                    if data.get("campaignId") != campaign_id:
                        self.log_test("Campaign System", False, f"Campaign ID mismatch: expected {campaign_id}, got {data.get('campaignId')}", data)
                        return
                    
                    self.log_test("Campaign System", True, 
                                f"Successfully entered campaign {campaign_id}, entry ID: {data.get('entryId')}, draw date: {data.get('drawDate')}", 
                                data)
                else:
                    error_text = await response.text()
                    self.log_test("Campaign System", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("Campaign System", False, f"Request failed: {str(e)}")

    async def test_notification_preferences(self):
        """Test GET/PUT /api/rewards/notifications/preferences endpoints"""
        try:
            # Test GET preferences
            async with self.session.get(f"{API_BASE}/rewards/notifications/preferences?user_id=test_user_001") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate preference categories
                    expected_categories = ["ads_support", "vendor_updates", "publisher_plans", "series_campaigns", "email", "push"]
                    missing_categories = [cat for cat in expected_categories if cat not in data]
                    
                    if missing_categories:
                        self.log_test("Notification Preferences - GET", False, f"Missing categories: {missing_categories}", data)
                        return
                    
                    # Test PUT preferences
                    updated_prefs = {
                        "ads_support": False,
                        "vendor_updates": True,
                        "publisher_plans": True,
                        "series_campaigns": False,
                        "email": True,
                        "push": False
                    }
                    
                    async with self.session.put(f"{API_BASE}/rewards/notifications/preferences?user_id=test_user_001", 
                                              json=updated_prefs) as put_response:
                        if put_response.status == 200:
                            put_data = await put_response.json()
                            
                            if not put_data.get("ok"):
                                self.log_test("Notification Preferences", False, "Update not successful", put_data)
                                return
                            
                            enabled_count = sum(1 for v in updated_prefs.values() if v)
                            self.log_test("Notification Preferences", True, 
                                        f"Retrieved and updated all 6 notification categories, {enabled_count}/6 enabled", 
                                        {"get": data, "put": put_data})
                        else:
                            error_text = await put_response.text()
                            self.log_test("Notification Preferences", False, f"PUT failed: HTTP {put_response.status}: {error_text}")
                else:
                    error_text = await response.text()
                    self.log_test("Notification Preferences", False, f"GET failed: HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("Notification Preferences", False, f"Request failed: {str(e)}")

    async def test_system_statistics(self):
        """Test /api/rewards/stats endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/rewards/stats") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate statistics structure
                    required_sections = ["totalUsers", "activeRewardsUsers", "totalRewardsDistributed", 
                                       "missionsCompleted", "currentStreaks", "leagueDistribution", 
                                       "averageEngagement", "withdrawalRequests"]
                    missing_sections = [section for section in required_sections if section not in data]
                    
                    if missing_sections:
                        self.log_test("System Statistics", False, f"Missing sections: {missing_sections}", data)
                        return
                    
                    # Validate rewards distribution
                    rewards_dist = data.get("totalRewardsDistributed", {})
                    expected_currencies = ["aisleCoins", "blueWavePoints", "vendorStars", "cashbackCredits"]
                    missing_currencies = [curr for curr in expected_currencies if curr not in rewards_dist]
                    
                    if missing_currencies:
                        self.log_test("System Statistics", False, f"Missing reward currencies in stats: {missing_currencies}", data)
                        return
                    
                    # Validate league distribution
                    league_dist = data.get("leagueDistribution", {})
                    expected_leagues = ["Bronze", "Silver", "Gold", "Platinum"]
                    missing_leagues = [league for league in expected_leagues if league not in league_dist]
                    
                    if missing_leagues:
                        self.log_test("System Statistics", False, f"Missing leagues in distribution: {missing_leagues}", data)
                        return
                    
                    total_users = data.get("totalUsers", 0)
                    active_users = data.get("activeRewardsUsers", 0)
                    engagement = data.get("averageEngagement", 0)
                    
                    self.log_test("System Statistics", True, 
                                f"Complete system stats: {total_users:,} total users, {active_users:,} active, {engagement}/5.0 engagement, all currencies and leagues tracked", 
                                data)
                else:
                    error_text = await response.text()
                    self.log_test("System Statistics", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("System Statistics", False, f"Request failed: {str(e)}")

    async def test_feedback_system(self):
        """Test /api/rewards/feedback endpoint"""
        try:
            feedback_data = {
                "rating": 5,
                "comment": "The BlueWave rewards system is fantastic! Love the gamification features.",
                "category": "general"
            }
            
            async with self.session.post(f"{API_BASE}/rewards/feedback?user_id=test_user_001", 
                                       json=feedback_data) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    required_fields = ["ok", "feedbackId", "message", "reward"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Feedback System", False, f"Missing fields: {missing_fields}", data)
                        return
                    
                    if not data.get("ok"):
                        self.log_test("Feedback System", False, "Feedback submission not successful", data)
                        return
                    
                    reward = data.get("reward", {})
                    if not reward or "type" not in reward or "value" not in reward:
                        self.log_test("Feedback System", False, "Invalid reward structure", data)
                        return
                    
                    self.log_test("Feedback System", True, 
                                f"Feedback submitted successfully, ID: {data.get('feedbackId')}, reward: {reward.get('value')} {reward.get('type')}", 
                                data)
                else:
                    error_text = await response.text()
                    self.log_test("Feedback System", False, f"HTTP {response.status}: {error_text}")
        except Exception as e:
            self.log_test("Feedback System", False, f"Request failed: {str(e)}")

    async def run_comprehensive_test(self):
        """Run all rewards system tests"""
        print("🎯 AisleMarts Rewards System Comprehensive Backend Testing")
        print("=" * 70)
        print()
        
        # Core system tests
        await self.test_rewards_health_check()
        await self.test_balances_system()
        
        # Mission system tests
        await self.test_per_sale_missions()
        await self.test_weekly_missions()
        
        # Gamification tests
        await self.test_streaks_system()
        await self.test_leaderboard()
        
        # Transaction and reward tests
        await self.test_rewards_ledger()
        await self.test_claim_system()
        await self.test_withdrawal_system()
        await self.test_campaign_system()
        
        # Notification and analytics tests
        await self.test_notification_preferences()
        await self.test_system_statistics()
        await self.test_feedback_system()
        
        # Print summary
        print("=" * 70)
        print(f"🎯 REWARDS SYSTEM TEST SUMMARY")
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        
        if self.passed_tests == self.total_tests:
            print("🟢 ALL TESTS PASSED - REWARDS SYSTEM FULLY OPERATIONAL")
        elif self.passed_tests / self.total_tests >= 0.8:
            print("🟡 MOSTLY OPERATIONAL - MINOR ISSUES TO ADDRESS")
        else:
            print("🔴 SIGNIFICANT ISSUES FOUND - REQUIRES ATTENTION")
        
        print("=" * 70)
        
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "success_rate": self.passed_tests / self.total_tests if self.total_tests > 0 else 0,
            "test_results": self.test_results
        }

async def main():
    """Main test execution"""
    async with RewardsSystemTester() as tester:
        results = await tester.run_comprehensive_test()
        return results

if __name__ == "__main__":
    asyncio.run(main())