"""
Authentication routes for v1 API - OTP-based authentication
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
import random
from datetime import datetime, timedelta
import asyncio
from ...security import create_access_token
from ...db import db
from ...config import settings

router = APIRouter(prefix="/v1/auth", tags=["auth"])

class OTPRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    locale: str = "en"

class OTPVerify(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    code: str
    device_info: Optional[dict] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    shopper_id: str
    is_new_user: bool

@router.post("/otp/request")
async def request_otp(payload: OTPRequest):
    """Request OTP for email or phone authentication"""
    if not payload.email and not payload.phone:
        raise HTTPException(400, "Email or phone is required")
    
    # Generate 6-digit OTP
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Store OTP in database
    otp_doc = {
        "_id": str(uuid.uuid4()),
        "email": payload.email,
        "phone": payload.phone,
        "code": otp_code,
        "expires_at": expires_at,
        "used": False,
        "created_at": datetime.utcnow()
    }
    
    await db().otps.insert_one(otp_doc)
    
    # In production, send email/SMS here
    # For development, log the OTP
    contact = payload.email or payload.phone
    print(f"🔐 OTP for {contact}: {otp_code}")
    
    return {
        "message": "OTP sent successfully",
        "expires_in_minutes": 10,
        "contact": contact,
        "dev_code": otp_code if settings.MONGO_URL == "mongodb://localhost:27017" else None
    }

@router.post("/otp/verify", response_model=AuthResponse)
async def verify_otp(payload: OTPVerify):
    """Verify OTP and authenticate user"""
    if not payload.email and not payload.phone:
        raise HTTPException(400, "Email or phone is required")
    
    # Find valid OTP
    otp_filter = {
        "code": payload.code,
        "used": False,
        "expires_at": {"$gt": datetime.utcnow()}
    }
    
    if payload.email:
        otp_filter["email"] = payload.email
    if payload.phone:
        otp_filter["phone"] = payload.phone
    
    otp_doc = await db().otps.find_one(otp_filter)
    if not otp_doc:
        raise HTTPException(401, "Invalid or expired OTP")
    
    # Mark OTP as used
    await db().otps.update_one(
        {"_id": otp_doc["_id"]},
        {"$set": {"used": True, "used_at": datetime.utcnow()}}
    )
    
    # Find or create shopper
    shopper_filter = {}
    if payload.email:
        shopper_filter["email"] = payload.email
    if payload.phone:
        shopper_filter["phone"] = payload.phone
    
    shopper = await db().shoppers.find_one(shopper_filter)
    is_new_user = False
    
    if not shopper:
        # Create new shopper
        shopper_id = str(uuid.uuid4())
        shopper = {
            "_id": shopper_id,
            "email": payload.email,
            "phone": payload.phone,
            "locale": payload.device_info.get("locale", "en") if payload.device_info else "en",
            "currency": "USD",  # Default, will be updated based on locale
            "preferences": {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db().shoppers.insert_one(shopper)
        is_new_user = True
    
    # Generate JWT token
    access_token = create_access_token(shopper["_id"])
    
    return AuthResponse(
        access_token=access_token,
        shopper_id=shopper["_id"],
        is_new_user=is_new_user
    )

@router.get("/me")
async def get_current_shopper_profile(shopper=Depends(require_shopper)):
    """Get current shopper profile"""
    return {
        "id": shopper["_id"],
        "email": shopper.get("email"),
        "phone": shopper.get("phone"),
        "locale": shopper.get("locale", "en"),
        "currency": shopper.get("currency", "USD"),
        "preferences": shopper.get("preferences", {}),
        "created_at": shopper.get("created_at")
    }

