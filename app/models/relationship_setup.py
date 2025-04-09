"""
This module sets up relationships between models after all models are loaded
to avoid circular import issues.
"""

def setup_relationships():
    """
    Set up relationships for SQLAlchemy models.
    This function should be called after all models have been imported.
    """
    # Import all models here to make sure they are fully defined
    from app.models.user import User, Speciality
    from app.models.project import Project
    from app.models.report import Report
    from app.models.timesheet import Timesheet
    from app.models.vulnerability import Vulnerability
    from app.models.mission import Mission
    from app.models.mission_comment import MissionComment
    from app.models.mission_attachment import MissionAttachment
    from app.models.client import Client
    
    # Log setup completion
    print("All model relationships have been set up successfully.") 