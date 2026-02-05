from sqlalchemy import Column, Integer, String, DateTime, Boolean
from infrastructure.databases.base import Base
from datetime import datetime, timedelta

class PasswordResetModel(Base):
    """Store password reset OTP tokens."""
    __tablename__ = 'cm_password_resets'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, index=True)
    otp_code = Column(String(6), nullable=False)
    is_used = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at

    def is_valid(self) -> bool:
        return not self.is_used and not self.is_expired() and self.attempts < 5

    def __repr__(self):
        return f"<PasswordResetModel(email='{self.email}', expires_at='{self.expires_at}')>"
