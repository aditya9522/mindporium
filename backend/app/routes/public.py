from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api import deps
from app.models.user import User
from app.models.course import Course
from app.models.enums import RoleEnum
from app.models.enrollment import Enrollment

router = APIRouter()

@router.get("/stats")
async def get_public_stats(
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    Get public statistics for landing page.
    """
    # Total students
    students_count = (
        await db.execute(
            select(func.count()).select_from(User).where(User.role == RoleEnum.student)
        )
    ).scalar() or 0

    # Total instructors
    instructors_count = (
        await db.execute(
            select(func.count()).select_from(User).where(User.role == RoleEnum.instructor)
        )
    ).scalar() or 0

    # Total published courses
    courses_count = (
        await db.execute(
            select(func.count()).select_from(Course).where(Course.is_published == True)
        )
    ).scalar() or 0

    # Success rate (Average progress of all enrollments)
    avg_progress = (
        await db.execute(
            select(func.avg(Enrollment.progress_percent)).select_from(Enrollment)
        )
    ).scalar() or 0
    
    # If no enrollments, default to 95% or similar as a base
    success_rate = round(avg_progress) if avg_progress > 0 else 95

    return {
        "students": students_count,
        "instructors": instructors_count,
        "courses": courses_count,
        "success_rate": success_rate
    }
