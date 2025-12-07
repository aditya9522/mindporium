from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class QAQuestion(TimestampMixin, Base):
    __tablename__ = "qa_questions"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    title = Column(String(255), nullable=False)
    question_text = Column(String(5000), nullable=False)

    is_resolved = Column(Boolean, nullable=False, default=False)
    upvotes = Column(Integer, nullable=False, default=0)

    # Relationships
    subject = relationship("Subject", back_populates="questions")
    user = relationship("User", back_populates="qa_questions")
    answers = relationship("QAAnswer", back_populates="question", cascade="all, delete-orphan")


class QAAnswer(TimestampMixin, Base):
    __tablename__ = "qa_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("qa_questions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    answer_text = Column(String(5000), nullable=False)

    is_helpful = Column(Boolean, nullable=False, default=False)
    is_instructor_answer = Column(Boolean, nullable=False, default=False)
    upvotes = Column(Integer, nullable=False, default=0)

    # Relationships
    question = relationship("QAQuestion", back_populates="answers")
    user = relationship("User", back_populates="qa_answers")