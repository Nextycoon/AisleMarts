from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
import logging

import sys
import os
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from routers.deps import get_db
from security import get_current_user
from models.lead import (
    LeadModel, LeadNote, LeadStage, LeadPriority, LeadAnalytics,
    UpdateLeadRequest, AddLeadNoteRequest
)
from services.lead_service import LeadService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/biz/leads", tags=["Business - Leads Management"])

@router.get("", response_model=List[LeadModel])
async def get_leads(
    stage: Optional[LeadStage] = None,
    assigned_to: Optional[str] = None,
    limit: int = 50,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get leads for business (Kanban view)"""
    lead_service = LeadService(db)
    return await lead_service.get_business_leads(
        current_user["_id"], 
        stage, 
        assigned_to, 
        limit
    )

@router.get("/analytics", response_model=LeadAnalytics)
async def get_lead_analytics(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get lead analytics for business dashboard"""
    lead_service = LeadService(db)
    return await lead_service.get_lead_analytics(current_user["_id"])

@router.get("/{lead_id}")
async def get_lead_details(
    lead_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get lead with activities and notes"""
    lead_service = LeadService(db)
    return await lead_service.get_lead_with_details(lead_id, current_user["_id"])

@router.patch("/{lead_id}", response_model=LeadModel)
async def update_lead(
    lead_id: str,
    request: UpdateLeadRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Update lead (stage, priority, assignment, etc.)"""
    lead_service = LeadService(db)
    return await lead_service.update_lead(lead_id, request, current_user["_id"])

@router.post("/{lead_id}/notes", response_model=LeadNote)
async def add_lead_note(
    lead_id: str,
    request: AddLeadNoteRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Add note to lead"""
    lead_service = LeadService(db)
    return await lead_service.add_lead_note(lead_id, request, current_user["_id"])

@router.post("/{lead_id}/call")
async def initiate_lead_call(
    lead_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Initiate call with lead (integration with calls system)"""
    lead_service = LeadService(db)
    
    # Get lead details
    lead_details = await lead_service.get_lead_with_details(lead_id, current_user["_id"])
    lead = lead_details["lead"]
    
    # This would integrate with the calls system
    # For now, return call initialization data
    return {
        "status": "call_initiated",
        "lead_id": lead_id,
        "customer_id": lead.customer_id,
        "conversation_id": lead.conversation_id,
        "call_data": {
            "caller_id": current_user["_id"],
            "callee_id": lead.customer_id,
            "mode": "voice",
            "context": "lead_followup"
        }
    }

@router.post("/{lead_id}/dm")
async def jump_to_lead_dm(
    lead_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Jump to DM conversation for lead"""
    lead_service = LeadService(db)
    
    # Get lead details
    lead_details = await lead_service.get_lead_with_details(lead_id, current_user["_id"])
    lead = lead_details["lead"]
    
    return {
        "status": "dm_redirect",
        "conversation_id": lead.conversation_id,
        "customer_id": lead.customer_id,
        "redirect_url": f"/messages/{lead.conversation_id}"
    }

@router.post("/{lead_id}/offer")
async def create_lead_offer(
    lead_id: str,
    offer_data: Dict[str, Any],
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Create custom offer for lead"""
    lead_service = LeadService(db)
    
    # Get lead details
    lead_details = await lead_service.get_lead_with_details(lead_id, current_user["_id"])
    lead = lead_details["lead"]
    
    # Create offer (simplified implementation)
    offer = {
        "lead_id": lead_id,
        "customer_id": lead.customer_id,
        "business_id": current_user["_id"],
        "offer_type": offer_data.get("type", "discount"),
        "discount_percent": offer_data.get("discount_percent", 0),
        "products": offer_data.get("products", []),
        "expires_at": offer_data.get("expires_at"),
        "created_at": datetime.utcnow(),
        "status": "pending"
    }
    
    # Store offer (would need separate collection)
    # For now, just return the offer data
    
    # Update lead with offer activity
    await lead_service._create_activity(
        lead_id,
        "offer_created",
        f"Created {offer['offer_type']} offer",
        current_user["_id"],
        {"offer": offer}
    )
    
    return {
        "status": "offer_created",
        "offer": offer
    }

# Kanban-specific endpoints
@router.get("/kanban/summary")
async def get_kanban_summary(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get Kanban board summary (counts by stage)"""
    lead_service = LeadService(db)
    analytics = await lead_service.get_lead_analytics(current_user["_id"])
    
    return {
        "columns": {
            "new": {
                "title": "New",
                "count": analytics.by_stage.get(LeadStage.NEW.value, 0),
                "color": "#D4AF37"
            },
            "engaged": {
                "title": "Engaged", 
                "count": analytics.by_stage.get(LeadStage.ENGAGED.value, 0),
                "color": "#4169E1"
            },
            "qualified": {
                "title": "Qualified",
                "count": analytics.by_stage.get(LeadStage.QUALIFIED.value, 0),
                "color": "#8A2BE2"
            },
            "won": {
                "title": "Won",
                "count": analytics.by_stage.get(LeadStage.WON.value, 0),
                "color": "#228B22"
            },
            "lost": {
                "title": "Lost",
                "count": analytics.by_stage.get(LeadStage.LOST.value, 0),
                "color": "#DC143C"
            }
        },
        "totals": {
            "total_leads": analytics.total_leads,
            "conversion_rate": analytics.conversion_rate,
            "total_revenue": analytics.total_revenue
        }
    }

@router.post("/kanban/move")
async def move_lead_stage(
    lead_id: str,
    new_stage: LeadStage,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Move lead to different stage (drag & drop)"""
    lead_service = LeadService(db)
    
    request = UpdateLeadRequest(stage=new_stage)
    updated_lead = await lead_service.update_lead(lead_id, request, current_user["_id"])
    
    return {
        "status": "moved",
        "lead": updated_lead,
        "new_stage": new_stage.value
    }