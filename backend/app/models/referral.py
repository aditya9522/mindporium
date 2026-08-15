from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin

class Referral(TimestampMixin, Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    referred_email = Column(String(255), nullable=True)  # nullable - filled when user registers
    referral_code = Column(String(50), nullable=False, index=True)
    status = Column(String(50), default="pending")  # pending, registered, completed
    
    referrer = relationship("User", foreign_keys=[referrer_id])
