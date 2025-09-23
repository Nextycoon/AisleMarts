from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime

from services.community_service import CommunityService
from models.community import (
    CommunityPost, ProductReview, Comment, CommunityStats, CommunityFeed,
    TrendingContent, CreatePostRequest, CreateReviewRequest,
    UpdateInteractionRequest, ContentType, ReviewRating
)

router = APIRouter()
community_service = CommunityService()


@router.get("/health")
async def health_check():
    """Health check for Community system"""
    return {
        "status": "operational",
        "service": "Community & Social Commerce Platform",
        "features": [
            "ai_content_moderation",
            "sentiment_analysis",
            "trending_detection",
            "community_feed",
            "product_reviews",
            "social_interactions"
        ],
        "total_posts": len(community_service.posts),
        "total_reviews": len(community_service.reviews),
        "total_comments": len(community_service.comments),
        "ai_integration": "emergent_llm" if community_service.ai_chat else "mock_mode",
        "timestamp": datetime.now()
    }


@router.get("/feed")
async def get_community_feed(
    user_id: str = Query(..., description="User ID for personalization"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, description="Number of posts to return"),
    offset: int = Query(0, description="Offset for pagination")
) -> CommunityFeed:
    """Get personalized community feed"""
    try:
        feed = await community_service.get_community_feed(user_id, category, limit, offset)
        return feed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get community feed: {str(e)}")


@router.post("/posts")
async def create_post(
    request: CreatePostRequest,
    user_id: str = Query(..., description="User ID"),
    username: str = Query(..., description="Username")
) -> CommunityPost:
    """Create a new community post with AI moderation"""
    try:
        post = await community_service.create_post(user_id, username, request)
        return post
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")


@router.get("/posts/{post_id}")
async def get_post(post_id: str) -> CommunityPost:
    """Get a specific post by ID"""
    if post_id not in community_service.posts:
        raise HTTPException(status_code=404, detail="Post not found")
    return community_service.posts[post_id]


@router.post("/reviews")
async def create_review(
    request: CreateReviewRequest,
    user_id: str = Query(..., description="User ID"),
    username: str = Query(..., description="Username")
) -> ProductReview:
    """Create a new product review with AI analysis"""
    try:
        review = await community_service.create_review(user_id, username, request)
        return review
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")


