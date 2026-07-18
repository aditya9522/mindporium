from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class MediaAsset(TimestampMixin, Base):
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    url = Column(String(2048), nullable=False)
    content_type = Column(String(255), nullable=False, default="application/octet-stream")
    size = Column(Integer, nullable=False, default=0)
    category = Column(String(50), nullable=False, default="other")
    description = Column(Text, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    owner = relationship("User", back_populates="media_assets")
