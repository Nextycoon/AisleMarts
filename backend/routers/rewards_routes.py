"""
🎯 AisleMarts Rewards System API Routes
BlueWave-themed rewards, gamification, missions, and notifications
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any, Literal
from datetime import datetime
import logging

from services.rewards_service import rewards_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/rewards", tags=["Rewards System 🎯"])

# Pydantic Models
class RewardType(str):
    """Reward currency types"""
    pass

class MissionClaim(BaseModel):
    mission_id: Optional[str] = Field(None, description="Mission ID to claim")
    streak_type: Optional[Literal["daily", "weekly"]] = Field(None, description="Streak type to claim")
    campaign_id: Optional[str] = Field(None, description="Campaign ID to claim")

class WithdrawRequest(BaseModel):
    amount: float = Field(..., description="Amount to withdraw")
    method: Literal["wallet", "bank"] = Field(..., description="Withdrawal method")
    kyc_token: str = Field(..., description="KYC verification token")

class NotificationPreferences(BaseModel):
    ads_support: bool = Field(True, description="Ads Support notifications")
    vendor_updates: bool = Field(True, description="Vendor Marketplace Updates")
    publisher_plans: bool = Field(False, description="Publisher Plans")
    series_campaigns: bool = Field(True, description="Series & Campaigns")
    email: bool = Field(True, description="Email notifications")
    push: bool = Field(True, description="Push notifications")

class FeedbackData(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating 1-5")
    comment: Optional[str] = Field(None, description="Feedback comment")
    category: Optional[str] = Field(None, description="Feedback category")

# Rewards API Routes

@router.get("/balances")
async def get_balances(user_id: str = "current_user"):
    """
    🎯 Get user reward balances
    Returns AisleCoins, BlueWave Points, Vendor Stars, Cashback Credits
    """
    try:
        balances = await rewards_service.get_user_balances(user_id)
        return balances
    except Exception as e:
        logger.error(f"Balances error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/missions/per-sale")
async def get_per_sale_missions(user_id: str = "current_user"):
    """
    🎯 Get per-sale mission definitions and progress
    Interaction time missions (5m, 10m, 25m) and unique buyers
    """
    try:
        missions = await rewards_service.get_per_sale_missions(user_id)
        return missions
    except Exception as e:
        logger.error(f"Per-sale missions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/missions/weekly")
async def get_weekly_missions(user_id: str = "current_user"):
    """
    🎯 Get weekly mission definitions, progress, and league status
    Valid sale days, league advancement, buyer engagement
    """
    try:
        missions = await rewards_service.get_weekly_missions(user_id)
        return missions
    except Exception as e:
        logger.error(f"Weekly missions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/streaks")
async def get_streaks(user_id: str = "current_user"):
    """
    🎯 Get daily and weekly streak information
    Days/weeks streaked and next reward ETA
    """
    try:
        streaks = await rewards_service.get_user_streaks(user_id)
        return streaks
    except Exception as e:
        logger.error(f"Streaks error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leaderboard")
async def get_leaderboard(
    league: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100)
):
    """
    🎯 Get vendor leaderboard (league-aware)
    Bronze, Silver, Gold, Platinum leagues
    """
    try:
        leaderboard = await rewards_service.get_leaderboard(league, limit)
        return leaderboard
    except Exception as e:
        logger.error(f"Leaderboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ledger")
async def get_rewards_ledger(
    user_id: str = "current_user",
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100)
):
    """
    🎯 Get paginated reward transaction ledger
    Mission rewards, streaks, competitions, adjustments
    """
    try:
        ledger = await rewards_service.get_rewards_ledger(user_id, page, page_size)
        return ledger
    except Exception as e:
        logger.error(f"Ledger error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/claim")
async def claim_reward(
    claim_data: MissionClaim,
    user_id: str = "current_user"
):
    """
    🎯 Claim mission, streak, or campaign rewards
    Validates completion and adds to ledger
    """
    try:
        result = await rewards_service.claim_reward(
            user_id,
            claim_data.mission_id,
            claim_data.streak_type,
            claim_data.campaign_id
        )
        return result
    except Exception as e:
        logger.error(f"Claim reward error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/withdraw")
async def withdraw_aislecoins(
    withdraw_request: WithdrawRequest,
    user_id: str = "current_user"
):
    """
    🎯 Convert AisleCoins to payout (policy-gated)
    Requires KYC verification and minimum balance
    """
    try:
        result = await rewards_service.withdraw_aislecoins(
            user_id,
            withdraw_request.amount,
            withdraw_request.method,
            withdraw_request.kyc_token
        )
        return result
    except Exception as e:
        logger.error(f"Withdraw error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/campaign/enter")
async def enter_campaign(
    campaign_id: str,
    user_id: str = "current_user"
):
    """
    🎯 Enter BlueWave competition/raffle
    Auto-entry on sale or manual entry
    """
    try:
        result = await rewards_service.enter_campaign(user_id, campaign_id)
        return result
    except Exception as e:
        logger.error(f"Campaign entry error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Notification Management

@router.get("/notifications/preferences")
async def get_notification_preferences(user_id: str = "current_user"):
    """
    🔔 Get user notification preferences
    """
    try:
        prefs = await rewards_service.get_notification_preferences(user_id)
        return prefs
    except Exception as e:
        logger.error(f"Get notification prefs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/notifications/preferences")
async def set_notification_preferences(
    prefs: NotificationPreferences,
    user_id: str = "current_user"
):
    """
    🔔 Update user notification preferences
    """
    try:
        result = await rewards_service.set_notification_preferences(user_id, prefs.dict())
        return result
    except Exception as e:
        logger.error(f"Set notification prefs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Analytics & Feedback

@router.get("/stats")
async def get_rewards_stats():
    """
    🎯 Get rewards system statistics
    Usage metrics, conversion rates, top performers
    """
    try:
        stats = await rewards_service.get_system_stats()
        return stats
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
async def submit_feedback(
    feedback: FeedbackData,
    user_id: str = "current_user"
):
    """
    🎯 Submit feedback about rewards system
    """
    try:
        result = await rewards_service.submit_feedback(user_id, feedback.dict())
        return result
    except Exception as e:
        logger.error(f"Feedback error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def rewards_health_check():
    """
    🎯 Rewards system health check
    """
    return {
        "status": "healthy",
        "service": "AisleMarts Rewards System",
        "theme": "BlueWave",
        "currencies": ["AisleCoins", "BlueWave Points", "Vendor Stars", "Cashback Credits"],
        "missions": ["per_sale", "weekly"],
        "gamification": ["streaks", "competitions", "leagues"],
        "compliance": "family_safe",
        "timestamp": datetime.utcnow().isoformat()
    }

# Advanced Analytics & Real-time Features

@router.get("/analytics/revenue")
async def get_revenue_analytics():
    """
    💰 Get revenue analytics for rewards system
    """
    try:
        revenue_data = {
            "totalRevenue": 125000,
            "withdrawalFees": 8500,
            "premiumSubscriptions": 45000,
            "transactionFees": 71500,
            "growthMetrics": {
                "totalRevenueGrowth": 12.5,
                "withdrawalFeesGrowth": 8.3,
                "premiumSubsGrowth": 25.7,
                "transactionFeesGrowth": 15.2
            },
            "period": "monthly",
            "timestamp": datetime.utcnow().isoformat()
        }
        return revenue_data
    except Exception as e:
        logger.error(f"Revenue analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/engagement")
async def get_engagement_analytics():
    """
    📊 Get user engagement analytics
    """
    try:
        engagement_data = {
            "dailyActiveUsers": 67500,
            "weeklyActiveUsers": 85000,
            "monthlyActiveUsers": 89000,
            "averageSessionTime": 12.4,
            "missionCompletionRate": 73.2,
            "streakRetentionRate": 85.6,
            "leagueAdvancementRate": 42.3,
            "timestamp": datetime.utcnow().isoformat()
        }
        return engagement_data
    except Exception as e:
        logger.error(f"Engagement analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class MissionProgressUpdate(BaseModel):
    progress: float = Field(..., ge=0, le=1, description="Mission progress (0.0 to 1.0)")

@router.post("/real-time/mission-progress")
async def update_mission_progress(
    mission_id: str,
    progress_data: MissionProgressUpdate,
    user_id: str = "current_user"
):
    """
    ⚡ Real-time mission progress update
    """
    try:
        # Mock real-time progress update
        result = {
            "ok": True,
            "missionId": mission_id,
            "userId": user_id,
            "newProgress": progress,
            "completed": progress >= 1.0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if progress >= 1.0:
            result["reward"] = {
                "type": "aisle_coins",
                "value": 50,
                "message": "Mission completed! 🎉"
            }
        
        return result
    except Exception as e:
        logger.error(f"Real-time mission update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/competitions/active")
async def get_active_competitions():
    """
    🏆 Get currently active competitions and campaigns
    """
    try:
        competitions = [
            {
                "id": "bluewave_winter_2025",
                "name": "BlueWave Winter Challenge",
                "description": "Complete missions to win exclusive rewards",
                "startDate": datetime.utcnow().isoformat(),
                "endDate": (datetime.utcnow() + timedelta(days=30)).isoformat(),
                "prizes": ["1000 AisleCoins", "Premium Badge", "Early Access"],
                "participants": 15420,
                "userParticipating": False
            },
            {
                "id": "vendor_elite_march",
                "name": "Vendor Elite March",
                "description": "Top vendors compete for monthly recognition",
                "startDate": datetime.utcnow().isoformat(),
                "endDate": (datetime.utcnow() + timedelta(days=14)).isoformat(),
                "prizes": ["Platinum League", "5000 Vendor Stars", "Feature Spotlight"],
                "participants": 3240,
                "userParticipating": True
            }
        ]
        return competitions
    except Exception as e:
        logger.error(f"Active competitions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/achievements/unlock")
async def unlock_achievement(
    achievement_id: str,
    user_id: str = "current_user"
):
    """
    🏅 Unlock user achievement
    """
    try:
        achievement_data = {
            "ok": True,
            "achievementId": achievement_id,
            "userId": user_id,
            "name": "Mission Master",
            "description": "Complete 100 missions",
            "icon": "🎯",
            "rarity": "epic",
            "reward": {
                "type": "bluewave_points",
                "value": 500
            },
            "unlockedAt": datetime.utcnow().isoformat()
        }
        return achievement_data
    except Exception as e:
        logger.error(f"Achievement unlock error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/social/activity-feed")
async def get_social_activity_feed(
    user_id: str = "current_user",
    limit: int = Field(20, ge=1, le=100)
):
    """
    🔔 Get social activity feed for rewards
    """
    try:
        activities = [
            {
                "id": "activity_001",
                "type": "achievement_unlock",
                "user": "@TechVendor123",
                "description": "unlocked 'Sales Star' achievement",
                "timestamp": datetime.utcnow().isoformat(),
                "icon": "⭐"
            },
            {
                "id": "activity_002",
                "type": "league_advancement",
                "user": "@FashionStore",
                "description": "advanced to Gold League",
                "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "icon": "🥇"
            },
            {
                "id": "activity_003",
                "type": "streak_milestone",
                "user": "@HomeGoods",
                "description": "reached 30-day selling streak",
                "timestamp": (datetime.utcnow() - timedelta(hours=4)).isoformat(),
                "icon": "🔥"
            }
        ]
        return {"activities": activities[:limit]}
    except Exception as e:
        logger.error(f"Social activity feed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))