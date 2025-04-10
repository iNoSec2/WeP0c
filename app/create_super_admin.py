#!/usr/bin/env python3
"""
Script to create a super admin user.
Run this script after deploying the application to create the first admin.
"""
import sys
import os
from sqlalchemy.orm import Session

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.user import User
from app.schemas.user import Role
from app.security import get_password_hash
from app.database import SessionLocal
from app.crud.crud_user import get_user_by_username, get_user_by_email

def create_super_admin(username: str, email: str, password: str):
    """Create a super admin user"""
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_username = get_user_by_username(db, username)
        if existing_username:
            print(f"Error: Username '{username}' already exists!")
            return False
        
        existing_email = get_user_by_email(db, email)
        if existing_email:
            print(f"Error: Email '{email}' already exists!")
            return False
        
        # Create super admin user
        hashed_password = get_password_hash(password)
        admin = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            role=Role.SUPER_ADMIN,
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print(f"Super admin created successfully: {username} ({email})")
        print(f"User ID: {admin.id}")
        return True
    
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_super_admin.py <username> <email> <password>")
        sys.exit(1)
    
    username = sys.argv[1]
    email = sys.argv[2]
    password = sys.argv[3]
    
    if not create_super_admin(username, email, password):
        sys.exit(1) 