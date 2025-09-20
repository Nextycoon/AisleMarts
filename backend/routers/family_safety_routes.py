"""
AisleMarts Family Safety Routes - BlueWave System
==============================================
Complete backend API endpoints for family safety and wellbeing management.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import logging

from services.family_safety_service import family_safety_service, UserRole, SafetyLevel, ActivityCategory

router = APIRouter(prefix="/api/family", tags=["family_safety"])
logger = logging.getLogger(__name__)

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class ScreenTimeTrackRequest(BaseModel):
    user_id: str
    app_name: str
    minutes: int
    category: ActivityCategory

class ScreenTimeLimitRequest(BaseModel):
    user_id: str
    daily_limit_minutes: int
    set_by_user_id: str

class CreateFamilyRequest(BaseModel):
    parent_user_id: str
    family_name: str

class GenerateInviteRequest(BaseModel):
    family_id: str
    inviter_user_id: str
    invite_type: str = "general"

class JoinFamilyRequest(BaseModel):
    invite_code: str
    user_id: str
    user_name: str
    user_age: Optional[int] = None

class PurchaseApprovalCheck(BaseModel):
    user_id: str
    amount: float
    item_description: str

class PurchaseApprovalRequest(BaseModel):
    user_id: str
    amount: float
    item_description: str
    merchant: str

class ApprovePurchaseRequest(BaseModel):
    request_id: str
    parent_user_id: str
    approved: bool
    notes: Optional[str] = None

# ============================================================================
# HEALTH & STATUS ENDPOINTS
# ============================================================================

@router.get("/health")
async def get_family_safety_health():
    """Get family safety system health status"""
    try:
        status = await family_safety_service.get_system_status()
        logger.info("✅ Family Safety health check successful")
        return status
    except Exception as e:
        logger.error(f"❌ Family Safety health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# ============================================================================
# SCREEN TIME MANAGEMENT ENDPOINTS
# ============================================================================

@router.post("/screen-time/track")
async def track_screen_time(request: ScreenTimeTrackRequest):
    """Track user screen time activity"""
    try:
        result = await family_safety_service.track_screen_time(
            user_id=request.user_id,
            app_name=request.app_name,
            minutes=request.minutes,
            category=request.category
        )
        
        if result["success"]:
            logger.info(f"✅ Screen time tracked for user {request.user_id}: {request.minutes}m")
            return result
        else:
            logger.error(f"❌ Screen time tracking failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(status_code=400, detail=result.get("error", "Tracking failed"))
            
    except Exception as e:
        logger.error(f"❌ Screen time tracking error: {e}")
        raise HTTPException(status_code=500, detail=f"Tracking error: {str(e)}")

@router.get("/screen-time/{user_id}")
async def get_screen_time_summary(user_id: str, period: str = "today"):
    """Get screen time summary for user"""
    try:
        result = await family_safety_service.get_screen_time_summary(user_id, period)
        
        if result["success"]:
            logger.info(f"✅ Screen time summary retrieved for user {user_id}")
            return result
        else:
            logger.error(f"❌ Screen time summary failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(status_code=404, detail=result.get("error", "Data not found"))
            
    except Exception as e:
        logger.error(f"❌ Screen time summary error: {e}")
        raise HTTPException(status_code=500, detail=f"Summary error: {str(e)}")

@router.post("/screen-time/limit")
async def set_screen_time_limit(request: ScreenTimeLimitRequest):
    """Set screen time limit for user"""
    try:
        result = await family_safety_service.set_screen_time_limit(
            user_id=request.user_id,
            daily_limit_minutes=request.daily_limit_minutes,
            set_by_user_id=request.set_by_user_id
        )
        
        if result["success"]:
            logger.info(f"✅ Screen time limit set for user {request.user_id}")
            return result
        else:
            logger.error(f"❌ Set screen time limit failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(status_code=403, detail=result.get("error", "Permission denied"))
            
    except Exception as e:
        logger.error(f"❌ Set screen time limit error: {e}")
        raise HTTPException(status_code=500, detail=f"Limit setting error: {str(e)}")

# ============================================================================
# FAMILY PAIRING & MANAGEMENT ENDPOINTS
# ============================================================================

@router.post("/create")
async def create_family(request: CreateFamilyRequest):
    """Create a new family group"""
    try:
        result = await family_safety_service.create_family(
            parent_user_id=request.parent_user_id,
            family_name=request.family_name
        )
        
        if result["success"]:
            logger.info(f"✅ Family created: {request.family_name}")
            return result
        else:
            logger.error(f"❌ Family creation failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(status_code=400, detail=result.get("error", "Creation failed"))
            
    except Exception as e:
        logger.error(f"❌ Family creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Creation error: {str(e)}")

@router.post("/invite/generate")
async def generate_family_invite(request: GenerateInviteRequest):
    """Generate family invitation link/code"""
    try:
        result = await family_safety_service.generate_family_invite(
            family_id=request.family_id,
            inviter_user_id=request.inviter_user_id,
            invite_type=request.invite_type
        )
        
        if result["success"]:
            logger.info(f"✅ Family invite generated for family {request.family_id}")
            return result
        else:
            logger.error(f"❌ Family invite generation failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(status_code=403, detail=result.get("error", "Permission denied"))
            
    except Exception as e:
        logger.error(f"❌ Family invite generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Invite generation error: {str(e)}")

@router.post("/join")
async def join_family(request: JoinFamilyRequest):
    """Join family using invite code"""
    try:
        result = await family_safety_service.join_family(
            invite_code=request.invite_code,
            user_id=request.user_id,
            user_name=request.user_name,
            user_age=request.user_age
        )
        
        if result["success"]:
            logger.info(f"✅ User {request.user_id} joined family")
            return result
        else:
            logger.error(f"❌ Family join failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(status_code=400, detail=result.get("error", "Join failed"))
            
    except Exception as e:
        logger.error(f"❌ Family join error: {e}")
        raise HTTPException(status_code=500, detail=f"Join error: {str(e)}")

@router.get("/dashboard/{family_id}")
async def get_family_dashboard(family_id: str, requesting_user_id: str):
    """Get comprehensive family dashboard data"""
    try:
        result = await family_safety_service.get_family_dashboard(family_id, requesting_user_id)
        
        if result["success"]:
            logger.info(f"✅ Family dashboard retrieved for family {family_id}")
            return result
        else:
            logger.error(f"❌ Family dashboard failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(status_code=403, detail=result.get("error", "Permission denied"))
            
    except Exception as e:
        logger.error(f"❌ Family dashboard error: {e}")
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")

# ============================================================================
# BUDGET MONITORING & PURCHASE APPROVAL ENDPOINTS
# ============================================================================

@router.post("/purchase/check-approval")
async def check_purchase_approval(request: PurchaseApprovalCheck):
    """Check if purchase requires parental approval"""
    try:
        result = await family_safety_service.check_purchase_approval(
            user_id=request.user_id,
            amount=request.amount,
            item_description=request.item_description
        )
        
        logger.info(f"✅ Purchase approval check for user {request.user_id}: ${request.amount}")
        return result
            
    except Exception as e:
        logger.error(f"❌ Purchase approval check error: {e}")
        raise HTTPException(status_code=500, detail=f"Approval check error: {str(e)}")

@router.post("/purchase/request-approval")
async def request_purchase_approval(request: PurchaseApprovalRequest):
    """Request purchase approval from parents"""
    try:
        result = await family_safety_service.request_purchase_approval(
            user_id=request.user_id,
            amount=request.amount,
            item_description=request.item_description,
            merchant=request.merchant
        )
        
        if result["success"]:
            logger.info(f"✅ Purchase approval requested for user {request.user_id}")
            return result
        else:
            logger.error(f"❌ Purchase approval request failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(status_code=400, detail=result.get("error", "Request failed"))
            
    except Exception as e:
        logger.error(f"❌ Purchase approval request error: {e}")
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")

# ============================================================================
# SAFETY INSIGHTS & RECOMMENDATIONS ENDPOINTS
# ============================================================================

@router.get("/insights/{user_id}")
async def get_safety_insights(user_id: str):
    """Get personalized safety insights for user"""
    try:
        insights = await family_safety_service.generate_safety_insights(user_id)
        
        logger.info(f"✅ Safety insights generated for user {user_id}")
        return {
            "success": True,
            "user_id": user_id,
            "insights_count": len(insights),
            "insights": [
                {
                    "insight_id": insight.insight_id,
                    "category": insight.category,
                    "title": insight.title,
                    "description": insight.description,
                    "icon": insight.icon,
                    "priority": insight.priority,
                    "action_required": insight.action_required,
                    "timestamp": insight.timestamp.isoformat()
                }
                for insight in insights
            ]
        }
            
    except Exception as e:
        logger.error(f"❌ Safety insights error: {e}")
        raise HTTPException(status_code=500, detail=f"Insights error: {str(e)}")

# ============================================================================
# BADGES & MISSIONS ENDPOINTS
# ============================================================================

@router.get("/badges/{user_id}")
async def get_user_badges(user_id: str):
    """Get user's badges and progress"""
    try:
        # Mock badges data for now - would integrate with actual badge system
        badges = [
            {
                "id": "1",
                "name": "Sleep Champion",
                "icon": "💤",
                "earned": True,
                "progress": 100,
                "description": "8+ hours sleep for 7 days",
                "earned_at": "2024-01-15T10:30:00Z"
            },
            {
                "id": "2",
                "name": "Screen Time Master",
                "icon": "⏱️",
                "earned": False,
                "progress": 75,
                "description": "Stay under daily limit",
                "target_date": "2024-01-20T00:00:00Z"
            },
            {
                "id": "3",
                "name": "Digital Wellbeing",
                "icon": "📱",
                "earned": False,
                "progress": 60,
                "description": "Take regular breaks",
                "target_date": "2024-01-25T00:00:00Z"
            },
            {
                "id": "4",
                "name": "Safety Scout",
                "icon": "🛡️",
                "earned": True,
                "progress": 100,
                "description": "Use all safety features",
                "earned_at": "2024-01-10T14:20:00Z"
            },
            {
                "id": "5",
                "name": "Family Bond",
                "icon": "🏠",
                "earned": False,
                "progress": 85,
                "description": "Build family connection",
                "target_date": "2024-01-22T00:00:00Z"
            }
        ]
        
        logger.info(f"✅ Badges retrieved for user {user_id}")
        return {
            "success": True,
            "user_id": user_id,
            "total_badges": len(badges),
            "earned_badges": len([b for b in badges if b["earned"]]),
            "badges": badges
        }
            
    except Exception as e:
        logger.error(f"❌ Badges retrieval error: {e}")
        raise HTTPException(status_code=500, detail=f"Badges error: {str(e)}")

