from infrastructure.databases.abstract_database import AbstractDatabase
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import Config, DevelopmentConfig
from infrastructure.databases.base import Base

class DatabasePostgres(AbstractDatabase):
    def __init__(self):
        super().__init__()

    def init_database(self):
        Base.metadata.create_all(bind=self.engine)
