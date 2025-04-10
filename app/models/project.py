from sqlalchemy import Column, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base
import uuid
import enum
from datetime import datetime

class ProjectStatus(str, enum.Enum):
    planning = "planning"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

# TODO : make id an uuid 

class Project(Base):
    __tablename__ = "projects"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, index=True, nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(Enum(ProjectStatus), default=ProjectStatus.planning, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    client = relationship("User", back_populates="client_projects", foreign_keys=[client_id])
    vulnerabilities = relationship("Vulnerability", back_populates="project")
    timesheets = relationship("Timesheet", back_populates="project")
    reports = relationship("Report", back_populates="project")
    missions = relationship("Mission", back_populates="project")
    
    # Many-to-many relationship with pentesters
    pentesters = relationship("User", secondary="project_pentesters", back_populates="pentester_projects")