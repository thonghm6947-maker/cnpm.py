import sys
import os
from sqlalchemy import text
sys.path.append(os.path.join(os.getcwd(), 'src'))

from infrastructure.databases.factory_database import FactoryDatabase

try:
    with open('db_dump.txt', 'w') as f:
        db = FactoryDatabase.get_database('POSTGREE')
        session = db.session
        f.write("Connected to DB.\n")

        # Check raw values in job table
        f.write("Checking raw status values in cm_job_posts:\n")
        result = session.execute(text("SELECT DISTINCT status FROM cm_job_posts"))
        for row in result:
            f.write(f"Raw Status: '{row[0]}'\n")

        # Check pg_enum if possible to see what the DB thinks valid values are
        f.write("\nChecking native enum values (if jobstatus exists):\n")
        try:
            # This query works on Postgres
            result = session.execute(text("SELECT enum_range(NULL::jobstatus)"))
            f.write(f"Enum Range: {result.scalar()}\n")
        except Exception as e:
            f.write(f"Could not query enum range: {e}\n")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
