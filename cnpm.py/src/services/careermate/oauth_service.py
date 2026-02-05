from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from flask import current_app, url_for
import jwt
import secrets

from domain.models.careermate import User, CandidateProfile, RecruiterProfile
from infrastructure.repositories.careermate.user_repository import (
    UserRepository, CandidateRepository, RecruiterRepository
)
from infrastructure.models.careermate.user_model import CMUserModel, UserRole
from infrastructure.databases.factory_database import FactoryDatabase


# Google OAuth 2.0 endpoints
GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'


class OAuthService:
    """Service for handling OAuth authentication."""
    
    def __init__(
        self,
        user_repository: UserRepository = None,
        candidate_repository: CandidateRepository = None,
        recruiter_repository: RecruiterRepository = None,
        secret_key: str = None
    ):
        self.user_repo = user_repository or UserRepository()
        self.candidate_repo = candidate_repository or CandidateRepository()
        self.recruiter_repo = recruiter_repository or RecruiterRepository()
        self.secret_key = secret_key or 'careermate_default_secret_key_123'
    
    def get_google_auth_url(self, role: str = 'candidate') -> Dict[str, str]:
        """
        Generate Google OAuth authorization URL.
        
        Args:
            role: The role for the user (candidate/recruiter)
            
        Returns:
            Dict with 'auth_url' and 'state'
        """
        client_id = current_app.config.get('GOOGLE_CLIENT_ID')
        redirect_uri = current_app.config.get('GOOGLE_REDIRECT_URI')
        
        if not client_id:
            raise ValueError("GOOGLE_CLIENT_ID not configured")
        
        # Generate state parameter (include role info)
        state = f"{secrets.token_urlsafe(32)}|{role}"
        
        # Build authorization URL manually
        from urllib.parse import urlencode
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'scope': 'openid email profile',
            'response_type': 'code',
            'state': state,
            'access_type': 'offline',
            'prompt': 'consent'
        }
        auth_url = f"{GOOGLE_AUTHORIZE_URL}?{urlencode(params)}"
        
        return {
            'auth_url': auth_url,
            'state': state
        }
    
    def handle_google_callback(self, code: str, state: str) -> Optional[Dict[str, Any]]:
        """
        Handle Google OAuth callback.
        
        Args:
            code: Authorization code from Google
            state: State parameter (contains role info)
            
        Returns:
            Dict with user info and JWT token, or None if failed
        """
        client_id = current_app.config.get('GOOGLE_CLIENT_ID')
        client_secret = current_app.config.get('GOOGLE_CLIENT_SECRET')
        redirect_uri = current_app.config.get('GOOGLE_REDIRECT_URI')
        
        if not client_id or not client_secret:
            raise ValueError("Google OAuth credentials not configured")
        
        # Extract role from state
        role = 'candidate'
        if state and '|' in state:
            _, role = state.rsplit('|', 1)
        if role not in ['candidate', 'recruiter']:
            role = 'candidate'
        
        try:
            import httpx
            
            # Exchange code for token
            token_data = {
                'client_id': client_id,
                'client_secret': client_secret,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': redirect_uri
            }
            
            with httpx.Client() as client:
                # Get access token
                token_response = client.post(GOOGLE_TOKEN_URL, data=token_data)
                
                if token_response.status_code != 200:
                    print(f"Failed to get token: {token_response.status_code} - {token_response.text}")
                    return None
                
                token = token_response.json()
                access_token = token.get('access_token')
                
                if not access_token:
                    print("No access token in response")
                    return None
                
                # Get user info from Google
                headers = {'Authorization': f'Bearer {access_token}'}
                user_response = client.get(GOOGLE_USERINFO_URL, headers=headers)
                
                if user_response.status_code != 200:
                    print(f"Failed to get user info: {user_response.status_code} - {user_response.text}")
                    return None
                
                google_user = user_response.json()
            
            # Login or register the OAuth user
            return self.login_or_register_oauth_user(google_user, role)
            
        except Exception as e:
            print(f"OAuth callback error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def login_or_register_oauth_user(
        self, 
        oauth_user_info: Dict[str, Any], 
        role: str
    ) -> Optional[Dict[str, Any]]:
        """
        Login existing OAuth user or register new user.
        
        Args:
            oauth_user_info: User info from Google
            role: User role (candidate/recruiter)
            
        Returns:
            Dict with access_token and user info
        """
        email = oauth_user_info.get('email')
        google_id = oauth_user_info.get('sub')  # Google's unique user ID
        full_name = oauth_user_info.get('name', email.split('@')[0])
        picture = oauth_user_info.get('picture')
        
        if not email or not google_id:
            return None
        
        # Check if user exists by Google ID
        session = FactoryDatabase.get_database('MSSQL').session
        existing_user = session.query(CMUserModel).filter_by(
            oauth_provider='google',
            oauth_id=google_id
        ).first()
        
        if existing_user:
            # User exists, generate JWT and return
            return self._generate_auth_response(existing_user)
        
        # Check if user exists by email (link accounts)
        existing_email_user = session.query(CMUserModel).filter_by(email=email).first()
        
        if existing_email_user:
            # Link Google account to existing user
            existing_email_user.oauth_provider = 'google'
            existing_email_user.oauth_id = google_id
            session.commit()
            return self._generate_auth_response(existing_email_user)
        
        # Create new user
        try:
            role_enum = UserRole(role)
        except ValueError:
            role_enum = UserRole.CANDIDATE
        
        new_user = CMUserModel(
            email=email,
            password_hash=None,  # OAuth users don't have password
            role=role_enum,
            is_active=True,
            oauth_provider='google',
            oauth_id=google_id
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        # Create profile based on role
        if role == 'candidate':
            profile = CandidateProfile(
                user_id=new_user.user_id,
                full_name=full_name,
                avatar_url=picture
            )
            self.candidate_repo.create(profile)
        elif role == 'recruiter':
            profile = RecruiterProfile(
                user_id=new_user.user_id,
                full_name=full_name
            )
            self.recruiter_repo.create(profile)
        
        return self._generate_auth_response(new_user)
    
    def _generate_auth_response(self, user: CMUserModel) -> Dict[str, Any]:
        """Generate JWT token and auth response."""
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
                'is_active': user.is_active,
                'oauth_provider': user.oauth_provider
            }
        }


def get_oauth_service() -> OAuthService:
    """Factory function to get OAuth service instance."""
    secret_key = current_app.config.get('SECRET_KEY')
    if not secret_key or not isinstance(secret_key, str):
        secret_key = 'careermate_default_secret_key_123'
    
    return OAuthService(
        user_repository=UserRepository(),
        candidate_repository=CandidateRepository(),
        recruiter_repository=RecruiterRepository(),
        secret_key=secret_key
    )
