from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime

class SavedJobModel(Base):
    """Jobs saved/bookmarked by candidates."""
    __tablename__ = 'cm_saved_jobs'
    __table_args__ = {'extend_existing': True}

    save_id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey('cm_job_posts.job_id'), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey('cm_candidate_profiles.candidate_id'), nullable=False, index=True)
    note = Column(String(500), nullable=True)
    saved_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    job_post = relationship('JobPostModel', back_populates='saved_by')
    candidate = relationship('CandidateProfileModel', back_populates='saved_jobs')

    def __repr__(self):
        return f"<SavedJobModel(save_id={self.save_id}, job_id={self.job_id})>"
