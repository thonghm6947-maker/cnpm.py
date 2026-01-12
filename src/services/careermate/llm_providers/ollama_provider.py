# Ollama Provider - Local LLM (No API limits, runs on your machine)
import requests
from typing import List, Dict, Optional
from .base_provider import BaseLLMProvider


class OllamaProvider(BaseLLMProvider):
    """
    Local LLM provider using Ollama.
    
    Benefits:
    - No API limits
    - No internet required
    - Complete privacy
    
    Requires:
    - Ollama installed: https://ollama.com
    - Model pulled: ollama pull llama3
    """
    
    def __init__(
        self,
        model_name: str = "llama3",
        base_url: str = "http://localhost:11434"
    ):
        self.model_name = model_name
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
    
    def _check_connection(self) -> bool:
        """Check if Ollama is running."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate a single response."""
        full_prompt = prompt
        if system_instruction:
            full_prompt = f"{system_instruction}\n\n{prompt}"
        
        try:
            response = requests.post(
                f"{self.api_url}/generate",
                json={
                    "model": self.model_name,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens
                    }
                },
                timeout=120
            )
            response.raise_for_status()
            return response.json().get("response", "")
        except requests.exceptions.ConnectionError:
            raise Exception("Ollama is not running. Please start Ollama first.")
        except Exception as e:
            raise Exception(f"Ollama error: {str(e)}")
    
    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        temperature: float = 0.7
    ) -> str:
        """Generate chat response with conversation history."""
        # Convert messages to Ollama format
        ollama_messages = []
        
        if system_instruction:
            ollama_messages.append({
                "role": "system",
                "content": system_instruction
            })
        
        for msg in messages:
            role = msg.get("role", "user")
            # Map 'model' to 'assistant' for Ollama
            if role == "model":
                role = "assistant"
            ollama_messages.append({
                "role": role,
                "content": msg.get("content", "")
            })
        
        try:
            response = requests.post(
                f"{self.api_url}/chat",
                json={
                    "model": self.model_name,
                    "messages": ollama_messages,
                    "stream": False,
                    "options": {
                        "temperature": temperature
                    }
                },
                timeout=120
            )
            response.raise_for_status()
            return response.json().get("message", {}).get("content", "")
        except requests.exceptions.ConnectionError:
            raise Exception("Ollama is not running. Please start Ollama first.")
        except Exception as e:
            raise Exception(f"Ollama chat error: {str(e)}")
