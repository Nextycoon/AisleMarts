import os
import asyncio
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

router = APIRouter()

# Mood definitions with luxury styling
MOOD_PROFILES = {
    "luxurious": {
        "name": "Luxurious",
        "description": "Premium, high-end items that exude sophistication and elegance",
        "color": "#D4AF37",
        "keywords": ["luxury", "premium", "designer", "high-end", "sophisticated", "exclusive"],
        "budget_multiplier": 3.0,
        "categories": ["fashion", "home", "tech", "travel"]
    },
    "trendy": {
        "name": "Trendy", 
        "description": "Latest fashion and cutting-edge items that are currently popular",
        "color": "#4facfe",
        "keywords": ["trending", "viral", "popular", "modern", "stylish", "contemporary"],
        "budget_multiplier": 1.5,
        "categories": ["fashion", "tech", "sports"]
    },
    "deals": {
        "name": "Deal Hunter",
        "description": "Great value items and discounted products without compromising quality",
        "color": "#ff9a9e", 
        "keywords": ["discount", "deal", "value", "affordable", "sale", "budget-friendly"],
        "budget_multiplier": 0.7,
        "categories": ["fashion", "home", "tech", "food"]
    },
    "minimalist": {
        "name": "Minimalist",
        "description": "Clean, simple, and functional items with timeless appeal",
        "color": "#a8edea",
        "keywords": ["minimal", "clean", "simple", "functional", "timeless", "essential"],
        "budget_multiplier": 1.2,
        "categories": ["home", "fashion", "tech"]
    },
    "adventurous": {
        "name": "Adventurous",
        "description": "Items for exploration, travel, and outdoor activities",
        "color": "#ffecd2",
        "keywords": ["adventure", "travel", "outdoor", "exploration", "journey", "active"],
        "budget_multiplier": 1.3,
        "categories": ["travel", "sports", "tech"]
    },
    "cozy": {
        "name": "Cozy",
        "description": "Comfort-focused items for relaxation and home enjoyment",
        "color": "#a8cc8c",
        "keywords": ["cozy", "comfort", "warm", "relaxing", "home", "soft"],
        "budget_multiplier": 1.0,
        "categories": ["home", "fashion", "food"]
    },
    "innovative": {
        "name": "Innovative",
        "description": "Cutting-edge technology and revolutionary products",
        "color": "#4facfe",
        "keywords": ["innovative", "tech", "smart", "AI", "future", "advanced"],
        "budget_multiplier": 2.0,
        "categories": ["tech", "home", "sports"]
    },
    "artistic": {
        "name": "Artistic",
        "description": "Creative, unique items that express personal style and creativity",
        "color": "#ff9a9e",
        "keywords": ["artistic", "creative", "unique", "handmade", "expressive", "design"],
        "budget_multiplier": 1.4,
        "categories": ["home", "fashion", "food"]
    }
}

