from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum

class ChannelType(str, Enum):
    GROUP = "group"
    CHANNEL = "channel"  # Broadcast channel
    CREATOR = "creator"
    VENDOR = "vendor"

class MemberRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"

class ChannelTheme(str, Enum):
    GOLD = "gold"
    CYAN = "cyan"
    PURPLE = "purple"
    SILVER = "silver"

class ChannelModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    type: ChannelType
    title: str
    description: Optional[str] = None
    owner_id: str
    members: List[str] = Field(default_factory=list)  # For groups only
    roles: Dict[str, MemberRole] = Field(default_factory=dict)
    verified: bool = False
    brand: Optional[str] = None
    theme: ChannelTheme = ChannelTheme.GOLD
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    member_count: int = 0
    is_public: bool = True
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }

class ChannelMessage(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    channel_id: str
    sender_id: str
    content: str
    message_type: str = "text"  # text, product, image, system, pin
    pinned: bool = False
    pinned_at: Optional[datetime] = None
    pinned_by: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reactions: Dict[str, List[str]] = Field(default_factory=dict)  # emoji -> user_ids
    reply_to: Optional[str] = None
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }

class ChannelInvite(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    channel_id: str
    invite_code: str
    created_by: str
    expires_at: Optional[datetime] = None
    max_uses: Optional[int] = None
    current_uses: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True

# Request Models
class CreateChannelRequest(BaseModel):
    type: ChannelType
    title: str
    description: Optional[str] = None
    is_public: bool = True
    theme: ChannelTheme = ChannelTheme.GOLD
    tags: Optional[List[str]] = None

class JoinChannelRequest(BaseModel):
    invite_code: Optional[str] = None

class InviteMembersRequest(BaseModel):
    user_ids: List[str]
    role: MemberRole = MemberRole.MEMBER

class PostChannelMessageRequest(BaseModel):
    content: str
    message_type: str = "text"
    metadata: Optional[Dict[str, Any]] = None
    reply_to: Optional[str] = None

class PinMessageRequest(BaseModel):
    message_id: str

class UpdateChannelRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    theme: Optional[ChannelTheme] = None
    tags: Optional[List[str]] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None