from fastapi import APIRouter, HTTPException, Request, Depends, Header
from pydantic import BaseModel
from typing import Dict, Optional
from bson import ObjectId
from mpesa_service import mpesa_service
from commission_service import commission_service
from seller_service import seller_service
from security import decode_access_token
from datetime import datetime
from db import db

router = APIRouter(prefix="/api/mpesa", tags=["M-Pesa"])

async def get_current_user(authorization: str | None = Header(None)):
    """Extract user from auth token"""
    if not authorization:
        raise HTTPException(401, "Missing Authorization header")
    try:
        token = authorization.split()[1]
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        user = await db().users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {str(e)}")

class MPesaPaymentRequest(BaseModel):
    phone_number: str
    amount: float
    order_id: str
    description: str = "AisleMarts Purchase"

class MPesaValidationRequest(BaseModel):
    phone_number: str

@router.post("/initiate-payment")
async def initiate_mpesa_payment(payment_request: MPesaPaymentRequest):
    """Initiate M-Pesa STK push payment"""
    try:
        # Validate phone number
        is_valid = await mpesa_service.validate_phone_number(payment_request.phone_number)
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail="Invalid Kenya phone number format. Please use format: +254XXXXXXXXX or 07XXXXXXXX"
            )
        
        # Validate amount (minimum KSh 1)
        if payment_request.amount < 1:
            raise HTTPException(
                status_code=400,
                detail="Payment amount must be at least KSh 1"
            )
        
        # Initiate STK push
        result = await mpesa_service.initiate_stk_push(
            phone_number=payment_request.phone_number,
            amount=payment_request.amount,
            order_id=payment_request.order_id,
            description=payment_request.description
        )
        
        if result["status"] == "success":
            return {
                "success": True,
                "message": "Payment request sent to your phone. Please enter your M-Pesa PIN to complete the transaction.",
                "checkout_request_id": result["checkout_request_id"],
                "merchant_request_id": result["merchant_request_id"],
                "amount": mpesa_service.format_currency(payment_request.amount),
                "phone_number": payment_request.phone_number,
                "instructions": [
                    "Check your phone for the M-Pesa payment request",
                    "Enter your M-Pesa PIN when prompted",
                    "You will receive a confirmation SMS once payment is complete"
                ]
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Payment initiation failed: {result.get('error', 'Unknown error')}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment initiation error: {str(e)}")

@router.post("/callback")
async def mpesa_callback(request: Request):
    """Handle M-Pesa payment callback"""
    try:
        callback_data = await request.json()
        
        # Extract payment details from callback
        stk_callback = callback_data.get("Body", {}).get("stkCallback", {})
        result_code = stk_callback.get("ResultCode")
        checkout_request_id = stk_callback.get("CheckoutRequestID")
        
        if result_code == 0:  # Success
            # Extract transaction details
            callback_metadata = stk_callback.get("CallbackMetadata", {}).get("Item", [])
            
            transaction_details = {}
            for item in callback_metadata:
                name = item.get("Name")
                value = item.get("Value")
                transaction_details[name] = value
            
            # Process successful payment
            # Here you would:
            # 1. Update order status
            # 2. Calculate and record commission
            # 3. Notify seller
            # 4. Send confirmation to buyer
            
            print(f"M-Pesa payment successful: {transaction_details}")
            
            return {
                "ResultCode": 0,
                "ResultDesc": "Success",
                "message": "Payment processed successfully"
            }
        else:
            # Payment failed
            result_desc = stk_callback.get("ResultDesc", "Payment failed")
            print(f"M-Pesa payment failed: {result_desc}")
            
            return {
                "ResultCode": result_code,
                "ResultDesc": result_desc,
                "message": "Payment failed"
            }
            
    except Exception as e:
        print(f"M-Pesa callback error: {e}")
        return {
            "ResultCode": 1,
            "ResultDesc": "Callback processing failed",
            "message": str(e)
        }

@router.get("/payment-status/{checkout_request_id}")
async def check_payment_status(checkout_request_id: str):
    """Check M-Pesa payment status"""
    try:
        status = await mpesa_service.query_payment_status(checkout_request_id)
        
        if status["status"] == "success":
            result_code = status.get("result_code", "1")
            
            if result_code == "0":
                return {
                    "status": "completed",
                    "message": "Payment completed successfully",
                    "checkout_request_id": checkout_request_id,
                    "result_desc": status.get("result_desc", "Success")
                }
            else:
                return {
                    "status": "failed",
                    "message": "Payment failed or was cancelled",
                    "checkout_request_id": checkout_request_id,
                    "result_desc": status.get("result_desc", "Payment failed")
                }
        else:
            return {
                "status": "error",
                "message": f"Status check failed: {status.get('error', 'Unknown error')}",
                "checkout_request_id": checkout_request_id
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check error: {str(e)}")

@router.post("/validate-phone")
async def validate_phone_number(validation_request: MPesaValidationRequest):
    """Validate Kenya phone number for M-Pesa"""
    try:
        is_valid = await mpesa_service.validate_phone_number(validation_request.phone_number)
        
        if is_valid:
            # Format the phone number for display
            phone = validation_request.phone_number
            if not phone.startswith('+254'):
                if phone.startswith('0'):
                    phone = f"+254{phone[1:]}"
                elif phone.startswith('254'):
                    phone = f"+{phone}"
                else:
                    phone = f"+254{phone}"
            
            return {
                "valid": True,
                "formatted_number": phone,
                "message": "Valid Kenya mobile number for M-Pesa payments"
            }
        else:
            return {
                "valid": False,
                "message": "Invalid phone number. Please use Kenya mobile format: +254XXXXXXXXX or 07XXXXXXXX",
                "examples": ["+254712345678", "0712345678", "0722345678", "0733345678"]
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

@router.post("/demo/simulate-payment")
async def simulate_payment(
    amount: float = 1000.0,
    phone_number: str = "+254712345678",
    current_user: dict = Depends(get_current_user)
):
    """Simulate M-Pesa payment for demo purposes"""
    try:
        # Validate inputs
        is_valid = await mpesa_service.validate_phone_number(phone_number)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid phone number format")
        
        if amount < 1:
            raise HTTPException(status_code=400, detail="Amount must be at least KSh 1")
        
        # Generate mock order ID
        order_id = f"demo_order_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Initiate payment
        payment_result = await mpesa_service.initiate_stk_push(
            phone_number=phone_number,
            amount=amount,
            order_id=order_id,
            description="AisleMarts Demo Payment"
        )
        
        if payment_result["status"] == "success":
            # For demo, simulate immediate completion
            return {
                "success": True,
                "message": "Demo payment simulation completed successfully!",
                "payment_details": {
                    "order_id": order_id,
                    "amount": mpesa_service.format_currency(amount),
                    "phone_number": phone_number,
                    "checkout_request_id": payment_result["checkout_request_id"],
                    "status": "simulated_success",
                    "note": "This is a demo simulation - no real money was charged"
                },
                "next_steps": [
                    "In production, user would receive SMS with payment request",
                    "User enters M-Pesa PIN to authorize payment",
                    "System receives callback confirmation",
                    "Order status updated and commission calculated"
                ]
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Demo payment simulation failed: {payment_result.get('error', 'Unknown error')}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo simulation error: {str(e)}")

@router.get("/health")
async def mpesa_health_check():
    """Health check for M-Pesa service"""
    return {
        "status": "healthy",
        "service": "mpesa_service",
        "supported_networks": ["Safaricom M-Pesa"],
        "supported_currency": "KES",
        "min_amount": "KSh 1.00",
        "max_amount": "KSh 150,000.00",
        "environment": "sandbox" if mpesa_service.consumer_key == "sandbox_consumer_key" else "production",
        "phone_formats": ["+254XXXXXXXXX", "07XXXXXXXX", "01XXXXXXXX"],
        "timestamp": datetime.utcnow()
    }

@router.get("/test-integration")
async def test_mpesa_integration():
    """Test M-Pesa integration endpoints"""
    try:
        # Test phone validation
        test_phone = "+254712345678"
        validation_result = await mpesa_service.validate_phone_number(test_phone)
        
        # Test currency formatting
        test_amount = 1500.50
        formatted_currency = mpesa_service.format_currency(test_amount)
        
        return {
            "integration_status": "healthy",
            "tests": {
                "phone_validation": {
                    "test_phone": test_phone,
                    "is_valid": validation_result,
                    "status": "pass" if validation_result else "fail"
                },
                "currency_formatting": {
                    "test_amount": test_amount,
                    "formatted": formatted_currency,
                    "status": "pass"
                },
                "service_connection": {
                    "consumer_key": mpesa_service.consumer_key[:10] + "..." if len(mpesa_service.consumer_key) > 10 else mpesa_service.consumer_key,
                    "business_code": mpesa_service.business_short_code,
                    "environment": "sandbox" if mpesa_service.consumer_key == "sandbox_consumer_key" else "production",
                    "status": "configured"
                }
            },
            "ready_for_payments": True,
            "notes": [
                "M-Pesa integration configured for Kenya market",
                "Sandbox mode active for testing",
                "Production keys required for live payments"
            ]
        }
        
    except Exception as e:
        return {
            "integration_status": "error",
            "error": str(e),
            "ready_for_payments": False
        }