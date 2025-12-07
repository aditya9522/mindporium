from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User
from app.services.analytics_service import analytics_service
from app.services.classroom_analytics_service import classroom_analytics_service

router = APIRouter()


@router.get("/overview")
async def get_admin_dashboard(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get comprehensive admin dashboard with platform overview.
    """
    dashboard_data = await analytics_service.get_admin_dashboard(db)
    return dashboard_data


@router.get("/instructor/{instructor_id}/performance")
async def get_instructor_performance_stats(
    instructor_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get detailed instructor performance with AI-powered insights.
    Includes sentiment analysis of feedback.
    """
    performance_data = await analytics_service.get_instructor_performance(db, instructor_id)
    return performance_data


@router.get("/instructor/{instructor_id}/monitoring")
async def get_instructor_monitoring(
    instructor_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Real-time monitoring of instructor activities.
    """
    monitoring_data = await analytics_service.get_instructor_dashboard(db, instructor_id)
    return monitoring_data


@router.get("/course/{course_id}/analytics")
async def get_course_analytics(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Detailed analytics for a specific course including classroom stats.
    """
    course_analytics = await classroom_analytics_service.get_course_classroom_analytics(db, course_id)
    return course_analytics


@router.get("/course/{course_id}/tracking")
async def get_course_tracking(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:

    from sqlalchemy import select, func, case
    from datetime import datetime, timedelta
    from app.models.course import Course
    from app.models.enrollment import Enrollment
    from app.models.resource_completion import ResourceCompletion
    from app.models.attendance import Attendance
    from app.models.classroom import Classroom
    from app.models.subject import Subject

    course = (
        await db.execute(select(Course).where(Course.id == course_id))
    ).scalar()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Total enrollments
    total_enrolled = (
        await db.execute(
            select(func.count()).select_from(Enrollment)
            .where(Enrollment.course_id == course_id)
        )
    ).scalar() or 0

    # Active students in last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    active_students = (
        await db.execute(
            select(func.count(func.distinct(Attendance.user_id)))
            .select_from(Attendance)
            .join(Classroom, Attendance.classroom_id == Classroom.id)
            .join(Subject, Classroom.subject_id == Subject.id)
            .where(
                Subject.course_id == course_id,
                Attendance.joined_at >= week_ago
            )
        )
    ).scalar() or 0

    # Completion tracking
    completion_result = (
        await db.execute(
            select(
                func.count(func.distinct(Enrollment.user_id)).label("total"),
                func.sum(
                    case(
                        (Enrollment.progress_percent >= 100, 1),
                        else_=0
                    )
                ).label("completed")
            )
            .where(Enrollment.course_id == course_id)
        )
    ).first()

    completed_students = (
        completion_result.completed if completion_result and completion_result.completed else 0
    )

    # Last 24-hour resource completions
    day_ago = datetime.utcnow() - timedelta(days=1)
    recent_activity = (
        await db.execute(
            select(func.count())
            .select_from(ResourceCompletion)
            .join(Enrollment, ResourceCompletion.enrollment_id == Enrollment.id)
            .where(
                Enrollment.course_id == course_id,
                ResourceCompletion.completed_at >= day_ago
            )
        )
    ).scalar() or 0

    # Progress distribution grouping
    progress_rows = (
        await db.execute(
            select(
                case(
                    (Enrollment.progress_percent < 25, "0-25%"),
                    (Enrollment.progress_percent < 50, "25-50%"),
                    (Enrollment.progress_percent < 75, "50-75%"),
                    (Enrollment.progress_percent < 100, "75-100%"),
                    else_="Completed",
                ).label("range"),
                func.count().label("count"),
            )
            .where(Enrollment.course_id == course_id)
            .group_by("range")
        )
    ).all()

    progress_distribution = {
        row.range: row.count for row in progress_rows
    }

    completion_rate = round(
        (completed_students / total_enrolled * 100)
        if total_enrolled > 0
        else 0,
        2
    )

    engagement_rate = round(
        (active_students / total_enrolled * 100)
        if total_enrolled > 0
        else 0,
        2
    )

    return {
        "course_id": course_id,
        "course_title": course.title or "",
        "total_enrolled": total_enrolled,
        "active_students_7d": active_students,
        "completed_students": completed_students,
        "completion_rate": completion_rate,
        "recent_activity_24h": recent_activity,
        "progress_distribution": progress_distribution or {},
        "engagement_rate": engagement_rate
    }


@router.get("/course/{course_id}/overview")
async def get_course_overview(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get comprehensive course overview for admin.
    """
    from sqlalchemy import select, func
    from app.models.course import Course
    from app.models.subject import Subject
    from app.models.enrollment import Enrollment
    from app.models.classroom import Classroom
    from app.models.attendance import Attendance
    from app.models.test import Test
    from app.models.feedback import CourseFeedback
    
    # Get course
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Basic course info
    course_info = {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "level": course.level,
        "category": course.category,
        "is_published": course.is_published,
        "price": course.price,
        "created_at": course.created_at.isoformat() if course.created_at else None
    }
    
    # Total enrollments
    total_enrollments = (
        await db.execute(
            select(func.count()).select_from(Enrollment)
            .where(Enrollment.course_id == course_id)
        )
    ).scalar() or 0
    
    # Active students
    active_students = (
        await db.execute(
            select(func.count(func.distinct(Attendance.user_id)))
            .select_from(Attendance)
            .join(Classroom, Attendance.classroom_id == Classroom.id)
            .join(Subject, Classroom.subject_id == Subject.id)
            .where(Subject.course_id == course_id)
        )
    ).scalar() or 0
    
    # Subjects with class count
    subjects_query = await db.execute(
        select(
            Subject.id,
            Subject.title,
            Subject.description,
            func.count(Classroom.id).label("total_classes")
        )
        .outerjoin(Classroom, Classroom.subject_id == Subject.id)
        .where(Subject.course_id == course_id)
        .group_by(Subject.id, Subject.title, Subject.description)
    )
    
    subjects = [
        {
            "subject_id": row.id,
            "title": row.title,
            "description": row.description,
            "total_classes": row.total_classes or 0
        }
        for row in subjects_query.all()
    ]
    
    # Total classes
    total_classes = sum(s["total_classes"] for s in subjects)
    
    # Total tests
    total_tests = (
        await db.execute(
            select(func.count()).select_from(Test)
            .join(Subject, Test.subject_id == Subject.id)
            .where(Subject.course_id == course_id)
        )
    ).scalar() or 0
    
    # Average rating and feedback count
    feedback_stats = (
        await db.execute(
            select(
                func.avg(CourseFeedback.rating).label("avg_rating"),
                func.count().label("total_feedback")
            )
            .where(CourseFeedback.course_id == course_id)
        )
    ).first()
    
    average_rating = round(feedback_stats.avg_rating, 2) if feedback_stats and feedback_stats.avg_rating else 0
    total_feedback = feedback_stats.total_feedback if feedback_stats else 0
    
    # Completion rate
    completed_count = (
        await db.execute(
            select(func.count())
            .select_from(Enrollment)
            .where(
                Enrollment.course_id == course_id,
                Enrollment.progress_percent >= 100
            )
        )
    ).scalar() or 0
    
    completion_rate = round((completed_count / total_enrollments * 100) if total_enrollments > 0 else 0, 2)
    
    return {
        "course": course_info,
        "statistics": {
            "total_enrollments": total_enrollments,
            "active_students": active_students,
            "total_subjects": len(subjects),
            "total_classes": total_classes,
            "total_tests": total_tests,
            "average_rating": average_rating,
            "total_feedback": total_feedback,
            "completion_rate": completion_rate
        },
        "subjects": subjects,
        "engagement": {
            "active_student_rate": round((active_students / total_enrollments * 100) if total_enrollments > 0 else 0, 2)
        }
    }
