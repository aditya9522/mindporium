import json
import logging
from typing import Optional
import redis.asyncio as redis
from app.core.config import settings

logger = logging.getLogger("app.redis")

class RedisManager:
    def __init__(self):
        self.redis: Optional[redis.Redis] = None

    async def connect(self):
        if not self.redis:
            self.redis = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
            )
            logger.info("Connected to Redis")

    async def close(self):
        if self.redis:
            await self.redis.close()
            logger.info("Closed Redis connection")

    async def get(self, key: str) -> Optional[str]:
        return await self.redis.get(key)

    async def set(self, key: str, value: str, expire: int = None):
        await self.redis.set(key, value, ex=expire)

    async def delete(self, key: str):
        await self.redis.delete(key)
        
    async def publish(self, channel: str, message: str):
        await self.redis.publish(channel, message)

    async def subscribe(self, channel: str):
        pubsub = self.redis.pubsub()
        await pubsub.subscribe(channel)
        return pubsub

redis_manager = RedisManager()
