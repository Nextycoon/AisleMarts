from fastapi import APIRouter, Depends, HTTPException, Header, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from security import decode_access_token
from db import db
from procedures_by_category_service import procedures_by_category_service
from procedures_by_category_models import UserRole, OnboardingStep, Permission

router = APIRouter(prefix="/api/procedures", tags=["Procedures by Category"])

# Pydantic models for API
class CreateUserProcedureRequest(BaseModel):
    role: UserRole

class CompleteStepRequest(BaseModel):
    step: OnboardingStep
    step_data: Dict[str, Any] = {}

class OnboardingGuidanceRequest(BaseModel):
    context: Dict[str, Any] = {}

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

@router.post("/create")
async def create_user_procedure(
    request: CreateUserProcedureRequest,
    user = Depends(get_current_user_required)
):
    """Create user procedure workflow"""
    try:
        user_id = str(user["_id"])
        
        # Check if procedure already exists
        existing = await procedures_by_category_service.get_user_procedure(user_id)
        if existing:
            return {
                "success": True,
                "procedure_id": existing["_id"],
                "message": "User procedure already exists",
                "existing": True
            }
        
        procedure_id = await procedures_by_category_service.create_user_procedure(user_id, request.role)
        
        return {
            "success": True,
            "procedure_id": procedure_id,
            "role": request.role.value,
            "message": "User procedure created successfully"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to create user procedure: {str(e)}")

@router.get("/my-procedure")
async def get_my_procedure(
    user = Depends(get_current_user_required)
):
    """Get current user's procedure"""
    try:
        user_id = str(user["_id"])
        procedure = await procedures_by_category_service.get_user_procedure(user_id)
        
        if not procedure:
            raise HTTPException(404, "User procedure not found")
        
        return procedure
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error retrieving user procedure: {str(e)}")

@router.get("/progress")
async def get_onboarding_progress(
    user = Depends(get_current_user_required)
):
    """Get user's onboarding progress"""
    try:
        user_id = str(user["_id"])
        progress = await procedures_by_category_service.get_onboarding_progress(user_id)
        
        if "error" in progress:
            raise HTTPException(404, progress["error"])
        
        return progress
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error getting onboarding progress: {str(e)}")

@router.post("/complete-step")
async def complete_onboarding_step(
    request: CompleteStepRequest,
    user = Depends(get_current_user_required)
):
    """Complete an onboarding step"""
    try:
        user_id = str(user["_id"])
        
        result = await procedures_by_category_service.complete_onboarding_step(
            user_id, request.step, request.step_data
        )
        
        if not result["success"]:
            raise HTTPException(400, result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error completing step: {str(e)}")

@router.get("/permissions")
async def get_user_permissions(
    user = Depends(get_current_user_required)
):
    """Get user's granted permissions"""
    try:
        user_id = str(user["_id"])
        permissions = await procedures_by_category_service.get_user_permissions(user_id)
        
        return {
            "user_id": user_id,
            "permissions": permissions,
            "count": len(permissions)
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting permissions: {str(e)}")

@router.get("/permissions/{permission}/check")
async def check_user_permission(
    permission: Permission,
    user = Depends(get_current_user_required)
):
    """Check if user has specific permission"""
    try:
        user_id = str(user["_id"])
        has_permission = await procedures_by_category_service.check_user_permission(user_id, permission)
        
        return {
            "user_id": user_id,
            "permission": permission.value,
            "granted": has_permission
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error checking permission: {str(e)}")

@router.get("/badge")
async def get_user_badge(
    user = Depends(get_current_user_required)
):
    """Get user's verification badge"""
    try:
        user_id = str(user["_id"])
        badge_info = await procedures_by_category_service.get_user_badge(user_id)
        
        return badge_info
        
    except Exception as e:
        raise HTTPException(500, f"Error getting user badge: {str(e)}")

@router.post("/reverification")
async def request_reverification(
    user = Depends(get_current_user_required)
):
    """Request user reverification"""
    try:
        user_id = str(user["_id"])
        result = await procedures_by_category_service.request_reverification(user_id)
        
        if not result["success"]:
            raise HTTPException(400, result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error requesting reverification: {str(e)}")

@router.post("/guidance")
async def generate_onboarding_guidance(
    request: OnboardingGuidanceRequest,
    user = Depends(get_current_user_required)
):
    """Generate AI-powered onboarding guidance"""
    try:
        user_id = str(user["_id"])
        
        guidance = await procedures_by_category_service.generate_onboarding_guidance(
            user_id, request.context
        )
        
        if "error" in guidance:
            raise HTTPException(404, guidance["error"])
        
        return guidance
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error generating guidance: {str(e)}")

@router.get("/analytics")
async def get_user_analytics(
    user = Depends(get_current_user_required)
):
    """Get user procedure analytics"""
    try:
        user_id = str(user["_id"])
        analytics = await procedures_by_category_service.get_user_analytics(user_id)
        
        if "error" in analytics:
            raise HTTPException(404, analytics["error"])
        
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error getting analytics: {str(e)}")

@router.get("/categories")
async def get_category_configurations():
    """Get all user category configurations"""
    try:
        configurations = await procedures_by_category_service.get_category_configurations()
        
        return configurations
        
    except Exception as e:
        raise HTTPException(500, f"Error getting configurations: {str(e)}")

@router.get("/reference-data")
async def get_reference_data():
    """Get reference data for procedures"""
    try:
        return {
            "user_roles": [role.value for role in UserRole],
            "onboarding_steps": [step.value for step in OnboardingStep],
            "permissions": [perm.value for perm in Permission],
            "verification_badges": ["blue", "green", "none"]
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting reference data: {str(e)}")

@router.get("/health")
async def procedures_service_health():
    """Health check for Procedures by Category service"""
    try:
        return {
            "status": "healthy",
            "capabilities": [
                "user_procedure_creation",
                "onboarding_step_completion",
                "progress_tracking",
                "permission_management",
                "badge_verification",
                "ai_guidance_generation"
            ],
            "user_categories": 2,  # companies_brands, visitors_buyers
            "onboarding_steps": len([step for step in OnboardingStep]),
            "permissions": len([perm for perm in Permission]),
            "verification_badges": ["blue", "green", "none"],
            "ai_model": "openai/gpt-4o-mini",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }