from infrastructure.databases.abstract_database import AbstractDatabase
from infrastructure.databases.mssql import session, engine
from infrastructure.databases.base import Base

class DatabaseMSSQL(AbstractDatabase):
    def __init__(self):
        self.session = session
        self.engine = engine

    def init_database(self):
        Base.metadata.create_all(bind=self.engine)