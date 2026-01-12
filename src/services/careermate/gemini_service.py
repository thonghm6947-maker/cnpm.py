# Gemini AI Service - Base service for Google Generative AI
import os
import google.generativeai as genai
from typing import List, Dict, Optional
from config import Config


class GeminiService:
    """Base service for interacting with Google Gemini AI."""
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        """Initialize Gemini client."""
        self.api_key = api_key or Config.GEMINI_API_KEY
        self.model_name = 'gemini-flash-latest'  # Try different model with separate quota
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is required. Set it in environment variables.")
        
        # Configure the API
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)
    
    def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """
        Generate a single response from the model.
        
        Args:
            prompt: The user prompt/query
            system_instruction: Optional system instruction for context
            temperature: Creativity level (0.0-1.0)
            max_tokens: Maximum tokens in response
            
        Returns:
            Generated text response
        """
        try:
            # Combine system instruction and prompt if provided
            full_prompt = prompt
            if system_instruction:
                full_prompt = f"{system_instruction}\n\n{prompt}"
            
            generation_config = genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            
            response = self.model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            
            return response.text
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise Exception(f"Gemini API error: {str(e)}")
    
    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        temperature: float = 0.7
    ) -> str:
        """
        Generate response in a multi-turn conversation.
        
        Args:
            messages: List of message dicts with 'role' ('user'/'model') and 'content'
            system_instruction: Optional system instruction for context
            temperature: Creativity level (0.0-1.0)
            
        Returns:
            Generated text response
        """
        try:
            # Create model with system instruction if provided
            if system_instruction:
                model = genai.GenerativeModel(
                    self.model_name,
                    system_instruction=system_instruction
                )
            else:
                model = self.model
            
            # Start a chat session
            chat = model.start_chat(history=[])
            
            # Add conversation history
            for msg in messages[:-1]:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                
                if role == 'user':
                    chat.send_message(content)
                # Model responses are automatically added to history
            
            # Send the last message and get response
            last_message = messages[-1].get('content', '') if messages else ''
            
            generation_config = genai.GenerationConfig(
                temperature=temperature,
            )
            
            response = chat.send_message(
                last_message,
                generation_config=generation_config
            )
            
            return response.text
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise Exception(f"Gemini chat error: {str(e)}")
    
    def generate_json_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.3
    ) -> str:
        """
        Generate a JSON-formatted response.
        
        Args:
            prompt: The user prompt/query
            system_instruction: Optional system instruction
            temperature: Lower for more consistent JSON output
            
        Returns:
            JSON string response
        """
        json_instruction = (
            "You must respond ONLY with valid JSON. "
            "Do not include any text before or after the JSON. "
            "Do not use markdown code blocks."
        )
        
        full_instruction = f"{json_instruction}\n\n{system_instruction}" if system_instruction else json_instruction
        
        return self.generate_response(
            prompt=prompt,
            system_instruction=full_instruction,
            temperature=temperature
        )
