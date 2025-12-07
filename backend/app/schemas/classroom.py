from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from app.models.enums import ClassroomStatusEnum, ClassroomTypeEnum, ClassroomProviderEnum
from app.schemas.user import UserResponse


class ClassroomBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: ClassroomStatusEnum = ClassroomStatusEnum.not_started
    class_type: ClassroomTypeEnum = ClassroomTypeEnum.regular
    provider: ClassroomProviderEnum = ClassroomProviderEnum.custom
    max_participants: int = 100
    settings: Optional[Dict[str, Any]] = None
    subject_id: Optional[int] = None


class ClassroomCreate(ClassroomBase):
    pass


class ClassroomUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[ClassroomStatusEnum] = None
    join_url: Optional[str] = None
    recording_url: Optional[str] = None
    is_active: Optional[bool] = None


class ClassroomResponse(ClassroomBase):
    id: int
    instructor_id: Optional[int] = None
    meeting_id: Optional[str] = None
    join_url: Optional[str] = None
    created_at: Optional[datetime] = None
    instructor: Optional[UserResponse] = None
    
    # We might not want to expose meeting_password directly in list views
    # meeting_password: Optional[str] = None 

    class Config:
        from_attributes = True

class ClassMessageCreate(BaseModel):
    message_text: str
    message_type: str = "normal"

class ClassMessageResponse(BaseModel):
    id: int
    classroom_id: int
    user_id: Optional[int]
    message_text: str
    message_type: str
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
