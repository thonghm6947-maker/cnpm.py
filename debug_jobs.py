import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'src'))

from infrastructure.repositories.careermate.job_repository import JobRepository
from infrastructure.databases.factory_database import FactoryDatabase

# Initialize DB
try:
    db = FactoryDatabase.get_database('POSTGREE')
    repo = JobRepository()
    print("Attempting to fetch all jobs...")
    jobs = repo.get_all()
    print(f"Successfully fetched {len(jobs)} jobs.")
    for job in jobs:
        print(f"Job: {job.job_id}, Status: {job.status}")

except Exception as e:
    print("CRASHED!")
    import traceback
    traceback.print_exc()
