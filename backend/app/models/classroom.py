from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin
from app.models.enums import ClassroomStatusEnum, ClassroomTypeEnum, ClassroomProviderEnum


class Classroom(TimestampMixin, Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, autoincrement=True)

    title = Column(String(255), nullable=False)
    description = Column(String(2000), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)

    status = Column(String(50), nullable=False, default=ClassroomStatusEnum.not_started.value)
    class_type = Column(String(50), nullable=False, default=ClassroomTypeEnum.regular.value)
    instructor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    meeting_id = Column(String(100), nullable=True, unique=True)
    meeting_password = Column(String(100), nullable=True)
    join_url = Column(String(1024), nullable=True)
    
    provider = Column(String(50), default=ClassroomProviderEnum.custom.value, nullable=False)
    max_participants = Column(Integer, default=100)
    settings = Column(JSON, nullable=True)  # e.g. {"mute_on_entry": true, "waiting_room": false}

    recording_url = Column(String(1024), nullable=True)

    is_active = Column(Boolean, nullable=False, default=True)

    instructor = relationship("User", back_populates="classrooms", foreign_keys=[instructor_id])
    subject = relationship("Subject", back_populates="classrooms")
    tests = relationship("Test", back_populates="classroom", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="classroom", cascade="all, delete-orphan")
    messages = relationship("ClassMessage", back_populates="classroom", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="classroom")
