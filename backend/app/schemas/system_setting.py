from typing import Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime


class SystemSettingBase(BaseModel):
    key: str
    value: Any
    description: Optional[str] = None
    is_public: bool = False
    group: str = "general"


class SystemSettingCreate(SystemSettingBase):
    pass


class SystemSettingUpdate(BaseModel):
    value: Optional[Any] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    group: Optional[str] = None


class SystemSettingResponse(SystemSettingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SystemStats(BaseModel):
    total_users: int
    total_courses: int
    total_classrooms: int
    active_classrooms: int
    total_communities: int
