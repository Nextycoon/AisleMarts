"""
Aisle AI Agent routes for v1 API - The core AI shopping companion
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncio
import json
from ...db import db
from ..deps import get_current_shopper, get_or_create_session
from ...config import settings

router = APIRouter(prefix="/v1/agent", tags=["aisle-agent"])

class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    locale: Optional[str] = None

class ProductPick(BaseModel):
    product_id: str
    reason: Optional[str] = None
    confidence: float = 1.0

class ChatResponse(BaseModel):
    intent: str
    summary: str
    reviews: List[str]
    picks: List[ProductPick]
    ribbons: List[str]  # ["luxury", "hot-deal", "trending"]
    locked: bool = False
    response_time_ms: int

class QuickAction(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    intent: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_aisle_agent(
    payload: ChatMessage,
    shopper=Depends(get_current_shopper),
    session=Depends(get_or_create_session)
):
    """Chat with Aisle AI Agent for shopping assistance"""
    start_time = datetime.utcnow()
    
    # Determine locale
    locale = payload.locale or (shopper and shopper.get("locale", "en")) or "en"
    
    # Route intent from message
    intent = await route_intent(payload.message, locale)
    
    # Get recommendations based on intent
    picks = await get_recommendations_for_intent(intent, shopper, session)
    
    # Generate reviews digest for recommended products
    reviews_digest = await generate_reviews_digest([pick.product_id for pick in picks])
    
    # Generate AI summary/advice
    summary = await generate_aisle_advice(intent, payload.message, picks, locale)
    
    # Determine ribbons based on intent
    ribbons = get_ribbons_for_intent(intent)
    
    # Log chat event
    if session:
        await log_chat_event(session["_id"], payload.message, intent, len(picks))
    
    response_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
    
    return ChatResponse(
        intent=intent,
        summary=summary,
        reviews=reviews_digest,
        picks=picks,
        ribbons=ribbons,
        locked=False,
        response_time_ms=response_time_ms
    )

@router.post("/voice")
async def voice_chat_with_aisle_agent(
    audio_file: UploadFile = File(...),
    locale: Optional[str] = None,
    shopper=Depends(get_current_shopper),
    session=Depends(get_or_create_session)
):
    """Voice chat with Aisle AI Agent"""
    
    # In development, return mock transcription
    # In production, integrate with speech-to-text service
    mock_transcript = "What are the trending luxury handbags?"
    
    # Process the transcribed text as a regular chat message
    chat_payload = ChatMessage(
        message=mock_transcript,
        locale=locale
    )
    
    response = await chat_with_aisle_agent(chat_payload, shopper, session)
    
    return {
        "transcript": mock_transcript,
        "confidence": 0.95,
        "chat_response": response
    }

@router.get("/quick-actions")
async def get_quick_actions(
    locale: Optional[str] = None,
    shopper=Depends(get_current_shopper)
):
    """Get quick action presets for Aisle Agent"""
    
    # Determine locale
    locale = locale or (shopper and shopper.get("locale", "en")) or "en"
    
    # Localized quick actions
    actions_by_locale = {
        "en": [
            QuickAction(
                id="trending",
                title="Trending",
                description="Hot deals & new arrivals", 
                icon="🔥",
                intent="trending"
            ),
            QuickAction(
                id="nearby",
                title="Nearby",
                description="Local boutiques & stores",
                icon="📍", 
                intent="nearby"
            ),
            QuickAction(
                id="luxury",
                title="Luxury",
                description="Premium brands & collections",
                icon="💎",
                intent="luxury"
            )
        ],
        "tr": [
            QuickAction(
                id="trending",
                title="Trend",
                description="Sıcak fırsatlar ve yeni ürünler",
                icon="🔥",
                intent="trending"
            ),
            QuickAction(
                id="nearby",
                title="Yakında",
                description="Yerel butikler ve mağazalar",
                icon="📍",
                intent="nearby"
            ),
            QuickAction(
                id="luxury",
                title="Lüks",
                description="Premium markalar ve koleksiyonlar",
                icon="💎",
                intent="luxury"
            )
        ]
    }
    
    return {
        "locale": locale,
        "actions": actions_by_locale.get(locale, actions_by_locale["en"])
    }

async def route_intent(message: str, locale: str) -> str:
    """Route user message to appropriate intent"""
    
    message_lower = message.lower()
    
    # Intent keywords by locale
    intent_keywords = {
        "en": {
            "trending": ["trending", "hot", "popular", "new", "latest", "what's hot"],
            "luxury": ["luxury", "premium", "high-end", "designer", "expensive"],
            "deals": ["deal", "sale", "discount", "cheap", "bargain", "offer"],
            "nearby": ["nearby", "local", "near me", "close", "around"],
            "compare": ["compare", "vs", "versus", "difference", "which is better"],
            "reviews": ["review", "rating", "opinion", "feedback", "experience"]
        },
        "tr": {
            "trending": ["trend", "popüler", "yeni", "sıcak", "moda"],
            "luxury": ["lüks", "premium", "pahalı", "kaliteli", "markali"],
            "deals": ["indirim", "fırsat", "ucuz", "kampanya", "teklif"],
            "nearby": ["yakın", "yerel", "civarda", "burada"],
            "compare": ["karşılaştır", "hangisi", "fark", "vs"],
            "reviews": ["yorum", "değerlendirme", "puanlama", "deneyim"]
        }
    }
    
    keywords = intent_keywords.get(locale, intent_keywords["en"])
    
    # Check for intent matches
    for intent, words in keywords.items():
        if any(word in message_lower for word in words):
            return intent
    
    # Default to general recommendation
    return "recommend"

async def get_recommendations_for_intent(intent: str, shopper: Optional[dict], session: dict) -> List[ProductPick]:
    """Get product recommendations based on intent"""
    
    # Build query based on intent
    query_filters = {
        "trending": {"rating": {"$gte": 4.0}, "rating_count": {"$gte": 5}},
        "luxury": {"tags": {"$in": ["luxury", "premium"]}, "price": {"$gte": 100}},
        "deals": {"tags": {"$in": ["sale", "deal", "discount"]}},
        "nearby": {"tags": {"$in": ["local", "nearby"]}},  # Would integrate with location in production
        "recommend": {}  # General recommendations
    }
    
    base_filter = {"active": True}
    base_filter.update(query_filters.get(intent, {}))
    
    # Get user's recent activity for personalization
    recent_views = []
    if session:
        for event in session.get("events", [])[-10:]:  # Last 10 events
            if event.get("type") == "view_product":
                recent_views.append(event["product_id"])
    
    # Query products
    cursor = db().products.find(base_filter).sort([
        ("rating", -1),
        ("rating_count", -1),
        ("created_at", -1)
    ]).limit(8)
    
    products = await cursor.to_list(length=8)
    
    # Convert to ProductPick format
    picks = []
    for product in products:
        reason = generate_pick_reason(product, intent)
        confidence = calculate_confidence(product, intent, recent_views)
        
        picks.append(ProductPick(
            product_id=product["_id"],
            reason=reason,
            confidence=confidence
        ))
    
    return picks

async def generate_reviews_digest(product_ids: List[str]) -> List[str]:
    """Generate digest of reviews for recommended products"""
    
    if not product_ids:
        return []
    
    # Get recent reviews for these products
    reviews_cursor = db().reviews.find({
        "product_id": {"$in": product_ids},
        "rating": {"$gte": 4}  # Focus on positive reviews
    }).sort("created_at", -1).limit(6)
    
    reviews = await reviews_cursor.to_list(length=6)
    
    # Extract key points from reviews
    digest = []
    for review in reviews[:3]:  # Top 3 review points
        # Simple keyword extraction (in production, use NLP)
        body = review.get("body", "")
        if len(body) > 50:
            # Extract first sentence or up to 100 chars
            summary = body[:100] + "..." if len(body) > 100 else body
            digest.append(f"★ {summary}")
    
    return digest

async def generate_aisle_advice(intent: str, message: str, picks: List[ProductPick], locale: str) -> str:
    """Generate AI advice summary based on intent and context"""
    
    advice_templates = {
        "en": {
            "trending": f"Here are {len(picks)} trending items based on current popularity and ratings.",
            "luxury": f"I've curated {len(picks)} premium pieces from top luxury brands for you.",
            "deals": f"Found {len(picks)} great deals with significant savings for you.",
            "nearby": f"Discovered {len(picks)} items available from local stores near you.",
            "recommend": f"Based on your preferences, here are {len(picks)} personalized recommendations."
        },
        "tr": {
            "trending": f"Mevcut popülerlik ve puanlamalara göre {len(picks)} trend ürün.",
            "luxury": f"Size özel {len(picks)} premium parça seçtim.",
            "deals": f"Sizin için {len(picks)} harika fırsat buldum.",
            "nearby": f"Yakınınızdaki mağazalardan {len(picks)} ürün keşfettim.",
            "recommend": f"Tercihlerinize göre {len(picks)} kişisel öneri."
        }
    }
    
    templates = advice_templates.get(locale, advice_templates["en"])
    return templates.get(intent, templates["recommend"])

def get_ribbons_for_intent(intent: str) -> List[str]:
    """Get ribbon tags based on intent"""
    
    ribbon_mapping = {
        "trending": ["trending", "hot"],
        "luxury": ["luxury", "premium"],
        "deals": ["deal", "sale"],
        "nearby": ["local", "nearby"],
        "recommend": ["recommended"]
    }
    
    return ribbon_mapping.get(intent, ["recommended"])

def generate_pick_reason(product: dict, intent: str) -> str:
    """Generate reason for product recommendation"""
    
    reasons = {
        "trending": f"★{product.get('rating', 0):.1f} ({product.get('rating_count', 0)} reviews)",
        "luxury": f"Premium {product.get('brand', 'brand')} - ${product.get('price', 0):.0f}",
        "deals": f"Save on {product.get('brand', 'brand')} - ${product.get('price', 0):.0f}",
        "nearby": f"Available locally - {product.get('brand', 'brand')}",
        "recommend": f"Matches your style - {product.get('brand', 'brand')}"
    }
    
    return reasons.get(intent, f"Great choice - {product.get('brand', 'brand')}")

def calculate_confidence(product: dict, intent: str, recent_views: List[str]) -> float:
    """Calculate confidence score for recommendation"""
    
    base_confidence = 0.7
    
    # Boost for high ratings
    if product.get("rating", 0) >= 4.5:
        base_confidence += 0.2
    
    # Boost for many reviews
    if product.get("rating_count", 0) >= 50:
        base_confidence += 0.1
    
    # Boost if related to recent views
    if product["_id"] in recent_views:
        base_confidence += 0.1
    
    return min(base_confidence, 1.0)

async def log_chat_event(session_id: str, message: str, intent: str, picks_count: int):
    """Log chat interaction for analytics"""
    event = {
        "type": "agent_chat",
        "message": message[:200],  # Truncate for privacy
        "intent": intent,
        "picks_count": picks_count,
        "timestamp": datetime.utcnow()
    }
    
    await db().sessions.update_one(
        {"_id": session_id},
        {"$push": {"events": event}}
    )