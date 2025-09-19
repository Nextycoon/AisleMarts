from typing import List, Optional, Dict, Any
from datetime import datetime
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

from models.channel import (
    ChannelModel, ChannelMessage, ChannelInvite, ChannelType, MemberRole,
    CreateChannelRequest, JoinChannelRequest, InviteMembersRequest,
    PostChannelMessageRequest, PinMessageRequest, UpdateChannelRequest
)

logger = logging.getLogger(__name__)

class ChannelService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.channels = db.channels
        self.channel_messages = db.channel_messages
        self.channel_invites = db.channel_invites
    
    async def create_channel(
        self, 
        request: CreateChannelRequest, 
        owner_id: str
    ) -> ChannelModel:
        """Create a new channel"""
        try:
            channel_doc = {
                "_id": str(ObjectId()),
                "type": request.type.value,
                "title": request.title,
                "description": request.description,
                "owner_id": owner_id,
                "members": [owner_id] if request.type == ChannelType.GROUP else [],
                "roles": {owner_id: MemberRole.OWNER.value},
                "verified": False,
                "theme": request.theme.value,
                "member_count": 1 if request.type == ChannelType.GROUP else 0,
                "is_public": request.is_public,
                "tags": request.tags or [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "metadata": {}
            }
            
            await self.channels.insert_one(channel_doc)
            
            logger.info(f"Created {request.type.value} channel: {channel_doc['_id']}")
            
            return ChannelModel(**channel_doc)
            
        except Exception as e:
            logger.error(f"Failed to create channel: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create channel")
    
    async def get_channel(self, channel_id: str, user_id: str) -> Optional[ChannelModel]:
        """Get channel by ID with access check"""
        try:
            doc = await self.channels.find_one({"_id": channel_id})
            if not doc:
                return None
            
            # Check access
            if not await self._can_access_channel(doc, user_id):
                return None
                
            return ChannelModel(**doc)
            
        except Exception as e:
            logger.error(f"Failed to get channel: {str(e)}")
            return None
    
    async def get_user_channels(
        self, 
        user_id: str,
        channel_type: Optional[ChannelType] = None
    ) -> List[ChannelModel]:
        """Get channels for a user"""
        try:
            query = {
                "$or": [
                    {"owner_id": user_id},
                    {"members": user_id},
                    {"is_public": True}  # Public channels visible to all
                ]
            }
            
            if channel_type:
                query["type"] = channel_type.value
            
            cursor = self.channels.find(query).sort("updated_at", -1)
            
            channels = []
            async for doc in cursor:
                channels.append(ChannelModel(**doc))
            
            return channels
            
        except Exception as e:
            logger.error(f"Failed to get user channels: {str(e)}")
            return []
    
    async def join_channel(
        self, 
        channel_id: str, 
        user_id: str,
        invite_code: Optional[str] = None
    ) -> ChannelModel:
        """Join a channel"""
        try:
            channel = await self.channels.find_one({"_id": channel_id})
            if not channel:
                raise HTTPException(status_code=404, detail="Channel not found")
            
            # Check if already a member
            if user_id in channel.get("members", []):
                return ChannelModel(**channel)
            
            # For private channels, require invite code
            if not channel.get("is_public", True) and not invite_code:
                raise HTTPException(status_code=403, detail="Invite code required")
            
            # Validate invite code if provided
            if invite_code:
                invite = await self.channel_invites.find_one({
                    "channel_id": channel_id,
                    "invite_code": invite_code
                })
                if not invite:
                    raise HTTPException(status_code=403, detail="Invalid invite code")
                
                # Check expiry and usage limits
                if invite.get("expires_at") and invite["expires_at"] < datetime.utcnow():
                    raise HTTPException(status_code=403, detail="Invite code expired")
                
                if invite.get("max_uses") and invite["current_uses"] >= invite["max_uses"]:
                    raise HTTPException(status_code=403, detail="Invite code usage limit reached")
                
                # Increment usage
                await self.channel_invites.update_one(
                    {"_id": invite["_id"]},
                    {"$inc": {"current_uses": 1}}
                )
            
            # Add user to channel
            role = MemberRole.VIEWER if channel["type"] == ChannelType.CHANNEL else MemberRole.MEMBER
            
            await self.channels.update_one(
                {"_id": channel_id},
                {
                    "$addToSet": {"members": user_id},
                    "$set": {f"roles.{user_id}": role.value},
                    "$inc": {"member_count": 1},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            
            updated_channel = await self.channels.find_one({"_id": channel_id})
            return ChannelModel(**updated_channel)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to join channel: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to join channel")
    
    async def post_message(
        self, 
        channel_id: str, 
        request: PostChannelMessageRequest,
        sender_id: str
    ) -> ChannelMessage:
        """Post a message to a channel"""
        try:
            # Check access
            channel = await self.channels.find_one({"_id": channel_id})
            if not channel:
                raise HTTPException(status_code=404, detail="Channel not found")
            
            if not await self._can_post_to_channel(channel, sender_id):
                raise HTTPException(status_code=403, detail="Not authorized to post")
            
            message_doc = {
                "_id": str(ObjectId()),
                "channel_id": channel_id,
                "sender_id": sender_id,
                "content": request.content,
                "message_type": request.message_type,
                "metadata": request.metadata or {},
                "created_at": datetime.utcnow(),
                "reactions": {},
                "reply_to": request.reply_to
            }
            
            await self.channel_messages.insert_one(message_doc)
            
            # Update channel last activity
            await self.channels.update_one(
                {"_id": channel_id},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            
            return ChannelMessage(**message_doc)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to post message: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to post message")
    
    async def get_channel_messages(
        self, 
        channel_id: str, 
        user_id: str,
        limit: int = 50,
        before: Optional[datetime] = None
    ) -> List[ChannelMessage]:
        """Get messages from a channel"""
        try:
            # Check access
            channel = await self.channels.find_one({"_id": channel_id})
            if not channel or not await self._can_access_channel(channel, user_id):
                raise HTTPException(status_code=404, detail="Channel not found")
            
            query = {"channel_id": channel_id}
            if before:
                query["created_at"] = {"$lt": before}
            
            cursor = self.channel_messages.find(query).sort("created_at", -1).limit(limit)
            
            messages = []
            async for doc in cursor:
                messages.append(ChannelMessage(**doc))
            
            return list(reversed(messages))
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to get channel messages: {str(e)}")
            return []
    
    async def pin_message(
        self, 
        channel_id: str, 
        message_id: str,
        user_id: str
    ) -> ChannelMessage:
        """Pin a message in a channel"""
        try:
            # Check permissions (owner/admin only)
            channel = await self.channels.find_one({"_id": channel_id})
            if not channel:
                raise HTTPException(status_code=404, detail="Channel not found")
            
            user_role = channel.get("roles", {}).get(user_id)
            if user_role not in [MemberRole.OWNER.value, MemberRole.ADMIN.value]:
                raise HTTPException(status_code=403, detail="Not authorized to pin messages")
            
            # Unpin previous pinned message
            await self.channel_messages.update_many(
                {"channel_id": channel_id, "pinned": True},
                {"$set": {"pinned": False, "pinned_at": None, "pinned_by": None}}
            )
            
            # Pin the new message
            result = await self.channel_messages.update_one(
                {"_id": message_id, "channel_id": channel_id},
                {
                    "$set": {
                        "pinned": True,
                        "pinned_at": datetime.utcnow(),
                        "pinned_by": user_id
                    }
                }
            )
            
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Message not found")
            
            updated_message = await self.channel_messages.find_one({"_id": message_id})
            return ChannelMessage(**updated_message)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to pin message: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to pin message")
    
    async def create_invite(
        self, 
        channel_id: str, 
        user_id: str,
        expires_hours: Optional[int] = None,
        max_uses: Optional[int] = None
    ) -> ChannelInvite:
        """Create an invite code for a channel"""
        try:
            # Check permissions
            channel = await self.channels.find_one({"_id": channel_id})
            if not channel:
                raise HTTPException(status_code=404, detail="Channel not found")
            
            user_role = channel.get("roles", {}).get(user_id)
            if user_role not in [MemberRole.OWNER.value, MemberRole.ADMIN.value]:
                raise HTTPException(status_code=403, detail="Not authorized to create invites")
            
            invite_code = secrets.token_urlsafe(8)
            expires_at = None
            if expires_hours:
                expires_at = datetime.utcnow() + timedelta(hours=expires_hours)
            
            invite_doc = {
                "_id": str(ObjectId()),
                "channel_id": channel_id,
                "invite_code": invite_code,
                "created_by": user_id,
                "expires_at": expires_at,
                "max_uses": max_uses,
                "current_uses": 0,
                "created_at": datetime.utcnow()
            }
            
            await self.channel_invites.insert_one(invite_doc)
            
            return ChannelInvite(**invite_doc)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to create invite: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create invite")
    
    async def _can_access_channel(self, channel: Dict[str, Any], user_id: str) -> bool:
        """Check if user can access channel"""
        if channel.get("is_public", True):
            return True
        
        if channel.get("owner_id") == user_id:
            return True
        
        if user_id in channel.get("members", []):
            return True
        
        return False
    
    async def _can_post_to_channel(self, channel: Dict[str, Any], user_id: str) -> bool:
        """Check if user can post to channel"""
        user_role = channel.get("roles", {}).get(user_id)
        
        if channel["type"] == ChannelType.CHANNEL.value:
            # Only owner/admin can post to broadcast channels
            return user_role in [MemberRole.OWNER.value, MemberRole.ADMIN.value]
        else:
            # Members can post to group channels
            return user_role in [MemberRole.OWNER.value, MemberRole.ADMIN.value, MemberRole.MEMBER.value]