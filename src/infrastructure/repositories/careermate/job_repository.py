from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from infrastructure.models.careermate.job_post_model import JobPostModel, JobStatus
from infrastructure.models.careermate.job_application_model import JobApplicationModel, ApplicationStatus
from infrastructure.models.careermate.saved_job_model import SavedJobModel
from infrastructure.models.careermate.recruiter_profile_model import RecruiterProfileModel
from infrastructure.models.careermate.candidate_profile_model import CandidateProfileModel
from infrastructure.databases.factory_database import FactoryDatabase


class JobRepository:
    """Repository for job post operations."""
    
    def __init__(self, session: Session = None):
        self.session = session or FactoryDatabase.get_database('POSTGREE').session
    
    def list_jobs(self, page: int, per_page: int, search: str = '', location: str = '') -> Tuple[List, int]:
        """List jobs with pagination and filters."""
        # Allow both OPEN and APPROVED for compatibility
        query = self.session.query(JobPostModel).filter(
            JobPostModel.status.in_([JobStatus.OPEN, JobStatus.APPROVED])
        )
        
        if search:
            query = query.filter(JobPostModel.title.ilike(f'%{search}%'))
        if location:
            query = query.filter(JobPostModel.location.ilike(f'%{location}%'))
        
        total = query.count()
        jobs = query.offset((page - 1) * per_page).limit(per_page).all()
        
        return jobs, total
    
    def get_by_id(self, job_id: int) -> Optional[JobPostModel]:
        """Get job by ID."""
        return self.session.query(JobPostModel).filter_by(job_id=job_id).first()
    
    def create(self, job: JobPostModel) -> JobPostModel:
        """Create a new job post."""
        try:
            self.session.add(job)
            self.session.commit()
            self.session.refresh(job)
            return job
        except Exception as e:
            self.session.rollback()
            raise e
    
    def update(self, job: JobPostModel) -> JobPostModel:
        """Update job post."""
        try:
            self.session.commit()
            return job
        except Exception as e:
            self.session.rollback()
            raise e
    
    def delete(self, job_id: int) -> bool:
        """Delete job post."""
        job = self.get_by_id(job_id)
        if job:
            self.session.delete(job)
            self.session.commit()
            return True
        return False
    
    def get_by_recruiter(self, recruiter_id: int) -> List:
        """Get jobs by recruiter ID."""
        return self.session.query(JobPostModel).filter_by(recruiter_id=recruiter_id).all()
    
    def get_by_status(self, status: JobStatus) -> List:
        """Get jobs by status."""
        # Handle both enum and string values
        status_value = status.value if hasattr(status, 'value') else status
        return self.session.query(JobPostModel).filter_by(status=status_value).all()
    
    def get_all(self) -> List:
        """Get all jobs."""
        return self.session.query(JobPostModel).all()
    
    def get_recruiter_by_user_id(self, user_id: int) -> Optional[RecruiterProfileModel]:
        """Get recruiter profile by user ID."""
        return self.session.query(RecruiterProfileModel).filter_by(user_id=user_id).first()


class ApplicationRepository:
    """Repository for job application operations."""
    
    def __init__(self, session: Session = None):
        self.session = session or FactoryDatabase.get_database('POSTGREE').session
    
    def create(self, application: JobApplicationModel) -> JobApplicationModel:
        """Create a new application."""
        try:
            self.session.add(application)
            self.session.commit()
            self.session.refresh(application)
            return application
        except Exception as e:
            self.session.rollback()
            raise e
    
    def get_by_candidate(self, candidate_id: int) -> List[JobApplicationModel]:
        """Get applications by candidate ID."""
        return self.session.query(JobApplicationModel).filter_by(candidate_id=candidate_id).all()
    
    def get_by_job(self, job_id: int) -> List[JobApplicationModel]:
        """Get applications by job ID."""
        return self.session.query(JobApplicationModel).filter_by(job_id=job_id).all()
    
    def get_candidate_by_user_id(self, user_id: int) -> Optional[CandidateProfileModel]:
        """Get candidate profile by user ID."""
        return self.session.query(CandidateProfileModel).filter_by(user_id=user_id).first()
    
    def update_status(self, app_id: int, status: ApplicationStatus) -> bool:
        """Update application status."""
        app = self.session.query(JobApplicationModel).filter_by(app_id=app_id).first()
        if app:
            app.status = status
            try:
                self.session.commit()
                return True
            except Exception:
                self.session.rollback()
                raise
        return False


class SavedJobRepository:
    """Repository for saved jobs."""
    
    def __init__(self, session: Session = None):
        self.session = session or FactoryDatabase.get_database('POSTGREE').session
    
    def save_job(self, candidate_id: int, job_id: int) -> SavedJobModel:
        """Save a job."""
        saved = SavedJobModel(candidate_id=candidate_id, job_id=job_id)
        self.session.add(saved)
        self.session.commit()
        return saved
    
    def unsave_job(self, candidate_id: int, job_id: int) -> bool:
        """Remove saved job."""
        saved = self.session.query(SavedJobModel).filter_by(
            candidate_id=candidate_id, job_id=job_id
        ).first()
        if saved:
            self.session.delete(saved)
            self.session.commit()
            return True
        return False
    
    def get_saved_jobs(self, candidate_id: int) -> List[JobPostModel]:
        """Get saved jobs by candidate."""
        saved = self.session.query(SavedJobModel).filter_by(candidate_id=candidate_id).all()
        job_ids = [s.job_id for s in saved]
        if job_ids:
            return self.session.query(JobPostModel).filter(JobPostModel.job_id.in_(job_ids)).all()
        return []
