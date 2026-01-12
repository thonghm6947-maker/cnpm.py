# CareerMate Domain Models
from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class User:
    """User domain entity."""
    email: str
    password_hash: str
    role: str  # candidate, recruiter, admin
    user_id: Optional[int] = None
    is_active: bool = True
    created_at: Optional[datetime] = None


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


@dataclass
class Company:
    """Company domain entity."""
    name: str
    company_id: Optional[int] = None
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    location: Optional[str] = None
