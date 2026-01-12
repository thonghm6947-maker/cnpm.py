from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from infrastructure.databases.base import Base

class JobModel(Base):
    __tablename__ = 'jobs'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    salary_range = Column(String(100), nullable=True)
    job_type = Column(String(50), nullable=True)
    status = Column(String(20), default='draft', nullable=False)
    reject_reason = Column(Text, nullable=True)
    recruiter_id = Column(Integer, nullable=True)
    
    application_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
