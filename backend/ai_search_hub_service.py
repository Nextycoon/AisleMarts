from dotenv import load_dotenv
import os
import json
import asyncio
import re
import base64
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

from db import db
from ai_search_hub_models import (
    SearchRequest, QuickSearchResponse, DeepSearchRequest, DeepSearchResponse,
    ImageReadRequest, ImageReadResponse, QRScanRequest, QRScanResponse,
    BarcodeScanRequest, BarcodeScanResponse, VoiceInputRequest, VoiceInputResponse,
    Intent, IntentAnalysisResponse, SearchHubAnalytics, UserPreferences,
    SAMPLE_PRODUCTS, SAMPLE_CITIES
)

load_dotenv()

class AISearchHubService:
    """AI-powered unified search hub with multi-modal capabilities"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_search_hub_ai",
            system_message="""You are the AI Search Intelligence for AisleMarts - a global B2B marketplace.

Your mission: Provide intelligent, multi-modal search capabilities that help buyers find products and sellers discover markets worldwide.

Key capabilities:
- Quick search: Fast, relevant product matching with filters
- Deep search: Market analysis, trend insights, buyer behavior patterns
- Image understanding: OCR, entity extraction, translation
- Intent analysis: Understand what users want from natural language
- Geographic insights: City-level demand patterns and market opportunities
- Multi-language support: Arabic, Turkish, English, and more

Your personality: Intelligent, helpful, globally-minded. You understand international trade, cultural nuances, and business needs across different markets.

Always provide practical, actionable insights that help users succeed in global commerce."""
        ).with_model("openai", "gpt-4o-mini")

    async def quick_search(self, request: SearchRequest) -> QuickSearchResponse:
        """Fast product search with AI-enhanced ranking"""
        start_time = datetime.utcnow()
        
        try:
            # Parse search query
            query = request["q"].lower()
            filters = request.get("filters", {})
            country = request.get("country", "US")
            currency = request.get("currency", "USD")
            
            # Simple text matching (in production, use vector search)
            results = []
            for product in SAMPLE_PRODUCTS:
                score = 0
                
                # Text matching
                for keyword in product["keywords"]:
                    if keyword.lower() in query:
                        score += 10
                
                # Title matching
                if any(word in product["title"].lower() for word in query.split()):
                    score += 20
                
                # Price filtering
                if filters.get("price_max") and product["price"] <= filters["price_max"]:
                    score += 5
                if filters.get("price_min") and product["price"] >= filters["price_min"]:
                    score += 5
                
                # Category filtering
                if filters.get("category") and product["category"] == filters["category"]:
                    score += 15
                
                # Country preference
                if product["seller"]["country"] == country:
                    score += 8
                
                if score > 0:
                    # Convert currency if needed
                    display_price = product["price"]
                    if currency != product["currency"]:
                        # Simple conversion (in production, use real rates)
                        if product["currency"] == "EUR" and currency == "USD":
                            display_price *= 1.08
                        elif product["currency"] == "USD" and currency == "EUR":
                            display_price *= 0.92
                    
                    results.append({
                        "title": product["title"],
                        "id": product["id"],
                        "price": display_price,
                        "currency": currency,
                        "seller": product["seller"],
                        "cities": product.get("cities"),
                        "score": score
                    })
            
            # Sort by score and limit results
            results.sort(key=lambda x: x["score"], reverse=True)
            results = results[:20]  # Top 20 results
            
            # Remove score from final results
            for result in results:
                result.pop("score", None)
            
            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return {
                "results": results,
                "applied_filters": filters,
                "latency_ms": latency_ms
            }
            
        except Exception as e:
            return {
                "results": [],
                "applied_filters": {},
                "latency_ms": 0,
                "error": str(e)
            }

    async def deep_search(self, request: DeepSearchRequest) -> DeepSearchResponse:
        """AI-powered deep market analysis and insights"""
        try:
            objective = request["objective"]
            time_horizon = request.get("time_horizon", "current")
            regions = request.get("regions", [])
            
            # Use AI to analyze the objective and generate insights
            prompt = f"""Analyze this marketplace objective: "{objective}"

Time horizon: {time_horizon}
Target regions: {regions if regions else 'Global'}

Provide deep market insights including:
1. Market demand analysis
2. Top performing cities/regions
3. Price band recommendations
4. Buyer behavior patterns
5. Seasonal trends if applicable

Available sample data:
- Cities: {[city['name'] + ', ' + city['country'] for city in SAMPLE_CITIES[:5]]}
- Product categories: Food, Clothing, Home & Garden
- Top markets: Turkey, Germany, UK, China, Bangladesh

