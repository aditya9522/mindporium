from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from app.models.enums import TestStatusEnum


class TestQuestionBase(BaseModel):
    question_text: str
    question_type: str = "mcq"
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    marks: float = 1.0
    order_index: int = 0


class TestQuestionCreate(TestQuestionBase):
    pass


class TestQuestionResponse(TestQuestionBase):
    id: int
    # Hide correct_answer for students in some views? 
    # For now we include it, but frontend should handle visibility or we create separate schema
    
    class Config:
        from_attributes = True


class TestBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject_id: Optional[int] = None
    classroom_id: Optional[int] = None
    total_marks: float = 0.0
    passing_marks: float = 0.0
    duration_minutes: int = 60
    is_active: bool = True
    status: TestStatusEnum = TestStatusEnum.draft


class TestCreate(TestBase):
    questions: List[TestQuestionCreate] = []


class TestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TestStatusEnum] = None
    results_published: Optional[bool] = None
    duration_minutes: Optional[int] = None
    passing_marks: Optional[float] = None
    total_marks: Optional[float] = None
    is_active: Optional[bool] = None


class TestResponse(TestBase):
    id: int
    results_published: bool
    created_at: Optional[datetime] = None
    questions: List[TestQuestionResponse] = []

    class Config:
        from_attributes = True
