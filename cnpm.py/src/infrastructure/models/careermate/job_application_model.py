from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime
import enum

class ApplicationStatus(enum.Enum):
    PENDING = 'PENDING'
    REVIEWING = 'REVIEWING'
    SHORTLISTED = 'SHORTLISTED'
    INTERVIEW = 'INTERVIEW'
    OFFERED = 'OFFERED'
    REJECTED = 'REJECTED'
    WITHDRAWN = 'WITHDRAWN'

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            normalized = value.upper()
            if normalized in cls.__members__:
                return cls[normalized]
        return None

class JobApplicationModel(Base):
    """Job application submitted by candidates."""
    __tablename__ = 'cm_job_applications'
    __table_args__ = {'extend_existing': True}

    app_id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey('cm_job_posts.job_id'), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey('cm_candidate_profiles.candidate_id'), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey('cm_resumes.resume_id'), nullable=True)
    status = Column(String(50), nullable=False, default=ApplicationStatus.PENDING.value)
    ai_match_score = Column(Numeric(5, 2), nullable=True)
    cover_letter = Column(String(2000), nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job_post = relationship('JobPostModel', back_populates='applications')
    candidate = relationship('CandidateProfileModel', back_populates='applications')
    resume = relationship('ResumeModel', back_populates='applications')

    def __repr__(self):
        return f"<JobApplicationModel(app_id={self.app_id}, status='{self.status}')>"
