from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.subject import Subject
from app.models.course import Course
from app.models.user import User
from app.schemas.subject import SubjectCreate, SubjectResponse, SubjectUpdate
from app.models.enums import RoleEnum

router = APIRouter()


@router.post("/", response_model=SubjectResponse)
async def create_subject(
    *,
    db: AsyncSession = Depends(deps.get_db),
    subject_in: SubjectCreate,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Create a new subject in a course.
    """
    # Check course
    result = await db.execute(select(Course).where(Course.id == subject_in.course_id))
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    # Check permissions
    if current_user.role != RoleEnum.admin and course.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    subject = Subject(**subject_in.model_dump())
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject


@router.get("/instructor/my-subjects", response_model=List[SubjectResponse])
async def get_my_subjects(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Get all subjects from courses created by the current instructor.
    """
    query = (
        select(Subject)
        .join(Course, Subject.course_id == Course.id)
        .where(Course.created_by == current_user.id)
        .options(selectinload(Subject.course))
        .order_by(Course.title, Subject.order_index)
    )
    result = await db.execute(query)
    subjects = result.scalars().all()
    
    # Populate course_title manually since it's not a column
    for subject in subjects:
        if subject.course:
            subject.course_title = subject.course.title
            
    return subjects


@router.get("/course/{course_id}", response_model=List[SubjectResponse])
async def read_subjects(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get all subjects for a course.
    """
    query = select(Subject).where(Subject.course_id == course_id).order_by(Subject.order_index).options(selectinload(Subject.resources))
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    *,
    db: AsyncSession = Depends(deps.get_db),
    subject_id: int,
    subject_in: SubjectUpdate,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Update a subject.
    """
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    # Check course ownership
    result_course = await db.execute(select(Course).where(Course.id == subject.course_id))
    course = result_course.scalars().first()
    
    if current_user.role != RoleEnum.admin and course.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = subject_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subject, field, value)

    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject


@router.delete("/{subject_id}")
async def delete_subject(
    *,
    db: AsyncSession = Depends(deps.get_db),
    subject_id: int,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Delete a subject.
    """
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    # Check course ownership
    result_course = await db.execute(select(Course).where(Course.id == subject.course_id))
    course = result_course.scalars().first()
    
    if current_user.role != RoleEnum.admin and course.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    await db.delete(subject)
    await db.commit()
    return {"message": "Subject deleted"}
