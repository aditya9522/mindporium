from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserResponse
from app.schemas.classroom import ClassroomResponse

class AttendanceBase(BaseModel):
    is_present: bool = True
    status: str = "present"

class AttendanceCreate(AttendanceBase):
    classroom_id: int
    device_info: Optional[str] = None
    ip_address: Optional[str] = None

class AttendanceUpdate(BaseModel):
    left_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: int
    classroom_id: int
    user_id: int
    joined_at: Optional[datetime] = None
    left_at: Optional[datetime] = None
    duration_minutes: int = 0
    ip_address: Optional[str] = None
    device_info: Optional[str] = None
    
    # We might want to include partial classroom info
    classroom_title: Optional[str] = None
    user: Optional[UserResponse] = None
    classroom: Optional[ClassroomResponse] = None

    class Config:
        from_attributes = True
