from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Project).offset(skip).limit(limit).all()

def create_project(db: Session, project: ProjectCreate, owner_id: int):
    db_project = Project(**project.dict(), client_id=owner_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project