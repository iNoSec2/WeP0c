from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from app.schemas.user import User
from app.schemas.mission import Mission

# Base MissionComment Schema
class MissionCommentBase(BaseModel):
    content: str
    mission_id: UUID
    user_id: UUID
    parent_id: Optional[UUID] = None

# Create MissionComment Schema
class MissionCommentCreate(MissionCommentBase):
    pass

# Update MissionComment Schema
class MissionCommentUpdate(BaseModel):
    content: Optional[str] = None

# MissionComment in DB Schema
class MissionCommentInDBBase(MissionCommentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# MissionComment Schema for Response
class MissionComment(MissionCommentInDBBase):
    pass

# Response model that endpoints are looking for
class MissionCommentResponse(MissionComment):
    pass

# MissionComment Schema with Relationships
class MissionCommentWithRelations(MissionComment):
    mission: Optional[Mission] = None
    user: Optional[User] = None
    replies: List["MissionCommentWithRelations"] = []
    parent: Optional["MissionCommentWithRelations"] = None 