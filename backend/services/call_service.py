from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException
import logging
import secrets

import sys
import os
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from models.call import (
    CallModel, CallSignalMessage, CallMode, CallStatus, CallEndReason,
    CallSignalType, InitiateCallRequest, CallAnswerRequest, CallDeclineRequest,
    CallEndRequest, ICECandidateRequest
)

logger = logging.getLogger(__name__)

class CallService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.calls = db.calls
        self.active_calls: Dict[str, Dict[str, Any]] = {}  # call_id -> call_data
    
    async def initiate_call(self, request: InitiateCallRequest, caller_id: str) -> CallModel:
        """Initiate a new call"""
        try:
            call_id = f"call_{secrets.token_hex(8)}"
            
            # Generate conversation_id if not provided
            conversation_id = request.conversation_id
            if not conversation_id:
                # Create a conversation ID for the call participants
                conversation_id = f"call_conv_{caller_id}_{request.callee_id}_{secrets.token_hex(4)}"
            
            call_doc = {
                "_id": str(ObjectId()),
                "call_id": call_id,
                "conversation_id": conversation_id,
                "caller_id": caller_id,
                "callee_id": request.callee_id,
                "mode": request.mode.value,
                "status": CallStatus.INITIATED.value,
                "started_at": datetime.utcnow(),
                "metadata": {"context": request.context} if request.context else {}
            }
            
            await self.calls.insert_one(call_doc)
            
            # Add to active calls registry
            self.active_calls[call_id] = {
                "call_doc": call_doc,
                "participants": {caller_id, request.callee_id},
                "created_at": datetime.utcnow()
            }
            
            logger.info(f"Call initiated: {call_id} between {caller_id} and {request.callee_id}")
            
            return CallModel(**call_doc)
            
        except Exception as e:
            logger.error(f"Failed to initiate call: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to initiate call")
    
    async def update_call_status(self, call_id: str, status: CallStatus, user_id: str) -> CallModel:
        """Update call status"""
        try:
            update_data = {
                "status": status.value,
                "updated_at": datetime.utcnow()
            }
            
            if status == CallStatus.CONNECTED:
                update_data["connected_at"] = datetime.utcnow()
            elif status == CallStatus.ENDED:
                update_data["ended_at"] = datetime.utcnow()
                # Calculate duration if we have connected_at
                call_doc = await self.calls.find_one({"call_id": call_id})
                if call_doc and call_doc.get("connected_at"):
                    connected_at = call_doc["connected_at"]
                    duration = (datetime.utcnow() - connected_at).total_seconds()
                    update_data["duration_seconds"] = int(duration)
                
                # Remove from active calls
                self.active_calls.pop(call_id, None)
            
            result = await self.calls.update_one(
                {"call_id": call_id},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Call not found")
            
            # Update active calls registry
            if call_id in self.active_calls:
                self.active_calls[call_id]["call_doc"].update(update_data)
            
            updated_doc = await self.calls.find_one({"call_id": call_id})
            return CallModel(**updated_doc)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to update call status: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to update call")
    
    async def end_call(self, call_id: str, reason: CallEndReason, user_id: str) -> CallModel:
        """End a call"""
        try:
            update_data = {
                "status": CallStatus.ENDED.value,
                "ended_at": datetime.utcnow(),
                "end_reason": reason.value
            }
            
            # Calculate duration if connected
            call_doc = await self.calls.find_one({"call_id": call_id})
            if not call_doc:
                raise HTTPException(status_code=404, detail="Call not found")
            
            if call_doc.get("connected_at"):
                connected_at = call_doc["connected_at"]
                duration = (datetime.utcnow() - connected_at).total_seconds()
                update_data["duration_seconds"] = int(duration)
            
            result = await self.calls.update_one(
                {"call_id": call_id},
                {"$set": update_data}
            )
            
            # Remove from active calls
            self.active_calls.pop(call_id, None)
            
            updated_doc = await self.calls.find_one({"call_id": call_id})
            return CallModel(**updated_doc)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to end call: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to end call")
    
    async def get_call(self, call_id: str) -> Optional[CallModel]:
        """Get call by ID"""
        try:
            doc = await self.calls.find_one({"call_id": call_id})
            if not doc:
                return None
            return CallModel(**doc)
        except Exception as e:
            logger.error(f"Failed to get call: {str(e)}")
            return None
    
    async def get_user_calls(
        self, 
        user_id: str, 
        limit: int = 50,
        include_ended: bool = True
    ) -> List[CallModel]:
        """Get calls for a user"""
        try:
            query = {
                "$or": [
                    {"caller_id": user_id},
                    {"callee_id": user_id}
                ]
            }
            
            if not include_ended:
                query["status"] = {"$ne": CallStatus.ENDED.value}
            
            cursor = self.calls.find(query).sort("started_at", -1).limit(limit)
            
            calls = []
            async for doc in cursor:
                calls.append(CallModel(**doc))
            
            return calls
            
        except Exception as e:
            logger.error(f"Failed to get user calls: {str(e)}")
            return []
    
    async def get_active_calls(self) -> Dict[str, Dict[str, Any]]:
        """Get all active calls"""
        # Clean up stale calls (older than 2 hours)
        cutoff = datetime.utcnow() - timedelta(hours=2)
        stale_calls = [
            call_id for call_id, call_data in self.active_calls.items()
            if call_data["created_at"] < cutoff
        ]
        
        for call_id in stale_calls:
            self.active_calls.pop(call_id, None)
            # Also update database
            await self.calls.update_one(
                {"call_id": call_id, "status": {"$ne": CallStatus.ENDED.value}},
                {"$set": {
                    "status": CallStatus.ENDED.value,
                    "end_reason": CallEndReason.TIMEOUT.value,
                    "ended_at": datetime.utcnow()
                }}
            )
        
        return self.active_calls
    
    def is_user_in_call(self, user_id: str) -> Optional[str]:
        """Check if user is in an active call"""
        for call_id, call_data in self.active_calls.items():
            if user_id in call_data["participants"]:
                return call_id
        return None
    
    async def create_signal_message(
        self, 
        signal_type: CallSignalType,
        call_id: str,
        user_id: str,
        **kwargs
    ) -> CallSignalMessage:
        """Create a WebSocket signaling message"""
        return CallSignalMessage(
            type=signal_type,
            call_id=call_id,
            from_user_id=user_id,
            **kwargs
        )