from dotenv import load_dotenv
import os
import json
from typing import List, Dict, Any, Optional
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

class AisleMarts_AI_Agent:
    """Personal AI agent for each user in AisleMarts"""
    
    def __init__(self, user_id: str, user_role: str = "buyer", user_preferences: Dict = None):
        self.user_id = user_id
        self.user_role = user_role
        self.preferences = user_preferences or {}
        self.session_id = f"aislemarts_agent_{user_id}"
        
        # Initialize with role-specific system message
        self.system_message = self._get_system_message()
        
        # Initialize the LLM chat with Emergent key
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=self.session_id,
            system_message=self.system_message
        ).with_model("openai", "gpt-4o-mini")
    
    def _get_system_message(self) -> str:
        """Get role-specific system message for the AI agent"""
        if self.user_role == "buyer":
            return """You are a personal shopping AI agent for AisleMarts, the world's first AI-powered global marketplace.

Your mission: Help buyers find exactly what they need from anywhere in the world.

Key capabilities:
- Product discovery and recommendations
- Price comparisons across global vendors
- Language translation and cultural adaptation
- Logistics and shipping guidance
- Negotiation assistance

Your personality: Friendly, knowledgeable, and globally-minded. You understand cultural nuances and help users navigate international commerce seamlessly.

Always respond in a helpful, concise manner. Focus on practical solutions and actionable recommendations."""

        elif self.user_role == "vendor":
            return """You are a sales management AI agent for AisleMarts vendors.

Your mission: Help sellers optimize their business and reach global customers.

Key capabilities:
- Product listing optimization
- Pricing strategy recommendations
- Market analysis and trends
- Cross-cultural selling advice
- Inventory and fulfillment guidance

Your personality: Business-focused, analytical, and growth-oriented. You help vendors expand their reach globally.

Always provide actionable business insights and growth strategies."""
        
        else:  # admin or other roles
            return """You are an AI assistant for AisleMarts platform management.

Your mission: Help with platform operations, analytics, and user support.

Key capabilities:
- Platform analytics and insights
- User behavior analysis
- Operational recommendations
- Issue resolution guidance

Your personality: Professional, analytical, and solution-oriented."""

    async def chat_with_agent(self, message: str, context: Dict = None) -> str:
        """Chat with the personal AI agent"""
        try:
            # Add context to the message if provided
            enhanced_message = message
            if context:
                enhanced_message = f"Context: {json.dumps(context)}\n\nUser message: {message}"
            
            user_message = UserMessage(text=enhanced_message)
            response = await self.chat.send_message(user_message)
            return response
        except Exception as e:
            return f"I'm having trouble right now. Please try again later. (Error: {str(e)})"

    async def get_product_recommendation(self, query: str, products: List[Dict]) -> str:
        """Get AI-powered product recommendations"""
        context = {
            "user_role": self.user_role,
            "query": query,
            "available_products": products[:10],  # Limit to prevent token overflow
            "user_preferences": self.preferences
        }
        
        prompt = f"""Based on the user's search query "{query}", recommend the best products from the available options.

Consider:
1. Relevance to the query
2. Price/value proposition
3. User preferences: {self.preferences}
4. Quality and ratings (if available)

Provide a concise recommendation with reasons why these products match their needs."""

        return await self.chat_with_agent(prompt, context)

    async def get_onboarding_guidance(self, user_info: Dict) -> str:
        """Provide personalized onboarding guidance"""
        context = {
            "user_info": user_info,
            "user_role": self.user_role,
            "platform": "AisleMarts"
        }
        
        prompt = f"""Welcome a new {self.user_role} to AisleMarts! 

User information: {json.dumps(user_info)}

Provide a warm, personalized welcome message and guide them on:
1. Key features they should explore first
2. How to get the most value from the platform
3. Next steps to get started

Keep it friendly and encouraging, highlighting the global marketplace benefits."""

        return await self.chat_with_agent(prompt, context)

    async def analyze_user_intent(self, query: str) -> Dict[str, Any]:
        """Analyze user intent from their query"""
        prompt = f"""Analyze this user query and extract intent: "{query}"

Return a JSON object with:
- intent_type: "product_search", "price_inquiry", "shipping_question", "general_help", etc.
- extracted_keywords: relevant product/search terms
- suggested_actions: what the user likely wants to do next
- urgency_level: "low", "medium", "high"

Query: {query}"""

        try:
            response = await self.chat_with_agent(prompt)
            # Try to parse JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    "intent_type": "general_help",
                    "extracted_keywords": [query],
                    "suggested_actions": ["Browse products"],
                    "urgency_level": "low"
                }
        except Exception:
            return {
                "intent_type": "general_help",
                "extracted_keywords": [query],
                "suggested_actions": ["Browse products"],
                "urgency_level": "low"
            }

