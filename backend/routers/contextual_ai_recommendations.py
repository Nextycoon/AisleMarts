from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from bson import ObjectId
from routers.deps import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
from enum import Enum
import asyncio

router = APIRouter(prefix="/api/contextual-ai", tags=["contextual-ai-recommendations"])

class UserContext(str, Enum):
    BROWSING = "browsing"
    SEARCHING = "searching"
    CART_VIEWING = "cart_viewing"
    CHECKOUT = "checkout"
    POST_PURCHASE = "post_purchase"
    RETURNING = "returning"

class MoodType(str, Enum):
    HAPPY = "happy"
    EXCITED = "excited"
    CALM = "calm"
    BOLD = "bold"
    ELEGANT = "elegant"
    CASUAL = "casual"
    PROFESSIONAL = "professional"
    ROMANTIC = "romantic"
    ADVENTUROUS = "adventurous"
    LUXURIOUS = "luxurious"

class ContextualRequest(BaseModel):
    user_id: Optional[str] = None
    session_id: str
    context: UserContext = UserContext.BROWSING
    current_mood: Optional[MoodType] = None
    current_product_id: Optional[str] = None
    search_query: Optional[str] = None
    price_range: Optional[Dict[str, int]] = None  # {"min": 50, "max": 200}
    categories: Optional[List[str]] = None
    language: str = "en"
    location: Optional[str] = None

class ContextualResponse(BaseModel):
    success: bool
    recommendations: List[Dict[str, Any]]
    context_analysis: Dict[str, Any]
    personalization_score: float
    ai_explanation: str
    mood_insights: Optional[Dict[str, Any]] = None
    session_memory: Dict[str, Any]
    next_suggestions: List[str] = []
    timestamp: datetime

