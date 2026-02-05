from abc import ABC, abstractmethod
from typing import Optional, List
from domain.models.careermate import User, CandidateProfile, RecruiterProfile

class IUserRepository(ABC):
    """Interface for user repository."""
    @abstractmethod
    def create(self, user: User) -> User:
        pass

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    def email_exists(self, email: str) -> bool:
        pass

    @abstractmethod
    def update(self, user: User) -> User:
        pass

class ICandidateRepository(ABC):
    """Interface for candidate repository."""
    @abstractmethod
    def create(self, profile: CandidateProfile) -> CandidateProfile:
        pass

    @abstractmethod
    def get_by_user_id(self, user_id: int) -> Optional[CandidateProfile]:
        pass

    @abstractmethod
    def update(self, profile: CandidateProfile) -> CandidateProfile:
        pass

class IRecruiterRepository(ABC):
    """Interface for recruiter repository."""
    @abstractmethod
    def create(self, profile: RecruiterProfile) -> RecruiterProfile:
        pass

    @abstractmethod
    def get_by_user_id(self, user_id: int) -> Optional[RecruiterProfile]:
        pass

    @abstractmethod
    def update(self, profile: RecruiterProfile) -> RecruiterProfile:
        pass
