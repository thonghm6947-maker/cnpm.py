from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime
import enum


class JobStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING = "PENDING"
    OPEN = "OPEN"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CLOSED = "CLOSED"
    PAUSED = "PAUSED"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            # Try matching member name (case-insensitive)
            # This handles "pending" -> PENDING
            normalized = value.upper()
            if normalized in cls.__members__:
                return cls[normalized]
        return None


class JobPostModel(Base):
    """Job posting by recruiters."""
    __tablename__ = 'cm_job_posts'
    __table_args__ = {'extend_existing': True}

    job_id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey('cm_companies.company_id'), nullable=True, index=True)
    recruiter_id = Column(Integer, ForeignKey('cm_recruiter_profiles.recruiter_id'), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    salary_min = Column(Numeric(15, 2), nullable=True)
    salary_max = Column(Numeric(15, 2), nullable=True)
    location = Column(String(255), nullable=True)
    job_type = Column(String(50), nullable=True)  # full-time, part-time, contract, etc.
    deadline = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=False, default=JobStatus.DRAFT.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("CompanyModel", back_populates="job_posts")
    recruiter = relationship("RecruiterProfileModel", back_populates="job_posts")
    required_skills = relationship("JobSkillModel", back_populates="job_post")
    applications = relationship("JobApplicationModel", back_populates="job_post")
    saved_by = relationship("SavedJobModel", back_populates="job_post")

    def __repr__(self):
        return f"<JobPostModel(job_id={self.job_id}, title='{self.title}', status='{self.status}')>"
