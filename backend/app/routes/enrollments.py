from typing import Any, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.user import User
from app.schemas.enrollment import EnrollmentCreate, EnrollmentResponse
from app.schemas.enrollment import EnrollmentCreate, EnrollmentResponse
from app.services.progress_service import progress_service
from app.models.resource import Resource
from app.models.resource_completion import ResourceCompletion
from app.models.subject import Subject

router = APIRouter()


@router.post("/", response_model=EnrollmentResponse)
async def enroll_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    enrollment_in: EnrollmentCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Enroll current user in a course.
    """
    # 1. Check if course exists
    result = await db.execute(select(Course).where(Course.id == enrollment_in.course_id))
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # 2. Check if already enrolled
    result = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == enrollment_in.course_id
        )
    )
    existing_enrollment = result.scalars().first()
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    # 3. Create enrollment
    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=enrollment_in.course_id,
        enrolled_at=datetime.utcnow()
    )
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    
    # Reload to get course relationship if needed, or just return basic
    # For now, we return basic, but schema expects course. 
    # Let's eager load course to satisfy schema
    result = await db.execute(
        select(Enrollment)
        .options(selectinload(Enrollment.course))
        .where(Enrollment.id == enrollment.id)
    )
    enrollment = result.scalars().first()
    
    return enrollment


@router.get("/me", response_model=List[EnrollmentResponse])
async def read_my_enrollments(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's enrollments.
    """
    result = await db.execute(
        select(Enrollment)
        .options(selectinload(Enrollment.course))
        .where(Enrollment.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/progress/{course_id}")
async def get_course_progress(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get detailed progress for a course.
    """
    progress = await progress_service.calculate_course_progress(db, current_user.id, course_id)
    return progress


@router.get("/course/{course_id}", response_model=List[EnrollmentResponse])
async def get_course_enrollments(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all enrollments for a specific course (admin/instructor only).
    """
    # Check if user is admin or instructor
    if current_user.role not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get all enrollments for the course with user data
    result = await db.execute(
        select(Enrollment)
        .options(
            selectinload(Enrollment.course),
            selectinload(Enrollment.user)
        )
        .where(Enrollment.course_id == course_id)
        .order_by(Enrollment.enrolled_at.desc())
    )
    return result.scalars().all()


@router.post("/resource/{resource_id}/complete")
async def complete_resource(
    resource_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark a resource as complete.
    """
    # Check if resource exists
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalars().first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    # Check if already completed
    result = await db.execute(
        select(ResourceCompletion).where(
            ResourceCompletion.user_id == current_user.id,
            ResourceCompletion.resource_id == resource_id
        )
    )
    existing = result.scalars().first()
    if existing:
        return {"message": "Already completed"}

    # Create completion
    completion = ResourceCompletion(
        user_id=current_user.id,
        resource_id=resource_id
    )
    db.add(completion)
    await db.commit()
    
    # Update course progress
    result = await db.execute(select(Subject).where(Subject.id == resource.subject_id))
    subject = result.scalars().first()
    
    if subject:
        await progress_service.calculate_course_progress(db, current_user.id, subject.course_id)

    return {"message": "Resource marked as complete"}


@router.delete("/{enrollment_id}")
async def delete_enrollment(
    enrollment_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Unenroll from a course.
    """
    result = await db.execute(select(Enrollment).where(Enrollment.id == enrollment_id))
    enrollment = result.scalars().first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
        
    # Check permissions: User can only delete their own enrollment unless admin
    if enrollment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    await db.delete(enrollment)
    await db.commit()
    return {"message": "Unenrolled successfully"}
