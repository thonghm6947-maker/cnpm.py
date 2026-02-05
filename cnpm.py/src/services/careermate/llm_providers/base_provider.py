from abc import ABC, abstractmethod
from typing import List, Dict, Optional

class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def generate_response(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None, 
        temperature: float = 0.7, 
        max_tokens: int = 2048
    ) -> str:
        pass

    @abstractmethod
    def generate_chat_response(
        self, 
        messages: List[Dict[str, str]], 
        system_instruction: Optional[str] = None, 
        temperature: float = 0.7
    ) -> str:
        pass

    def get_provider_name(self) -> str:
        return self.__class__.__name__
