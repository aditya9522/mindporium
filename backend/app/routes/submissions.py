from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.submission import Submission
from app.models.test import Test, TestQuestion
from app.models.user import User
from app.schemas.submission import SubmissionCreate, SubmissionResponse

router = APIRouter()


@router.post("/", response_model=SubmissionResponse)
async def submit_test(
    *,
    db: AsyncSession = Depends(deps.get_db),
    submission_in: SubmissionCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Submit a test and auto-evaluate MCQ questions.
    """
    # 1. Get Test and Questions
    result = await db.execute(
        select(Test).options(selectinload(Test.questions)).where(Test.id == submission_in.test_id)
    )
    test = result.scalars().first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
        
    # 2. Check if already submitted
    result_sub = await db.execute(
        select(Submission).where(
            Submission.test_id == submission_in.test_id,
            Submission.user_id == current_user.id
        )
    )
    if result_sub.scalars().first():
        raise HTTPException(status_code=400, detail="Already submitted")
        
    # 3. Evaluate
    obtained_marks = 0.0
    evaluation = {}
    
    for question in test.questions:
        q_id_str = str(question.id)
        user_answer = submission_in.answers.get(q_id_str)
        
        is_correct = False
        if question.question_type == "mcq" and user_answer:
            if str(user_answer).lower().strip() == str(question.correct_answer).lower().strip():
                is_correct = True
                obtained_marks += question.marks
        
        evaluation[q_id_str] = {
            "is_correct": is_correct,
            "marks": question.marks if is_correct else 0
        }
        
    # 4. Save Submission
    submission = Submission(
        test_id=submission_in.test_id,
        user_id=current_user.id,
        answers=submission_in.answers,
        evaluation=evaluation,
        obtained_marks=obtained_marks
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return submission


@router.get("/me", response_model=List[SubmissionResponse])
async def read_my_submissions(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's submissions.
    """
    query = select(Submission).where(Submission.user_id == current_user.id).order_by(desc(Submission.submitted_at))
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/test/{test_id}", response_model=List[SubmissionResponse])
async def read_test_submissions(
    test_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Get all submissions for a specific test. Instructor only.
    """
    # Verify test ownership (optional, but good practice)
    # For now, just return all submissions for the test
    query = select(Submission).options(selectinload(Submission.user)).where(Submission.test_id == test_id).order_by(desc(Submission.submitted_at))
    result = await db.execute(query)
    return result.scalars().all()
