from sqlalchemy import Column, ForeignKey, DateTime, Integer, String, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base
import enum
import uuid
from datetime import datetime

class TimesheetStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"

class Timesheet(Base):
    __tablename__ = "timesheets"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    pentester_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    hours_spent = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TimesheetStatus), default=TimesheetStatus.DRAFT, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="timesheets")
    pentester = relationship("User", back_populates="timesheets") 