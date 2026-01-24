
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv('src/.env')
api_key = os.environ.get('GEMINI_API_KEY')
print(f"Key found: {bool(api_key)}")

if api_key:
    genai.configure(api_key=api_key)
    try:
        print("Available models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"Error: {e}")