@router.get("/reviews")
async def get_reviews(
    product_id: Optional[str] = Query(None, description="Filter by product ID"),
    rating: Optional[ReviewRating] = Query(None, description="Filter by rating"),
    limit: int = Query(20, description="Number of reviews to return"),
    offset: int = Query(0, description="Offset for pagination")
) -> List[ProductReview]:
    """Get product reviews with optional filters"""
    try:
        reviews = list(community_service.reviews.values())
        
        # Apply filters
        if product_id:
            reviews = [r for r in reviews if r.product_id == product_id]
        if rating:
            reviews = [r for r in reviews if r.rating == rating]
        
        # Sort by helpful count
        reviews.sort(key=lambda r: r.helpful_count - r.not_helpful_count, reverse=True)
        
        return reviews[offset:offset + limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get reviews: {str(e)}")


@router.get("/reviews/{review_id}")
async def get_review(review_id: str) -> ProductReview:
    """Get a specific review by ID"""
    if review_id not in community_service.reviews:
        raise HTTPException(status_code=404, detail="Review not found")
    return community_service.reviews[review_id]


@router.post("/posts/{post_id}/comments")
async def add_comment(
    post_id: str,
    content: str = Query(..., description="Comment content"),
    user_id: str = Query(..., description="User ID"),
    username: str = Query(..., description="Username"),
    parent_comment_id: Optional[str] = Query(None, description="Parent comment ID for replies")
) -> Comment:
    """Add a comment to a post"""
    try:
        if post_id not in community_service.posts:
            raise HTTPException(status_code=404, detail="Post not found")
        
        comment = await community_service.add_comment(post_id, user_id, username, content, parent_comment_id)
        return comment
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add comment: {str(e)}")


@router.get("/posts/{post_id}/comments")
async def get_post_comments(
    post_id: str,
    limit: int = Query(50, description="Number of comments to return")
) -> List[Comment]:
    """Get comments for a specific post"""
    try:
        comments = [
            comment for comment in community_service.comments.values()
            if comment.post_id == post_id
        ]
        
        # Sort by likes and creation date
        comments.sort(key=lambda c: (c.likes, c.created_at), reverse=True)
        
        return comments[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get comments: {str(e)}")


@router.post("/interactions")
async def record_interaction(
    user_id: str = Query(..., description="User ID"),
    request: UpdateInteractionRequest = None
):
    """Record user interaction with content"""
    try:
        result = await community_service.record_interaction(user_id, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record interaction: {str(e)}")


@router.get("/trending")
async def get_trending_content(
    limit: int = Query(10, description="Number of trending items to return")
) -> List[TrendingContent]:
    """Get trending content"""
    try:
        trending = await community_service.get_trending_content(limit)
        return trending
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trending content: {str(e)}")


@router.get("/search")
async def search_content(
    query: str = Query(..., description="Search query"),
    content_type: Optional[ContentType] = Query(None, description="Filter by content type"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, description="Number of results to return")
):
    """Search community content"""
    try:
        results = await community_service.search_content(query, content_type, category, limit)
        return {
            "query": query,
            "results": results,
            "total_results": sum(len(results[key]) for key in results),
            "search_timestamp": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search content: {str(e)}")


@router.get("/stats")
async def get_community_stats() -> CommunityStats:
    """Get community statistics and health metrics"""
    try:
        stats = await community_service.get_community_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get community stats: {str(e)}")


@router.get("/categories")
async def get_categories():
    """Get available community categories"""
    from models.community import DEFAULT_CATEGORIES, DEFAULT_TRENDING_TOPICS
    
    return {
        "categories": DEFAULT_CATEGORIES,
        "trending_topics": DEFAULT_TRENDING_TOPICS,
        "total_categories": len(DEFAULT_CATEGORIES)
    }


@router.get("/user/{user_id}/activity")
async def get_user_activity(
    user_id: str,
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    limit: int = Query(20, description="Number of activities to return")
):
    """Get user's community activity"""
    try:
        # Get user's posts
        user_posts = [post for post in community_service.posts.values() if post.user_id == user_id]
        user_reviews = [review for review in community_service.reviews.values() if review.user_id == user_id]
        user_comments = [comment for comment in community_service.comments.values() if comment.user_id == user_id]
        user_interactions = [interaction for interaction in community_service.interactions if interaction.user_id == user_id]
        
        # Sort by recency
        user_posts.sort(key=lambda x: x.created_at, reverse=True)
        user_reviews.sort(key=lambda x: x.created_at, reverse=True)
        user_comments.sort(key=lambda x: x.created_at, reverse=True)
        user_interactions.sort(key=lambda x: x.timestamp, reverse=True)
        
        activity_summary = {
            "user_id": user_id,
            "total_posts": len(user_posts),
            "total_reviews": len(user_reviews),
            "total_comments": len(user_comments),
            "total_interactions": len(user_interactions),
            "recent_posts": user_posts[:limit],
            "recent_reviews": user_reviews[:limit],
            "recent_comments": user_comments[:limit],
            "activity_score": len(user_posts) * 3 + len(user_reviews) * 2 + len(user_comments),
            "engagement_metrics": {
                "avg_post_likes": sum([post.likes for post in user_posts]) / max(len(user_posts), 1),
                "avg_review_helpfulness": sum([review.helpful_count for review in user_reviews]) / max(len(user_reviews), 1),
                "community_reputation": "active" if len(user_posts) + len(user_reviews) > 5 else "newcomer"
            }
        }
        
        return activity_summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user activity: {str(e)}")


@router.get("/analytics/engagement")
async def get_engagement_analytics():
    """Get detailed community engagement analytics"""
    try:
        stats = await community_service.get_community_stats()
        
        # Additional engagement analytics
        total_content = len(community_service.posts) + len(community_service.reviews)
        total_interactions = len(community_service.interactions)
        
        # Calculate engagement rates
        avg_engagement_rate = total_interactions / max(total_content, 1)
        
        # Content type breakdown
        content_breakdown = {
            "posts": len(community_service.posts),
            "reviews": len(community_service.reviews),
            "comments": len(community_service.comments)
        }
        
        # Sentiment analysis
        recent_moderation = community_service.moderation_logs[-50:]  # Last 50 moderation logs
        avg_sentiment = sum([log.sentiment_score for log in recent_moderation]) / max(len(recent_moderation), 1)
        
        # Top contributors
        user_activity = {}
        for post in community_service.posts.values():
            user_activity[post.user_id] = user_activity.get(post.user_id, 0) + 3
        for review in community_service.reviews.values():
            user_activity[review.user_id] = user_activity.get(review.user_id, 0) + 2
        for comment in community_service.comments.values():
            user_activity[comment.user_id] = user_activity.get(comment.user_id, 0) + 1
        
        top_contributors = sorted(user_activity.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "basic_stats": stats.dict(),
            "engagement_metrics": {
                "avg_engagement_rate": avg_engagement_rate,
                "content_breakdown": content_breakdown,
                "average_sentiment": avg_sentiment,
                "moderation_efficiency": len([log for log in recent_moderation if log.action_recommended.value == "approved"]) / max(len(recent_moderation), 1) * 100
            },
            "top_contributors": [
                {"user_id": user_id, "activity_score": score}
                for user_id, score in top_contributors
            ],
            "ai_insights": {
                "total_moderated": len(community_service.moderation_logs),
                "auto_approval_rate": len([log for log in community_service.moderation_logs if log.action_recommended.value == "approved"]) / max(len(community_service.moderation_logs), 1) * 100,
                "sentiment_trend": "positive" if avg_sentiment > 0.5 else "neutral" if avg_sentiment > 0 else "negative"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get engagement analytics: {str(e)}")


@router.post("/moderate/{content_id}")
async def moderate_content(
    content_id: str,
    action: str = Query(..., description="Moderation action: approve, reject, flag"),
    moderator_notes: Optional[str] = Query(None, description="Moderator notes")
):
    """Manually moderate content (admin endpoint)"""
    try:
        # Check if content exists
        content_found = False
        if content_id in community_service.posts:
            content = community_service.posts[content_id]
            content_found = True
        elif content_id in community_service.reviews:
            content = community_service.reviews[content_id]
            content_found = True
        
        if not content_found:
            raise HTTPException(status_code=404, detail="Content not found")
        
        # Update content status based on action
        if action == "approve":
            content.status = "published"
        elif action == "reject":
            content.status = "removed"
        elif action == "flag":
            content.status = "flagged"
        else:
            raise HTTPException(status_code=400, detail="Invalid moderation action")
        
        content.moderation_notes = moderator_notes
        content.updated_at = datetime.now()
        
        return {
            "success": True,
            "content_id": content_id,
            "action": action,
            "new_status": content.status,
            "moderated_at": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to moderate content: {str(e)}")


@router.get("/recommendations/{user_id}")
async def get_content_recommendations(user_id: str, limit: int = Query(5, description="Number of recommendations")):
    """Get AI-powered content recommendations for user"""
    try:
        recommendations = await community_service._generate_content_recommendations(user_id)
        
        # Get personalized content based on user's interaction history
        user_interactions = [i for i in community_service.interactions if i.user_id == user_id]
        
        # Analyze user preferences
        liked_content_ids = [i.content_id for i in user_interactions if i.interaction_type == "like"]
        liked_posts = [community_service.posts[cid] for cid in liked_content_ids if cid in community_service.posts]
        
        # Find similar content
        recommended_posts = []
        if liked_posts:
            # Simple recommendation based on categories and tags
            user_categories = [post.category for post in liked_posts]
            user_tags = []
            for post in liked_posts:
                user_tags.extend(post.tags)
            
            # Find posts with similar categories/tags
            for post in community_service.posts.values():
                if (post.category in user_categories or 
                    any(tag in user_tags for tag in post.tags)) and \
                   post.id not in liked_content_ids:
                    recommended_posts.append(post)
            
            # Sort by engagement
            recommended_posts.sort(key=lambda p: p.likes + p.comments, reverse=True)
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "recommended_posts": recommended_posts[:limit],
            "personalization_score": 0.85 if liked_posts else 0.3,
            "generated_at": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")