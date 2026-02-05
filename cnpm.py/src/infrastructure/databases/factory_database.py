from infrastructure.databases.abstract_database import AbstractDatabase
from infrastructure.databases.database_mssql import DatabaseMSSQL
from infrastructure.databases.database_postgres import DatabasePostgres

class FactoryDatabase:
    @staticmethod
    def get_database(database_type) -> AbstractDatabase:
        if database_type == 'MSSQL':
            return DatabaseMSSQL()
        elif database_type == 'POSTGREE':
            return DatabasePostgres()
        else:
            raise ValueError(f'Unsupported database type: {database_type}')
