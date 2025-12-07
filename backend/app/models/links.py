from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase

from app.db.base import Base


class CourseInstructor(Base):
    __tablename__ = "course_instructors"

    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)

    __table_args__ = (
        UniqueConstraint("course_id", "user_id", name="uq_course_instructor"),
    )
