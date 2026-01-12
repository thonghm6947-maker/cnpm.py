from infrastructure.repositories.job_repository import JobRepository
from infrastructure.models.job_model import JobModel
from typing import Optional, List
from datetime import datetime

class JobService:
    def __init__(self, repository: JobRepository):
        self.repository = repository

    def get_job(self, job_id: int) -> Optional[JobModel]:
        return self.repository.get_by_id(job_id)

    def list_jobs(self, status: str = None, recruiter_id: int = None) -> List[JobModel]:
        return self.repository.list(status=status, recruiter_id=recruiter_id)

    def create_job(self, data: dict, recruiter_id: int = None) -> JobModel:
        # Map dictionary data to JobModel
        job = JobModel(
            title=data.get('title'),
            description=data.get('description'),
            requirements=data.get('requirements'),
            location=data.get('location'),
            salary_range=data.get('salary_range'),
            job_type=data.get('job_type'),
            status=data.get('status', 'draft'),
            recruiter_id=recruiter_id,
            created_at=datetime.utcnow()
        )
        return self.repository.add(job)

    def update_job(self, job_id: int, data: dict) -> Optional[JobModel]:
        job = self.repository.get_by_id(job_id)
        if not job:
            return None
        
        # Update fields
        if 'title' in data: job.title = data['title']
        if 'description' in data: job.description = data['description']
        if 'requirements' in data: job.requirements = data['requirements']
        if 'location' in data: job.location = data['location']
        if 'salary_range' in data: job.salary_range = data['salary_range']
        if 'job_type' in data: job.job_type = data['job_type']
        if 'status' in data: job.status = data['status']
        if 'reject_reason' in data: job.reject_reason = data['reject_reason']
        
        job.updated_at = datetime.utcnow()
        return self.repository.update(job)

    def delete_job(self, job_id: int) -> bool:
        return self.repository.delete(job_id)

    def submit_for_review(self, job_id: int) -> Optional[JobModel]:
        return self.update_job(job_id, {'status': 'pending'})
