from sqlalchemy import Boolean, Column, Integer, String, Enum, Table, ForeignKey, ARRAY, DateTime, JSON, Float, Text
from sqlalchemy.orm import relationship, registry
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base_class import Base
import uuid
from datetime import datetime
from app.schemas.user import Role, AvailabilityStatus

# Configure SQLAlchemy to use string names for models
# Simplified configuration compatible with older SQLAlchemy versions
mapper_registry = registry()

# Many-to-many association table for project pentesters
project_pentesters = Table(
    "project_pentesters",
    Base.metadata,
    Column("project_id", UUID(as_uuid=True), ForeignKey("projects.id")),
    Column("pentester_id", UUID(as_uuid=True), ForeignKey("users.id"))
)

# Many-to-many association table for pentester specialities
pentester_specialities = Table(
    "pentester_specialities",
    Base.metadata,
    Column("pentester_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
    Column("speciality_id", UUID(as_uuid=True), ForeignKey("specialities.id"), primary_key=True),
    Column("level", String),  # e.g., "expert", "intermediate", "beginner"
    extend_existing=True
)

# Many-to-many association table for mission pentesters
mission_pentesters = Table(
    "mission_pentesters",
    Base.metadata,
    Column("mission_id", UUID(as_uuid=True), ForeignKey("missions.id"), primary_key=True),
    Column("pentester_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
)

class Speciality(Base):
    __tablename__ = "specialities"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    category = Column(String)  # e.g., "web", "mobile", "network", etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    pentesters = relationship("User", secondary=pentester_specialities, back_populates="specialities")

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(Enum(Role, name="role", create_constraint=True, native_enum=False), nullable=False)
    full_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    preferences = Column(JSON, nullable=True)
    theme = Column(String, default="light", nullable=True)
    notification_settings = Column(JSON, nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Pentester-specific fields
    hourly_rate = Column(Float, nullable=True)
    availability_status = Column(Enum(AvailabilityStatus, name="availability_status", create_constraint=True, native_enum=False), nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    certifications = Column(ARRAY(String), nullable=True)
    tools_expertise = Column(ARRAY(String), nullable=True)
    methodology_expertise = Column(ARRAY(String), nullable=True)

    # Relationships
    specialities = relationship("Speciality", secondary=pentester_specialities, back_populates="pentesters")
    timesheets = relationship("Timesheet", back_populates="pentester")
    reports = relationship("Report", back_populates="author")
    mission_comments = relationship("MissionComment", back_populates="user", foreign_keys="[MissionComment.user_id]")
    mission_attachments = relationship("MissionAttachment", back_populates="author", foreign_keys="[MissionAttachment.author_id]")
    client_projects = relationship("Project", back_populates="client", 
                                  foreign_keys="[Project.client_id]")
    pentester_projects = relationship("Project", secondary=project_pentesters, 
                                     back_populates="pentesters")
    missions = relationship("Mission", secondary=mission_pentesters, back_populates="pentesters")
    discovered_vulnerabilities = relationship("Vulnerability", 
                                             foreign_keys="[Vulnerability.discovered_by]", 
                                             back_populates="discoverer")
    fixed_vulnerabilities = relationship("Vulnerability", 
                                        foreign_keys="[Vulnerability.fixed_by]", 
                                        back_populates="fixer")