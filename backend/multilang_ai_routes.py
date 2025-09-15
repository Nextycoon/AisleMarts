from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from multilang_ai_service import multilang_ai_service
from security import get_current_user_optional
from datetime import datetime

router = APIRouter(prefix="/api/multilang", tags=["Multi-Language AI"])

class MultiLangChatRequest(BaseModel):
    message: str
    language: str = 'en'
    user_name: Optional[str] = None
    time_of_day: Optional[str] = None
    context: Optional[dict] = None

class LanguageGreetingRequest(BaseModel):
    language: str = 'en'
    user_name: Optional[str] = None
    time_of_day: Optional[str] = None

class CategoryTranslationRequest(BaseModel):
    category: str
    target_language: str = 'en'

@router.post("/chat")
async def multilang_chat(
    chat_request: MultiLangChatRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Chat with AI in multiple languages with cultural context"""
    try:
        # Prepare user context
        user_context = chat_request.context or {}
        
        if current_user:
            user_context.update({
                'user_id': current_user.get('user_id'),
                'user_name': chat_request.user_name or current_user.get('username', 'User')
            })
        
        # Get AI response in requested language
        response = await multilang_ai_service.get_ai_response(
            user_message=chat_request.message,
            language=chat_request.language,
            user_context=user_context
        )
        
        return {
            "success": True,
            "ai_response": response,
            "request_language": chat_request.language,
            "supported_languages": list(multilang_ai_service.supported_languages.keys()),
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-language chat error: {str(e)}")

@router.post("/greeting")
async def get_localized_greeting(greeting_request: LanguageGreetingRequest):
    """Get culturally appropriate greeting in specified language"""
    try:
        greeting_response = await multilang_ai_service.get_localized_greeting(
            language=greeting_request.language,
            user_name=greeting_request.user_name,
            time_of_day=greeting_request.time_of_day
        )
        
        return {
            "success": True,
            "localized_greeting": greeting_response,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greeting generation error: {str(e)}")

@router.post("/translate-category")
async def translate_category(translation_request: CategoryTranslationRequest):
    """Translate product category to target language"""
    try:
        translated_category = await multilang_ai_service.translate_category(
            category=translation_request.category,
            target_language=translation_request.target_language
        )
        
        return {
            "success": True,
            "original_category": translation_request.category,
            "translated_category": translated_category,
            "target_language": translation_request.target_language,
            "language_name": multilang_ai_service.supported_languages.get(
                translation_request.target_language, 
                'English'
            )
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Category translation error: {str(e)}")

@router.get("/languages")
async def get_supported_languages():
    """Get list of all supported languages with cultural details"""
    try:
        languages_info = await multilang_ai_service.get_supported_languages()
        
        return {
            "success": True,
            "languages_info": languages_info,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Languages info error: {str(e)}")

@router.get("/test-languages")
async def test_all_languages():
    """Test AI responses in all supported languages"""
    try:
        test_message = "I'm looking for electronics"
        test_results = {}
        
        for lang_code, lang_name in multilang_ai_service.supported_languages.items():
            try:
                response = await multilang_ai_service.get_ai_response(
                    user_message=test_message,
                    language=lang_code,
                    user_context={'test_mode': True}
                )
                
                test_results[lang_code] = {
                    "language_name": lang_name,
                    "response_preview": response["response"][:100] + "..." if len(response["response"]) > 100 else response["response"],
                    "cultural_style": response["cultural_style"],
                    "status": "success"
                }
                
            except Exception as lang_error:
                test_results[lang_code] = {
                    "language_name": lang_name,
                    "status": "error",
                    "error": str(lang_error)
                }
        
        # Calculate success rate
        successful_languages = len([r for r in test_results.values() if r["status"] == "success"])
        total_languages = len(test_results)
        success_rate = (successful_languages / total_languages) * 100
        
        return {
            "success": True,
            "test_message": test_message,
            "test_results": test_results,
            "summary": {
                "total_languages": total_languages,
                "successful_languages": successful_languages,
                "success_rate": f"{success_rate:.1f}%",
                "failed_languages": [code for code, result in test_results.items() if result["status"] == "error"]
            },
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Language testing error: {str(e)}")

@router.get("/cultural-context/{language}")
async def get_cultural_context(language: str):
    """Get cultural context information for a specific language"""
    try:
        if language not in multilang_ai_service.supported_languages:
            raise HTTPException(
                status_code=404,
                detail=f"Language '{language}' not supported. Supported languages: {list(multilang_ai_service.supported_languages.keys())}"
            )
        
        cultural_info = multilang_ai_service.cultural_context[language]
        
        # Get sample greeting
        greeting_sample = await multilang_ai_service.get_localized_greeting(
            language=language,
            user_name="Customer",
            time_of_day="morning"
        )
        
        # Get sample category translations
        sample_categories = {}
        for category in ['Electronics', 'Fashion', 'Beauty']:
            translated = await multilang_ai_service.translate_category(category, language)
            sample_categories[category] = translated
        
        return {
            "success": True,
            "language": language,
            "language_name": multilang_ai_service.supported_languages[language],
            "cultural_context": cultural_info,
            "sample_greeting": greeting_sample,
            "sample_category_translations": sample_categories,
            "shopping_recommendations": {
                "communication_tips": f"Use {cultural_info['style']} communication style",
                "cultural_notes": cultural_info['cultural_notes'],
                "preferred_approach": multilang_ai_service._get_cultural_shopping_preferences(language)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cultural context error: {str(e)}")

@router.post("/demo/conversation")
async def demo_multilang_conversation(
    language: str = 'sw',
    user_name: str = 'Amina'
):
    """Demo a complete conversation flow in specified language"""
    try:
        conversation_flow = []
        
        # Step 1: Greeting
        greeting = await multilang_ai_service.get_localized_greeting(
            language=language,
            user_name=user_name,
            time_of_day="afternoon"
        )
        
        conversation_flow.append({
            "step": 1,
            "type": "greeting",
            "content": greeting
        })
        
        # Step 2: Product inquiry
        inquiry_response = await multilang_ai_service.get_ai_response(
            user_message="I need a phone for my business",
            language=language,
            user_context={'user_name': user_name, 'country': 'Kenya'}
        )
        
        conversation_flow.append({
            "step": 2,
            "type": "product_inquiry",
            "user_message": "I need a phone for my business",
            "ai_response": inquiry_response
        })
        
        # Step 3: Category exploration
        category_help = await multilang_ai_service.get_ai_response(
            user_message="What electronics do you recommend?",
            language=language,
            user_context={'user_name': user_name, 'previous_interest': 'phones'}
        )
        
        conversation_flow.append({
            "step": 3,
            "type": "category_exploration",
            "user_message": "What electronics do you recommend?",
            "ai_response": category_help
        })
        
        # Step 4: Price inquiry
        price_help = await multilang_ai_service.get_ai_response(
            user_message="What are the prices like?",
            language=language,
            user_context={'user_name': user_name, 'currency': 'KES', 'country': 'Kenya'}
        )
        
        conversation_flow.append({
            "step": 4,
            "type": "price_inquiry",
            "user_message": "What are the prices like?",
            "ai_response": price_help
        })
        
        return {
            "success": True,
            "demo_language": language,
            "language_name": multilang_ai_service.supported_languages[language],
            "demo_user": user_name,
            "conversation_flow": conversation_flow,
            "cultural_notes": multilang_ai_service.cultural_context[language]['cultural_notes'],
            "communication_style": multilang_ai_service.cultural_context[language]['style']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo conversation error: {str(e)}")

@router.get("/health")
async def multilang_health_check():
    """Health check for multi-language AI service"""
    return {
        "status": "healthy",
        "service": "multilang_ai_service",
        "supported_languages": list(multilang_ai_service.supported_languages.keys()),
        "total_languages": len(multilang_ai_service.supported_languages),
        "cultural_adaptation": "enabled",
        "ai_backend": "emergent_llm",
        "features": [
            "multi_language_chat",
            "cultural_greetings", 
            "category_translation",
            "cultural_context_awareness",
            "region_specific_recommendations"
        ],
        "timestamp": datetime.utcnow()
    }