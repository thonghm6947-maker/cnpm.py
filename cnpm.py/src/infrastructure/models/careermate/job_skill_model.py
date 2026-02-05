from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime

class JobSkillModel(Base):
    """Junction table for job posts and required skills."""
    __tablename__ = 'cm_job_skills'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey('cm_job_posts.job_id'), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey('cm_skills.skill_id'), nullable=False, index=True)
    is_required = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    job_post = relationship('JobPostModel', back_populates='required_skills')
    skill = relationship('SkillModel', back_populates='job_skills')

    def __repr__(self):
        return f"<JobSkillModel(job_id={self.job_id}, skill_id={self.skill_id}, is_required={self.is_required})>"
