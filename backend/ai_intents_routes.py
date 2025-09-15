from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from multilang_ai_service import multilang_ai_service
from seller_service import seller_service
from commission_service import commission_service
from security import get_current_user_optional
from datetime import datetime
import re

router = APIRouter(prefix="/api/ai", tags=["AI Intents"])

class AIIntentRequest(BaseModel):
    input: Dict[str, Any]
    locale: str = "en"
    currency: str = "USD"
    lat: Optional[float] = None
    lng: Optional[float] = None

class SmartCard(BaseModel):
    type: str
    data: Dict[str, Any]

@router.post("/intents")
async def process_ai_intent(
    request: AIIntentRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Process AI intent and return Smart Cards"""
    try:
        input_data = request.input
        input_type = input_data.get("type", "text")
        
        cards: List[SmartCard] = []
        
        if input_type == "text" or input_type == "prompt":
            text = input_data.get("text", "")
            
            # Analyze intent from text
            intent = analyze_user_intent(text)
            
            if intent == "compare_products":
                # Generate compare card with mock data
                cards.append(SmartCard(
                    type="compare",
                    data={
                        "items": [
                            {
                                "title": "iPhone 15 Pro",
                                "price": 1199,
                                "rating": 4.8,
                                "eta": "Tomorrow"
                            },
                            {
                                "title": "Samsung Galaxy S24 Ultra",
                                "price": 1099,
                                "rating": 4.7,
                                "eta": "2 days"
                            },
                            {
                                "title": "Google Pixel 8 Pro",
                                "price": 999,
                                "rating": 4.6,
                                "eta": "3 days"
                            }
                        ]
                    }
                ))
            
            elif intent == "find_product":
                # Generate product card
                product_name = extract_product_name(text)
                cards.append(SmartCard(
                    type="product",
                    data={
                        "title": f"Best {product_name} Near You",
                        "description": f"AI found the perfect {product_name} based on your location and preferences.",
                        "price": 299,
                        "rating": 4.7,
                        "eta": "Same day delivery",
                        "savings": 50
                    }
                ))
            
            elif intent == "create_bundle":
                # Generate bundle card
                budget = extract_budget(text)
                cards.append(SmartCard(
                    type="bundle",
                    data={
                        "total": budget if budget else 200,
                        "savings": 45,
                        "items": [
                            {"name": "Wireless Headphones", "price": 89},
                            {"name": "Phone Case", "price": 25},
                            {"name": "Charging Cable", "price": 15}
                        ]
                    }
                ))
            
            elif intent == "seller_help" or "sell" in text.lower():
                # Generate connect store card
                cards.append(SmartCard(
                    type="connect_store",
                    data={}
                ))
            
            else:
                # Get AI response using our multi-language service
                ai_response = await multilang_ai_service.get_ai_response(
                    user_message=text,
                    language=map_locale_to_language(request.locale),
                    user_context={
                        "currency": request.currency,
                        "location": {"lat": request.lat, "lng": request.lng} if request.lat and request.lng else None,
                        "user_id": current_user.get("_id") if current_user else None
                    }
                )
                
                # Convert AI response to product card
                cards.append(SmartCard(
                    type="product",
                    data={
                        "title": "AI Shopping Assistant",
                        "description": ai_response["response"],
                        "price": 0,
                        "rating": 5.0,
                        "eta": "Available now"
                    }
                ))
        
        elif input_type == "image":
            # Handle image input - mock visual search
            cards.append(SmartCard(
                type="product",
                data={
                    "title": "Visual Search Results",
                    "description": "AI identified this product from your image! Here are similar items with the best prices.",
                    "price": 149,
                    "rating": 4.5,
                    "eta": "Tomorrow"
                }
            ))
        
        elif input_type == "voice":
            # Handle voice input - mock voice recognition
            cards.append(SmartCard(
                type="product",
                data={
                    "title": "Voice Search Active",
                    "description": "I'm listening! Tell me what you're looking for and I'll find the best deals.",
                    "price": 0,
                    "rating": 5.0,
                    "eta": "Instant"
                }
            ))
        
        elif input_type == "barcode":
            # Handle barcode input - mock barcode scanning
            cards.append(SmartCard(
                type="compare",
                data={
                    "items": [
                        {
                            "title": "Scanned Product - Store A",
                            "price": 24.99,
                            "rating": 4.3,
                            "eta": "In stock"
                        },
                        {
                            "title": "Same Product - Store B",
                            "price": 22.99,
                            "rating": 4.5,
                            "eta": "2 days"
                        }
                    ]
                }
            ))
        
        return {
            "cards": [card.dict() for card in cards],
            "processed_at": datetime.utcnow(),
            "locale": request.locale,
            "currency": request.currency
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI intent processing failed: {str(e)}")

def analyze_user_intent(text: str) -> str:
    """Analyze user text to determine intent"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ["compare", "vs", "versus", "difference between"]):
        return "compare_products"
    elif any(word in text_lower for word in ["find", "search", "looking for", "need", "want"]):
        return "find_product"
    elif any(word in text_lower for word in ["bundle", "package", "under", "budget", "within"]):
        return "create_bundle"
    elif any(word in text_lower for word in ["sell", "seller", "store", "business", "vendor"]):
        return "seller_help"
    else:
        return "general_chat"

def extract_product_name(text: str) -> str:
    """Extract product name from user text"""
    # Simple extraction - look for nouns after "find", "search", etc.
    patterns = [
        r"(?:find|search for|looking for|need|want)\s+(?:a\s+|an\s+|the\s+)?([\w\s]+)",
        r"(headphones?|phone|laptop|tablet|watch|shoes?|clothes?|electronics?)"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return match.group(1).strip()
    
    return "product"

def extract_budget(text: str) -> Optional[int]:
    """Extract budget amount from user text"""
    patterns = [
        r"under\s*\$?(\d+)",
        r"within\s*\$?(\d+)",
        r"budget\s*of\s*\$?(\d+)",
        r"\$(\d+)\s*budget"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return int(match.group(1))
    
    return None

def map_locale_to_language(locale: str) -> str:
    """Map locale to supported language"""
    locale_map = {
        "en": "en",
        "en-US": "en",
        "sw": "sw",
        "sw-KE": "sw",
        "ar": "ar",
        "tr": "tr",
        "fr": "fr"
    }
    
    return locale_map.get(locale, "en")

@router.get("/intents/health")
async def ai_intents_health():
    """Health check for AI intents service"""
    return {
        "status": "healthy",
        "service": "ai_intents",
        "supported_intents": [
            "compare_products",
            "find_product", 
            "create_bundle",
            "seller_help",
            "general_chat"
        ],
        "supported_inputs": ["text", "voice", "image", "barcode"],
        "card_types": ["product", "compare", "bundle", "connect_store"],
        "timestamp": datetime.utcnow()
    }

@router.post("/intents/demo")
async def demo_ai_intents():
    """Demo endpoint showing all card types"""
    return {
        "cards": [
            {
                "type": "product",
                "data": {
                    "title": "AI-Powered Product Discovery",
                    "description": "Smart recommendations based on your preferences and location",
                    "price": 199,
                    "rating": 4.8,
                    "eta": "Same day",
                    "savings": 30
                }
            },
            {
                "type": "compare",
                "data": {
                    "items": [
                        {"title": "Option A", "price": 199, "rating": 4.5, "eta": "Today"},
                        {"title": "Option B", "price": 179, "rating": 4.7, "eta": "Tomorrow"},
                        {"title": "Option C", "price": 229, "rating": 4.8, "eta": "2 days"}
                    ]
                }
            },
            {
                "type": "bundle",
                "data": {
                    "total": 250,
                    "savings": 55,
                    "items": [
                        {"name": "Main Product", "price": 150},
                        {"name": "Accessory 1", "price": 50},
                        {"name": "Accessory 2", "price": 30}
                    ]
                }
            },
            {
                "type": "connect_store",
                "data": {}
            }
        ],
        "demo": True,
        "timestamp": datetime.utcnow()
    }