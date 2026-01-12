# LLM Factory - Creates the appropriate LLM provider based on configuration
import os
from typing import Optional
from .base_provider import BaseLLMProvider


def get_llm_provider(
    provider_name: Optional[str] = None,
    **kwargs
) -> BaseLLMProvider:
    """
    Factory function to create an LLM provider.
    
    Args:
        provider_name: "ollama", "groq", or "gemini"
        **kwargs: Provider-specific configuration
        
    Returns:
        Configured LLM provider instance
    """
    # Get provider from environment if not specified
    if not provider_name:
        provider_name = os.environ.get("LLM_PROVIDER", "gemini").lower()
    
    if provider_name == "ollama":
        from .ollama_provider import OllamaProvider
        model = kwargs.get("model") or os.environ.get("OLLAMA_MODEL", "llama3")
        base_url = kwargs.get("base_url") or os.environ.get("OLLAMA_URL", "http://localhost:11434")
        return OllamaProvider(model_name=model, base_url=base_url)
    
    elif provider_name == "groq":
        from .groq_provider import GroqProvider
        api_key = kwargs.get("api_key") or os.environ.get("GROQ_API_KEY")
        model = kwargs.get("model") or os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
        return GroqProvider(api_key=api_key, model_name=model)
    
    elif provider_name == "gemini":
        from .gemini_provider import GeminiProvider
        api_key = kwargs.get("api_key") or os.environ.get("GEMINI_API_KEY")
        model = kwargs.get("model") or os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
        return GeminiProvider(api_key=api_key, model_name=model)
    
    else:
        raise ValueError(f"Unknown LLM provider: {provider_name}. Use 'ollama', 'groq', or 'gemini'.")


def get_available_providers() -> list:
    """Return list of available providers based on configuration."""
    available = []
    
    # Check Ollama
    try:
        import requests
        response = requests.get("http://localhost:11434/api/tags", timeout=1)
        if response.status_code == 200:
            available.append("ollama")
    except:
        pass
    
    # Check Groq
    if os.environ.get("GROQ_API_KEY"):
        available.append("groq")
    
    # Check Gemini
    if os.environ.get("GEMINI_API_KEY"):
        available.append("gemini")
    
    return available
