from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    files: Optional[List[Dict[str, Any]]] = [] # [{name: str, url: str, type: str}]
    tags: Optional[List[str]] = []
    status: Optional[str] = "active"

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    files: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None

class NoteResponse(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
