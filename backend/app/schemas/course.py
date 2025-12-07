from typing import Optional, List, Any
from pydantic import BaseModel
from datetime import datetime
from app.models.enums import LevelEnum, CategoryEnum


class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    level: LevelEnum = LevelEnum.beginner
    category: CategoryEnum = CategoryEnum.paid
    price: Optional[float] = 0.0
    tags: Optional[List[str]] = []


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    level: Optional[LevelEnum] = None
    category: Optional[CategoryEnum] = None
    price: Optional[float] = None
    is_published: Optional[bool] = None
    tags: Optional[List[str]] = None


class CourseResponse(CourseBase):
    id: int
    created_by: int
    is_published: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InstructorSchema(BaseModel):
    id: int
    full_name: str
    photo: Optional[str] = None
    bio: Optional[str] = None
    
    class Config:
        from_attributes = True


class CourseDetailResponse(CourseResponse):
    instructors: List[InstructorSchema] = []
