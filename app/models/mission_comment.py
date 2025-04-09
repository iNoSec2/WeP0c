from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.db.base_class import Base

class MissionComment(Base):
    __tablename__ = "mission_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    mission_id = Column(UUID(as_uuid=True), ForeignKey("missions.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("mission_comments.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    mission = relationship("Mission", back_populates="comments")
    user = relationship("User", back_populates="mission_comments")
    parent = relationship("MissionComment", remote_side=[id], backref="replies") 