import asyncio
import json
import random
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    # Fallback for testing
    class LlmChat:
        def __init__(self, *args, **kwargs):
            pass
        async def send_message(self, message):
            return "AI-generated challenge: Complete 3 product reviews today for bonus rewards!"
    class UserMessage:
        def __init__(self, text):
            self.text = text

from models.gamification import (
    Challenge, ChallengeType, ChallengeStatus, Achievement, UserProgress,
    SpinResult, SpinWheelReward, SpinWheelConfig, GamificationStats,
    CreateChallengeRequest, UpdateProgressRequest, RewardType,
    DEFAULT_ACHIEVEMENTS, DEFAULT_SPIN_REWARDS
)


class GamificationService:
    def __init__(self):
        self.emergent_llm_key = os.getenv("EMERGENT_LLM_KEY", "sk-emergent-35d93F3CeFf0c7aD50")
        self.ai_chat = None
        self.init_ai_service()
        
        # In-memory storage for demo (replace with MongoDB in production)
        self.users_progress: Dict[str, UserProgress] = {}
        self.challenges: Dict[str, Challenge] = {}
        self.achievements: Dict[str, Achievement] = {}
        self.spin_results: List[SpinResult] = []
        
        # Initialize default achievements
        self._initialize_achievements()
        
        # Spin wheel configuration
        self.spin_wheel_config = SpinWheelConfig(
            rewards=DEFAULT_SPIN_REWARDS
        )

    def init_ai_service(self):
        """Initialize AI service for challenge generation"""
        try:
            self.ai_chat = LlmChat(
                api_key=self.emergent_llm_key,
                session_id=f"gamification_ai_{uuid.uuid4()}",
                system_message="""You are an AI gamification specialist for AisleMarts. You create engaging, personalized challenges and rewards that drive user engagement and retention.

                Your capabilities:
                1. Generate personalized daily/weekly challenges based on user behavior
                2. Create difficulty-appropriate tasks that feel achievable yet rewarding
                3. Suggest optimal reward structures for different user segments
                4. Analyze user engagement patterns to improve gamification strategies
                
                Always create challenges that are:
                - Achievable but engaging
                - Relevant to shopping and commerce
                - Personalized to user preferences
                - Balanced in difficulty
                - Rewarding and motivating"""
            ).with_model("openai", "gpt-4o-mini")
        except Exception as e:
            print(f"Gamification AI service initialization error: {e}")
            self.ai_chat = None

    def _initialize_achievements(self):
        """Initialize default achievements"""
        for achievement_data in DEFAULT_ACHIEVEMENTS:
            achievement = Achievement(
                id=str(uuid.uuid4()),
                **achievement_data
            )
            self.achievements[achievement.id] = achievement

    async def get_user_progress(self, user_id: str) -> UserProgress:
        """Get or create user progress"""
        if user_id not in self.users_progress:
            self.users_progress[user_id] = UserProgress(user_id=user_id)
        return self.users_progress[user_id]

    async def create_challenge(self, user_id: str, request: CreateChallengeRequest) -> Challenge:
        """Create a new challenge"""
        challenge_id = str(uuid.uuid4())
        
        challenge = Challenge(
            id=challenge_id,
            title=request.title,
            description=request.description,
            challenge_type=request.challenge_type,
            target_value=request.target_value,
            reward_coins=request.reward_coins,
            reward_points=request.reward_points,
            difficulty=request.difficulty,
            category=request.category,
            starts_at=datetime.now(),
            expires_at=datetime.now() + timedelta(hours=request.duration_hours)
        )
        
        self.challenges[challenge_id] = challenge
        
        # Add to user's active challenges
        user_progress = await self.get_user_progress(user_id)
        
        return challenge

    async def generate_ai_challenges(self, user_id: str, count: int = 3) -> List[Challenge]:
        """Generate AI-powered personalized challenges"""
        user_progress = await self.get_user_progress(user_id)
        
        if not self.ai_chat:
            # Fallback challenges
            return await self._generate_fallback_challenges(user_id, count)
        
        try:
            prompt = f"""Generate {count} personalized daily challenges for a user with the following profile:
            
            User Level: {user_progress.level}
            Total Coins: {user_progress.total_coins}
            Completed Challenges: {len(user_progress.completed_challenges)}
            Daily Streak: {user_progress.daily_streak}
            Badges: {len(user_progress.badges)}
            
            Generate challenges in JSON format with these fields:
            - title (engaging and clear)
            - description (detailed instructions)
            - target_value (realistic number)
            - reward_coins (20-200 range)
            - difficulty (easy/medium/hard)
            - category (shopping/social/discovery/loyalty)
            
            Make challenges achievable, engaging, and relevant to e-commerce activities."""
            
            message = UserMessage(text=prompt)
            response = await self.ai_chat.send_message(message)
            
            # Parse AI response and create challenges
            challenges = []
            try:
                challenge_data = json.loads(response)
                if isinstance(challenge_data, list):
                    for data in challenge_data[:count]:
                        challenge = await self._create_ai_challenge(user_id, data)
                        challenges.append(challenge)
            except json.JSONDecodeError:
                # If AI doesn't return valid JSON, create fallback challenges
                challenges = await self._generate_fallback_challenges(user_id, count)
            
            return challenges
            
        except Exception as e:
            print(f"AI challenge generation error: {e}")
            return await self._generate_fallback_challenges(user_id, count)

    async def _create_ai_challenge(self, user_id: str, data: Dict[str, Any]) -> Challenge:
        """Create challenge from AI-generated data"""
        challenge_id = str(uuid.uuid4())
        
        challenge = Challenge(
            id=challenge_id,
            title=data.get("title", "Complete Today's Task"),
            description=data.get("description", "Complete this challenge to earn rewards"),
            challenge_type=ChallengeType.AI_GENERATED,
            target_value=data.get("target_value", 1),
            reward_coins=data.get("reward_coins", 50),
            reward_points=data.get("reward_points", 10),
            difficulty=data.get("difficulty", "medium"),
            category=data.get("category", "general"),
            ai_generated=True,
            ai_personalization_score=0.85,
            starts_at=datetime.now(),
            expires_at=datetime.now() + timedelta(hours=24)
        )
        
        self.challenges[challenge_id] = challenge
        return challenge

    async def _generate_fallback_challenges(self, user_id: str, count: int) -> List[Challenge]:
        """Generate fallback challenges when AI is unavailable"""
        fallback_challenges = [
            {
                "title": "Daily Explorer",
                "description": "Browse 5 different product categories",
                "target_value": 5,
                "reward_coins": 75,
                "category": "discovery"
            },
            {
                "title": "Review Master",
                "description": "Write 2 product reviews",
                "target_value": 2,
                "reward_coins": 100,
                "category": "social"
            },
            {
                "title": "Deal Hunter",
                "description": "Save 3 products to wishlist",
                "target_value": 3,
                "reward_coins": 50,
                "category": "shopping"
            },
            {
                "title": "Social Butterfly", 
                "description": "Like and comment on 5 community posts",
                "target_value": 5,
                "reward_coins": 60,
                "category": "social"
            },
            {
                "title": "Loyalty Builder",
                "description": "Check in daily for rewards",
                "target_value": 1,
                "reward_coins": 25,
                "category": "loyalty"
            }
        ]
        
        challenges = []
        selected = random.sample(fallback_challenges, min(count, len(fallback_challenges)))
        
        for data in selected:
            challenge = await self._create_ai_challenge(user_id, data)
            challenges.append(challenge)
        
        return challenges

    async def update_challenge_progress(self, user_id: str, request: UpdateProgressRequest) -> Dict[str, Any]:
        """Update progress on a challenge"""
        if request.challenge_id not in self.challenges:
            return {"error": "Challenge not found"}
        
        challenge = self.challenges[request.challenge_id]
        user_progress = await self.get_user_progress(user_id)
        
        # Update progress
        challenge.current_progress += request.progress_increment
        
        # Check if challenge is completed
        if challenge.current_progress >= challenge.target_value and challenge.status == ChallengeStatus.ACTIVE:
            challenge.status = ChallengeStatus.COMPLETED
            challenge.completed_at = datetime.now()
            
            # Award rewards
            user_progress.total_coins += challenge.reward_coins
            user_progress.total_points += challenge.reward_points
            user_progress.completed_challenges.append(challenge.id)
            
            # Update streaks
            await self._update_user_streaks(user_id)
            
            # Check for achievements
            achievements_unlocked = await self._check_achievements(user_id)
            
            return {
                "challenge_completed": True,
                "coins_earned": challenge.reward_coins,
                "points_earned": challenge.reward_points,
                "achievements_unlocked": achievements_unlocked,
                "new_level": await self._calculate_user_level(user_id)
            }
        
        return {
            "challenge_completed": False,
            "current_progress": challenge.current_progress,
            "target_value": challenge.target_value,
            "progress_percentage": (challenge.current_progress / challenge.target_value) * 100
        }

    async def spin_wheel(self, user_id: str) -> Dict[str, Any]:
        """Spin the reward wheel"""
        user_progress = await self.get_user_progress(user_id)
        
        # Check if user has spin tokens
        if user_progress.spin_tokens <= 0:
            return {"error": "No spin tokens available"}
        
        # Deduct spin token
        user_progress.spin_tokens -= 1
        user_progress.total_spins += 1
        user_progress.last_spin = datetime.now()
        
        # Select random reward based on probabilities
        rewards = self.spin_wheel_config.rewards
        total_probability = sum(reward.probability for reward in rewards)
        
        random_value = random.random() * total_probability
        cumulative_prob = 0
        
        selected_reward = None
        for reward in rewards:
            cumulative_prob += reward.probability
            if random_value <= cumulative_prob:
                selected_reward = reward
                break
        
        if not selected_reward:
            selected_reward = rewards[0]  # Fallback
        
        # Apply reward
        coins_earned = 0
        points_earned = 0
        badges_earned = []
        
        if selected_reward.reward_type == RewardType.COINS:
            coins_earned = int(selected_reward.value)
            user_progress.total_coins += coins_earned
        elif selected_reward.reward_type == RewardType.POINTS:
            points_earned = int(selected_reward.value)
            user_progress.total_points += points_earned
        elif selected_reward.reward_type == RewardType.SPIN_TOKENS:
            user_progress.spin_tokens += int(selected_reward.value)
        elif selected_reward.reward_type == RewardType.DISCOUNT:
            # Add discount to user's account (implementation depends on business logic)
            pass
        
        # Create spin result
        spin_result = SpinResult(
            user_id=user_id,
            reward=selected_reward,
            coins_earned=coins_earned,
            points_earned=points_earned,
            badges_earned=badges_earned
        )
        
        self.spin_results.append(spin_result)
        
        # Check for achievements
        achievements_unlocked = await self._check_achievements(user_id)
        
        return {
            "reward": selected_reward.dict(),
            "coins_earned": coins_earned,
            "points_earned": points_earned,
            "badges_earned": badges_earned,
            "achievements_unlocked": achievements_unlocked,
            "remaining_spins": user_progress.spin_tokens,
            "total_coins": user_progress.total_coins,
            "total_points": user_progress.total_points
        }

    async def get_daily_challenges(self, user_id: str) -> List[Challenge]:
        """Get today's challenges for user"""
        user_progress = await self.get_user_progress(user_id)
        
        # Get active challenges for today
        today = datetime.now().date()
        active_challenges = [
            challenge for challenge in self.challenges.values()
            if challenge.starts_at.date() == today and 
            challenge.status == ChallengeStatus.ACTIVE and
            challenge.id not in user_progress.completed_challenges
        ]
        
        # If no active challenges, generate new ones
        if not active_challenges:
            active_challenges = await self.generate_ai_challenges(user_id, 3)
        
        return active_challenges

    async def get_user_achievements(self, user_id: str) -> List[Achievement]:
        """Get user's unlocked achievements"""
        user_progress = await self.get_user_progress(user_id)
        
        unlocked_achievements = []
        for achievement_id in user_progress.unlocked_achievements:
            if achievement_id in self.achievements:
                unlocked_achievements.append(self.achievements[achievement_id])
        
        return unlocked_achievements

    async def get_leaderboard(self, leaderboard_type: str = "coins", limit: int = 10) -> List[Dict[str, Any]]:
        """Get leaderboard rankings"""
        users = list(self.users_progress.values())
        
        if leaderboard_type == "coins":
            users.sort(key=lambda u: u.total_coins, reverse=True)
        elif leaderboard_type == "points":
            users.sort(key=lambda u: u.total_points, reverse=True)
        elif leaderboard_type == "level":
            users.sort(key=lambda u: u.level, reverse=True)
        elif leaderboard_type == "streak":
            users.sort(key=lambda u: u.daily_streak, reverse=True)
        
        leaderboard = []
        for i, user in enumerate(users[:limit]):
            leaderboard.append({
                "rank": i + 1,
                "user_id": user.user_id,
                "username": f"User_{user.user_id[-6:]}",  # Mock username
                "level": user.level,
                "coins": user.total_coins,
                "points": user.total_points,
                "daily_streak": user.daily_streak,
                "badges": len(user.badges),
                "achievements": len(user.unlocked_achievements)
            })
        
        return leaderboard

    async def get_gamification_stats(self) -> GamificationStats:
        """Get platform gamification statistics"""
        total_users = len(self.users_progress)
        active_today = len([
            user for user in self.users_progress.values()
            if user.last_active.date() == datetime.now().date()
        ])
        
        completed_challenges = sum([
            len(user.completed_challenges) for user in self.users_progress.values()
        ])
        
        spins_today = len([
            spin for spin in self.spin_results
            if spin.timestamp.date() == datetime.now().date()
        ])
        
        rewards_distributed = {
            "coins": sum([user.total_coins for user in self.users_progress.values()]),
            "points": sum([user.total_points for user in self.users_progress.values()]),
            "achievements": sum([len(user.unlocked_achievements) for user in self.users_progress.values()])
        }
        
        # Top users
        top_users = await self.get_leaderboard("coins", 5)
        
        engagement_metrics = {
            "daily_active_users": active_today,
            "completion_rate": (completed_challenges / max(total_users * 3, 1)) * 100,  # Assuming 3 challenges per user
            "average_level": sum([user.level for user in self.users_progress.values()]) / max(total_users, 1),
            "spin_participation": (len(set([spin.user_id for spin in self.spin_results])) / max(total_users, 1)) * 100
        }
        
        return GamificationStats(
            total_users=total_users,
            active_users_today=active_today,
            total_challenges_completed=completed_challenges,
            total_spins_today=spins_today,
            total_rewards_distributed=rewards_distributed,
            top_users=top_users,
            engagement_metrics=engagement_metrics
        )

    # Helper methods
    async def _update_user_streaks(self, user_id: str):
        """Update user's daily/weekly/monthly streaks"""
        user_progress = await self.get_user_progress(user_id)
        
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        
        # Check if user was active yesterday
        if user_progress.last_active.date() == yesterday:
            user_progress.daily_streak += 1
        elif user_progress.last_active.date() != today:
            user_progress.daily_streak = 1
        
        user_progress.last_active = datetime.now()

    async def _check_achievements(self, user_id: str) -> List[Achievement]:
        """Check and unlock achievements for user"""
        user_progress = await self.get_user_progress(user_id)
        achievements_unlocked = []
        
        for achievement in self.achievements.values():
            if achievement.id in user_progress.unlocked_achievements:
                continue
            
            # Check unlock criteria
            criteria = achievement.unlock_criteria
            unlocked = True
            
            if "challenges_completed" in criteria:
                if len(user_progress.completed_challenges) < criteria["challenges_completed"]:
                    unlocked = False
            
            if "daily_streak" in criteria:
                if user_progress.daily_streak < criteria["daily_streak"]:
                    unlocked = False
            
            if "ai_challenges_completed" in criteria:
                ai_challenges = len([
                    c_id for c_id in user_progress.completed_challenges
                    if c_id in self.challenges and self.challenges[c_id].ai_generated
                ])
                if ai_challenges < criteria["ai_challenges_completed"]:
                    unlocked = False
            
            if unlocked:
                user_progress.unlocked_achievements.append(achievement.id)
                user_progress.total_coins += achievement.reward_coins
                user_progress.total_points += achievement.reward_points
                achievements_unlocked.append(achievement)
        
        return achievements_unlocked

    async def _calculate_user_level(self, user_id: str) -> int:
        """Calculate user level based on total points and coins"""
        user_progress = await self.get_user_progress(user_id)
        
        # Simple leveling formula: level = sqrt(total_points / 100) + 1
        total_score = user_progress.total_points + (user_progress.total_coins // 10)
        level = int((total_score / 100) ** 0.5) + 1
        
        user_progress.level = max(level, user_progress.level)  # Never decrease level
        return user_progress.level

    async def refresh_daily_spin_tokens(self, user_id: str):
        """Refresh daily spin tokens (called by scheduler)"""
        user_progress = await self.get_user_progress(user_id)
        user_progress.spin_tokens = min(
            user_progress.spin_tokens + self.spin_wheel_config.daily_spins,
            self.spin_wheel_config.daily_spins * 3  # Max 3 days worth
        )