from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case
from datetime import datetime, timedelta
from app.models.classroom import Classroom
from app.models.attendance import Attendance
from app.models.enrollment import Enrollment
from app.models.subject import Subject
from app.models.course import Course
from app.models.test import Test
from app.models.submission import Submission
from app.models.enums import AttendanceStatusEnum

class ClassroomAnalyticsService:
    
    async def get_classroom_detailed_stats(
        self, 
        db: AsyncSession, 
        classroom_id: int
    ) -> Dict[str, Any]:
        """
        Detailed analytics for a specific classroom session.
        """
        # Get classroom info
        classroom_query = await db.execute(
            select(Classroom).where(Classroom.id == classroom_id)
        )
        classroom = classroom_query.scalars().first()
        
        if not classroom:
            return {"error": "Classroom not found"}
        
        # Total enrolled students (from course)
        subject_query = await db.execute(
            select(Subject).where(Subject.id == classroom.subject_id)
        )
        subject = subject_query.scalars().first()
        
        total_enrolled = 0
        if subject:
            enrolled_query = await db.execute(
                select(func.count()).select_from(Enrollment)
                .where(Enrollment.course_id == subject.course_id)
            )
            total_enrolled = enrolled_query.scalar() or 0
        
        # Attendance breakdown
        attendance_stats = await db.execute(
            select(
                Attendance.status,
                func.count(Attendance.id).label('count')
            )
            .where(Attendance.classroom_id == classroom_id)
            .group_by(Attendance.status)
        )
        
        attendance_breakdown = {
            "present": 0,
            "late": 0,
            "absent": 0,
            "excused": 0
        }
        
        for row in attendance_stats.all():
            status = row[0]
            count = row[1]
            if status in attendance_breakdown:
                attendance_breakdown[status] = count
        
        # Calculate not joined (enrolled but no attendance record)
        total_attended = sum(attendance_breakdown.values())
        not_joined = max(0, total_enrolled - total_attended)
        
        # Average session duration
        avg_duration = await db.execute(
            select(func.avg(Attendance.duration_minutes))
            .where(
                Attendance.classroom_id == classroom_id,
                Attendance.duration_minutes.isnot(None)
            )
        )
        
        # Peak attendance time (if we track join times)
        join_times_query = await db.execute(
            select(
                func.date_trunc('hour', Attendance.joined_at).label('hour'),
                func.count(Attendance.id).label('count')
            )
            .where(Attendance.classroom_id == classroom_id)
            .group_by(func.date_trunc('hour', Attendance.joined_at))
            .order_by(func.count(Attendance.id).desc())
            .limit(1)
        )
        peak_time = join_times_query.first()
        
        return {
            "classroom_id": classroom_id,
            "title": classroom.title,
            "status": classroom.status,
            "total_enrolled": total_enrolled,
            "total_attended": total_attended,
            "not_joined": not_joined,
            "attendance_breakdown": attendance_breakdown,
            "attendance_rate": round((total_attended / total_enrolled * 100) if total_enrolled > 0 else 0, 2),
            "average_duration_minutes": round(float(avg_duration.scalar() or 0), 2),
            "peak_join_time": peak_time[0].isoformat() if peak_time and peak_time[0] else None
        }
    
    async def get_course_classroom_analytics(
        self,
        db: AsyncSession,
        course_id: int
    ) -> Dict[str, Any]:

        subjects = (
            await db.execute(select(Subject.id).where(Subject.course_id == course_id))
        ).scalars().all()

        if not subjects:
            return {
                "course_id": course_id,
                "total_classes": 0,
                "completed_classes": 0,
                "live_classes": 0,
                "upcoming_classes": 0,
                "classroom_details": []
            }

        classrooms = (
            await db.execute(
                select(Classroom).where(Classroom.subject_id.in_(subjects))
            )
        ).scalars().all()

        classroom_ids = [c.id for c in classrooms]
        if not classroom_ids:
            return {
                "course_id": course_id,
                "total_classes": 0,
                "completed_classes": 0,
                "live_classes": 0,
                "upcoming_classes": 0,
                "classroom_details": []
            }

        attendance_data = (
            await db.execute(
                select(
                    Attendance.classroom_id,
                    func.count().label("total"),
                    func.sum(
                        case(
                            (Attendance.status == AttendanceStatusEnum.late.value, 1),
                            else_=0
                        )
                    ).label("late")
                )
                .where(Attendance.classroom_id.in_(classroom_ids))
                .group_by(Attendance.classroom_id)
            )
        ).all()

        attendance_map = {
            row.classroom_id: {"total": row.total, "late": row.late}
            for row in attendance_data
        }

        classroom_stats = []
        for c in classrooms:

            stats = attendance_map.get(c.id, {"total": 0, "late": 0})

            classroom_stats.append({
                "classroom_id": c.id,
                "title": c.title,
                "status": c.status,
                "start_time": c.start_time.isoformat() if c.start_time else None,
                "total_attendance": stats["total"],
                "late_count": stats["late"]
            })

        total_classes = len(classrooms)
        completed = sum(1 for c in classrooms if c.status == "completed")
        live = sum(1 for c in classrooms if c.status == "live")

        return {
            "course_id": course_id,
            "total_classes": total_classes,
            "completed_classes": completed,
            "live_classes": live,
            "upcoming_classes": total_classes - completed - live,
            "classroom_details": classroom_stats
        }


classroom_analytics_service = ClassroomAnalyticsService()
