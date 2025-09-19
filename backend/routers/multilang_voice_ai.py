from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from routers.deps import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
from enum import Enum

router = APIRouter(prefix="/api/multilang-voice", tags=["multilang-voice-ai"])

class SupportedLanguage(str, Enum):
    ENGLISH = "en"
    TURKISH = "tr" 
    ARABIC = "ar"
    FRENCH = "fr"
    SWAHILI = "sw"

class VoiceCommand(BaseModel):
    text: str
    language: SupportedLanguage = SupportedLanguage.ENGLISH
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class VoiceResponse(BaseModel):
    success: bool
    language: str
    original_text: str
    detected_intent: str
    confidence: float
    action: str
    parameters: Dict[str, Any]
    ai_response: str
    products_found: List[Dict[str, Any]] = []
    cart_actions: List[Dict[str, Any]] = []
    timestamp: datetime

# Language-specific intent patterns
INTENT_PATTERNS = {
    SupportedLanguage.ENGLISH: {
        "search_product": [
            "show me", "find", "look for", "search for", "i need", "i want",
            "get me", "buy", "purchase", "shopping for"
        ],
        "add_to_cart": [
            "add to cart", "put in cart", "add this", "buy this", "purchase this",
            "get this", "i'll take this", "add it"
        ],
        "mood_shopping": [
            "i feel", "mood for", "i'm feeling", "looking for something",
            "need something", "want something for", "outfit for", "clothes for"
        ],
        "price_filter": [
            "under", "below", "less than", "cheaper than", "budget", "affordable",
            "expensive", "luxury", "premium", "high-end"
        ]
    },
    SupportedLanguage.TURKISH: {
        "search_product": [
            "göster", "bul", "ara", "istiyorum", "lazım", "alacağım",
            "satın al", "shopping", "alışveriş"
        ],
        "add_to_cart": [
            "sepete ekle", "sepete at", "al", "satın al", "bu", "bunu istiyorum",
            "sepete koy", "ekle"
        ],
        "mood_shopping": [
            "hissediyorum", "ruh halim", "mood", "bir şey arıyorum",
            "kıyafet", "outfit", "giysi", "stil"
        ],
        "price_filter": [
            "altında", "aşağı", "ucuz", "pahalı", "lüks", "premium",
            "bütçe", "fiyat", "uygun fiyat"
        ]
    },
    SupportedLanguage.ARABIC: {
        "search_product": [
            "أرني", "ابحث عن", "أريد", "أحتاج", "اشتري", "شراء",
            "تسوق", "أبحث عن", "أطلب"
        ],
        "add_to_cart": [
            "أضف للسلة", "ضع في السلة", "اشتري هذا", "أضف هذا",
            "أريد هذا", "سآخذ هذا"
        ],
        "mood_shopping": [
            "أشعر", "مزاج", "أبحث عن شيء", "أحتاج شيء",
            "ملابس", "زي", "أزياء"
        ],
        "price_filter": [
            "أقل من", "تحت", "رخيص", "غالي", "فاخر", "ممتاز",
            "ميزانية", "سعر", "مناسب"
        ]
    },
    SupportedLanguage.FRENCH: {
        "search_product": [
            "montre-moi", "trouve", "cherche", "je veux", "j'ai besoin",
            "acheter", "shopping", "je cherche"
        ],
        "add_to_cart": [
            "ajouter au panier", "mettre au panier", "acheter ça", "ajouter ça",
            "je prends ça", "ajouter"
        ],
        "mood_shopping": [
            "je me sens", "humeur", "je cherche quelque chose",
            "vêtements", "tenue", "style", "mode"
        ],
        "price_filter": [
            "moins de", "sous", "pas cher", "cher", "luxe", "premium",
            "budget", "prix", "abordable"
        ]
    },
    SupportedLanguage.SWAHILI: {
        "search_product": [
            "nionyeshe", "tafuta", "nataka", "nahitaji", "nunua",
            "ununuzi", "tafuta", "naomba"
        ],
        "add_to_cart": [
            "ongeza kwenye cart", "weka cart", "nunua hii", "ongeza hii",
            "nataka hii", "nitachukua hii"
        ],
        "mood_shopping": [
            "nahisi", "hali ya moyo", "natafuta kitu", "nahitaji kitu",
            "nguo", "mavazi", "mtindo"
        ],
        "price_filter": [
            "chini ya", "rahisi", "ghali", "anasa", "bei ya juu",
            "bajeti", "bei", "nafuu"
        ]
    }
}

