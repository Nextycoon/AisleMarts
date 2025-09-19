from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer
import json
import logging
import asyncio
from collections import defaultdict
import sys
import os

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import dependencies
from routers.deps import get_db
from security import get_current_user
from models.conversation import (
    ConversationModel, MessageModel, CreateConversationRequest, 
    SendMessageRequest, TypingIndicatorRequest, ReadReceiptRequest,
    WSMessage, WSMessageType
)
from services.dm_service import DMService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dm", tags=["Direct Messaging"])

# WebSocket connection registry
class ConnectionRegistry:
    def __init__(self):
        self.connections: Dict[str, Dict[str, WebSocket]] = defaultdict(dict)
        # conversation_id -> {user_id: websocket}
    
    async def add_connection(self, conversation_id: str, user_id: str, websocket: WebSocket):
        """Add a WebSocket connection to a conversation"""
        self.connections[conversation_id][user_id] = websocket
        logger.info(f"User {user_id} connected to conversation {conversation_id}")
    
    async def remove_connection(self, conversation_id: str, user_id: str):
        """Remove a WebSocket connection"""
        if conversation_id in self.connections:
            self.connections[conversation_id].pop(user_id, None)
            if not self.connections[conversation_id]:
                del self.connections[conversation_id]
        logger.info(f"User {user_id} disconnected from conversation {conversation_id}")
    
    async def broadcast_to_conversation(self, conversation_id: str, message: dict, exclude_user: Optional[str] = None):
        """Broadcast a message to all connected users in a conversation"""
        if conversation_id not in self.connections:
            return
        
        disconnected = []
        for user_id, websocket in self.connections[conversation_id].items():
            if exclude_user and user_id == exclude_user:
                continue
            
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.warning(f"Failed to send to user {user_id}: {str(e)}")
                disconnected.append(user_id)
        
        # Clean up disconnected connections
        for user_id in disconnected:
            await self.remove_connection(conversation_id, user_id)
    
    def get_connected_users(self, conversation_id: str) -> List[str]:
        """Get list of connected users in a conversation"""
        return list(self.connections.get(conversation_id, {}).keys())

# Global connection registry
connection_registry = ConnectionRegistry()

