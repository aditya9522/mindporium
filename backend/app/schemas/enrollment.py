from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.schemas.course import CourseResponse


class EnrollmentBase(BaseModel):
    course_id: int


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    enrolled_at: Optional[datetime] = None
    progress_percent: float = 0.0
    course: Optional[CourseResponse] = None

    class Config:
        from_attributes = True
