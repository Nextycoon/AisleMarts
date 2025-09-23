import asyncio
import json
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
            return "This content appears appropriate and engaging for the community."
    class UserMessage:
        def __init__(self, text):
            self.text = text

from models.community import (
    CommunityPost, ProductReview, Comment, UserInteraction, ContentType,
    ContentStatus, ReviewRating, ModerationAction, AIModeration,
    CommunityStats, TrendingContent, CommunityFeed,
    CreatePostRequest, CreateReviewRequest, UpdateInteractionRequest,
    ContentModerationRequest, DEFAULT_CATEGORIES, DEFAULT_TRENDING_TOPICS
)


class CommunityService:
    def __init__(self):
        self.emergent_llm_key = os.getenv("EMERGENT_LLM_KEY", "sk-emergent-35d93F3CeFf0c7aD50")
        self.ai_chat = None
        self.init_ai_service()
        
        # In-memory storage for demo (replace with MongoDB in production)
        self.posts: Dict[str, CommunityPost] = {}
        self.reviews: Dict[str, ProductReview] = {}
        self.comments: Dict[str, Comment] = {}
        self.interactions: List[UserInteraction] = []
        self.moderation_logs: List[AIModeration] = []
        
        # Initialize with sample content
        self._initialize_sample_content()

    def init_ai_service(self):
        """Initialize AI service for content moderation and analysis"""
        try:
            self.ai_chat = LlmChat(
                api_key=self.emergent_llm_key,
                session_id=f"community_ai_{uuid.uuid4()}",
                system_message="""You are an AI community moderator and content analyst for AisleMarts. Your responsibilities:

                1. Content Moderation: Analyze posts, reviews, and comments for:
                   - Inappropriate content, spam, or toxicity
                   - Authenticity and helpfulness (especially for reviews)
                   - Community guideline compliance
                   
                2. Sentiment Analysis: Determine emotional tone and user satisfaction
                
                3. Topic Detection: Identify key themes and categorize content
                
                4. Trend Analysis: Spot emerging topics and viral content patterns
                
                Always provide:
                - Moderation scores (0-1, where 1 is completely safe)
                - Sentiment scores (-1 to 1, where 1 is very positive)
                - Action recommendations (approve/flag/edit/remove)
                - Confidence levels for your assessments"""
            ).with_model("openai", "gpt-4o-mini")
        except Exception as e:
            print(f"Community AI service initialization error: {e}")
            self.ai_chat = None

    def _initialize_sample_content(self):
        """Initialize with sample community content"""
        # Sample posts
        sample_posts = [
            {
                "user_id": "user_001",
                "username": "ShopperEmma",
                "content_type": ContentType.POST,
                "title": "Best Holiday Deals I Found This Week!",
                "content": "Just discovered some amazing deals on winter coats and electronics. The AI recommendations really helped me find exactly what I was looking for!",
                "tags": ["deals", "winter", "electronics"],
                "category": "deals_and_offers",
                "likes": 23,
                "comments": 8,
                "views": 156
            },
            {
                "user_id": "user_002", 
                "username": "TechReviewer",
                "content_type": ContentType.REVIEW,
                "title": "Amazing Smart Watch - Highly Recommend",
                "content": "This smartwatch exceeded my expectations. Great battery life, accurate fitness tracking, and the AI assistant integration is seamless.",
                "tags": ["tech", "smartwatch", "review"],
                "category": "electronics",
                "likes": 45,
                "comments": 12,
                "views": 289
            }
        ]
        
        for post_data in sample_posts:
            post_id = str(uuid.uuid4())
            post = CommunityPost(
                id=post_id,
                **post_data,
                ai_sentiment_score=0.8,
                ai_moderation_score=0.95
            )
            self.posts[post_id] = post

    async def create_post(self, user_id: str, username: str, request: CreatePostRequest) -> CommunityPost:
        """Create a new community post with AI moderation"""
        post_id = str(uuid.uuid4())
        
        # AI moderation and analysis
        moderation_result = await self._moderate_content(
            content=f"{request.title}\n{request.content}",
            content_type=request.content_type,
            user_id=user_id
        )
        
        post = CommunityPost(
            id=post_id,
            user_id=user_id,
            username=username,
            content_type=request.content_type,
            title=request.title,
            content=request.content,
            images=request.images,
            tags=request.tags,
            category=request.category,
            ai_moderation_score=moderation_result["moderation_score"],
            ai_sentiment_score=moderation_result["sentiment_score"],
            ai_topics=moderation_result["topics"],
            status=ContentStatus.PUBLISHED if moderation_result["moderation_score"] > 0.7 else ContentStatus.MODERATED
        )
        
        self.posts[post_id] = post
        
        # Log moderation
        moderation_log = AIModeration(
            content_id=post_id,
            content_type=request.content_type,
            moderation_score=moderation_result["moderation_score"],
            sentiment_score=moderation_result["sentiment_score"],
            toxicity_score=moderation_result.get("toxicity_score", 0.0),
            spam_score=moderation_result.get("spam_score", 0.0),
            authenticity_score=moderation_result.get("authenticity_score", 0.9),
            topics_detected=moderation_result["topics"],
            action_recommended=ModerationAction.APPROVED if moderation_result["moderation_score"] > 0.7 else ModerationAction.FLAGGED,
            confidence=moderation_result.get("confidence", 0.85)
        )
        
        self.moderation_logs.append(moderation_log)
        
        return post

    async def create_review(self, user_id: str, username: str, request: CreateReviewRequest) -> ProductReview:
        """Create a new product review with AI analysis"""
        review_id = str(uuid.uuid4())
        
        # AI moderation and authenticity check
        moderation_result = await self._moderate_content(
            content=f"{request.title}\n{request.review_text}",
            content_type=ContentType.REVIEW,
            user_id=user_id
        )
        
        # Generate AI summary for longer reviews
        ai_summary = None
        if len(request.review_text) > 200:
            ai_summary = await self._generate_review_summary(request.review_text)
        
        review = ProductReview(
            id=review_id,
            user_id=user_id,
            username=username,
            product_id=request.product_id,
            product_name=request.product_name,
            rating=request.rating,
            title=request.title,
            review_text=request.review_text,
            images=request.images,
            ai_sentiment_score=moderation_result["sentiment_score"],
            ai_authenticity_score=moderation_result.get("authenticity_score", 0.9),
            ai_summary=ai_summary,
            status=ContentStatus.PUBLISHED if moderation_result["moderation_score"] > 0.7 else ContentStatus.MODERATED
        )
        
        self.reviews[review_id] = review
        
        return review

    async def add_comment(self, post_id: str, user_id: str, username: str, content: str, 
                         parent_comment_id: Optional[str] = None) -> Comment:
        """Add a comment to a post or reply to another comment"""
        comment_id = str(uuid.uuid4())
        
        # AI moderation for comment
        moderation_result = await self._moderate_content(
            content=content,
            content_type=ContentType.POST,
            user_id=user_id
        )
        
        comment = Comment(
            id=comment_id,
            post_id=post_id,
            user_id=user_id,
            username=username,
            content=content,
            parent_comment_id=parent_comment_id,
            ai_sentiment_score=moderation_result["sentiment_score"],
            is_flagged=moderation_result["moderation_score"] < 0.6
        )
        
        self.comments[comment_id] = comment
        
        # Update post comment count
        if post_id in self.posts:
            self.posts[post_id].comments += 1
        
        return comment

    async def record_interaction(self, user_id: str, request: UpdateInteractionRequest) -> Dict[str, Any]:
        """Record user interaction with content"""
        interaction = UserInteraction(
            user_id=user_id,
            content_id=request.content_id,
            interaction_type=request.interaction_type,
            metadata=request.metadata
        )
        
        self.interactions.append(interaction)
        
        # Update content metrics
        if request.content_id in self.posts:
            post = self.posts[request.content_id]
            if request.interaction_type == "like":
                post.likes += 1
            elif request.interaction_type == "share":
                post.shares += 1
            elif request.interaction_type == "view":
                post.views += 1
                
        elif request.content_id in self.reviews:
            review = self.reviews[request.content_id]
            if request.interaction_type == "helpful":
                review.helpful_count += 1
            elif request.interaction_type == "not_helpful":
                review.not_helpful_count += 1
        
        return {
            "success": True,
            "interaction_type": request.interaction_type,
            "content_id": request.content_id
        }

    async def get_community_feed(self, user_id: str, category: Optional[str] = None, 
                                limit: int = 20, offset: int = 0) -> CommunityFeed:
        """Get personalized community feed"""
        # Filter posts
        posts = list(self.posts.values())
        if category and category in DEFAULT_CATEGORIES:
            posts = [p for p in posts if p.category == category]
        
        # Sort by engagement and recency
        posts.sort(key=lambda p: (p.likes + p.comments) * 0.7 + p.views * 0.3, reverse=True)
        
        # Filter reviews
        reviews = list(self.reviews.values())
        reviews.sort(key=lambda r: r.helpful_count - r.not_helpful_count, reverse=True)
        
        # Get trending content
        trending = await self.get_trending_content()
        
        # Generate AI recommendations
        recommendations = await self._generate_content_recommendations(user_id)
        
        return CommunityFeed(
            posts=posts[offset:offset + limit],
            reviews=reviews[:10],  # Top 10 reviews
            trending=trending[:5],
            recommendations=recommendations,
            pagination={
                "offset": offset,
                "limit": limit,
                "total": len(posts),
                "has_more": offset + limit < len(posts)
            }
        )

    async def get_trending_content(self, limit: int = 10) -> List[TrendingContent]:
        """Get trending content based on engagement metrics"""
        all_content = []
        
        # Add posts
        for post in self.posts.values():
            if post.status == ContentStatus.PUBLISHED:
                engagement_rate = (post.likes + post.comments + post.shares) / max(post.views, 1)
                trending_score = engagement_rate * 0.6 + (post.likes / max(post.views, 1)) * 0.4
                
                all_content.append(TrendingContent(
                    id=post.id,
                    title=post.title,
                    content_type=post.content_type,
                    author=post.username,
                    trending_score=trending_score,
                    engagement_rate=engagement_rate,
                    created_at=post.created_at
                ))
        
        # Sort by trending score
        all_content.sort(key=lambda x: x.trending_score, reverse=True)
        
        return all_content[:limit]

    async def get_community_stats(self) -> CommunityStats:
        """Get community statistics and health metrics"""
        total_posts = len(self.posts)
        total_reviews = len(self.reviews)
        
        # Count unique users
        all_users = set()
        for post in self.posts.values():
            all_users.add(post.user_id)
        for review in self.reviews.values():
            all_users.add(review.user_id)
        total_users = len(all_users)
        
        # Active users today
        today = datetime.now().date()
        active_today = len(set([
            interaction.user_id for interaction in self.interactions
            if interaction.timestamp.date() == today
        ]))
        
        total_interactions = len(self.interactions)
        
        # Trending posts
        trending = await self.get_trending_content(5)
        trending_post_ids = [t.id for t in trending]
        
        # AI moderation stats
        ai_moderation_stats = {
            "total_moderated": len(self.moderation_logs),
            "auto_approved": len([log for log in self.moderation_logs if log.action_recommended == ModerationAction.APPROVED]),
            "flagged_for_review": len([log for log in self.moderation_logs if log.action_recommended == ModerationAction.FLAGGED]),
            "average_sentiment": sum([log.sentiment_score for log in self.moderation_logs]) / max(len(self.moderation_logs), 1)
        }
        
        # Community health score (0-1)
        positive_sentiment_ratio = len([log for log in self.moderation_logs if log.sentiment_score > 0.5]) / max(len(self.moderation_logs), 1)
        moderation_pass_rate = len([log for log in self.moderation_logs if log.moderation_score > 0.7]) / max(len(self.moderation_logs), 1)
        community_health_score = (positive_sentiment_ratio * 0.6) + (moderation_pass_rate * 0.4)
        
        return CommunityStats(
            total_posts=total_posts,
            total_reviews=total_reviews,
            total_users=total_users,
            active_users_today=active_today,
            total_interactions=total_interactions,
            trending_posts=trending_post_ids,
            popular_tags=DEFAULT_TRENDING_TOPICS,
            community_health_score=community_health_score,
            ai_moderation_stats=ai_moderation_stats
        )

    async def search_content(self, query: str, content_type: Optional[ContentType] = None, 
                           category: Optional[str] = None, limit: int = 20) -> Dict[str, List[Any]]:
        """Search community content"""
        results = {"posts": [], "reviews": [], "comments": []}
        
        query_lower = query.lower()
        
        # Search posts
        if not content_type or content_type == ContentType.POST:
            for post in self.posts.values():
                if (query_lower in post.title.lower() or 
                    query_lower in post.content.lower() or
                    any(query_lower in tag.lower() for tag in post.tags)):
                    if not category or post.category == category:
                        results["posts"].append(post)
        
        # Search reviews
        if not content_type or content_type == ContentType.REVIEW:
            for review in self.reviews.values():
                if (query_lower in review.title.lower() or 
                    query_lower in review.review_text.lower() or
                    query_lower in review.product_name.lower()):
                    results["reviews"].append(review)
        
        # Limit results
        results["posts"] = results["posts"][:limit]
        results["reviews"] = results["reviews"][:limit]
        
        return results

    # AI-powered helper methods
    async def _moderate_content(self, content: str, content_type: ContentType, user_id: str) -> Dict[str, Any]:
        """AI-powered content moderation"""
        if not self.ai_chat:
            return {
                "moderation_score": 0.9,
                "sentiment_score": 0.7,
                "topics": ["shopping", "general"],
                "confidence": 0.8
            }
        
        try:
            prompt = f"""Analyze this {content_type.value} content for moderation:

            Content: "{content}"
            
            Provide analysis in JSON format:
            {{
                "moderation_score": 0.0-1.0,
                "sentiment_score": -1.0 to 1.0,
                "toxicity_score": 0.0-1.0,
                "spam_score": 0.0-1.0,
                "authenticity_score": 0.0-1.0,
                "topics": ["topic1", "topic2"],
                "confidence": 0.0-1.0
            }}
            
            Moderation score: 1.0 = completely safe, 0.0 = completely unsafe
            Sentiment score: 1.0 = very positive, -1.0 = very negative
            """
            
            message = UserMessage(text=prompt)
            response = await self.ai_chat.send_message(message)
            
            # Parse AI response
            try:
                analysis = json.loads(response)
                return {
                    "moderation_score": analysis.get("moderation_score", 0.8),
                    "sentiment_score": analysis.get("sentiment_score", 0.5),
                    "toxicity_score": analysis.get("toxicity_score", 0.1),
                    "spam_score": analysis.get("spam_score", 0.1),
                    "authenticity_score": analysis.get("authenticity_score", 0.9),
                    "topics": analysis.get("topics", ["general"]),
                    "confidence": analysis.get("confidence", 0.8)
                }
            except json.JSONDecodeError:
                # Fallback if AI doesn't return valid JSON
                return {
                    "moderation_score": 0.8,
                    "sentiment_score": 0.6,
                    "topics": ["general"],
                    "confidence": 0.7
                }
                
        except Exception as e:
            print(f"AI moderation error: {e}")
            return {
                "moderation_score": 0.8,
                "sentiment_score": 0.5,
                "topics": ["general"],
                "confidence": 0.6
            }

    async def _generate_review_summary(self, review_text: str) -> Optional[str]:
        """Generate AI summary for long reviews"""
        if not self.ai_chat:
            return "This review provides detailed insights about the product experience."
        
        try:
            prompt = f"""Summarize this product review in 1-2 concise sentences:
            
            "{review_text}"
            
            Focus on the key points and overall sentiment."""
            
            message = UserMessage(text=prompt)
            summary = await self.ai_chat.send_message(message)
            return summary.strip()
            
        except Exception:
            return None

    async def _generate_content_recommendations(self, user_id: str) -> List[str]:
        """Generate personalized content recommendations"""
        # Simple recommendation based on user interactions
        user_interactions = [i for i in self.interactions if i.user_id == user_id]
        
        if not user_interactions:
            return ["Check out trending posts", "Browse product reviews", "Join the conversation"]
        
        # Analyze user's interaction patterns
        liked_categories = {}
        for interaction in user_interactions:
            if interaction.interaction_type == "like":
                content_id = interaction.content_id
                if content_id in self.posts:
                    category = self.posts[content_id].category
                    liked_categories[category] = liked_categories.get(category, 0) + 1
        
        recommendations = []
        if liked_categories:
            top_category = max(liked_categories, key=liked_categories.get)
            recommendations.append(f"Discover more {top_category.replace('_', ' ')} content")
        
        recommendations.extend([
            "Share your shopping experience",
            "Help others by writing reviews",
            "Join discussions in your favorite categories"
        ])
        
        return recommendations[:5]