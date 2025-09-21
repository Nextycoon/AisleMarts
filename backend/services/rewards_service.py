"""
🎯 AisleMarts Rewards Service
Business logic for BlueWave-themed gamification, missions, and rewards
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Literal
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class RewardsService:
    def __init__(self):
        self.currencies = {
            "aisle_coins": "AisleCoins",
            "bluewave_points": "BlueWave Points", 
            "vendor_stars": "Vendor Stars",
            "cashback_credits": "Cashback Credits"
        }
        self.leagues = ["Bronze", "Silver", "Gold", "Platinum"]
        
        # Mock mission definitions
        self.per_sale_missions = [
            {
                "id": "stay_5m",
                "label": "Engage ≥ 5 minutes",
                "rule": "interaction_time >= 5",
                "reward": {"type": "percent_bonus", "value": 0.5}
            },
            {
                "id": "stay_10m", 
                "label": "Engage ≥ 10 minutes",
                "rule": "interaction_time >= 10",
                "reward": {"type": "percent_bonus", "value": 1.0}
            },
            {
                "id": "stay_25m",
                "label": "Engage ≥ 25 minutes", 
                "rule": "interaction_time >= 25",
                "reward": {"type": "percent_bonus", "value": 1.5}
            },
            {
                "id": "new_buyers_1",
                "label": "1 new buyer today",
                "rule": "unique_buyers_today >= 1", 
                "reward": {"type": "bluewave_points", "value": 50}
            },
            {
                "id": "new_buyers_3",
                "label": "3 new buyers today",
                "rule": "unique_buyers_today >= 3",
                "reward": {"type": "aisle_coins", "value": 80}
            },
            {
                "id": "new_buyers_5",
                "label": "5 new buyers today", 
                "rule": "unique_buyers_today >= 5",
                "reward": {"type": "vendor_stars", "value": 1}
            }
        ]
        
        self.weekly_missions = [
            {
                "id": "sale_days_1",
                "label": "Sell on 1 day",
                "rule": "active_sale_days >= 1",
                "reward": {"type": "weekly_percent", "value": 6}
            },
            {
                "id": "sale_days_2", 
                "label": "Sell on 2 days",
                "rule": "active_sale_days >= 2",
                "reward": {"type": "weekly_percent", "value": 8}
            },
            {
                "id": "league_up",
                "label": "Advance a league",
                "rule": "league_advanced == true", 
                "reward": {"type": "weekly_percent", "value": 3}
            },
            {
                "id": "active_buyers_10",
                "label": "10 active buyers/fans",
                "rule": "active_buyers_count >= 10",
                "reward": {"type": "weekly_percent", "value": 1}
            },
            {
                "id": "active_buyers_25",
                "label": "25 active buyers/fans",
                "rule": "active_buyers_count >= 25", 
                "reward": {"type": "weekly_percent", "value": 1.5}
            },
            {
                "id": "active_buyers_50",
                "label": "50 active buyers/fans",
                "rule": "active_buyers_count >= 50",
                "reward": {"type": "weekly_percent", "value": 2}
            }
        ]

    async def get_user_balances(self, user_id: str) -> Dict[str, Any]:
        """Get user reward balances"""
        # Mock data - in production, fetch from database
        return {
            "aisleCoins": 1250.75,
            "blueWavePoints": 3450,
            "vendorStars": 28,
            "cashbackCredits": 125.50,
            "last_updated": datetime.utcnow().isoformat()
        }

    async def get_per_sale_missions(self, user_id: str) -> Dict[str, Any]:
        """Get per-sale missions with progress"""
        # Calculate aggregate completion percentage
        completed_missions = 4  # Mock: 4 out of 6 completed
        aggregate_percent = (completed_missions / len(self.per_sale_missions)) * 100
        
        # Add progress to missions
        missions_with_progress = []
        for i, mission in enumerate(self.per_sale_missions):
            progress = 1.0 if i < completed_missions else 0.3 if i == completed_missions else 0.0
            missions_with_progress.append({
                **mission,
                "progress": progress,
                "completed": progress >= 1.0
            })
        
        return {
            "aggregatePercent": aggregate_percent,
            "missions": missions_with_progress
        }

    async def get_weekly_missions(self, user_id: str) -> Dict[str, Any]:
        """Get weekly missions with progress and league"""
        # Calculate aggregate completion percentage  
        completed_missions = 3  # Mock: 3 out of 6 completed
        aggregate_percent = (completed_missions / len(self.weekly_missions)) * 100
        
        # Add progress to missions
        missions_with_progress = []
        for i, mission in enumerate(self.weekly_missions):
            progress = 1.0 if i < completed_missions else 0.6 if i == completed_missions else 0.0
            missions_with_progress.append({
                **mission,
                "progress": progress,
                "completed": progress >= 1.0
            })
        
        return {
            "aggregatePercent": aggregate_percent,
            "missions": missions_with_progress,
            "league": "Gold"  # Current league
        }

    async def get_user_streaks(self, user_id: str) -> Dict[str, Any]:
        """Get user streak information"""
        return {
            "daily": {
                "days": 7,
                "nextRewardAt": (datetime.utcnow() + timedelta(days=1)).isoformat()
            },
            "weekly": {
                "weeks": 3,
                "nextRewardAt": (datetime.utcnow() + timedelta(weeks=1)).isoformat()
            }
        }

    async def get_leaderboard(self, league: Optional[str], limit: int) -> List[Dict[str, Any]]:
        """Get leaderboard rankings"""
        # Mock leaderboard data
        mock_leaderboard = [
            {
                "rank": 1,
                "vendorId": "vendor_001",
                "vendorName": "@LuxeFashion",
                "league": league or "Gold",
                "score": 9850
            },
            {
                "rank": 2, 
                "vendorId": "vendor_002",
                "vendorName": "@TechInnovation",
                "league": league or "Gold", 
                "score": 9720
            },
            {
                "rank": 3,
                "vendorId": "vendor_003", 
                "vendorName": "@ModernLifestyle",
                "league": league or "Gold",
                "score": 9680
            },
            {
                "rank": 4,
                "vendorId": "vendor_004",
                "vendorName": "@FamilyStore",
                "league": league or "Gold",
                "score": 9550
            },
            {
                "rank": 5,
                "vendorId": "vendor_005",
                "vendorName": "@GlobalMart",
                "league": league or "Gold", 
                "score": 9420
            }
        ]
        
        return mock_leaderboard[:limit]

    async def get_rewards_ledger(self, user_id: str, page: int, page_size: int) -> Dict[str, Any]:
        """Get paginated rewards transaction ledger"""
        # Mock ledger entries
        mock_entries = [
            {
                "id": "txn_001",
                "ts": datetime.utcnow().isoformat(),
                "kind": "mission",
                "title": "5-minute engagement mission completed",
                "delta": {"type": "percent_bonus", "value": 0.5}
            },
            {
                "id": "txn_002", 
                "ts": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "kind": "streak",
                "title": "7-day selling streak bonus",
                "delta": {"type": "vendor_stars", "value": 1}
            },
            {
                "id": "txn_003",
                "ts": (datetime.utcnow() - timedelta(hours=4)).isoformat(), 
                "kind": "mission",
                "title": "3 new buyers mission completed",
                "delta": {"type": "aisle_coins", "value": 80}
            },
            {
                "id": "txn_004",
                "ts": (datetime.utcnow() - timedelta(days=1)).isoformat(),
                "kind": "competition", 
                "title": "BlueWave Weekly Competition prize",
                "delta": {"type": "cashback_credits", "value": 25.0, "currency": "USD"}
            },
            {
                "id": "txn_005",
                "ts": (datetime.utcnow() - timedelta(days=2)).isoformat(),
                "kind": "mission",
                "title": "Weekly mission: Sell on 2 days", 
                "delta": {"type": "weekly_percent", "value": 8}
            }
        ]
        
        # Simulate pagination
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_entries = mock_entries[start_idx:end_idx]
        
        return {
            "items": page_entries,
            "page": page,
            "pageSize": page_size,
            "total": len(mock_entries),
            "hasNext": end_idx < len(mock_entries)
        }

    async def claim_reward(self, user_id: str, mission_id: Optional[str], 
                          streak_type: Optional[str], campaign_id: Optional[str]) -> Dict[str, Any]:
        """Claim mission, streak, or campaign reward"""
        if mission_id:
            # Find and claim mission reward
            return {
                "ok": True,
                "ledgerId": f"claim_{datetime.utcnow().timestamp()}",
                "type": "mission",
                "reward": {"type": "aisle_coins", "value": 50},
                "message": f"Mission {mission_id} reward claimed!"
            }
        elif streak_type:
            # Claim streak reward
            return {
                "ok": True,
                "ledgerId": f"claim_{datetime.utcnow().timestamp()}", 
                "type": "streak",
                "reward": {"type": "vendor_stars", "value": 1},
                "message": f"{streak_type.title()} streak reward claimed!"
            }
        elif campaign_id:
            # Claim campaign reward
            return {
                "ok": True,
                "ledgerId": f"claim_{datetime.utcnow().timestamp()}",
                "type": "campaign", 
                "reward": {"type": "cashback_credits", "value": 10.0},
                "message": f"Campaign {campaign_id} reward claimed!"
            }
        else:
            raise ValueError("Must specify mission_id, streak_type, or campaign_id")

    async def withdraw_aislecoins(self, user_id: str, amount: float, 
                                 method: str, kyc_token: str) -> Dict[str, Any]:
        """Process AisleCoins withdrawal"""
        # Mock KYC validation
        if not kyc_token.startswith("kyc_"):
            raise ValueError("Invalid KYC token")
            
        # Check minimum balance (mock)
        current_balance = 1250.75  # Mock current balance
        if amount > current_balance:
            raise ValueError("Insufficient AisleCoins balance")
            
        if amount < 100:  # Minimum withdrawal
            raise ValueError("Minimum withdrawal is 100 AisleCoins")
        
        return {
            "ok": True,
            "requestId": f"withdraw_{datetime.utcnow().timestamp()}",
            "amount": amount,
            "method": method,
            "estimatedCompletion": (datetime.utcnow() + timedelta(days=3)).isoformat(),
            "status": "processing"
        }

    async def enter_campaign(self, user_id: str, campaign_id: str) -> Dict[str, Any]:
        """Enter BlueWave competition"""
        return {
            "ok": True,
            "campaignId": campaign_id,
            "entryId": f"entry_{datetime.utcnow().timestamp()}",
            "message": f"Successfully entered {campaign_id}!",
            "drawDate": (datetime.utcnow() + timedelta(days=7)).isoformat()
        }

    async def get_notification_preferences(self, user_id: str) -> Dict[str, bool]:
        """Get user notification preferences"""
        # Mock preferences
        return {
            "ads_support": True,
            "vendor_updates": True, 
            "publisher_plans": False,
            "series_campaigns": True,
            "email": True,
            "push": True
        }

    async def set_notification_preferences(self, user_id: str, prefs: Dict[str, bool]) -> Dict[str, Any]:
        """Update user notification preferences"""
        # Mock update
        logger.info(f"Updated notification prefs for {user_id}: {prefs}")
        return {"ok": True, "updated": prefs}

    async def get_system_stats(self) -> Dict[str, Any]:
        """Get rewards system statistics"""
        return {
            "totalUsers": 125000,
            "activeRewardsUsers": 89000,
            "totalRewardsDistributed": {
                "aisleCoins": 2500000,
                "blueWavePoints": 8900000,
                "vendorStars": 45000, 
                "cashbackCredits": 125000
            },
            "missionsCompleted": {
                "perSale": 450000,
                "weekly": 125000
            },
            "currentStreaks": {
                "daily": 25000,
                "weekly": 8500
            },
            "leagueDistribution": {
                "Bronze": 45000,
                "Silver": 28000,
                "Gold": 12000,
                "Platinum": 4000
            },
            "averageEngagement": 4.7,
            "withdrawalRequests": {
                "pending": 145,
                "completedThisMonth": 1250
            }
        }

    async def submit_feedback(self, user_id: str, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        """Submit user feedback"""
        feedback_id = f"feedback_{datetime.utcnow().timestamp()}"
        logger.info(f"Feedback {feedback_id} from {user_id}: {feedback_data}")
        
        return {
            "ok": True,
            "feedbackId": feedback_id,
            "message": "Thank you for your feedback!",
            "reward": {"type": "bluewave_points", "value": 10}
        }

# Initialize service instance
rewards_service = RewardsService()