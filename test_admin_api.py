"""
Test the admin API endpoint for pending jobs.
"""

import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
import enum

DATABASE_URL = os.environ.get('POSTGREE_DATABASE_URL', 'sqlite:///src/careermate.db')


# Simulate the JobStatus enum from the app
class JobStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING = "PENDING"
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    PAUSED = "PAUSED"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            normalized = value.upper()
            if normalized in cls.__members__:
                return cls[normalized]
        return None


def test_enum_conversion():
    """Test how the enum handles different inputs."""
    
    print("=== Testing JobStatus Enum ===\n")
    
    test_values = ['pending', 'PENDING', 'Pending', 'open', 'OPEN']
    
    for val in test_values:
        try:
            # Test what the controller does now
            status_enum = JobStatus(val.upper())
            print(f"Input: '{val}' -> JobStatus: {status_enum} -> value: '{status_enum.value}'")
        except Exception as e:
            print(f"Input: '{val}' -> ERROR: {e}")
    
    print("\n=== Testing direct filter ===\n")
    
    # Connect to DB
    Base = declarative_base()
    
    class JobPostModel(Base):
        __tablename__ = 'cm_job_posts'
        __table_args__ = {'extend_existing': True}
        job_id = Column(Integer, primary_key=True)
        status = Column(String(50), nullable=False)
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Test filtering with the enum value
    status_enum = JobStatus('pending'.upper())
    status_value = status_enum.value
    
    print(f"Filter with status_value = '{status_value}'")
    jobs = session.query(JobPostModel).filter_by(status=status_value).all()
    print(f"Found {len(jobs)} jobs")
    
    for job in jobs:
        print(f"  - Job ID: {job.job_id}, Status: '{job.status}'")
    
    session.close()


if __name__ == "__main__":
    test_enum_conversion()
