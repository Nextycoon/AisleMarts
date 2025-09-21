"""
🤖 AisleMarts AI Personalization Service
Advanced AI-driven personalization for rewards, recommendations, and user experience
"""

import asyncio
import logging
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dotenv import load_dotenv
import json

load_dotenv()

logger = logging.getLogger(__name__)

class AIPersonalizationService:
    def __init__(self):
        self.user_profiles = {}
        self.learning_models = {
            "mission_affinity": {},
            "reward_preferences": {},
            "engagement_patterns": {},
            "purchase_behavior": {},
            "social_interactions": {}
        }
        
    async def analyze_user_behavior(self, user_id: str, activity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        🧠 Analyze user behavior patterns for AI personalization
        """
        try:
            # Initialize user profile if not exists
            if user_id not in self.user_profiles:
                self.user_profiles[user_id] = {
                    "created_at": datetime.utcnow().isoformat(),
                    "total_sessions": 0,
                    "preferred_mission_types": [],
                    "engagement_score": 0.0,
                    "personalization_level": "basic"
                }
            
            profile = self.user_profiles[user_id]
            profile["total_sessions"] += 1
            profile["last_active"] = datetime.utcnow().isoformat()
            
            # Analyze activity patterns
            analysis = {
                "user_id": user_id,
                "behavior_patterns": {
                    "session_frequency": self._calculate_session_frequency(profile),
                    "mission_completion_rate": activity_data.get("mission_completion_rate", 0.5),
                    "preferred_times": self._analyze_activity_times(activity_data),
                    "engagement_depth": self._calculate_engagement_depth(activity_data)
                },
                "personalization_insights": {
                    "optimal_mission_difficulty": self._determine_optimal_difficulty(profile),
                    "reward_motivation_type": self._determine_reward_motivation(activity_data),
                    "social_engagement_level": activity_data.get("social_interactions", 0)
                },
                "ai_recommendations": await self._generate_ai_recommendations(user_id, profile, activity_data)
            }
            
            # Update engagement score
            profile["engagement_score"] = self._calculate_engagement_score(analysis)
            
            return analysis
            
        except Exception as e:
            logger.error(f"AI behavior analysis error: {e}")
            return {"error": str(e)}
    
    async def generate_personalized_missions(self, user_id: str, available_missions: List[Dict]) -> List[Dict]:
        """
        🎯 Generate personalized mission recommendations using AI
        """
        try:
            profile = self.user_profiles.get(user_id, {})
            
            # AI-driven mission scoring
            scored_missions = []
            for mission in available_missions:
                score = await self._score_mission_for_user(user_id, mission, profile)
                scored_missions.append({
                    **mission,
                    "ai_score": score,
                    "personalization_reasons": self._explain_mission_recommendation(mission, profile)
                })
            
            # Sort by AI score and return top recommendations
            scored_missions.sort(key=lambda x: x["ai_score"], reverse=True)
            
            # Add personalized difficulty adjustments
            for mission in scored_missions[:5]:  # Top 5 missions
                mission["personalized_target"] = await self._adjust_mission_difficulty(user_id, mission)
                mission["estimated_completion_time"] = self._estimate_completion_time(user_id, mission)
            
            return scored_missions[:10]  # Return top 10 personalized missions
            
        except Exception as e:
            logger.error(f"Personalized missions generation error: {e}")
            return available_missions[:5]  # Fallback to first 5 missions
    
    async def optimize_reward_distribution(self, user_id: str, base_reward: Dict[str, Any]) -> Dict[str, Any]:
        """
        💎 AI-optimized reward distribution based on user preferences
        """
        try:
            profile = self.user_profiles.get(user_id, {})
            
            # Determine user's reward preferences through AI analysis
            reward_preferences = await self._analyze_reward_preferences(user_id, profile)
            
            # Optimize reward composition
            optimized_reward = {
                **base_reward,
                "personalized": True,
                "optimization": {
                    "preferred_currency": reward_preferences.get("preferred_currency", "aisle_coins"),
                    "bonus_multiplier": reward_preferences.get("bonus_multiplier", 1.0),
                    "surprise_element": reward_preferences.get("surprise_element", False)
                }
            }
            
            # Add surprise rewards for high-engagement users
            if profile.get("engagement_score", 0) > 0.8:
                optimized_reward["surprise_bonus"] = {
                    "type": "engagement_bonus",
                    "value": random.randint(10, 50),
                    "message": "High engagement bonus! 🌟"
                }
            
            # Streak multipliers for consistent users
            if await self._is_consistent_user(user_id):
                optimized_reward["streak_multiplier"] = 1.5
                optimized_reward["consistency_message"] = "Consistency streak bonus! 🔥"
            
            return optimized_reward
            
        except Exception as e:
            logger.error(f"Reward optimization error: {e}")
            return base_reward
    
    async def predict_user_churn(self, user_id: str) -> Dict[str, Any]:
        """
        📉 AI-powered churn prediction and prevention
        """
        try:
            profile = self.user_profiles.get(user_id, {})
            
            # Calculate churn risk factors
            risk_factors = {
                "engagement_decline": await self._analyze_engagement_trend(user_id),
                "mission_abandonment": self._calculate_abandonment_rate(profile),
                "social_isolation": await self._analyze_social_connections(user_id),
                "reward_dissatisfaction": await self._analyze_reward_satisfaction(user_id)
            }
            
            # AI churn score (0-1, higher = more likely to churn)
            churn_score = sum(risk_factors.values()) / len(risk_factors)
            
            # Generate prevention strategies
            prevention_strategies = await self._generate_retention_strategies(user_id, risk_factors)
            
            return {
                "user_id": user_id,
                "churn_risk": {
                    "score": churn_score,
                    "level": "high" if churn_score > 0.7 else "medium" if churn_score > 0.4 else "low",
                    "risk_factors": risk_factors
                },
                "prevention_strategies": prevention_strategies,
                "recommended_actions": await self._recommend_immediate_actions(user_id, churn_score)
            }
            
        except Exception as e:
            logger.error(f"Churn prediction error: {e}")
            return {"error": str(e)}
    
    async def generate_smart_notifications(self, user_id: str) -> List[Dict[str, Any]]:
        """
        🔔 AI-generated smart notifications based on user behavior
        """
        try:
            profile = self.user_profiles.get(user_id, {})
            
            notifications = []
            
            # Mission completion reminders
            if await self._should_send_mission_reminder(user_id):
                notifications.append({
                    "type": "mission_reminder",
                    "title": "Your missions are waiting! 🎯",
                    "message": await self._generate_personalized_mission_message(user_id),
                    "priority": "medium",
                    "cta": "Complete Missions"
                })
            
            # Streak protection alerts
            if await self._streak_at_risk(user_id):
                notifications.append({
                    "type": "streak_protection",
                    "title": "Don't break your streak! 🔥",
                    "message": "You have 2 hours left to maintain your 7-day streak",
                    "priority": "high",
                    "cta": "Save Streak"
                })
            
            # Personalized achievement opportunities
            achievements = await self._find_close_achievements(user_id)
            for achievement in achievements[:2]:  # Max 2 achievement notifications
                notifications.append({
                    "type": "achievement_opportunity",
                    "title": f"Almost there! {achievement['icon']}",
                    "message": f"You're {achievement['steps_remaining']} steps away from '{achievement['name']}'",
                    "priority": "low",
                    "cta": "View Progress"
                })
            
            # League advancement opportunities
            if await self._can_advance_league(user_id):
                notifications.append({
                    "type": "league_opportunity",
                    "title": "League promotion available! 🏆",
                    "message": "Complete 2 more missions to advance to the next league",
                    "priority": "medium",
                    "cta": "Advance League"
                })
            
            # Social engagement suggestions
            if profile.get("engagement_score", 0) < 0.3:
                notifications.append({
                    "type": "social_engagement",
                    "title": "Connect with the community! 👥",
                    "message": "See what top performers are doing in the leaderboard",
                    "priority": "low",
                    "cta": "View Leaderboard"
                })
            
            return notifications
            
        except Exception as e:
            logger.error(f"Smart notifications generation error: {e}")
            return []
    
    async def adaptive_difficulty_adjustment(self, user_id: str, mission_id: str, performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        ⚙️ AI-powered adaptive difficulty adjustment based on user performance
        """
        try:
            profile = self.user_profiles.get(user_id, {})
            
            # Analyze performance patterns
            performance_analysis = {
                "success_rate": performance_data.get("success_rate", 0.5),
                "completion_time": performance_data.get("avg_completion_time", 300),
                "attempts_needed": performance_data.get("avg_attempts", 1.5),
                "user_feedback": performance_data.get("difficulty_feedback", "just_right")
            }
            
            # AI difficulty recommendation
            current_difficulty = performance_data.get("current_difficulty", "medium")
            recommended_adjustment = await self._calculate_difficulty_adjustment(performance_analysis)
            
            adjustment = {
                "user_id": user_id,
                "mission_id": mission_id,
                "current_difficulty": current_difficulty,
                "recommended_adjustment": recommended_adjustment,
                "reasoning": await self._explain_difficulty_adjustment(performance_analysis),
                "confidence_score": self._calculate_adjustment_confidence(performance_analysis)
            }
            
            # Apply gradual difficulty scaling
            if recommended_adjustment != "no_change":
                adjustment["new_targets"] = await self._generate_adjusted_targets(
                    user_id, mission_id, recommended_adjustment
                )
            
            return adjustment
            
        except Exception as e:
            logger.error(f"Adaptive difficulty adjustment error: {e}")
            return {"error": str(e)}
    
    # Helper methods for AI analysis
    
    def _calculate_session_frequency(self, profile: Dict[str, Any]) -> str:
        """Calculate user session frequency pattern"""
        total_sessions = profile.get("total_sessions", 0)
        if total_sessions > 100:
            return "very_high"
        elif total_sessions > 50:
            return "high"
        elif total_sessions > 20:
            return "medium"
        elif total_sessions > 5:
            return "low"
        else:
            return "very_low"
    
    def _analyze_activity_times(self, activity_data: Dict[str, Any]) -> List[str]:
        """Analyze preferred activity times"""
        # Mock analysis - in production, analyze actual timestamps
        return ["evening", "weekends"]
    
    def _calculate_engagement_depth(self, activity_data: Dict[str, Any]) -> float:
        """Calculate how deeply engaged the user is"""
        factors = [
            activity_data.get("session_duration", 0) / 3600,  # Convert to hours
            activity_data.get("actions_per_session", 0) / 10,
            activity_data.get("feature_usage_breadth", 0) / 5
        ]
        return min(sum(factors) / len(factors), 1.0)
    
    def _determine_optimal_difficulty(self, profile: Dict[str, Any]) -> str:
        """Determine optimal mission difficulty for user"""
        engagement_score = profile.get("engagement_score", 0.5)
        if engagement_score > 0.8:
            return "challenging"
        elif engagement_score > 0.5:
            return "medium"
        else:
            return "easy"
    
    def _determine_reward_motivation(self, activity_data: Dict[str, Any]) -> str:
        """Determine what type of rewards motivate the user most"""
        # AI analysis of user behavior patterns
        social_score = activity_data.get("social_interactions", 0)
        achievement_focus = activity_data.get("achievement_completion_rate", 0.5)
        
        if social_score > 0.7:
            return "social_recognition"
        elif achievement_focus > 0.8:
            return "achievement_unlocking"
        else:
            return "monetary_rewards"
    
    async def _generate_ai_recommendations(self, user_id: str, profile: Dict[str, Any], activity_data: Dict[str, Any]) -> List[str]:
        """Generate AI-powered recommendations for user improvement"""
        recommendations = []
        
        engagement_score = profile.get("engagement_score", 0.5)
        
        if engagement_score < 0.3:
            recommendations.append("Try easier missions to build confidence")
            recommendations.append("Connect with community for motivation")
        elif engagement_score > 0.8:
            recommendations.append("Challenge yourself with advanced missions")
            recommendations.append("Mentor newer users for extra rewards")
        
        return recommendations
    
    async def _score_mission_for_user(self, user_id: str, mission: Dict[str, Any], profile: Dict[str, Any]) -> float:
        """AI scoring of how suitable a mission is for a specific user"""
        base_score = 0.5
        
        # Adjust based on user preferences
        engagement_score = profile.get("engagement_score", 0.5)
        mission_difficulty = mission.get("difficulty", "medium")
        
        # Difficulty matching
        if engagement_score > 0.7 and mission_difficulty == "hard":
            base_score += 0.3
        elif engagement_score < 0.4 and mission_difficulty == "easy":
            base_score += 0.3
        
        # Mission type preferences
        preferred_types = profile.get("preferred_mission_types", [])
        if mission.get("type") in preferred_types:
            base_score += 0.2
        
        return min(base_score, 1.0)
    
    def _explain_mission_recommendation(self, mission: Dict[str, Any], profile: Dict[str, Any]) -> List[str]:
        """Explain why a mission is recommended for a user"""
        reasons = []
        
        engagement_score = profile.get("engagement_score", 0.5)
        if engagement_score > 0.7:
            reasons.append("Matches your high engagement level")
        
        reasons.append("Aligned with your success pattern")
        return reasons
    
    async def _adjust_mission_difficulty(self, user_id: str, mission: Dict[str, Any]) -> Dict[str, Any]:
        """Adjust mission targets based on user capability"""
        profile = self.user_profiles.get(user_id, {})
        engagement_score = profile.get("engagement_score", 0.5)
        
        base_target = mission.get("target", 100)
        if engagement_score > 0.8:
            adjusted_target = int(base_target * 1.2)  # 20% harder
        elif engagement_score < 0.3:
            adjusted_target = int(base_target * 0.8)  # 20% easier
        else:
            adjusted_target = base_target
        
        return {
            "original_target": base_target,
            "adjusted_target": adjusted_target,
            "adjustment_factor": adjusted_target / base_target if base_target > 0 else 1.0
        }
    
    def _estimate_completion_time(self, user_id: str, mission: Dict[str, Any]) -> int:
        """Estimate mission completion time for user in minutes"""
        profile = self.user_profiles.get(user_id, {})
        base_time = mission.get("estimated_time", 30)
        
        engagement_score = profile.get("engagement_score", 0.5)
        if engagement_score > 0.7:
            return int(base_time * 0.8)  # Faster completion
        elif engagement_score < 0.3:
            return int(base_time * 1.3)  # Slower completion
        else:
            return base_time
    
    def _calculate_engagement_score(self, analysis: Dict[str, Any]) -> float:
        """Calculate overall engagement score from behavior analysis"""
        behavior = analysis.get("behavior_patterns", {})
        
        factors = [
            0.3 if behavior.get("session_frequency") in ["high", "very_high"] else 0.1,
            behavior.get("mission_completion_rate", 0.5),
            behavior.get("engagement_depth", 0.5)
        ]
        
        return sum(factors) / len(factors)
    
    # Additional helper methods would continue here...
    # For brevity, including key methods that demonstrate the AI capabilities
    
    async def _analyze_reward_preferences(self, user_id: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user's reward preferences through AI"""
        return {
            "preferred_currency": "aisle_coins",
            "bonus_multiplier": 1.2,
            "surprise_element": True
        }
    
    async def _is_consistent_user(self, user_id: str) -> bool:
        """Determine if user has consistent engagement patterns"""
        profile = self.user_profiles.get(user_id, {})
        return profile.get("total_sessions", 0) > 20
    
    async def _analyze_engagement_trend(self, user_id: str) -> float:
        """Analyze engagement trend for churn prediction"""
        return random.uniform(0.1, 0.8)  # Mock trend analysis
    
    def _calculate_abandonment_rate(self, profile: Dict[str, Any]) -> float:
        """Calculate mission abandonment rate"""
        return random.uniform(0.1, 0.6)  # Mock abandonment rate
    
    async def _analyze_social_connections(self, user_id: str) -> float:
        """Analyze social isolation risk"""
        return random.uniform(0.0, 0.5)  # Mock social analysis
    
    async def _analyze_reward_satisfaction(self, user_id: str) -> float:
        """Analyze reward satisfaction levels"""
        return random.uniform(0.1, 0.4)  # Mock satisfaction analysis
    
    async def _generate_retention_strategies(self, user_id: str, risk_factors: Dict[str, float]) -> List[str]:
        """Generate AI-powered retention strategies"""
        strategies = []
        
        if risk_factors.get("engagement_decline", 0) > 0.5:
            strategies.append("Offer personalized mission recommendations")
            strategies.append("Provide difficulty adjustment options")
        
        if risk_factors.get("social_isolation", 0) > 0.5:
            strategies.append("Encourage community participation")
            strategies.append("Suggest collaborative missions")
        
        return strategies
    
    async def _recommend_immediate_actions(self, user_id: str, churn_score: float) -> List[str]:
        """Recommend immediate actions based on churn risk"""
        if churn_score > 0.7:
            return [
                "Send personalized re-engagement campaign",
                "Offer exclusive rewards", 
                "Provide 1-on-1 support"
            ]
        elif churn_score > 0.4:
            return [
                "Increase reward frequency",
                "Suggest easier missions",
                "Send motivation notifications"
            ]
        else:
            return ["Continue current engagement strategy"]

# Initialize global AI personalization service
ai_personalization_service = AIPersonalizationService()