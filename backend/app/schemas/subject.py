from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class SubjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: int
    order_index: int = 0


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


from app.schemas.resource import ResourceResponse

class SubjectResponse(SubjectBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    resources: List[ResourceResponse] = []
    course_title: Optional[str] = None

    class Config:
        from_attributes = True
