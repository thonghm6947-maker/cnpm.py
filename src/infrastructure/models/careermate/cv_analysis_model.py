from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime


class CVAnalysisModel(Base):
    """AI-generated CV/Resume analysis results."""
    __tablename__ = 'cm_cv_analyses'
    __table_args__ = {'extend_existing': True}

    analysis_id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey('cm_resumes.resume_id'), unique=True, nullable=False, index=True)
    ats_score = Column(Numeric(5, 2), nullable=True)
    feedback = Column(Text, nullable=True)
    missing_skills = Column(Text, nullable=True)  # JSON stored as text
    strengths = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    resume = relationship("ResumeModel", back_populates="cv_analysis")

    def __repr__(self):
        return f"<CVAnalysisModel(analysis_id={self.analysis_id}, ats_score={self.ats_score})>"
