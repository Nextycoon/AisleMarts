from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ContentType(str, Enum):
    POST = "post"
    REVIEW = "review"
    PHOTO = "photo"
    VIDEO = "video"
    POLL = "poll"
    QUESTION = "question"
    TUTORIAL = "tutorial"


class ContentStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    MODERATED = "moderated"
    FLAGGED = "flagged"
    REMOVED = "removed"


class ReviewRating(int, Enum):
    ONE_STAR = 1
    TWO_STAR = 2
    THREE_STAR = 3
    FOUR_STAR = 4
    FIVE_STAR = 5


class ModerationAction(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    FLAGGED = "flagged"
    EDITED = "edited"


class CommunityPost(BaseModel):
    id: Optional[str] = None
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    content_type: ContentType
    title: str
    content: str
    images: List[str] = []
    tags: List[str] = []
    category: str = "general"
    status: ContentStatus = ContentStatus.PUBLISHED
    likes: int = 0
    comments: int = 0
    shares: int = 0
    views: int = 0
    ai_moderation_score: float = 0.0
    ai_sentiment_score: float = 0.0
    ai_topics: List[str] = []
    is_featured: bool = False
    is_trending: bool = False
    trending_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ProductReview(BaseModel):
    id: Optional[str] = None
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    product_id: str
    product_name: str
    rating: ReviewRating
    title: str
    review_text: str
    images: List[str] = []
    verified_purchase: bool = False
    helpful_count: int = 0
    not_helpful_count: int = 0
    ai_sentiment_score: float = 0.0
    ai_authenticity_score: float = 0.0
    ai_summary: Optional[str] = None
    status: ContentStatus = ContentStatus.PUBLISHED
    moderation_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Comment(BaseModel):
    id: Optional[str] = None
    post_id: str
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    content: str
    parent_comment_id: Optional[str] = None  # For nested comments
    likes: int = 0
    replies: int = 0
    ai_sentiment_score: float = 0.0
    is_flagged: bool = False
    created_at: datetime = Field(default_factory=datetime.now)


class UserInteraction(BaseModel):
    user_id: str
    content_id: str
    interaction_type: str  # like, share, comment, view, save
    timestamp: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = {}


class CommunityStats(BaseModel):
    total_posts: int
    total_reviews: int
    total_users: int
    active_users_today: int
    total_interactions: int
    trending_posts: List[str]
    popular_tags: List[Dict[str, Any]]
    community_health_score: float
    ai_moderation_stats: Dict[str, Any]


class TrendingContent(BaseModel):
    id: str
    title: str
    content_type: ContentType
    author: str
    trending_score: float
    engagement_rate: float
    created_at: datetime


class AIModeration(BaseModel):
    content_id: str
    content_type: ContentType
    moderation_score: float
    sentiment_score: float
    toxicity_score: float
    spam_score: float
    authenticity_score: float
    topics_detected: List[str]
    flags: List[str] = []
    action_recommended: ModerationAction
    confidence: float
    processed_at: datetime = Field(default_factory=datetime.now)


class CreatePostRequest(BaseModel):
    title: str
    content: str
    content_type: ContentType = ContentType.POST
    images: List[str] = []
    tags: List[str] = []
    category: str = "general"


class CreateReviewRequest(BaseModel):
    product_id: str
    product_name: str
    rating: ReviewRating
    title: str
    review_text: str
    images: List[str] = []


class UpdateInteractionRequest(BaseModel):
    content_id: str
    interaction_type: str
    metadata: Dict[str, Any] = {}


class CommunityFeed(BaseModel):
    posts: List[CommunityPost]
    reviews: List[ProductReview]
    trending: List[TrendingContent]
    recommendations: List[str]
    pagination: Dict[str, Any]


class ContentModerationRequest(BaseModel):
    content_id: str
    action: ModerationAction
    moderator_notes: Optional[str] = None


# Community categories
DEFAULT_CATEGORIES = [
    "general",
    "product_reviews", 
    "shopping_tips",
    "deals_and_offers",
    "fashion",
    "electronics",
    "home_garden",
    "beauty_health",
    "sports_outdoor",
    "automotive",
    "questions_help",
    "tutorials",
    "community_feedback"
]

# Default trending topics
DEFAULT_TRENDING_TOPICS = [
    {"tag": "deals", "count": 142, "growth": "+23%"},
    {"tag": "reviews", "count": 89, "growth": "+15%"},
    {"tag": "fashion", "count": 67, "growth": "+31%"},
    {"tag": "electronics", "count": 54, "growth": "+8%"},
    {"tag": "tips", "count": 43, "growth": "+45%"},
    {"tag": "unboxing", "count": 38, "growth": "+12%"},
    {"tag": "comparison", "count": 29, "growth": "+67%"},
    {"tag": "newbie", "count": 25, "growth": "+34%"}
]