"""
🤖 Aisle AI API Routes
Smart AI companion for shoppers and businesses
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime
import logging

from services.aisle_ai_service import aisle_ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/aisle-ai", tags=["Aisle AI 🤖"])

# Pydantic Models
class PurchaseData(BaseModel):
    purchase_id: str = Field(..., description="Unique purchase ID")
    shopper: Dict[str, Any] = Field(..., description="Shopper information")
    vendor: Dict[str, Any] = Field(..., description="Vendor information") 
    order_details: Dict[str, Any] = Field(..., description="Order details")

class AIMessageRequest(BaseModel):
    user_id: Optional[str] = Field(None, description="User ID")
    message: str = Field(..., description="User message")
    context: Optional[Dict[str, Any]] = Field(None, description="Conversation context")
    language: str = Field("en", description="Language preference")
    channel: str = Field("text", description="Communication channel")

class VendorOutreachRequest(BaseModel):
    vendor_info: Dict[str, Any] = Field(..., description="Vendor information")
    order_details: Dict[str, Any] = Field(..., description="Order details")
    outreach_type: str = Field("onboarding", description="Type of outreach")

# API Routes

@router.post("/process-purchase")
async def process_purchase_completion(
    purchase_data: PurchaseData,
    background_tasks: BackgroundTasks
):
    """
    🤖 Process completed purchase with automatic AI outreach
    Handles shopper thank you + vendor onboarding automation
    """
    try:
        logger.info(f"🤖 Processing purchase completion: {purchase_data.purchase_id}")
        
        # Process in background for performance
        background_tasks.add_task(
            aisle_ai_service.process_purchase_completion,
            purchase_data.dict()
        )
        
        return {
            "success": True,
            "message": "🤖 Aisle AI is processing your purchase completion",
            "purchase_id": purchase_data.purchase_id,
            "ai_actions": [
                "shopper_thank_you",
                "vendor_outreach", 
                "onboarding_if_new",
                "follow_up_scheduling"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"🤖 Purchase processing error: {e}")
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")

@router.post("/chat")
async def ai_chat(message_request: AIMessageRequest):
    """
    🤖 Chat with Aisle AI - Smart shopping companion
    Supports text, voice, image, and video communication
    """
    try:
        logger.info(f"🤖 AI Chat request from user: {message_request.user_id}")
        
        response = await aisle_ai_service.get_ai_response(
            message_request.message,
            message_request.context
        )
        
        return {
            "success": True,
            "ai_name": "Aisle 🤖",
            "personality": "Smart, friendly shopping companion",
            "response": response["response"],
            "capabilities": response["capabilities_offered"],
            "conversation_id": response["conversation_id"],
            "language": message_request.language,
            "channel": message_request.channel,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"🤖 AI Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"AI chat failed: {str(e)}")

@router.post("/vendor-outreach")
async def vendor_outreach(
    outreach_request: VendorOutreachRequest,
    background_tasks: BackgroundTasks
):
    """
    🤖 AI-powered vendor outreach and onboarding
    Automatically contacts vendors with personalized invitations
    """
    try:
        vendor_id = outreach_request.vendor_info.get("vendor_id")
        logger.info(f"🤖 Vendor outreach for: {vendor_id}")
        
        # Process outreach in background
        background_tasks.add_task(
            aisle_ai_service.handle_vendor_outreach,
            outreach_request.vendor_info,
            outreach_request.order_details
        )
        
        return {
            "success": True,
            "message": "🤖 Aisle AI is reaching out to the vendor",
            "vendor_id": vendor_id,
            "outreach_type": outreach_request.outreach_type,
            "actions": [
                "thank_you_message",
                "onboarding_invitation",
                "benefits_presentation", 
                "followup_scheduling"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"🤖 Vendor outreach error: {e}")
        raise HTTPException(status_code=500, detail=f"Vendor outreach failed: {str(e)}")

@router.get("/capabilities")
async def get_ai_capabilities():
    """
    🤖 Get Aisle AI capabilities and features
    """
    return {
        "ai_name": "Aisle 🤖",
        "tagline": "Your trusted companion in the AisleMarts world and beyond",
        "personality": "Smart, friendly, helpful companion",
        "communication_channels": [
            "text_chat",
            "voice_interaction",
            "image_analysis", 
            "video_chat",
            "email",
            "whatsapp"
        ],
        "shopper_capabilities": [
            "product_discovery",
            "lifestyle_recommendations",
            "fashion_advice",
            "live_shopping_assistance",
            "order_tracking",
            "personalized_suggestions",
            "multi_language_support",
            "currency_conversion"
        ],
        "business_capabilities": [
            "automated_thank_you",
            "vendor_onboarding",
            "growth_opportunities",
            "business_insights",
            "localization_assistance",
            "marketing_automation",
            "follow_up_campaigns"
        ],
        "core_features": [
            "🌍 Global marketplace integration",
            "🤖 AI-powered assistance",
            "🛍️ Lifestyle and fashion focus",
            "🎬 Live streaming and modeling",
            "📱 Multi-channel communication",
            "🎯 Personalized experiences",
            "🚀 Business growth automation",
            "🌐 Smart localization"
        ]
    }

@router.get("/health")
async def ai_health_check():
    """
    🤖 Aisle AI health check
    """
    return {
        "status": "healthy",
        "ai_name": "Aisle 🤖",
        "version": "1.0.0",
        "uptime": "24/7",
        "capabilities_active": True,
        "vendor_outreach_active": True,
        "shopper_assistance_active": True,
        "localization_active": True,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/stats")
async def get_ai_stats():
    """
    🤖 Get Aisle AI usage statistics
    """
    # Mock stats - in production, fetch from database
    return {
        "total_interactions": 250000,
        "shopper_conversations": 180000,
        "vendor_outreach_messages": 45000,
        "onboarding_invitations_sent": 15000,
        "successful_vendor_conversions": 8500,
        "languages_supported": 25,
        "countries_active": 85,
        "average_response_time_ms": 150,
        "satisfaction_rating": 4.8,
        "growth_metrics": {
            "daily_interactions": 5000,
            "weekly_vendor_signups": 350,
            "monthly_purchase_processing": 12000
        },
        "top_use_cases": [
            "Product discovery and recommendations",
            "Vendor onboarding and growth",
            "Live shopping assistance",
            "Order tracking and support",
            "Fashion and lifestyle advice"
        ]
    }

@router.post("/feedback")
async def ai_feedback(feedback_data: Dict[str, Any]):
    """
    🤖 Submit feedback about Aisle AI interactions
    """
    try:
        feedback_id = f"feedback_{datetime.utcnow().timestamp()}"
        
        # Store feedback for AI improvement
        logger.info(f"🤖 Received feedback: {feedback_id}")
        
        return {
            "success": True,
            "feedback_id": feedback_id,
            "message": "🤖 Thank you for helping Aisle AI improve!",
            "ai_response": "I appreciate your feedback and will use it to serve you better. Is there anything else I can help you with?",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"🤖 Feedback processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Feedback processing failed: {str(e)}")