"""
⚡ AisleMarts Real-time WebSocket Service
Real-time notifications, live updates, and instant communication
"""

import asyncio
import json
import logging
from typing import Dict, List, Set, Any, Optional
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Active WebSocket connections
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        self.room_connections: Dict[str, Set[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str, connection_id: str):
        """Accept WebSocket connection"""
        await websocket.accept()
        
        # Store connection
        self.active_connections[connection_id] = websocket
        
        # Add to user connections
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(websocket)
        
        logger.info(f"✅ WebSocket connected: {user_id} ({connection_id})")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "message": "Connected to AisleMarts real-time service",
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "connection_id": connection_id
        }, websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: str, connection_id: str):
        """Remove WebSocket connection"""
        # Remove from active connections
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        
        # Remove from user connections
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        logger.info(f"❌ WebSocket disconnected: {user_id} ({connection_id})")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send message to specific WebSocket"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
    
    async def send_to_user(self, message: Dict[str, Any], user_id: str):
        """Send message to all connections of a user"""
        if user_id in self.user_connections:
            disconnected_connections = []
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    disconnected_connections.append(connection)
            
            # Clean up disconnected connections
            for connection in disconnected_connections:
                self.user_connections[user_id].discard(connection)
    
    async def send_to_room(self, message: Dict[str, Any], room_id: str):
        """Send message to all connections in a room"""
        if room_id in self.room_connections:
            disconnected_connections = []
            for connection in self.room_connections[room_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    disconnected_connections.append(connection)
            
            # Clean up disconnected connections
            for connection in disconnected_connections:
                self.room_connections[room_id].discard(connection)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all active connections"""
        disconnected_connections = []
        for connection_id, connection in self.active_connections.items():
            try:
                await connection.send_text(json.dumps(message))
            except:
                disconnected_connections.append(connection_id)
        
        # Clean up disconnected connections
        for connection_id in disconnected_connections:
            del self.active_connections[connection_id]
    
    def join_room(self, websocket: WebSocket, room_id: str):
        """Add connection to a room"""
        if room_id not in self.room_connections:
            self.room_connections[room_id] = set()
        self.room_connections[room_id].add(websocket)
    
    def leave_room(self, websocket: WebSocket, room_id: str):
        """Remove connection from a room"""
        if room_id in self.room_connections:
            self.room_connections[room_id].discard(websocket)
            if not self.room_connections[room_id]:
                del self.room_connections[room_id]

class RealtimeService:
    def __init__(self, connection_manager: ConnectionManager):
        self.manager = connection_manager
        
    async def send_mission_progress_update(self, user_id: str, mission_data: Dict[str, Any]):
        """Send real-time mission progress update"""
        message = {
            "type": "mission_progress_update",
            "data": mission_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.manager.send_to_user(message, user_id)
        logger.info(f"🎯 Mission progress sent to {user_id}: {mission_data['missionId']}")
    
    async def send_reward_claimed(self, user_id: str, reward_data: Dict[str, Any]):
        """Send reward claimed notification"""
        message = {
            "type": "reward_claimed",
            "data": reward_data,
            "timestamp": datetime.utcnow().isoformat(),
            "celebration": True  # Trigger confetti/animation
        }
        await self.manager.send_to_user(message, user_id)
        logger.info(f"🎁 Reward claimed notification sent to {user_id}")
    
    async def send_league_advancement(self, user_id: str, league_data: Dict[str, Any]):
        """Send league advancement notification"""
        message = {
            "type": "league_advancement",
            "data": league_data,
            "timestamp": datetime.utcnow().isoformat(),
            "celebration": True
        }
        await self.manager.send_to_user(message, user_id)
        logger.info(f"🏆 League advancement sent to {user_id}: {league_data['newLeague']}")
    
    async def send_streak_milestone(self, user_id: str, streak_data: Dict[str, Any]):
        """Send streak milestone notification"""
        message = {
            "type": "streak_milestone",
            "data": streak_data,
            "timestamp": datetime.utcnow().isoformat(),
            "celebration": True
        }
        await self.manager.send_to_user(message, user_id)
        logger.info(f"🔥 Streak milestone sent to {user_id}")
    
    async def send_competition_update(self, competition_id: str, update_data: Dict[str, Any]):
        """Send competition update to all participants"""
        message = {
            "type": "competition_update", 
            "data": update_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.manager.send_to_room(message, f"competition_{competition_id}")
        logger.info(f"🏆 Competition update sent for {competition_id}")
    
    async def send_social_activity(self, user_ids: List[str], activity_data: Dict[str, Any]):
        """Send social activity notification to multiple users"""
        message = {
            "type": "social_activity",
            "data": activity_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        for user_id in user_ids:
            await self.manager.send_to_user(message, user_id)
        
        logger.info(f"👥 Social activity sent to {len(user_ids)} users")
    
    async def send_system_announcement(self, announcement_data: Dict[str, Any], target_users: Optional[List[str]] = None):
        """Send system-wide announcement"""
        message = {
            "type": "system_announcement",
            "data": announcement_data,
            "timestamp": datetime.utcnow().isoformat(),
            "priority": announcement_data.get("priority", "normal")
        }
        
        if target_users:
            for user_id in target_users:
                await self.manager.send_to_user(message, user_id)
        else:
            await self.manager.broadcast(message)
        
        logger.info(f"📢 System announcement sent")
    
    async def send_withdrawal_update(self, user_id: str, withdrawal_data: Dict[str, Any]):
        """Send withdrawal status update"""
        message = {
            "type": "withdrawal_update",
            "data": withdrawal_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.manager.send_to_user(message, user_id)
        logger.info(f"💰 Withdrawal update sent to {user_id}")
    
    async def send_live_leaderboard_update(self, leaderboard_data: Dict[str, Any]):
        """Send live leaderboard updates"""
        message = {
            "type": "leaderboard_update",
            "data": leaderboard_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.manager.send_to_room(message, "leaderboard_live")
        logger.info("📊 Live leaderboard update sent")

# Global connection manager and realtime service
connection_manager = ConnectionManager()
realtime_service = RealtimeService(connection_manager)

# Background tasks for periodic updates
async def send_periodic_updates():
    """Send periodic system updates"""
    while True:
        try:
            # Send periodic stats update every 30 seconds
            stats_message = {
                "type": "system_stats",
                "data": {
                    "active_users": len(connection_manager.user_connections),
                    "total_connections": len(connection_manager.active_connections),
                    "active_rooms": len(connection_manager.room_connections),
                    "timestamp": datetime.utcnow().isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            if connection_manager.active_connections:
                await connection_manager.broadcast(stats_message)
            
            await asyncio.sleep(30)  # Wait 30 seconds
        except Exception as e:
            logger.error(f"Periodic update error: {e}")
            await asyncio.sleep(30)

async def send_engagement_reminders():
    """Send engagement reminders to inactive users"""
    while True:
        try:
            # This would integrate with user activity tracking
            reminder_message = {
                "type": "engagement_reminder",
                "data": {
                    "title": "Don't miss your daily streak!",
                    "message": "Complete a mission to maintain your streak 🔥",
                    "cta": "View Missions"
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Send to users who haven't been active in the last 4 hours
            # This would be implemented with actual user activity data
            
            await asyncio.sleep(3600)  # Wait 1 hour
        except Exception as e:
            logger.error(f"Engagement reminder error: {e}")
            await asyncio.sleep(3600)