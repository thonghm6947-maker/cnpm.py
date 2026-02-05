import os
import typing
from typing import Optional
from .base_provider import BaseLLMProvider

def get_llm_provider(provider_name: Optional[str] = None, **kwargs) -> BaseLLMProvider:
    if not provider_name:
        provider_name = os.environ.get('LLM_PROVIDER', 'gemini').lower()
        
    if provider_name == 'ollama':
        from . import ollama_provider
        
        model = kwargs.get('model') or os.environ.get('OLLAMA_MODEL', 'llama3')
        base_url = kwargs.get('base_url') or os.environ.get('OLLAMA_URL', 'http://localhost:11434')
        
        return ollama_provider.OllamaProvider(model_name=model, base_url=base_url)
        
    if provider_name == 'groq':
        from . import groq_provider
        
        api_key = kwargs.get('api_key') or os.environ.get('GROQ_API_KEY')
        model = kwargs.get('model') or os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile')
        
        return groq_provider.GroqProvider(api_key=api_key, model_name=model)
        
    if provider_name == 'gemini':
        from . import gemini_provider
        
        api_key = kwargs.get('api_key') or os.environ.get('GEMINI_API_KEY')
        model = kwargs.get('model') or os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash')
        
        return gemini_provider.GeminiProvider(api_key=api_key, model_name=model)
        
    raise ValueError(f"Unknown LLM provider: {provider_name}. Use 'ollama', 'groq', or 'gemini'.")

def get_available_providers() -> list:
    available = []
    
    try:
        import requests
        response = requests.get('http://localhost:11434/api/tags', timeout=1)
        if response.status_code == 200:
            available.append('ollama')
    except:
        pass
        
    if os.environ.get('GROQ_API_KEY'):
        available.append('groq')
        
    if os.environ.get('GEMINI_API_KEY'):
        available.append('gemini')
        
    return available
