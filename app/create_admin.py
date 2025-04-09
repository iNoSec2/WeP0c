#!/usr/bin/env python3
"""
Create a super admin user (to be used during initial setup)
"""
import argparse
import sys
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.user import UserCreate, Role
from app.crud.crud_user import get_user_by_username, create_user

def create_super_admin(username: str, password: str, email: str = None) -> None:
    """Create a super admin user if it doesn't exist"""
    db = SessionLocal()
    try:
        # Check if user exists
        user = get_user_by_username(db, username=username)
        if user:
            print(f"User '{username}' already exists")
            return
        
        # Create super admin user
        user_data = UserCreate(
            username=username,
            password=password,
            email=email,
            role=Role.SUPER_ADMIN,
            specialities=[]
        )
        
        user = create_user(db=db, user=user_data)
        print(f"Super admin '{username}' created successfully")
        
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="Create super admin user")
    parser.add_argument("--username", help="Admin username", required=True)
    parser.add_argument("--password", help="Admin password", required=True)
    parser.add_argument("--email", help="Admin email (optional)")
    parser.add_argument(
        "--interactive", 
        action="store_true", 
        help="Interactive mode (prompt for credentials)"
    )
    
    args = parser.parse_args()
    
    if args.interactive:
        print("Creating super admin user (interactive mode)")
        username = input("Username: ")
        password = input("Password: ")
        email = input("Email (optional, press Enter to skip): ") or None
    else:
        username = args.username
        password = args.password
        email = args.email
    
    try:
        create_super_admin(username=username, password=password, email=email)
    except Exception as e:
        print(f"Error creating admin: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 