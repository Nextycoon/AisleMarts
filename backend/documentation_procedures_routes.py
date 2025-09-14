from fastapi import APIRouter, Depends, HTTPException, Header, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from security import decode_access_token
from db import db
from documentation_procedures_service import documentation_procedures_service  
from documentation_procedures_models import WorkflowState, ApprovalLevel, PriorityLevel, WorkflowAction, ReviewerRole

router = APIRouter(prefix="/api/doc-procedures", tags=["Documentation Procedures"])

# Pydantic models for API
class CreateProcedureRequest(BaseModel):
    document_id: str
    document_data: Dict[str, Any]

class ApprovalRequest(BaseModel):
    approver_name: str
    approver_role: ReviewerRole
    comments: str = ""
    conditions: List[str] = []
    signature_hash: Optional[str] = None

class RejectionRequest(BaseModel):
    reviewer_name: str
    reviewer_role: ReviewerRole
    comments: str

class RevisionRequest(BaseModel):
    reviewer_name: str
    reviewer_role: str
    comments: str
    attachments: List[Dict[str, str]] = []

class CommentRequest(BaseModel):
    comment: str
    user_name: str
    user_role: str = "user"
    is_internal: bool = False
    attachments: List[Dict[str, str]] = []

class EscalationRequest(BaseModel):
    trigger: str = "manual_request"
    reason: str
    escalated_by: str

