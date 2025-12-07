from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin
from app.models.enums import LevelEnum, CategoryEnum
from app.models.links import CourseInstructor


class Course(TimestampMixin, Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, autoincrement=True)

    title = Column(String(255), nullable=False, index=True)
    description = Column(String(2000), nullable=True)
    thumbnail = Column(String(1024), nullable=True)

    level = Column(String(50), nullable=False, default=LevelEnum.beginner.value)
    category = Column(String(50), nullable=False, index=True, default=CategoryEnum.paid.value)
    tags = Column(JSON, nullable=True)  # e.g. ["python", "web development"]

    duration_weeks = Column(Integer, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_published = Column(Boolean, nullable=False, default=False)
    price = Column(Float, nullable=True, default=0.0)

    # Relationships
    created_by_user = relationship("User", back_populates="created_courses")
    subjects = relationship("Subject", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    feedbacks = relationship("CourseFeedback", back_populates="course", cascade="all, delete-orphan")
    instructors = relationship("User", secondary=CourseInstructor.__table__, back_populates="teaching_courses")
    announcements = relationship("Announcement", back_populates="course")
