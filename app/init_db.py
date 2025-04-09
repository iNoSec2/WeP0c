#!/usr/bin/env python3
"""
Initialize the database schema without creating default users and data.
This script only creates the database tables and ensures the database structure is ready.
"""
import sys
import os
import argparse
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base

def init_db(recreate_tables: bool = False) -> None:
    """Initialize the database schema only"""
    db = SessionLocal()
    try:
        if recreate_tables:
            # Drop all tables and recreate them
            print("Dropping all tables...")
            Base.metadata.drop_all(bind=engine)
        
        print("Creating tables from models...")
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully.")
        
        print("Database schema initialization completed successfully!")
        
    except Exception as e:
        print(f"Error initializing database schema: {e}")
        raise
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="Initialize database schema")
    parser.add_argument(
        "--recreate", 
        action="store_true",
        help="Recreate all tables (WARNING: This will delete ALL existing data!)"
    )
    
    args = parser.parse_args()
    
    try:
        init_db(recreate_tables=args.recreate)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 