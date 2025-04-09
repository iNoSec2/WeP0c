#!/usr/bin/env python3
"""
Script to completely reset the database and recreate all tables from models.
WARNING: This will delete ALL data in the database!
"""
import sys
import os
import time

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.db.base_class import Base
from app.database import engine
from app.models.user import User, PentesterSpeciality
from app.models.project import Project
from app.models.vulnerability import Vulnerability
from sqlalchemy import text

def reset_database():
    """Drop all tables and recreate them from the models"""
    
    print("WARNING: This will delete ALL data in the database!")
    print("You have 5 seconds to cancel (Ctrl+C)...")
    
    # Countdown
    for i in range(5, 0, -1):
        print(f"{i}...")
        time.sleep(1)
    
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped.")
    
    print("Creating new tables from models...")
    Base.metadata.create_all(bind=engine)
    print("Database reset complete!")
    
    print("\nNote: You'll need to create a super admin user now.")
    print("Run: ./create_admin.sh <username> <email> <password>")

if __name__ == "__main__":
    reset_database() 