from sqlalchemy import Column, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class PublishedPortfolio(TimestampMixin, Base):
    __tablename__ = "published_portfolios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(160), unique=True, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(JSON, nullable=False)

    owner = relationship("User")