class SessionMemory(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    interactions: List[Dict[str, Any]] = []
    preferences: Dict[str, Any] = {}
    mood_history: List[Dict[str, Any]] = []
    purchase_intent: float = 0.0
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# In-memory session storage (in production, use Redis or MongoDB)
SESSION_MEMORY: Dict[str, SessionMemory] = {}

def get_session_memory(session_id: str) -> SessionMemory:
    """Get or create session memory"""
    if session_id not in SESSION_MEMORY:
        SESSION_MEMORY[session_id] = SessionMemory(session_id=session_id)
    return SESSION_MEMORY[session_id]

def update_session_memory(session_id: str, interaction: Dict[str, Any]):
    """Update session memory with new interaction"""
    memory = get_session_memory(session_id)
    memory.interactions.append({
        **interaction,
        "timestamp": datetime.utcnow()
    })
    memory.last_activity = datetime.utcnow()
    
    # Keep only last 20 interactions
    if len(memory.interactions) > 20:
        memory.interactions = memory.interactions[-20:]

async def get_user_purchase_history(db: AsyncIOMotorDatabase, user_id: str) -> List[Dict[str, Any]]:
    """Get user's purchase history for personalization"""
    if not user_id:
        return []
    
    cursor = db.orders.find({
        "userId": user_id,
        "status": {"$in": ["paid", "completed"]}
    }).sort("createdAt", -1).limit(10)
    
    orders = []
    async for order in cursor:
        order["_id"] = str(order["_id"])
        orders.append(order)
    
    return orders

async def analyze_context_intent(
    request: ContextualRequest, 
    session: SessionMemory,
    purchase_history: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Analyze user context and intent"""
    
    # Analyze session patterns
    recent_interactions = session.interactions[-5:] if session.interactions else []
    browsing_categories = []
    search_queries = []
    
    for interaction in recent_interactions:
        if interaction.get("type") == "product_view":
            category = interaction.get("category")
            if category:
                browsing_categories.append(category)
        elif interaction.get("type") == "search":
            query = interaction.get("query")
            if query:
                search_queries.append(query)
    
    # Calculate purchase intent based on context
    intent_score = 0.0
    
    if request.context == UserContext.CART_VIEWING:
        intent_score += 0.4
    elif request.context == UserContext.CHECKOUT:
        intent_score += 0.8
    elif request.context == UserContext.SEARCHING:
        intent_score += 0.3
    elif request.context == UserContext.BROWSING:
        intent_score += 0.1
    
    # Boost intent if user has recent purchases
    if purchase_history:
        intent_score += 0.2
        
    # Boost intent based on session activity
    if len(recent_interactions) > 3:
        intent_score += 0.1
        
    intent_score = min(1.0, intent_score)
    
    return {
        "context": request.context.value,
        "purchase_intent": intent_score,
        "browsing_categories": list(set(browsing_categories)),
        "recent_searches": search_queries,
        "session_activity_level": len(recent_interactions),
        "returning_user": len(purchase_history) > 0,
        "mood_influence": request.current_mood.value if request.current_mood else "neutral"
    }

async def get_contextual_products(
    db: AsyncIOMotorDatabase,
    request: ContextualRequest,
    context_analysis: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Get products based on contextual analysis"""
    
    # Build search filter
    search_filter = {}
    
    # Category filtering based on browsing history or request
    if request.categories:
        search_filter["category"] = {"$in": request.categories}
    elif context_analysis.get("browsing_categories"):
        search_filter["category"] = {"$in": context_analysis["browsing_categories"]}
    
    # Price range filtering
    if request.price_range:
        price_filter = {}
        if request.price_range.get("min"):
            price_filter["$gte"] = request.price_range["min"]
        if request.price_range.get("max"):
            price_filter["$lte"] = request.price_range["max"]
        if price_filter:
            search_filter["price"] = price_filter
    
    # Mood-based filtering
    if request.current_mood:
        mood_tags = {
            MoodType.LUXURIOUS: ["luxury", "premium", "high-end", "exclusive"],
            MoodType.CASUAL: ["casual", "comfortable", "everyday", "relaxed"],
            MoodType.PROFESSIONAL: ["professional", "business", "formal", "office"],
            MoodType.BOLD: ["bold", "statement", "vibrant", "daring"],
            MoodType.ELEGANT: ["elegant", "sophisticated", "refined", "classic"],
            MoodType.ROMANTIC: ["romantic", "feminine", "soft", "delicate"],
            MoodType.ADVENTUROUS: ["outdoor", "sporty", "active", "adventure"]
        }
        
        mood_keywords = mood_tags.get(request.current_mood, [])
        if mood_keywords:
            search_filter["$or"] = [
                {"title": {"$regex": "|".join(mood_keywords), "$options": "i"}},
                {"description": {"$regex": "|".join(mood_keywords), "$options": "i"}},
                {"tags": {"$in": mood_keywords}}
            ]
    
    # Search query filtering
    if request.search_query:
        search_filter["$or"] = [
            {"title": {"$regex": request.search_query, "$options": "i"}},
            {"description": {"$regex": request.search_query, "$options": "i"}},
            {"brand": {"$regex": request.search_query, "$options": "i"}}
        ]
    
    # Get products
    cursor = db.products.find(search_filter).limit(10)
    products = []
    
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        products.append(doc)
    
    return products

def calculate_personalization_score(
    products: List[Dict[str, Any]],
    context_analysis: Dict[str, Any],
    session: SessionMemory,
    purchase_history: List[Dict[str, Any]]
) -> float:
    """Calculate how personalized the recommendations are"""
    score = 0.0
    
    # Base score for having products
    if products:
        score += 0.3
    
    # Boost for context awareness
    if context_analysis.get("purchase_intent", 0) > 0.5:
        score += 0.2
    
    # Boost for session continuity
    if context_analysis.get("session_activity_level", 0) > 2:
        score += 0.2
    
    # Boost for returning user personalization
    if purchase_history:
        score += 0.2
    
    # Boost for mood-based recommendations
    if context_analysis.get("mood_influence") != "neutral":
        score += 0.1
    
    return min(1.0, score)

def generate_ai_explanation(
    request: ContextualRequest,
    context_analysis: Dict[str, Any],
    products: List[Dict[str, Any]],
    personalization_score: float,
    language: str = "en"
) -> str:
    """Generate AI explanation for recommendations"""
    
    explanations = {
        "en": {
            "high_intent": "Based on your shopping activity, you seem ready to make a purchase. Here are my top recommendations:",
            "mood_based": "I noticed you're feeling {mood} today. These items perfectly match your current vibe:",
            "context_browsing": "Since you're browsing {categories}, I found these items that might interest you:",
            "returning_user": "Welcome back! Based on your previous purchases, you might like these:",
            "search_based": "I found these products matching your search for '{query}':",
            "default": "Here are some personalized recommendations just for you:"
        },
        "tr": {
            "high_intent": "Alışveriş aktivitenize göre satın almaya hazır görünüyorsunuz. İşte en iyi önerilerim:",
            "mood_based": "Bugün {mood} hissettiğinizi fark ettim. Bu ürünler mevcut ruh halinize mükemmel uyuyor:",
            "context_browsing": "{categories} kategorisinde gezindiğiniz için ilginizi çekebilecek bu ürünleri buldum:",
            "returning_user": "Tekrar hoş geldiniz! Önceki alışverişlerinize dayanarak bunları beğenebilirsiniz:",
            "search_based": "'{query}' aramanızla eşleşen bu ürünleri buldum:",
            "default": "Size özel kişiselleştirilmiş öneriler:"
        },
        "fr": {
            "high_intent": "Basé sur votre activité d'achat, vous semblez prêt à faire un achat. Voici mes meilleures recommandations:",
            "mood_based": "J'ai remarqué que vous vous sentez {mood} aujourd'hui. Ces articles correspondent parfaitement à votre humeur actuelle:",
            "context_browsing": "Puisque vous naviguez dans {categories}, j'ai trouvé ces articles qui pourraient vous intéresser:",
            "returning_user": "Bon retour! Basé sur vos achats précédents, vous pourriez aimer ceci:",
            "search_based": "J'ai trouvé ces produits correspondant à votre recherche de '{query}':",
            "default": "Voici quelques recommandations personnalisées rien que pour vous:"
        }
    }
    
    lang_explanations = explanations.get(language, explanations["en"])
    
    # Choose explanation based on context
    if context_analysis.get("purchase_intent", 0) > 0.6:
        return lang_explanations["high_intent"]
    elif request.current_mood:
        return lang_explanations["mood_based"].format(mood=request.current_mood.value)
    elif context_analysis.get("browsing_categories"):
        categories = ", ".join(context_analysis["browsing_categories"][:2])
        return lang_explanations["context_browsing"].format(categories=categories)
    elif context_analysis.get("returning_user"):
        return lang_explanations["returning_user"]
    elif request.search_query:
        return lang_explanations["search_based"].format(query=request.search_query)
    else:
        return lang_explanations["default"]

def generate_mood_insights(mood: MoodType, products: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate mood-based insights"""
    
    mood_insights = {
        MoodType.LUXURIOUS: {
            "description": "Feeling luxurious today? These premium items will elevate your style.",
            "styling_tips": ["Pair with classic accessories", "Choose quality over quantity", "Invest in timeless pieces"],
            "color_palette": ["Gold", "Black", "Cream", "Deep Navy"]
        },
        MoodType.BOLD: {
            "description": "Ready to make a statement? These bold pieces will help you stand out.",
            "styling_tips": ["Mix patterns confidently", "Add vibrant colors", "Choose statement accessories"],
            "color_palette": ["Red", "Electric Blue", "Emerald", "Fuchsia"]
        },
        MoodType.CASUAL: {
            "description": "Keeping it casual and comfortable today? These pieces are perfect for relaxed vibes.",
            "styling_tips": ["Layer for versatility", "Choose comfortable fabrics", "Mix casual with chic"],
            "color_palette": ["Soft Gray", "Beige", "White", "Denim Blue"]
        },
        MoodType.ELEGANT: {
            "description": "Embracing elegance? These sophisticated pieces will enhance your refined style.",
            "styling_tips": ["Keep accessories minimal", "Choose clean lines", "Focus on fit and quality"],
            "color_palette": ["Black", "White", "Nude", "Soft Pink"]
        }
    }
    
    insights = mood_insights.get(mood, {
        "description": "Great choice! These items match your current mood perfectly.",
        "styling_tips": ["Choose what makes you feel confident", "Trust your instincts"],
        "color_palette": ["Choose colors that speak to you"]
    })
    
    insights["matched_products"] = len(products)
    return insights

# API Endpoints
@router.get("/health")
async def contextual_ai_health():
    """Health check for contextual AI recommendations system"""
    return {
        "status": "healthy",
        "service": "contextual_ai_recommendations",
        "features": [
            "session_memory",
            "contextual_analysis",
            "mood_based_recommendations",
            "purchase_intent_detection",
            "personalized_suggestions",
            "multi_language_support"
        ],
        "supported_contexts": [context.value for context in UserContext],
        "supported_moods": [mood.value for mood in MoodType],
        "active_sessions": len(SESSION_MEMORY),
        "timestamp": datetime.utcnow()
    }

@router.post("/recommend", response_model=ContextualResponse)
async def get_contextual_recommendations(
    request: ContextualRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get contextual AI recommendations based on user context and mood"""
    
    try:
        # Get or create session memory
        session = get_session_memory(request.session_id)
        if request.user_id:
            session.user_id = request.user_id
        
        # Update session with current interaction
        update_session_memory(request.session_id, {
            "type": "recommendation_request",
            "context": request.context.value,
            "mood": request.current_mood.value if request.current_mood else None,
            "search_query": request.search_query,
            "product_id": request.current_product_id
        })
        
        # Get user purchase history
        purchase_history = await get_user_purchase_history(db, request.user_id or "")
        
        # Analyze context and intent
        context_analysis = await analyze_context_intent(request, session, purchase_history)
        
        # Get contextual products
        products = await get_contextual_products(db, request, context_analysis)
        
        # Calculate personalization score
        personalization_score = calculate_personalization_score(
            products, context_analysis, session, purchase_history
        )
        
        # Generate AI explanation
        ai_explanation = generate_ai_explanation(
            request, context_analysis, products, personalization_score, request.language
        )
        
        # Generate mood insights if mood is specified
        mood_insights = None
        if request.current_mood:
            mood_insights = generate_mood_insights(request.current_mood, products)
        
        # Generate next suggestions
        next_suggestions = []
        if context_analysis.get("purchase_intent", 0) > 0.5:
            next_suggestions = ["View cart", "Compare similar items", "Check reviews"]
        elif request.context == UserContext.BROWSING:
            next_suggestions = ["Refine search", "View categories", "Save for later"]
        else:
            next_suggestions = ["Continue shopping", "View trending items"]
        
        # Update session preferences
        if request.current_mood:
            session.mood_history.append({
                "mood": request.current_mood.value,
                "timestamp": datetime.utcnow()
            })
        
        session.purchase_intent = context_analysis.get("purchase_intent", 0.0)
        
        return ContextualResponse(
            success=True,
            recommendations=products,
            context_analysis=context_analysis,
            personalization_score=personalization_score,
            ai_explanation=ai_explanation,
            mood_insights=mood_insights,
            session_memory={
                "session_id": request.session_id,
                "interactions_count": len(session.interactions),
                "purchase_intent": session.purchase_intent,
                "last_activity": session.last_activity.isoformat()
            },
            next_suggestions=next_suggestions,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        return ContextualResponse(
            success=False,
            recommendations=[],
            context_analysis={},
            personalization_score=0.0,
            ai_explanation=f"Sorry, I encountered an error while generating recommendations: {str(e)}",
            session_memory={},
            timestamp=datetime.utcnow()
        )

@router.get("/session/{session_id}")
async def get_session_info(session_id: str):
    """Get session memory information"""
    if session_id not in SESSION_MEMORY:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = SESSION_MEMORY[session_id]
    
    return {
        "session_id": session_id,
        "user_id": session.user_id,
        "interactions_count": len(session.interactions),
        "recent_interactions": session.interactions[-5:],
        "preferences": session.preferences,
        "mood_history": session.mood_history[-3:],
        "purchase_intent": session.purchase_intent,
        "last_activity": session.last_activity,
        "created_at": session.created_at,
        "session_duration": (datetime.utcnow() - session.created_at).total_seconds()
    }

@router.post("/mood-to-cart")
async def mood_to_cart(
    mood: MoodType,
    session_id: str,
    user_id: Optional[str] = None,
    budget: Optional[int] = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Mood-to-Cart: Auto-populate cart based on mood"""
    
    try:
        # Create contextual request for mood shopping
        context_request = ContextualRequest(
            user_id=user_id,
            session_id=session_id,
            context=UserContext.BROWSING,
            current_mood=mood,
            price_range={"max": budget} if budget else None,
            language="en"
        )
        
        # Get recommendations
        recommendations = await get_contextual_recommendations(context_request, db)
        
        if not recommendations.success or not recommendations.recommendations:
            return {
                "success": False,
                "message": f"Sorry, I couldn't find items matching your {mood.value} mood right now.",
                "cart_items": [],
                "mood": mood.value
            }
        
        # Auto-select items for cart (top 3-5 items)
        selected_items = recommendations.recommendations[:5]  # Top 5 items
        
        # Simulate adding to cart (in real implementation, this would integrate with cart service)
        cart_items = []
        total_price = 0
        
        for item in selected_items:
            cart_item = {
                "product_id": item["_id"],
                "name": item["title"],
                "price": item["price"],
                "image": item.get("image", ""),
                "reason": f"Perfect for your {mood.value} mood",
                "quantity": 1
            }
            cart_items.append(cart_item)
            total_price += item["price"]
            
            # Stop if budget is exceeded
            if budget and total_price > budget:
                cart_items = cart_items[:-1]  # Remove last item
                total_price -= item["price"]
                break
        
        # Update session memory
        update_session_memory(session_id, {
            "type": "mood_to_cart",
            "mood": mood.value,
            "items_added": len(cart_items),
            "total_value": total_price
        })
        
        return {
            "success": True,
            "message": f"I've curated {len(cart_items)} perfect items for your {mood.value} mood!",
            "cart_items": cart_items,
            "total_items": len(cart_items),
            "total_price": total_price,
            "mood": mood.value,
            "mood_insights": recommendations.mood_insights,
            "ai_explanation": recommendations.ai_explanation,
            "session_id": session_id
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Error creating mood-based cart: {str(e)}",
            "cart_items": [],
            "mood": mood.value
        }

@router.get("/sessions/cleanup")
async def cleanup_old_sessions():
    """Clean up old session data (older than 24 hours)"""
    cutoff_time = datetime.utcnow() - timedelta(hours=24)
    
    sessions_before = len(SESSION_MEMORY)
    SESSION_MEMORY.clear()  # Simple cleanup - in production, use more sophisticated logic
    
    return {
        "message": "Session cleanup completed",
        "sessions_before": sessions_before,
        "sessions_after": len(SESSION_MEMORY)
    }

@router.get("/moods")
async def get_available_moods():
    """Get list of available moods with descriptions"""
    return {
        "available_moods": [
            {
                "value": mood.value,
                "name": mood.value.title(),
                "description": {
                    MoodType.HAPPY: "Bright, cheerful, and optimistic shopping",
                    MoodType.EXCITED: "High energy, bold choices, and statement pieces",
                    MoodType.CALM: "Peaceful, minimalist, and soothing selections",
                    MoodType.BOLD: "Daring, confident, and attention-grabbing items",
                    MoodType.ELEGANT: "Sophisticated, refined, and timeless pieces",
                    MoodType.CASUAL: "Relaxed, comfortable, and everyday wear",
                    MoodType.PROFESSIONAL: "Business-appropriate, polished, and office-ready",
                    MoodType.ROMANTIC: "Soft, feminine, and date-night perfect",
                    MoodType.ADVENTUROUS: "Outdoor, sporty, and ready for action",
                    MoodType.LUXURIOUS: "Premium, high-end, and indulgent choices"
                }.get(mood, "Discover items that match this mood")
            }
            for mood in MoodType
        ],
        "total_moods": len(MoodType)
    }