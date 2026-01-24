

from infrastructure.databases.abstract_database import AbstractDatabase
# import psycopg2  # Commented out - not needed for SQLite
# from psycopg2 import sql
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import Config, DevelopmentConfig
from infrastructure.databases.base import Base

class DatabasePostgres(AbstractDatabase):
    def __init__(self):
        super().__init__()
        
    def init_database(self, app):
        Base.metadata.create_all(bind=self.engine)