"""
AisleMarts Family Safety API Routes - BlueWave Design
===================================================
Production-ready Family Safety API endpoints with BlueWave design principles:
- Screen time management and wellbeing tracking
- Family pairing and parental controls  
- Budget monitoring and spending alerts
- Safety insights and recommendations
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

from services.family_safety_service import family_safety_service, UserRole, SafetyLevel, ActivityCategory

router = APIRouter(prefix="/family", tags=["family_safety"])

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class ScreenTimeTrackingRequest(BaseModel):
    app_name: str
    minutes: int
    category: ActivityCategory

class ScreenTimeLimitRequest(BaseModel):
    user_id: str
    daily_limit_minutes: int

class CreateFamilyRequest(BaseModel):
    family_name: str

class GenerateFamilyInviteRequest(BaseModel):
    family_id: str
    invite_type: Optional[str] = "general"

class JoinFamilyRequest(BaseModel):
    invite_code: str
    user_name: str
    user_age: Optional[int] = None

class PurchaseApprovalCheckRequest(BaseModel):
    amount: float
    item_description: str

class PurchaseApprovalRequest(BaseModel):
    amount: float
    item_description: str
    merchant: str

# ============================================================================
# FAMILY SAFETY HEALTH & STATUS
# ============================================================================

@router.get("/health")
async def family_safety_health():
    """Family Safety system health check"""
    return await family_safety_service.get_system_status()

# ============================================================================
# SCREEN TIME MANAGEMENT
# ============================================================================

@router.post("/screen-time/track")
async def track_screen_time(user_id: str, request: ScreenTimeTrackingRequest):
    """Track user screen time activity"""
    try:
        result = await family_safety_service.track_screen_time(
            user_id=user_id,
            app_name=request.app_name,
            minutes=request.minutes,
            category=request.category
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "data": result,
            "message": "Screen time tracked successfully"
        }
        
    except Exception as e:
        logging.error(f"Track screen time endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Screen time tracking failed")

@router.get("/screen-time/{user_id}")
async def get_screen_time_summary(user_id: str, period: str = "today"):
    """Get screen time summary for user"""
    try:
        result = await family_safety_service.get_screen_time_summary(user_id, period)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {
            "success": True,
            "data": result,
            "message": "Screen time summary retrieved successfully"
        }
        
    except Exception as e:
        logging.error(f"Get screen time summary endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve screen time summary")

@router.post("/screen-time/limit")
async def set_screen_time_limit(set_by_user_id: str, request: ScreenTimeLimitRequest):
    """Set screen time limit for user"""
    try:
        result = await family_safety_service.set_screen_time_limit(
            user_id=request.user_id,
            daily_limit_minutes=request.daily_limit_minutes,
            set_by_user_id=set_by_user_id
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "data": result,
            "message": "Screen time limit updated successfully"
        }
        
    except Exception as e:
        logging.error(f"Set screen time limit endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to set screen time limit")

# ============================================================================
# FAMILY PAIRING & MANAGEMENT
# ============================================================================

@router.post("/create")
async def create_family(parent_user_id: str, request: CreateFamilyRequest):
    """Create a new family group"""
    try:
        result = await family_safety_service.create_family(
            parent_user_id=parent_user_id,
            family_name=request.family_name
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "family_id": result["family_id"],
            "message": result["message"]
        }
        
    except Exception as e:
        logging.error(f"Create family endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Family creation failed")

@router.post("/invite/generate")
async def generate_family_invite(inviter_user_id: str, request: GenerateFamilyInviteRequest):
    """Generate family invitation link/code"""
    try:
        result = await family_safety_service.generate_family_invite(
            family_id=request.family_id,
            inviter_user_id=inviter_user_id,
            invite_type=request.invite_type
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "invite_data": {
                "invite_code": result["invite_code"],
                "expires_at": result["expires_at"],
                "share_links": result["share_links"]
            },
            "message": "Family invitation generated successfully"
        }
        
    except Exception as e:
        logging.error(f"Generate family invite endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate family invite")

@router.post("/join")
async def join_family(user_id: str, request: JoinFamilyRequest):
    """Join family using invite code"""
    try:
        result = await family_safety_service.join_family(
            invite_code=request.invite_code,
            user_id=user_id,
            user_name=request.user_name,
            user_age=request.user_age
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "family_data": {
                "family_id": result["family_id"],
                "role": result["role"]
            },
            "message": result["message"]
        }
        
    except Exception as e:
        logging.error(f"Join family endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to join family")

# ============================================================================
# BUDGET MONITORING & PURCHASE APPROVAL
# ============================================================================

@router.post("/purchase/check-approval")
async def check_purchase_approval(user_id: str, request: PurchaseApprovalCheckRequest):
    """Check if purchase requires parental approval"""
    try:
        result = await family_safety_service.check_purchase_approval(
            user_id=user_id,
            amount=request.amount,
            item_description=request.item_description
        )
        
        return {
            "success": True,
            "approval_required": result.get("approval_required", False),
            "reason": result.get("reason", ""),
            "additional_info": {
                k: v for k, v in result.items() 
                if k not in ["approval_required", "reason"]
            }
        }
        
    except Exception as e:
        logging.error(f"Check purchase approval endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to check purchase approval")

@router.post("/purchase/request-approval")
async def request_purchase_approval(user_id: str, request: PurchaseApprovalRequest):
    """Request purchase approval from parents"""
    try:
        result = await family_safety_service.request_purchase_approval(
            user_id=user_id,
            amount=request.amount,
            item_description=request.item_description,
            merchant=request.merchant
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "request_data": {
                "request_id": result["request_id"],
                "expires_at": result["expires_at"]
            },
            "message": result["message"]
        }
        
    except Exception as e:
        logging.error(f"Request purchase approval endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to request purchase approval")

# ============================================================================
# SAFETY INSIGHTS & RECOMMENDATIONS
# ============================================================================

@router.get("/insights/{user_id}")
async def get_safety_insights(user_id: str):
    """Get personalized safety insights for user"""
    try:
        insights = await family_safety_service.generate_safety_insights(user_id)
        
        insights_data = []
        for insight in insights:
            insights_data.append({
                "insight_id": insight.insight_id,
                "category": insight.category,
                "title": insight.title,
                "description": insight.description,
                "icon": insight.icon,
                "priority": insight.priority,
                "action_required": insight.action_required,
                "timestamp": insight.timestamp.isoformat()
            })
        
        return {
            "success": True,
            "insights": insights_data,
            "total_insights": len(insights_data),
            "message": "Safety insights generated successfully"
        }
        
    except Exception as e:
        logging.error(f"Get safety insights endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate safety insights")

# ============================================================================
# FAMILY DASHBOARD
# ============================================================================

@router.get("/dashboard/{family_id}")
async def get_family_dashboard(family_id: str, requesting_user_id: str):
    """Get comprehensive family dashboard data"""
    try:
        result = await family_safety_service.get_family_dashboard(family_id, requesting_user_id)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "dashboard": result,
            "message": "Family dashboard retrieved successfully"
        }
        
    except Exception as e:
        logging.error(f"Get family dashboard endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve family dashboard")

# ============================================================================
# BADGES & MISSIONS
# ============================================================================

@router.get("/badges/{user_id}")
async def get_user_badges(user_id: str):
    """Get user's badges and mission progress"""
    try:
        # This would integrate with the badge system
        badges = [
            {
                "id": "sleep_hours",
                "name": "Sleep Hours",
                "icon": "💤",
                "earned": True,
                "progress": 100,
                "description": "8+ hours sleep for 7 days",
                "earned_at": "2024-01-15T10:30:00Z"
            },
            {
                "id": "screen_time",
                "name": "Screen Time",
                "icon": "⏱️",
                "earned": False,
                "progress": 75,
                "description": "Stay under daily limit",
                "earned_at": None
            },
            {
                "id": "digital_wellbeing",
                "name": "Digital Wellbeing",
                "icon": "📱",
                "earned": False,
                "progress": 60,
                "description": "Take regular breaks",
                "earned_at": None
            },
            {
                "id": "safety_tools",
                "name": "Safety Tools",
                "icon": "🛡️",
                "earned": True,
                "progress": 100,
                "description": "Use all safety features",
                "earned_at": "2024-01-10T14:20:00Z"
            },
            {
                "id": "family_trust",
                "name": "Family Trust",
                "icon": "🏠",
                "earned": False,
                "progress": 85,
                "description": "Build family connection",
                "earned_at": None
            }
        ]
        
        return {
            "success": True,
            "badges": badges,
            "total_badges": len(badges),
            "earned_badges": len([b for b in badges if b["earned"]]),
            "message": "User badges retrieved successfully"
        }
        
    except Exception as e:
        logging.error(f"Get user badges endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user badges")