# Language-specific response templates
RESPONSE_TEMPLATES = {
    SupportedLanguage.ENGLISH: {
        "search_success": "I found {count} products for '{query}'. Here are the best matches:",
        "search_empty": "I couldn't find any products matching '{query}'. Would you like to try a different search?",
        "cart_added": "Great! I've added {product} to your cart. Your cart now has {count} items.",
        "mood_response": "Based on your {mood} mood, I've found some perfect items for you:",
        "price_filter": "Showing {count} products {price_range}:",
        "greeting": "Hi! How can I help you shop today?",
        "error": "I'm sorry, I didn't understand that. Could you try rephrasing?"
    },
    SupportedLanguage.TURKISH: {
        "search_success": "'{query}' için {count} ürün buldum. İşte en iyi eşleşmeler:",
        "search_empty": "'{query}' ile eşleşen ürün bulamadım. Farklı bir arama denemek ister misiniz?",
        "cart_added": "Harika! {product} sepetinize eklendi. Sepetinizde şimdi {count} ürün var.",
        "mood_response": "{mood} ruh halinize göre sizin için mükemmel ürünler buldum:",
        "price_filter": "{price_range} {count} ürün gösteriliyor:",
        "greeting": "Merhaba! Bugün alışverişinizde nasıl yardımcı olabilirim?",
        "error": "Üzgünüm, anlamadım. Tekrar ifade edebilir misiniz?"
    },
    SupportedLanguage.ARABIC: {
        "search_success": "وجدت {count} منتج لـ '{query}'. إليك أفضل النتائج:",
        "search_empty": "لم أتمكن من العثور على منتجات تطابق '{query}'. هل تريد تجربة بحث مختلف؟",
        "cart_added": "رائع! لقد أضفت {product} إلى سلتك. سلتك تحتوي الآن على {count} عنصر.",
        "mood_response": "بناءً على مزاجك {mood}، وجدت بعض العناصر المثالية لك:",
        "price_filter": "عرض {count} منتج {price_range}:",
        "greeting": "مرحبا! كيف يمكنني مساعدتك في التسوق اليوم؟",
        "error": "أعتذر، لم أفهم ذلك. هل يمكنك إعادة الصياغة؟"
    },
    SupportedLanguage.FRENCH: {
        "search_success": "J'ai trouvé {count} produits pour '{query}'. Voici les meilleures correspondances:",
        "search_empty": "Je n'ai trouvé aucun produit correspondant à '{query}'. Voulez-vous essayer une recherche différente?",
        "cart_added": "Parfait! J'ai ajouté {product} à votre panier. Votre panier contient maintenant {count} articles.",
        "mood_response": "Basé sur votre humeur {mood}, j'ai trouvé des articles parfaits pour vous:",
        "price_filter": "Affichage de {count} produits {price_range}:",
        "greeting": "Salut! Comment puis-je vous aider à faire du shopping aujourd'hui?",
        "error": "Désolé, je n'ai pas compris. Pourriez-vous reformuler?"
    },
    SupportedLanguage.SWAHILI: {
        "search_success": "Nimepata bidhaa {count} kwa '{query}'. Hapa ni mechi bora zaidi:",
        "search_empty": "Sikuweza kupata bidhaa zinazofanana na '{query}'. Je, ungependa kujaribu utafutaji tofauti?",
        "cart_added": "Vizuri! Nimeongeza {product} kwenye cart yako. Cart yako sasa ina vitu {count}.",
        "mood_response": "Kulingana na hali yako ya {mood}, nimepata vitu kamili kwako:",
        "price_filter": "Inaonyesha bidhaa {count} {price_range}:",
        "greeting": "Hujambo! Ninawezaje kukusaidia kununua leo?",
        "error": "Samahani, sikuelewa hilo. Unaweza kueleza tena?"
    }
}

