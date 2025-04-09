from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Text, Table, JSON, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from app.db.base_class import Base

class MissionStatus(str, enum.Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MissionPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# Many-to-many association table for mission pentesters
mission_pentesters = Table(
    "mission_pentesters",
    Base.metadata,
    Column("mission_id", UUID(as_uuid=True), ForeignKey("missions.id"), primary_key=True),
    Column("pentester_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
    extend_existing=True
)

class Mission(Base):
    __tablename__ = "missions"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(MissionStatus), default=MissionStatus.PLANNING, nullable=False)
    priority = Column(SQLEnum(MissionPriority), default=MissionPriority.MEDIUM, nullable=False)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="missions")
    client = relationship("Client", back_populates="missions")
    pentesters = relationship("User", secondary=mission_pentesters, back_populates="missions")
    comments = relationship("MissionComment", back_populates="mission")
    attachments = relationship("MissionAttachment", back_populates="mission")

class Client(Base):
    __tablename__ = "clients"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    contact_person = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    missions = relationship("Mission", back_populates="client")

class MissionComment(Base):
    __tablename__ = "mission_comments"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    mission = relationship("Mission", back_populates="comments")
    author = relationship("User", back_populates="mission_comments")

class MissionAttachment(Base):
    __tablename__ = "mission_attachments"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    mission = relationship("Mission", back_populates="attachments")
    author = relationship("User", back_populates="mission_attachments") 