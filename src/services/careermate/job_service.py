from typing import Optional, List, Tuple
from infrastructure.models.careermate.job_post_model import JobPostModel, JobStatus
from infrastructure.models.careermate.job_application_model import JobApplicationModel


class JobService:
    """Service for job operations."""
    
    def __init__(self, job_repository, application_repository):
        self.job_repo = job_repository
        self.app_repo = application_repository
    
    def list_jobs(self, page: int, per_page: int, search: str = '', location: str = '') -> Tuple[List, int]:
        """List jobs with filters and pagination."""
        return self.job_repo.list_jobs(page, per_page, search, location)
    
    def get_job_by_id(self, job_id: int) -> Optional[JobPostModel]:
        """Get job by ID."""
        return self.job_repo.get_by_id(job_id)
    
    def create_job(self, recruiter_user_id: int, data: dict) -> Optional[JobPostModel]:
        """Create a new job post."""
        recruiter = self.job_repo.get_recruiter_by_user_id(recruiter_user_id)
        if not recruiter:
            return None
        
        job = JobPostModel(
            recruiter_id=recruiter.recruiter_id,
            company_id=recruiter.company_id,
            title=data.get('title'),
            description=data.get('description'),
            salary_min=data.get('salary_min'),
            salary_max=data.get('salary_max'),
            location=data.get('location'),
            job_type=data.get('job_type'),
            deadline=data.get('deadline'),
            status=JobStatus.DRAFT
        )
        
        return self.job_repo.create(job)
    
    def update_job(self, job_id: int, user_id: int, data: dict) -> Optional[JobPostModel]:
        """Update a job post."""
        job = self.job_repo.get_by_id(job_id)
        if not job:
            return None
        
        recruiter = self.job_repo.get_recruiter_by_user_id(user_id)
        if not recruiter or job.recruiter_id != recruiter.recruiter_id:
            return None
        
        # Handle status update specially
        if 'status' in data:
            status_val = data['status']
            if isinstance(status_val, str):
                try:
                    # Try to convert string to Enum member
                    # Try by value first (e.g. "pending")
                    data['status'] = JobStatus(status_val.lower())
                except ValueError:
                    try:
                        # Try by name (e.g. "PENDING")
                        data['status'] = JobStatus[status_val.upper()]
                    except KeyError:
                        # Invalid status string, let model validation handle it or ignore
                        pass

        for key, value in data.items():
            if hasattr(job, key) and value is not None:
                setattr(job, key, value)
        
        try:
            return self.job_repo.update(job)
        except Exception as e:
            import traceback
            with open('error_log.txt', 'w') as f:
                f.write(traceback.format_exc())
            raise e
    
    def delete_job(self, job_id: int, user_id: int) -> bool:
        """Delete a job post. Owner can delete any job regardless of status."""
        job = self.job_repo.get_by_id(job_id)
        if not job:
            return False
        
        recruiter = self.job_repo.get_recruiter_by_user_id(user_id)
        if not recruiter or job.recruiter_id != recruiter.recruiter_id:
            return False
        
        return self.job_repo.delete(job_id)
    
    def apply_for_job(
        self,
        job_id: int,
        candidate_user_id: int,
        resume_id: Optional[int] = None,
        cover_letter: Optional[str] = None
    ) -> Optional[JobApplicationModel]:
        """Apply for a job."""
        candidate = self.app_repo.get_candidate_by_user_id(candidate_user_id)
        if not candidate:
            return None
        
        application = JobApplicationModel(
            job_id=job_id,
            candidate_id=candidate.candidate_id,
            resume_id=resume_id,
            cover_letter=cover_letter
        )
        
        return self.app_repo.create(application)
    
    def get_user_applications(self, user_id: int) -> List[JobApplicationModel]:
        """Get user's applications."""
        candidate = self.app_repo.get_candidate_by_user_id(user_id)
        if not candidate:
            return []
        return self.app_repo.get_by_candidate(candidate.candidate_id)
    
    def get_recruiter_applications(self, recruiter_id: int) -> List[JobApplicationModel]:
        """Get applications for recruiter's jobs."""
        # Get all jobs by this recruiter
        jobs = self.job_repo.get_by_recruiter(recruiter_id)
        if not jobs:
            return []
        
        # Get applications for each job
        all_applications = []
        for job in jobs:
            apps = self.app_repo.get_by_job(job.job_id)
            if apps:
                all_applications.extend(apps)
        
        return all_applications
    
    def get_saved_jobs(self, user_id: int) -> List[JobPostModel]:
        """Get user's saved jobs."""
        from infrastructure.repositories.careermate.job_repository import SavedJobRepository
        saved_repo = SavedJobRepository()
        candidate = self.app_repo.get_candidate_by_user_id(user_id)
        if not candidate:
            return []
        return saved_repo.get_saved_jobs(candidate.candidate_id)
    
    def save_job(self, job_id: int, user_id: int) -> bool:
        """Save a job."""
        from infrastructure.repositories.careermate.job_repository import SavedJobRepository
        saved_repo = SavedJobRepository()
        candidate = self.app_repo.get_candidate_by_user_id(user_id)
        if not candidate:
            return False
        saved_repo.save_job(candidate.candidate_id, job_id)
        return True
    
    def unsave_job(self, job_id: int, user_id: int) -> bool:
        """Remove saved job."""
        from infrastructure.repositories.careermate.job_repository import SavedJobRepository
        saved_repo = SavedJobRepository()
        candidate = self.app_repo.get_candidate_by_user_id(user_id)
        if not candidate:
            return False
        return saved_repo.unsave_job(candidate.candidate_id, job_id)
