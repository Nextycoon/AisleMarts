from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from security import decode_access_token
from db import db
from procedures_by_category_service import procedures_by_category_service
from procedures_by_category_models import UserRole, OnboardingStep, Permission

router = APIRouter(prefix="/api/procedures", tags=["Procedures by Category"])

# Pydantic models for API
class CreateProcedureRequest(BaseModel):
    role: UserRole

class CompleteStepRequest(BaseModel):
    step: OnboardingStep
    step_data: Dict[str, Any] = {}

class UpdateVerificationRequest(BaseModel):
    verification_updates: Dict[str, bool]

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
    request: CreateProcedureRequest,
    user = Depends(get_current_user_required)
):
    """Create user procedure for role-based onboarding"""
    try:
        user_id = str(user["_id"])
        
        # Check if procedure already exists
        existing = await procedures_by_category_service.get_user_procedure(user_id)
        if existing:
            raise HTTPException(400, "User procedure already exists")
        
        procedure_id = await procedures_by_category_service.create_user_procedure(user_id, request.role)
        
        return {
            "success": True,
            "procedure_id": procedure_id,
            "role": request.role.value,
            "message": "User procedure created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to create user procedure: {str(e)}")

@router.get("/my-procedure")
async def get_my_procedure(user = Depends(get_current_user_required)):
    """Get current user's procedure"""
    try:
        user_id = str(user["_id"])
        procedure = await procedures_by_category_service.get_user_procedure(user_id)
        
        if not procedure:
            raise HTTPException(404, "No procedure found for user")
        
        return procedure
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error retrieving procedure: {str(e)}")

@router.post("/complete-step")
async def complete_onboarding_step(
    request: CompleteStepRequest,
    user = Depends(get_current_user_required)
):
    """Complete an onboarding step"""
    try:
        user_id = str(user["_id"])
        
        success = await procedures_by_category_service.complete_onboarding_step(
            user_id, request.step, request.step_data
        )
        
        if not success:
            raise HTTPException(400, "Failed to complete onboarding step")
        
        return {
            "success": True,
            "step": request.step.value,
            "message": "Onboarding step completed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error completing step: {str(e)}")

@router.get("/progress")
async def get_onboarding_progress(user = Depends(get_current_user_required)):
    """Get user's onboarding progress"""
    try:
        user_id = str(user["_id"])
        progress = await procedures_by_category_service.get_onboarding_progress(user_id)
        
        return progress
        
    except Exception as e:
        raise HTTPException(500, f"Error getting progress: {str(e)}")

@router.get("/permissions")
async def get_user_permissions(user = Depends(get_current_user_required)):
    """Get user's granted permissions"""
    try:
        user_id = str(user["_id"])
        permissions = await procedures_by_category_service.get_user_permissions(user_id)
        
        return {
            "permissions": permissions,
            "count": len(permissions)
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting permissions: {str(e)}")

@router.get("/permissions/check/{permission}")
async def check_user_permission(
    permission: str,
    user = Depends(get_current_user_required)
):
    """Check if user has specific permission"""
    try:
        user_id = str(user["_id"])
        
        # Validate permission
        try:
            perm = Permission(permission)
        except ValueError:
            raise HTTPException(400, f"Invalid permission: {permission}")
        
        has_permission = await procedures_by_category_service.check_user_permission(user_id, perm)
        
        return {
            "permission": permission,
            "granted": has_permission
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error checking permission: {str(e)}")

@router.put("/verification")
async def update_verification_status(
    request: UpdateVerificationRequest,
    user = Depends(get_current_user_required)
):
    """Update user's verification status"""
    try:
        user_id = str(user["_id"])
        
        success = await procedures_by_category_service.update_verification_status(
            user_id, request.verification_updates
        )
        
        if not success:
            raise HTTPException(400, "Failed to update verification status")
        
        return {
            "success": True,
            "updates": request.verification_updates,
            "message": "Verification status updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error updating verification: {str(e)}")

@router.get("/badge")
async def get_user_badge_info(user = Depends(get_current_user_required)):
    """Get user's badge information"""
    try:
        user_id = str(user["_id"])
        badge_info = await procedures_by_category_service.get_user_badge_info(user_id)
        
        return badge_info
        
    except Exception as e:
        raise HTTPException(500, f"Error getting badge info: {str(e)}")

@router.get("/requirements/{role}")
async def get_category_requirements(role: UserRole):
    """Get requirements for user category"""
    try:
        requirements = await procedures_by_category_service.get_category_requirements(role)
        
        return requirements
        
    except Exception as e:
        raise HTTPException(500, f"Error getting requirements: {str(e)}")

@router.get("/suggestions")
async def get_onboarding_suggestions(user = Depends(get_current_user_required)):
    """Get AI-powered onboarding improvement suggestions"""
    try:
        user_id = str(user["_id"])
        suggestions = await procedures_by_category_service.suggest_onboarding_improvements(user_id)
        
        return {
            "suggestions": suggestions,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting suggestions: {str(e)}")

@router.get("/analytics")
async def get_user_analytics(user = Depends(get_current_user_required)):
    """Get user procedure analytics"""
    try:
        user_id = str(user["_id"])
        analytics = await procedures_by_category_service.get_user_analytics(user_id)
        
        return analytics
        
    except Exception as e:
        raise HTTPException(500, f"Error getting analytics: {str(e)}")

@router.get("/categories")
async def get_available_categories():
    """Get all available user categories and configurations"""
    try:
        categories = await procedures_by_category_service.get_available_categories()
        
        return categories
        
    except Exception as e:
        raise HTTPException(500, f"Error getting categories: {str(e)}")

@router.get("/roles")
async def get_available_roles():
    """Get available user roles"""
    try:
        return {
            "roles": [role.value for role in UserRole],
            "onboarding_steps": [step.value for step in OnboardingStep],
            "permissions": [perm.value for perm in Permission]
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting roles: {str(e)}")

@router.get("/health")
async def procedures_service_health():
    """Health check for Procedures by Category service"""
    try:
        return {
            "status": "healthy",
            "capabilities": [
                "role_based_onboarding",
                "verification_management",
                "permission_system",
                "badge_system",
                "progress_tracking",
                "ai_suggestions"
            ],
            "supported_roles": [role.value for role in UserRole],
            "onboarding_steps": len([step for step in OnboardingStep]),
            "permission_types": len([perm for perm in Permission]),
            "ai_model": "openai/gpt-4o-mini",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }