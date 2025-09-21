from dotenv import load_dotenv
import os
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

load_dotenv()

class AISuperAgentService:
    """
    Advanced AI Super Agent for AisleMarts
    Handles automated vendor outreach, customer service, and business intelligence
    """
    
    def __init__(self):
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.email_user = os.getenv('EMAIL_USER')
        self.email_password = os.getenv('EMAIL_PASSWORD')
        self.whatsapp_token = os.getenv('WHATSAPP_API_TOKEN')
        
    async def automated_vendor_outreach(self, purchase_data: Dict) -> Dict:
        """
        Automatically contact vendors when customers make purchases
        Core AisleMarts Business Magnet Feature
        """
        try:
            vendor_info = purchase_data.get('vendor', {})
            customer_info = purchase_data.get('customer', {})
            product_info = purchase_data.get('product', {})
            
            # Generate personalized outreach message
            message_data = await self._generate_vendor_message(
                vendor_info, customer_info, product_info
            )
            
            # Multi-channel outreach
            outreach_results = {}
            
            # Email outreach
            if vendor_info.get('email'):
                email_result = await self._send_vendor_email(
                    vendor_info['email'], 
                    message_data
                )
                outreach_results['email'] = email_result
            
            # WhatsApp outreach (if available)
            if vendor_info.get('whatsapp'):
                whatsapp_result = await self._send_whatsapp_message(
                    vendor_info['whatsapp'], 
                    message_data['whatsapp_message']
                )
                outreach_results['whatsapp'] = whatsapp_result
            
            # SMS outreach
            if vendor_info.get('phone'):
                sms_result = await self._send_sms_message(
                    vendor_info['phone'], 
                    message_data['sms_message']
                )
                outreach_results['sms'] = sms_result
            
            # Log outreach for analytics
            await self._log_outreach_attempt(purchase_data, outreach_results)
            
            return {
                'success': True,
                'outreach_channels': len(outreach_results),
                'results': outreach_results,
                'message': 'Automated vendor outreach completed successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to execute automated vendor outreach'
            }
    
    async def _generate_vendor_message(self, vendor_info: Dict, customer_info: Dict, product_info: Dict) -> Dict:
        """
        Use AI to generate personalized vendor outreach messages
        """
        try:
            # AI prompt for message generation
            prompt = f"""
            Generate personalized vendor outreach messages for AisleMarts business magnet system.
            
            Vendor: {vendor_info.get('name', 'Business Owner')}
            Customer: {customer_info.get('name', 'Customer')}
            Product: {product_info.get('name', 'Product')}
            Purchase Amount: {product_info.get('price', 'N/A')}
            Location: {customer_info.get('location', 'Global')}
            
            Create 3 message versions:
            1. Professional email (HTML format)
            2. WhatsApp message (casual, with emojis)
            3. SMS message (concise, under 160 chars)
            
            Include:
            - Thank you for quality products
            - Customer satisfaction mention
            - AisleMarts platform benefits
            - Invitation to join with onboarding link
            - Success stories from similar vendors
            
            Make it feel personal and genuine, not automated.
            """
            
            # Simulate AI response (integrate with actual AI service)
            messages = {
                'email_subject': f'Thank you for serving our AisleMarts customer - {customer_info.get("name", "Customer")}',
                'email_message': f"""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #D4AF37;">Thank You for Excellence! 🌟</h2>
                        
                        <p>Dear {vendor_info.get('name', 'Business Owner')},</p>
                        
                        <p>We hope this message finds you well! We're reaching out to express our sincere gratitude for the exceptional quality of your products.</p>
                        
                        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0;">
                            <strong>Recent Purchase Details:</strong><br>
                            Customer: {customer_info.get('name', 'Valued Customer')}<br>
                            Product: {product_info.get('name', 'Your Product')}<br>
                            Amount: {product_info.get('price', 'Purchase')}<br>
                            Location: {customer_info.get('location', 'Global')}
                        </div>
                        
                        <p>Your customer was thrilled with their purchase through AisleMarts! This is exactly the kind of quality and service that makes our marketplace special.</p>
                        
                        <h3 style="color: #D4AF37;">Why Top Vendors Choose AisleMarts:</h3>
                        <ul>
                            <li>🌍 Global reach to 185+ countries</li>
                            <li>💰 0% commission - pay per lead only</li>
                            <li>🤖 AI-powered customer matching</li>
                            <li>📈 Built-in marketing tools</li>
                            <li>💎 Premium vendor support</li>
                        </ul>
                        
                        <div style="background: #D4AF37; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                            <h3>Join 50,000+ Successful Vendors</h3>
                            <p>Ready to scale your business globally?</p>
                            <a href="https://aislemarts.com/vendor-signup?ref=customer_purchase" 
                               style="background: white; color: #D4AF37; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                               Start Your Free Account →
                            </a>
                        </div>
                        
                        <p>Questions? Reply to this email or call our vendor success team at +1-800-AISLE-1.</p>
                        
                        <p>Best regards,<br>
                        The AisleMarts Vendor Success Team</p>
                        
                        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #666;">
                            AisleMarts Global Marketplace | Connecting Quality Vendors Worldwide
                        </div>
                    </div>
                </body>
                </html>
                """,
                'whatsapp_message': f"""
                🌟 Hi {vendor_info.get('name', 'there')}!
                
                Thank you for the amazing quality! Your customer {customer_info.get('name', 'from AisleMarts')} absolutely loved their {product_info.get('name', 'purchase')}! 😊
                
                We're AisleMarts - a global marketplace helping quality vendors like you reach customers worldwide 🌍
                
                🎯 Why vendors love us:
                • 0% commission (pay per lead only!)
                • AI finds perfect customers for you
                • Global reach to 185+ countries
                • Free marketing tools
                
                Want to join 50,000+ successful vendors? 
                👉 https://aislemarts.com/vendor-signup
                
                Any questions? Just reply! 💬
                """,
                'sms_message': f"Hi {vendor_info.get('name', '')}, thanks for great service! Your customer loved their purchase via AisleMarts. Join our 0% commission marketplace: aislemarts.com/join"
            }
            
            return messages
            
        except Exception as e:
            # Fallback messages
            return {
                'email_subject': 'Thank you for serving our AisleMarts customer',
                'email_message': 'Thank you for providing excellent service to our customer.',
                'whatsapp_message': 'Thank you for great service! Consider joining AisleMarts marketplace.',
                'sms_message': 'Thanks for great service! Join AisleMarts: aislemarts.com/join'
            }
    
    async def _send_vendor_email(self, email: str, message_data: Dict) -> Dict:
        """
        Send email to vendor with onboarding invitation
        """
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_user
            msg['To'] = email
            msg['Subject'] = message_data['email_subject']
            
            msg.attach(MIMEText(message_data['email_message'], 'html'))
            
            # Send email (simulate for now)
            # with smtplib.SMTP('smtp.gmail.com', 587) as server:
            #     server.starttls()
            #     server.login(self.email_user, self.email_password)
            #     server.send_message(msg)
            
            return {
                'status': 'sent',
                'channel': 'email',
                'recipient': email,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'failed',
                'channel': 'email',
                'error': str(e)
            }
    
    async def _send_whatsapp_message(self, phone: str, message: str) -> Dict:
        """
        Send WhatsApp message to vendor
        """
        try:
            # WhatsApp Business API integration (simulate for now)
            return {
                'status': 'sent',
                'channel': 'whatsapp',
                'recipient': phone,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'failed',
                'channel': 'whatsapp',
                'error': str(e)
            }
    
    async def _send_sms_message(self, phone: str, message: str) -> Dict:
        """
        Send SMS message to vendor
        """
        try:
            # SMS API integration (simulate for now)
            return {
                'status': 'sent',
                'channel': 'sms',
                'recipient': phone,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'failed',
                'channel': 'sms',
                'error': str(e)
            }
    
    async def _log_outreach_attempt(self, purchase_data: Dict, results: Dict) -> None:
        """
        Log outreach attempts for analytics and optimization
        """
        try:
            log_entry = {
                'timestamp': datetime.now().isoformat(),
                'purchase_id': purchase_data.get('id'),
                'vendor_id': purchase_data.get('vendor', {}).get('id'),
                'customer_id': purchase_data.get('customer', {}).get('id'),
                'outreach_results': results,
                'success_channels': len([r for r in results.values() if r.get('status') == 'sent'])
            }
            
            # Store in database or analytics service
            print(f"Outreach logged: {log_entry}")
            
        except Exception as e:
            print(f"Failed to log outreach: {e}")
    
    async def ai_product_recommendations(self, user_id: str, context: Dict) -> List[Dict]:
        """
        Generate AI-powered product recommendations
        """
        try:
            # Simulate AI recommendation engine
            recommendations = [
                {
                    'product_id': 'rec_001',
                    'title': 'AI Recommended: Winter Fashion Collection',
                    'reason': 'Based on your recent fashion purchases',
                    'confidence': 0.92,
                    'price': '$79.99',
                    'vendor': 'LuxeFashion',
                    'rating': 4.8
                },
                {
                    'product_id': 'rec_002',
                    'title': 'Smart Home Bundle',
                    'reason': 'Trending in your area',
                    'confidence': 0.87,
                    'price': '$199.99',
                    'vendor': 'TechGear Pro',
                    'rating': 4.9
                }
            ]
            
            return recommendations
            
        except Exception as e:
            return []
    
    async def ai_price_optimization(self, product_id: str, market_data: Dict) -> Dict:
        """
        AI-powered dynamic pricing recommendations
        """
        try:
            # Simulate AI price analysis
            optimization = {
                'current_price': market_data.get('current_price', 0),
                'recommended_price': market_data.get('current_price', 0) * 0.95,
                'confidence': 0.89,
                'reasoning': 'Market analysis suggests 5% discount would increase sales by 23%',
                'expected_sales_lift': '23%',
                'competitor_analysis': {
                    'average_price': market_data.get('current_price', 0) * 1.1,
                    'lowest_price': market_data.get('current_price', 0) * 0.85,
                    'position': 'competitive'
                }
            }
            
            return optimization
            
        except Exception as e:
            return {'error': str(e)}
    
    async def ai_customer_service(self, query: str, customer_context: Dict) -> Dict:
        """
        AI-powered customer service responses
        """
        try:
            # Simulate AI customer service
            responses = {
                'shipping': 'Your order is being processed and will ship within 2-3 business days. You\'ll receive tracking information via email.',
                'return': 'You can return items within 30 days. We\'ll send you a prepaid return label.',
                'product': 'Based on your preferences, I recommend checking out our winter collection with 20% off this week.',
                'general': 'I\'m here to help! Let me connect you with the right information.'
            }
            
            # Simple keyword matching (replace with actual AI)
            response_type = 'general'
            for key in responses.keys():
                if key in query.lower():
                    response_type = key
                    break
            
            return {
                'response': responses[response_type],
                'confidence': 0.85,
                'escalate_to_human': False,
                'suggested_actions': ['check_order_status', 'browse_recommendations']
            }
            
        except Exception as e:
            return {
                'response': 'I apologize, but I\'m having trouble processing your request. Let me connect you with a human agent.',
                'escalate_to_human': True,
                'error': str(e)
            }

# Global service instance
ai_super_agent_service = AISuperAgentService()