from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum

class CallMode(str, Enum):
    VOICE = "voice"
    VIDEO = "video"

class CallStatus(str, Enum):
    INITIATED = "initiated"
    RINGING = "ringing"
    CONNECTED = "connected"
    ENDED = "ended"
    FAILED = "failed"

class CallEndReason(str, Enum):
    HANGUP = "hangup"
    TIMEOUT = "timeout"
    DECLINED = "declined"
    NETWORK_ERROR = "network_error"

class CallSignalType(str, Enum):
    CALL_INIT = "CALL_INIT"
    CALL_RING = "CALL_RING"
    CALL_ANSWER = "CALL_ANSWER"
    CALL_DECLINE = "CALL_DECLINE"
    CALL_END = "CALL_END"
    ICE_CANDIDATE = "ICE_CANDIDATE"
    CALL_MUTE = "CALL_MUTE"
    CALL_VIDEO_TOGGLE = "CALL_VIDEO_TOGGLE"

class CallModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    call_id: str = Field(..., description="Unique call identifier")
    conversation_id: str
    caller_id: str
    callee_id: str
    mode: CallMode = CallMode.VOICE
    status: CallStatus = CallStatus.INITIATED
    started_at: datetime = Field(default_factory=datetime.utcnow)
    connected_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    end_reason: Optional[CallEndReason] = None
    duration_seconds: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }

class CallSignalMessage(BaseModel):
    type: CallSignalType
    call_id: str
    conversation_id: Optional[str] = None
    from_user_id: Optional[str] = None
    to_user_id: Optional[str] = None
    mode: Optional[CallMode] = None
    sdp: Optional[str] = None
    candidate: Optional[Dict[str, Any]] = None
    device: Optional[str] = None
    reason: Optional[CallEndReason] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Request Models
class InitiateCallRequest(BaseModel):
    conversation_id: str
    callee_id: str
    mode: CallMode = CallMode.VOICE

class CallAnswerRequest(BaseModel):
    call_id: str
    sdp: str

class CallDeclineRequest(BaseModel):
    call_id: str
    reason: CallEndReason = CallEndReason.DECLINED

class CallEndRequest(BaseModel):
    call_id: str
    reason: CallEndReason = CallEndReason.HANGUP

class ICECandidateRequest(BaseModel):
    call_id: str
    candidate: Dict[str, Any]