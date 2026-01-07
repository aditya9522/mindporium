import json
import logging
import asyncio
from typing import Dict, Set, Any, List, Optional
from fastapi import WebSocket, WebSocketDisconnect
from app.core.redis import redis_manager

logger = logging.getLogger("app.ws.notifications")

class NotificationManager:
    def __init__(self):
        # Local connections: user_id -> List[WebSocket] (allow multiple tabs)
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.pubsub_task: Optional[asyncio.Task] = None
        self.global_channel = "notifications:global"

    async def connect(self, websocket: WebSocket, user_id: str):
        user_id_str = str(user_id)
        if user_id_str not in self.active_connections:
            self.active_connections[user_id_str] = set()
        self.active_connections[user_id_str].add(websocket)
        
        # Start global listener if not started
        if not self.pubsub_task:
            self.pubsub_task = asyncio.create_task(self._listen_to_redis())
            
        logger.info(f"User {user_id} connected to notifications WS")

    def disconnect(self, websocket: WebSocket, user_id: str):
        user_id_str = str(user_id)
        if user_id_str in self.active_connections:
            self.active_connections[user_id_str].discard(websocket)
            if not self.active_connections[user_id_str]:
                del self.active_connections[user_id_str]
        
        # Stop global listener if no one is connected to THIS instance
        if not self.active_connections and self.pubsub_task:
            self.pubsub_task.cancel()
            self.pubsub_task = None
            
        logger.info(f"User {user_id} disconnected from notifications WS")

    async def broadcast_notification(self, user_ids: list, notification_data: dict):
        """
        Broadcast notification to specific users via Redis.
        """
        payload = {
            "type": "targeted",
            "user_ids": [str(uid) for uid in user_ids],
            "data": notification_data
        }
        await redis_manager.publish(self.global_channel, json.dumps(payload))

    async def broadcast_to_all(self, notification_data: dict):
        """
        Broadcast notification to ALL connected users.
        """
        payload = {
            "type": "all",
            "data": notification_data
        }
        await redis_manager.publish(self.global_channel, json.dumps(payload))

    async def _listen_to_redis(self):
        pubsub = await redis_manager.subscribe(self.global_channel)
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    mode = data.get("type")
                    notification_msg = data.get("data")
                    
                    if mode == "targeted":
                        target_user_ids = data.get("user_ids", [])
                        for uid in target_user_ids:
                            await self._local_send(uid, notification_msg)
                    
                    elif mode == "all":
                        await self._local_broadcast(notification_msg)
                        
        except asyncio.CancelledError:
            await pubsub.unsubscribe(self.global_channel)
        except Exception as e:
            logger.error(f"Notification WS Redis PubSub Error: {e}")

    async def _local_send(self, user_id_str: str, message: dict):
        if user_id_str in self.active_connections:
            websockets = list(self.active_connections[user_id_str])
            for ws in websockets:
                try:
                    await ws.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending targeted notification to {user_id_str}: {e}")
                    self.active_connections[user_id_str].discard(ws)

    async def _local_broadcast(self, message: dict):
        for user_id_str, websockets in self.active_connections.items():
            for ws in list(websockets):
                try:
                    await ws.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting notification to {user_id_str}: {e}")
                    websockets.discard(ws)

notification_ws_manager = NotificationManager()
