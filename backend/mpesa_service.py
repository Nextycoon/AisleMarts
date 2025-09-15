import requests
import base64
from datetime import datetime
from typing import Dict, Optional
from dotenv import load_dotenv
import os

load_dotenv()

class MPesaService:
    def __init__(self):
        # M-Pesa API Configuration (Sandbox for testing)
        self.consumer_key = os.getenv("MPESA_CONSUMER_KEY", "sandbox_consumer_key")
        self.consumer_secret = os.getenv("MPESA_CONSUMER_SECRET", "sandbox_consumer_secret")
        self.business_short_code = os.getenv("MPESA_BUSINESS_SHORT_CODE", "174379")
        self.passkey = os.getenv("MPESA_PASSKEY", "sandbox_passkey")
        self.callback_url = os.getenv("MPESA_CALLBACK_URL", "https://aislemarts.com/api/mpesa/callback")
        
        # Sandbox URLs (use production URLs in production)
        self.base_url = "https://sandbox.safaricom.co.ke"
        self.auth_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        self.stk_push_url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        self.query_url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
    
    async def get_access_token(self) -> str:
        """Get M-Pesa API access token"""
        try:
            # Create basic auth string
            auth_string = f"{self.consumer_key}:{self.consumer_secret}"
            auth_bytes = auth_string.encode('ascii')
            auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
            
            headers = {
                "Authorization": f"Basic {auth_base64}"
            }
            
            response = requests.get(self.auth_url, headers=headers)
            
            if response.status_code == 200:
                return response.json().get("access_token")
            else:
                raise Exception(f"Failed to get access token: {response.text}")
                
        except Exception as e:
            print(f"M-Pesa auth error: {e}")
            # Return dummy token for development
            return "sandbox_access_token"
    
    def generate_password(self) -> str:
        """Generate M-Pesa API password"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_string = f"{self.business_short_code}{self.passkey}{timestamp}"
        password_bytes = password_string.encode('ascii')
        return base64.b64encode(password_bytes).decode('ascii'), timestamp
    
    async def initiate_stk_push(self, phone_number: str, amount: float, order_id: str, description: str = "AisleMarts Payment") -> Dict:
        """Initiate M-Pesa STK push payment"""
        try:
            # Get access token
            access_token = await self.get_access_token()
            
            # Generate password and timestamp
            password, timestamp = self.generate_password()
            
            # Format phone number (remove + and ensure 254 prefix)
            if phone_number.startswith('+'):
                phone_number = phone_number[1:]
            if phone_number.startswith('0'):
                phone_number = f"254{phone_number[1:]}"
            if not phone_number.startswith('254'):
                phone_number = f"254{phone_number}"
            
            # Prepare payload
            payload = {
                "BusinessShortCode": self.business_short_code,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(amount),  # M-Pesa expects integer
                "PartyA": phone_number,
                "PartyB": self.business_short_code,
                "PhoneNumber": phone_number,
                "CallBackURL": self.callback_url,
                "AccountReference": order_id,
                "TransactionDesc": description
            }
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            # For development/testing, return a mock response
            if self.consumer_key == "sandbox_consumer_key":
                return {
                    "status": "success",
                    "checkout_request_id": f"ws_CO_DMZ_{datetime.now().strftime('%Y%m%d%H%M%S')}_{order_id}",
                    "merchant_request_id": f"22205-{datetime.now().strftime('%Y%m%d%H%M%S')}-1",
                    "response_code": "0",
                    "response_description": "Success. Request accepted for processing",
                    "customer_message": "Success. Request accepted for processing",
                    "note": "This is a sandbox simulation - no real payment processed"
                }
            
            # Make actual API call in production
            response = requests.post(self.stk_push_url, json=payload, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "status": "success",
                    "checkout_request_id": result.get("CheckoutRequestID"),
                    "merchant_request_id": result.get("MerchantRequestID"),
                    "response_code": result.get("ResponseCode"),
                    "response_description": result.get("ResponseDescription"),
                    "customer_message": result.get("CustomerMessage")
                }
            else:
                return {
                    "status": "error",
                    "error": response.text
                }
                
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def query_payment_status(self, checkout_request_id: str) -> Dict:
        """Query the status of STK push payment"""
        try:
            # Get access token
            access_token = await self.get_access_token()
            
            # Generate password and timestamp
            password, timestamp = self.generate_password()
            
            payload = {
                "BusinessShortCode": self.business_short_code,
                "Password": password,
                "Timestamp": timestamp,
                "CheckoutRequestID": checkout_request_id
            }
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            # For development/testing, return a mock response
            if self.consumer_key == "sandbox_consumer_key":
                return {
                    "status": "success",
                    "result_code": "0",
                    "result_desc": "The service request has been accepted successfully",
                    "checkout_request_id": checkout_request_id,
                    "note": "This is a sandbox simulation"
                }
            
            # Make actual API call in production
            response = requests.post(self.query_url, json=payload, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "status": "success",
                    "result_code": result.get("ResultCode"),
                    "result_desc": result.get("ResultDesc"),
                    "checkout_request_id": result.get("CheckoutRequestID")
                }
            else:
                return {
                    "status": "error",
                    "error": response.text
                }
                
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def validate_phone_number(self, phone_number: str) -> bool:
        """Validate Kenya phone number format"""
        # Remove spaces and special characters
        phone = phone_number.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        
        # Handle different formats
        if phone.startswith('+254'):
            phone = phone[4:]
        elif phone.startswith('254'):
            phone = phone[3:]
        elif phone.startswith('0'):
            phone = phone[1:]
        
        # Check if it's a valid Kenya mobile number (7XX, 1XX formats)
        if len(phone) == 9 and (phone.startswith('7') or phone.startswith('1')):
            return True
        
        return False
    
    def format_currency(self, amount: float) -> str:
        """Format amount in KES currency"""
        return f"KSh {amount:,.2f}"

# Initialize service
mpesa_service = MPesaService()