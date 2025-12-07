from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base

class ResourceCompletion(Base):
    __tablename__ = "resource_completions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="CASCADE"), nullable=False)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id", ondelete="CASCADE"), nullable=False)

    completed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User", back_populates="resource_completions")
    resource = relationship("Resource", back_populates="completions")
    enrollment = relationship("Enrollment", back_populates="resource_completions")
