from typing import Optional
from domain.models.careermate import CandidateProfile, RecruiterProfile
from domain.models.icareermate_repository import ICandidateRepository, IRecruiterRepository


class ProfileService:
    """Service for profile operations."""
    
    def __init__(
        self,
        candidate_repository: ICandidateRepository,
        recruiter_repository: IRecruiterRepository
    ):
        self.candidate_repo = candidate_repository
        self.recruiter_repo = recruiter_repository
    
    def get_candidate_profile(self, user_id: int) -> Optional[CandidateProfile]:
        """Get candidate profile by user ID."""
        return self.candidate_repo.get_by_user_id(user_id)
    
    def update_candidate_profile(self, user_id: int, data: dict) -> Optional[CandidateProfile]:
        """Update candidate profile."""
        profile = self.candidate_repo.get_by_user_id(user_id)
        if not profile:
            return None
        
        if 'full_name' in data:
            profile.full_name = data['full_name']
        if 'phone' in data:
            profile.phone = data['phone']
        if 'bio' in data:
            profile.bio = data['bio']
        if 'avatar_url' in data:
            profile.avatar_url = data['avatar_url']
        
        return self.candidate_repo.update(profile)
    
    def get_recruiter_profile(self, user_id: int) -> Optional[RecruiterProfile]:
        """Get recruiter profile by user ID."""
        return self.recruiter_repo.get_by_user_id(user_id)
    
    def update_recruiter_profile(self, user_id: int, data: dict) -> Optional[RecruiterProfile]:
        """Update recruiter profile."""
        profile = self.recruiter_repo.get_by_user_id(user_id)
        if not profile:
            return None
        
        if 'full_name' in data:
            profile.full_name = data['full_name']
        if 'phone' in data:
            profile.phone = data['phone']
        if 'position' in data:
            profile.position = data['position']
        if 'company_id' in data:
            profile.company_id = data['company_id']
        if 'company_name' in data:
            profile.company_name = data['company_name']
        if 'location' in data:
            profile.location = data['location']
        if 'website' in data:
            profile.website = data['website']
        if 'bio' in data:
            profile.bio = data['bio']
        
        return self.recruiter_repo.update(profile)

