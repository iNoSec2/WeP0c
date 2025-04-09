from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.deps import get_db, get_current_user, require_role
from app.models.user import User
from app.schemas.user import Role
from app.models.project import Project, ProjectStatus
from app.models.vulnerability import Vulnerability
from typing import Dict, List, Any
from app.crud import crud_project, crud_vulnerability, crud_user

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics based on user role"""
    
    # Base query for projects
    projects_query = db.query(Project)
    
    # Filter projects based on user role
    if current_user.role == Role.client:
        projects_query = projects_query.filter(Project.client_id == current_user.id)
    elif current_user.role == Role.PENTESTER:
        projects_query = projects_query.filter(Project.pentesters.any(id=current_user.id))
    
    # Get project statistics
    total_projects = projects_query.count()
    projects_by_status = db.query(
        Project.status,
        func.count(Project.id).label('count')
    ).filter(Project.id.in_([p.id for p in projects_query.all()]))\
     .group_by(Project.status).all()
    
    # Get vulnerability statistics
    vulnerabilities_query = db.query(Vulnerability)\
        .join(Project)\
        .filter(Project.id.in_([p.id for p in projects_query.all()]))
    
    total_vulnerabilities = vulnerabilities_query.count()
    
    # Format the response
    stats = {
        "projects": {
            "total": total_projects,
            "by_status": {
                status.value: count for status, count in projects_by_status
            }
        },
        "vulnerabilities": {
            "total": total_vulnerabilities
        }
    }
    
    # Add role-specific stats
    if current_user.role == Role.SUPER_ADMIN:
        # Add user counts for admin
        stats["users"] = {
            "total": db.query(User).count(),
            "by_role": {
                role.value: db.query(User).filter(User.role == role).count()
                for role in Role
            }
        }
    
    return stats 