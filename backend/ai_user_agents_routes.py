from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime

from security import decode_access_token
from db import db
from ai_user_agents_service import ai_user_agents_service
from ai_user_agents_models import (
    AgentRole, DelegationMode, TaskStatus, AgentStyle, PriorityRule,
    AgentConfiguration, AgentTask, ShoppingTaskRequest, LogisticsEstimateRequest,
    DocumentGenerationRequest
)

router = APIRouter(prefix="/api/agents", tags=["AI User Agents"])

# Pydantic models for API
class CreateAgentConfigRequest(BaseModel):
    agent_role: AgentRole
    tasks_enabled: List[str]
    priority_rules: List[PriorityRule]
    interest_tags: List[str]
    agent_style: AgentStyle
    default_mode: DelegationMode
    spend_limits: Dict[str, float]
    learning_enabled: bool = True
    privacy_mode: bool = False

class UpdateAgentConfigRequest(BaseModel):
    tasks_enabled: Optional[List[str]] = None
    priority_rules: Optional[List[PriorityRule]] = None
    interest_tags: Optional[List[str]] = None
    agent_style: Optional[AgentStyle] = None
    default_mode: Optional[DelegationMode] = None
    spend_limits: Optional[Dict[str, float]] = None
    learning_enabled: Optional[bool] = None
    privacy_mode: Optional[bool] = None

class CreateTaskRequest(BaseModel):
    task_type: str
    task_name: str
    description: str
    mode: DelegationMode
    parameters: Dict[str, Any]
    budget_limit: Optional[float] = None
    deadline: Optional[str] = None

class TaskActionRequest(BaseModel):
    task_id: str
    action: Literal["approve", "reject", "cancel", "retry"]
    feedback: Optional[str] = None

class ShoppingTaskRequestAPI(BaseModel):
    cart_id: str
    payment_pref: Literal["auto", "manual_select"] = "auto"
    address_id: str
    max_budget: Optional[float] = None

class LogisticsEstimateRequestAPI(BaseModel):
    items: List[Dict[str, Any]]
    origin: Optional[str] = None
    destination: str
    incoterm: Optional[str] = "DDP"

class DocumentGenerationItemAPI(BaseModel):
    sku: str
    desc: str
    hs: Optional[str] = None
    value: float
    qty: int
    origin: str

class DocumentGenerationRequestAPI(BaseModel):
    flow: Literal["export", "import"]
    items: List[DocumentGenerationItemAPI]
    incoterm: str
    destination: str

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

