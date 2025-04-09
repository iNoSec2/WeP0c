# app/models/__init__.py
from app.db.base_class import Base

# Import all models in the right order to avoid circular imports
from app.models.user import User, Speciality
from app.models.project import Project
from app.models.report import Report
from app.models.timesheet import Timesheet
from app.models.vulnerability import Vulnerability
from app.models.mission import Mission
from app.models.mission_comment import MissionComment
from app.models.mission_attachment import MissionAttachment
from app.models.client import Client

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

# Set up relationships after all imports are done
from app.models.relationship_setup import setup_relationships
setup_relationships()