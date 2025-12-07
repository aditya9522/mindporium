from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class FeedbackBase(BaseModel):
    subject: str
    message: str
    rating: Optional[int] = None
    category: str = "general"


class AppFeedbackCreate(FeedbackBase):
    pass


class CourseFeedbackCreate(BaseModel):
    course_id: int
    rating: int
    review_text: Optional[str] = None


class InstructorFeedbackCreate(BaseModel):
    instructor_id: int
    rating: int
    comments: Optional[str] = None


class UserBasic(BaseModel):
    id: int
    full_name: str
    email: str
    
    class Config:
        from_attributes = True


class AppFeedbackResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    subject: str
    message: str
    rating: Optional[int] = None
    category: str
    status: str
    response: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserBasic] = None
    
    class Config:
        from_attributes = True


class CourseFeedbackResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    course_id: int
    rating: int
    review_text: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserBasic] = None
    
    class Config:
        from_attributes = True


class InstructorFeedbackResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    instructor_id: int
    rating: int
    comments: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserBasic] = None
    
    class Config:
        from_attributes = True


# Legacy response for backward compatibility
class FeedbackResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    rating: Optional[int] = None
    message: Optional[str] = None
    review_text: Optional[str] = None
    comments: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserBasic] = None
    
    class Config:
        from_attributes = True
