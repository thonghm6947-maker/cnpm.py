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
        self.session = session or FactoryDatabase.get_database('POSTGREE').session
    
    def create(self, user: User) -> User:
        """Create a new user."""
        try:
            role_enum = UserRole(user.role)
            new_user = CMUserModel(
                email=user.email,
                password_hash=user.password_hash,
                role=role_enum,
                is_active=user.is_active
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
            password_hash=model.password_hash,
            role=model.role.value,
            is_active=model.is_active,
            created_at=model.created_at
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
                'is_active': u.is_active
            }
            for u in users
        ]


class CandidateRepository(ICandidateRepository):
    """Repository for candidate profile operations."""
    
    def __init__(self, session: Session = None):
        self.session = session or FactoryDatabase.get_database('POSTGREE').session
    
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
        self.session = session or FactoryDatabase.get_database('POSTGREE').session
    
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
        return RecruiterProfile(
            recruiter_id=model.recruiter_id,
            user_id=model.user_id,
            full_name=model.full_name,
            phone=model.phone,
            position=model.position,
            company_id=model.company_id
        )
    
    def update(self, profile: RecruiterProfile) -> RecruiterProfile:
        """Update recruiter profile."""
        model = self.session.query(RecruiterProfileModel).filter_by(user_id=profile.user_id).first()
        if model:
            model.full_name = profile.full_name
            model.phone = profile.phone
            model.position = profile.position
            model.company_id = profile.company_id
            self.session.commit()
        return profile
