# Base LLM Provider - Abstract interface for all LLM providers
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
        """Generate a single response from the model."""
        pass
    
    @abstractmethod
    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        temperature: float = 0.7
    ) -> str:
        """Generate response in a multi-turn conversation."""
        pass
    
    def get_provider_name(self) -> str:
        """Return the provider name."""
        return self.__class__.__name__
