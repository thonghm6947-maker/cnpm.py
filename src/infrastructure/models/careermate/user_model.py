from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime
import enum


class UserRole(enum.Enum):
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class CMUserModel(Base):
    """User entity for AI CareerMate platform."""
    __tablename__ = 'cm_users'
    __table_args__ = {'extend_existing': True}

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(512), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CANDIDATE)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate_profile = relationship("CandidateProfileModel", back_populates="user", uselist=False)
    recruiter_profile = relationship("RecruiterProfileModel", back_populates="user", uselist=False)
    subscriptions = relationship("UserSubscriptionModel", back_populates="user")
    chat_sessions = relationship("ChatSessionModel", back_populates="user")

    def __repr__(self):
        return f"<UserModel(user_id={self.user_id}, email='{self.email}', role='{self.role}')>"
