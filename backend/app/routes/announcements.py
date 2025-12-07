from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.announcement import Announcement
from app.models.course import Course
from app.models.user import User
from app.models.enrollment import Enrollment
from app.schemas.announcement import AnnouncementCreate, AnnouncementResponse, AnnouncementUpdate
from app.models.enums import RoleEnum
from app.services.notification_service import notification_service

router = APIRouter()


@router.post("/", response_model=AnnouncementResponse)
async def create_announcement(
    *,
    db: AsyncSession = Depends(deps.get_db),
    announcement_in: AnnouncementCreate,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Create a new announcement. Instructor only.
    """
    # Verify course ownership if linked to course
    if announcement_in.course_id:
        result = await db.execute(select(Course).where(Course.id == announcement_in.course_id))
        course = result.scalars().first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        if current_user.role != RoleEnum.admin and course.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")

    announcement = Announcement(
        **announcement_in.model_dump(),
        created_by=current_user.id
    )
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    
    # Notify enrolled students if linked to a course
    if announcement.course_id:
        enrollments_result = await db.execute(
            select(Enrollment).where(Enrollment.course_id == announcement.course_id)
        )
        enrollments = enrollments_result.scalars().all()
        if enrollments:
            await notification_service.notify_new_announcement(
                user_ids=[e.user_id for e in enrollments],
                announcement_title=announcement.title
            )
    
    return announcement


@router.get("/all", response_model=List[AnnouncementResponse])
async def read_all_announcements(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get all announcements. Admin only.
    """
    query = select(Announcement).order_by(desc(Announcement.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/course/{course_id}", response_model=List[AnnouncementResponse])
async def read_course_announcements(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Get announcements for a course.
    """
    query = select(Announcement).options(selectinload(Announcement.creator)).where(
        Announcement.course_id == course_id,
        Announcement.is_active == True
    ).order_by(desc(Announcement.is_pinned), desc(Announcement.created_at))
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    *,
    db: AsyncSession = Depends(deps.get_db),
    announcement_id: int,
    announcement_in: AnnouncementUpdate,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Update an announcement.
    """
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    announcement = result.scalars().first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
        
    if current_user.role != RoleEnum.admin and announcement.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = announcement_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(announcement, field, value)

    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    return announcement


@router.delete("/{announcement_id}")
async def delete_announcement(
    *,
    db: AsyncSession = Depends(deps.get_db),
    announcement_id: int,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Delete an announcement.
    """
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    announcement = result.scalars().first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
        
    if current_user.role != RoleEnum.admin and announcement.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    await db.delete(announcement)
    await db.commit()
    return {"message": "Announcement deleted"}


@router.get("/my-announcements", response_model=List[AnnouncementResponse])
async def read_my_announcements(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Get announcements created by the current instructor.
    """
    query = select(Announcement).where(Announcement.created_by == current_user.id).order_by(desc(Announcement.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
