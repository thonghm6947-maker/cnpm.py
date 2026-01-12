"""
Script to test admin jobs API endpoint.
"""

import sys
import os
sys.stdout.reconfigure(encoding='utf-8')

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from sqlalchemy import create_engine, Column, Integer, String, Text, Numeric, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

DATABASE_URL = os.environ.get('POSTGREE_DATABASE_URL', 'sqlite:///src/careermate.db')
Base = declarative_base()


class JobPostModel(Base):
    __tablename__ = 'cm_job_posts'
    __table_args__ = {'extend_existing': True}

    job_id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, nullable=True)
    recruiter_id = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    salary_min = Column(Numeric(15, 2), nullable=True)
    salary_max = Column(Numeric(15, 2), nullable=True)
    location = Column(String(255), nullable=True)
    job_type = Column(String(50), nullable=True)
    deadline = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=False, default='DRAFT')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


def test_filter():
    """Test the filter logic for admin jobs."""
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Test 1: Get all jobs
        all_jobs = session.query(JobPostModel).all()
        print(f"All jobs count: {len(all_jobs)}")
        
        # Test 2: Filter by status = 'PENDING' (uppercase)
        pending_jobs_upper = session.query(JobPostModel).filter_by(status='PENDING').all()
        print(f"Jobs with status='PENDING': {len(pending_jobs_upper)}")
        
        # Test 3: Filter by status = 'pending' (lowercase)
        pending_jobs_lower = session.query(JobPostModel).filter_by(status='pending').all()
        print(f"Jobs with status='pending': {len(pending_jobs_lower)}")
        
        # Print all statuses
        print("\nAll status values in DB:")
        for job in all_jobs:
            print(f"  Job ID {job.job_id}: status='{job.status}' (type: {type(job.status).__name__})")
        
    finally:
        session.close()


if __name__ == "__main__":
    test_filter()