@router.post("/config/create")
async def create_agent_configuration(
    request: CreateAgentConfigRequest,
    user = Depends(get_current_user_required)
):
    """Create AI agent configuration for user"""
    try:
        user_id = str(user["_id"])
        config_data = request.dict()
        config_data["user_id"] = user_id
        
        agent_id = await ai_user_agents_service.create_agent_configuration(config_data)
        
        return {
            "success": True,
            "agent_id": agent_id,
            "message": "AI agent configuration created successfully"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to create agent configuration: {str(e)}")

@router.get("/config")
async def get_agent_configuration(user = Depends(get_current_user_required)):
    """Get user's AI agent configuration"""
    try:
        user_id = str(user["_id"])
        config = await ai_user_agents_service.get_agent_configuration(user_id)
        
        if not config:
            raise HTTPException(404, "Agent configuration not found")
        
        return config
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error retrieving agent configuration: {str(e)}")

@router.put("/config/update")
async def update_agent_configuration(
    request: UpdateAgentConfigRequest,
    user = Depends(get_current_user_required)
):
    """Update AI agent configuration"""
    try:
        user_id = str(user["_id"])
        updates = {k: v for k, v in request.dict().items() if v is not None}
        
        success = await ai_user_agents_service.update_agent_configuration(user_id, updates)
        
        if not success:
            raise HTTPException(400, "Failed to update agent configuration")
        
        return {
            "success": True,
            "message": "Agent configuration updated successfully",
            "updates": updates
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error updating agent configuration: {str(e)}")

@router.post("/tasks/create")
async def create_agent_task(
    request: CreateTaskRequest,
    user = Depends(get_current_user_required)
):
    """Create new task for AI agent"""
    try:
        user_id = str(user["_id"])
        task_data = request.dict()
        task_data["user_id"] = user_id
        
        task_id = await ai_user_agents_service.create_task(task_data)
        
        return {
            "success": True,
            "task_id": task_id,
            "message": "Task created successfully"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to create task: {str(e)}")

@router.get("/tasks")
async def get_user_tasks(
    status: Optional[TaskStatus] = None,
    limit: int = 50,
    user = Depends(get_current_user_required)
):
    """Get user's agent tasks"""
    try:
        user_id = str(user["_id"])
        tasks = await ai_user_agents_service.get_user_tasks(user_id, status, limit)
        
        return {
            "tasks": tasks,
            "count": len(tasks)
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error retrieving tasks: {str(e)}")

@router.get("/tasks/{task_id}")
async def get_task_details(
    task_id: str,
    user = Depends(get_current_user_required)
):
    """Get detailed task information"""
    try:
        user_id = str(user["_id"])
        task = await ai_user_agents_service.get_task(task_id, user_id)
        
        if not task:
            raise HTTPException(404, "Task not found")
        
        return task
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error retrieving task: {str(e)}")

@router.post("/tasks/action")
async def perform_task_action(
    request: TaskActionRequest,
    user = Depends(get_current_user_required)
):
    """Perform action on agent task (approve, reject, cancel, retry)"""
    try:
        user_id = str(user["_id"])
        
        success = await ai_user_agents_service.update_task_status(
            request.task_id,
            user_id,
            request.action,
            request.feedback
        )
        
        if not success:
            raise HTTPException(400, f"Failed to {request.action} task")
        
        return {
            "success": True,
            "message": f"Task {request.action}d successfully",
            "task_id": request.task_id,
            "action": request.action
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error performing task action: {str(e)}")

@router.post("/tasks/shopping")
async def execute_shopping_task(
    request: ShoppingTaskRequestAPI,
    user = Depends(get_current_user_required)
):
    """Execute automated shopping task"""
    try:
        user_id = str(user["_id"])
        
        # Convert to service model
        shopping_request: ShoppingTaskRequest = {
            "cart_id": request.cart_id,
            "payment_pref": request.payment_pref,
            "address_id": request.address_id,
            "max_budget": request.max_budget
        }
        
        result = await ai_user_agents_service.execute_shopping_task(user_id, shopping_request)
        
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Error executing shopping task: {str(e)}")

@router.post("/tasks/logistics-estimate")
async def get_logistics_estimate(
    request: LogisticsEstimateRequestAPI,
    user = Depends(get_current_user_required)
):
    """Get AI-powered logistics estimate"""
    try:
        user_id = str(user["_id"])
        
        # Convert to service model
        logistics_request: LogisticsEstimateRequest = {
            "items": request.items,
            "origin": request.origin,
            "destination": request.destination,
            "incoterm": request.incoterm
        }
        
        result = await ai_user_agents_service.get_logistics_estimate(user_id, logistics_request)
        
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Error getting logistics estimate: {str(e)}")

@router.post("/tasks/document-generation")
async def generate_trade_documents(
    request: DocumentGenerationRequestAPI,
    user = Depends(get_current_user_required)
):
    """Generate trade documents using AI"""
    try:
        user_id = str(user["_id"])
        
        # Convert items
        items = []
        for item in request.items:
            items.append({
                "sku": item.sku,
                "desc": item.desc,
                "hs": item.hs,
                "value": item.value,
                "qty": item.qty,
                "origin": item.origin
            })
        
        # Convert to service model
        doc_request: DocumentGenerationRequest = {
            "flow": request.flow,
            "items": items,
            "incoterm": request.incoterm,
            "destination": request.destination
        }
        
        result = await ai_user_agents_service.generate_documents(user_id, doc_request)
        
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Error generating documents: {str(e)}")

@router.get("/analytics")
async def get_agent_analytics(user = Depends(get_current_user_required)):
    """Get AI agent performance analytics"""
    try:
        user_id = str(user["_id"])
        analytics = await ai_user_agents_service.get_agent_analytics(user_id)
        
        return analytics
        
    except Exception as e:
        raise HTTPException(500, f"Error retrieving agent analytics: {str(e)}")

@router.get("/capabilities")
async def get_agent_capabilities():
    """Get available AI agent capabilities and task types"""
    try:
        from ai_user_agents_models import AGENT_CAPABILITIES, TASK_TEMPLATES
        
        return {
            "capabilities": AGENT_CAPABILITIES,
            "task_templates": TASK_TEMPLATES,
            "agent_roles": [role.value for role in AgentRole],
            "delegation_modes": [mode.value for mode in DelegationMode],
            "agent_styles": [style.value for style in AgentStyle],
            "priority_rules": [rule.value for rule in PriorityRule]
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting capabilities: {str(e)}")

@router.get("/templates")
async def get_task_templates():
    """Get available task templates"""
    try:
        from ai_user_agents_models import TASK_TEMPLATES
        
        return {
            "templates": TASK_TEMPLATES,
            "description": "Pre-configured task templates for common agent operations"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting task templates: {str(e)}")

@router.post("/simulate")
async def simulate_agent_action(
    task_type: str,
    parameters: Dict[str, Any],
    user = Depends(get_current_user_required)
):
    """Simulate agent action without executing"""
    try:
        user_id = str(user["_id"])
        
        # This would simulate the agent's decision-making process
        simulation_result = {
            "task_type": task_type,
            "parameters": parameters,
            "estimated_duration": "5-10 minutes",
            "estimated_cost": 0.0,
            "risk_level": "low",
            "success_probability": 0.85,
            "required_permissions": [],
            "alternative_approaches": []
        }
        
        return {
            "simulation": simulation_result,
            "recommendation": "proceed",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error simulating agent action: {str(e)}")

@router.get("/health")
async def agents_service_health():
    """Health check for AI User Agents service"""
    try:
        return {
            "status": "healthy",
            "capabilities": [
                "agent_configuration",
                "task_management",
                "shopping_automation",
                "logistics_estimation",
                "document_generation",
                "performance_analytics"
            ],
            "agent_roles": ["buyer_agent", "brand_agent"],
            "delegation_modes": ["manual", "semi_auto", "auto"],
            "ai_model": "openai/gpt-4o-mini",
            "supported_tasks": [
                "shopping", "logistics", "documents", "research", 
                "negotiation", "compliance", "analytics"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }