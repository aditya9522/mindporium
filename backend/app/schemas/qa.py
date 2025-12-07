from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserResponse


class AnswerBase(BaseModel):
    answer_text: str

class AnswerCreate(AnswerBase):
    question_id: int

class AnswerResponse(AnswerBase):
    id: int
    user_id: Optional[int] = None
    is_helpful: bool = False
    is_instructor_answer: bool = False
    upvotes: int = 0
    created_at: Optional[datetime] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class QuestionBase(BaseModel):
    title: str
    question_text: str
    subject_id: int

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    id: int
    user_id: Optional[int] = None
    is_resolved: bool = False
    upvotes: int = 0
    created_at: Optional[datetime] = None
    user: Optional[UserResponse] = None
    answers: List[AnswerResponse] = []

    class Config:
        from_attributes = True
