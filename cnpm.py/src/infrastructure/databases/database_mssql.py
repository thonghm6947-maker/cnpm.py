from infrastructure.databases.abstract_database import AbstractDatabase
from infrastructure.databases.mssql import session, engine
from infrastructure.databases.base import Base

class DatabaseMSSQL(AbstractDatabase):
    def __init__(self):
        # Do not call super().__init__() as it defaults to SQLite/Postgres via DevelopmentConfig
        self.session = session
        self.engine = engine
        
    def init_database(self, app):
        Base.metadata.create_all(bind=self.engine)