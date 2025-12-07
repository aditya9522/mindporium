from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class AttendanceBase(BaseModel):
    is_present: bool = True
    status: str = "present"

class AttendanceCreate(AttendanceBase):
    classroom_id: int

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
    
    # We might want to include partial classroom info
    classroom_title: Optional[str] = None

    class Config:
        from_attributes = True
