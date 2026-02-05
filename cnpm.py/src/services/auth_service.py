from typing import List, Optional
from domain.models.auth import Auth
from domain.models.iauth_repository import IAuthRepository

class AuthService:
    def __init__(self, repository: IAuthRepository):
        self.repository = repository

    def register(self, username: str, password: str, email: str) -> Optional[Auth]:
        if self.repository.check_exist(username):
            return None
        auth = Auth(username=username, password=password, passwordcomfirm=password, email=email)
        return self.repository.register(auth)

    def login(self, username: str, password: str) -> Optional[Auth]:
        auth = Auth(username=username, password=password, passwordcomfirm=password, email='', id=None)
        return self.repository.login(auth)

    def remember_password(self):
        return self.repository.remember_password()

    def look_account(self, Id: int) -> bool:
        return self.repository.look_account(Id)

    def un_look_account(self, course_id: int):
        self.repository.un_look_account(course_id)
        return None

    def check_exist(self, username: str) -> bool:
        return self.repository.check_exist(username)