class WorkflowInsightsRequest(BaseModel):
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
async def create_document_procedure(
    request: CreateProcedureRequest,
    user = Depends(get_current_user_required)
):
    """Create new document procedure"""
    try:
        user_id = str(user["_id"])
        
        procedure_id = await documentation_procedures_service.create_document_procedure(
            request.document_id, request.document_data, user_id
        )
        
        return {
            "success": True,
            "procedure_id": procedure_id,
            "message": "Document procedure created successfully"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to create procedure: {str(e)}")

@router.get("/{procedure_id}")
async def get_document_procedure(
    procedure_id: str,
    user = Depends(get_current_user_required)
):
    """Get document procedure by ID"""
    try:
        procedure = await documentation_procedures_service.get_procedure(procedure_id)
        
        if not procedure:
            raise HTTPException(404, "Procedure not found")
        
        return procedure
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error retrieving procedure: {str(e)}")

@router.post("/{procedure_id}/submit")
async def submit_for_review(
    procedure_id: str,
    user = Depends(get_current_user_required)
):
    """Submit document for review"""
    try:
        user_id = str(user["_id"])
        
        result = await documentation_procedures_service.submit_for_review(procedure_id, user_id)
        
        if not result["success"]:
            raise HTTPException(400, result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error submitting for review: {str(e)}")

@router.post("/{procedure_id}/approve")
async def approve_document(
    procedure_id: str,
    request: ApprovalRequest,
    user = Depends(get_current_user_required)
):
    """Approve document"""
    try:
        user_id = str(user["_id"])
        approval_data = request.dict()
        
        result = await documentation_procedures_service.approve_document(
            procedure_id, user_id, approval_data
        )
        
        if not result["success"]:
            raise HTTPException(400, result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error approving document: {str(e)}")

@router.post("/{procedure_id}/reject")
async def reject_document(
    procedure_id: str,
    request: RejectionRequest,
    user = Depends(get_current_user_required)
):
    """Reject document"""
    try:
        user_id = str(user["_id"])
        rejection_data = request.dict()
        
        result = await documentation_procedures_service.reject_document(
            procedure_id, user_id, rejection_data
        )
        
        if not result["success"]:
            raise HTTPException(400, result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error rejecting document: {str(e)}")

@router.post("/{procedure_id}/request-revision")
async def request_revision(
    procedure_id: str,
    request: RevisionRequest,
    user = Depends(get_current_user_required)
):
    """Request document revision"""
    try:
        user_id = str(user["_id"])
        revision_data = request.dict()
        
        result = await documentation_procedures_service.request_revision(
            procedure_id, user_id, revision_data
        )
        
        if not result["success"]:
            raise HTTPException(400, result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error requesting revision: {str(e)}")

@router.post("/{procedure_id}/comment")
async def add_comment(
    procedure_id: str,
    request: CommentRequest,
    user = Depends(get_current_user_required)
):
    """Add comment to document procedure"""
    try:
        user_id = str(user["_id"])
        comment_data = request.dict()
        
        result = await documentation_procedures_service.add_comment(
            procedure_id, user_id, comment_data
        )
        
        if not result["success"]:
            raise HTTPException(400, result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error adding comment: {str(e)}")

@router.post("/{procedure_id}/escalate")
async def escalate_procedure(
    procedure_id: str,
    request: EscalationRequest,
    user = Depends(get_current_user_required)
):
    """Escalate document procedure"""
    try:
        escalation_data = request.dict()
        
        result = await documentation_procedures_service.escalate_procedure(
            procedure_id, escalation_data
        )
        
        if not result["success"]:
            raise HTTPException(400, result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error escalating procedure: {str(e)}")

@router.get("/my-procedures")
async def get_my_procedures(
    state: Optional[WorkflowState] = Query(None),
    priority: Optional[PriorityLevel] = Query(None),
    overdue_only: bool = Query(False),
    user = Depends(get_current_user_required)
):
    """Get user's procedures (created by or assigned to)"""
    try:
        user_id = str(user["_id"])
        
        filters = {}
        if state:
            filters["state"] = state.value
        if priority:
            filters["priority"] = priority.value
        if overdue_only:
            filters["overdue_only"] = True
        
        procedures = await documentation_procedures_service.get_user_procedures(user_id, filters)
        
        return {
            "procedures": procedures,
            "count": len(procedures),
            "filters": filters
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error retrieving procedures: {str(e)}")

@router.get("/pending-reviews")
async def get_pending_reviews(
    user = Depends(get_current_user_required)
):
    """Get procedures pending review by current user"""
    try:
        user_id = str(user["_id"])
        
        procedures = await documentation_procedures_service.get_pending_reviews(user_id)
        
        return {
            "procedures": procedures,
            "count": len(procedures),
            "message": f"You have {len(procedures)} procedures pending review"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error retrieving pending reviews: {str(e)}")

@router.post("/workflow-insights")
async def generate_workflow_insights(
    request: WorkflowInsightsRequest,
    user = Depends(get_current_user_required)
):
    """Generate AI-powered workflow insights"""
    try:
        insights = await documentation_procedures_service.generate_workflow_insights(request.context)
        
        if "error" in insights:
            raise HTTPException(500, insights["error"])
        
        return insights
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error generating insights: {str(e)}")

@router.get("/analytics")
async def get_workflow_analytics(
    time_period_days: int = Query(30, ge=1, le=365)
):
    """Get workflow analytics for time period"""
    try:
        analytics = await documentation_procedures_service.get_workflow_analytics(time_period_days)
        
        if "error" in analytics:
            raise HTTPException(500, analytics["error"])
        
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error getting analytics: {str(e)}")

@router.get("/templates")
async def get_workflow_templates():
    """Get available workflow templates"""
    try:
        templates = await documentation_procedures_service.get_workflow_templates()
        
        return {
            "templates": templates,
            "count": len(templates)
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting templates: {str(e)}")

@router.get("/reference-data")
async def get_reference_data():
    """Get reference data for procedures"""
    try:
        return {
            "workflow_states": [state.value for state in WorkflowState],
            "approval_levels": [level.value for level in ApprovalLevel],
            "priority_levels": [priority.value for priority in PriorityLevel],
            "workflow_actions": [action.value for action in WorkflowAction],
            "reviewer_roles": [role.value for role in ReviewerRole]
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting reference data: {str(e)}")

@router.get("/health")
async def documentation_procedures_health():
    """Health check for Documentation Procedures service"""
    try:
        return {
            "status": "healthy",
            "capabilities": [
                "procedure_creation",
                "workflow_management",
                "approval_processing",
                "escalation_handling",
                "sla_monitoring",
                "ai_insights_generation"
            ],
            "workflow_states": len([state for state in WorkflowState]),
            "approval_levels": len([level for level in ApprovalLevel]),
            "reviewer_roles": len([role for role in ReviewerRole]),
            "workflow_templates": 3,  # standard, high_value, regulatory
            "ai_model": "openai/gpt-4o-mini",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }