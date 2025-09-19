from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException
import logging

from ..models.conversation import (
    ConversationModel, MessageModel, EncryptionKeyModel,
    CreateConversationRequest, SendMessageRequest, MessageType, ChannelType
)
from .encryption_service import encryption_service

logger = logging.getLogger(__name__)

class DMService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.conversations = db.conversations
        self.messages = db.messages
        self.encryption_keys = db.encryption_keys
    
    async def create_conversation(
        self, 
        request: CreateConversationRequest, 
        creator_id: str
    ) -> ConversationModel:
        """Create a new conversation with encryption setup"""
        try:
            # Ensure creator is in participants
            participants = list(set([creator_id] + request.participants))
            
            # Generate encryption key and key ID
            conversation_key = encryption_service.generate_key()
            key_id = encryption_service.generate_key_id()
            wrapped_key = encryption_service.wrap_key(conversation_key)
            
            # Create conversation document
            conversation_doc = {
                "_id": str(ObjectId()),
                "participants": participants,
                "title": request.title,
                "channel_type": request.channel_type.value,
                "created_at": datetime.utcnow(),
                "last_message_at": None,
                "encryption": {
                    "type": "aes-gcm",
                    "key_id": key_id,
                    "algorithm": "AES-256-GCM"
                },
                "metadata": {}
            }
            
            # Store encryption key
            key_doc = {
                "_id": str(ObjectId()),
                "key_id": key_id,
                "conversation_id": conversation_doc["_id"],
                "wrapped_key": wrapped_key,
                "algorithm": "AES-256-GCM",
                "created_at": datetime.utcnow()
            }
            
            # Insert both documents
            await self.conversations.insert_one(conversation_doc)
            await self.encryption_keys.insert_one(key_doc)
            
            logger.info(f"Created conversation {conversation_doc['_id']} with {len(participants)} participants")
            
            return ConversationModel(**conversation_doc)
            
        except Exception as e:
            logger.error(f"Failed to create conversation: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create conversation")
    
    async def get_conversations(self, user_id: str) -> List[ConversationModel]:
        """Get all conversations for a user"""
        try:
            cursor = self.conversations.find(
                {"participants": user_id}
            ).sort("last_message_at", -1)
            
            conversations = []
            async for doc in cursor:
                conversations.append(ConversationModel(**doc))
            
            return conversations
            
        except Exception as e:
            logger.error(f"Failed to get conversations for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to retrieve conversations")
    
    async def get_conversation(self, conversation_id: str, user_id: str) -> Optional[ConversationModel]:
        """Get a specific conversation if user is participant"""
        try:
            doc = await self.conversations.find_one({
                "_id": conversation_id,
                "participants": user_id
            })
            
            if not doc:
                return None
                
            return ConversationModel(**doc)
            
        except Exception as e:
            logger.error(f"Failed to get conversation {conversation_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to retrieve conversation")
    
    async def send_message(
        self, 
        request: SendMessageRequest, 
        sender_id: str
    ) -> MessageModel:
        """Send a message to a conversation"""
        try:
            # Verify user is participant
            conversation = await self.get_conversation(request.conversation_id, sender_id)
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
            
            # Create message document
            message_doc = {
                "_id": str(ObjectId()),
                "conversation_id": request.conversation_id,
                "sender_id": sender_id,
                "ciphertext": request.ciphertext,
                "nonce": request.nonce,
                "key_id": request.key_id,
                "message_type": request.message_type.value,
                "metadata": request.metadata or {},
                "created_at": datetime.utcnow(),
                "delivered_to": [],
                "read_by": [sender_id]  # Sender has read their own message
            }
            
            # Insert message
            await self.messages.insert_one(message_doc)
            
            # Update conversation last_message_at
            await self.conversations.update_one(
                {"_id": request.conversation_id},
                {
                    "$set": {"last_message_at": datetime.utcnow()},
                    "$inc": {"message_count": 1}
                }
            )
            
            logger.info(f"Message sent to conversation {request.conversation_id}")
            
            return MessageModel(**message_doc)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to send message: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to send message")
    
    async def get_messages(
        self, 
        conversation_id: str, 
        user_id: str,
        limit: int = 50,
        before: Optional[datetime] = None
    ) -> List[MessageModel]:
        """Get messages from a conversation"""
        try:
            # Verify user is participant
            conversation = await self.get_conversation(conversation_id, user_id)
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
            
            # Build query
            query = {"conversation_id": conversation_id}
            if before:
                query["created_at"] = {"$lt": before}
            
            cursor = self.messages.find(query).sort("created_at", -1).limit(limit)
            
            messages = []
            async for doc in cursor:
                messages.append(MessageModel(**doc))
            
            # Reverse to get chronological order
            return list(reversed(messages))
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to get messages: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to retrieve messages")
    
    async def mark_message_delivered(self, message_id: str, user_id: str):
        """Mark a message as delivered to a user"""
        try:
            await self.messages.update_one(
                {"_id": message_id},
                {"$addToSet": {"delivered_to": user_id}}
            )
        except Exception as e:
            logger.error(f"Failed to mark message delivered: {str(e)}")
    
    async def mark_message_read(self, message_id: str, user_id: str):
        """Mark a message as read by a user"""
        try:
            await self.messages.update_one(
                {"_id": message_id},
                {"$addToSet": {"read_by": user_id}}
            )
        except Exception as e:
            logger.error(f"Failed to mark message read: {str(e)}")
    
    async def get_encryption_key(self, key_id: str) -> Optional[bytes]:
        """Get and unwrap an encryption key"""
        try:
            doc = await self.encryption_keys.find_one({"key_id": key_id})
            if not doc:
                return None
            
            wrapped_key = doc["wrapped_key"]
            return encryption_service.unwrap_key(wrapped_key)
            
        except Exception as e:
            logger.error(f"Failed to get encryption key: {str(e)}")
            return None