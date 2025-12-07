from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class ChatMessageBase(BaseModel):
    content: str
    sender: str = "user"  # user or ai


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessageResponse(ChatMessageBase):
    id: int
    session_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatSessionBase(BaseModel):
    title: Optional[str] = "New Chat"


class ChatSessionCreate(ChatSessionBase):
    pass


class ChatSessionResponse(ChatSessionBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True
