"""
Script to check job posts in the database.
"""

import sys
import os
from datetime import datetime

# Set UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from sqlalchemy import create_engine, Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base

# Get database URL from environment or use default SQLite
DATABASE_URL = os.environ.get('POSTGREE_DATABASE_URL', 'sqlite:///src/careermate.db')

Base = declarative_base()


class JobPostModel(Base):
    """Job posting by recruiters."""
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


def check_jobs():
    """Check job posts in the database."""
    
    print(f"Connecting to database: {DATABASE_URL}")
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        jobs = session.query(JobPostModel).all()
        
        if not jobs:
            print("No job posts found in database.")
            return
        
        print(f"\nFound {len(jobs)} job posts:\n")
        print("-" * 80)
        
        for job in jobs:
            # Use repr to avoid encoding issues
            title = job.title[:30] if job.title else "N/A"
            print(f"ID: {job.job_id} | Status: '{job.status}' | Recruiter ID: {job.recruiter_id}")
        
        print("-" * 80)
        
        # Count by status
        status_counts = {}
        for job in jobs:
            status = job.status
            status_counts[status] = status_counts.get(status, 0) + 1
        
        print("\nStatus breakdown:")
        for status, count in status_counts.items():
            print(f"  - '{status}': {count}")
        
    finally:
        session.close()


if __name__ == "__main__":
    check_jobs()