@router.get("/missions/{user_id}")
async def get_user_missions(user_id: str):
    """Get user's current missions"""
    try:
        # Mock missions data for now - would integrate with actual mission system
        missions = [
            {
                "id": "1",
                "title": "Take 3 Screen Breaks",
                "description": "Take a 5-minute break every hour while shopping",
                "icon": "⏰",
                "progress": 2,
                "target": 3,
                "reward": "15 points",
                "expires_at": "2024-01-17T23:59:59Z"
            },
            {
                "id": "2",
                "title": "Compare 5 Prices",
                "description": "Use price comparison for 5 different products",
                "icon": "💰",
                "progress": 3,
                "target": 5,
                "reward": "25 points",
                "expires_at": "2024-01-18T23:59:59Z"
            },
            {
                "id": "3",
                "title": "Family Connection",
                "description": "Share a product with a family member",
                "icon": "👨‍👩‍👧‍👦",
                "progress": 0,
                "target": 1,
                "reward": "20 points",
                "expires_at": "2024-01-19T23:59:59Z"
            }
        ]
        
        logger.info(f"✅ Missions retrieved for user {user_id}")
        return {
            "success": True,
            "user_id": user_id,
            "active_missions": len(missions),
            "missions": missions
        }
            
    except Exception as e:
        logger.error(f"❌ Missions retrieval error: {e}")
        raise HTTPException(status_code=500, detail=f"Missions error: {str(e)}")

