from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime

class ResumeModel(Base):
    """Resume/CV uploaded by candidates."""
    __tablename__ = 'cm_resumes'
    __table_args__ = {'extend_existing': True}

    resume_id = Column(Integer, primary_key=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey('cm_candidate_profiles.candidate_id'), nullable=False, index=True)
    file_url = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate = relationship('CandidateProfileModel', back_populates='resumes')
    cv_analysis = relationship('CVAnalysisModel', back_populates='resume', uselist=False)
    applications = relationship('JobApplicationModel', back_populates='resume')

    def __repr__(self):
        return f"<ResumeModel(resume_id={self.resume_id}, is_primary={self.is_primary})>"
