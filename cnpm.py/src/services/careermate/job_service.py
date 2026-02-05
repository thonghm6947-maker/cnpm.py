from typing import Optional, List, Tuple
from infrastructure.models.careermate.job_post_model import JobPostModel, JobStatus
from infrastructure.models.careermate.job_application_model import JobApplicationModel


class JobService:
    """Service for job operations."""
    
    def __init__(self, job_repository, application_repository):
        self.job_repo = job_repository
        self.app_repo = application_repository
    
    def list_jobs(self, page: int, per_page: int, search: str = '', location: str = '', status: str = 'approved') -> Tuple[List, int]:
        """List jobs with filters and pagination."""
        return self.job_repo.list_jobs(page, per_page, search, location, status)
    
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
            salary_range=data.get('salary_range'),  # Store the text description
            company_name=data.get('company_name'),  # Store the company name
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
    
    def check_existing_application(self, job_id: int, user_id: int) -> bool:
        """Check if user has already applied for this job."""
        candidate = self.app_repo.get_candidate_by_user_id(user_id)
        if not candidate:
            return False
        return self.app_repo.has_applied(candidate.candidate_id, job_id)
    
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
    
    def get_recruiter_applications_with_details(self, recruiter_id: int) -> List[dict]:
        """Get applications for recruiter's jobs with full candidate details."""
        from infrastructure.models.careermate.candidate_profile_model import CandidateProfileModel
        from infrastructure.models.careermate.user_model import CMUserModel
        from infrastructure.models.careermate.skill_model import SkillModel
        from infrastructure.models.careermate.candidate_skill_model import CandidateSkillModel
        
        jobs = self.job_repo.get_by_recruiter(recruiter_id)
        if not jobs:
            return []
        
        job_dict = {job.job_id: job for job in jobs}
        all_applications = []
        
        for job in jobs:
            apps = self.app_repo.get_by_job(job.job_id)
            if apps:
                for app in apps:
                    # Get candidate profile
                    candidate = self.app_repo.session.query(CandidateProfileModel).filter_by(
                        candidate_id=app.candidate_id
                    ).first()
                    
                    if not candidate:
                        continue
                    
                    # Get user info
                    user = self.app_repo.session.query(CMUserModel).filter_by(
                        user_id=candidate.user_id
                    ).first()
                    
                    # Get skills
                    skills = []
                    try:
                        skill_query = self.app_repo.session.query(SkillModel.name).join(
                            CandidateSkillModel,
                            CandidateSkillModel.skill_id == SkillModel.skill_id
                        ).filter(CandidateSkillModel.candidate_id == candidate.candidate_id)
                        skills = [s[0] for s in skill_query.all()]
                    except Exception:
                        skills = []
                    
                    app_data = {
                        'application_id': app.app_id,
                        'candidate_id': app.candidate_id,
                        'job_id': app.job_id,
                        'candidate_name': candidate.full_name if candidate else 'Unknown',
                        'candidate_email': user.email if user else '',
                        'candidate_phone': candidate.phone if candidate else '',
                        'candidate_location': getattr(candidate, 'location', '') if candidate else '',
                        'candidate_experience': getattr(candidate, 'experience_years', '') if candidate else '',
                        'candidate_education': getattr(candidate, 'education', '') if candidate else '',
                        'candidate_skills': skills,
                        'candidate_summary': candidate.bio if candidate else '',
                        'cover_letter': app.cover_letter or '',
                        'resume_url': f'/api/resumes/download/{app.resume_id}' if app.resume_id else None,
                        'job_title': job_dict.get(app.job_id).title if app.job_id in job_dict else '',
                        'status': app.status.value if hasattr(app.status, 'value') else str(app.status),
                        'match_score': 0,  # Can implement AI matching later
                        'applied_at': app.applied_at.isoformat() if app.applied_at else None
                    }
                    all_applications.append(app_data)
        
        return all_applications
    
    def update_application_status(self, application_id: int, recruiter_id: int, new_status: str, notes: str = '') -> Optional[dict]:
        """Update application status with verification that recruiter owns the job."""
        # Get job IDs for this recruiter
        jobs = self.job_repo.get_by_recruiter(recruiter_id)
        if not jobs:
            return None
        
        job_ids = [job.job_id for job in jobs]
        
        # Get and verify application belongs to recruiter's job
        application = self.app_repo.get_by_id(application_id)
        if not application or application.job_id not in job_ids:
            return None
        
        # Update status
        success = self.app_repo.update_status_with_notes(application_id, new_status, notes)
        if not success:
            return None
        
        # Return updated application
        application = self.app_repo.get_by_id(application_id)
        return {
            'application_id': application.app_id,
            'job_id': application.job_id,
            'status': application.status.value if hasattr(application.status, 'value') else str(application.status),
            'notes': notes
        }
    
    def delete_application(self, application_id: int, recruiter_id: int) -> dict:
        """Delete an application with verification that recruiter owns the job.
        
        Returns:
            dict with 'success' and 'error' keys
        """
        # Get job IDs for this recruiter
        jobs = self.job_repo.get_by_recruiter(recruiter_id)
        if not jobs:
            return {'success': False, 'error': 'No jobs found for this recruiter'}
        
        job_ids = [job.job_id for job in jobs]
        
        # Get and verify application exists and belongs to recruiter's job
        application = self.app_repo.get_by_id(application_id)
        if not application:
            return {'success': False, 'error': 'Application not found', 'status_code': 404}
        
        if application.job_id not in job_ids:
            return {'success': False, 'error': 'You do not have permission to delete this application', 'status_code': 403}
        
        # Delete application
        success = self.app_repo.delete(application_id)
        if success:
            return {'success': True, 'message': 'Application deleted successfully'}
        else:
            return {'success': False, 'error': 'Failed to delete application', 'status_code': 500}
    
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
