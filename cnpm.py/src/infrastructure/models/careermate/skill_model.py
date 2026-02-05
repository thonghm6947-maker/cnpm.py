from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime

class SkillModel(Base):
    """Skill entity for job requirements and candidate skills."""
    __tablename__ = 'cm_skills'
    __table_args__ = {'extend_existing': True}

    skill_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job_skills = relationship('JobSkillModel', back_populates='skill')
    candidate_skills = relationship('CandidateSkillModel', back_populates='skill')

    def __repr__(self):
        return f"<SkillModel(skill_id={self.skill_id}, name='{self.name}')>"
