from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime

from services.gamification_service import GamificationService
from models.gamification import (
    Challenge, UserProgress, SpinResult, Achievement, GamificationStats,
    CreateChallengeRequest, UpdateProgressRequest, ChallengeType
)

router = APIRouter()
gamification_service = GamificationService()


@router.get("/health")
async def health_check():
    """Health check for Gamification system"""
    return {
        "status": "operational",
        "service": "Gamification & Engagement Engine",
        "features": [
            "ai_challenge_generation",
            "spin_wheel_rewards", 
            "achievement_system",
            "progress_tracking",
            "leaderboards",
            "daily_streaks"
        ],
        "total_users": len(gamification_service.users_progress),
        "total_challenges": len(gamification_service.challenges),
        "total_achievements": len(gamification_service.achievements),
        "ai_integration": "emergent_llm" if gamification_service.ai_chat else "mock_mode",
        "timestamp": datetime.now()
    }


@router.get("/user/{user_id}/progress")
async def get_user_progress(user_id: str) -> UserProgress:
    """Get user's gamification progress"""
    try:
        progress = await gamification_service.get_user_progress(user_id)
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user progress: {str(e)}")


@router.get("/user/{user_id}/challenges")
async def get_user_challenges(user_id: str) -> List[Challenge]:
    """Get user's daily challenges"""
    try:
        challenges = await gamification_service.get_daily_challenges(user_id)
        return challenges
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get challenges: {str(e)}")


@router.post("/user/{user_id}/challenges/generate")
async def generate_ai_challenges(
    user_id: str,
    count: int = Query(3, description="Number of challenges to generate")
) -> List[Challenge]:
    """Generate AI-powered personalized challenges"""
    try:
        challenges = await gamification_service.generate_ai_challenges(user_id, count)
        return challenges
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate challenges: {str(e)}")


@router.post("/user/{user_id}/challenges")
async def create_challenge(user_id: str, request: CreateChallengeRequest) -> Challenge:
    """Create a new challenge"""
    try:
        challenge = await gamification_service.create_challenge(user_id, request)
        return challenge
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create challenge: {str(e)}")


