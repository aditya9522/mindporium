from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Boolean,
    Float,
    JSON,
)
from sqlalchemy.orm import relationship

from app.db.base import TimestampMixin, Base
from app.models.enums import TestStatusEnum


class Test(Base, TimestampMixin):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(String(2000), nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="SET NULL"), nullable=True)

    total_marks = Column(Float, nullable=False, default=0.0)
    passing_marks = Column(Float, nullable=False, default=0.0)
    duration_minutes = Column(Integer, nullable=False, default=60)
    is_active = Column(Boolean, nullable=False, default=True)

    status = Column(String(50), nullable=False, default=TestStatusEnum.draft.value)
    results_published = Column(Boolean, nullable=False, default=False)

    subject = relationship("Subject", back_populates="tests")
    classroom = relationship("Classroom", back_populates="tests")

    questions = relationship("TestQuestion", back_populates="test", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="test", cascade="all, delete-orphan")


class TestQuestion(Base, TimestampMixin):
    __tablename__ = "test_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    test_id = Column(Integer, ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(String(5000), nullable=False)
    question_type = Column(String(50), nullable=False, default="mcq")

    options = Column(JSON, nullable=True)
    correct_answer = Column(String(2000), nullable=True)

    marks = Column(Float, nullable=False, default=1.0)
    order_index = Column(Integer, nullable=False, default=0)

    # Relationship
    test = relationship("Test", back_populates="questions")
