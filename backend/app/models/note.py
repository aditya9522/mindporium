from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin

class Note(TimestampMixin, Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    files = Column(JSON, nullable=False, default=list)
    tags = Column(JSON, nullable=False, default=list)
    status = Column(String(50), nullable=False, default="active")
    is_pinned = Column(Boolean, nullable=False, default=False)
    color = Column(String(20), nullable=True, default=None)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="notes")