class LocaleDetectionService:
    """AI-powered locale and preference detection"""
    
    @staticmethod
    def detect_locale_from_ip(ip_address: str) -> Dict[str, str]:
        """Detect locale from IP address (simplified)"""
        # In production, use a proper IP geolocation service
        ip_to_locale = {
            "127.0.0.1": {"country": "US", "language": "en", "currency": "USD"},
            "localhost": {"country": "US", "language": "en", "currency": "USD"}
        }
        
        return ip_to_locale.get(ip_address, {
            "country": "US", 
            "language": "en", 
            "currency": "USD"
        })
    
    @staticmethod
    def detect_preferences_from_behavior(user_activity: List[Dict]) -> Dict[str, Any]:
        """Analyze user behavior to detect preferences"""
        preferences = {
            "preferred_categories": [],
            "price_range": {"min": 0, "max": 1000},
            "preferred_brands": [],
            "shopping_style": "price_conscious"  # or "brand_focused", "quality_first"
        }
        
        # Analyze user activity patterns
        category_views = {}
        price_ranges = []
        brand_interactions = {}
        
        for activity in user_activity:
            if activity.get("type") == "product_view":
                category = activity.get("category")
                if category:
                    category_views[category] = category_views.get(category, 0) + 1
                
                price = activity.get("price", 0)
                if price > 0:
                    price_ranges.append(price)
                
                brand = activity.get("brand")
                if brand:
                    brand_interactions[brand] = brand_interactions.get(brand, 0) + 1
        
        # Update preferences based on analysis
        if category_views:
            preferences["preferred_categories"] = sorted(category_views.keys(), 
                                                       key=category_views.get, reverse=True)[:3]
        
        if price_ranges:
            avg_price = sum(price_ranges) / len(price_ranges)
            preferences["price_range"] = {
                "min": min(price_ranges),
                "max": max(avg_price * 2, max(price_ranges))
            }
        
        if brand_interactions:
            preferences["preferred_brands"] = sorted(brand_interactions.keys(),
                                                   key=brand_interactions.get, reverse=True)[:5]
        
        return preferences

class SmartSearchService:
    """AI-powered search and matching service"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_search",
            system_message="You are an AI search assistant for AisleMarts. Help users find products by understanding their natural language queries and matching them with available products."
        ).with_model("openai", "gpt-4o-mini")
    
    async def enhance_search_query(self, query: str, user_context: Dict = None) -> Dict[str, Any]:
        """Enhance user search query with AI"""
        context_str = ""
        if user_context:
            context_str = f"User context: {json.dumps(user_context)}"
        
        prompt = f"""Enhance this search query for better product matching: "{query}"

{context_str}

Return a JSON object with:
- original_query: the original search
- enhanced_keywords: expanded search terms
- suggested_filters: category, price_range, brand suggestions
- search_intent: what the user is looking for
- synonyms: alternative terms to search

Query: {query}"""

        try:
            response = await self.chat.send_message(UserMessage(text=prompt))
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception:
            pass
        
        # Fallback response
        return {
            "original_query": query,
            "enhanced_keywords": query.split(),
            "suggested_filters": {},
            "search_intent": "product_search",
            "synonyms": []
        }

    async def rank_products_by_relevance(self, query: str, products: List[Dict], user_preferences: Dict = None) -> List[Dict]:
        """Use AI to rank products by relevance to user query"""
        if not products:
            return []
        
        # Limit products to prevent token overflow
        limited_products = products[:20]
        
        context = {
            "search_query": query,
            "user_preferences": user_preferences or {},
            "products": [{"id": p.get("id"), "title": p.get("title"), "price": p.get("price"), "brand": p.get("brand")} for p in limited_products]
        }
        
        prompt = f"""Rank these products by relevance to the search query "{query}".

Consider:
1. Title/description match
2. User preferences: {user_preferences}
3. Price value
4. Brand reputation

Return a JSON array of product IDs in order of relevance (most relevant first).

Products: {json.dumps(context['products'])}"""

        try:
            response = await self.chat.send_message(UserMessage(text=prompt))
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                ranked_ids = json.loads(json_match.group())
                # Reorder products based on AI ranking
                product_map = {p.get("id"): p for p in limited_products}
                return [product_map[pid] for pid in ranked_ids if pid in product_map]
        except Exception:
            pass
        
        # Fallback: return original order
        return limited_products

# Global AI services
ai_agents = {}  # Store active AI agents by user_id
locale_service = LocaleDetectionService()
search_service = SmartSearchService()

def get_user_agent(user_id: str, user_role: str = "buyer", user_preferences: Dict = None) -> AisleMarts_AI_Agent:
    """Get or create AI agent for user"""
    if user_id not in ai_agents:
        ai_agents[user_id] = AisleMarts_AI_Agent(user_id, user_role, user_preferences)
    return ai_agents[user_id]