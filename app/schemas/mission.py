from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
import enum

# Define enums here to avoid circular imports
class MissionStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MissionPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# Base Mission Schema
class MissionBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: MissionStatus = MissionStatus.PENDING
    priority: MissionPriority = MissionPriority.MEDIUM
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[str] = None
    client_id: UUID

# Create Mission Schema
class MissionCreate(MissionBase):
    pass

# Update Mission Schema
class MissionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[MissionStatus] = None
    priority: Optional[MissionPriority] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[str] = None

# Mission in DB Schema
class MissionInDBBase(MissionBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Mission Schema for Response
class Mission(MissionInDBBase):
    pass

# Mission Schema with Relationships
class MissionWithRelations(Mission):
    client: Optional["Client"] = None
    pentesters: List["User"] = []
    comments: List["MissionComment"] = []
    attachments: List["MissionAttachment"] = []
    reports: List["Report"] = []
    
    class Config:
        from_attributes = True 