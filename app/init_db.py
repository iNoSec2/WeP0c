#!/usr/bin/env python3
"""
Initialize the database with default users and a project.
This script creates:
1. A super admin user
2. A client user
3. A pentester user
4. A project associated with the client and pentester
"""
import sys
import os
import argparse
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import declarative_base
from app.db.session import SessionLocal, engine
from app.schemas.user import UserCreate, Role, AvailabilityStatus
from app.schemas.project import ProjectCreate, ProjectStatus
from app.crud.crud_user import create_user, get_user_by_username
from app.crud.crud_project import create_project
from app.models.user import Speciality
from app.models.project import Project
from app.db.base import Base

def init_db(recreate_tables: bool = False) -> None:
    """Initialize the database with default data"""
    db = SessionLocal()
    try:
        if recreate_tables:
            # Drop all tables and recreate them
            print("Dropping all tables...")
            Base.metadata.drop_all(bind=engine)
            print("Creating tables from models...")
            Base.metadata.create_all(bind=engine)
            print("Tables created successfully.")
        
        # Create specialities
        print("Creating specialties...")
        specialities = []
        for spec in ["Web Security", "Mobile Security", "Network Security", "Cloud Security"]:
            speciality = db.query(Speciality).filter(Speciality.name == spec).first()
            if not speciality:
                speciality = Speciality(
                    name=spec,
                    description=f"Expertise in {spec.lower()} testing and assessments",
                    category=spec.split()[0].lower()
                )
                db.add(speciality)
                db.commit()
                db.refresh(speciality)
            specialities.append(speciality)
        
        # Create super admin
        admin_username = "admin"
        admin = get_user_by_username(db, username=admin_username)
        if not admin:
            print(f"Creating super admin user: {admin_username}")
            admin_data = UserCreate(
                username=admin_username,
                password="adminpassword",
                email="admin@p0cit.com",
                role=Role.SUPER_ADMIN,
                full_name="System Administrator",
                specialities=[]
            )
            admin = create_user(db=db, user=admin_data)
        
        # Create client
        client_username = "client"
        client = get_user_by_username(db, username=client_username)
        if not client:
            print(f"Creating client user: {client_username}")
            client_data = UserCreate(
                username=client_username,
                password="clientpassword",
                email="client@example.com",
                role=Role.CLIENT,
                full_name="Example Client",
                company="Example Corp",
                bio="A company seeking security testing services",
                specialities=[]
            )
            client = create_user(db=db, user=client_data)
        
        # Create pentester
        pentester_username = "pentester"
        pentester = get_user_by_username(db, username=pentester_username)
        if not pentester:
            print(f"Creating pentester user: {pentester_username}")
            pentester_data = UserCreate(
                username=pentester_username,
                password="pentesterpassword",
                email="pentester@p0cit.com",
                role=Role.PENTESTER,
                full_name="Example Pentester",
                bio="Security professional with expertise in vulnerability assessment",
                hourly_rate=150.0,
                availability_status=AvailabilityStatus.AVAILABLE,
                years_of_experience=5,
                certifications=["OSCP", "CEH", "CISSP"],
                tools_expertise=["Burp Suite", "Metasploit", "Nmap", "OWASP ZAP"],
                methodology_expertise=["OWASP Top 10", "PTES", "NIST"],
                specialities=[spec.id for spec in specialities]
            )
            pentester = create_user(db=db, user=pentester_data)
        
        # Create project
        print("Creating example project...")
        project_name = "Security Assessment Project"
        existing_project = db.query(Project).filter(Project.name == project_name).first()
        if not existing_project:
            project_data = ProjectCreate(
                name=project_name,
                status=ProjectStatus.planning
            )
            project = create_project(
                db=db, 
                project=project_data, 
                client_id=client.id,
                pentester_ids=[pentester.id]
            )
            print(f"Project '{project_name}' created and assigned to client and pentester")
        
        print("Database initialization completed successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="Initialize database with default data")
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