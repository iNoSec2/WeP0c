# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa

# Import all models here that should be included in migrations
from app.models.user import User, Speciality
from app.models.project import Project
from app.models.vulnerability import Vulnerability
from app.models.mission import Mission, Client, MissionComment, MissionAttachment
from app.models.report import Report
from app.models.timesheet import Timesheet

# Import association tables
from app.models.mission import mission_pentesters
from app.models.user import project_pentesters, pentester_specialities

# Set extend_existing=True for all tables to avoid the "Table already defined" error
for table in Base.metadata.tables.values():
    table.extend_existing = True 