from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin
from app.models.enums import RoleEnum
from app.models.links import CourseInstructor


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)

    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone_number = Column(String(25), nullable=True)

    password = Column(String(512), nullable=False)
    role = Column(String(50), nullable=False, default=RoleEnum.student.value)

    photo = Column(String, nullable=True)
    banner_image = Column(String, nullable=True)

    # Instructor Profile
    bio = Column(String(2000), nullable=True)
    experience = Column(String(1000), nullable=True)
    social_links = Column(JSON, nullable=True)

    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=False)

    # Password Reset OTP
    password_reset_otp = Column(String(6), nullable=True)
    otp_created_at = Column(DateTime, nullable=True)
    otp_attempts = Column(Integer, default=0, nullable=False)

    # Preferences
    timezone = Column(String(50), default="UTC", nullable=False)
    language = Column(String(10), default="en", nullable=False)

    # Relationships
    created_courses = relationship("Course", back_populates="created_by_user")
    created_communities = relationship("Community", back_populates="created_by_user")
    chat_sessions = relationship("ChatSession", back_populates="user")
    submissions = relationship("Submission", back_populates="user")
    community_posts = relationship("CommunityPost", back_populates="user")
    instructor_feedbacks = relationship("InstructorFeedback", back_populates="instructor")
    teaching_courses = relationship("Course", secondary=CourseInstructor.__tablename__, back_populates="instructors")
    community_bans = relationship("CommunityBan", back_populates="banned_user", foreign_keys="CommunityBan.user_id")
    bans_issued = relationship("CommunityBan", back_populates="banned_by_user", foreign_keys="CommunityBan.banned_by")
    community_subscriptions = relationship("CommunitySubscription", back_populates="user")
    community_reactions = relationship("CommunityReaction", back_populates="user")
    community_comments = relationship("CommunityComment", back_populates="user")
    
    # Additional relationships
    classrooms = relationship("Classroom", back_populates="instructor", foreign_keys="Classroom.instructor_id")
    announcements = relationship("Announcement", back_populates="creator")
    enrollments = relationship("Enrollment", back_populates="user")
    attendances = relationship("Attendance", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    app_feedbacks = relationship("AppFeedback", back_populates="user")
    course_feedbacks = relationship("CourseFeedback", back_populates="user")
    instructor_feedbacks = relationship("InstructorFeedback", back_populates="instructor", foreign_keys="InstructorFeedback.instructor_id")
    given_instructor_feedbacks = relationship("InstructorFeedback", back_populates="user", foreign_keys="InstructorFeedback.user_id")
    qa_questions = relationship("QAQuestion", back_populates="user")
    qa_answers = relationship("QAAnswer", back_populates="user")
    class_messages = relationship("ClassMessage", back_populates="user")
    resource_completions = relationship("ResourceCompletion", back_populates="user")
