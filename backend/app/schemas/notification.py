from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
