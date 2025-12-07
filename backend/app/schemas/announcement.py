from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserResponse


class AnnouncementBase(BaseModel):
    title: str
    content: str
    is_pinned: bool = False
    is_active: bool = True
    course_id: Optional[int] = None
    subject_id: Optional[int] = None


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_active: Optional[bool] = None


class AnnouncementResponse(AnnouncementBase):
    id: int
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    creator: Optional["UserResponse"] = None

    class Config:
        from_attributes = True
