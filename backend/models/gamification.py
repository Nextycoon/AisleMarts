from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ChallengeType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    SPECIAL = "special"
    AI_GENERATED = "ai_generated"


class ChallengeStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"


class RewardType(str, Enum):
    COINS = "coins"
    POINTS = "points"
    BADGE = "badge"
    DISCOUNT = "discount"
    PREMIUM_ACCESS = "premium_access"
    SPIN_TOKENS = "spin_tokens"


class SpinWheelReward(BaseModel):
    id: str
    name: str
    reward_type: RewardType
    value: float
    probability: float
    icon: str
    description: Optional[str] = None
    rarity: str = "common"  # common, rare, epic, legendary


class Challenge(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    challenge_type: ChallengeType
    target_value: int
    current_progress: int = 0
    reward_coins: int = 0
    reward_points: int = 0
    reward_badges: List[str] = []
    status: ChallengeStatus = ChallengeStatus.ACTIVE
    difficulty: str = "medium"  # easy, medium, hard, expert
    category: str = "general"
    ai_generated: bool = False
    ai_personalization_score: float = 0.0
    starts_at: datetime
    expires_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)


class Achievement(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    icon: str
    category: str
    unlock_criteria: Dict[str, Any]
    reward_coins: int = 0
    reward_points: int = 0
    rarity: str = "common"
    unlocked_by: List[str] = []  # User IDs who unlocked this
    unlock_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)


class UserProgress(BaseModel):
    user_id: str
    level: int = 1
    total_coins: int = 0
    total_points: int = 0
    total_spins: int = 0
    spin_tokens: int = 3  # Daily spin tokens
    last_spin: Optional[datetime] = None
    daily_streak: int = 0
    weekly_streak: int = 0
    monthly_streak: int = 0
    completed_challenges: List[str] = []
    unlocked_achievements: List[str] = []
    badges: List[str] = []
    preferences: Dict[str, Any] = {}
    last_active: datetime = Field(default_factory=datetime.now)
    created_at: datetime = Field(default_factory=datetime.now)


class SpinResult(BaseModel):
    user_id: str
    reward: SpinWheelReward
    timestamp: datetime = Field(default_factory=datetime.now)
    coins_earned: int = 0
    points_earned: int = 0
    badges_earned: List[str] = []


class GamificationStats(BaseModel):
    total_users: int
    active_users_today: int
    total_challenges_completed: int
    total_spins_today: int
    total_rewards_distributed: Dict[str, int]
    top_users: List[Dict[str, Any]]
    engagement_metrics: Dict[str, float]


class CreateChallengeRequest(BaseModel):
    title: str
    description: str
    challenge_type: ChallengeType
    target_value: int
    reward_coins: int = 0
    reward_points: int = 0
    difficulty: str = "medium"
    category: str = "general"
    duration_hours: int = 24


class UpdateProgressRequest(BaseModel):
    challenge_id: str
    progress_increment: int = 1
    metadata: Dict[str, Any] = {}


class SpinWheelConfig(BaseModel):
    id: str = "default_wheel"
    name: str = "Daily Rewards Wheel"
    rewards: List[SpinWheelReward]
    daily_spins: int = 3
    spin_cost_tokens: int = 1
    premium_multiplier: float = 2.0
    reset_time_utc: str = "00:00"
    active: bool = True


# Predefined achievements
DEFAULT_ACHIEVEMENTS = [
    {
        "name": "First Steps",
        "description": "Complete your first challenge",
        "icon": "🎯",
        "category": "beginner",
        "unlock_criteria": {"challenges_completed": 1},
        "reward_coins": 100,
        "rarity": "common"
    },
    {
        "name": "Challenge Master",
        "description": "Complete 10 challenges",
        "icon": "🏆",
        "category": "achievement",
        "unlock_criteria": {"challenges_completed": 10},
        "reward_coins": 500,
        "rarity": "rare"
    },
    {
        "name": "Spin Champion", 
        "description": "Win 5 legendary rewards from spin wheel",
        "icon": "🎰",
        "category": "gambling",
        "unlock_criteria": {"legendary_spins": 5},
        "reward_coins": 1000,
        "rarity": "epic"
    },
    {
        "name": "Streak Warrior",
        "description": "Maintain a 7-day daily streak",
        "icon": "🔥",
        "category": "consistency", 
        "unlock_criteria": {"daily_streak": 7},
        "reward_coins": 750,
        "rarity": "rare"
    },
    {
        "name": "AI Collaborator",
        "description": "Complete 5 AI-generated personalized challenges",
        "icon": "🤖",
        "category": "ai",
        "unlock_criteria": {"ai_challenges_completed": 5},
        "reward_coins": 300,
        "rarity": "uncommon"
    }
]

# Default spin wheel rewards
DEFAULT_SPIN_REWARDS = [
    SpinWheelReward(
        id="coins_50",
        name="50 AisleCoins",
        reward_type=RewardType.COINS,
        value=50,
        probability=0.30,
        icon="🪙",
        description="Basic coin reward",
        rarity="common"
    ),
    SpinWheelReward(
        id="coins_100", 
        name="100 AisleCoins",
        reward_type=RewardType.COINS,
        value=100,
        probability=0.25,
        icon="🪙",
        description="Double coin reward",
        rarity="common"
    ),
    SpinWheelReward(
        id="points_25",
        name="25 BlueWave Points",
        reward_type=RewardType.POINTS, 
        value=25,
        probability=0.20,
        icon="💎",
        description="BlueWave loyalty points",
        rarity="uncommon"
    ),
    SpinWheelReward(
        id="spin_token",
        name="Extra Spin Token",
        reward_type=RewardType.SPIN_TOKENS,
        value=1,
        probability=0.15,
        icon="🎰",
        description="Bonus spin opportunity",
        rarity="rare"
    ),
    SpinWheelReward(
        id="discount_10",
        name="10% Discount",
        reward_type=RewardType.DISCOUNT,
        value=10,
        probability=0.08,
        icon="🎫",
        description="10% off next purchase",
        rarity="rare"
    ),
    SpinWheelReward(
        id="premium_day",
        name="1 Day Premium",
        reward_type=RewardType.PREMIUM_ACCESS,
        value=1,
        probability=0.02,
        icon="👑",
        description="24-hour premium access",
        rarity="legendary"
    )
]