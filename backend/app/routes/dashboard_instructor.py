from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User
from app.services.analytics_service import analytics_service
from app.services.classroom_analytics_service import classroom_analytics_service

router = APIRouter()


@router.get("/overview")
async def get_instructor_dashboard(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Get instructor's personal dashboard with course stats and recent activity.
    """
    dashboard_data = await analytics_service.get_instructor_dashboard(db, current_user.id)
    return dashboard_data


@router.get("/performance")
async def get_my_performance(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Get my performance metrics with AI insights.
    """
    performance_data = await analytics_service.get_instructor_performance(db, current_user.id)
    return performance_data


@router.get("/students")
async def get_my_students(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Get all students enrolled in my courses.
    """
    students = await analytics_service.get_instructor_students(db, current_user.id)
    return students


@router.get("/course/{course_id}/analytics")
async def get_my_course_analytics(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Get detailed analytics for my course including all classroom sessions.
    Returns data suitable for charts: bar charts, line graphs, donut charts.
    """
    from sqlalchemy import select
    from app.models.course import Course
    
    # Verify ownership
    course_query = await db.execute(select(Course).where(Course.id == course_id))
    course = course_query.scalars().first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    if course.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    analytics = await classroom_analytics_service.get_course_classroom_analytics(db, course_id)
    return analytics


@router.get("/classroom/{classroom_id}/detailed")
async def get_classroom_detailed_stats(
    classroom_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Get detailed stats for a specific classroom.
    Includes:
    - Attendance breakdown (present, late, absent, not joined)
    - Bar chart data for attendance status
    - Donut chart data for attendance distribution
    - Average session duration
    """
    from sqlalchemy import select
    from app.models.classroom import Classroom
    from app.models.subject import Subject
    from app.models.course import Course
    
    # Verify ownership
    classroom_query = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = classroom_query.scalars().first()
    
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    
    # Check if instructor owns the course
    if classroom.subject_id:
        subject_query = await db.execute(select(Subject).where(Subject.id == classroom.subject_id))
        subject = subject_query.scalars().first()
        if subject:
            course_query = await db.execute(select(Course).where(Course.id == subject.course_id))
            course = course_query.scalars().first()
            if not course or course.created_by != current_user.id:
                raise HTTPException(status_code=403, detail="Access denied")
    
    stats = await classroom_analytics_service.get_classroom_detailed_stats(db, classroom_id)
    
    # Format for charts
    stats["chart_data"] = {
        "attendance_bar_chart": {
            "labels": ["Present", "Late", "Absent", "Not Joined"],
            "values": [
                stats["attendance_breakdown"]["present"],
                stats["attendance_breakdown"]["late"],
                stats["attendance_breakdown"]["absent"],
                stats["not_joined"]
            ]
        },
        "attendance_donut_chart": {
            "labels": ["Attended", "Not Joined"],
            "values": [stats["total_attended"], stats["not_joined"]]
        }
    }
    
    return stats


@router.get("/course/{course_id}/overview")
async def get_course_overview(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    
    from sqlalchemy import select, func, case
    from datetime import datetime, timedelta
    
    from app.models.course import Course
    from app.models.subject import Subject
    from app.models.enrollment import Enrollment
    from app.models.classroom import Classroom
    from app.models.attendance import Attendance
    from app.models.test import Test
    from app.models.submission import Submission
    from app.models.feedback import CourseFeedback
    
    # Validate ownership
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    if course.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Basic course info
    course_info = {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "level": course.level,
        "category": course.category,
        "is_published": course.is_published,
        "created_at": course.created_at.isoformat() if course.created_at else None
    }

    # Enrollment: total
    total_enroll_result = await db.execute(
        select(func.count()).select_from(Enrollment)
        .where(Enrollment.course_id == course_id)
    )
    total_enrollments = total_enroll_result.scalar() or 0

    active_students_result = await db.execute(
        select(func.count(func.distinct(Attendance.user_id)))
        .select_from(Attendance)
        .join(Classroom, Attendance.classroom_id == Classroom.id)
        .join(Subject, Classroom.subject_id == Subject.id)
        .where(Subject.course_id == course_id)
    )
    active_students = active_students_result.scalar() or 0

    # Subjects + class count summary
    subjects_query = await db.execute(
        select(
            Subject.id,
            Subject.title,
            func.count(Classroom.id).label("total_classes")
        )
        .outerjoin(Classroom, Classroom.subject_id == Subject.id)
        .where(Subject.course_id == course_id)
        .group_by(Subject.id, Subject.title)
    )

    subjects = [
        {
            "subject_id": row.id,
            "title": row.title,
            "total_classes": row.total_classes,
        }
        for row in subjects_query
    ]

    total_classes_result = await db.execute(
        select(func.count())
        .select_from(Classroom)
        .join(Subject, Subject.id == Classroom.subject_id)
        .where(Subject.course_id == course_id)
    )
    total_classes = total_classes_result.scalar() or 0

    total_tests_result = await db.execute(
        select(func.count())
        .select_from(Test)
        .join(Subject, Test.subject_id == Subject.id)
        .where(Subject.course_id == course_id)
    )
    total_tests = total_tests_result.scalar() or 0

    avg_rating_result = await db.execute(
        select(func.avg(CourseFeedback.rating))
        .where(CourseFeedback.course_id == course_id)
    )
    avg_rating = avg_rating_result.scalar()
    avg_rating = round(float(avg_rating), 2) if avg_rating else 0

    total_feedback_result = await db.execute(
        select(func.count())
        .select_from(CourseFeedback)
        .where(CourseFeedback.course_id == course_id)
    )
    total_feedback = total_feedback_result.scalar() or 0

    week_ago = datetime.utcnow() - timedelta(days=7)

    recent_enroll_result = await db.execute(
        select(func.count())
        .select_from(Enrollment)
        .where(
            Enrollment.course_id == course_id,
            Enrollment.enrolled_at >= week_ago
        )
    )
    recent_enrollments = recent_enroll_result.scalar() or 0


    completed_result = await db.execute(
        select(func.count())
        .select_from(Enrollment)
        .where(
            Enrollment.course_id == course_id,
            Enrollment.progress_percent >= 100
        )
    )
    completed_students = completed_result.scalar() or 0

    completion_rate = (
        (completed_students / total_enrollments) * 100
        if total_enrollments > 0 else 0
    )
    completion_rate = round(completion_rate, 2)

    active_student_rate = (
        (active_students / total_enrollments) * 100
        if total_enrollments > 0 else 0
    )
    active_student_rate = round(active_student_rate, 2)

    return {
        "course": course_info,
        "statistics": {
            "total_enrollments": total_enrollments,
            "active_students": active_students,
            "total_subjects": len(subjects),
            "total_classes": total_classes,
            "total_tests": total_tests,
            "average_rating": avg_rating,
            "total_feedback": total_feedback,
            "recent_enrollments_7d": recent_enrollments,
            "completion_rate": completion_rate
        },
        "subjects": subjects,
        "engagement": {
            "active_student_rate": active_student_rate
        }
    }
