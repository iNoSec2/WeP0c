#!/usr/bin/env python3
"""
Script to completely reset the database and recreate all tables from models.
WARNING: This will delete ALL data in the database!
"""
import sys
import os
import time
import argparse

from app.db.session import engine
from app.db.base import Base

def reset_database(no_confirmation: bool = False):
    """Drop all tables and recreate them from the models"""
    
    if not no_confirmation:
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
    print("Run: python -m app.create_super_admin <username> <email> <password>")

def main():
    parser = argparse.ArgumentParser(description="Reset database and recreate schema")
    parser.add_argument(
        "--force", 
        action="store_true",
        help="Skip confirmation countdown (dangerous!)"
    )
    
    args = parser.parse_args()
    
    try:
        reset_database(no_confirmation=args.force)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 