"""
BlueWave AisleMarts TikTok-Style Recommendation Engine
==================================================
Advanced AI-powered content recommendation with family safety at its core.
"""

import asyncio
import logging
import random
import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum
import numpy as np

logger = logging.getLogger(__name__)

class ContentCategory(str, Enum):
    FASHION = "fashion"
    TECH = "tech"
    FOOD = "food"
    HEALTH = "health"
    EDUCATION = "education"
    ENTERTAINMENT = "entertainment"
    FAMILY = "family"
    PARENTING = "parenting"

class SafetyLevel(str, Enum):
    FAMILY_SAFE = "family_safe"
    TEEN_APPROPRIATE = "teen_appropriate"
    ADULT_ONLY = "adult_only"

class UserSignal:
    """Represents user interaction signals for recommendation"""
    def __init__(self, signal_type: str, strength: float, timestamp: datetime, metadata: Dict = None):
        self.signal_type = signal_type  # view, like, share, comment, save, skip, etc.
        self.strength = strength  # 0.0 to 1.0
        self.timestamp = timestamp
        self.metadata = metadata or {}

class ContentItem:
    """Represents a piece of content in the recommendation system"""
    def __init__(self, content_id: str, category: ContentCategory, safety_level: SafetyLevel, 
                 features: Dict, creator_id: str = None):
        self.content_id = content_id
        self.category = category
        self.safety_level = safety_level
        self.features = features  # embeddings, tags, duration, etc.
        self.creator_id = creator_id
        self.performance_stats = {
            "views": 0,
            "completion_rate": 0.0,
            "engagement_rate": 0.0,
            "family_safety_score": 1.0
        }

class UserProfile:
    """User profile for personalized recommendations"""
    def __init__(self, user_id: str, age: int = None, family_role: str = None):
        self.user_id = user_id
        self.age = age
        self.family_role = family_role  # parent, teen, child, adult
        self.interests = {}  # category -> interest strength
        self.interaction_history = []
        self.family_settings = {
            "parental_controls": False,
            "content_filtering": SafetyLevel.FAMILY_SAFE,
            "spending_approval": False
        }
        self.embedding = np.random.rand(128)  # User embedding vector

