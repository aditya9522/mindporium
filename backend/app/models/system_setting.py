from sqlalchemy import Column, Integer, String, Boolean, JSON
from app.db.base import Base, TimestampMixin


class SystemSetting(TimestampMixin, Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(JSON, nullable=False)  # Store as JSON for flexibility (bool, int, string, dict)
    description = Column(String(500), nullable=True)
    
    is_public = Column(Boolean, default=False)  # If true, can be fetched by frontend without auth
    group = Column(String(50), default="general", index=True)  # e.g., 'email', 'payment', 'general', 'video'