@router.patch("/user/{user_id}/challenges/progress")
async def update_challenge_progress(user_id: str, request: UpdateProgressRequest):
    """Update progress on a challenge"""
    try:
        result = await gamification_service.update_challenge_progress(user_id, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")


@router.post("/user/{user_id}/spin")
async def spin_wheel(user_id: str):
    """Spin the reward wheel"""
    try:
        result = await gamification_service.spin_wheel(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/user/{user_id}/achievements")
async def get_user_achievements(user_id: str) -> List[Achievement]:
    """Get user's unlocked achievements"""
    try:
        achievements = await gamification_service.get_user_achievements(user_id)
        return achievements
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get achievements: {str(e)}")


@router.get("/leaderboard")
async def get_leaderboard(
    leaderboard_type: str = Query("coins", description="Type: coins, points, level, streak"),
    limit: int = Query(10, description="Number of users to return")
):
    """Get leaderboard rankings"""
    try:
        leaderboard = await gamification_service.get_leaderboard(leaderboard_type, limit)
        return {
            "type": leaderboard_type,
            "leaderboard": leaderboard,
            "total_users": len(gamification_service.users_progress),
            "generated_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get leaderboard: {str(e)}")


@router.get("/stats")
async def get_gamification_stats() -> GamificationStats:
    """Get platform gamification statistics"""
    try:
        stats = await gamification_service.get_gamification_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")


@router.get("/challenges")
async def list_all_challenges(
    challenge_type: Optional[ChallengeType] = Query(None, description="Filter by challenge type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, description="Number of challenges to return")
):
    """List all challenges with optional filters"""
    try:
        all_challenges = list(gamification_service.challenges.values())
        
        # Apply filters
        if challenge_type:
            all_challenges = [c for c in all_challenges if c.challenge_type == challenge_type]
        if status:
            all_challenges = [c for c in all_challenges if c.status.value == status]
        
        # Sort by creation date
        all_challenges.sort(key=lambda c: c.created_at, reverse=True)
        
        return {
            "challenges": all_challenges[:limit],
            "total": len(all_challenges),
            "filters_applied": {
                "type": challenge_type,
                "status": status
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list challenges: {str(e)}")


@router.get("/achievements")
async def list_all_achievements() -> List[Achievement]:
    """List all available achievements"""
    try:
        achievements = list(gamification_service.achievements.values())
        achievements.sort(key=lambda a: a.rarity)
        return achievements
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list achievements: {str(e)}")


@router.get("/spin-wheel/config")
async def get_spin_wheel_config():
    """Get spin wheel configuration and rewards"""
    try:
        return {
            "config": gamification_service.spin_wheel_config.dict(),
            "total_rewards": len(gamification_service.spin_wheel_config.rewards),
            "daily_spins": gamification_service.spin_wheel_config.daily_spins
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get spin wheel config: {str(e)}")


@router.post("/user/{user_id}/refresh-spins")
async def refresh_daily_spins(user_id: str):
    """Refresh user's daily spin tokens (admin endpoint)"""
    try:
        await gamification_service.refresh_daily_spin_tokens(user_id)
        progress = await gamification_service.get_user_progress(user_id)
        return {
            "success": True,
            "spin_tokens": progress.spin_tokens,
            "refreshed_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh spins: {str(e)}")


@router.get("/analytics/engagement")
async def get_engagement_analytics():
    """Get detailed engagement analytics"""
    try:
        stats = await gamification_service.get_gamification_stats()
        
        # Additional engagement metrics
        total_users = len(gamification_service.users_progress)
        active_users = len([
            user for user in gamification_service.users_progress.values()
            if user.last_active.date() == datetime.now().date()
        ])
        
        challenge_completion_rates = {}
        for challenge_type in ChallengeType:
            total_challenges = len([
                c for c in gamification_service.challenges.values() 
                if c.challenge_type == challenge_type
            ])
            completed_challenges = len([
                c for c in gamification_service.challenges.values()
                if c.challenge_type == challenge_type and c.status.value == "completed"
            ])
            
            if total_challenges > 0:
                challenge_completion_rates[challenge_type.value] = (completed_challenges / total_challenges) * 100
        
        return {
            "basic_stats": stats.dict(),
            "engagement_details": {
                "daily_active_rate": (active_users / max(total_users, 1)) * 100,
                "challenge_completion_rates": challenge_completion_rates,
                "average_daily_streak": sum([user.daily_streak for user in gamification_service.users_progress.values()]) / max(total_users, 1),
                "spin_participation_rate": len(gamification_service.spin_results) / max(total_users, 1)
            },
            "ai_performance": {
                "ai_challenges_generated": len([c for c in gamification_service.challenges.values() if c.ai_generated]),
                "ai_personalization_avg_score": sum([c.ai_personalization_score for c in gamification_service.challenges.values() if c.ai_generated]) / max(len([c for c in gamification_service.challenges.values() if c.ai_generated]), 1)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get engagement analytics: {str(e)}")


@router.get("/user/{user_id}/recommendations")
async def get_user_recommendations(user_id: str):
    """Get AI-powered recommendations for user engagement"""
    try:
        progress = await gamification_service.get_user_progress(user_id)
        
        recommendations = []
        
        # Challenge recommendations
        if len(progress.completed_challenges) == 0:
            recommendations.append({
                "type": "challenge",
                "message": "Complete your first challenge to earn 100 bonus coins!",
                "action": "start_challenge",
                "priority": "high"
            })
        elif progress.daily_streak < 3:
            recommendations.append({
                "type": "streak",
                "message": f"Build your streak! Complete daily challenges for {3 - progress.daily_streak} more days",
                "action": "daily_challenge",
                "priority": "medium"
            })
        
        # Spin wheel recommendations
        if progress.spin_tokens > 0:
            recommendations.append({
                "type": "spin",
                "message": f"You have {progress.spin_tokens} spin tokens! Try your luck on the reward wheel",
                "action": "spin_wheel", 
                "priority": "medium"
            })
        
        # Achievement recommendations
        unlocked_count = len(progress.unlocked_achievements)
        total_achievements = len(gamification_service.achievements)
        if unlocked_count < total_achievements:
            recommendations.append({
                "type": "achievement",
                "message": f"Unlock more achievements! You've earned {unlocked_count}/{total_achievements}",
                "action": "view_achievements",
                "priority": "low"
            })
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "user_stats": {
                "level": progress.level,
                "coins": progress.total_coins,
                "daily_streak": progress.daily_streak,
                "achievements": len(progress.unlocked_achievements)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")