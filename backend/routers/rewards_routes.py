"""
🎯 AisleMarts Rewards System API Routes
BlueWave-themed rewards, gamification, missions, and notifications
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
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
    limit: int = Field(20, ge=1, le=100)
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
    page: int = Field(1, ge=1),
    page_size: int = Field(25, ge=1, le=100)
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