from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models.user import User, Speciality
from app.models.project import Project
from app.schemas.user import Role, AvailabilityStatus, UserCreate
from app.schemas.project import ProjectCreate, ProjectStatus
from app.core.security import get_password_hash
from app.crud.crud_user import get_user_by_username, create_user
from app.crud.crud_project import create_project

def init_db(recreate_tables: bool = False) -> None:
    """Initialize the database with default users and a project"""
    db = SessionLocal()
    try:
        from app.db.base import Base
        
        if recreate_tables:
            # Drop all tables and recreate them
            print("Dropping all tables...")
            Base.metadata.drop_all(bind=engine)
            print("Creating tables from models...")
            Base.metadata.create_all(bind=engine)
            print("Tables created successfully.")
        else:
            # Just ensure tables exist
            Base.metadata.create_all(bind=engine)
        
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
        super_admin = get_user_by_username(db, username="admin")
        if not super_admin:
            print("Creating super admin user: admin")
            super_admin = create_user(
                db=db,
                user=UserCreate(
                    email="admin@example.com",
                    password="admin123",
                    username="admin",
                    role=Role.SUPER_ADMIN,
                    specialities=[]
                )
            )
        
        # Create client
        client = get_user_by_username(db, username="client")
        if not client:
            print("Creating client user: client")
            client = create_user(
                db=db,
                user=UserCreate(
                    email="client@example.com",
                    password="client123",
                    username="client",
                    role=Role.CLIENT,
                    specialities=[]
                )
            )
        
        # Create pentester
        pentester = get_user_by_username(db, username="pentester")
        if not pentester:
            print("Creating pentester user: pentester")
            pentester = create_user(
                db=db,
                user=UserCreate(
                    email="pentester@example.com",
                    password="pentester123",
                    username="pentester",
                    role=Role.PENTESTER,
                    specialities=["Web Security", "Network Security"]
                )
            )
        
        # Create project
        print("Creating example project...")
        project_name = "Security Assessment Project"
        existing_project = db.query(Project).filter(Project.name == project_name).first()
        if not existing_project:
            project_data = ProjectCreate(
                name=project_name,
                status=ProjectStatus.planning,
                client_id=client.id
            )
            project = create_project(
                db=db, 
                project=project_data, 
                pentester_ids=[pentester.id]
            )
            print(f"Project '{project_name}' created and assigned to client and pentester")
        
        print("Database initialization completed successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating initial data")
    init_db()
    print("Initial data created") 