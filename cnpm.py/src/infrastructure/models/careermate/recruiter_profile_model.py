from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime


class RecruiterProfileModel(Base):
    """Recruiter profile linking users to companies."""
    __tablename__ = 'cm_recruiter_profiles'
    __table_args__ = {'extend_existing': True}

    recruiter_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('cm_users.user_id'), unique=True, nullable=False, index=True)
    company_id = Column(Integer, ForeignKey('cm_companies.company_id'), nullable=True, index=True)
    position = Column(String(100), nullable=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    location = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    bio = Column(String(1000), nullable=True)
    company_name = Column(String(255), nullable=True)  # Direct company name for simpler queries
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("CMUserModel", back_populates="recruiter_profile")
    company = relationship("CompanyModel", back_populates="recruiters")
    job_posts = relationship("JobPostModel", back_populates="recruiter")

    def __repr__(self):
        return f"<RecruiterProfileModel(recruiter_id={self.recruiter_id}, position='{self.position}')>"
