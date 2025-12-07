from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
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

router = APIRouter()


@router.post("/instructors", response_model=UserResponse)
async def create_instructor(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreateInstructor,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create a new instructor and send welcome email. Admin only.
    """
    try:
        user = await user_service.create_instructor(db, user_in)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/admins", response_model=UserResponse)
async def create_admin(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreateAdmin,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create a new admin and send welcome email. Admin only.
    """
    try:
        user = await user_service.create_admin(db, user_in)
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


@router.get("/settings", response_model=List[SystemSettingResponse])
async def read_settings(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get all system settings. Admin only.
    """
    result = await db.execute(select(SystemSetting))
    return result.scalars().all()


@router.get("/settings/public", response_model=List[SystemSettingResponse])
async def read_public_settings(
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get public system settings (e.g., site name, maintenance mode status).
    """
    result = await db.execute(select(SystemSetting).where(SystemSetting.is_public == True))
    return result.scalars().all()


@router.post("/settings", response_model=SystemSettingResponse)
async def create_setting(
    *,
    db: AsyncSession = Depends(deps.get_db),
    setting_in: SystemSettingCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create a new system setting. Admin only.
    """
    # Check if key exists
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == setting_in.key))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Setting with this key already exists")
        
    setting = SystemSetting(**setting_in.model_dump())
    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting


@router.put("/settings/{key}", response_model=SystemSettingResponse)
async def update_setting(
    *,
    db: AsyncSession = Depends(deps.get_db),
    key: str,
    setting_in: SystemSettingUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a system setting by key. Admin only.
    """
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalars().first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
        
    update_data = setting_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(setting, field, value)
        
    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting


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
