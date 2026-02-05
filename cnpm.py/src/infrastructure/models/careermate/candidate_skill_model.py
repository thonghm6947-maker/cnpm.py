from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime
import enum

class SkillLevel(enum.Enum):
    BEGINNER = 'beginner'
    INTERMEDIATE = 'intermediate'
    ADVANCED = 'advanced'
    EXPERT = 'expert'

class CandidateSkillModel(Base):
    """Junction table for candidates and their skills."""
    __tablename__ = 'cm_candidate_skills'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey('cm_candidate_profiles.candidate_id'), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey('cm_skills.skill_id'), nullable=False, index=True)
    level = Column(Enum(SkillLevel), nullable=True, default=SkillLevel.INTERMEDIATE)
    years_experience = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate = relationship('CandidateProfileModel', back_populates='skills')
    skill = relationship('SkillModel', back_populates='candidate_skills')

    def __repr__(self):
        return f"<CandidateSkillModel(candidate_id={self.candidate_id}, skill_id={self.skill_id}, level='{self.level}')>"
