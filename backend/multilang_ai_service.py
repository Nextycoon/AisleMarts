from typing import Dict, List, Optional
from ai_service import AisleMarts_AI_Agent
from localization_service import localization_service
from dotenv import load_dotenv
import os

load_dotenv()

class MultiLanguageAIService:
    def __init__(self):
        self.ai_agent = AisleMarts_AI_Agent("system", "assistant")
        self.supported_languages = {
            'en': 'English',
            'tr': 'Turkish',
            'ar': 'Arabic',
            'sw': 'Swahili',
            'fr': 'French'
        }
        
        # Cultural greetings and context for each language
        self.cultural_context = {
            'en': {
                'greeting': "Hello! Welcome to AisleMarts",
                'courtesy': "How may I assist you today?",
                'style': "friendly and professional",
                'cultural_notes': "Direct communication, efficiency valued"
            },
            'tr': {
                'greeting': "Merhaba! AisleMarts'a hoş geldiniz",
                'courtesy': "Size nasıl yardımcı olabilirim?",
                'style': "warm and respectful",
                'cultural_notes': "Value hospitality, family-oriented commerce"
            },
            'ar': {
                'greeting': "أهلاً وسهلاً! مرحباً بكم في آيل مارتس",
                'courtesy': "كيف يمكنني مساعدتكم اليوم؟",
                'style': "respectful and courteous",
                'cultural_notes': "Emphasis on respect, family values, Islamic business ethics"
            },
            'sw': {
                'greeting': "Hujambo! Karibu AisleMarts",
                'courtesy': "Ninawezaje kukusaidia leo?",
                'style': "warm and community-focused",
                'cultural_notes': "Ubuntu philosophy, community-oriented, family business culture"
            },
            'fr': {
                'greeting': "Bonjour! Bienvenue sur AisleMarts",
                'courtesy': "Comment puis-je vous aider aujourd'hui?",
                'style': "polite and sophisticated",
                'cultural_notes': "Appreciate formality, quality over quantity, refined taste"
            }
        }
        
        # Product categories translations
        self.category_translations = {
            'Electronics': {
                'en': 'Electronics',
                'tr': 'Elektronik',
                'ar': 'الإلكترونيات',
                'sw': 'Vifaa vya Elektroniki',
                'fr': 'Électronique'
            },
            'Fashion': {
                'en': 'Fashion',
                'tr': 'Moda',
                'ar': 'الأزياء',
                'sw': 'Mitindo',
                'fr': 'Mode'
            },
            'Home & Garden': {
                'en': 'Home & Garden',
                'tr': 'Ev ve Bahçe',
                'ar': 'المنزل والحديقة',
                'sw': 'Nyumba na Bustani',
                'fr': 'Maison et Jardin'
            },
            'Beauty': {
                'en': 'Beauty',
                'tr': 'Güzellik',
                'ar': 'الجمال',
                'sw': 'Uzuri',
                'fr': 'Beauté'
            },
            'Sports': {
                'en': 'Sports',
                'tr': 'Spor',
                'ar': 'الرياضة',
                'sw': 'Michezo',
                'fr': 'Sports'
            }
        }
    
    async def get_ai_response(self, user_message: str, language: str = 'en', user_context: dict = None) -> Dict:
        """Get AI response in specified language with cultural context"""
        try:
            # Validate language support
            if language not in self.supported_languages:
                language = 'en'  # Fallback to English
            
            # Get cultural context for the language
            cultural_info = self.cultural_context.get(language, self.cultural_context['en'])
            
            # Build culturally-aware prompt
            cultural_prompt = self._build_cultural_prompt(user_message, language, cultural_info, user_context)
            
            # Get AI response with cultural context
            ai_response = await self.ai_agent.chat_completion(cultural_prompt)
            
            # Add language-specific formatting
            formatted_response = self._format_response(ai_response, language, cultural_info)
            
            return {
                "response": formatted_response,
                "language": language,
                "language_name": self.supported_languages[language],
                "cultural_style": cultural_info['style'],
                "greeting_used": cultural_info['greeting'],
                "ai_confidence": 0.95,  # High confidence for supported languages
                "translation_quality": "native" if language == 'en' else "culturally_adapted"
            }
            
        except Exception as e:
            # Fallback response in requested language
            return await self._get_fallback_response(language, str(e))
    
    def _build_cultural_prompt(self, user_message: str, language: str, cultural_info: dict, user_context: dict = None) -> str:
        """Build culturally-aware prompt for AI"""
        
        language_name = self.supported_languages[language]
        
        prompt = f"""You are Aisle, the AI shopping assistant for AisleMarts. You are speaking with a user in {language_name}.

CULTURAL CONTEXT for {language_name}:
- Communication style: {cultural_info['style']}
- Cultural notes: {cultural_info['cultural_notes']}
- Greeting: "{cultural_info['greeting']}"
- Courtesy phrase: "{cultural_info['courtesy']}"

LANGUAGE REQUIREMENTS:
- Respond ONLY in {language_name}
- Use culturally appropriate expressions and idioms
- Maintain the {cultural_info['style']} communication style
- Include relevant cultural context in product recommendations

USER CONTEXT:
{self._format_user_context(user_context, language)}

USER MESSAGE: "{user_message}"

Provide helpful, culturally-sensitive assistance about shopping on AisleMarts. Keep responses concise but warm."""

        return prompt
    
    def _format_user_context(self, user_context: dict, language: str) -> str:
        """Format user context for cultural relevance"""
        if not user_context:
            return "New user, no previous context"
        
        context_parts = []
        
        if user_context.get('country'):
            context_parts.append(f"Location: {user_context['country']}")
        
        if user_context.get('currency'):
            context_parts.append(f"Currency: {user_context['currency']}")
            
        if user_context.get('previous_searches'):
            context_parts.append(f"Previous interests: {', '.join(user_context['previous_searches'])}")
        
        # Add cultural shopping preferences based on language/region
        cultural_prefs = self._get_cultural_shopping_preferences(language)
        if cultural_prefs:
            context_parts.append(f"Cultural preferences: {cultural_prefs}")
        
        return " | ".join(context_parts) if context_parts else "Standard user context"
    
    def _get_cultural_shopping_preferences(self, language: str) -> str:
        """Get cultural shopping preferences for different languages/regions"""
        preferences = {
            'tr': "Values quality, brand reputation, family-oriented products",
            'ar': "Halal products important, family values, traditional quality",
            'sw': "Community recommendations valued, practical products, value for money",
            'fr': "Appreciates craftsmanship, style, sophisticated products",
            'en': "Efficiency, convenience, diverse options"
        }
        
        return preferences.get(language, preferences['en'])
    
    def _format_response(self, ai_response: str, language: str, cultural_info: dict) -> str:
        """Format AI response with language-specific styling"""
        
        # Add cultural greeting if response doesn't start with one
        if not any(greeting in ai_response.lower() for greeting in ['hello', 'hi', 'hujambo', 'merhaba', 'bonjour', 'أهلاً']):
            greeting = cultural_info['greeting']
            ai_response = f"{greeting}! {ai_response}"
        
        # Add cultural sign-off based on language
        sign_offs = {
            'en': "Happy shopping! 🛍️",
            'tr': "Keyifli alışverişler! 🛍️",
            'ar': "تسوق سعيد! 🛍️",
            'sw': "Ununuzi mwema! 🛍️",
            'fr': "Bon shopping! 🛍️"
        }
        
        sign_off = sign_offs.get(language, sign_offs['en'])
        
        # Only add sign-off if response doesn't already end with similar sentiment
        if not any(end_phrase in ai_response.lower() for end_phrase in ['shopping', 'alışveriş', 'تسوق', 'ununuzi']):
            ai_response = f"{ai_response}\n\n{sign_off}"
        
        return ai_response
    
    async def _get_fallback_response(self, language: str, error: str) -> Dict:
        """Get fallback response when AI service fails"""
        
        fallback_messages = {
            'en': "I'm here to help you shop on AisleMarts! How can I assist you today?",
            'tr': "AisleMarts'ta alışverişinizde size yardımcı olmak için buradayım! Size nasıl yardımcı olabilirim?",
            'ar': "أنا هنا لمساعدتكم في التسوق على آيل مارتس! كيف يمكنني مساعدتكم اليوم؟",
            'sw': "Nipo hapa kukusaidia ununue katika AisleMarts! Ninawezaje kukusaidia leo?",
            'fr': "Je suis là pour vous aider à faire vos achats sur AisleMarts! Comment puis-je vous aider aujourd'hui?"
        }
        
        return {
            "response": fallback_messages.get(language, fallback_messages['en']),
            "language": language,
            "language_name": self.supported_languages.get(language, 'English'),
            "cultural_style": "friendly",
            "greeting_used": self.cultural_context.get(language, {}).get('greeting', 'Hello'),
            "ai_confidence": 0.8,
            "translation_quality": "fallback",
            "note": "Using fallback response due to service error"
        }
    
    async def translate_category(self, category: str, target_language: str) -> str:
        """Translate product category to target language"""
        
        if category in self.category_translations:
            return self.category_translations[category].get(
                target_language, 
                self.category_translations[category]['en']
            )
        
        return category  # Return original if no translation available
    
    async def get_localized_greeting(self, language: str, user_name: str = None, time_of_day: str = None) -> Dict:
        """Get localized greeting with cultural context"""
        
        cultural_info = self.cultural_context.get(language, self.cultural_context['en'])
        base_greeting = cultural_info['greeting']
        
        # Add time-based greetings
        time_greetings = {
            'en': {'morning': 'Good morning', 'afternoon': 'Good afternoon', 'evening': 'Good evening'},
            'tr': {'morning': 'Günaydın', 'afternoon': 'İyi öğleden sonra', 'evening': 'İyi akşamlar'},
            'ar': {'morning': 'صباح الخير', 'afternoon': 'مساء الخير', 'evening': 'مساء الخير'},
            'sw': {'morning': 'Habari za asubuhi', 'afternoon': 'Habari za mchana', 'evening': 'Habari za jioni'},
            'fr': {'morning': 'Bonjour', 'afternoon': 'Bon après-midi', 'evening': 'Bonsoir'}
        }
        
        if time_of_day and language in time_greetings:
            time_greeting = time_greetings[language].get(time_of_day, base_greeting)
        else:
            time_greeting = base_greeting
        
        # Personalize with name if provided
        if user_name:
            personalized_greeting = f"{time_greeting}, {user_name}!"
        else:
            personalized_greeting = f"{time_greeting}!"
        
        return {
            "greeting": personalized_greeting,
            "courtesy": cultural_info['courtesy'],
            "language": language,
            "language_name": self.supported_languages[language],
            "cultural_style": cultural_info['style'],
            "time_of_day": time_of_day
        }
    
    async def get_supported_languages(self) -> Dict:
        """Get list of supported languages with their details"""
        
        language_details = {}
        
        for code, name in self.supported_languages.items():
            cultural_info = self.cultural_context[code]
            language_details[code] = {
                "name": name,
                "greeting": cultural_info['greeting'],
                "style": cultural_info['style'],
                "sample_courtesy": cultural_info['courtesy'],
                "cultural_notes": cultural_info['cultural_notes']
            }
        
        return {
            "supported_count": len(self.supported_languages),
            "languages": language_details,
            "default_language": "en",
            "ai_confidence": "high",
            "cultural_adaptation": "enabled"
        }

# Initialize service
multilang_ai_service = MultiLanguageAIService()