
import os
import google.generativeai as genai
from config import Config

# Force load env if not loaded
from dotenv import load_dotenv
from pathlib import Path
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    # Try reading directly from .env file if os.environ fails (sometimes Windows env handling is tricky)
    print("Trying to read .env manually...")
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('GEMINI_API_KEY='):
                api_key = line.strip().split('=', 1)[1]
                break

if not api_key:
    print("ERROR: GEMINI_API_KEY not found in environment or .env file")
    exit(1)

print(f"Using API Key: {api_key[:5]}...{api_key[-3:]}")

genai.configure(api_key=api_key)

print("\nListing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
