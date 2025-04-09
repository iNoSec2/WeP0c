from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.db.base_class import Base

class MissionAttachment(Base):
    __tablename__ = "mission_attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String, nullable=False)
    file_type = Column(String)
    file_size = Column(Integer)  # in bytes
    file_path = Column(String, nullable=False)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    mission = relationship("Mission", back_populates="attachments")
    user = relationship("User", back_populates="mission_attachments") 