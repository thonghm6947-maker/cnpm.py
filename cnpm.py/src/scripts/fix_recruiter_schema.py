import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect

# Add the src directory to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def fix_schema():
    load_dotenv()
    
    mssql_uri = os.environ.get('MSSQL_DATABASE_URL')
    if not mssql_uri:
        print("Error: MSSQL_DATABASE_URL environment variable is not set.")
        return

    print(f"Connecting to MSSQL...")
    engine = create_engine(mssql_uri)
    
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('cm_recruiter_profiles')]
    print(f"Current columns: {columns}")

    with engine.connect() as connection:
        # Add location
        if 'location' not in columns:
            print("Adding 'location' column...")
            connection.execute(text("ALTER TABLE cm_recruiter_profiles ADD location VARCHAR(255) NULL"))
        
        # Add website
        if 'website' not in columns:
            print("Adding 'website' column...")
            connection.execute(text("ALTER TABLE cm_recruiter_profiles ADD website VARCHAR(500) NULL"))
            
        # Add bio
        if 'bio' not in columns:
            print("Adding 'bio' column...")
            connection.execute(text("ALTER TABLE cm_recruiter_profiles ADD bio VARCHAR(1000) NULL"))

        # Add company_name
        if 'company_name' not in columns:
            print("Adding 'company_name' column...")
            connection.execute(text("ALTER TABLE cm_recruiter_profiles ADD company_name VARCHAR(255) NULL"))
            
        connection.commit()
        print("Schema update completed successfully.")

if __name__ == "__main__":
    fix_schema()
