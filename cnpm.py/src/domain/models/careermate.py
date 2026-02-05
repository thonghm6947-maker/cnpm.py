from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class User:
    """User domain entity."""
    email: str
    role: str
    password_hash: Optional[str] = None
    user_id: Optional[int] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    oauth_provider: Optional[str] = None
    oauth_id: Optional[str] = None

@dataclass
class CandidateProfile:
    """Candidate profile domain entity."""
    user_id: int
    full_name: str
    candidate_id: Optional[int] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

@dataclass
class RecruiterProfile:
    """Recruiter profile domain entity."""
    user_id: int
    full_name: str
    recruiter_id: Optional[int] = None
    company_id: Optional[int] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    bio: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None

@dataclass
class Company:
    """Company domain entity."""
    name: str
    company_id: Optional[int] = None
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    location: Optional[str] = None
