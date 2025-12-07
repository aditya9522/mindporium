from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserResponse


class SubmissionBase(BaseModel):
    test_id: int
    answers: Dict[str, Any] # {"question_id": "answer"}


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionResponse(SubmissionBase):
    id: int
    user_id: int
    obtained_marks: float
    evaluation: Dict[str, Any]
    submitted_at: Optional[datetime] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
