from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException
import logging

import sys
import os
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from models.lead import (
    LeadModel, LeadActivity, LeadNote, LeadStage, LeadPriority, LeadIntent,
    UpdateLeadRequest, AddLeadNoteRequest, LeadAnalytics
)

logger = logging.getLogger(__name__)

class LeadService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.leads = db.leads
        self.lead_activities = db.lead_activities
        self.lead_notes = db.lead_notes
        self.conversations = db.conversations  # Link to DM conversations
    
    async def create_lead_from_conversation(
        self, 
        conversation_id: str,
        customer_id: str,
        business_id: str,
        source: str = "dm"
    ) -> LeadModel:
        """Create a lead from a DM conversation"""
        try:
            # Check if lead already exists for this conversation
            existing_lead = await self.leads.find_one({
                "conversation_id": conversation_id
            })
            
            if existing_lead:
                return LeadModel(**existing_lead)
            
            lead_doc = {
                "_id": str(ObjectId()),
                "conversation_id": conversation_id,
                "customer_id": customer_id,
                "business_id": business_id,
                "stage": LeadStage.NEW.value,
                "priority": LeadPriority.MEDIUM.value,
                "last_intent": LeadIntent.BROWSE.value,
                "cart_value": 0.0,
                "source": source,
                "tags": [],
                "notes": [],
                "last_activity": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "metadata": {}
            }
            
            await self.leads.insert_one(lead_doc)
            
            # Create initial activity
            await self._create_activity(
                lead_doc["_id"],
                "lead_created",
                f"Lead created from {source}",
                business_id,
                {"source": source}
            )
            
            logger.info(f"Created lead {lead_doc['_id']} from conversation {conversation_id}")
            
            return LeadModel(**lead_doc)
            
        except Exception as e:
            logger.error(f"Failed to create lead: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create lead")
    
    async def update_lead(
        self, 
        lead_id: str, 
        request: UpdateLeadRequest,
        user_id: str
    ) -> LeadModel:
        """Update a lead"""
        try:
            lead = await self.leads.find_one({"_id": lead_id})
            if not lead:
                raise HTTPException(status_code=404, detail="Lead not found")
            
            update_data = {"updated_at": datetime.utcnow()}
            activity_changes = []
            
            if request.stage and request.stage.value != lead.get("stage"):
                update_data["stage"] = request.stage.value
                activity_changes.append(f"Stage changed to {request.stage.value}")
            
            if request.priority and request.priority.value != lead.get("priority"):
                update_data["priority"] = request.priority.value
                activity_changes.append(f"Priority changed to {request.priority.value}")
            
            if request.assigned_to is not None:
                update_data["assigned_to"] = request.assigned_to
                if request.assigned_to:
                    activity_changes.append(f"Assigned to {request.assigned_to}")
                else:
                    activity_changes.append("Unassigned")
            
            if request.tags is not None:
                update_data["tags"] = request.tags
                activity_changes.append("Tags updated")
            
            if request.cart_value is not None:
                update_data["cart_value"] = request.cart_value
                activity_changes.append(f"Cart value updated to ${request.cart_value}")
            
            await self.leads.update_one(
                {"_id": lead_id},
                {"$set": update_data}
            )
            
            # Create activity record
            if activity_changes:
                await self._create_activity(
                    lead_id,
                    "lead_updated",
                    "; ".join(activity_changes),
                    user_id,
                    {"changes": activity_changes}
                )
            
            updated_lead = await self.leads.find_one({"_id": lead_id})
            return LeadModel(**updated_lead)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to update lead: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to update lead")
    
    async def add_lead_note(
        self, 
        lead_id: str, 
        request: AddLeadNoteRequest,
        author_id: str
    ) -> LeadNote:
        """Add a note to a lead"""
        try:
            lead = await self.leads.find_one({"_id": lead_id})
            if not lead:
                raise HTTPException(status_code=404, detail="Lead not found")
            
            note_doc = {
                "_id": str(ObjectId()),
                "lead_id": lead_id,
                "author_id": author_id,
                "content": request.content,
                "private": request.private,
                "created_at": datetime.utcnow()
            }
            
            await self.lead_notes.insert_one(note_doc)
            
            # Update lead activity
            await self._create_activity(
                lead_id,
                "note_added",
                f"Note added: {request.content[:50]}..." if len(request.content) > 50 else request.content,
                author_id,
                {"private": request.private}
            )
            
            return LeadNote(**note_doc)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to add lead note: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to add note")
    
    async def get_business_leads(
        self, 
        business_id: str,
        stage: Optional[LeadStage] = None,
        assigned_to: Optional[str] = None,
        limit: int = 50
    ) -> List[LeadModel]:
        """Get leads for a business"""
        try:
            query = {"business_id": business_id}
            
            if stage:
                query["stage"] = stage.value
            
            if assigned_to:
                query["assigned_to"] = assigned_to
            
            cursor = self.leads.find(query).sort("last_activity", -1).limit(limit)
            
            leads = []
            async for doc in cursor:
                leads.append(LeadModel(**doc))
            
            return leads
            
        except Exception as e:
            logger.error(f"Failed to get business leads: {str(e)}")
            return []
    
    async def get_lead_with_details(self, lead_id: str, business_id: str) -> Dict[str, Any]:
        """Get lead with activities and notes"""
        try:
            lead = await self.leads.find_one({
                "_id": lead_id,
                "business_id": business_id
            })
            
            if not lead:
                raise HTTPException(status_code=404, detail="Lead not found")
            
            # Get activities
            activities_cursor = self.lead_activities.find(
                {"lead_id": lead_id}
            ).sort("created_at", -1).limit(20)
            
            activities = []
            async for doc in activities_cursor:
                activities.append(LeadActivity(**doc))
            
            # Get notes
            notes_cursor = self.lead_notes.find(
                {"lead_id": lead_id}
            ).sort("created_at", -1)
            
            notes = []
            async for doc in notes_cursor:
                notes.append(LeadNote(**doc))
            
            return {
                "lead": LeadModel(**lead),
                "activities": [activity.dict() for activity in activities],
                "notes": [note.dict() for note in notes]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to get lead details: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to get lead details")
    
    async def get_lead_analytics(self, business_id: str) -> LeadAnalytics:
        """Get lead analytics for a business"""
        try:
            # Total leads
            total_leads = await self.leads.count_documents({"business_id": business_id})
            
            # By stage
            stage_pipeline = [
                {"$match": {"business_id": business_id}},
                {"$group": {"_id": "$stage", "count": {"$sum": 1}}}
            ]
            stage_results = await self.leads.aggregate(stage_pipeline).to_list(10)
            by_stage = {result["_id"]: result["count"] for result in stage_results}
            
            # By priority
            priority_pipeline = [
                {"$match": {"business_id": business_id}},
                {"$group": {"_id": "$priority", "count": {"$sum": 1}}}
            ]
            priority_results = await self.leads.aggregate(priority_pipeline).to_list(10)
            by_priority = {result["_id"]: result["count"] for result in priority_results}
            
            # Conversion rate
            won_leads = by_stage.get(LeadStage.WON.value, 0)
            conversion_rate = (won_leads / max(total_leads, 1)) * 100
            
            # Average cart value
            cart_pipeline = [
                {"$match": {"business_id": business_id}},
                {"$group": {"_id": None, "avg_cart": {"$avg": "$cart_value"}, "total_revenue": {"$sum": "$cart_value"}}}
            ]
            cart_results = await self.leads.aggregate(cart_pipeline).to_list(1)
            avg_cart_value = cart_results[0]["avg_cart"] if cart_results else 0.0
            total_revenue = cart_results[0]["total_revenue"] if cart_results else 0.0
            
            # Response time (simplified calculation)
            response_time_avg = 2.5  # hours - would need more complex calculation
            
            return LeadAnalytics(
                total_leads=total_leads,
                by_stage=by_stage,
                by_priority=by_priority,
                conversion_rate=conversion_rate,
                avg_cart_value=avg_cart_value,
                total_revenue=total_revenue,
                response_time_avg=response_time_avg
            )
            
        except Exception as e:
            logger.error(f"Failed to get lead analytics: {str(e)}")
            return LeadAnalytics(
                total_leads=0,
                by_stage={},
                by_priority={},
                conversion_rate=0.0,
                avg_cart_value=0.0,
                total_revenue=0.0,
                response_time_avg=0.0
            )
    
    async def update_lead_from_message(
        self, 
        conversation_id: str,
        sender_id: str,
        message_content: str
    ):
        """Update lead based on new message"""
        try:
            lead = await self.leads.find_one({"conversation_id": conversation_id})
            if not lead:
                return
            
            # Simple intent detection (could be enhanced with AI)
            intent = self._detect_intent(message_content)
            
            update_data = {
                "last_activity": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            if intent != lead.get("last_intent"):
                update_data["last_intent"] = intent.value
            
            # Auto-move to engaged if customer is responding
            if sender_id == lead["customer_id"] and lead["stage"] == LeadStage.NEW.value:
                update_data["stage"] = LeadStage.ENGAGED.value
            
            await self.leads.update_one(
                {"_id": lead["_id"]},
                {"$set": update_data}
            )
            
            # Create activity
            await self._create_activity(
                lead["_id"],
                "message",
                f"New message: {message_content[:50]}..." if len(message_content) > 50 else message_content,
                sender_id,
                {"intent": intent.value}
            )
            
        except Exception as e:
            logger.error(f"Failed to update lead from message: {str(e)}")
    
    def _detect_intent(self, message: str) -> LeadIntent:
        """Simple intent detection from message content"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["buy", "purchase", "order", "checkout", "cart"]):
            return LeadIntent.PURCHASE
        elif any(word in message_lower for word in ["price", "cost", "how much", "available", "stock"]):
            return LeadIntent.INQUIRY
        elif any(word in message_lower for word in ["problem", "issue", "help", "support", "broken"]):
            return LeadIntent.SUPPORT
        elif any(word in message_lower for word in ["complaint", "refund", "return", "unhappy"]):
            return LeadIntent.COMPLAINT
        else:
            return LeadIntent.BROWSE
    
    async def _create_activity(
        self, 
        lead_id: str, 
        activity_type: str, 
        description: str,
        user_id: str,
        data: Optional[Dict[str, Any]] = None
    ):
        """Create an activity record"""
        try:
            activity_doc = {
                "_id": str(ObjectId()),
                "lead_id": lead_id,
                "type": activity_type,
                "description": description,
                "user_id": user_id,
                "data": data or {},
                "created_at": datetime.utcnow()
            }
            
            await self.lead_activities.insert_one(activity_doc)
            
        except Exception as e:
            logger.error(f"Failed to create activity: {str(e)}")