from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum

class MessageType(str, Enum):
    TEXT = "text"
    PRODUCT = "product"
    IMAGE = "image"
    SYSTEM = "system"

class ChannelType(str, Enum):
    DIRECT = "direct"
    GROUP = "group"
    CREATOR = "creator"
    VENDOR = "vendor"

class EncryptionConfig(BaseModel):
    type: str = "aes-gcm"
    key_id: str
    algorithm: str = "AES-256-GCM"

class ConversationModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    participants: List[str] = Field(..., description="List of user IDs")
    title: Optional[str] = Field(None, description="Optional conversation title for groups")
    channel_type: ChannelType = ChannelType.DIRECT
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_message_at: Optional[datetime] = None
    encryption: EncryptionConfig
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }

class MessageModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    conversation_id: str
    sender_id: str
    ciphertext: str = Field(..., description="Encrypted message content")
    nonce: str = Field(..., description="Encryption nonce")
    key_id: str = Field(..., description="Reference to encryption key")
    message_type: MessageType = MessageType.TEXT
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    delivered_to: List[str] = Field(default_factory=list)
    read_by: List[str] = Field(default_factory=list)
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }

class EncryptionKeyModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    key_id: str = Field(..., unique=True)
    conversation_id: str
    wrapped_key: str = Field(..., description="Encrypted/wrapped key for security")
    algorithm: str = "AES-256-GCM"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True

# Request/Response Models
class CreateConversationRequest(BaseModel):
    participants: List[str]
    title: Optional[str] = None
    channel_type: ChannelType = ChannelType.DIRECT

class SendMessageRequest(BaseModel):
    conversation_id: str
    ciphertext: str
    nonce: str
    key_id: str
    message_type: MessageType = MessageType.TEXT
    metadata: Optional[Dict[str, Any]] = None

class TypingIndicatorRequest(BaseModel):
    conversation_id: str
    state: str  # "start" or "stop"

class ReadReceiptRequest(BaseModel):
    conversation_id: str
    message_id: str

# WebSocket Message Types
class WSMessageType(str, Enum):
    MESSAGE_SEND = "message.send"
    MESSAGE_NEW = "message.new"
    TYPING = "typing"
    READ_RECEIPT = "receipt.read"
    ERROR = "error"
    
class WSMessage(BaseModel):
    type: WSMessageType
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)