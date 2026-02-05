from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from config import Config
from infrastructure.databases.base import Base

# Database configuration - use the static method
DATABASE_URI = Config.DATABASE_URI
engine = create_engine(DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Use scoped_session for thread-safe session management
session_factory = scoped_session(SessionLocal)

# For backwards compatibility, create a session property
# But prefer using get_session() for new code
session = session_factory()

def get_session():
    """Get a new session. Caller is responsible for closing it."""
    return SessionLocal()

def init_mssql(app):
    Base.metadata.create_all(bind=engine)
    
    # Register teardown to remove scoped session at end of request
    @app.teardown_appcontext
    def remove_session(exception=None):
        session_factory.remove()