# Helper Functions
def detect_language_intent(text: str, language: SupportedLanguage) -> tuple[str, float]:
    """Detect intent based on language-specific patterns"""
    text_lower = text.lower()
    patterns = INTENT_PATTERNS.get(language, INTENT_PATTERNS[SupportedLanguage.ENGLISH])
    
    best_intent = "search_product"  # default
    best_confidence = 0.0
    
    for intent, keywords in patterns.items():
        matches = sum(1 for keyword in keywords if keyword in text_lower)
        confidence = matches / max(len(keywords), 1) * (matches / max(len(text_lower.split()), 1))
        
        if confidence > best_confidence:
            best_intent = intent
            best_confidence = confidence
    
    # Boost confidence if we found any matches
    if best_confidence > 0:
        best_confidence = min(0.95, best_confidence + 0.3)
    else:
        best_confidence = 0.6  # default confidence
    
    return best_intent, best_confidence

def extract_parameters(text: str, intent: str, language: SupportedLanguage) -> Dict[str, Any]:
    """Extract parameters from voice command based on intent and language"""
    params = {}
    text_lower = text.lower()
    
    if intent == "search_product":
        # Extract product keywords (simple approach)
        stop_words = {
            SupportedLanguage.ENGLISH: ["show", "me", "find", "look", "for", "search", "i", "need", "want", "the", "a", "an"],
            SupportedLanguage.TURKISH: ["göster", "bul", "ara", "ben", "bana", "bir", "şu", "bu"],
            SupportedLanguage.ARABIC: ["أرني", "ابحث", "عن", "أريد", "أحتاج", "هذا", "ذلك"],
            SupportedLanguage.FRENCH: ["montre", "moi", "trouve", "cherche", "je", "veux", "un", "une", "le", "la"],
            SupportedLanguage.SWAHILI: ["nionyeshe", "tafuta", "nataka", "nahitaji", "hii", "hiyo"]
        }
        
        words = text_lower.split()
        clean_words = [w for w in words if w not in stop_words.get(language, [])]
        params["search_query"] = " ".join(clean_words[:3])  # Take first 3 meaningful words
        
    elif intent == "mood_shopping":
        # Extract mood keywords
        mood_keywords = {
            SupportedLanguage.ENGLISH: ["happy", "sad", "excited", "calm", "bold", "elegant", "casual", "formal", "weekend", "work"],
            SupportedLanguage.TURKISH: ["mutlu", "üzgün", "heyecanlı", "sakin", "cesur", "zarif", "günlük", "resmi"],
            SupportedLanguage.ARABIC: ["سعيد", "حزين", "متحمس", "هادئ", "جريء", "أنيق", "كاجوال", "رسمي"],
            SupportedLanguage.FRENCH: ["heureux", "triste", "excité", "calme", "audacieux", "élégant", "décontracté", "formel"],
            SupportedLanguage.SWAHILI: ["furaha", "huzuni", "msisimko", "tulivu", "jasiri", "maridadi", "kawaida", "rasmi"]
        }
        
        detected_moods = []
        for mood in mood_keywords.get(language, []):
            if mood in text_lower:
                detected_moods.append(mood)
        
        params["mood"] = detected_moods[0] if detected_moods else "casual"
        params["search_query"] = "clothes fashion"
        
    elif intent == "price_filter":
        # Extract price range
        if any(word in text_lower for word in ["under", "below", "less", "altında", "أقل", "moins", "chini"]):
            params["price_max"] = 100  # default
        elif any(word in text_lower for word in ["luxury", "premium", "expensive", "lüks", "فاخر", "luxe", "anasa"]):
            params["price_min"] = 200
        
        params["search_query"] = "products"
    
    return params

