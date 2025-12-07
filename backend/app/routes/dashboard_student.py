from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User
from app.services.student_analytics_service import student_analytics_service

router = APIRouter()


@router.get("/overview")
async def get_student_dashboard(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get student's personal dashboard with learning overview.
    Includes:
    - Total courses enrolled
    - Classes attended
    - Tests completed
    - Average scores
    - Recent activity
    """
    dashboard_data = await student_analytics_service.get_student_dashboard(db, current_user.id)
    return dashboard_data


@router.get("/course/{course_id}/progress")
async def get_my_course_progress(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get detailed progress for a specific course with visualization data.
    
    Returns chart-ready data for:
    - Bar charts: Subject-wise attendance and test completion
    - Line charts: Test performance over time
    - Donut charts: Overall progress
    - AI-powered learning insights and recommendations
    """
    progress_data = await student_analytics_service.get_course_progress_detailed(
        db, current_user.id, course_id
    )
    return progress_data
