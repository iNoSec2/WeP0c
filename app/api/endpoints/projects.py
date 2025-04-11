from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.core.deps import get_db, get_current_user, require_role
from app.models.user import User
from app.schemas.user import Role
from app.crud import crud_project, crud_user
from app.schemas.project import ProjectCreate, ProjectUpdate, Project
from app.models.project import ProjectStatus
from pydantic import BaseModel


class ProjectAddPentester(BaseModel):
    pentester_id: UUID


router = APIRouter(tags=["projects"])


@router.post("/projects", response_model=Project)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Role.PENTESTER, Role.SUPER_ADMIN])),
):
    """Create a new project with multiple pentesters"""
    # Handle both single pentester_id and multiple pentester_ids
    pentester_ids = []

    # Add single pentester if provided
    if project.pentester_id:
        pentester_ids.append(project.pentester_id)

    # Add multiple pentesters if provided
    if project.pentester_ids:
        pentester_ids.extend(project.pentester_ids)

    # Remove duplicates while preserving order
    pentester_ids = list(dict.fromkeys(pentester_ids))

    # Ensure at least one pentester is assigned
    if not pentester_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one pentester must be assigned to the project",
        )

    # Verify all pentesters exist and are active
    for pentester_id in pentester_ids:
        pentester = crud_user.get_user(db, pentester_id)
        if not pentester or pentester.role != Role.PENTESTER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid pentester ID: {pentester_id}",
            )

    # Create the project with multiple pentesters
    return crud_project.create_project(
        db=db, project=project, pentester_ids=pentester_ids
    )


@router.get("/projects", response_model=List[Project])
async def read_projects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[ProjectStatus] = None,
    current_user=Depends(get_current_user),
):
    """
    Get projects based on user role and optional status filter
    - Pentesters see their assigned projects
    - Clients see their projects
    - Can filter by status if provided
    """
    if status:
        projects = crud_project.get_projects_by_status(
            db, status=status, skip=skip, limit=limit
        )
        # Filter by role access
        if current_user.role == Role.PENTESTER:
            return [
                p
                for p in projects
                if current_user.id in [pentester.id for pentester in p.pentesters]
            ]
        elif current_user.role == Role.CLIENT:
            return [p for p in projects if p.client_id == current_user.id]
        return projects
    else:
        # Return different projects based on role without status filtering
        if current_user.role == Role.PENTESTER:
            return crud_project.get_pentester_projects(
                db, pentester_id=current_user.id, skip=skip, limit=limit
            )
        elif current_user.role == Role.CLIENT:
            return crud_project.get_client_projects(
                db, client_id=current_user.id, skip=skip, limit=limit
            )
        # Admin can see all projects
        return crud_project.get_projects(db, skip=skip, limit=limit)


@router.get("/projects/{project_id}", response_model=Project)
async def read_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get a specific project by ID with permission checks"""
    project = crud_project.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check permissions
    if current_user.role == Role.CLIENT and project.client_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this project"
        )
    elif current_user.role == Role.PENTESTER and current_user.id not in [
        p.id for p in project.pentesters
    ]:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this project"
        )

    return project


@router.patch("/{project_id}", response_model=Project)
async def update_project_details(
    project_id: UUID,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(Role.PENTESTER)),
):
    """Update project details (name, status)"""
    # Check if project exists and user has access
    project = crud_project.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if current user is already assigned to the project
    if current_user.id not in [p.id for p in project.pentesters]:
        raise HTTPException(
            status_code=403, detail="Not authorized to modify this project"
        )

    return crud_project.update_project(
        db, project_id=project_id, project_data=project_update
    )


@router.patch("/{project_id}/status/{status}", response_model=Project)
async def update_project_status(
    project_id: UUID,
    status: ProjectStatus,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(Role.PENTESTER)),
):
    """Update just the project status"""
    # Check if project exists and user has access
    project = crud_project.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if current user is already assigned to the project
    if current_user.id not in [p.id for p in project.pentesters]:
        raise HTTPException(
            status_code=403, detail="Not authorized to modify this project"
        )

    return crud_project.update_project_status(db, project_id=project_id, status=status)


@router.post("/{project_id}/pentesters", response_model=Project)
async def add_pentester_to_project(
    project_id: UUID,
    pentester_data: ProjectAddPentester,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(Role.PENTESTER)
    ),  # Only existing pentesters can add others
):
    """Add a pentester to a project"""
    # Check if project exists and user has access
    project = crud_project.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if current user is already assigned to the project
    if current_user.id not in [p.id for p in project.pentesters]:
        raise HTTPException(
            status_code=403, detail="Not authorized to modify this project"
        )

    # Add the new pentester
    return crud_project.add_pentester_to_project(
        db=db, project_id=project_id, pentester_id=pentester_data.pentester_id
    )


@router.delete("/{project_id}/pentesters/{pentester_id}", response_model=Project)
async def remove_pentester_from_project(
    project_id: UUID,
    pentester_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(Role.PENTESTER)),
):
    """Remove a pentester from a project"""
    # Check if project exists and user has access
    project = crud_project.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if current user is already assigned to the project
    if current_user.id not in [p.id for p in project.pentesters]:
        raise HTTPException(
            status_code=403, detail="Not authorized to modify this project"
        )

    # Cannot remove the last pentester
    if len(project.pentesters) <= 1:
        raise HTTPException(
            status_code=400, detail="Cannot remove the last pentester from a project"
        )

    # Remove the pentester
    return crud_project.remove_pentester_from_project(
        db=db, project_id=project_id, pentester_id=pentester_id
    )