# Sample product database for AI recommendations
SAMPLE_PRODUCTS = {
    "fashion": [
        {"id": "f1", "name": "Luxury Silk Dress", "brand": "Designer Label", "price": 599, "image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=400", "tags": ["luxury", "elegant", "designer"]},
        {"id": "f2", "name": "Minimalist Coat", "brand": "Clean Style", "price": 299, "image": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400", "tags": ["minimal", "clean", "timeless"]},
        {"id": "f3", "name": "Trendy Streetwear", "brand": "Urban Brand", "price": 89, "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400", "tags": ["trendy", "street", "popular"]},
    ],
    "home": [
        {"id": "h1", "name": "Luxury Sofa Set", "brand": "Premium Home", "price": 1299, "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=400", "tags": ["luxury", "comfort", "premium"]},
        {"id": "h2", "name": "Minimalist Desk", "brand": "Clean Living", "price": 399, "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=400", "tags": ["minimal", "functional", "clean"]},
        {"id": "h3", "name": "Cozy Throw Blanket", "brand": "Comfort Plus", "price": 49, "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&h=400", "tags": ["cozy", "comfort", "warm"]},
    ],
    "tech": [
        {"id": "t1", "name": "Premium Laptop", "brand": "TechBrand Pro", "price": 1599, "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=400", "tags": ["premium", "innovative", "powerful"]},
        {"id": "t2", "name": "Smart Watch", "brand": "Innovation Tech", "price": 299, "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=400", "tags": ["smart", "innovative", "trendy"]},
        {"id": "t3", "name": "Wireless Earbuds", "brand": "Sound Pro", "price": 149, "image": "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&h=400", "tags": ["wireless", "premium", "portable"]},
    ],
    "travel": [
        {"id": "tr1", "name": "Luxury Luggage Set", "brand": "Travel Elite", "price": 899, "image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=400", "tags": ["luxury", "travel", "durable"]},
        {"id": "tr2", "name": "Travel Backpack", "brand": "Adventure Gear", "price": 199, "image": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=400", "tags": ["adventure", "functional", "durable"]},
    ],
    "sports": [
        {"id": "s1", "name": "Premium Yoga Mat", "brand": "Wellness Pro", "price": 89, "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400", "tags": ["wellness", "premium", "functional"]},
        {"id": "s2", "name": "Smart Fitness Tracker", "brand": "Health Tech", "price": 199, "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=400", "tags": ["smart", "health", "innovative"]},
    ],
    "food": [
        {"id": "fd1", "name": "Gourmet Coffee Set", "brand": "Premium Roast", "price": 79, "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=400", "tags": ["gourmet", "premium", "artisan"]},
        {"id": "fd2", "name": "Organic Spice Collection", "brand": "Pure Kitchen", "price": 39, "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=400", "tags": ["organic", "natural", "gourmet"]},
    ]
}

class MoodRequest(BaseModel):
    mood: str
    budget_max: Optional[float] = 500.0
    categories: Optional[List[str]] = []
    user_preferences: Optional[Dict[str, Any]] = {}

class ProductRecommendation(BaseModel):
    id: str
    name: str
    brand: str
    price: float
    image: str
    tags: List[str]
    ai_reasoning: str
    mood_match_score: float

class MoodToCartResponse(BaseModel):
    mood: Dict[str, Any]
    recommendations: List[ProductRecommendation]
    cart_total: float
    ai_insight: str
    personalization_note: str

@router.get("/moods")
async def get_available_moods():
    """Get all available mood profiles for selection"""
    return {
        "success": True,
        "moods": [
            {
                "id": mood_id,
                "name": mood_data["name"],
                "description": mood_data["description"],
                "color": mood_data["color"],
                "categories": mood_data["categories"]
            }
            for mood_id, mood_data in MOOD_PROFILES.items()
        ]
    }

@router.post("/generate-cart", response_model=MoodToCartResponse)
async def generate_mood_cart(request: MoodRequest):
    """Generate AI-powered cart based on user's mood and preferences"""
    
    if request.mood not in MOOD_PROFILES:
        raise HTTPException(status_code=400, detail="Invalid mood selected")
    
    mood_profile = MOOD_PROFILES[request.mood]
    
    try:
        # Initialize AI chat with Emergent LLM
        ai_chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=f"mood_cart_{request.mood}",
            system_message=f"""You are AisleMarts AI, a luxury lifestyle commerce expert specializing in mood-based shopping recommendations.

Current Context:
- User selected mood: {mood_profile['name']} - {mood_profile['description']}
- Budget maximum: ${request.budget_max}
- Mood keywords: {', '.join(mood_profile['keywords'])}
- Available categories: {', '.join(mood_profile['categories'])}

Your task is to provide intelligent reasoning for product recommendations that match the user's mood, explaining why each product fits their emotional state and lifestyle needs. Focus on the psychological and emotional connection between the mood and the products."""
        ).with_model("openai", "gpt-4o-mini")
        
        # Get relevant categories for the mood
        target_categories = request.categories if request.categories else mood_profile["categories"]
        
        # Collect relevant products
        relevant_products = []
        for category in target_categories:
            if category in SAMPLE_PRODUCTS:
                for product in SAMPLE_PRODUCTS[category]:
                    # Check if product matches mood keywords
                    product_tags = set([tag.lower() for tag in product["tags"]])
                    mood_keywords = set([kw.lower() for kw in mood_profile["keywords"]])
                    
                    if product_tags.intersection(mood_keywords):
                        # Apply budget multiplier
                        adjusted_price = product["price"] * mood_profile["budget_multiplier"]
                        if adjusted_price <= request.budget_max:
                            relevant_products.append({
                                **product,
                                "price": adjusted_price,
                                "original_price": product["price"],
                                "category": category
                            })
        
        # Select top products (limit to 4-6 items for optimal cart)
        selected_products = relevant_products[:6]
        
        # Generate AI insights for each product
        recommendations = []
        total_price = 0
        
        for product in selected_products:
            try:
                # Ask AI for reasoning about this specific product
                ai_message = UserMessage(
                    text=f"Explain in 1-2 sentences why '{product['name']}' from {product['brand']} (${product['price']:.0f}) perfectly matches a {mood_profile['name']} mood. Focus on the emotional and lifestyle connection."
                )
                
                ai_response = await ai_chat.send_message(ai_message)
                ai_reasoning = ai_response.strip()
                
                # Calculate mood match score based on tag overlap
                product_tags = set([tag.lower() for tag in product["tags"]])
                mood_keywords = set([kw.lower() for kw in mood_profile["keywords"]])
                match_score = len(product_tags.intersection(mood_keywords)) / len(mood_keywords)
                
                recommendations.append(ProductRecommendation(
                    id=product["id"],
                    name=product["name"],
                    brand=product["brand"],
                    price=product["price"],
                    image=product["image"],
                    tags=product["tags"],
                    ai_reasoning=ai_reasoning,
                    mood_match_score=min(match_score * 100, 100)
                ))
                
                total_price += product["price"]
                
            except Exception as e:
                # Fallback reasoning if AI fails
                recommendations.append(ProductRecommendation(
                    id=product["id"],
                    name=product["name"],
                    brand=product["brand"],
                    price=product["price"],
                    image=product["image"],
                    tags=product["tags"],
                    ai_reasoning=f"This {product['name']} perfectly captures your {mood_profile['name'].lower()} mood with its premium quality and thoughtful design.",
                    mood_match_score=85.0
                ))
                total_price += product["price"]
        
        # Generate overall AI insight
        try:
            insight_message = UserMessage(
                text=f"Create a compelling 2-3 sentence insight about this curated cart for someone in a {mood_profile['name']} mood. Total cart value: ${total_price:.0f}. Explain how these items work together to enhance their lifestyle and emotional well-being."
            )
            
            insight_response = await ai_chat.send_message(insight_message)
            ai_insight = insight_response.strip()
            
        except Exception:
            ai_insight = f"Your {mood_profile['name'].lower()} cart combines ${total_price:.0f} worth of carefully selected items that resonate with your current mood and lifestyle goals."
        
        # Create personalization note
        personalization_note = f"Curated for your {mood_profile['name'].lower()} mood • {len(recommendations)} items • Matches your style preferences"
        
        return MoodToCartResponse(
            mood={
                "id": request.mood,
                "name": mood_profile["name"],
                "description": mood_profile["description"],
                "color": mood_profile["color"]
            },
            recommendations=recommendations,
            cart_total=total_price,
            ai_insight=ai_insight,
            personalization_note=personalization_note
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate mood cart: {str(e)}")

@router.get("/mood/{mood_id}/preview")
async def preview_mood_products(mood_id: str, limit: int = 3):
    """Preview products for a specific mood without full AI processing"""
    
    if mood_id not in MOOD_PROFILES:
        raise HTTPException(status_code=400, detail="Invalid mood ID")
    
    mood_profile = MOOD_PROFILES[mood_id]
    
    # Get sample products for preview
    preview_products = []
    for category in mood_profile["categories"]:
        if category in SAMPLE_PRODUCTS:
            for product in SAMPLE_PRODUCTS[category][:2]:  # 2 per category
                product_tags = set([tag.lower() for tag in product["tags"]])
                mood_keywords = set([kw.lower() for kw in mood_profile["keywords"]])
                
                if product_tags.intersection(mood_keywords):
                    preview_products.append({
                        **product,
                        "price": product["price"] * mood_profile["budget_multiplier"],
                        "category": category
                    })
    
    return {
        "success": True,
        "mood": {
            "id": mood_id,
            "name": mood_profile["name"],
            "description": mood_profile["description"],
            "color": mood_profile["color"]
        },
        "preview_products": preview_products[:limit],
        "total_available": len(preview_products)
    }

@router.get("/health")
async def mood_to_cart_health():
    """Health check for Mood-to-Cart system"""
    return {
        "service": "mood-to-cart",
        "status": "operational",
        "available_moods": len(MOOD_PROFILES),
        "product_categories": len(SAMPLE_PRODUCTS),
        "ai_integration": "emergent_llm" if os.getenv("EMERGENT_LLM_KEY") else "disabled"
    }