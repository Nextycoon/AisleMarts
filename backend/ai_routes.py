from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
from datetime import datetime

from security import decode_access_token
from db import db
from ai_service import get_user_agent, locale_service, search_service
from schemas import ProductOut

router = APIRouter(prefix="/api/ai", tags=["AI Services"])

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    agent_id: str
    timestamp: str

class OnboardingRequest(BaseModel):
    user_info: Dict[str, Any]

class SearchEnhanceRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class IntentAnalysisRequest(BaseModel):
    message: str

class ProductRecommendationRequest(BaseModel):
    query: str
    max_results: Optional[int] = 10

class LocaleDetectionResponse(BaseModel):
    country: str
    language: str
    currency: str
    recommendations: Dict[str, Any]

async def get_current_user_from_token(authorization: str):
    """Extract user from auth token"""
    if not authorization:
        raise HTTPException(401, "Missing Authorization header")
    
    try:
        token = authorization.split()[1]
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        
        user = await db().users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {str(e)}")

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    authorization: str = None
):
    """Chat with personal AI agent"""
    try:
        # For demo purposes, allow anonymous chat with limited functionality
        if authorization:
            user = await get_current_user_from_token(authorization)
            user_id = str(user["_id"])
            user_role = user.get("roles", ["buyer"])[0]
            
            # Get user preferences from recent activity
            user_activity = await db().user_activity.find(
                {"user_id": user_id}
            ).sort("timestamp", -1).limit(50).to_list(length=50)
            
            user_preferences = locale_service.detect_preferences_from_behavior(user_activity)
        else:
            # Anonymous user
            user_id = "anonymous"
            user_role = "buyer"
            user_preferences = {}
        
        # Get AI agent
        agent = get_user_agent(user_id, user_role, user_preferences)
        
        # Chat with agent
        response = await agent.chat_with_agent(request.message, request.context)
        
        return ChatResponse(
            response=response,
            agent_id=agent.session_id,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(500, f"AI chat error: {str(e)}")

@router.post("/onboarding")
async def get_onboarding_guidance(
    request: OnboardingRequest,
    authorization: str = None
):
    """Get AI-powered onboarding guidance"""
    try:
        if authorization:
            user = await get_current_user_from_token(authorization)
            user_id = str(user["_id"])
            user_role = user.get("roles", ["buyer"])[0]
        else:
            user_id = "anonymous"
            user_role = "buyer"
        
        agent = get_user_agent(user_id, user_role)
        guidance = await agent.get_onboarding_guidance(request.user_info)
        
        return {"guidance": guidance, "user_role": user_role}
        
    except Exception as e:
        raise HTTPException(500, f"Onboarding error: {str(e)}")

@router.get("/locale-detection", response_model=LocaleDetectionResponse)
async def detect_user_locale(request: Request):
    """AI-powered locale detection and personalization"""
    try:
        # For demo purposes, use default locale
        client_ip = "127.0.0.1"  # Simplified for testing
        
        # Detect locale
        locale_info = locale_service.detect_locale_from_ip(client_ip)
        
        # Get AI recommendations for this locale
        agent = get_user_agent("locale_detector", "buyer")
        
        recommendations_prompt = f"""For a user from {locale_info.get('country', 'Unknown')} with language {locale_info.get('language', 'en')}, provide recommendations for:

1. Popular product categories in their region
2. Preferred shopping preferences
3. Cultural considerations for the marketplace
4. Suggested first steps

Keep it concise and actionable."""

        recommendations_text = await agent.chat_with_agent(recommendations_prompt)
        
        return LocaleDetectionResponse(
            country=locale_info.get("country", "US"),
            language=locale_info.get("language", "en"),
            currency=locale_info.get("currency", "USD"),
            recommendations={
                "message": recommendations_text,
                "categories": ["Electronics", "Fashion", "Home & Garden"],
                "next_steps": ["Browse featured products", "Set up profile", "Explore categories"]
            }
        )
        
    except Exception as e:
        raise HTTPException(500, f"Locale detection error: {str(e)}")

@router.post("/search/enhance")
async def enhance_search(request: SearchEnhanceRequest):
    """Enhance search query with AI"""
    try:
        enhanced_query = await search_service.enhance_search_query(
            request.query, 
            request.context
        )
        return enhanced_query
        
    except Exception as e:
        raise HTTPException(500, f"Search enhancement error: {str(e)}")

@router.post("/recommendations")
async def get_product_recommendations(
    request: ProductRecommendationRequest,
    authorization: str = None
):
    """Get AI-powered product recommendations"""
    try:
        # Get products from database
        products_cursor = db().products.find(
            {"active": True}
        ).limit(request.max_results * 2)  # Get more for better AI selection
        
        products = await products_cursor.to_list(length=request.max_results * 2)
        
        if not products:
            return {"recommendations": [], "message": "No products available"}
        
        # Get user context if authenticated
        user_preferences = {}
        if authorization:
            user = await get_current_user_from_token(authorization)
            user_id = str(user["_id"])
            user_role = user.get("roles", ["buyer"])[0]
            
            # Get user agent
            agent = get_user_agent(user_id, user_role)
        else:
            user_id = "anonymous"
            user_role = "buyer"
            agent = get_user_agent(user_id, user_role)
        
        # Get AI recommendations
        recommendation_text = await agent.get_product_recommendation(
            request.query, 
            products[:request.max_results]
        )
        
        # Use AI to rank products
        ranked_products = await search_service.rank_products_by_relevance(
            request.query,
            products,
            user_preferences
        )
        
        # Convert to response format
        recommended_products = []
        for product in ranked_products[:request.max_results]:
            recommended_products.append({
                "id": str(product["_id"]),
                "title": product.get("title", ""),
                "price": product.get("price", 0),
                "currency": product.get("currency", "USD"),
                "brand": product.get("brand", ""),
                "images": product.get("images", [])
            })
        
        return {
            "recommendations": recommended_products,
            "ai_explanation": recommendation_text,
            "query": request.query
        }
        
    except Exception as e:
        raise HTTPException(500, f"Recommendation error: {str(e)}")

@router.post("/intent-analysis")
async def analyze_user_intent(
    request: IntentAnalysisRequest,
    authorization: str = None
):
    """Analyze user intent from their message"""
    try:
        if authorization:
            user = await get_current_user_from_token(authorization)
            user_id = str(user["_id"])
            user_role = user.get("roles", ["buyer"])[0]
        else:
            user_id = "anonymous"
            user_role = "buyer"
        
        agent = get_user_agent(user_id, user_role)
        intent_analysis = await agent.analyze_user_intent(request.message)
        
        return intent_analysis
        
    except Exception as e:
        raise HTTPException(500, f"Intent analysis error: {str(e)}")

# Voice search endpoint (for future mobile integration)
@router.post("/voice-search")
async def voice_search(
    audio_text: str,
    authorization: str = None
):
    """Process voice search queries"""
    try:
        # First, enhance the transcribed text
        enhanced_query = await search_service.enhance_search_query(audio_text)
        
        # Get product recommendations
        products_cursor = db().products.find({"active": True}).limit(20)
        products = await products_cursor.to_list(length=20)
        
        # Rank by relevance
        ranked_products = await search_service.rank_products_by_relevance(
            audio_text,
            products
        )
        
        return {
            "original_query": audio_text,
            "enhanced_query": enhanced_query,
            "products": ranked_products[:10],
            "response_type": "voice_search"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Voice search error: {str(e)}")

# Track user activity for personalization
@router.post("/track-activity")
async def track_user_activity(
    activity_data: Dict[str, Any],
    authorization: str = None
):
    """Track user activity for AI personalization"""
    try:
        if not authorization:
            return {"status": "skipped", "reason": "anonymous_user"}
        
        user = await get_current_user_from_token(authorization)
        user_id = str(user["_id"])
        
        # Store activity in database
        activity_record = {
            "user_id": user_id,
            "timestamp": datetime.utcnow(),
            **activity_data
        }
        
        await db().user_activity.insert_one(activity_record)
        
        return {"status": "tracked", "timestamp": activity_record["timestamp"]}
        
    except Exception as e:
        raise HTTPException(500, f"Activity tracking error: {str(e)}")