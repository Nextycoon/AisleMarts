from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
import json
import logging

import sys
import os
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from routers.deps import get_db
from security import get_current_user
from models.call import (
    CallModel, CallSignalMessage, CallSignalType, CallStatus,
    InitiateCallRequest, CallAnswerRequest, CallDeclineRequest,
    CallEndRequest, ICECandidateRequest
)
from services.call_service import CallService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/calls", tags=["Voice/Video Calls"])

# Call signaling WebSocket connections
call_connections: Dict[str, Dict[str, WebSocket]] = {}  # call_id -> {user_id: websocket}

@router.post("/initiate", response_model=CallModel)
async def initiate_call(
    request: InitiateCallRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Initiate a voice or video call"""
    call_service = CallService(db)
    return await call_service.initiate_call(request, current_user["_id"])

@router.post("/answer")
async def answer_call(
    request: CallAnswerRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Answer an incoming call"""
    call_service = CallService(db)
    call = await call_service.get_call(request.call_id)
    
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    # Update call status
    updated_call = await call_service.update_call_status(
        request.call_id, 
        CallStatus.CONNECTED, 
        current_user["_id"]
    )
    
    # Broadcast answer to caller
    await broadcast_call_signal(
        request.call_id,
        CallSignalMessage(
            type=CallSignalType.CALL_ANSWER,
            call_id=request.call_id,
            from_user_id=current_user["_id"],
            sdp=request.sdp
        ),
        exclude_user=current_user["_id"]
    )
    
    return {"status": "answered", "call": updated_call}

@router.post("/decline")
async def decline_call(
    request: CallDeclineRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Decline an incoming call"""
    call_service = CallService(db)
    call = await call_service.end_call(request.call_id, request.reason, current_user["_id"])
    
    # Broadcast decline to caller
    await broadcast_call_signal(
        request.call_id,
        CallSignalMessage(
            type=CallSignalType.CALL_DECLINE,
            call_id=request.call_id,
            from_user_id=current_user["_id"],
            reason=request.reason
        ),
        exclude_user=current_user["_id"]
    )
    
    return {"status": "declined", "call": call}

@router.post("/end")
async def end_call(
    request: CallEndRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """End an active call"""
    call_service = CallService(db)
    call = await call_service.end_call(request.call_id, request.reason, current_user["_id"])
    
    # Broadcast end to all participants
    await broadcast_call_signal(
        request.call_id,
        CallSignalMessage(
            type=CallSignalType.CALL_END,
            call_id=request.call_id,
            from_user_id=current_user["_id"],
            reason=request.reason
        )
    )
    
    # Clean up connections
    call_connections.pop(request.call_id, None)
    
    return {"status": "ended", "call": call}

@router.post("/ice-candidate")
async def send_ice_candidate(
    request: ICECandidateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Send ICE candidate for WebRTC"""
    # Broadcast ICE candidate to other participant
    await broadcast_call_signal(
        request.call_id,
        CallSignalMessage(
            type=CallSignalType.ICE_CANDIDATE,
            call_id=request.call_id,
            from_user_id=current_user["_id"],
            candidate=request.candidate
        ),
        exclude_user=current_user["_id"]
    )
    
    return {"status": "sent"}

@router.get("/history", response_model=List[CallModel])
async def get_call_history(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get call history for user"""
    call_service = CallService(db)
    return await call_service.get_user_calls(current_user["_id"])

@router.get("/active")
async def get_active_calls(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get currently active calls"""
    call_service = CallService(db)
    active_calls = await call_service.get_active_calls()
    
    # Filter for user's calls only
    user_calls = {}
    for call_id, call_data in active_calls.items():
        if current_user["_id"] in call_data["participants"]:
            user_calls[call_id] = call_data
    
    return {"active_calls": user_calls}

# WebSocket endpoint for call signaling
@router.websocket("/ws/{call_id}")
async def websocket_call_signaling(
    websocket: WebSocket,
    call_id: str,
    token: Optional[str] = None,
    db=Depends(get_db)
):
    """WebSocket endpoint for call signaling"""
    if not token:
        await websocket.close(code=4001, reason="Authentication required")
        return
    
    # TODO: Implement proper JWT validation
    user_id = token  # Simplified for demo
    
    # Verify user is participant in call
    call_service = CallService(db)
    call = await call_service.get_call(call_id)
    if not call or user_id not in [call.caller_id, call.callee_id]:
        await websocket.close(code=4004, reason="Not authorized for this call")
        return
    
    await websocket.accept()
    
    # Add to call connections
    if call_id not in call_connections:
        call_connections[call_id] = {}
    call_connections[call_id][user_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle signaling messages
            signal_type = message.get("type")
            
            if signal_type in [CallSignalType.ICE_CANDIDATE, CallSignalType.CALL_MUTE, CallSignalType.CALL_VIDEO_TOGGLE]:
                # Forward signaling to other participant
                await broadcast_call_signal(
                    call_id,
                    CallSignalMessage(
                        type=CallSignalType(signal_type),
                        call_id=call_id,
                        from_user_id=user_id,
                        **message.get("data", {})
                    ),
                    exclude_user=user_id
                )
            
    except WebSocketDisconnect:
        # Clean up connection
        if call_id in call_connections and user_id in call_connections[call_id]:
            del call_connections[call_id][user_id]
            if not call_connections[call_id]:
                del call_connections[call_id]
    except Exception as e:
        logger.error(f"Call signaling error: {str(e)}")
        if call_id in call_connections and user_id in call_connections[call_id]:
            del call_connections[call_id][user_id]

async def broadcast_call_signal(
    call_id: str,
    signal: CallSignalMessage,
    exclude_user: Optional[str] = None
):
    """Broadcast signaling message to call participants"""
    if call_id not in call_connections:
        return
    
    message = signal.dict()
    disconnected = []
    
    for user_id, websocket in call_connections[call_id].items():
        if exclude_user and user_id == exclude_user:
            continue
        
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.warning(f"Failed to send signal to user {user_id}: {str(e)}")
            disconnected.append(user_id)
    
    # Clean up disconnected users
    for user_id in disconnected:
        call_connections[call_id].pop(user_id, None)