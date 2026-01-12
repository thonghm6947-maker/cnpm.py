from typing import Optional
from datetime import datetime, timedelta
from domain.models.careermate import User, CandidateProfile, RecruiterProfile
from domain.models.icareermate_repository import IUserRepository, ICandidateRepository, IRecruiterRepository
from werkzeug.security import generate_password_hash, check_password_hash
import jwt


class AuthService:
    """Service for authentication operations."""
    
    def __init__(
        self,
        user_repository: IUserRepository,
        candidate_repository: ICandidateRepository,
        recruiter_repository: IRecruiterRepository,
        secret_key: str = 'your_secret_key'
    ):
        self.user_repo = user_repository
        self.candidate_repo = candidate_repository
        self.recruiter_repo = recruiter_repository
        self.secret_key = secret_key
    
    def register(
        self,
        email: str,
        password: str,
        role: str,
        full_name: str,
        phone: Optional[str] = None,
        company_id: Optional[int] = None
    ) -> Optional[User]:
        """Register a new user with profile."""
        # Check if email exists
        if self.user_repo.email_exists(email):
            return None
        
        # Hash password
        password_hash = generate_password_hash(password)
        
        # Create user
        user = User(
            email=email,
            password_hash=password_hash,
            role=role
        )
        created_user = self.user_repo.create(user)
        
        # Create profile based on role
        if role == 'candidate':
            profile = CandidateProfile(
                user_id=created_user.user_id,
                full_name=full_name,
                phone=phone
            )
            self.candidate_repo.create(profile)
        elif role == 'recruiter':
            profile = RecruiterProfile(
                user_id=created_user.user_id,
                full_name=full_name,
                phone=phone,
                company_id=company_id
            )
            self.recruiter_repo.create(profile)
        
        return created_user
    
    def login(self, email: str, password: str) -> Optional[dict]:
        """Login user and return tokens."""
        user = self.user_repo.get_by_email(email)
        
        if not user:
            return None
        
        if not check_password_hash(user.password_hash, password):
            return None
        
        if not user.is_active:
            return None
        
        # Generate JWT token
        # Convert role Enum to string
        role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
        
        payload = {
            'user_id': user.user_id,
            'email': user.email,
            'role': role_str,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        token = jwt.encode(payload, self.secret_key, algorithm='HS256')
        
        return {
            'access_token': token,
            'token_type': 'Bearer',
            'user': {
                'user_id': user.user_id,
                'email': user.email,
                'role': role_str,
                'is_active': user.is_active
            }
        }
    
    def get_current_user(self, token: str) -> Optional[User]:
        """Get current user from token."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            user_id = payload.get('user_id')
            return self.user_repo.get_by_id(user_id)
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def verify_token(self, token: str) -> Optional[dict]:
        """Verify JWT token and return payload."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except:
            return None
