from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api import deps
from app.models.system_setting import SystemSetting
from app.models.user import User
from app.models.course import Course
from app.models.classroom import Classroom
from app.models.community import Community
from app.schemas.system_setting import (
    SystemSettingCreate,
    SystemSettingResponse,
    SystemSettingUpdate,
    SystemStats
)
from app.schemas.user import UserCreateInstructor, UserResponse, UserCreateAdmin
from app.services.user_service import user_service
from app.services.email import email_service
from app.services.notification_service import notification_service
from app.models.enums import RoleEnum

router = APIRouter()


@router.post("/instructors", response_model=UserResponse)
async def create_instructor(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreateInstructor,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create a new instructor and send welcome email. Admin only.
    """
    try:
        user = await user_service.create_instructor(db, user_in)
        setup_token = user_service.create_setup_token(user)
        background_tasks.add_task(
            email_service.send_welcome_instructor_email,
            email_to=user.email,
            full_name=user.full_name,
            token=setup_token
        )
        
        # Notify all students about the new instructor
        students_result = await db.execute(select(User).where(User.role == RoleEnum.student))
        students = students_result.scalars().all()
        if students:
            background_tasks.add_task(
                notification_service.notify_instructor_joined,
                user_ids=[s.id for s in students],
                instructor_name=user.full_name
            )
            
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/admins", response_model=UserResponse)
async def create_admin(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreateAdmin,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create a new admin and send welcome email. Admin only.
    """
    try:
        user = await user_service.create_admin(db, user_in)
        setup_token = user_service.create_setup_token(user)
        background_tasks.add_task(
            email_service.send_welcome_admin_email,
            email_to=user.email,
            full_name=user.full_name,
            token=setup_token
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/instructors", response_model=List[UserResponse])
async def read_instructors(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get all instructors. Admin only.
    """
    result = await db.execute(
        select(User)
        .where(User.role == "instructor")
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/stats", response_model=SystemStats)
async def read_system_stats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get system statistics. Admin only.
    """
    # Helper to get count
    async def get_count(model, condition=None):
        query = select(func.count()).select_from(model)
        if condition is not None:
            query = query.where(condition)
        result = await db.execute(query)
        return result.scalar()

    total_users = await get_count(User)
    total_courses = await get_count(Course)
    total_classrooms = await get_count(Classroom)
    active_classrooms = await get_count(Classroom, Classroom.is_active == True)
    total_communities = await get_count(Community)
    
    return {
        "total_users": total_users or 0,
        "total_courses": total_courses or 0,
        "total_classrooms": total_classrooms or 0,
        "active_classrooms": active_classrooms or 0,
        "total_communities": total_communities or 0,
    }
