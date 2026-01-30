from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import Config
from infrastructure.databases.base import Base

# Database configuration - use the static method
DATABASE_URI = Config.get_database_uri()
engine = create_engine(DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

def init_mssql(app):
    Base.metadata.create_all(bind=engine)