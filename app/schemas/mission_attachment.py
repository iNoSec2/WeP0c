from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from app.schemas.user import User
from app.schemas.mission import Mission

# Base MissionAttachment Schema
class MissionAttachmentBase(BaseModel):
    filename: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    file_path: str
    mission_id: UUID
    uploaded_by: UUID
    description: Optional[str] = None

# Create MissionAttachment Schema
class MissionAttachmentCreate(MissionAttachmentBase):
    pass

# Update MissionAttachment Schema
class MissionAttachmentUpdate(BaseModel):
    filename: Optional[str] = None
    description: Optional[str] = None

# MissionAttachment in DB Schema
class MissionAttachmentInDBBase(MissionAttachmentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# MissionAttachment Schema for Response
class MissionAttachment(MissionAttachmentInDBBase):
    pass

# MissionAttachment Schema with Relationships
class MissionAttachmentWithRelations(MissionAttachment):
    mission: Optional[Mission] = None
    user: Optional[User] = None 