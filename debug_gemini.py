
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env
load_dotenv('src/.env')
api_key = os.environ.get('GEMINI_API_KEY')

with open('gemini_debug_output.txt', 'w') as f:
    f.write(f"API Key present: {bool(api_key)}\n")
    if api_key:
        f.write(f"API Key prefix: {api_key[:5]}...\n")
        try:
            genai.configure(api_key=api_key)
            f.write("Attempting to list models...\n")
            for m in genai.list_models():
                f.write(f"Model: {m.name}\n")
                f.write(f"Supported methods: {m.supported_generation_methods}\n")
        except Exception as e:
            f.write(f"Error listing models: {e}\n")
            import traceback
            f.write(traceback.format_exc())
    else:
        f.write("No API Key found in env.\n")
