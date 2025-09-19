from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum

class LeadStage(str, Enum):
    NEW = "new"
    ENGAGED = "engaged"
    QUALIFIED = "qualified"
    WON = "won"
    LOST = "lost"

class LeadPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class LeadIntent(str, Enum):
    BROWSE = "browse"
    INQUIRY = "inquiry"
    PURCHASE = "purchase"
    SUPPORT = "support"
    COMPLAINT = "complaint"

class LeadModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    conversation_id: str
    customer_id: str
    business_id: str  # vendor/creator ID
    stage: LeadStage = LeadStage.NEW
    priority: LeadPriority = LeadPriority.MEDIUM
    last_intent: LeadIntent = LeadIntent.BROWSE
    cart_value: float = 0.0
    assigned_to: Optional[str] = None  # business team member
    source: str = "dm"  # dm, livesale, channel, story
    tags: List[str] = Field(default_factory=list)
    notes: List[str] = Field(default_factory=list)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }

class LeadActivity(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    lead_id: str
    type: str  # message, call, purchase, note, stage_change
    description: str
    user_id: str
    data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True

class LeadNote(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    lead_id: str
    author_id: str
    content: str
    private: bool = False  # Only visible to business team
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True

# Request Models
class UpdateLeadRequest(BaseModel):
    stage: Optional[LeadStage] = None
    priority: Optional[LeadPriority] = None
    assigned_to: Optional[str] = None
    tags: Optional[List[str]] = None
    cart_value: Optional[float] = None

class AddLeadNoteRequest(BaseModel):
    content: str
    private: bool = False

class LeadAnalytics(BaseModel):
    total_leads: int
    by_stage: Dict[LeadStage, int]
    by_priority: Dict[LeadPriority, int]
    conversion_rate: float
    avg_cart_value: float
    total_revenue: float
    response_time_avg: float  # hours