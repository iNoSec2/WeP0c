from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.models.project import Project, ProjectStatus
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate

def get_projects(db: Session, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get all projects with pagination"""
    return db.query(Project).offset(skip).limit(limit).all()

def get_project(db: Session, project_id: UUID) -> Optional[Project]:
    """Get a specific project by ID"""
    return db.query(Project).filter(Project.id == project_id).first()

def get_client_projects(db: Session, client_id: UUID, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get all projects for a specific client"""
    return db.query(Project).filter(Project.client_id == client_id).offset(skip).limit(limit).all()

def get_pentester_projects(db: Session, pentester_id: UUID, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get all projects a pentester is assigned to"""
    return (db.query(Project)
            .filter(Project.pentesters.any(id=pentester_id))
            .offset(skip)
            .limit(limit)
            .all())

def get_projects_by_status(db: Session, status: ProjectStatus, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get all projects with a specific status"""
    return db.query(Project).filter(Project.status == status).offset(skip).limit(limit).all()

def create_project(db: Session, project: ProjectCreate, pentester_ids: List[UUID] = None) -> Project:
    """Create a new project with initial pentester assignments"""
    # Create the project
    db_project = Project(
        name=project.name,
        client_id=project.client_id,
        status=project.status
    )
    db.add(db_project)
    db.flush()  # Flush to get the ID but don't commit yet
    
    # Add the pentesters to the project
    if pentester_ids:
        for pentester_id in pentester_ids:
            pentester = db.query(User).filter(User.id == pentester_id).first()
            if pentester:
                db_project.pentesters.append(pentester)
    
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: UUID, project_data: ProjectUpdate) -> Optional[Project]:
    """Update an existing project"""
    db_project = get_project(db, project_id)
    if not db_project:
        return None
    
    # Update attributes
    for key, value in project_data.dict(exclude_unset=True).items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project_status(db: Session, project_id: UUID, status: ProjectStatus) -> Optional[Project]:
    """Update a project's status"""
    return update_project(db, project_id, ProjectUpdate(status=status))

def add_pentester_to_project(db: Session, project_id: UUID, pentester_id: UUID) -> Project:
    """Add a pentester to an existing project"""
    # Get the project and pentester
    project = get_project(db, project_id)
    pentester = db.query(User).filter(User.id == pentester_id).first()
    
    if not project or not pentester:
        return None
    
    # Add the pentester if not already assigned
    if pentester not in project.pentesters:
        project.pentesters.append(pentester)
        db.commit()
        db.refresh(project)
    
    return project

def remove_pentester_from_project(db: Session, project_id: UUID, pentester_id: UUID) -> Project:
    """Remove a pentester from a project"""
    # Get the project
    project = get_project(db, project_id)
    if not project:
        return None
    
    # Find the pentester in the project's pentesters
    pentester = next((p for p in project.pentesters if p.id == pentester_id), None)
    if pentester:
        project.pentesters.remove(pentester)
        db.commit()
        db.refresh(project)
    
    return project