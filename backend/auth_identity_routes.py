from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime

from security import decode_access_token
from db import db
from auth_identity_service import auth_identity_service
from auth_identity_models import (
    UserRole, VerificationLevel, UserIdentity, ProfileCard,
    UsernameChangeRequest, TwoFactorMethod, KYCDocument
)

router = APIRouter(prefix="/api/identity", tags=["Auth Identity & Verification"])

# Pydantic models for API
class CreateUserIdentityRequest(BaseModel):
    username: str
    display_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    is_seller: bool = False
    is_buyer: bool = False
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    country: str = "US"
    language: str = "en"
    currency: str = "USD"
    timezone: str = "UTC"
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None

class VerificationUpdateRequest(BaseModel):
    verification_updates: Dict[str, bool]

class UsernameChangeValidationRequest(BaseModel):
    new_username: str

class UsernameChangeProcessRequest(BaseModel):
    new_username: str
    verification_completed: Dict[str, bool]

class AvatarChangeValidationRequest(BaseModel):
    image_data: str

class AvatarChangeProcessRequest(BaseModel):
    image_data: str
    verification_completed: Dict[str, bool]

async def get_current_user_required(authorization: str | None = Header(None)):
    """Extract user from auth token (required)"""
    if not authorization:
        raise HTTPException(401, "Authorization header required")
    
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
    except Exception:
        raise HTTPException(401, "Invalid authorization")

async def get_current_user_optional(authorization: str | None = Header(None)):
    """Extract user from auth token (optional)"""
    if not authorization:
        return None
    
    try:
        token = authorization.split()[1]
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        user = await db().users.find_one({"_id": user_id})
        return user
    except Exception:
        return None

