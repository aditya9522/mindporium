from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, case
from datetime import datetime, timedelta
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.classroom import Classroom
from app.models.attendance import Attendance
from app.models.submission import Submission
from app.models.test import Test
from app.models.feedback import InstructorFeedback, CourseFeedback
from app.models.subject import Subject
from app.models.enums import AttendanceStatusEnum, ClassroomStatusEnum
from app.services.llm_service import llm_service
import logging

logger = logging.getLogger("app.services.analytics")

class AnalyticsService:
    
    async def get_admin_dashboard(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Comprehensive admin dashboard with platform overview.
        """
        # Total counts
        total_users = await db.execute(select(func.count()).select_from(User))
        total_courses = await db.execute(select(func.count()).select_from(Course))
        total_classrooms = await db.execute(select(func.count()).select_from(Classroom))
        total_enrollments = await db.execute(select(func.count()).select_from(Enrollment))
        
        # Active stats
        active_students = await db.execute(
            select(func.count()).select_from(User).where(
                User.role == "student", User.is_active == True
            )
        )
        active_instructors = await db.execute(
            select(func.count()).select_from(User).where(
                User.role == "instructor", User.is_active == True
            )
        )
        
        # Live classes
        live_classes = await db.execute(
            select(func.count()).select_from(Classroom).where(
                Classroom.status == ClassroomStatusEnum.live.value
            )
        )
        
        # Recent enrollments (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_enrollments = await db.execute(
            select(func.count()).select_from(Enrollment).where(
                Enrollment.enrolled_at >= week_ago
            )
        )
        
        # Top courses by enrollment
        top_courses_query = await db.execute(
            select(
                Course.id,
                Course.title,
                func.count(Enrollment.id).label('enrollment_count')
            )
            .join(Enrollment, Course.id == Enrollment.course_id)
            .group_by(Course.id, Course.title)
            .order_by(func.count(Enrollment.id).desc())
            .limit(5)
        )
        top_courses = [
            {"course_id": row[0], "title": row[1], "enrollments": row[2]}
            for row in top_courses_query.all()
        ]
        
        # Revenue (if paid courses)
        revenue_query = await db.execute(
            select(func.sum(Course.price))
            .select_from(Enrollment)
            .join(Course, Enrollment.course_id == Course.id)
        )
        total_revenue = revenue_query.scalar() or 0
        
        return {
            "overview": {
                "total_users": total_users.scalar() or 0,
                "total_courses": total_courses.scalar() or 0,
                "total_classrooms": total_classrooms.scalar() or 0,
                "total_enrollments": total_enrollments.scalar() or 0,
                "active_students": active_students.scalar() or 0,
                "active_instructors": active_instructors.scalar() or 0,
                "live_classes": live_classes.scalar() or 0,
                "total_revenue": float(total_revenue)
            },
            "recent_activity": {
                "enrollments_last_7_days": recent_enrollments.scalar() or 0
            },
            "top_courses": top_courses
        }
    
    async def get_instructor_performance(self, db: AsyncSession, instructor_id: int) -> Dict[str, Any]:
        """
        Detailed instructor performance analytics with AI insights.
        """
        # Get instructor courses
        courses_query = await db.execute(
            select(Course).where(
                or_(
                    Course.created_by == instructor_id,
                    Course.instructors.any(User.id == instructor_id)
                )
            )
        )
        courses = courses_query.scalars().all()
        course_ids = [c.id for c in courses]
        
        if not course_ids:
            return {"error": "No courses found for this instructor"}
        
        # Total students across all courses
        total_students = await db.execute(
            select(func.count(func.distinct(Enrollment.user_id)))
            .select_from(Enrollment)
            .where(Enrollment.course_id.in_(course_ids))
        )
        
        # Total classes conducted
        total_classes = await db.execute(
            select(func.count()).select_from(Classroom)
            .join(Subject, Classroom.subject_id == Subject.id)
            .where(Subject.course_id.in_(course_ids))
        )
        
        # Average rating from feedback
        avg_rating = await db.execute(
            select(func.avg(InstructorFeedback.rating))
            .where(InstructorFeedback.instructor_id == instructor_id)
        )
        
        # Get all feedback for AI analysis
        feedback_query = await db.execute(
            select(InstructorFeedback.comments)
            .where(
                InstructorFeedback.instructor_id == instructor_id,
                InstructorFeedback.comments.isnot(None)
            )
            .limit(50)
        )
        feedback_comments = [row[0] for row in feedback_query.all() if row[0]]
        
        # AI-powered sentiment analysis
        sentiment_analysis = None
        if feedback_comments:
            combined_feedback = "\n".join(feedback_comments[:20])  # Limit for API
            prompt = f"""Analyze the following instructor feedback and provide:
            1. Overall sentiment (Positive/Neutral/Negative)
            2. Key strengths (3 points)
            3. Areas for improvement (3 points)
            4. Summary in 2-3 sentences

            Feedback:
            {combined_feedback}

            Provide the analysis in a structured format with proper headings and in short and concise manner."""
            
            sentiment_analysis = await llm_service.generate_response(prompt)
        
        # Course-wise enrollment
        course_stats = []
        for course in courses:
            enrollment_count = await db.execute(
                select(func.count()).select_from(Enrollment)
                .where(Enrollment.course_id == course.id)
            )
            course_stats.append({
                "course_id": course.id,
                "title": course.title,
                "enrollments": enrollment_count.scalar() or 0
            })
        
        return {
            "instructor_id": instructor_id,
            "total_courses": len(courses),
            "total_students": total_students.scalar() or 0,
            "total_classes": total_classes.scalar() or 0,
            "average_rating": round(float(avg_rating.scalar() or 0), 2),
            "course_stats": course_stats,
            "ai_insights": {
                "sentiment_analysis": sentiment_analysis,
                "total_feedback_analyzed": len(feedback_comments)
            }
        }
    
    async def get_instructor_dashboard(self, db: AsyncSession, instructor_id: int) -> Dict[str, Any]:
        """
        Comprehensive instructor dashboard with detailed analytics.
        """
        # Get instructor's courses
        courses_query = await db.execute(
            select(Course).where(
                or_(
                    Course.created_by == instructor_id,
                    Course.instructors.any(User.id == instructor_id)
                )
            )
        )
        courses = courses_query.scalars().all()
        course_ids = [c.id for c in courses]
        
        if not course_ids:
            return {
                "total_courses": 0,
                "total_students": 0,
                "total_revenue": 0.0,
                "active_courses": 0,
                "recent_enrollments": [],
                "upcoming_classes": [],
                "course_stats": []
            }
        
        # Total students across all courses
        total_students = await db.execute(
            select(func.count(func.distinct(Enrollment.user_id)))
            .select_from(Enrollment)
            .where(Enrollment.course_id.in_(course_ids))
        )
        
        # Total revenue
        revenue_query = await db.execute(
            select(func.sum(Course.price))
            .select_from(Enrollment)
            .join(Course, Enrollment.course_id == Course.id)
            .where(Course.id.in_(course_ids))
        )
        total_revenue = revenue_query.scalar() or 0
        
        # Active courses (published)
        active_courses = sum(1 for c in courses if c.is_published)
        
        # Recent enrollments (last 10)
        recent_enrollments_query = await db.execute(
            select(
                Enrollment.id,
                Enrollment.enrolled_at,
                User.full_name.label('user_name'),
                Course.title.label('course_title'),
                Enrollment.course_id
            )
            .join(User, Enrollment.user_id == User.id)
            .join(Course, Enrollment.course_id == Course.id)
            .where(Enrollment.course_id.in_(course_ids))
            .order_by(Enrollment.enrolled_at.desc())
            .limit(10)
        )
        
        recent_enrollments = [
            {
                "id": row[0],
                "enrolled_at": row[1].isoformat() if row[1] else None,
                "user_name": row[2],
                "course_title": row[3],
                "course_id": row[4]
            }
            for row in recent_enrollments_query.all()
        ]
        
        # Upcoming classes
        upcoming_classes_query = await db.execute(
            select(
                Classroom.id,
                Classroom.title,
                Classroom.start_time,
                Classroom.class_type,
                Subject.title.label('subject_title')
            )
            .join(Subject, Classroom.subject_id == Subject.id)
            .where(
                Subject.course_id.in_(course_ids),
                Classroom.start_time >= datetime.utcnow()
            )
            .order_by(Classroom.start_time.asc())
            .limit(10)
        )
        
        upcoming_classes = [
            {
                "id": row[0],
                "title": row[1],
                "start_time": row[2].isoformat() if row[2] else None,
                "class_type": row[3],
                "subject_title": row[4]
            }
            for row in upcoming_classes_query.all()
        ]
        
        # Course stats
        course_stats = []
        for course in courses:
            enrollment_count = await db.execute(
                select(func.count()).select_from(Enrollment)
                .where(Enrollment.course_id == course.id)
            )
            
            active_students = await db.execute(
                select(func.count(func.distinct(Attendance.user_id)))
                .select_from(Attendance)
                .join(Classroom, Attendance.classroom_id == Classroom.id)
                .join(Subject, Classroom.subject_id == Subject.id)
                .where(Subject.course_id == course.id)
            )
            
            completed = await db.execute(
                select(func.count()).select_from(Enrollment)
                .where(
                    Enrollment.course_id == course.id,
                    Enrollment.progress_percent >= 100
                )
            )
            
            total_enroll = enrollment_count.scalar() or 0
            completion_rate = (completed.scalar() or 0) / total_enroll * 100 if total_enroll > 0 else 0
            
            course_stats.append({
                "course_id": course.id,
                "course_title": course.title,
                "total_enrollments": total_enroll,
                "active_students": active_students.scalar() or 0,
                "completion_rate": round(completion_rate, 1)
            })
        
        return {
            "total_courses": len(courses),
            "total_students": total_students.scalar() or 0,
            "total_revenue": float(total_revenue),
            "active_courses": active_courses,
            "recent_enrollments": recent_enrollments,
            "upcoming_classes": upcoming_classes,
            "course_stats": course_stats
        }

    async def get_instructor_students(self, db: AsyncSession, instructor_id: int) -> List[Dict[str, Any]]:
        """
        Get all students enrolled in instructor's courses with progress.
        """
        # Get instructor's courses
        courses_query = await db.execute(
            select(Course).where(
                or_(
                    Course.created_by == instructor_id,
                    Course.instructors.any(User.id == instructor_id)
                )
            )
        )
        courses = courses_query.scalars().all()
        course_ids = [c.id for c in courses]
        
        if not course_ids:
            return []
            
        # Get students and their enrollments
        students_query = await db.execute(
            select(
                User.id,
                User.full_name,
                User.email,
                Enrollment.course_id,
                Course.title,
                Enrollment.progress_percent,
                Enrollment.enrolled_at,
                Enrollment.last_accessed_at
            )
            .join(Enrollment, User.id == Enrollment.user_id)
            .join(Course, Enrollment.course_id == Course.id)
            .where(Enrollment.course_id.in_(course_ids))
            .order_by(User.full_name)
        )
        
        results = students_query.all()
        
        # Group by student
        students_map = {}
        for row in results:
            user_id = row[0]
            if user_id not in students_map:
                students_map[user_id] = {
                    "user_id": user_id,
                    "full_name": row[1],
                    "email": row[2],
                    "enrolled_courses": 0,
                    "total_progress": 0,
                    "last_active": None,
                    "courses": []
                }
            
            student = students_map[user_id]
            student["enrolled_courses"] += 1
            student["courses"].append({
                "course_id": row[3],
                "course_title": row[4],
                "progress_percent": row[5],
                "enrolled_at": row[6].isoformat() if row[6] else None
            })
            
            # Update last active if more recent
            if row[7]:
                current_last = datetime.fromisoformat(student["last_active"]) if student["last_active"] else None
                if not current_last or row[7] > current_last:
                    student["last_active"] = row[7].isoformat()
        
        # Calculate average progress
        final_students = []
        for student in students_map.values():
            total_prog = sum(c["progress_percent"] for c in student["courses"])
            student["total_progress"] = total_prog / student["enrolled_courses"] if student["enrolled_courses"] > 0 else 0
            final_students.append(student)
            
        return final_students

analytics_service = AnalyticsService()
