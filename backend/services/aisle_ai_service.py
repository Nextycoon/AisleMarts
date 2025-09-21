"""
🤖 AisleMarts AI Service (Aisle AI)
Smart companion for shoppers and businesses with automated outreach
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
import httpx
import smtplib
# Email imports would be used in production
# from email.mime.text import MimeText
# from email.mime.multipart import MimeMultipart

load_dotenv()

logger = logging.getLogger(__name__)

class AisleAIService:
    def __init__(self):
        self.name = "Aisle 🤖"
        self.personality = "smart, friendly, helpful companion"
        self.capabilities = [
            "text_communication",
            "voice_interaction", 
            "image_analysis",
            "video_chat",
            "vendor_outreach",
            "business_automation",
            "localization",
            "lifestyle_recommendations"
        ]
        
    async def process_purchase_completion(self, purchase_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Automatically process completed purchases and handle vendor outreach
        """
        try:
            purchase_id = purchase_data.get("purchase_id")
            shopper_info = purchase_data.get("shopper")
            vendor_info = purchase_data.get("vendor")
            order_details = purchase_data.get("order_details")
            
            logger.info(f"🤖 Aisle AI processing purchase: {purchase_id}")
            
            # Step 1: Send thank you to shopper
            shopper_response = await self.send_shopper_thank_you(shopper_info, order_details)
            
            # Step 2: Contact vendor with thank you + onboarding if needed
            vendor_response = await self.handle_vendor_outreach(vendor_info, order_details)
            
            # Step 3: Update internal systems
            await self.update_purchase_tracking(purchase_id, shopper_response, vendor_response)
            
            return {
                "success": True,
                "purchase_id": purchase_id,
                "shopper_contacted": shopper_response["success"],
                "vendor_contacted": vendor_response["success"],
                "onboarding_sent": vendor_response.get("onboarding_sent", False),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"🤖 Aisle AI purchase processing error: {e}")
            return {"success": False, "error": str(e)}
    
    async def send_shopper_thank_you(self, shopper_info: Dict, order_details: Dict) -> Dict[str, Any]:
        """
        Send personalized thank you message to shopper
        """
        try:
            name = shopper_info.get("name", "Valued Shopper")
            email = shopper_info.get("email")
            phone = shopper_info.get("phone")
            language = shopper_info.get("language", "en")
            
            # Localize message
            message = await self.localize_message("shopper_thank_you", language, {
                "name": name,
                "order_total": order_details.get("total"),
                "currency": order_details.get("currency"),
                "items_count": len(order_details.get("items", []))
            })
            
            # Send via preferred channel
            if email:
                await self.send_email(email, message["subject"], message["body"])
            if phone:
                await self.send_whatsapp(phone, message["whatsapp_text"])
                
            return {"success": True, "channels_used": ["email", "whatsapp"]}
            
        except Exception as e:
            logger.error(f"🤖 Shopper thank you error: {e}")
            return {"success": False, "error": str(e)}
    
    async def handle_vendor_outreach(self, vendor_info: Dict, order_details: Dict) -> Dict[str, Any]:
        """
        Handle vendor outreach with thank you + onboarding if new vendor
        """
        try:
            vendor_id = vendor_info.get("vendor_id")
            business_name = vendor_info.get("business_name", "Business Owner")
            email = vendor_info.get("email")
            phone = vendor_info.get("phone")
            is_aislemarts_vendor = vendor_info.get("is_aislemarts_vendor", False)
            language = vendor_info.get("language", "en")
            
            # Step 1: Send thank you message
            thank_you_message = await self.localize_message("vendor_thank_you", language, {
                "business_name": business_name,
                "order_value": order_details.get("total"),
                "currency": order_details.get("currency"),
                "customer_name": order_details.get("customer_name")
            })
            
            response = {"success": True, "thank_you_sent": True, "onboarding_sent": False}
            
            # Step 2: If not AisleMarts vendor, send onboarding invitation
            if not is_aislemarts_vendor:
                onboarding_message = await self.generate_onboarding_invitation(
                    business_name, language, order_details
                )
                
                # Send onboarding via multiple channels
                if email:
                    await self.send_email(
                        email, 
                        onboarding_message["subject"], 
                        onboarding_message["body"]
                    )
                if phone:
                    await self.send_whatsapp(phone, onboarding_message["whatsapp_text"])
                
                response["onboarding_sent"] = True
                response["onboarding_link"] = onboarding_message["onboarding_link"]
                
                # Track for follow-up
                await self.schedule_vendor_followup(vendor_info, onboarding_message)
            
            # Always send thank you
            if email:
                await self.send_email(email, thank_you_message["subject"], thank_you_message["body"])
            if phone:
                await self.send_whatsapp(phone, thank_you_message["whatsapp_text"])
                
            return response
            
        except Exception as e:
            logger.error(f"🤖 Vendor outreach error: {e}")
            return {"success": False, "error": str(e)}
    
    async def generate_onboarding_invitation(self, business_name: str, language: str, order_details: Dict) -> Dict[str, Any]:
        """
        Generate personalized onboarding invitation for new vendors
        """
        try:
            # Generate unique onboarding link
            onboarding_link = f"https://aislemarts.com/vendor/onboard?ref=aisle_ai&business={business_name}"
            
            # Localize onboarding message
            message_data = {
                "business_name": business_name,
                "platform_name": "AisleMarts",
                "order_value": order_details.get("total"),
                "currency": order_details.get("currency"),
                "onboarding_link": onboarding_link,
                "benefits": await self.get_localized_benefits(language)
            }
            
            # Email version (detailed)
            email_body = await self.localize_message("vendor_onboarding_email", language, message_data)
            
            # WhatsApp version (concise)
            whatsapp_text = await self.localize_message("vendor_onboarding_whatsapp", language, message_data)
            
            return {
                "subject": f"🚀 Join AisleMarts - The Fastest Growing Sales Platform",
                "body": email_body,
                "whatsapp_text": whatsapp_text,
                "onboarding_link": onboarding_link,
                "benefits_highlighted": message_data["benefits"]
            }
            
        except Exception as e:
            logger.error(f"🤖 Onboarding invitation generation error: {e}")
            raise e
    
    async def get_localized_benefits(self, language: str) -> List[str]:
        """
        Get localized list of AisleMarts benefits for vendors
        """
        benefits_map = {
            "en": [
                "🌍 Global exposure to millions of shoppers",
                "🤖 AI-powered business insights and analytics", 
                "🗣️ Auto-localization (language, currency, culture)",
                "📦 Integrated logistics and supply chain",
                "🎬 Lifestyle & expo integration opportunities",
                "📈 Marketing, influencer, and live streaming tools",
                "🛡️ Secure payments and fraud protection",
                "📊 Real-time sales tracking and reporting",
                "🎯 Targeted advertising and promotions",
                "🤝 24/7 AI-powered customer support"
            ],
            "es": [
                "🌍 Exposición global a millones de compradores",
                "🤖 Análisis e insights de negocio impulsados por IA",
                "🗣️ Auto-localización (idioma, moneda, cultura)",
                "📦 Logística integrada y cadena de suministro",
                "🎬 Oportunidades de integración lifestyle y expo",
                "📈 Herramientas de marketing, influencers y streaming",
                "🛡️ Pagos seguros y protección contra fraude",
                "📊 Seguimiento y reportes de ventas en tiempo real",
                "🎯 Publicidad dirigida y promociones",
                "🤝 Soporte al cliente 24/7 impulsado por IA"
            ],
            "fr": [
                "🌍 Exposition mondiale à des millions d'acheteurs",
                "🤖 Insights business alimentés par l'IA",
                "🗣️ Auto-localisation (langue, devise, culture)",
                "📦 Logistique intégrée et chaîne d'approvisionnement",
                "🎬 Opportunités d'intégration lifestyle et expo",
                "📈 Outils marketing, influenceurs et streaming live",
                "🛡️ Paiements sécurisés et protection anti-fraude",
                "📊 Suivi des ventes et rapports en temps réel",
                "🎯 Publicité ciblée et promotions",
                "🤝 Support client 24/7 alimenté par l'IA"
            ]
        }
        
        return benefits_map.get(language, benefits_map["en"])
    
    async def localize_message(self, template_type: str, language: str, data: Dict) -> str:
        """
        Localize messages based on template type and language
        """
        templates = {
            "shopper_thank_you": {
                "en": {
                    "subject": "🛍️ Thank you for your AisleMarts purchase!",
                    "body": f"""Dear {data.get('name')},

Thank you for choosing AisleMarts! 🎉

Your order for {data.get('items_count')} items totaling {data.get('currency')} {data.get('order_total')} has been confirmed.

Aisle AI 🤖 is here to help with any questions about your order or to discover more amazing products!

Happy Shopping!
The AisleMarts Team""",
                    "whatsapp_text": f"🛍️ Hi {data.get('name')}! Thanks for your AisleMarts purchase of {data.get('currency')} {data.get('order_total')}. Aisle AI 🤖 is here to help! Happy shopping! 🎉"
                }
            },
            "vendor_thank_you": {
                "en": {
                    "subject": "🙏 Thank you for serving our AisleMarts customer!",
                    "body": f"""Dear {data.get('business_name')},

Thank you for successfully fulfilling an order for {data.get('customer_name')}! 

Order Value: {data.get('currency')} {data.get('order_value')}

Your excellent service helps make AisleMarts the preferred shopping destination for millions worldwide.

Best regards,
Aisle AI 🤖
AisleMarts Team""",
                    "whatsapp_text": f"🙏 Hello {data.get('business_name')}! Thanks for the great service to our customer. Order: {data.get('currency')} {data.get('order_value')}. - Aisle AI 🤖"
                }
            },
            "vendor_onboarding_email": {
                "en": f"""Dear {data.get('business_name')},

Congratulations on your recent sale of {data.get('currency')} {data.get('order_value')}! 🎉

I'm Aisle AI 🤖, and I'm excited to invite you to join AisleMarts — the fastest-growing online sales platform 🛜!

🌟 Why join AisleMarts?
{chr(10).join(data.get('benefits', []))}

🚀 Ready to grow your business globally?
Join thousands of successful merchants already thriving on AisleMarts.

👉 ONBOARD NOW: {data.get('onboarding_link')}

This is your direct invitation to transform your business with AI-powered growth tools and global reach.

Questions? Reply to this email or contact our merchant success team.

Best regards,
Aisle AI 🤖
Your AI Business Companion
AisleMarts

P.S. Join within 48 hours and get priority onboarding + exclusive launch benefits! ⚡"""
            },
            "vendor_onboarding_whatsapp": {
                "en": f"""🚀 Hello {data.get('business_name')}!

Congrats on your {data.get('currency')} {data.get('order_value')} sale! 

Want to 10x your sales? Join AisleMarts - the fastest-growing sales platform 🛜

Benefits: Global reach, AI insights, auto-localization, integrated logistics, marketing tools & more!

👉 Join now: {data.get('onboarding_link')}

- Aisle AI 🤖 (Your AI Business Companion)"""
            }
        }
        
        template = templates.get(template_type, {}).get(language, templates.get(template_type, {}).get("en", ""))
        return template
    
    async def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """
        Send email via SMTP
        """
        try:
            # Mock email sending - in production, use proper SMTP
            logger.info(f"📧 Aisle AI sending email to {to_email}: {subject}")
            # Implementation would use actual SMTP here
            return True
        except Exception as e:
            logger.error(f"Email send error: {e}")
            return False
    
    async def send_whatsapp(self, phone: str, message: str) -> bool:
        """
        Send WhatsApp message via WhatsApp Business API
        """
        try:
            # Mock WhatsApp sending - in production, use WhatsApp Business API
            logger.info(f"📱 Aisle AI sending WhatsApp to {phone}: {message[:50]}...")
            # Implementation would use actual WhatsApp API here
            return True
        except Exception as e:
            logger.error(f"WhatsApp send error: {e}")
            return False
    
    async def schedule_vendor_followup(self, vendor_info: Dict, onboarding_message: Dict) -> None:
        """
        Schedule follow-up messages for vendor onboarding
        """
        try:
            vendor_id = vendor_info.get("vendor_id")
            
            # Schedule follow-ups at 24h, 48h, 7 days
            followup_schedule = [
                {"delay_hours": 24, "type": "reminder"},
                {"delay_hours": 48, "type": "urgency"},
                {"delay_hours": 168, "type": "final_offer"}  # 7 days
            ]
            
            for followup in followup_schedule:
                # In production, this would use a task queue like Celery
                logger.info(f"📅 Scheduled followup for {vendor_id} in {followup['delay_hours']} hours")
            
            return True
        except Exception as e:
            logger.error(f"Followup scheduling error: {e}")
            return False
    
    async def update_purchase_tracking(self, purchase_id: str, shopper_response: Dict, vendor_response: Dict) -> None:
        """
        Update internal tracking systems
        """
        try:
            tracking_data = {
                "purchase_id": purchase_id,
                "ai_processing_timestamp": datetime.utcnow().isoformat(),
                "shopper_contacted": shopper_response.get("success", False),
                "vendor_contacted": vendor_response.get("success", False),
                "onboarding_invitation_sent": vendor_response.get("onboarding_sent", False),
                "channels_used": shopper_response.get("channels_used", []),
                "onboarding_link": vendor_response.get("onboarding_link")
            }
            
            # Store in database
            logger.info(f"📊 Updated purchase tracking for {purchase_id}")
            # In production, save to MongoDB
            
        except Exception as e:
            logger.error(f"Purchase tracking update error: {e}")
    
    async def get_ai_response(self, user_message: str, context: Dict = None) -> Dict[str, Any]:
        """
        Generate AI response for shopper interactions
        """
        try:
            # Simulate AI conversation capabilities
            response_templates = [
                "I'm Aisle 🤖, your shopping companion! How can I help you discover amazing products today?",
                "Looking for something specific? I can help you find the perfect products with global shipping!",
                "I love helping shoppers like you! What lifestyle or fashion inspiration are you seeking?",
                "Ready to explore? I can show you trending products, live streams, or personalized recommendations!"
            ]
            
            # In production, this would use actual AI/LLM
            import random
            ai_response = random.choice(response_templates)
            
            return {
                "success": True,
                "response": ai_response,
                "capabilities_offered": [
                    "product_search",
                    "live_shopping_streams", 
                    "fashion_advice",
                    "lifestyle_recommendations",
                    "order_tracking",
                    "vendor_discovery"
                ],
                "conversation_id": f"conv_{datetime.utcnow().timestamp()}"
            }
            
        except Exception as e:
            logger.error(f"AI response generation error: {e}")
            return {"success": False, "error": str(e)}

# Initialize service
aisle_ai_service = AisleAIService()