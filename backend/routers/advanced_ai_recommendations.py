from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
import logging
import json

import sys
import os
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from routers.deps import get_db
from security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai/advanced", tags=["Advanced AI Recommendations"])

# Request/Response Models
class PersonalizationProfile(BaseModel):
    user_id: str
    interests: List[str] = Field(default_factory=list)
    browsing_behavior: Dict[str, float] = Field(default_factory=dict)
    purchase_history: List[str] = Field(default_factory=list)
    interaction_patterns: Dict[str, int] = Field(default_factory=dict)
    preferred_price_range: Dict[str, float] = Field(default={"min": 0, "max": 1000})
    style_preferences: List[str] = Field(default_factory=list)
    brand_affinities: Dict[str, float] = Field(default_factory=dict)

class AdvancedRecommendationRequest(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    max_price: Optional[float] = None
    min_price: Optional[float] = None
    include_trending: bool = True
    include_personalized: bool = True
    recommendation_type: str = Field(default="hybrid", description="Type: hybrid, collaborative, content-based, or trending")
    context: Optional[str] = None  # e.g., "gift_shopping", "urgent_need", "casual_browsing"

class ProductRecommendation(BaseModel):
    product_id: str
    name: str
    price: float
    image_url: Optional[str] = None
    category: str
    brand: Optional[str] = None
    confidence_score: float = Field(ge=0.0, le=1.0)
    recommendation_reason: str
    personalization_factors: List[str] = Field(default_factory=list)
    ai_insights: str
    similarity_score: Optional[float] = None
    trending_score: Optional[float] = None
    urgency_indicator: Optional[str] = None

class AdvancedRecommendationResponse(BaseModel):
    recommendations: List[ProductRecommendation]
    personalization_applied: bool
    recommendation_strategy: str
    ai_explanation: str
    user_profile_strength: float
    total_products_analyzed: int
    processing_time_ms: int

class TrendingInsightsResponse(BaseModel):
    trending_categories: List[Dict[str, Any]]
    seasonal_trends: List[Dict[str, Any]]
    price_movement_insights: List[Dict[str, Any]]
    user_behavior_trends: List[Dict[str, Any]]
    market_predictions: List[Dict[str, Any]]
    ai_market_summary: str

class SmartSearchRequest(BaseModel):
    natural_query: str
    user_context: Optional[Dict[str, Any]] = None
    search_intent: Optional[str] = None  # "purchase", "research", "compare", "gift"
    budget_range: Optional[Dict[str, float]] = None

class SmartSearchResponse(BaseModel):
    interpreted_query: str
    search_intent: str
    extracted_keywords: List[str]
    recommended_filters: Dict[str, Any]
    suggested_products: List[ProductRecommendation]
    alternative_queries: List[str]
    ai_shopping_advice: str

@router.get("/health")
async def health_check():
    """Advanced AI recommendations health check"""
    return {
        "service": "advanced_ai_recommendations",
        "status": "operational",
        "features": [
            "personalized_recommendations",
            "collaborative_filtering", 
            "content_based_filtering",
            "trending_analysis",
            "smart_search",
            "market_insights",
            "price_optimization",
            "seasonal_trends"
        ],
        "ai_capabilities": [
            "natural_language_processing",
            "behavioral_analysis",
            "predictive_modeling",
            "real_time_personalization",
            "context_aware_recommendations",
            "multi_factor_scoring"
        ]
    }

@router.post("/recommendations", response_model=AdvancedRecommendationResponse)
async def get_advanced_recommendations(
    request: AdvancedRecommendationRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get advanced AI-powered product recommendations"""
    start_time = datetime.now()
    
    try:
        # Simulate advanced recommendation logic
        user_id = current_user["_id"]
        
        # Generate mock personalization profile
        user_profile = PersonalizationProfile(
            user_id=user_id,
            interests=["luxury", "technology", "fashion", "home_decor"],
            browsing_behavior={
                "electronics": 0.4,
                "fashion": 0.3,
                "home": 0.2,
                "sports": 0.1
            },
            purchase_history=["product_123", "product_456", "product_789"],
            interaction_patterns={
                "views": 145,
                "saves": 23,
                "shares": 8,
                "purchases": 12
            },
            preferred_price_range={"min": 50, "max": 500},
            style_preferences=["modern", "minimalist", "premium"],
            brand_affinities={"Apple": 0.9, "Nike": 0.7, "IKEA": 0.6}
        )
        
        # Generate recommendations based on request type
        recommendations = []
        strategy = "hybrid_personalized"
        
        if request.recommendation_type == "collaborative":
            recommendations = _generate_collaborative_recommendations(user_profile, request)
            strategy = "collaborative_filtering"
        elif request.recommendation_type == "content-based":
            recommendations = _generate_content_based_recommendations(user_profile, request)
            strategy = "content_based_filtering"
        elif request.recommendation_type == "trending":
            recommendations = _generate_trending_recommendations(request)
            strategy = "trending_analysis"
        else:
            # Hybrid approach (default)
            collab_recs = _generate_collaborative_recommendations(user_profile, request)
            content_recs = _generate_content_based_recommendations(user_profile, request)
            trending_recs = _generate_trending_recommendations(request)
            
            # Combine and rank recommendations
            recommendations = _merge_recommendations(collab_recs, content_recs, trending_recs)
        
        # Calculate processing time
        processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # Generate AI explanation
        ai_explanation = _generate_ai_explanation(user_profile, request, recommendations, strategy)
        
        return AdvancedRecommendationResponse(
            recommendations=recommendations[:10],  # Top 10
            personalization_applied=request.include_personalized,
            recommendation_strategy=strategy,
            ai_explanation=ai_explanation,
            user_profile_strength=0.8,  # Mock strength
            total_products_analyzed=1250,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Advanced recommendations failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

@router.get("/trending-insights", response_model=TrendingInsightsResponse)
async def get_trending_insights(
    timeframe: str = Query(default="7d", description="Timeframe: 1d, 7d, 30d, 90d"),
    category: Optional[str] = Query(None, description="Filter by category"),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get comprehensive trending insights and market analysis"""
    try:
        # Generate mock trending insights
        trending_categories = [
            {
                "category": "Smart Home",
                "growth_rate": 45.2,
                "trending_score": 0.92,
                "key_products": ["Smart Speakers", "Security Cameras", "Smart Lights"],
                "price_trend": "increasing",
                "demand_forecast": "high"
            },
            {
                "category": "Sustainable Fashion",
                "growth_rate": 38.7,
                "trending_score": 0.88,
                "key_products": ["Eco Sneakers", "Recycled Bags", "Organic Cotton"],
                "price_trend": "stable",
                "demand_forecast": "very_high"
            },
            {
                "category": "Wellness Tech",
                "growth_rate": 41.3,
                "trending_score": 0.85,
                "key_products": ["Fitness Trackers", "Meditation Apps", "Sleep Tech"],
                "price_trend": "decreasing",
                "demand_forecast": "high"
            }
        ]
        
        seasonal_trends = [
            {
                "season": "Holiday Season",
                "peak_categories": ["Electronics", "Jewelry", "Home Decor"],
                "price_impact": "+15%",
                "inventory_demand": "critical",
                "recommendation": "Stock up on gift-worthy items"
            }
        ]
        
        price_movement_insights = [
            {
                "category": "Electronics",
                "average_price_change": "-8.5%",
                "volatility": "medium",
                "prediction": "Further 5% decrease expected",
                "best_buy_timing": "next_2_weeks"
            }
        ]
        
        user_behavior_trends = [
            {
                "behavior": "Mobile Shopping",
                "growth": "+67%",
                "impact": "Shorter session times, higher conversion",
                "recommendation": "Optimize mobile experience"
            }
        ]
        
        market_predictions = [
            {
                "prediction": "AR Shopping Integration",
                "confidence": 0.78,
                "timeframe": "6_months",
                "impact": "Revolutionary shopping experience",
                "preparation_advice": "Invest in AR-ready product imagery"
            }
        ]
        
        ai_summary = f"""
        **Market Intelligence Summary for {timeframe.upper()}:**
        
        The luxury commerce landscape is experiencing significant shifts toward smart home integration and sustainable fashion. 
        Smart Home products show exceptional growth at 45.2%, driven by increased remote work and home comfort investments.
        
        **Key Opportunities:**
        • Sustainable Fashion emerging as premium category with 38.7% growth
        • Wellness Tech maintaining strong momentum with price normalization
        • Holiday season approaching - electronics and jewelry showing high demand signals
        
        **Strategic Recommendations:**
        • Focus inventory on Smart Home and Sustainable Fashion categories
        • Prepare for holiday surge in electronics and luxury gifts
        • Consider AR integration for enhanced shopping experience
        
        **Price Trends:**
        Electronics experiencing healthy correction (-8.5%), creating buyer opportunities.
        Fashion and Home categories maintaining premium pricing stability.
        """
        
        return TrendingInsightsResponse(
            trending_categories=trending_categories,
            seasonal_trends=seasonal_trends,
            price_movement_insights=price_movement_insights,
            user_behavior_trends=user_behavior_trends,
            market_predictions=market_predictions,
            ai_market_summary=ai_summary
        )
        
    except Exception as e:
        logger.error(f"Trending insights failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get trending insights")

@router.post("/smart-search", response_model=SmartSearchResponse)
async def smart_search(
    request: SmartSearchRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Intelligent natural language search with AI interpretation"""
    try:
        # Simulate NLP processing
        query = request.natural_query.lower()
        
        # Extract intent
        intent = "research"
        if any(word in query for word in ["buy", "purchase", "order", "get"]):
            intent = "purchase"
        elif any(word in query for word in ["compare", "vs", "difference"]):
            intent = "compare"
        elif any(word in query for word in ["gift", "present", "birthday"]):
            intent = "gift"
        
        # Extract keywords
        keywords = []
        common_words = ["the", "a", "an", "for", "to", "and", "or", "but", "in", "on", "at", "by"]
        query_words = [word.strip(".,!?") for word in query.split() if word not in common_words]
        keywords = query_words[:5]  # Top 5 keywords
        
        # Generate interpreted query
        interpreted_query = f"Looking for {' '.join(keywords)} with {intent} intent"
        
        # Generate recommended filters
        filters = {
            "category": "auto_detected",
            "price_range": request.budget_range or {"min": 0, "max": 1000},
            "brand": "any",
            "rating": "4+"
        }
        
        # Generate product suggestions (mock)
        suggestions = [
            ProductRecommendation(
                product_id="ai_search_1",
                name=f"Smart {keywords[0] if keywords else 'Product'}",
                price=299.99,
                category="Electronics",
                confidence_score=0.92,
                recommendation_reason=f"Matches your search for '{request.natural_query}'",
                personalization_factors=["search_history", "category_preference"],
                ai_insights="This product aligns with your search intent and has high customer satisfaction.",
                similarity_score=0.88
            ),
            ProductRecommendation(
                product_id="ai_search_2", 
                name=f"Premium {keywords[1] if len(keywords) > 1 else 'Solution'}",
                price=199.99,
                category="Lifestyle",
                confidence_score=0.87,
                recommendation_reason=f"Alternative match for '{request.natural_query}'",
                personalization_factors=["price_preference", "brand_affinity"],
                ai_insights="Excellent value proposition with premium features.",
                similarity_score=0.82
            )
        ]
        
        # Generate alternative queries
        alternatives = [
            f"Best {keywords[0] if keywords else 'products'} under $500",
            f"Popular {keywords[0] if keywords else 'items'} this month",
            f"Professional {keywords[0] if keywords else 'solutions'} for work"
        ]
        
        # Generate AI shopping advice
        advice = f"""
        **AI Shopping Advice for "{request.natural_query}":**
        
        Based on your search, I've identified your intent as **{intent}**. Here's my analysis:
        
        • **Best Match Strategy**: Focus on products with high relevance scores (>0.85)
        • **Price Optimization**: Consider the {suggestions[0].price}-{suggestions[1].price} range for best value
        • **Timing**: {intent.capitalize()} decisions are typically made within 3-7 days
        • **Quality Indicators**: Look for 4+ star ratings and verified reviews
        
        **Pro Tip**: {
            "I recommend comparing at least 2-3 options before making your final decision." if intent == "purchase"
            else "Take your time to research - this appears to be an exploratory search."
        }
        """
        
        return SmartSearchResponse(
            interpreted_query=interpreted_query,
            search_intent=intent,
            extracted_keywords=keywords,
            recommended_filters=filters,
            suggested_products=suggestions,
            alternative_queries=alternatives,
            ai_shopping_advice=advice
        )
        
    except Exception as e:
        logger.error(f"Smart search failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process smart search")

# Helper functions
def _generate_collaborative_recommendations(profile: PersonalizationProfile, request: AdvancedRecommendationRequest) -> List[ProductRecommendation]:
    """Generate collaborative filtering recommendations"""
    return [
        ProductRecommendation(
            product_id="collab_1",
            name="Collaborative Recommended Item",
            price=149.99,
            category="Electronics",
            confidence_score=0.89,
            recommendation_reason="Users with similar preferences also liked this",
            personalization_factors=["similar_users", "purchase_patterns"],
            ai_insights="Strong collaborative signal from users with 85% similarity match.",
            similarity_score=0.85
        )
    ]

def _generate_content_based_recommendations(profile: PersonalizationProfile, request: AdvancedRecommendationRequest) -> List[ProductRecommendation]:
    """Generate content-based filtering recommendations"""
    return [
        ProductRecommendation(
            product_id="content_1",
            name="Content-Based Match",
            price=199.99,
            category="Fashion",
            confidence_score=0.91,
            recommendation_reason="Matches your style preferences and interests",
            personalization_factors=["style_preferences", "category_affinity"],
            ai_insights="Perfect alignment with your documented style preferences.",
            similarity_score=0.91
        )
    ]

def _generate_trending_recommendations(request: AdvancedRecommendationRequest) -> List[ProductRecommendation]:
    """Generate trending-based recommendations"""
    return [
        ProductRecommendation(
            product_id="trending_1",
            name="Trending Hot Item",
            price=99.99,
            category="Lifestyle",
            confidence_score=0.76,
            recommendation_reason="Currently trending with high demand",
            personalization_factors=["market_trends"],
            ai_insights="Viral product with 300% increase in interest over the past week.",
            trending_score=0.94,
            urgency_indicator="high_demand"
        )
    ]

def _merge_recommendations(collab: List[ProductRecommendation], content: List[ProductRecommendation], trending: List[ProductRecommendation]) -> List[ProductRecommendation]:
    """Merge and rank recommendations from different algorithms"""
    all_recs = collab + content + trending
    # Sort by confidence score
    return sorted(all_recs, key=lambda x: x.confidence_score, reverse=True)

def _generate_ai_explanation(profile: PersonalizationProfile, request: AdvancedRecommendationRequest, recs: List[ProductRecommendation], strategy: str) -> str:
    """Generate AI explanation for recommendations"""
    return f"""
    **AI Recommendation Analysis:**
    
    I've analyzed your profile and preferences using **{strategy}** to curate these personalized recommendations.
    
    **Key Factors Considered:**
    • Your browsing history shows strong interest in {', '.join(profile.interests[:3])}
    • Price preference range: ${profile.preferred_price_range['min']}-${profile.preferred_price_range['max']}
    • Style alignment: {', '.join(profile.style_preferences)}
    • Purchase patterns and interaction behavior
    
    **Recommendation Confidence:**
    Top recommendation has {recs[0].confidence_score:.1%} confidence based on multi-factor analysis.
    
    **Personalization Strength:** {80}% - Strong profile match enabling highly targeted suggestions.
    """