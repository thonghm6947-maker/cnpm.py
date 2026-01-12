from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime


class CandidateProfileModel(Base):
    """Candidate profile with personal information."""
    __tablename__ = 'cm_candidate_profiles'
    __table_args__ = {'extend_existing': True}

    candidate_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('cm_users.user_id'), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("CMUserModel", back_populates="candidate_profile")
    resumes = relationship("ResumeModel", back_populates="candidate")
    career_roadmaps = relationship("CareerRoadmapModel", back_populates="candidate")
    saved_jobs = relationship("SavedJobModel", back_populates="candidate")
    applications = relationship("JobApplicationModel", back_populates="candidate")
    skills = relationship("CandidateSkillModel", back_populates="candidate")

    def __repr__(self):
        return f"<CandidateProfileModel(candidate_id={self.candidate_id}, full_name='{self.full_name}')>"
