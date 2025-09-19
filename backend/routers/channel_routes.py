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
from models.channel import (
    ChannelModel, ChannelMessage, ChannelInvite, ChannelType,
    CreateChannelRequest, JoinChannelRequest, InviteMembersRequest,
    PostChannelMessageRequest, PinMessageRequest, UpdateChannelRequest
)
from services.channel_service import ChannelService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/channels", tags=["Channels & Groups"])

@router.post("", response_model=ChannelModel)
async def create_channel(
    request: CreateChannelRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Create a new channel or group"""
    channel_service = ChannelService(db)
    return await channel_service.create_channel(request, current_user["_id"])

@router.get("", response_model=List[ChannelModel])
async def get_channels(
    channel_type: Optional[ChannelType] = None,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get channels for user"""
    channel_service = ChannelService(db)
    return await channel_service.get_user_channels(current_user["_id"], channel_type)

@router.get("/{channel_id}", response_model=ChannelModel)
async def get_channel(
    channel_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get channel details"""
    channel_service = ChannelService(db)
    channel = await channel_service.get_channel(channel_id, current_user["_id"])
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel

@router.post("/{channel_id}/join", response_model=ChannelModel)
async def join_channel(
    channel_id: str,
    request: JoinChannelRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Join a channel"""
    channel_service = ChannelService(db)
    return await channel_service.join_channel(
        channel_id, 
        current_user["_id"], 
        request.invite_code
    )

@router.post("/{channel_id}/messages", response_model=ChannelMessage)
async def post_message(
    channel_id: str,
    request: PostChannelMessageRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Post a message to channel"""
    channel_service = ChannelService(db)
    return await channel_service.post_message(channel_id, request, current_user["_id"])

@router.get("/{channel_id}/messages", response_model=List[ChannelMessage])
async def get_channel_messages(
    channel_id: str,
    limit: int = 50,
    before: Optional[datetime] = None,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get messages from channel"""
    channel_service = ChannelService(db)
    return await channel_service.get_channel_messages(
        channel_id, 
        current_user["_id"], 
        limit, 
        before
    )

@router.post("/{channel_id}/pin", response_model=ChannelMessage)
async def pin_message(
    channel_id: str,
    request: PinMessageRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Pin a message in channel"""
    channel_service = ChannelService(db)
    return await channel_service.pin_message(
        channel_id, 
        request.message_id, 
        current_user["_id"]
    )

@router.post("/{channel_id}/invite", response_model=ChannelInvite)
async def create_invite(
    channel_id: str,
    expires_hours: Optional[int] = None,
    max_uses: Optional[int] = None,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Create an invite link for channel"""
    channel_service = ChannelService(db)
    return await channel_service.create_invite(
        channel_id, 
        current_user["_id"], 
        expires_hours, 
        max_uses
    )

@router.post("/{channel_id}/members", response_model=ChannelModel)
async def invite_members(
    channel_id: str,
    request: InviteMembersRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Invite members to group channel"""
    # This would be implemented to add multiple users to a group
    # For now, return the channel
    channel_service = ChannelService(db)
    channel = await channel_service.get_channel(channel_id, current_user["_id"])
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel

@router.patch("/{channel_id}", response_model=ChannelModel)
async def update_channel(
    channel_id: str,
    request: UpdateChannelRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Update channel details (owner only)"""
    channel_service = ChannelService(db)
    
    # Get channel and verify ownership
    channel = await channel_service.get_channel(channel_id, current_user["_id"])
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    if channel.owner_id != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Only channel owner can update")
    
    # Update channel (simplified implementation)
    update_data = {}
    if request.title:
        update_data["title"] = request.title
    if request.description is not None:
        update_data["description"] = request.description
    if request.theme:
        update_data["theme"] = request.theme.value
    if request.tags is not None:
        update_data["tags"] = request.tags
    if request.avatar_url is not None:
        update_data["avatar_url"] = request.avatar_url
    if request.banner_url is not None:
        update_data["banner_url"] = request.banner_url
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await channel_service.channels.update_one(
            {"_id": channel_id},
            {"$set": update_data}
        )
    
    # Return updated channel
    updated_channel = await channel_service.get_channel(channel_id, current_user["_id"])
    return updated_channel