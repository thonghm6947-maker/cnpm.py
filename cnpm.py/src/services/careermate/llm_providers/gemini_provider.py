import os
from typing import List, Dict, Optional
from .base_provider import BaseLLMProvider

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

class GeminiProvider(BaseLLMProvider):
    """
    Google Gemini LLM provider.

    Benefits:
    - High quality responses
    - Free tier available

    Note:
    - Has rate limits on free tier
    - Requires GEMINI_API_KEY
    """

    def __init__(self, api_key: Optional[str] = None, model_name: str = 'gemini-2.0-flash'):
        if not GEMINI_AVAILABLE:
            raise ImportError('google-generativeai not installed. Run: pip install google-generativeai')
        
        self.api_key = api_key or os.environ.get('GEMINI_API_KEY')
        
        if not self.api_key:
            raise ValueError('GEMINI_API_KEY is required')
            
        self.model_name = model_name
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)

    def generate_response(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None, 
        temperature: float = 0.7, 
        max_tokens: int = 2048
    ) -> str:
        full_prompt = prompt
        if system_instruction:
            full_prompt = f"{system_instruction}\n\n{prompt}"

        try:
            generation_config = genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens
            )
            
            response = self.model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")

    def generate_chat_response(
        self, 
        messages: List[Dict[str, str]], 
        system_instruction: Optional[str] = None, 
        temperature: float = 0.7
    ) -> str:
        try:
            if system_instruction:
                model = genai.GenerativeModel(self.model_name, system_instruction=system_instruction)
            else:
                model = self.model
                
            chat = model.start_chat(history=[])
            
            for msg in messages[:-1]:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if role == 'user':
                    chat.send_message(content)
            
            last_message = messages[-1].get('content', '') if messages else ''
            
            generation_config = genai.GenerationConfig(temperature=temperature)
            
            response = chat.send_message(last_message, generation_config=generation_config)
            return response.text
        except Exception as e:
            raise Exception(f"Gemini chat error: {str(e)}")