# ============================================================================
# NOTIFICATIONS & ALERTS ENDPOINTS
# ============================================================================

@router.get("/notifications/{user_id}")
async def get_family_notifications(user_id: str):
    """Get family safety notifications for user"""
    try:
        # Mock notifications data
        notifications = [
            {
                "id": "1",
                "type": "screen_time_limit",
                "title": "Screen Time Reminder", 
                "message": "You have 30 minutes left of your daily screen time",
                "icon": "⏰",
                "priority": "medium",
                "created_at": "2024-01-16T15:30:00Z",
                "read": False
            },
            {
                "id": "2",
                "type": "purchase_approval",
                "title": "Purchase Approved",
                "message": "Your request for Designer Handbag ($89.99) has been approved",
                "icon": "✅",
                "priority": "high",
                "created_at": "2024-01-16T14:15:00Z",
                "read": False
            },
            {
                "id": "3",
                "type": "family_invite",
                "title": "New Family Member",
                "message": "Sarah joined your family group",
                "icon": "👥",
                "priority": "low",
                "created_at": "2024-01-16T12:00:00Z",
                "read": True
            }
        ]
        
        logger.info(f"✅ Notifications retrieved for user {user_id}")
        return {
            "success": True,
            "user_id": user_id,
            "total_notifications": len(notifications),
            "unread_count": len([n for n in notifications if not n["read"]]),
            "notifications": notifications
        }
            
    except Exception as e:
        logger.error(f"❌ Notifications retrieval error: {e}")
        raise HTTPException(status_code=500, detail=f"Notifications error: {str(e)}")

logger.info("✅ Family Safety Routes initialized with BlueWave system")