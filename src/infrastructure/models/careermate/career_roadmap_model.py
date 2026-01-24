from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime


class CareerRoadmapModel(Base):
    """AI-generated career roadmap for candidates."""
    __tablename__ = 'cm_career_roadmaps'
    __table_args__ = {'extend_existing': True}

    roadmap_id = Column(Integer, primary_key=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey('cm_candidate_profiles.candidate_id'), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content_json = Column(Text, nullable=True)  # JSON stored as text for roadmap details
    target_role = Column(String(255), nullable=True)
    estimated_duration = Column(String(100), nullable=True)  # e.g., "6 months"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate = relationship("CandidateProfileModel", back_populates="career_roadmaps")

    def __repr__(self):
        return f"<CareerRoadmapModel(roadmap_id={self.roadmap_id}, title='{self.title}')>"
