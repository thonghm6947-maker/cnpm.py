"""
Script to create an admin user in the database.
Run this script from the project root directory.
"""

import sys
import os
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Enum
from sqlalchemy.orm import sessionmaker, declarative_base
from werkzeug.security import generate_password_hash
import enum

# Get database URL from environment or use default SQLite
DATABASE_URL = os.environ.get('POSTGREE_DATABASE_URL', 'sqlite:///src/careermate.db')

# Define models directly to avoid circular imports
Base = declarative_base()

class UserRole(enum.Enum):
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class CMUserModel(Base):
    """User entity for AI CareerMate platform."""
    __tablename__ = 'cm_users'
    __table_args__ = {'extend_existing': True}

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(512), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CANDIDATE)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def create_admin_user():
    """Create an admin user in the database."""
    
    print(f"Connecting to database: {DATABASE_URL}")
    
    # Create database connection
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Admin credentials - you can change these
    admin_email = "admin@careermate.com"
    admin_password = "admin123"  # Change this to a secure password!
    
    try:
        # Check if admin already exists
        existing_admin = session.query(CMUserModel).filter_by(email=admin_email).first()
        
        if existing_admin:
            print(f"Admin user already exists with email: {admin_email}")
            print(f"User ID: {existing_admin.user_id}")
            print(f"Role: {existing_admin.role}")
            return
        
        # Create new admin user
        admin_user = CMUserModel(
            email=admin_email,
            password_hash=generate_password_hash(admin_password),
            role=UserRole.ADMIN,
            is_active=True
        )
        
        session.add(admin_user)
        session.commit()
        
        print("=" * 50)
        print("Admin user created successfully!")
        print("=" * 50)
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print(f"Role: ADMIN")
        print("=" * 50)
        print("You can now login with these credentials.")
        
    except Exception as e:
        session.rollback()
        print(f"Error creating admin user: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    create_admin_user()
