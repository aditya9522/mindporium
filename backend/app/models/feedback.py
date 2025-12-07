from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class AppFeedback(TimestampMixin, Base):
    __tablename__ = "app_feedbacks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    subject = Column(String(200), nullable=False)
    message = Column(String(2000), nullable=False)
    rating = Column(Integer, nullable=True)  # Optional rating
    category = Column(String(50), nullable=False, default="general")  # general, bug, feature, course, support
    status = Column(String(20), nullable=False, default="pending")  # pending, reviewed, resolved
    response = Column(String(2000), nullable=True)  # Admin response

    # Relationship
    user = relationship("User", back_populates="app_feedbacks")


class CourseFeedback(TimestampMixin, Base):
    __tablename__ = "course_feedbacks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rating = Column(Integer, nullable=False)
    review_text = Column(String(4000), nullable=True)

    # Relationships
    course = relationship("Course", back_populates="feedbacks")
    user = relationship("User", back_populates="course_feedbacks")


class InstructorFeedback(TimestampMixin, Base):
    __tablename__ = "instructor_feedbacks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    instructor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rating = Column(Integer, nullable=False)
    comments = Column(String(2000), nullable=True)

    # Relationships
    instructor = relationship("User", back_populates="instructor_feedbacks", foreign_keys=[instructor_id])
    user = relationship("User", back_populates="given_instructor_feedbacks", foreign_keys=[user_id])
