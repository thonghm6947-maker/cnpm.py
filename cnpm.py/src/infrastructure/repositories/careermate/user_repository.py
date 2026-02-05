from typing import Optional
from sqlalchemy.orm import Session
from domain.models.careermate import User, CandidateProfile, RecruiterProfile
from domain.models.icareermate_repository import IUserRepository, ICandidateRepository, IRecruiterRepository
from infrastructure.models.careermate.user_model import CMUserModel, UserRole
from infrastructure.models.careermate.candidate_profile_model import CandidateProfileModel
from infrastructure.models.careermate.recruiter_profile_model import RecruiterProfileModel
from infrastructure.databases.factory_database import FactoryDatabase


class UserRepository(IUserRepository):
    """Repository for user operations."""
    
    def __init__(self, session: Session = None):
        self.session = session or FactoryDatabase.get_database('MSSQL').session
    
    def create(self, user: User) -> User:
        """Create a new user."""
        try:
            role_enum = UserRole(user.role)
            new_user = CMUserModel(
                email=user.email,
                password_hash=user.password_hash,
                role=role_enum,
                is_active=user.is_active,
                oauth_provider=user.oauth_provider,
                oauth_id=user.oauth_id
            )
            self.session.add(new_user)
            self.session.commit()
            self.session.refresh(new_user)
            user.user_id = new_user.user_id
            user.created_at = new_user.created_at
            return user
        except Exception as e:
            self.session.rollback()
            raise e
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        user_model = self.session.query(CMUserModel).filter_by(user_id=user_id).first()
        if not user_model:
            return None
        return self._to_domain(user_model)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        user_model = self.session.query(CMUserModel).filter_by(email=email).first()
        if not user_model:
            return None
        return self._to_domain(user_model)
    
    def email_exists(self, email: str) -> bool:
        """Check if email exists."""
        return self.session.query(CMUserModel).filter_by(email=email).first() is not None
    
    def update(self, user: User) -> User:
        """Update user."""
        user_model = self.session.query(CMUserModel).filter_by(user_id=user.user_id).first()
        if user_model:
            user_model.is_active = user.is_active
            self.session.commit()
        return user
    
    def _to_domain(self, model: CMUserModel) -> User:
        """Convert model to domain entity."""
        return User(
            user_id=model.user_id,
            email=model.email,
            role=model.role.value,
            password_hash=model.password_hash,
            is_active=model.is_active,
            created_at=model.created_at,
            oauth_provider=model.oauth_provider,
            oauth_id=model.oauth_id
        )
    
    def get_all(self, role_filter: str = None) -> list:
        """Get all users, optionally filtered by role."""
        query = self.session.query(CMUserModel)
        if role_filter:
            try:
                role_enum = UserRole(role_filter)
                query = query.filter_by(role=role_enum)
            except ValueError:
                pass
        users = query.all()
        return [
            {
                'user_id': u.user_id,
                'email': u.email,
                'role': u.role.value,
                'is_active': u.is_active,
                'created_at': u.created_at.isoformat() if u.created_at else None
            }
            for u in users
        ]
    
    def get_all_with_profiles(self, role_filter: str = None) -> list:
        """Get all users with their full profiles for Admin User Management."""
        from infrastructure.models.careermate.resume_model import ResumeModel
        from infrastructure.models.careermate.job_application_model import JobApplicationModel
        from infrastructure.models.careermate.job_post_model import JobPostModel
        from infrastructure.models.careermate.company_model import CompanyModel
        from infrastructure.models.careermate.candidate_skill_model import CandidateSkillModel
        from infrastructure.models.careermate.skill_model import SkillModel
        
        query = self.session.query(CMUserModel)
        if role_filter:
            try:
                role_enum = UserRole(role_filter)
                query = query.filter_by(role=role_enum)
            except ValueError:
                pass
        
        users = query.all()
        result = []
        
        for user in users:
            user_data = {
                'id': user.user_id,
                'email': user.email,
                'full_name': None,  # Will be filled from profile
                'role': user.role.value,
                'status': 'active' if user.is_active else 'inactive',
                'phone': None,  # Will be filled from profile
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
            
            # Candidate profile
            if user.role == UserRole.CANDIDATE:
                profile = self.session.query(CandidateProfileModel).filter_by(user_id=user.user_id).first()
                if profile:
                    user_data['full_name'] = profile.full_name
                    user_data['phone'] = profile.phone
                    
                    # Get skills
                    skills = self.session.query(SkillModel.name).join(
                        CandidateSkillModel, SkillModel.skill_id == CandidateSkillModel.skill_id
                    ).filter(CandidateSkillModel.candidate_id == profile.candidate_id).all()
                    
                    user_data['candidate_profile'] = {
                        'id': profile.candidate_id,
                        'current_position': None,  # Not in current model
                        'location': None,  # Not in current model
                        'experience_years': None,  # Not in current model
                        'education': None,  # Not in current model
                        'bio': profile.bio,
                        'skills': [s[0] for s in skills],
                        'resume_count': self.session.query(ResumeModel).filter_by(candidate_id=profile.candidate_id).count(),
                        'application_count': self.session.query(JobApplicationModel).filter_by(candidate_id=profile.candidate_id).count()
                    }
            
            # Recruiter profile
            elif user.role == UserRole.RECRUITER:
                profile = self.session.query(RecruiterProfileModel).filter_by(user_id=user.user_id).first()
                if profile:
                    user_data['full_name'] = profile.full_name
                    user_data['phone'] = profile.phone
                    
                    # Get company info
                    company = None
                    if profile.company_id:
                        company = self.session.query(CompanyModel).filter_by(company_id=profile.company_id).first()
                    
                    # Count job posts and applications
                    job_post_count = self.session.query(JobPostModel).filter_by(recruiter_id=profile.recruiter_id).count()
                    total_applications = self.session.query(JobApplicationModel).join(
                        JobPostModel, JobApplicationModel.job_id == JobPostModel.job_id
                    ).filter(JobPostModel.recruiter_id == profile.recruiter_id).count()
                    
                    user_data['recruiter_profile'] = {
                        'id': profile.recruiter_id,
                        'company_name': company.name if company else None,
                        'company_website': company.website if company else None,
                        'company_size': None,  # Not in current model
                        'industry': None,  # Not in current model
                        'location': company.location if company else None,
                        'position': profile.position,
                        'job_post_count': job_post_count,
                        'total_applications_received': total_applications
                    }
            
            result.append(user_data)
        
        return result
    
    def get_user_with_profile(self, user_id: int) -> dict:
        """Get a single user with full profile for Admin."""
        user = self.session.query(CMUserModel).filter_by(user_id=user_id).first()
        if not user:
            return None
        
        # Use the same logic as get_all_with_profiles but for a single user
        users = self.get_all_with_profiles()
        for u in users:
            if u.get('id') == user_id:
                return u
        return None
    
    def update_status(self, user_id: int, is_active: bool) -> bool:
        """Update user active status."""
        user = self.session.query(CMUserModel).filter_by(user_id=user_id).first()
        if not user:
            return False
        
        try:
            user.is_active = is_active
            self.session.commit()
            return True
        except Exception as e:
            self.session.rollback()
            return False


class CandidateRepository(ICandidateRepository):
    """Repository for candidate profile operations."""
    
    def __init__(self, session: Session = None):
        self.session = session or FactoryDatabase.get_database('MSSQL').session
    
    def create(self, profile: CandidateProfile) -> CandidateProfile:
        """Create candidate profile."""
        try:
            new_profile = CandidateProfileModel(
                user_id=profile.user_id,
                full_name=profile.full_name,
                phone=profile.phone,
                bio=profile.bio,
                avatar_url=profile.avatar_url
            )
            self.session.add(new_profile)
            self.session.commit()
            self.session.refresh(new_profile)
            profile.candidate_id = new_profile.candidate_id
            return profile
        except Exception as e:
            self.session.rollback()
            raise e
    
    def get_by_user_id(self, user_id: int) -> Optional[CandidateProfile]:
        """Get candidate profile by user ID."""
        model = self.session.query(CandidateProfileModel).filter_by(user_id=user_id).first()
        if not model:
            return None
        return CandidateProfile(
            candidate_id=model.candidate_id,
            user_id=model.user_id,
            full_name=model.full_name,
            phone=model.phone,
            bio=model.bio,
            avatar_url=model.avatar_url
        )
    
    def update(self, profile: CandidateProfile) -> CandidateProfile:
        """Update candidate profile."""
        model = self.session.query(CandidateProfileModel).filter_by(user_id=profile.user_id).first()
        if model:
            model.full_name = profile.full_name
            model.phone = profile.phone
            model.bio = profile.bio
            model.avatar_url = profile.avatar_url
            self.session.commit()
        return profile


class RecruiterRepository(IRecruiterRepository):
    """Repository for recruiter profile operations."""
    
    def __init__(self, session: Session = None):
        self.session = session or FactoryDatabase.get_database('MSSQL').session
    
    def create(self, profile: RecruiterProfile) -> RecruiterProfile:
        """Create recruiter profile."""
        try:
            new_profile = RecruiterProfileModel(
                user_id=profile.user_id,
                full_name=profile.full_name,
                phone=profile.phone,
                position=profile.position,
                company_id=profile.company_id
            )
            self.session.add(new_profile)
            self.session.commit()
            self.session.refresh(new_profile)
            profile.recruiter_id = new_profile.recruiter_id
            return profile
        except Exception as e:
            self.session.rollback()
            raise e
    
    def get_by_user_id(self, user_id: int) -> Optional[RecruiterProfile]:
        """Get recruiter profile by user ID."""
        model = self.session.query(RecruiterProfileModel).filter_by(user_id=user_id).first()
        if not model:
            return None
        
        # Get user email
        user = self.session.query(CMUserModel).filter_by(user_id=user_id).first()
        email = user.email if user else None
        
        return RecruiterProfile(
            recruiter_id=model.recruiter_id,
            user_id=model.user_id,
            full_name=model.full_name,
            phone=model.phone,
            position=model.position,
            company_id=model.company_id,
            company_name=model.company_name,
            location=model.location,
            website=model.website,
            bio=model.bio,
            email=email,
            avatar_url=None  # Add avatar_url if needed
        )
    
    def update(self, profile: RecruiterProfile) -> RecruiterProfile:
        """Update recruiter profile."""
        model = self.session.query(RecruiterProfileModel).filter_by(user_id=profile.user_id).first()
        if model:
            model.full_name = profile.full_name
            model.phone = profile.phone
            model.position = profile.position
            model.company_id = profile.company_id
            model.company_name = profile.company_name
            model.location = profile.location
            model.website = profile.website
            model.bio = profile.bio
            self.session.commit()
        return profile
