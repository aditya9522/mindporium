import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.ws.manager import manager
from app.core.redis import redis_manager
from app.services.attendance_service import attendance_service

router = APIRouter()

@router.websocket("/classroom/{classroom_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    classroom_id: str,
    token: str = None, 
):
    user_id = None
    attendance_id = None
    try:
        await websocket.accept()
        
        # 1. Wait for Join message to identify user
        data = await websocket.receive_json()
        if data.get("type") == "join":
            user_id = str(data.get("user_id"))
            
            # Register connection
            await manager.connect(websocket, classroom_id, user_id)
            
            # Mark Attendance
            client_host = websocket.client.host if websocket.client else None
            attendance_id = await attendance_service.mark_attendance_join(
                int(classroom_id), int(user_id), client_host
            )
            
            # Notify others
            await manager.broadcast_to_room(classroom_id, {
                "type": "user_joined",
                "user_id": user_id,
                "payload": data.get("user_info")
            }, exclude_user=user_id)
            
        else:
            await websocket.close(code=4003)
            return

        # 2. Main Loop
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")
            
            # Signaling for WebRTC (Offer, Answer, ICE Candidate)
            if message_type in ["offer", "answer", "candidate"]:
                target_user_id = data.get("target_user_id")
                if target_user_id:
                    # Relay to specific user
                    await manager.send_personal_message(data, classroom_id, target_user_id)
            
            # Chat or System Events
            elif message_type == "chat":
                await manager.broadcast_to_room(classroom_id, data)
                
            elif message_type == "hand_raise":
                await manager.broadcast_to_room(classroom_id, data)

    except WebSocketDisconnect:
        if user_id:
            manager.disconnect(classroom_id, user_id)
            
            if attendance_id:
                await attendance_service.mark_attendance_leave(attendance_id)
                
            await manager.broadcast_to_room(classroom_id, {
                "type": "user_left",
                "user_id": user_id
            })
