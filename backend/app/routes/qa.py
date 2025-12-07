from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.qa import QAQuestion, QAAnswer
from app.models.subject import Subject
from app.models.user import User
from app.schemas.qa import QuestionCreate, QuestionResponse, AnswerCreate, AnswerResponse
from app.models.enums import RoleEnum

router = APIRouter()


@router.post("/questions", response_model=QuestionResponse)
async def ask_question(
    *,
    db: AsyncSession = Depends(deps.get_db),
    question_in: QuestionCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Ask a question in a subject.
    """
    # Check subject
    result = await db.execute(select(Subject).where(Subject.id == question_in.subject_id))
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    question = QAQuestion(
        **question_in.model_dump(),
        user_id=current_user.id
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)

    # Eager load relationships for response
    query = select(QAQuestion).options(
        selectinload(QAQuestion.user),
        selectinload(QAQuestion.answers)
    ).where(QAQuestion.id == question.id)
    result = await db.execute(query)
    question = result.scalars().first()

    return question


@router.get("/questions/subject/{subject_id}", response_model=List[QuestionResponse])
async def read_questions(
    subject_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Get questions for a subject.
    """
    query = select(QAQuestion).options(
        selectinload(QAQuestion.user),
        selectinload(QAQuestion.answers).selectinload(QAAnswer.user)
    ).where(QAQuestion.subject_id == subject_id).order_by(desc(QAQuestion.created_at))
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/questions/course/{course_id}", response_model=List[QuestionResponse])
async def read_questions_by_course(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Get questions for a course (across all subjects).
    """
    query = (
        select(QAQuestion)
        .join(Subject, QAQuestion.subject_id == Subject.id)
        .options(
            selectinload(QAQuestion.user),
            selectinload(QAQuestion.answers).selectinload(QAAnswer.user)
        )
        .where(Subject.course_id == course_id)
        .order_by(desc(QAQuestion.created_at))
        .offset(skip).limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/answers", response_model=AnswerResponse)
async def answer_question(
    *,
    db: AsyncSession = Depends(deps.get_db),
    answer_in: AnswerCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Answer a question.
    """
    # Check question
    result = await db.execute(select(QAQuestion).where(QAQuestion.id == answer_in.question_id))
    question = result.scalars().first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    is_instructor = current_user.role in [RoleEnum.instructor, RoleEnum.admin]
    
    answer = QAAnswer(
        **answer_in.model_dump(),
        user_id=current_user.id,
        is_instructor_answer=is_instructor
    )
    db.add(answer)
    await db.commit()
    await db.refresh(answer)

    # Eager load relationships for response
    query = select(QAAnswer).options(
        selectinload(QAAnswer.user)
    ).where(QAAnswer.id == answer.id)
    result = await db.execute(query)
    answer = result.scalars().first()

    return answer
