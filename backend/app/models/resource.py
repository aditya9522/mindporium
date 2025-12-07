from sqlalchemy import (Boolean, Column, Enum, ForeignKey, Integer, String)
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin
from app.models.enums import ResourceTypeEnum


class Resource(TimestampMixin, Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(String(2000), nullable=True)

    resource_type = Column(Enum(ResourceTypeEnum), nullable=False)
    file_url = Column(String(1024), nullable=True)
    external_link = Column(String(1024), nullable=True)

    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="SET NULL"), nullable=True, index=True)

    is_downloadable = Column(Boolean, nullable=False, default=True)
    order_index = Column(Integer, nullable=False, default=0, index=True)

    subject = relationship("Subject", back_populates="resources")
    classroom = relationship("Classroom", back_populates="resources")
    completions = relationship("ResourceCompletion", back_populates="resource")
