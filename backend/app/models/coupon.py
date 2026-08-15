from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from app.db.base import Base, TimestampMixin

class Coupon(TimestampMixin, Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_percent = Column(Float, nullable=False, default=10.0) # Percentage e.g. 10.0 for 10%
    is_active = Column(Boolean, nullable=False, default=True)
    valid_until = Column(DateTime, nullable=True)
    max_uses = Column(Integer, nullable=False, default=1)
    uses_count = Column(Integer, nullable=False, default=0)
