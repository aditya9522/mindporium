from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Enrollment(TimestampMixin, Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)

    enrolled_at = Column(DateTime, nullable=True)
    progress_percent = Column(Float, nullable=False, default=0.0)
    last_accessed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    resource_completions = relationship("ResourceCompletion", back_populates="enrollment")