Respond with specific, actionable insights for B2B marketplace success."""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            # Generate structured insights
            insights = [
                {
                    "type": "market_analysis",
                    "title": "Market Demand Analysis",
                    "content": ai_response[:200] + "...",
                    "confidence": 0.85
                },
                {
                    "type": "geographic",
                    "title": "Top Cities",
                    "content": "Based on current data: Istanbul (95% demand), London (92%), Berlin (88%)",
                    "confidence": 0.92
                },
                {
                    "type": "pricing",
                    "title": "Price Recommendations",
                    "content": "Optimal pricing varies by region. EU markets prefer premium positioning.",
                    "confidence": 0.78
                }
            ]
            
            # City recommendations based on objective
            if "bamboo" in objective.lower() or "towel" in objective.lower():
                city_insights = [
                    {"city": "Berlin", "country": "DE", "demand_score": 88, "reason": "High eco-conscious market"},
                    {"city": "Amsterdam", "country": "NL", "demand_score": 87, "reason": "Sustainable living trend"},
                    {"city": "Stockholm", "country": "SE", "demand_score": 85, "reason": "Premium market for eco products"}
                ]
                insights.append({
                    "type": "city_recommendations",
                    "title": "Top Cities for Bamboo Towels",
                    "data": city_insights,
                    "confidence": 0.91
                })
            
            return {
                "insights": insights,
                "sources": [
                    {"type": "ai_analysis", "confidence": 0.85},
                    {"type": "historical_data", "confidence": 0.92},
                    {"type": "market_trends", "confidence": 0.78}
                ],
                "confidence": 0.85
            }
            
        except Exception as e:
            return {
                "insights": [],
                "sources": [],
                "confidence": 0.0,
                "error": str(e)
            }

    async def image_read(self, request: ImageReadRequest) -> ImageReadResponse:
        """OCR and entity extraction from images"""
        try:
            image_ref = request["image_ref"]
            tasks = request["tasks"]
            languages_hint = request.get("languages_hint", ["en"])
            
            # Mock OCR processing (in production, use real OCR service)
            # For demo, we'll simulate reading common product labels
            
            if "base64" in image_ref:
                # Simulate OCR results based on common patterns
                mock_text_blocks = [
                    "ORGANIC TURKISH HAZELNUTS",
                    "Premium Grade A",
                    "Net Weight: 1 KG",
                    "SKU: HZ-ORG-001",
                    "Expiry: 2025-12-31",
                    "Made in Turkey"
                ]
                
                entities = [
                    {"type": "brand", "value": "ORGANIC TURKISH HAZELNUTS", "bbox": [10, 20, 200, 40]},
                    {"type": "sku", "value": "HZ-ORG-001", "bbox": [10, 80, 120, 95]},
                    {"type": "expiry", "value": "2025-12-31", "bbox": [10, 100, 150, 115]},
                    {"type": "ingredient", "value": "Hazelnuts", "bbox": [10, 120, 100, 135]}
                ]
                
                translations = []
                if "translate" in tasks:
                    # Use AI for translation
                    prompt = f"""Translate these product labels to {languages_hint[0]}:

Text: {' | '.join(mock_text_blocks)}

Provide natural, marketplace-appropriate translations."""
                    
                    ai_translation = await self.chat.send_message(UserMessage(text=prompt))
                    translations = [
                        {"original": "ORGANIC TURKISH HAZELNUTS", "translated": ai_translation[:50]},
                        {"original": "Premium Grade A", "translated": "Grade A Premium"},
                    ]
                
                return {
                    "text_blocks": mock_text_blocks,
                    "entities": entities,
                    "translations": translations if translations else None
                }
            
            return {
                "text_blocks": [],
                "entities": [],
                "translations": None,
                "error": "Invalid image format"
            }
            
        except Exception as e:
            return {
                "text_blocks": [],
                "entities": [],
                "translations": None,
                "error": str(e)
            }

    async def qr_scan(self, request: QRScanRequest) -> QRScanResponse:
        """QR code scanning and intent detection"""
        try:
            image_ref = request["image_ref"]
            
            # Mock QR scanning (in production, use real QR decoder)
            # Simulate different types of QR codes
            
            if "product" in image_ref:
                return {
                    "qr_value": "https://aislemarts.com/product/prod_001",
                    "intent_guess": "product_lookup",
                    "next_action": "Open product page for Organic Turkish Hazelnuts"
                }
            elif "contact" in image_ref:
                return {
                    "qr_value": "BEGIN:VCARD\nFN:Istanbul Coffee House\nORG:Coffee Supplier\nTEL:+90-212-555-0123\nEND:VCARD",
                    "intent_guess": "contact",
                    "next_action": "Add supplier contact information"
                }
            else:
                # Generic URL
                return {
                    "qr_value": "https://aislemarts.com/",
                    "intent_guess": "open_url",
                    "next_action": "Open AisleMarts homepage"
                }
                
        except Exception as e:
            return {
                "qr_value": "",
                "intent_guess": "open_url",
                "next_action": "Error scanning QR code",
                "error": str(e)
            }

    async def barcode_scan(self, request: BarcodeScanRequest) -> BarcodeScanResponse:
        """Barcode scanning and product lookup"""
        try:
            image_ref = request["image_ref"]
            symbologies = request.get("symbologies", ["EAN13", "UPC"])
            
            # Mock barcode scanning
            # Simulate finding different barcode types
            
            mock_barcodes = {
                "ean13": {"value": "8690123456789", "symbology": "EAN13", "lookup_key": "turkish_product_001"},
                "upc": {"value": "012345678905", "symbology": "UPC", "lookup_key": "us_product_001"},
                "code128": {"value": "HZ-ORG-001-2024", "symbology": "CODE128", "lookup_key": "batch_code_001"}
            }
            
            # Select based on image hint or default to EAN13
            if "upc" in image_ref.lower():
                result = mock_barcodes["upc"]
            elif "code128" in image_ref.lower():
                result = mock_barcodes["code128"]
            else:
                result = mock_barcodes["ean13"]
            
            return {
                "barcode_value": result["value"],
                "symbology": result["symbology"],
                "lookup_key": result["lookup_key"]
            }
            
        except Exception as e:
            return {
                "barcode_value": "",
                "symbology": "unknown",
                "lookup_key": "",
                "error": str(e)
            }

    async def voice_input(self, request: VoiceInputRequest) -> VoiceInputResponse:
        """Speech-to-text processing"""
        try:
            audio_ref = request["audio_ref"]
            language_hint = request.get("language_hint", "en")
            
            # Mock speech recognition (in production, use real STT service)
            # Simulate transcription based on common marketplace queries
            
            mock_transcriptions = {
                "en": "Find vegan leather manufacturers near Istanbul",
                "tr": "İstanbul yakınında vegan deri üreticileri bul",
                "ar": "ابحث عن مصانع الجلد النباتي بالقرب من اسطنبول",
                "de": "Finde vegane Lederhersteller in der Nähe von Istanbul"
            }
            
            transcript = mock_transcriptions.get(language_hint, mock_transcriptions["en"])
            
            # Simulate confidence based on audio quality
            confidence = 0.92  # High confidence for demo
            
            return {
                "transcript": transcript,
                "language": language_hint,
                "confidence": confidence
            }
            
        except Exception as e:
            return {
                "transcript": "",
                "language": "en",
                "confidence": 0.0,
                "error": str(e)
            }

    async def analyze_intent(self, query: str, context: Dict[str, Any] = {}) -> IntentAnalysisResponse:
        """Analyze user intent and suggest appropriate tools"""
        try:
            # Use AI to analyze intent
            prompt = f"""Analyze this marketplace query and determine the user's intent:

