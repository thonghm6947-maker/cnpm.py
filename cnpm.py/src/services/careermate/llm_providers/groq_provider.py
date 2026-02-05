import os
from typing import List, Dict, Optional
from .base_provider import BaseLLMProvider

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

class GroqProvider(BaseLLMProvider):
    """
    Fast cloud LLM provider using Groq.

    Benefits:
    - Extremely fast inference
    - Generous free tier (30 RPM, 6000 RPD)
    - High-quality models (Llama 3, Mixtral)

    Requires:
    - pip install groq
    - GROQ_API_KEY in .env
    """

    def __init__(self, api_key: Optional[str] = None, model_name: str = 'llama-3.3-70b-versatile'):
        if not GROQ_AVAILABLE:
            raise ImportError('Groq library not installed. Run: pip install groq')
        
        self.api_key = api_key or os.environ.get('GROQ_API_KEY')
        
        if not self.api_key:
            raise ValueError('GROQ_API_KEY is required')
            
        self.model_name = model_name
        self.client = Groq(api_key=self.api_key)

    def generate_response(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None, 
        temperature: float = 0.7, 
        max_tokens: int = 2048
    ) -> str:
        messages = []
        if system_instruction:
            messages.append({'role': 'system', 'content': system_instruction})
            
        messages.append({'role': 'user', 'content': prompt})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Groq API error: {str(e)}")

    def generate_chat_response(
        self, 
        messages: List[Dict[str, str]], 
        system_instruction: Optional[str] = None, 
        temperature: float = 0.7
    ) -> str:
        groq_messages = []
        if system_instruction:
            groq_messages.append({'role': 'system', 'content': system_instruction})
            
        for msg in messages:
            role = msg.get('role', 'user')
            if role == 'model':
                role = 'assistant'
            
            groq_messages.append({
                'role': role,
                'content': msg.get('content', '')
            })
            
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=groq_messages,
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Groq chat error: {str(e)}")