# REST API Endpoints
@router.post("/conversations", response_model=ConversationModel)
async def create_conversation(
    request: CreateConversationRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Create a new conversation"""
    dm_service = DMService(db)
    return await dm_service.create_conversation(request, current_user["_id"])

@router.get("/conversations", response_model=List[ConversationModel])
async def get_conversations(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get all conversations for the current user"""
    dm_service = DMService(db)
    return await dm_service.get_conversations(current_user["_id"])

@router.get("/conversations/{conversation_id}", response_model=ConversationModel)
async def get_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get a specific conversation"""
    dm_service = DMService(db)
    conversation = await dm_service.get_conversation(conversation_id, current_user["_id"])
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageModel])
async def get_messages(
    conversation_id: str,
    limit: int = 50,
    before: Optional[datetime] = None,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get messages from a conversation"""
    dm_service = DMService(db)
    return await dm_service.get_messages(conversation_id, current_user["_id"], limit, before)

@router.post("/messages", response_model=MessageModel)
async def send_message(
    request: SendMessageRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Send a message (fallback when WebSocket is not available)"""
    dm_service = DMService(db)
    message = await dm_service.send_message(request, current_user["_id"])
    
    # Broadcast to connected users
    broadcast_data = {
        "type": WSMessageType.MESSAGE_NEW,
        "data": {
            "message": message.dict(),
            "sender_id": current_user["_id"]
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await connection_registry.broadcast_to_conversation(
        request.conversation_id, 
        broadcast_data,
        exclude_user=current_user["_id"]
    )
    
    return message

@router.post("/typing")
async def send_typing_indicator(
    request: TypingIndicatorRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Send typing indicator (fallback)"""
    # Verify user is in conversation
    dm_service = DMService(db)
    conversation = await dm_service.get_conversation(request.conversation_id, current_user["_id"])
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Broadcast typing indicator
    broadcast_data = {
        "type": WSMessageType.TYPING,
        "data": {
            "user_id": current_user["_id"],
            "state": request.state,
            "conversation_id": request.conversation_id
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await connection_registry.broadcast_to_conversation(
        request.conversation_id,
        broadcast_data,
        exclude_user=current_user["_id"]
    )
    
    return {"status": "sent"}

@router.post("/receipts")
async def mark_read(
    request: ReadReceiptRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Mark message as read"""
    dm_service = DMService(db)
    
    # Verify user is in conversation
    conversation = await dm_service.get_conversation(request.conversation_id, current_user["_id"])
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Mark as read
    await dm_service.mark_message_read(request.message_id, current_user["_id"])
    
    # Broadcast read receipt
    broadcast_data = {
        "type": WSMessageType.READ_RECEIPT,
        "data": {
            "message_id": request.message_id,
            "user_id": current_user["_id"],
            "conversation_id": request.conversation_id
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await connection_registry.broadcast_to_conversation(
        request.conversation_id,
        broadcast_data,
        exclude_user=current_user["_id"]
    )
    
    return {"status": "marked"}

# WebSocket Endpoint
@router.websocket("/ws/{conversation_id}")
async def websocket_chat(
    websocket: WebSocket,
    conversation_id: str,
    token: Optional[str] = None,
    db=Depends(get_db)
):
    """WebSocket endpoint for real-time messaging"""
    if not token:
        await websocket.close(code=4001, reason="Authentication required")
        return
    
    # Authenticate user (simplified - in production use proper JWT validation)
    try:
        # TODO: Implement proper JWT validation here
        # For now, we'll assume token contains user_id
        user_id = token  # Simplified for demo
        
        # Verify user is participant in conversation
        dm_service = DMService(db)
        conversation = await dm_service.get_conversation(conversation_id, user_id)
        if not conversation:
            await websocket.close(code=4004, reason="Conversation not found")
            return
        
    except Exception as e:
        logger.error(f"WebSocket authentication failed: {str(e)}")
        await websocket.close(code=4001, reason="Authentication failed")
        return
    
    await websocket.accept()
    await connection_registry.add_connection(conversation_id, user_id, websocket)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == WSMessageType.MESSAGE_SEND:
                # Handle message sending
                try:
                    request = SendMessageRequest(
                        conversation_id=conversation_id,
                        ciphertext=message["ciphertext"],
                        nonce=message["nonce"],
                        key_id=message["key_id"],
                        message_type=message.get("message_type", "text"),
                        metadata=message.get("metadata")
                    )
                    
                    # Save message to database
                    saved_message = await dm_service.send_message(request, user_id)
                    
                    # Broadcast to all connected users
                    broadcast_data = {
                        "type": WSMessageType.MESSAGE_NEW,
                        "data": {
                            "message": saved_message.dict(),
                            "sender_id": user_id
                        },
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    await connection_registry.broadcast_to_conversation(
                        conversation_id, 
                        broadcast_data
                    )
                    
                except Exception as e:
                    logger.error(f"Failed to handle message: {str(e)}")
                    await websocket.send_text(json.dumps({
                        "type": WSMessageType.ERROR,
                        "data": {"error": "Failed to send message"},
                        "timestamp": datetime.utcnow().isoformat()
                    }))
            
            elif message_type == WSMessageType.TYPING:
                # Handle typing indicator
                broadcast_data = {
                    "type": WSMessageType.TYPING,
                    "data": {
                        "user_id": user_id,
                        "state": message.get("state", "start"),
                        "conversation_id": conversation_id
                    },
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                await connection_registry.broadcast_to_conversation(
                    conversation_id,
                    broadcast_data,
                    exclude_user=user_id
                )
            
            elif message_type == WSMessageType.READ_RECEIPT:
                # Handle read receipt
                message_id = message.get("message_id")
                if message_id:
                    await dm_service.mark_message_read(message_id, user_id)
                    
                    broadcast_data = {
                        "type": WSMessageType.READ_RECEIPT,
                        "data": {
                            "message_id": message_id,
                            "user_id": user_id,
                            "conversation_id": conversation_id
                        },
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    await connection_registry.broadcast_to_conversation(
                        conversation_id,
                        broadcast_data,
                        exclude_user=user_id
                    )
            
    except WebSocketDisconnect:
        await connection_registry.remove_connection(conversation_id, user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await connection_registry.remove_connection(conversation_id, user_id)