class BlueWaveRecommendationEngine:
    """
    TikTok-style recommendation engine with BlueWave family safety
    
    Key Features:
    - Family-first content filtering
    - Real-time engagement signals
    - Multi-objective optimization (engagement + safety)
    - Cold start handling
    - Diversity injection
    """
    
    def __init__(self):
        self.content_catalog = {}  # content_id -> ContentItem
        self.user_profiles = {}    # user_id -> UserProfile
        self.trending_content = []
        self.safety_classifier_confidence = 0.95
        
        # Recommendation parameters
        self.engagement_weight = 0.4
        self.safety_weight = 0.3
        self.diversity_weight = 0.2
        self.freshness_weight = 0.1
        
        logger.info("🤖 BlueWave Recommendation Engine initialized")

    async def get_recommendations(self, user_id: str, count: int = 10, 
                                family_safe_only: bool = True) -> List[Dict]:
        """
        Generate personalized recommendations with family safety
        
        Pipeline:
        1. Candidate Generation (recall)
        2. Family Safety Filtering
        3. Multi-objective Ranking
        4. Diversity Injection
        5. Final Selection
        """
        try:
            logger.info(f"🎯 Generating {count} recommendations for user {user_id}")
            
            # Get or create user profile
            user_profile = await self._get_user_profile(user_id)
            
            # Step 1: Candidate Generation
            candidates = await self._generate_candidates(user_profile)
            logger.info(f"📋 Generated {len(candidates)} candidates")
            
            # Step 2: Family Safety Filter
            if family_safe_only or user_profile.family_settings["content_filtering"] == SafetyLevel.FAMILY_SAFE:
                candidates = await self._apply_family_safety_filter(candidates, user_profile)
                logger.info(f"🛡️ After safety filter: {len(candidates)} candidates")
            
            # Step 3: Multi-objective Ranking
            ranked_candidates = await self._rank_candidates(candidates, user_profile)
            logger.info(f"📊 Ranked {len(ranked_candidates)} candidates")
            
            # Step 4: Diversity Injection
            diverse_candidates = await self._inject_diversity(ranked_candidates, user_profile)
            logger.info(f"🌈 After diversity injection: {len(diverse_candidates)} candidates")
            
            # Step 5: Final Selection
            final_recommendations = diverse_candidates[:count]
            
            # Convert to API format
            formatted_recommendations = []
            for candidate in final_recommendations:
                formatted_rec = await self._format_recommendation(candidate, user_profile)
                formatted_recommendations.append(formatted_rec)
            
            logger.info(f"✅ Generated {len(formatted_recommendations)} final recommendations")
            
            return {
                "recommendations": formatted_recommendations,
                "recommendation_metadata": {
                    "user_id": user_id,
                    "family_safe_only": family_safe_only,
                    "personalization_strength": self._calculate_personalization_strength(user_profile),
                    "safety_score": self._calculate_safety_score(formatted_recommendations),
                    "diversity_score": self._calculate_diversity_score(formatted_recommendations),
                    "generated_at": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Recommendation generation failed: {e}")
            # Fallback to trending family-safe content
            return await self._get_fallback_recommendations(count, family_safe_only)

    async def _get_user_profile(self, user_id: str) -> UserProfile:
        """Get or create user profile"""
        if user_id not in self.user_profiles:
            # Create new user profile
            profile = UserProfile(user_id)
            
            # Initialize with default interests for cold start
            profile.interests = {
                ContentCategory.FAMILY: 0.8,
                ContentCategory.EDUCATION: 0.6,
                ContentCategory.HEALTH: 0.5,
                ContentCategory.FASHION: 0.4,
                ContentCategory.TECH: 0.3
            }
            
            self.user_profiles[user_id] = profile
            logger.info(f"👤 Created new user profile for {user_id}")
        
        return self.user_profiles[user_id]

    async def _generate_candidates(self, user_profile: UserProfile) -> List[ContentItem]:
        """Generate candidate content using multiple strategies"""
        candidates = []
        
        # Strategy 1: Interest-based content
        interest_candidates = await self._get_interest_based_candidates(user_profile)
        candidates.extend(interest_candidates)
        
        # Strategy 2: Trending content
        trending_candidates = await self._get_trending_candidates()
        candidates.extend(trending_candidates)
        
        # Strategy 3: Similar users content
        collaborative_candidates = await self._get_collaborative_candidates(user_profile)
        candidates.extend(collaborative_candidates)
        
        # Strategy 4: Fresh content for discovery
        fresh_candidates = await self._get_fresh_content_candidates()
        candidates.extend(fresh_candidates)
        
        # Remove duplicates
        unique_candidates = {c.content_id: c for c in candidates}.values()
        return list(unique_candidates)

    async def _get_interest_based_candidates(self, user_profile: UserProfile) -> List[ContentItem]:
        """Get content based on user interests"""
        candidates = []
        
        # Mock content based on user interests
        for category, interest_strength in user_profile.interests.items():
            if interest_strength > 0.3:  # Only consider categories with decent interest
                category_content = await self._get_content_by_category(category, limit=10)
                candidates.extend(category_content)
        
        return candidates

    async def _get_trending_candidates(self) -> List[ContentItem]:
        """Get currently trending content"""
        # Mock trending content
        trending = [
            ContentItem("trend_001", ContentCategory.FASHION, SafetyLevel.FAMILY_SAFE, {
                "tags": ["winter", "fashion", "family-friendly"],
                "duration": 30,
                "engagement_score": 0.85
            }),
            ContentItem("trend_002", ContentCategory.TECH, SafetyLevel.FAMILY_SAFE, {
                "tags": ["family-tech", "parental-controls", "safe"],
                "duration": 45,
                "engagement_score": 0.78
            }),
            ContentItem("trend_003", ContentCategory.HEALTH, SafetyLevel.FAMILY_SAFE, {
                "tags": ["healthy-eating", "family-nutrition", "organic"],
                "duration": 25,
                "engagement_score": 0.92
            })
        ]
        
        return trending

    async def _get_collaborative_candidates(self, user_profile: UserProfile) -> List[ContentItem]:
        """Get content liked by similar users"""
        # Mock collaborative filtering
        similar_user_content = [
            ContentItem("collab_001", ContentCategory.PARENTING, SafetyLevel.FAMILY_SAFE, {
                "tags": ["parenting-tips", "family-bonding", "communication"],
                "duration": 60,
                "engagement_score": 0.71
            })
        ]
        
        return similar_user_content

    async def _get_fresh_content_candidates(self) -> List[ContentItem]:
        """Get fresh content for discovery"""
        # Mock fresh content
        fresh_content = [
            ContentItem("fresh_001", ContentCategory.EDUCATION, SafetyLevel.FAMILY_SAFE, {
                "tags": ["learning", "kids-education", "fun-facts"],
                "duration": 35,
                "engagement_score": 0.65,
                "created_at": datetime.now()
            })
        ]
        
        return fresh_content

    async def _get_content_by_category(self, category: ContentCategory, limit: int = 10) -> List[ContentItem]:
        """Get content by category"""
        # Mock category-based content
        category_content = [
            ContentItem(f"{category.value}_001", category, SafetyLevel.FAMILY_SAFE, {
                "tags": [category.value, "family-safe", "educational"],
                "duration": 30 + random.randint(-10, 20),
                "engagement_score": 0.5 + random.random() * 0.4
            })
        ]
        
        return category_content[:limit]

    async def _apply_family_safety_filter(self, candidates: List[ContentItem], 
                                        user_profile: UserProfile) -> List[ContentItem]:
        """Apply family safety filtering"""
        safe_candidates = []
        
        for candidate in candidates:
            # Check safety level
            if candidate.safety_level == SafetyLevel.ADULT_ONLY:
                continue
                
            if user_profile.age and user_profile.age < 13 and candidate.safety_level != SafetyLevel.FAMILY_SAFE:
                continue
                
            if user_profile.age and user_profile.age < 18 and candidate.safety_level == SafetyLevel.ADULT_ONLY:
                continue
            
            # Check family safety score
            if candidate.performance_stats["family_safety_score"] < 0.8:
                continue
                
            # Check for blocked content
            if self._is_content_blocked(candidate, user_profile):
                continue
                
            safe_candidates.append(candidate)
        
        return safe_candidates

    def _is_content_blocked(self, candidate: ContentItem, user_profile: UserProfile) -> bool:
        """Check if content is blocked by family settings"""
        # Mock content blocking logic
        blocked_tags = ["inappropriate", "violent", "adult-themes"]
        content_tags = candidate.features.get("tags", [])
        
        for tag in content_tags:
            if tag.lower() in blocked_tags:
                return True
                
        return False

    async def _rank_candidates(self, candidates: List[ContentItem], 
                              user_profile: UserProfile) -> List[ContentItem]:
        """Rank candidates using multi-objective optimization"""
        scored_candidates = []
        
        for candidate in candidates:
            score = self._calculate_candidate_score(candidate, user_profile)
            scored_candidates.append((candidate, score))
        
        # Sort by score (descending)
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        
        return [candidate for candidate, score in scored_candidates]

    def _calculate_candidate_score(self, candidate: ContentItem, user_profile: UserProfile) -> float:
        """Calculate multi-objective score for candidate"""
        # Engagement Score
        engagement_score = candidate.performance_stats.get("engagement_rate", 0.5)
        
        # Safety Score
        safety_score = candidate.performance_stats.get("family_safety_score", 1.0)
        
        # Interest Alignment Score
        category_interest = user_profile.interests.get(candidate.category, 0.3)
        
        # Freshness Score (newer content gets boost)
        freshness_score = 0.8  # Mock freshness
        
        # Weighted combination
        total_score = (
            self.engagement_weight * engagement_score +
            self.safety_weight * safety_score +
            self.diversity_weight * category_interest +
            self.freshness_weight * freshness_score
        )
        
        return total_score

    async def _inject_diversity(self, ranked_candidates: List[ContentItem], 
                               user_profile: UserProfile) -> List[ContentItem]:
        """Inject diversity to avoid filter bubbles"""
        diverse_candidates = []
        seen_categories = set()
        seen_creators = set()
        
        for candidate in ranked_candidates:
            # Avoid too much of same category
            if len(diverse_candidates) > 0 and candidate.category in seen_categories:
                if len([c for c in diverse_candidates if c.category == candidate.category]) >= 3:
                    continue
            
            # Avoid too much from same creator
            if candidate.creator_id in seen_creators:
                creator_count = len([c for c in diverse_candidates if c.creator_id == candidate.creator_id])
                if creator_count >= 2:
                    continue
            
            diverse_candidates.append(candidate)
            seen_categories.add(candidate.category)
            if candidate.creator_id:
                seen_creators.add(candidate.creator_id)
        
        return diverse_candidates

    async def _format_recommendation(self, candidate: ContentItem, 
                                   user_profile: UserProfile) -> Dict:
        """Format candidate for API response"""
        return {
            "content_id": candidate.content_id,
            "type": "video",
            "category": candidate.category.value,
            "safety_level": candidate.safety_level.value,
            "title": f"Recommended {candidate.category.value} content",
            "thumbnail_url": f"https://images.unsplash.com/photo-{random.randint(1000000000000, 9999999999999)}?w=300",
            "duration": candidate.features.get("duration", 30),
            "creator": {
                "id": candidate.creator_id or f"creator_{random.randint(1000, 9999)}",
                "username": f"@{candidate.category.value}_creator",
                "verified": random.choice([True, False])
            },
            "stats": {
                "views": random.randint(1000, 1000000),
                "likes": random.randint(100, 100000),
                "engagement_rate": candidate.performance_stats.get("engagement_rate", 0.5)
            },
            "family_safety": {
                "score": candidate.performance_stats.get("family_safety_score", 1.0),
                "appropriate_for_age": self._get_appropriate_age(candidate, user_profile),
                "parental_guidance": candidate.safety_level != SafetyLevel.FAMILY_SAFE
            },
            "recommendation_reason": self._get_recommendation_reason(candidate, user_profile)
        }

    def _get_appropriate_age(self, candidate: ContentItem, user_profile: UserProfile) -> str:
        """Get age appropriateness"""
        if candidate.safety_level == SafetyLevel.FAMILY_SAFE:
            return "All ages"
        elif candidate.safety_level == SafetyLevel.TEEN_APPROPRIATE:
            return "13+"
        else:
            return "18+"

    def _get_recommendation_reason(self, candidate: ContentItem, user_profile: UserProfile) -> str:
        """Get reason for recommendation"""
        reasons = [
            f"Popular in {candidate.category.value}",
            "Trending now",
            "Because you liked similar content",
            "New and family-safe",
            "Recommended for families"
        ]
        return random.choice(reasons)

    async def _get_fallback_recommendations(self, count: int, family_safe_only: bool) -> Dict:
        """Fallback recommendations when main engine fails"""
        fallback_content = [
            {
                "content_id": f"fallback_{i}",
                "type": "video",
                "category": "family",
                "title": "Family-safe content",
                "thumbnail_url": "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300",
                "family_safety": {"score": 1.0, "appropriate_for_age": "All ages"}
            }
            for i in range(count)
        ]
        
        return {
            "recommendations": fallback_content,
            "recommendation_metadata": {
                "fallback": True,
                "family_safe_only": family_safe_only,
                "generated_at": datetime.now().isoformat()
            }
        }

    def _calculate_personalization_strength(self, user_profile: UserProfile) -> float:
        """Calculate how personalized the recommendations are"""
        # Based on interaction history length and diversity
        interaction_count = len(user_profile.interaction_history)
        if interaction_count < 10:
            return 0.3  # Low personalization for new users
        elif interaction_count < 50:
            return 0.6  # Medium personalization
        else:
            return 0.9  # High personalization

    def _calculate_safety_score(self, recommendations: List[Dict]) -> float:
        """Calculate average safety score of recommendations"""
        if not recommendations:
            return 1.0
            
        total_score = sum(rec.get("family_safety", {}).get("score", 1.0) for rec in recommendations)
        return total_score / len(recommendations)

    def _calculate_diversity_score(self, recommendations: List[Dict]) -> float:
        """Calculate diversity score of recommendations"""
        if not recommendations:
            return 0.0
            
        categories = [rec.get("category") for rec in recommendations]
        unique_categories = len(set(categories))
        return unique_categories / len(recommendations)

    async def update_user_interaction(self, user_id: str, content_id: str, 
                                    interaction_type: str, strength: float = 1.0):
        """Update user profile based on interaction"""
        try:
            user_profile = await self._get_user_profile(user_id)
            
            # Create interaction signal
            signal = UserSignal(
                signal_type=interaction_type,
                strength=strength,
                timestamp=datetime.now(),
                metadata={"content_id": content_id}
            )
            
            user_profile.interaction_history.append(signal)
            
            # Update interests based on interaction
            if content_id in self.content_catalog:
                content = self.content_catalog[content_id]
                current_interest = user_profile.interests.get(content.category, 0.3)
                
                # Adjust interest based on interaction type
                if interaction_type in ["like", "save", "share"]:
                    new_interest = min(1.0, current_interest + 0.1 * strength)
                elif interaction_type == "skip":
                    new_interest = max(0.0, current_interest - 0.05 * strength)
                else:
                    new_interest = current_interest + 0.02 * strength  # Small boost for views
                
                user_profile.interests[content.category] = new_interest
            
            logger.info(f"🔄 Updated user {user_id} interaction: {interaction_type} on {content_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to update user interaction: {e}")

# Global recommendation engine instance
recommendation_engine = BlueWaveRecommendationEngine()

logger.info("✅ BlueWave TikTok Recommendation Engine initialized")