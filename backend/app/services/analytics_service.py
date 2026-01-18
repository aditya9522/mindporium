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

        total_users = await db.execute(select(func.count()).select_from(User))
        total_courses = await db.execute(select(func.count()).select_from(Course))
        total_classrooms = await db.execute(select(func.count()).select_from(Classroom))
        total_enrollments = await db.execute(select(func.count()).select_from(Enrollment))
        

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
        

        live_classes = await db.execute(
            select(func.count()).select_from(Classroom).where(
                Classroom.status == ClassroomStatusEnum.live.value
            )
        )
        
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_enrollments = await db.execute(
            select(func.count()).select_from(Enrollment).where(
                Enrollment.enrolled_at >= week_ago
            )
        )
        

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
        
        total_students = await db.execute(
            select(func.count(func.distinct(Enrollment.user_id)))
            .select_from(Enrollment)
            .where(Enrollment.course_id.in_(course_ids))
        )
        
        total_classes = await db.execute(
            select(func.count()).select_from(Classroom)
            .join(Subject, Classroom.subject_id == Subject.id)
            .where(Subject.course_id.in_(course_ids))
        )
        
        avg_rating = await db.execute(
            select(func.avg(InstructorFeedback.rating))
            .where(InstructorFeedback.instructor_id == instructor_id)
        )
        
        feedback_query = await db.execute(
            select(InstructorFeedback.comments)
            .where(
                InstructorFeedback.instructor_id == instructor_id,
                InstructorFeedback.comments.isnot(None)
            )
            .limit(50)
        )
        feedback_comments = [row[0] for row in feedback_query.all() if row[0]]
        
        sentiment_analysis = None
        if feedback_comments:
            combined_feedback = "\n".join(feedback_comments[:20])  # Limit for API
            prompt = f"""Analyze the following instructor feedback and provide:
            1. Overall sentiment (Positive/Neutral/Negative)
            2. Key strengths (3 points) single line each
            3. Areas for improvement (3 points) single line each
            4. Summary in 1 sentence

            Feedback:
            {combined_feedback}

            Provide the analysis in a structured format with proper headings and in short and concise manner."""
            
            sentiment_analysis = await llm_service.generate_response(prompt)
        
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
        
        total_students = await db.execute(
            select(func.count(func.distinct(Enrollment.user_id)))
            .select_from(Enrollment)
            .where(Enrollment.course_id.in_(course_ids))
        )
        
        revenue_query = await db.execute(
            select(func.sum(Course.price))
            .select_from(Enrollment)
            .join(Course, Enrollment.course_id == Course.id)
            .where(Course.id.in_(course_ids))
        )
        total_revenue = revenue_query.scalar() or 0
        
        active_courses = sum(1 for c in courses if c.is_published)
        
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
        
        upcoming_classes_query = await db.execute(
            select(
                Classroom.id,
                Classroom.title,
                Classroom.start_time,
                Classroom.class_type,
                Classroom.status,
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
                "status": row[4],
                "subject_title": row[5]
            }
            for row in upcoming_classes_query.all()
        ]
        
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

        # Get attendance counts for these students across these courses
        attendance_query = await db.execute(
            select(
                Attendance.user_id,
                func.count(Attendance.id).label('attended_count')
            )
            .join(Classroom, Attendance.classroom_id == Classroom.id)
            .join(Subject, Classroom.subject_id == Subject.id)
            .where(
                and_(
                    Subject.course_id.in_(course_ids),
                    Attendance.status == AttendanceStatusEnum.present.value
                )
            )
            .group_by(Attendance.user_id)
        )
        attendance_map = {row.user_id: row.attended_count for row in attendance_query.all()}

        # Get total classes count per course
        classes_query = await db.execute(
            select(
                Subject.course_id,
                func.count(Classroom.id).label('class_count')
            )
            .join(Classroom, Subject.id == Classroom.subject_id)
            .where(Subject.course_id.in_(course_ids))
            .group_by(Subject.course_id)
        )
        course_classes_map = {row.course_id: row.class_count for row in classes_query.all()}
        
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
        
        # Calculate average progress and attendance
        final_students = []
        for student in students_map.values():
            total_prog = sum(c["progress_percent"] for c in student["courses"])
            student["total_progress"] = total_prog / student["enrolled_courses"] if student["enrolled_courses"] > 0 else 0
            
            # Attendance
            total_attended = attendance_map.get(student["user_id"], 0)
            total_possible = sum(course_classes_map.get(c["course_id"], 0) for c in student["courses"])
            student["attendance_percent"] = (total_attended / total_possible * 100) if total_possible > 0 else 0
            
            final_students.append(student)
            
        return final_students

    async def get_student_profile_for_instructor(self, db: AsyncSession, instructor_id: int, student_id: int) -> Dict[str, Any]:
        """
        Get detailed student profile specifically for an instructor.
        Only returns data related to courses this instructor teaches.
        """
        # 1. Get instructor's course IDs
        courses_query = await db.execute(
            select(Course.id).where(
                or_(
                    Course.created_by == instructor_id,
                    Course.instructors.any(User.id == instructor_id)
                )
            )
        )
        instructor_course_ids = courses_query.scalars().all()
        
        if not instructor_course_ids:
            return None

        # 2. Verify student exists
        student_query = await db.execute(select(User).where(User.id == student_id))
        student = student_query.scalars().first()
        
        if not student:
            return None

        # 3. Get enrollments for this student in these courses
        enrollments_query = await db.execute(
            select(Enrollment, Course.title)
            .join(Course, Enrollment.course_id == Course.id)
            .where(
                Enrollment.user_id == student_id,
                Enrollment.course_id.in_(instructor_course_ids)
            )
        )
        enrollments_data = enrollments_query.all()
        
        if not enrollments_data:
            return None

        # Process courses list
        courses_list = []
        total_progress = 0
        
        for enroll, course_title in enrollments_data:
            courses_list.append({
                "course_id": enroll.course_id,
                "course_title": course_title,
                "progress_percent": enroll.progress_percent,
                "enrolled_at": enroll.enrolled_at.isoformat() if enroll.enrolled_at else None,
                "last_accessed": enroll.last_accessed_at.isoformat() if enroll.last_accessed_at else None
            })
            total_progress += enroll.progress_percent
            
        avg_progress = total_progress / len(courses_list) if courses_list else 0

        # 4. Recent Activity & Track Data (Last 7 Days)
        recent_activity = []
        from datetime import timezone
        now = datetime.now(timezone.utc)
        seven_days_ago = now - timedelta(days=7)
        
        # Track data map: Date string -> Activity Score
        # Activity Score: +10 for class attendance, +15 for submission
        track_map = {(now - timedelta(days=i)).strftime("%a"): 0 for i in range(7)}
        
        # 4a. Attendance Activity
        attendance_query = await db.execute(
            select(Attendance, Classroom.title)
            .join(Classroom, Attendance.classroom_id == Classroom.id)
            .join(Subject, Classroom.subject_id == Subject.id)
            .where(
                Attendance.user_id == student_id,
                Subject.course_id.in_(instructor_course_ids)
            )
            .order_by(Attendance.joined_at.desc())
            .limit(20) # Fetch enough to filter for recent list + chart
        )
        
        attendance_records = attendance_query.all()
        
        for att, title in attendance_records:
            # Recent Activity Feed
            recent_activity.append({
                "type": "classroom",
                "text": f"Joined session: {title}",
                "timestamp": att.joined_at,
                "meta": {"status": att.status}
            })
            
            # Chart Data
            # Ensure safe comparison by normalizing to utc if needed, though assumed aware from DB
            if att.joined_at:
                # att.joined_at should be aware given the column definition, 
                # but let's be safe if DB driver returns naive for some reason (e.g. SQLite sometimes)
                att_time = att.joined_at
                if att_time.tzinfo is None:
                    att_time = att_time.replace(tzinfo=timezone.utc)
                
                if att_time >= seven_days_ago:
                    day_key = att_time.strftime("%a")
                    if day_key in track_map:
                        track_map[day_key] += 10

        # 4b. Test Submissions Activity
        # Only include submissions for tests in subjects belonging to instructor's courses
        submissions_query = await db.execute(
            select(Submission, Test.title)
            .join(Test, Submission.test_id == Test.id)
            .outerjoin(Subject, Test.subject_id == Subject.id)
            .where(
                Submission.user_id == student_id,
                Subject.course_id.in_(instructor_course_ids)
            )
            .order_by(Submission.submitted_at.desc())
            .limit(10)
        )
        
        submission_records = submissions_query.all()
        
        for sub, test_title in submission_records:
            # Recent Activity Feed
            recent_activity.append({
                "type": "submission",
                "text": f"Submitted Test: {test_title}",
                "timestamp": sub.submitted_at,
                "meta": {"score": sub.obtained_marks}
            })
            
            # Chart Data
            if sub.submitted_at:
                sub_time = sub.submitted_at
                if sub_time.tzinfo is None:
                    sub_time = sub_time.replace(tzinfo=timezone.utc)
                    
                if sub_time >= seven_days_ago:
                    day_key = sub_time.strftime("%a")
                    if day_key in track_map:
                        track_map[day_key] += 15

        # Sort and Format Recent Activity
        recent_activity.sort(key=lambda x: x["timestamp"], reverse=True)
        recent_activity = recent_activity[:10]
        
        formatted_activity = []
        for act in recent_activity:
            formatted_activity.append({
                "text": act["text"],
                "time": act["timestamp"].isoformat(),
                "type": act["type"]
            })

        # Format Track Data
        # Ensure ordered list from 6 days ago to today
        track_data = []
        for i in range(6, -1, -1):
            date_obj = now - timedelta(days=i)
            day_key = date_obj.strftime("%a")
            track_data.append({
                "date": day_key,
                "progress": track_map.get(day_key, 0)
            })

        return {
            "user_id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "enrolled_courses": len(courses_list),
            "total_progress": round(avg_progress, 1),
            "last_active": courses_list[0]["last_accessed"] if courses_list and courses_list[0]["last_accessed"] else None,
            "courses": courses_list,
            "recent_activity": formatted_activity,
            "track_data": track_data
        }

analytics_service = AnalyticsService()
