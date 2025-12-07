from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.db.database import get_sessionmaker
import logging

logger = logging.getLogger("app.services.notification")

class NotificationService:
    async def create_notification(
        self, 
        user_id: int, 
        title: str, 
        message: str, 
        notification_type: str = "info"
    ):
        """
        Create a notification for a user.
        """
        async_session = get_sessionmaker()
        async with async_session() as db:
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type
            )
            db.add(notification)
            await db.commit()
            logger.info(f"Notification created for user {user_id}: {title}")
    
    async def create_bulk_notifications(self, user_ids: list, title: str, message: str, notification_type: str = "info"):
        """Create notifications for multiple users efficiently"""
        async_session = get_sessionmaker()
        async with async_session() as db:
            notifications = [
                Notification(
                    user_id=user_id,
                    title=title,
                    message=message,
                    notification_type=notification_type
                )
                for user_id in user_ids
            ]
            db.add_all(notifications)
            await db.commit()
            logger.info(f"Bulk notifications created for {len(user_ids)} users: {title}")
            
    async def notify_class_starting(self, classroom_id: int, classroom_title: str, user_ids: list):
        """Notify students that a class is starting soon."""
        await self.create_bulk_notifications(
            user_ids=user_ids,
            title="Class Starting Soon",
            message=f"Your class '{classroom_title}' is starting in 10 minutes!",
            notification_type="class"
        )
            
    async def notify_new_announcement(self, user_ids: list, announcement_title: str):
        """Notify students about a new announcement."""
        await self.create_bulk_notifications(
            user_ids=user_ids,
            title="New Announcement",
            message=f"New announcement: {announcement_title}",
            notification_type="announcement"
        )
            
    async def notify_test_published(self, user_ids: list, test_title: str):
        """Notify students when a test is published."""
        await self.create_bulk_notifications(
            user_ids=user_ids,
            title="New Test Available",
            message=f"A new test has been published: {test_title}",
            notification_type="test"
        )
    
    async def notify_course_created(self, user_ids: list, course_title: str, instructor_name: str):
        """Notify users when a new course is created"""
        await self.create_bulk_notifications(
            user_ids=user_ids,
            title="New Course Available",
            message=f"A new course '{course_title}' by {instructor_name} is now available!",
            notification_type="course"
        )
    
    async def notify_resource_added(self, user_ids: list, resource_title: str, subject_title: str):
        """Notify students when a new resource is added"""
        await self.create_bulk_notifications(
            user_ids=user_ids,
            title="New Resource Added",
            message=f"New resource '{resource_title}' added to {subject_title}",
            notification_type="resource"
        )
    
    async def notify_subject_added(self, user_ids: list, subject_title: str, course_title: str):
        """Notify when a new subject is added to a course"""
        await self.create_bulk_notifications(
            user_ids=user_ids,
            title="New Subject Added",
            message=f"New subject '{subject_title}' added to {course_title}",
            notification_type="subject"
        )
    
    async def notify_instructor_joined(self, user_ids: list, instructor_name: str):
        """Notify when a new instructor joins"""
        await self.create_bulk_notifications(
            user_ids=user_ids,
            title="New Instructor Joined",
            message=f"Welcome {instructor_name} to our platform!",
            notification_type="instructor"
        )
    
    async def notify_enrollment_success(self, user_id: int, course_title: str):
        """Notify user of successful enrollment"""
        await self.create_notification(
            user_id=user_id,
            title="Enrollment Successful",
            message=f"You have successfully enrolled in '{course_title}'",
            notification_type="enrollment"
        )
    
    async def notify_grade_posted(self, user_id: int, test_title: str, score: float):
        """Notify student when grade is posted"""
        await self.create_notification(
            user_id=user_id,
            title="Grade Posted",
            message=f"Your grade for '{test_title}' is now available: {score}%",
            notification_type="grade"
        )

notification_service = NotificationService()
