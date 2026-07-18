from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    files: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    tags: Optional[List[str]] = Field(default_factory=list)
    status: Optional[str] = "active"
    is_pinned: Optional[bool] = False
    color: Optional[str] = None

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    files: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    is_pinned: Optional[bool] = None
    color: Optional[str] = None

class NoteResponse(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
