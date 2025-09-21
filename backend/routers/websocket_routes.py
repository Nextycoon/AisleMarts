"""
⚡ AisleMarts WebSocket Routes
Real-time communication endpoints for live updates and notifications
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from typing import Dict, Any, Optional
import json
import asyncio
import uuid
from datetime import datetime
import logging

from services.websocket_service import connection_manager, realtime_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ws", tags=["WebSocket Real-time 🔄"])

@router.websocket("/rewards/{user_id}")
async def websocket_rewards_endpoint(websocket: WebSocket, user_id: str):
    """
    ⚡ WebSocket endpoint for real-time rewards updates
    Handles mission progress, reward notifications, and live updates
    """
    connection_id = str(uuid.uuid4())
    
    try:
        await connection_manager.connect(websocket, user_id, connection_id)
        
        # Join rewards room for broadcasts
        connection_manager.join_room(websocket, "rewards_live")
        
        # Send initial connection success
        await realtime_service.send_mission_progress_update(user_id, {
            "type": "connection_established",
            "message": "Connected to rewards real-time service",
            "features": ["mission_updates", "reward_notifications", "league_updates", "streak_milestones"],
            "user_id": user_id
        })
        
        while True:
            # Wait for messages from client
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                message_type = message.get("type")
                
                if message_type == "ping":
                    # Respond to ping with pong
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                
                elif message_type == "subscribe_mission":
                    # Subscribe to specific mission updates
                    mission_id = message.get("mission_id")
                    if mission_id:
                        connection_manager.join_room(websocket, f"mission_{mission_id}")
                        await websocket.send_text(json.dumps({
                            "type": "subscription_confirmed", 
                            "mission_id": mission_id,
                            "timestamp": datetime.utcnow().isoformat()
                        }))
                
                elif message_type == "subscribe_leaderboard":
                    # Subscribe to live leaderboard updates
                    connection_manager.join_room(websocket, "leaderboard_live")
                    await websocket.send_text(json.dumps({
                        "type": "leaderboard_subscription_confirmed",
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                
                elif message_type == "request_status":
                    # Send current status update
                    await websocket.send_text(json.dumps({
                        "type": "status_update",
                        "connected": True,
                        "active_subscriptions": ["rewards_live"],
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                
                else:
                    # Unknown message type
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": f"Unknown message type: {message_type}",
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                    
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error", 
                    "message": "Invalid JSON format",
                    "timestamp": datetime.utcnow().isoformat()
                }))
            except WebSocketDisconnect:
                break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
    finally:
        connection_manager.disconnect(websocket, user_id, connection_id)

@router.websocket("/notifications/{user_id}")
async def websocket_notifications_endpoint(websocket: WebSocket, user_id: str):
    """
    🔔 WebSocket endpoint for real-time notifications
    Handles system notifications, alerts, and updates
    """
    connection_id = str(uuid.uuid4())
    
    try:
        await connection_manager.connect(websocket, user_id, connection_id)
        
        # Join notifications room
        connection_manager.join_room(websocket, "notifications_live")
        
        # Send welcome notification
        await websocket.send_text(json.dumps({
            "type": "notification_service_connected",
            "message": "Connected to AisleMarts notifications",
            "channels": ["system", "transactions", "campaigns", "activity"],
            "timestamp": datetime.utcnow().isoformat()
        }))
        
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                message_type = message.get("type")
                
                if message_type == "mark_read":
                    # Mark notification as read
                    notification_id = message.get("notification_id")
                    await websocket.send_text(json.dumps({
                        "type": "marked_read",
                        "notification_id": notification_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                
                elif message_type == "subscribe_channel":
                    # Subscribe to specific notification channel
                    channel = message.get("channel")
                    if channel in ["system", "transactions", "campaigns", "activity"]:
                        connection_manager.join_room(websocket, f"notifications_{channel}")
                        await websocket.send_text(json.dumps({
                            "type": "channel_subscribed",
                            "channel": channel,
                            "timestamp": datetime.utcnow().isoformat()
                        }))
                
                elif message_type == "update_preferences":
                    # Update notification preferences
                    preferences = message.get("preferences", {})
                    await websocket.send_text(json.dumps({
                        "type": "preferences_updated",
                        "preferences": preferences,
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                    
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format",
                    "timestamp": datetime.utcnow().isoformat()
                }))
            except WebSocketDisconnect:
                break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket notifications error for user {user_id}: {e}")
    finally:
        connection_manager.disconnect(websocket, user_id, connection_id)

@router.websocket("/live/{room_id}")
async def websocket_live_endpoint(websocket: WebSocket, room_id: str):
    """
    🎥 WebSocket endpoint for live events and competitions
    Handles live streaming, competitions, and real-time events
    """
    connection_id = str(uuid.uuid4())
    user_id = f"guest_{connection_id[:8]}"  # Anonymous user for live events
    
    try:
        await connection_manager.connect(websocket, user_id, connection_id)
        
        # Join specific live room
        connection_manager.join_room(websocket, room_id)
        
        # Send room join confirmation
        await websocket.send_text(json.dumps({
            "type": "room_joined",
            "room_id": room_id,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }))
        
        # Send room info
        room_info = {
            "participants": len(connection_manager.room_connections.get(room_id, [])),
            "room_type": "live_event",
            "features": ["live_chat", "live_reactions", "live_voting"]
        }
        
        await websocket.send_text(json.dumps({
            "type": "room_info",
            "data": room_info,
            "timestamp": datetime.utcnow().isoformat()
        }))
        
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                message_type = message.get("type")
                
                if message_type == "live_chat":
                    # Broadcast live chat message to room
                    chat_message = {
                        "type": "live_chat_message",
                        "user_id": user_id,
                        "message": message.get("message", ""),
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    await connection_manager.send_to_room(chat_message, room_id)
                
                elif message_type == "live_reaction":
                    # Broadcast live reaction
                    reaction = {
                        "type": "live_reaction",
                        "user_id": user_id,
                        "reaction": message.get("reaction", "👍"),
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    await connection_manager.send_to_room(reaction, room_id)
                
                elif message_type == "request_room_stats":
                    # Send room statistics
                    stats = {
                        "type": "room_stats",
                        "participants": len(connection_manager.room_connections.get(room_id, [])),
                        "messages_sent": 0,  # Would track in production
                        "reactions_sent": 0,  # Would track in production
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    await websocket.send_text(json.dumps(stats))
                    
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format",
                    "timestamp": datetime.utcnow().isoformat()
                }))
            except WebSocketDisconnect:
                break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket live error for room {room_id}: {e}")
    finally:
        connection_manager.disconnect(websocket, user_id, connection_id)

# HTTP endpoints for triggering real-time events

@router.post("/trigger/mission-update")
async def trigger_mission_update(
    user_id: str,
    mission_data: Dict[str, Any],
    background_tasks: BackgroundTasks
):
    """
    🎯 Trigger real-time mission progress update
    """
    background_tasks.add_task(
        realtime_service.send_mission_progress_update,
        user_id,
        mission_data
    )
    
    return {
        "ok": True,
        "message": "Mission update triggered",
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/trigger/reward-claimed")
async def trigger_reward_claimed(
    user_id: str,
    reward_data: Dict[str, Any],
    background_tasks: BackgroundTasks
):
    """
    🎁 Trigger reward claimed notification
    """
    background_tasks.add_task(
        realtime_service.send_reward_claimed,
        user_id,
        reward_data
    )
    
    return {
        "ok": True,
        "message": "Reward claimed notification triggered",
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/trigger/league-advancement")
async def trigger_league_advancement(
    user_id: str,
    league_data: Dict[str, Any],
    background_tasks: BackgroundTasks
):
    """
    🏆 Trigger league advancement notification
    """
    background_tasks.add_task(
        realtime_service.send_league_advancement,
        user_id,
        league_data
    )
    
    return {
        "ok": True,
        "message": "League advancement notification triggered",
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/trigger/system-announcement")
async def trigger_system_announcement(
    announcement_data: Dict[str, Any],
    target_users: Optional[list] = None,
    background_tasks: BackgroundTasks = None
):
    """
    📢 Trigger system-wide announcement
    """
    if background_tasks:
        background_tasks.add_task(
            realtime_service.send_system_announcement,
            announcement_data,
            target_users
        )
    else:
        # Send immediately if no background tasks
        await realtime_service.send_system_announcement(announcement_data, target_users)
    
    return {
        "ok": True,
        "message": "System announcement triggered",
        "target_users": len(target_users) if target_users else "all",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/status")
async def websocket_service_status():
    """
    📊 Get WebSocket service status and statistics
    """
    return {
        "status": "operational",
        "service": "AisleMarts Real-time WebSocket Service",
        "statistics": {
            "active_connections": len(connection_manager.active_connections),
            "active_users": len(connection_manager.user_connections), 
            "active_rooms": len(connection_manager.room_connections),
            "connection_types": ["rewards", "notifications", "live_events"]
        },
        "features": [
            "real_time_mission_updates",
            "reward_notifications", 
            "league_advancements",
            "live_chat",
            "system_announcements",
            "leaderboard_updates"
        ],
        "timestamp": datetime.utcnow().isoformat()
    }