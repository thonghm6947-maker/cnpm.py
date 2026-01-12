from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base
from datetime import datetime


class CompanyModel(Base):
    """Company entity for recruiters."""
    __tablename__ = 'cm_companies'
    __table_args__ = {'extend_existing': True}

    company_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    website = Column(String(500), nullable=True)
    logo_url = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    recruiters = relationship("RecruiterProfileModel", back_populates="company")
    job_posts = relationship("JobPostModel", back_populates="company")

    def __repr__(self):
        return f"<CompanyModel(company_id={self.company_id}, name='{self.name}')>"
