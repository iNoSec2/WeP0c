from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.deps import get_db, get_current_user, require_role
from app.models.user import User
from app.schemas.user import Role
from app.models.project import Project, ProjectStatus
from app.models.vulnerability import Vulnerability, VulnerabilitySeverity
from app.models.mission import Mission, MissionStatus
from typing import Dict, List, Any
from app.crud import crud_project, crud_vulnerability, crud_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard")

@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics based on user role"""

    # Base query for projects
    projects_query = db.query(Project)

    # Filter projects based on user role
    if current_user.role == Role.CLIENT:
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

    # Get critical vulnerabilities count
    critical_vulnerabilities = vulnerabilities_query.filter(
        Vulnerability.severity == VulnerabilitySeverity.critical
    ).count()

    # Get pentest (mission) statistics
    missions_query = db.query(Mission)

    # Filter missions based on user role
    if current_user.role == Role.CLIENT:
        missions_query = missions_query.join(Project).filter(Project.client_id == current_user.id)
    elif current_user.role == Role.PENTESTER:
        missions_query = missions_query.filter(Mission.pentesters.any(id=current_user.id))

    total_pentests = missions_query.count()

    # Get recent activities (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    # Recent vulnerabilities
    recent_vulnerabilities = db.query(Vulnerability)\
        .filter(Vulnerability.created_at >= thirty_days_ago)\
        .order_by(desc(Vulnerability.created_at))\
        .limit(5).all()

    # Recent projects
    recent_projects = db.query(Project)\
        .filter(Project.created_at >= thirty_days_ago)\
        .order_by(desc(Project.created_at))\
        .limit(5).all()

    # Recent missions
    recent_missions = db.query(Mission)\
        .filter(Mission.created_at >= thirty_days_ago)\
        .order_by(desc(Mission.created_at))\
        .limit(5).all()

    # Combine recent activities
    recent_activities = []

    for vuln in recent_vulnerabilities:
        recent_activities.append({
            "id": str(vuln.id),
            "type": "vulnerability",
            "description": f"New vulnerability: {vuln.title}",
            "timestamp": vuln.created_at.isoformat(),
            "status": vuln.status.value if hasattr(vuln, 'status') and vuln.status else "open"
        })

    for project in recent_projects:
        recent_activities.append({
            "id": str(project.id),
            "type": "project",
            "description": f"Project created: {project.name}",
            "timestamp": project.created_at.isoformat(),
            "status": project.status.value if hasattr(project, 'status') and project.status else "planned"
        })

    for mission in recent_missions:
        recent_activities.append({
            "id": str(mission.id),
            "type": "pentest",
            "description": f"Pentest {mission.name} {mission.status.value if hasattr(mission, 'status') and mission.status else 'created'}",
            "timestamp": mission.created_at.isoformat(),
            "status": mission.status.value if hasattr(mission, 'status') and mission.status else "in_progress"
        })

    # Sort activities by timestamp (newest first)
    recent_activities.sort(key=lambda x: x["timestamp"], reverse=True)

    # Format the response to match frontend expectations
    stats = {
        "totalProjects": total_projects,
        "totalPentests": total_pentests,
        "totalVulnerabilities": total_vulnerabilities,
        "criticalVulnerabilities": critical_vulnerabilities,
        "recentActivities": recent_activities[:10],  # Limit to 10 most recent activities
        "projects": {
            "total": total_projects,
            "by_status": {
                status.value: count for status, count in projects_by_status
            }
        },
        "vulnerabilities": {
            "total": total_vulnerabilities,
            "critical": critical_vulnerabilities
        }
    }

    # Add role-specific stats
    if current_user.role in [Role.SUPER_ADMIN, Role.ADMIN]:
        # Add user counts for admin
        total_users = db.query(User).count()
        stats["totalUsers"] = total_users
        stats["users"] = {
            "total": total_users,
            "by_role": {
                role.value: db.query(User).filter(User.role == role).count()
                for role in Role
            }
        }

    return stats