from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.classroom import Classroom
from app.models.enrollment import Enrollment
from app.models.enums import TestStatusEnum
from app.models.submission import Submission
from app.models.subject import Subject
from app.models.test import Test, TestQuestion
from app.models.user import User
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.services.notification_service import notification_service

router = APIRouter()


@router.post("/", response_model=SubmissionResponse)
async def submit_test(
    *,
    db: AsyncSession = Depends(deps.get_db),
    submission_in: SubmissionCreate,
    background_tasks: BackgroundTasks = BackgroundTasks(),
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

    if not test.is_active or test.status != TestStatusEnum.published.value:
        raise HTTPException(status_code=403, detail="This test is not available")

    course_id = await resolve_test_course_id(db, test)
    if course_id:
        enrollment_result = await db.execute(
            select(Enrollment.id).where(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == course_id,
            )
        )
        if not enrollment_result.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="You are not enrolled for this test")
        
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
    await db.refresh(submission, attribute_names=["test"])

    total_possible_marks = sum(q.marks for q in test.questions)

    # Notify student of their grade
    background_tasks.add_task(
        notification_service.notify_grade_posted,
        user_id=current_user.id,
        test_title=test.title,
        score=round((obtained_marks / total_possible_marks) * 100, 2) if total_possible_marks > 0 else 0
    )

    return submission


@router.get("/me", response_model=List[SubmissionResponse])
async def read_my_submissions(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's submissions.
    """
    query = (
        select(Submission)
        .options(selectinload(Submission.test))
        .where(Submission.user_id == current_user.id)
        .order_by(desc(Submission.submitted_at))
    )
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


async def resolve_test_course_id(db: AsyncSession, test: Test) -> int | None:
    if test.subject_id:
        result = await db.execute(
            select(Subject.course_id).where(Subject.id == test.subject_id)
        )
        return result.scalar_one_or_none()

    if test.classroom_id:
        result = await db.execute(
            select(Classroom).where(Classroom.id == test.classroom_id)
        )
        classroom = result.scalar_one_or_none()
        if classroom and classroom.subject_id:
            subject_result = await db.execute(
                select(Subject.course_id).where(Subject.id == classroom.subject_id)
            )
            return subject_result.scalar_one_or_none()

    return None
