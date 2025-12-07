from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Notification(TimestampMixin, Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    notification_type = Column(String(50), nullable=False, default="info")
    is_read = Column(Boolean, nullable=False, default=False)

    # Relationships
    user = relationship("User", back_populates="notifications")
