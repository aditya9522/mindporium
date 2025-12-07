from sqlalchemy import (
    Column,
    Integer,
    Float,
    ForeignKey,
    JSON,
    DateTime,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base, TimestampMixin


class Submission(TimestampMixin, Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    test_id = Column(Integer, ForeignKey("tests.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    answers = Column(JSON, nullable=False, default={})
    evaluation = Column(JSON, nullable=False, default={})
    obtained_marks = Column(Float, nullable=False, default=0.0)
    submitted_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    # Relationships
    test = relationship("Test", back_populates="submissions")
    user = relationship("User", back_populates="submissions")
