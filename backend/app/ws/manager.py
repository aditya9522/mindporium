import json
import logging
from typing import Dict, Set

from fastapi import WebSocket, WebSocketDisconnect
from app.core.redis import redis_manager

logger = logging.getLogger("app.ws")

class ConnectionManager:
    def __init__(self):
        # Local connections: classroom_id -> {user_id -> WebSocket}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, classroom_id: str, user_id: str):
        await websocket.accept()
        if classroom_id not in self.active_connections:
            self.active_connections[classroom_id] = {}
        self.active_connections[classroom_id][user_id] = websocket
        logger.info(f"User {user_id} connected to classroom {classroom_id}")

    def disconnect(self, classroom_id: str, user_id: str):
        if classroom_id in self.active_connections:
            if user_id in self.active_connections[classroom_id]:
                del self.active_connections[classroom_id][user_id]
            if not self.active_connections[classroom_id]:
                del self.active_connections[classroom_id]
        logger.info(f"User {user_id} disconnected from classroom {classroom_id}")

    async def broadcast_to_room(self, classroom_id: str, message: dict, exclude_user: str = None):
        """
        Broadcast message to all users in a specific classroom.
        """
        if classroom_id in self.active_connections:
            for user_id, connection in self.active_connections[classroom_id].items():
                if user_id != exclude_user:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        logger.error(f"Error sending message to {user_id}: {e}")

    async def send_personal_message(self, message: dict, classroom_id: str, user_id: str):
        if classroom_id in self.active_connections and user_id in self.active_connections[classroom_id]:
            try:
                await self.active_connections[classroom_id][user_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending personal message to {user_id}: {e}")

manager = ConnectionManager()