@router.post("/create")
async def create_user_identity(request: CreateUserIdentityRequest):
    """Create new user identity with verification tracking"""
    try:
        user_data = request.dict()
        user_id = await auth_identity_service.create_user_identity(user_data)
        
        return {
            "success": True,
            "user_id": user_id,
            "message": "User identity created successfully"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to create user identity: {str(e)}")

@router.get("/profile/{user_id}")
async def get_user_identity(
    user_id: str,
    user = Depends(get_current_user_optional)
):
    """Get user identity information"""
    try:
        identity = await auth_identity_service.get_user_identity(user_id)
        if not identity:
            raise HTTPException(404, "User identity not found")
        
        # Filter sensitive information for non-owners
        if not user or str(user["_id"]) != user_id:
            # Return public profile card instead
            profile_card = await auth_identity_service.get_profile_card(user_id)
            return profile_card
        
        return identity
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error retrieving user identity: {str(e)}")

@router.get("/profile-card/{user_id}")
async def get_profile_card(
    user_id: str,
    user = Depends(get_current_user_optional)
):
    """Get user profile card for display"""
    try:
        profile_card = await auth_identity_service.get_profile_card(user_id)
        if not profile_card:
            raise HTTPException(404, "Profile card not found")
        
        return profile_card
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error retrieving profile card: {str(e)}")

@router.put("/verification/update")
async def update_verification_status(
    request: VerificationUpdateRequest,
    user = Depends(get_current_user_required)
):
    """Update user verification status"""
    try:
        user_id = str(user["_id"])
        success = await auth_identity_service.update_verification_status(
            user_id, 
            request.verification_updates
        )
        
        if not success:
            raise HTTPException(400, "Failed to update verification status")
        
        return {
            "success": True,
            "message": "Verification status updated",
            "updates": request.verification_updates
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error updating verification: {str(e)}")

@router.post("/username/validate")
async def validate_username_change(
    request: UsernameChangeValidationRequest,
    user = Depends(get_current_user_required)
):
    """Validate username change request"""
    try:
        user_id = str(user["_id"])
        result = await auth_identity_service.validate_username_change(
            user_id, 
            request.new_username
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Error validating username change: {str(e)}")

@router.post("/username/change")
async def process_username_change(
    request: UsernameChangeProcessRequest,
    user = Depends(get_current_user_required)
):
    """Process username change after verification"""
    try:
        user_id = str(user["_id"])
        success = await auth_identity_service.process_username_change(
            user_id,
            request.new_username,
            request.verification_completed
        )
        
        if not success:
            raise HTTPException(400, "Failed to process username change")
        
        return {
            "success": True,
            "message": "Username changed successfully",
            "new_username": request.new_username.lower()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error processing username change: {str(e)}")

@router.post("/avatar/validate")
async def validate_avatar_change(
    request: AvatarChangeValidationRequest,
    user = Depends(get_current_user_required)
):
    """Validate avatar/profile image change"""
    try:
        user_id = str(user["_id"])
        result = await auth_identity_service.validate_avatar_change(
            user_id,
            request.image_data
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Error validating avatar change: {str(e)}")

@router.post("/avatar/change")
async def process_avatar_change(
    request: AvatarChangeProcessRequest,
    user = Depends(get_current_user_required)
):
    """Process avatar change after verification"""
    try:
        user_id = str(user["_id"])
        success = await auth_identity_service.process_avatar_change(
            user_id,
            request.image_data,
            request.verification_completed
        )
        
        if not success:
            raise HTTPException(400, "Failed to process avatar change")
        
        return {
            "success": True,
            "message": "Avatar changed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error processing avatar change: {str(e)}")

@router.get("/verification/requirements")
async def get_verification_requirements(user = Depends(get_current_user_required)):
    """Get verification requirements for user based on role"""
    try:
        user_id = str(user["_id"])
        requirements = await auth_identity_service.get_user_verification_requirements(user_id)
        
        return requirements
        
    except Exception as e:
        raise HTTPException(500, f"Error getting verification requirements: {str(e)}")

@router.get("/verification/levels")
async def get_verification_levels():
    """Get available verification levels and requirements"""
    try:
        from auth_identity_models import VERIFICATION_LEVELS, ROLE_CONFIGS
        
        return {
            "verification_levels": VERIFICATION_LEVELS,
            "role_configs": ROLE_CONFIGS,
            "kyc_documents": [doc.value for doc in KYCDocument],
            "two_factor_methods": [method.value for method in TwoFactorMethod]
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting verification levels: {str(e)}")

@router.get("/username/policy")
async def get_username_policy():
    """Get username policy configuration"""
    try:
        from auth_identity_models import USERNAME_POLICY
        
        return {
            "policy": USERNAME_POLICY,
            "description": "Username policy and change requirements"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting username policy: {str(e)}")

@router.get("/avatar/policy")
async def get_avatar_policy():
    """Get profile image policy configuration"""
    try:
        from auth_identity_models import PROFILE_IMAGE_POLICY
        
        return {
            "policy": PROFILE_IMAGE_POLICY,
            "description": "Profile image policy and change requirements"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting avatar policy: {str(e)}")

@router.get("/trust-score/{user_id}")
async def get_trust_score(
    user_id: str,
    user = Depends(get_current_user_optional)
):
    """Get user trust score and breakdown"""
    try:
        identity = await auth_identity_service.get_user_identity(user_id)
        if not identity:
            raise HTTPException(404, "User not found")
        
        from auth_identity_models import calculate_trust_score, TRUST_SCORE_WEIGHTS
        
        # Calculate trust score breakdown
        verification_status = identity["verification_status"]
        account_age_years = (datetime.utcnow() - identity["created_at"]).days / 365.25
        
        breakdown = {}
        for check, verified in verification_status.items():
            if verified and check in TRUST_SCORE_WEIGHTS:
                breakdown[check] = TRUST_SCORE_WEIGHTS[check]
        
        return {
            "user_id": user_id,
            "trust_score": identity["trust_score"],
            "verification_level": identity["verification_level"],
            "breakdown": breakdown,
            "account_age_years": round(account_age_years, 1),
            "verification_count": sum(1 for v in verification_status.values() if v)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error calculating trust score: {str(e)}")

@router.get("/health")
async def identity_service_health():
    """Health check for Auth Identity service"""
    try:
        return {
            "status": "healthy",
            "capabilities": [
                "user_identity_creation",
                "verification_management",
                "username_change_processing",
                "avatar_change_processing", 
                "trust_score_calculation",
                "profile_card_generation"
            ],
            "verification_levels": ["level_0", "level_1", "level_2"],
            "supported_roles": ["buyer", "seller_brand", "visitor", "admin"],
            "ai_model": "openai/gpt-4o-mini",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }