from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin
from app.models.enums import MessageTypeEnum


class ClassMessage(TimestampMixin, Base):
    __tablename__ = "class_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)

    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    message_text = Column(String(2000), nullable=False)
    message_type = Column(String(50), nullable=False, default=MessageTypeEnum.normal.value)

    user = relationship("User", back_populates="class_messages")
    classroom = relationship("Classroom", back_populates="messages")