async def search_products_by_query(db: AsyncIOMotorDatabase, query: str, **filters) -> List[Dict[str, Any]]:
    """Search products based on query and filters"""
    search_filter = {}
    
    if query and query.strip():
        search_filter["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"category": {"$regex": query, "$options": "i"}},
            {"brand": {"$regex": query, "$options": "i"}}
        ]
    
    # Add price filters
    if "price_min" in filters:
        search_filter["price"] = {"$gte": filters["price_min"]}
    if "price_max" in filters:
        if "price" not in search_filter:
            search_filter["price"] = {}
        search_filter["price"]["$lte"] = filters["price_max"]
    
    cursor = db.products.find(search_filter).limit(5)
    products = []
    
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        products.append(doc)
    
    return products

def generate_ai_response(intent: str, language: SupportedLanguage, params: Dict[str, Any], products: List[Dict]) -> str:
    """Generate AI response in the specified language"""
    templates = RESPONSE_TEMPLATES.get(language, RESPONSE_TEMPLATES[SupportedLanguage.ENGLISH])
    
    if intent == "search_product":
        if products:
            return templates["search_success"].format(
                count=len(products),
                query=params.get("search_query", "")
            )
        else:
            return templates["search_empty"].format(
                query=params.get("search_query", "")
            )
    
    elif intent == "mood_shopping":
        return templates["mood_response"].format(
            mood=params.get("mood", "casual")
        )
    
    elif intent == "add_to_cart":
        return templates["cart_added"].format(
            product=params.get("product_name", "item"),
            count=params.get("cart_count", 1)
        )
    
    elif intent == "price_filter":
        price_range = "in your budget"
        if "price_min" in params:
            price_range = "premium range"
        elif "price_max" in params:
            price_range = "budget-friendly"
            
        return templates["price_filter"].format(
            count=len(products),
            price_range=price_range
        )
    
    return templates.get("greeting", "Hello! How can I help you?")

# API Endpoints
@router.get("/health")
async def multilang_voice_health():
    """Health check for multi-language voice AI system"""
    return {
        "status": "healthy",
        "service": "multilang_voice_ai",
        "supported_languages": [lang.value for lang in SupportedLanguage],
        "features": [
            "voice_command_processing",
            "intent_detection",
            "multi_language_responses",
            "mood_based_shopping",
            "contextual_recommendations",
            "cart_integration"
        ],
        "language_count": len(SupportedLanguage),
        "intent_categories": ["search_product", "add_to_cart", "mood_shopping", "price_filter"],
        "timestamp": datetime.utcnow()
    }

