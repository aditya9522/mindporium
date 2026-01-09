import logging
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.ws.manager import manager
from app.ws.notifications import notification_ws_manager
from app.services.attendance_service import attendance_service

logger = logging.getLogger("app.ws.signaling")

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
                    await manager.send_personal_message(data, classroom_id, str(target_user_id))
            
            # Chat or System Events
            elif message_type == "chat":
                await manager.broadcast_to_room(classroom_id, data, exclude_user=user_id)
                
            elif message_type == "hand_raise":
                await manager.broadcast_to_room(classroom_id, data, exclude_user=user_id)

    except WebSocketDisconnect:
        if user_id:
            manager.disconnect(classroom_id, user_id)
            
            if attendance_id:
                await attendance_service.mark_attendance_leave(attendance_id)
                
            await manager.broadcast_to_room(classroom_id, {
                "type": "user_left",
                "user_id": user_id
            })

@router.websocket("/notifications")
async def notification_endpoint(
    websocket: WebSocket,
    user_id: str = None
):
    """
    WebSocket endpoint for real-time notifications.
    """
    logger.info(f"Incoming notification WS connection")
    try:
        # Identification via payload since some WS clients don't support headers well
        await websocket.accept()
        logger.info("Notification WS accepted, waiting for auth message")
        data = await websocket.receive_json()
        
        if data.get("type") == "auth":
            user_id = str(data.get("user_id"))
            await notification_ws_manager.connect(websocket, user_id)
            
            # Keep-alive loop
            while True:
                await websocket.receive_text() # Wait for client messages or keep open
        else:
            await websocket.close(code=4001)
            
    except WebSocketDisconnect:
        if user_id:
            notification_ws_manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"Notification WS error: {e}")
        if user_id:
            notification_ws_manager.disconnect(websocket, user_id)
