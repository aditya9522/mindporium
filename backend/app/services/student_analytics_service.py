from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.classroom import Classroom
from app.models.attendance import Attendance
from app.models.submission import Submission
from app.models.test import Test
from app.models.subject import Subject
from app.services.llm_service import llm_service

class StudentAnalyticsService:
    
    async def get_student_dashboard(self, db: AsyncSession, user_id: int) -> Dict[str, Any]:
        """
        Comprehensive student dashboard with learning analytics.
        """
        # Get all enrollments
        enrollments_query = await db.execute(
            select(Enrollment).where(Enrollment.user_id == user_id)
        )
        enrollments = enrollments_query.scalars().all()
        course_ids = [e.course_id for e in enrollments]
        
        if not course_ids:
            return {
                "overview": {
                    "total_courses": 0,
                    "total_classes_attended": 0,
                    "total_tests_completed": 0
                },
                "enrolled_courses": [],
                "recent_activity": []
            }
        
        # Total classes attended
        total_attended = await db.execute(
            select(func.count()).select_from(Attendance)
            .join(Classroom, Attendance.classroom_id == Classroom.id)
            .join(Subject, Classroom.subject_id == Subject.id)
            .where(
                Subject.course_id.in_(course_ids),
                Attendance.user_id == user_id
            )
        )
        
        # Total tests completed
        total_tests = await db.execute(
            select(func.count()).select_from(Submission)
            .join(Test, Submission.test_id == Test.id)
            .join(Subject, Test.subject_id == Subject.id)
            .where(
                Subject.course_id.in_(course_ids),
                Submission.user_id == user_id
            )
        )
        
        # Average test score
        avg_score = await db.execute(
            select(func.avg(Submission.obtained_marks))
            .join(Test, Submission.test_id == Test.id)
            .join(Subject, Test.subject_id == Subject.id)
            .where(
                Subject.course_id.in_(course_ids),
                Submission.user_id == user_id
            )
        )
        
        # Course progress details
        course_progress = []
        for enrollment in enrollments:
            course_query = await db.execute(
                select(Course).where(Course.id == enrollment.course_id)
            )
            course = course_query.scalars().first()
            
            if course:
                course_progress.append({
                    "course_id": course.id,
                    "title": course.title,
                    "progress_percent": enrollment.progress_percent or 0,
                    "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None
                })
        
        # Recent activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_attendance = await db.execute(
            select(
                Attendance.joined_at,
                Classroom.title,
                Classroom.id
            )
            .join(Classroom, Attendance.classroom_id == Classroom.id)
            .where(
                Attendance.user_id == user_id,
                Attendance.joined_at >= week_ago
            )
            .order_by(Attendance.joined_at.desc())
            .limit(10)
        )
        
        recent_activity = [
            {
                "type": "class_attended",
                "classroom_id": row[2],
                "title": row[1],
                "timestamp": row[0].isoformat() if row[0] else None
            }
            for row in recent_attendance.all()
        ]
        
        # Activity chart (Last 30 days)
        month_ago = datetime.utcnow() - timedelta(days=30)
        daily_activity = await db.execute(
            select(
                func.date(Attendance.joined_at).label('date'),
                func.count().label('count')
            )
            .where(
                Attendance.user_id == user_id,
                Attendance.joined_at >= month_ago
            )
            .group_by(func.date(Attendance.joined_at))
            .order_by('date')
        )
        
        activity_data = {row.date.strftime('%Y-%m-%d'): row.count for row in daily_activity}
        
        # Fill in missing dates
        chart_activity = []
        current_date = month_ago
        while current_date <= datetime.utcnow():
            date_str = current_date.strftime('%Y-%m-%d')
            chart_activity.append({
                "date": date_str,
                "count": activity_data.get(date_str, 0)
            })
            current_date += timedelta(days=1)

        # Performance Stats (Score distribution)
        score_stats = await db.execute(
            select(Submission.obtained_marks, Test.total_marks)
            .join(Test, Submission.test_id == Test.id)
            .where(Submission.user_id == user_id)
        )
        
        scores = []
        for row in score_stats:
            if row.total_marks > 0:
                percentage = (row.obtained_marks / row.total_marks) * 100
                scores.append(percentage)
                
        performance_dist = {
            "excellent": len([s for s in scores if s >= 90]),
            "good": len([s for s in scores if 70 <= s < 90]),
            "average": len([s for s in scores if 50 <= s < 70]),
            "needs_improvement": len([s for s in scores if s < 50])
        }
        
        return {
            "overview": {
                "total_courses": len(enrollments),
                "total_classes_attended": total_attended.scalar() or 0,
                "total_tests_completed": total_tests.scalar() or 0,
                "average_test_score": round(float(avg_score.scalar() or 0), 2)
            },
            "enrolled_courses": course_progress,
            "recent_activity": recent_activity,
            "charts": {
                "activity": chart_activity,
                "performance_distribution": performance_dist
            }
        }
    
    async def get_course_progress_detailed(
        self, 
        db: AsyncSession, 
        user_id: int, 
        course_id: int
    ) -> Dict[str, Any]:
        """
        Detailed progress analytics for a specific course with chart data.
        """
        # Check enrollment
        enrollment_query = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == user_id,
                Enrollment.course_id == course_id
            )
        )
        enrollment = enrollment_query.scalars().first()
        
        if not enrollment:
            return {"error": "Not enrolled in this course"}
        
        # Get all subjects
        subjects_query = await db.execute(
            select(Subject).where(Subject.course_id == course_id)
        )
        subjects = subjects_query.scalars().all()
        
        # Subject-wise progress
        subject_progress = []
        for subject in subjects:
            # Classes in this subject
            total_classes = await db.execute(
                select(func.count()).select_from(Classroom)
                .where(Classroom.subject_id == subject.id)
            )
            
            # Classes attended
            attended_classes = await db.execute(
                select(func.count()).select_from(Attendance)
                .join(Classroom, Attendance.classroom_id == Classroom.id)
                .where(
                    Classroom.subject_id == subject.id,
                    Attendance.user_id == user_id
                )
            )
            
            # Tests in this subject
            total_tests = await db.execute(
                select(func.count()).select_from(Test)
                .where(Test.subject_id == subject.id, Test.status == "published")
            )
            
            # Tests completed
            completed_tests = await db.execute(
                select(func.count()).select_from(Submission)
                .join(Test, Submission.test_id == Test.id)
                .where(
                    Test.subject_id == subject.id,
                    Submission.user_id == user_id
                )
            )
            
            total_c = total_classes.scalar() or 0
            attended_c = attended_classes.scalar() or 0
            total_t = total_tests.scalar() or 0
            completed_t = completed_tests.scalar() or 0
            
            subject_progress.append({
                "subject_id": subject.id,
                "title": subject.title,
                "total_classes": total_c,
                "attended_classes": attended_c,
                "attendance_rate": round((attended_c / total_c * 100) if total_c > 0 else 0, 2),
                "total_tests": total_t,
                "completed_tests": completed_t,
                "test_completion_rate": round((completed_t / total_t * 100) if total_t > 0 else 0, 2)
            })
        
        # Test performance over time
        test_performance_query = await db.execute(
            select(
                Submission.submitted_at,
                Submission.obtained_marks,
                Test.total_marks,
                Test.title
            )
            .join(Test, Submission.test_id == Test.id)
            .join(Subject, Test.subject_id == Subject.id)
            .where(
                Subject.course_id == course_id,
                Submission.user_id == user_id
            )
            .order_by(Submission.submitted_at)
        )
        
        test_performance = [
            {
                "date": row[0].strftime("%Y-%m-%d") if row[0] else None,
                "score_percentage": round((row[1] / row[2] * 100) if row[2] > 0 else 0, 2),
                "test_title": row[3]
            }
            for row in test_performance_query.all()
        ]
        
        # AI-powered learning insights
        learning_insights = None
        if subject_progress:
            # Generate insights based on progress
            progress_summary = f"""Student Progress Summary:
- Total Subjects: {len(subject_progress)}
- Overall Progress: {enrollment.progress_percent}%
- Average Attendance: {sum(s['attendance_rate'] for s in subject_progress) / len(subject_progress):.1f}%
- Average Test Completion: {sum(s['test_completion_rate'] for s in subject_progress) / len(subject_progress):.1f}%
"""
            
            prompt = f"""Based on the following student progress data, provide:
1. 3 key strengths or achievements
2. 3 areas that need improvement
3. 2-3 personalized study recommendations

{progress_summary}

Provide encouraging and actionable insights."""
            
            learning_insights = await llm_service.generate_response(prompt)
        
        return {
            "course_id": course_id,
            "overall_progress": enrollment.progress_percent or 0,
            "subject_progress": subject_progress,
            "test_performance_timeline": test_performance,
            "ai_insights": {
                "learning_recommendations": learning_insights
            },
            "chart_data": {
                "subject_progress_bar": {
                    "labels": [s["title"] for s in subject_progress],
                    "attendance_rates": [s["attendance_rate"] for s in subject_progress],
                    "test_completion_rates": [s["test_completion_rate"] for s in subject_progress]
                },
                "test_performance_line": {
                    "dates": [t["date"] for t in test_performance],
                    "scores": [t["score_percentage"] for t in test_performance]
                }
            }
        }

student_analytics_service = StudentAnalyticsService()
