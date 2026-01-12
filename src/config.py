# Configuration settings for the Flask application

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from same directory as this config file
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

class FactoryConfig:
    """Factory to get configuration based on environment."""
    @staticmethod
    def get_config(env: str):
        if env == 'development':
            return DevelopmentConfig
        elif env == 'testing':
            return TestingConfig
        elif env == 'production':
            return ProductionConfig
        else:
            return Config

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a_default_secret_key'
    DEBUG = os.environ.get('DEBUG', 'False').lower() in ['true', '1']
    TESTING = os.environ.get('TESTING', 'False').lower() in ['true', '1']
    DATABASE_URI = os.environ.get('DATABASE_URI') or 'mssql+pymssql://sa:Aa%40123456@127.0.0.1:1433/DemoFlaskApi'
    CORS_HEADERS = 'Content-Type'
    
    # Gemini AI Configuration
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash')
    
    # Multi-LLM Provider Configuration
    LLM_PROVIDER = os.environ.get('LLM_PROVIDER', 'ollama')  # ollama, groq, or gemini
    
    # Ollama (Local) - No limits
    OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'llama3')
    OLLAMA_URL = os.environ.get('OLLAMA_URL', 'http://localhost:11434')
    
    # Groq (Cloud) - Fast with generous limits
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    GROQ_MODEL = os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile')

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    # Use SQLite for development (no external database needed)
    DATABASE_URI = os.environ.get('POSTGREE_DATABASE_URL') or 'sqlite:///careermate.db'


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DATABASE_URI = os.environ.get('DATABASE_URI') or 'mssql+pymssql://sa:Aa%40123456@127.0.0.1:1433/DemoFlaskApi'


class ProductionConfig(Config):
    """Production configuration."""
    DATABASE_URI = os.environ.get('DATABASE_URI') or 'mssql+pymssql://sa:Aa%40123456@127.0.0.1:1433/DemoFlaskApi'

    
template = {
    "swagger": "2.0",
    "info": {
        "title": "Todo API",
        "description": "API for managing todos",
        "version": "1.0.0"
    },
    "basePath": "/",
    "schemes": [
        "http",
        "https"
    ],
    "consumes": [
        "application/json"
    ],
    "produces": [
        "application/json"
    ]
}
class SwaggerConfig:
    """Swagger configuration."""
    template = {
        "swagger": "2.0",
        "info": {
            "title": "Todo API",
            "description": "API for managing todos",
            "version": "1.0.0"
        },
        "basePath": "/",
        "schemes": [
            "http",
            "https"
        ],
        "consumes": [
            "application/json"
        ],
        "produces": [
            "application/json"
        ]
    }

    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/docs"
    }