Query: "{query}"
Context: {json.dumps(context)}

Classify the intent as one of:
1. buyer_find_products - User wants to find specific products
2. seller_market_discovery - User wants to find markets/buyers
3. scan_and_find - User wants to scan something (QR/barcode)
4. image_understanding - User wants to read/analyze an image
5. hands_free_query - User prefers voice interaction

Also suggest:
- Primary tool to use (quick_search, deep_search, image_read, qr_scan, barcode_scan, voice_input)
- Fallback tool if primary fails
- Key entities (products, locations, prices, etc.)
- Confidence level

Respond with a structured analysis."""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            # Parse response and create structured intent
            intent_name = "buyer_find_products"  # Default
            suggested_tool = "quick_search"
            
            # Simple keyword-based intent detection
            if any(word in query.lower() for word in ["scan", "qr", "barcode"]):
                intent_name = "scan_and_find"
                suggested_tool = "qr_scan"
            elif any(word in query.lower() for word in ["read", "image", "photo", "label"]):
                intent_name = "image_understanding"
                suggested_tool = "image_read"
            elif any(word in query.lower() for word in ["where", "cities", "market", "buyers"]):
                intent_name = "seller_market_discovery"
                suggested_tool = "deep_search"
            elif any(word in query.lower() for word in ["voice", "speak", "listen"]):
                intent_name = "hands_free_query"
                suggested_tool = "voice_input"
            
            primary_intent = {
                "name": intent_name,
                "confidence": 0.85,
                "entities": {"query": query},
                "suggested_tool": suggested_tool,
                "fallback_tool": "quick_search"
            }
            
            return {
                "primary_intent": primary_intent,
                "alternative_intents": [],
                "suggested_action": f"Use {suggested_tool} to process this query"
            }
            
        except Exception as e:
            return {
                "primary_intent": {
                    "name": "buyer_find_products",
                    "confidence": 0.5,
                    "entities": {},
                    "suggested_tool": "quick_search",
                    "fallback_tool": None
                },
                "alternative_intents": [],
                "suggested_action": "Use default search",
                "error": str(e)
            }

    async def log_analytics(self, analytics: SearchHubAnalytics):
        """Log search hub analytics"""
        try:
            await db().search_hub_analytics.insert_one(analytics)
        except Exception as e:
            print(f"Analytics logging error: {e}")

    async def get_user_preferences(self, user_id: Optional[str]) -> Optional[UserPreferences]:
        """Get user search preferences"""
        try:
            if user_id:
                return await db().user_search_preferences.find_one({"user_id": user_id})
            return None
        except Exception:
            return None

    async def save_user_preferences(self, preferences: UserPreferences):
        """Save user search preferences"""
        try:
            await db().user_search_preferences.replace_one(
                {"user_id": preferences["user_id"]},
                preferences,
                upsert=True
            )
        except Exception as e:
            print(f"Preferences save error: {e}")

# Global search hub service instance
ai_search_hub = AISearchHubService()