from abc import ABC, abstractmethod
from typing import List, Optional
from .todo import Todo

class ITodoRepository(ABC):
    @abstractmethod
    def add(self, todo: Todo) -> Todo:
        pass

    @abstractmethod
    def get_by_id(self, todo_id: int) -> Optional[Todo]:
        pass

    @abstractmethod
    def list(self) -> List[Todo]:
        pass

    @abstractmethod
    def update(self, todo: Todo) -> Todo:
        pass

    @abstractmethod
    def delete(self, todo_id: int) -> None:
        pass
