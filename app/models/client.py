from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.db.base_class import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String, nullable=False)
    industry = Column(String)
    website = Column(String)
    country = Column(String)
    address = Column(Text)
    contact_person = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    preferences = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    missions = relationship("Mission", back_populates="client", cascade="all, delete-orphan") 