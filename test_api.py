import google.generativeai as genai

# Hardcode the key for testing
API_KEY = "AIzaSyB6x4d7gFfFhQcjil14Qt0MBKK-ZZC_5_4"

genai.configure(api_key=API_KEY)

print("Listing available models...")
try:
    for m in genai.list_models():
        print(f"Model: {m.name}")
        print(f"  Methods: {m.supported_generation_methods}")
        print()
except Exception as e:
    print(f"Error: {e}")

print("\n--- Testing direct generation ---")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Say hello in one word")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Generation Error: {e}")
