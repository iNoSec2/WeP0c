# app/models/__init__.py
from app.db.base_class import Base

# Import all models here
from app.models.user import User, Speciality
from app.models.project import Project
from app.models.vulnerability import Vulnerability
from app.models.timesheet import Timesheet
from app.models.report import Report
from app.models.mission import Mission, Client, MissionComment, MissionAttachment

# Export all models
__all__ = [
    "Base", 
    "User",
    "Speciality",
    "Project",
    "Vulnerability",
    "Timesheet",
    "Report",
    "Mission",
    "Client",
    "MissionComment",
    "MissionAttachment"
]