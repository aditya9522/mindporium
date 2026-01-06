import json
import logging
import asyncio
from typing import Dict, Set, Any

from fastapi import WebSocket, WebSocketDisconnect
from app.core.redis import redis_manager

logger = logging.getLogger("app.ws")

class ConnectionManager:
    def __init__(self):
        # Local connections: classroom_id -> {user_id -> WebSocket}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.pubsub_tasks: Dict[str, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket, classroom_id: str, user_id: str):
        if classroom_id not in self.active_connections:
            self.active_connections[classroom_id] = {}
        self.active_connections[classroom_id][user_id] = websocket
        
        # Start listening to Redis channel for this classroom if not already
        if classroom_id not in self.pubsub_tasks:
            self.pubsub_tasks[classroom_id] = asyncio.create_task(self._listen_to_redis(classroom_id))
            
        logger.info(f"User {user_id} connected locally to classroom {classroom_id}")

    def disconnect(self, classroom_id: str, user_id: str):
        if classroom_id in self.active_connections:
            if user_id in self.active_connections[classroom_id]:
                del self.active_connections[classroom_id][user_id]
            if not self.active_connections[classroom_id]:
                del self.active_connections[classroom_id]
                # Stop Redis listener if room is empty on THIS instance
                if classroom_id in self.pubsub_tasks:
                    self.pubsub_tasks[classroom_id].cancel()
                    del self.pubsub_tasks[classroom_id]
        logger.info(f"User {user_id} disconnected from classroom {classroom_id}")

    async def broadcast_to_room(self, classroom_id: str, message: dict, exclude_user: str = None):
        """
        Broadcast via Redis so all workers receive it.
        """
        payload = {
            "type": "broadcast",
            "message": message,
            "exclude_user": exclude_user
        }
        await redis_manager.publish(f"classroom:{classroom_id}", json.dumps(payload))

    async def send_personal_message(self, message: dict, classroom_id: str, user_id: str):
        """
        Send via Redis so the worker holding this user's connection receives it.
        """
        payload = {
            "type": "personal",
            "target_user_id": user_id,
            "message": message
        }
        await redis_manager.publish(f"classroom:{classroom_id}", json.dumps(payload))

    async def _listen_to_redis(self, classroom_id: str):
        pubsub = await redis_manager.subscribe(f"classroom:{classroom_id}")
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    msg_type = data.get("type")
                    
                    if msg_type == "broadcast":
                        exclude = data.get("exclude_user")
                        inner_msg = data.get("message")
                        await self._local_broadcast(classroom_id, inner_msg, exclude)
                    
                    elif msg_type == "personal":
                        target = data.get("target_user_id")
                        inner_msg = data.get("message")
                        await self._local_send(classroom_id, inner_msg, target)
        except asyncio.CancelledError:
            await pubsub.unsubscribe(f"classroom:{classroom_id}")
        except Exception as e:
            logger.error(f"Redis PubSub Error for {classroom_id}: {e}")

    async def _local_broadcast(self, classroom_id: str, message: dict, exclude_user: str = None):
        if classroom_id in self.active_connections:
            for user_id, connection in self.active_connections[classroom_id].items():
                if user_id != exclude_user:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        logger.error(f"Error sending local broadcast to {user_id}: {e}")

    async def _local_send(self, classroom_id: str, message: dict, user_id: str):
        if classroom_id in self.active_connections and user_id in self.active_connections[classroom_id]:
            try:
                await self.active_connections[classroom_id][user_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending local personal message to {user_id}: {e}")

    def get_connected_users(self, classroom_id: str) -> Set[str]:
        # Note: This only returns users on THIS worker. 
        # For a truly global list, we'd need to track this in Redis.
        # But for signaling initialization, we can improve this later.
        return set(self.active_connections.get(classroom_id, {}).keys())

manager = ConnectionManager()
