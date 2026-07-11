from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Announcement(TimestampMixin, Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, autoincrement=True)

    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)  # changed from String(5000) → Text to support HTML content

    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)

    is_pinned = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    creator = relationship("User", back_populates="announcements")
    course = relationship("Course", back_populates="announcements")
    subject = relationship("Subject", back_populates="announcements", foreign_keys=[subject_id])
