from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.project import Project, ProjectCreate
from app.crud import crud_project
from app.core.deps import get_db, require_role
from app.models.user import Role

router = APIRouter()

@router.post("/projects/create", response_model=Project)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(Role.pentester))
):
    return crud_project.create_project(db=db, project=project, owner_id=current_user.id)

@router.get("/projects", response_model=list[Project])
def read_projects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(require_role(Role.pentester))
):
    projects = crud_project.get_projects(db, skip=skip, limit=limit)
    return projects