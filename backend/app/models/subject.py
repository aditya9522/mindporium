from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin


class Subject(TimestampMixin, Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(String(2000), nullable=True)

    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, nullable=False, default=0, index=True)

    # Relationships
    course = relationship("Course", back_populates="subjects")
    classrooms = relationship("Classroom", back_populates="subject", cascade="all, delete-orphan")
    tests = relationship("Test", back_populates="subject", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="subject")
    questions = relationship("QAQuestion", back_populates="subject")
    resources = relationship("Resource", back_populates="subject", lazy="selectin")