@router.post("/process", response_model=VoiceResponse)
async def process_voice_command(
    command: VoiceCommand,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Process voice command in multiple languages"""
    try:
        # Detect intent and confidence
        intent, confidence = detect_language_intent(command.text, command.language)
        
        # Extract parameters
        params = extract_parameters(command.text, intent, command.language)
        
        # Search products if needed
        products = []
        cart_actions = []
        
        if intent in ["search_product", "mood_shopping", "price_filter"]:
            search_query = params.get("search_query", "")
            products = await search_products_by_query(
                db, 
                search_query,
                price_min=params.get("price_min"),
                price_max=params.get("price_max")
            )
        
        elif intent == "add_to_cart" and command.user_id:
            # Simulate cart action (in real implementation, this would add to user's cart)
            cart_actions.append({
                "action": "add",
                "product_id": params.get("product_id", "sample_product"),
                "quantity": 1,
                "user_id": command.user_id
            })
            params["cart_count"] = len(cart_actions)
        
        # Generate AI response
        ai_response = generate_ai_response(intent, command.language, params, products)
        
        # Determine action
        action_mapping = {
            "search_product": "search_products",
            "add_to_cart": "add_to_cart", 
            "mood_shopping": "mood_search",
            "price_filter": "filter_by_price"
        }
        
        return VoiceResponse(
            success=True,
            language=command.language.value,
            original_text=command.text,
            detected_intent=intent,
            confidence=confidence,
            action=action_mapping.get(intent, "unknown"),
            parameters=params,
            ai_response=ai_response,
            products_found=products,
            cart_actions=cart_actions,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        # Return error response in user's language
        templates = RESPONSE_TEMPLATES.get(command.language, RESPONSE_TEMPLATES[SupportedLanguage.ENGLISH])
        
        return VoiceResponse(
            success=False,
            language=command.language.value,
            original_text=command.text,
            detected_intent="error",
            confidence=0.0,
            action="error",
            parameters={},
            ai_response=templates["error"],
            products_found=[],
            cart_actions=[],
            timestamp=datetime.utcnow()
        )

@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages with sample phrases"""
    return {
        "supported_languages": [
            {
                "code": SupportedLanguage.ENGLISH.value,
                "name": "English",
                "sample_phrases": [
                    "Show me luxury handbags",
                    "I need something for a weekend outfit",
                    "Find affordable electronics"
                ]
            },
            {
                "code": SupportedLanguage.TURKISH.value,
                "name": "Türkçe",
                "sample_phrases": [
                    "Lüks çanta göster",
                    "Hafta sonu kıyafeti lazım", 
                    "Uygun fiyatlı elektronik bul"
                ]
            },
            {
                "code": SupportedLanguage.ARABIC.value,
                "name": "العربية",
                "sample_phrases": [
                    "أرني حقائب فاخرة",
                    "أحتاج شيء لملابس نهاية الأسبوع",
                    "ابحث عن إلكترونيات بأسعار معقولة"
                ]
            },
            {
                "code": SupportedLanguage.FRENCH.value,
                "name": "Français",
                "sample_phrases": [
                    "Montre-moi des sacs de luxe",
                    "J'ai besoin de quelque chose pour une tenue de week-end",
                    "Trouve de l'électronique abordable"
                ]
            },
            {
                "code": SupportedLanguage.SWAHILI.value,
                "name": "Kiswahili", 
                "sample_phrases": [
                    "Nionyeshe mifuko ya anasa",
                    "Nahitaji kitu cha nguo za wikendi",
                    "Tafuta elektroniki za bei nafuu"
                ]
            }
        ],
        "total_languages": len(SupportedLanguage),
        "features_per_language": [
            "Intent detection",
            "Product search",
            "Mood-based shopping",
            "Price filtering",
            "Cart integration"
        ]
    }

@router.post("/demo")
async def demo_multilang_voice(
    language: SupportedLanguage = SupportedLanguage.ENGLISH,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Demo multi-language voice capabilities"""
    demo_commands = {
        SupportedLanguage.ENGLISH: [
            "Show me luxury handbags under $200",
            "I feel bold today, find me something special",
            "Add this leather jacket to my cart"
        ],
        SupportedLanguage.TURKISH: [
            "200 dolardan ucuz lüks çanta göster",
            "Bugün cesur hissediyorum, özel bir şey bul",
            "Bu deri ceketi sepetime ekle"
        ],
        SupportedLanguage.ARABIC: [
            "أرني حقائب فاخرة تحت 200 دولار",
            "أشعر بالجرأة اليوم، اعثر لي على شيء مميز",
            "أضف هذا الجاكيت الجلدي إلى سلتي"
        ],
        SupportedLanguage.FRENCH: [
            "Montre-moi des sacs de luxe sous 200$",
            "Je me sens audacieux aujourd'hui, trouve-moi quelque chose de spécial",
            "Ajoute cette veste en cuir à mon panier"
        ],
        SupportedLanguage.SWAHILI: [
            "Nionyeshe mifuko ya anasa chini ya dola 200",
            "Nahisi jasiri leo, nipatia kitu maalum",
            "Ongeza jacket hii ya ngozi kwenye cart yangu"
        ]
    }
    
    commands = demo_commands.get(language, demo_commands[SupportedLanguage.ENGLISH])
    results = []
    
    for cmd_text in commands:
        command = VoiceCommand(text=cmd_text, language=language, user_id="demo_user")
        result = await process_voice_command(command, db)
        results.append({
            "command": cmd_text,
            "intent": result.detected_intent,
            "confidence": result.confidence,
            "response": result.ai_response,
            "products_found": len(result.products_found),
            "action": result.action
        })
    
    return {
        "language": language.value,
        "demo_results": results,
        "success_rate": sum(1 for r in results if r["confidence"] > 0.5) / len(results),
        "timestamp": datetime.utcnow()
    }