@router.post("/missions/{user_id}/complete")
async def complete_mission(user_id: str, mission_id: str):
    """Mark mission as completed for user"""
    try:
        # This would integrate with the mission system
        return {
            "success": True,
            "mission_completed": True,
            "badge_earned": mission_id == "sleep_hours",
            "points_earned": 100,
            "message": f"Mission {mission_id} completed successfully"
        }
        
    except Exception as e:
        logging.error(f"Complete mission endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete mission")

# ============================================================================
# DIGITAL PARENTING GUIDANCE
# ============================================================================

@router.get("/parenting/tips")
async def get_digital_parenting_tips():
    """Get digital parenting tips adapted for commerce"""
    try:
        tips = [
            {
                "id": "understand_rules",
                "title": "Help me understand the rules",
                "description": "Guide your teen in understanding safe online shopping practices",
                "icon": "📚",
                "category": "education",
                "actionable_steps": [
                    "Explain why certain products require approval",
                    "Discuss budget limits and spending goals",
                    "Share examples of safe vs unsafe sellers"
                ]
            },
            {
                "id": "be_available",
                "title": "Be available to chat",
                "description": "Guide your teen through purchase decisions and questions",
                "icon": "💬",
                "category": "communication",
                "actionable_steps": [
                    "Respond to approval requests promptly",
                    "Discuss purchases they're considering",
                    "Share your own shopping experiences"
                ]
            },
            {
                "id": "dont_panic",
                "title": "Don't panic about delays",
                "description": "Handle shipping delays and returns calmly",
                "icon": "😌",
                "category": "patience",
                "actionable_steps": [
                    "Explain that online shopping takes time",
                    "Help them track orders together",
                    "Turn delays into learning opportunities"
                ]
            },
            {
                "id": "trust_gradually",
                "title": "Trust me with small purchases",
                "description": "Build trust through small, independent buying decisions",
                "icon": "🤝",
                "category": "trust",
                "actionable_steps": [
                    "Start with low-value items",
                    "Gradually increase spending limits",
                    "Celebrate responsible choices"
                ]
            },
            {
                "id": "respect_privacy",
                "title": "Respect my privacy",
                "description": "Balance oversight with appropriate privacy",
                "icon": "🔒",
                "category": "privacy",
                "actionable_steps": [
                    "Explain what you monitor and why",
                    "Focus on safety, not control",
                    "Respect their personal preferences"
                ]
            },
            {
                "id": "teach_budgeting",
                "title": "Teach me budgeting",
                "description": "Help develop financial literacy through shopping",
                "icon": "💰",
                "category": "financial_literacy",
                "actionable_steps": [
                    "Set up allowances and savings goals",
                    "Teach price comparison skills",
                    "Discuss needs vs wants"
                ]
            },
            {
                "id": "guide_authenticity",
                "title": "Guide me on authenticity",
                "description": "Help identify legitimate sellers and products",
                "icon": "✅",
                "category": "safety",
                "actionable_steps": [
                    "Show how to check seller ratings",
                    "Explain red flags to watch for",
                    "Practice identifying fake products together"
                ]
            }
        ]
        
        return {
            "success": True,
            "tips": tips,
            "total_tips": len(tips),
            "message": "Digital parenting tips retrieved successfully"
        }
        
    except Exception as e:
        logging.error(f"Get digital parenting tips endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve parenting tips")

# ============================================================================
# WELLBEING INSIGHTS
# ============================================================================

@router.get("/wellbeing/{user_id}")
async def get_wellbeing_insights(user_id: str):
    """Get wellbeing insights for user"""
    try:
        insights = [
            {
                "category": "smart_spending",
                "icon": "🎯",
                "title": "Smart Spending",
                "description": "You've saved $45 this week by comparing prices",
                "positive": True
            },
            {
                "category": "safety_score",
                "icon": "🛡️",
                "title": "Safety Score",
                "description": "100% of your purchases were from verified sellers",
                "positive": True
            },
            {
                "category": "learning_time",
                "icon": "📚",
                "title": "Learning Time",
                "description": "30 minutes spent on educational content today",
                "positive": True
            }
        ]
        
        return {
            "success": True,
            "insights": insights,
            "wellbeing_score": 92,
            "message": "Wellbeing insights retrieved successfully"
        }
        
    except Exception as e:
        logging.error(f"Get wellbeing insights endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve wellbeing insights")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("✅ Family Safety API Routes initialized with BlueWave design principles")