from sqlalchemy import Column, Integer, ForeignKey, Boolean, DateTime, String
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base, TimestampMixin
from app.models.enums import AttendanceStatusEnum


class Attendance(TimestampMixin, Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, autoincrement=True)

    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    joined_at = Column(DateTime(timezone=True), nullable=True)
    left_at = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, default=0)
    is_present = Column(Boolean, default=True)
    status = Column(String(50), default=AttendanceStatusEnum.present.value, nullable=False)
    
    ip_address = Column(String(45), nullable=True)
    device_info = Column(String(255), nullable=True)

    classroom = relationship("Classroom", back_populates="attendances")
    user = relationship("User", back_populates="attendances")
