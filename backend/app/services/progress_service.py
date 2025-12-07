from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.subject import Subject
from app.models.classroom import Classroom
from app.models.attendance import Attendance
from app.models.submission import Submission
from app.models.test import Test
from app.models.resource import Resource
from app.models.resource_completion import ResourceCompletion

class ProgressService:
    async def calculate_course_progress(self, db: AsyncSession, user_id: int, course_id: int) -> Dict[str, Any]:
        """
        Calculate detailed progress for a student in a course.
        """
        # Get enrollment
        result = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == user_id,
                Enrollment.course_id == course_id
            )
        )
        enrollment = result.scalars().first()
        if not enrollment:
            return {"error": "Not enrolled in this course"}
        
        # Get total subjects
        result = await db.execute(
            select(func.count()).select_from(Subject).where(Subject.course_id == course_id)
        )
        total_subjects = result.scalar() or 0
        
        # Get total classes
        result = await db.execute(
            select(func.count()).select_from(Classroom)
            .join(Subject, Classroom.subject_id == Subject.id)
            .where(Subject.course_id == course_id)
        )
        total_classes = result.scalar() or 0
        
        # Get attended classes
        result = await db.execute(
            select(func.count()).select_from(Attendance)
            .join(Classroom, Attendance.classroom_id == Classroom.id)
            .join(Subject, Classroom.subject_id == Subject.id)
            .where(
                Subject.course_id == course_id,
                Attendance.user_id == user_id,
                Attendance.is_present == True
            )
        )
        attended_classes = result.scalar() or 0
        
        # Get total tests
        result = await db.execute(
            select(func.count()).select_from(Test)
            .join(Subject, Test.subject_id == Subject.id)
            .where(Subject.course_id == course_id, Test.status == "published")
        )
        total_tests = result.scalar() or 0
        
        # Get completed tests
        result = await db.execute(
            select(func.count()).select_from(Submission)
            .join(Test, Submission.test_id == Test.id)
            .join(Subject, Test.subject_id == Subject.id)
            .where(
                Subject.course_id == course_id,
                Submission.user_id == user_id
            )
        )
        completed_tests = result.scalar() or 0
        
        # Get total resources
        result = await db.execute(
            select(func.count()).select_from(Resource)
            .join(Subject, Resource.subject_id == Subject.id)
            .where(Subject.course_id == course_id)
        )
        total_resources = result.scalar() or 0
        
        # Get completed resources
        completed_resources_result = await db.execute(
            select(ResourceCompletion.resource_id).select_from(ResourceCompletion)
            .join(Resource, ResourceCompletion.resource_id == Resource.id)
            .join(Subject, Resource.subject_id == Subject.id)
            .where(
                Subject.course_id == course_id,
                ResourceCompletion.user_id == user_id
            )
        )
        completed_resource_ids = completed_resources_result.scalars().all()
        completed_resources = len(completed_resource_ids)
        
        # Calculate overall progress
        progress_factors = []
        if total_classes > 0:
            progress_factors.append(attended_classes / total_classes * 100)
        if total_tests > 0:
            progress_factors.append(completed_tests / total_tests * 100)
        if total_resources > 0:
            progress_factors.append(completed_resources / total_resources * 100)
            
        overall_progress = sum(progress_factors) / len(progress_factors) if progress_factors else 0
        
        # Update enrollment progress
        enrollment.progress_percent = overall_progress
        db.add(enrollment)
        await db.commit()
        
        return {
            "course_id": course_id,
            "overall_progress": round(overall_progress, 2),
            "total_subjects": total_subjects,
            "total_classes": total_classes,
            "attended_classes": attended_classes,
            "attendance_rate": round((attended_classes / total_classes * 100) if total_classes > 0 else 0, 2),
            "total_tests": total_tests,
            "completed_tests": completed_tests,
            "test_completion_rate": round((completed_tests / total_tests * 100) if total_tests > 0 else 0, 2),
            "total_resources": total_resources,
            "completed_resources": completed_resources,
            "completed_resource_ids": completed_resource_ids,
            "resource_completion_rate": round((completed_resources / total_resources * 100) if total_resources > 0 else 0, 2)
        }

progress_service = ProgressService()
