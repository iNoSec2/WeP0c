from typing import Optional, List, Dict
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from app.schemas.user import User
from app.schemas.mission import Mission
import enum

# Define enums here to avoid circular imports
class ReportStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"

# Base Report Schema
class ReportBase(BaseModel):
    title: str
    content: Optional[str] = None
    findings: Optional[List[Dict]] = []
    recommendations: Optional[List[Dict]] = []
    status: Optional[ReportStatus] = ReportStatus.DRAFT
    mission_id: UUID
    author_id: UUID
    reviewer_id: Optional[UUID] = None

# Create Report Schema
class ReportCreate(ReportBase):
    pass

# Update Report Schema
class ReportUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    findings: Optional[List[Dict]] = None
    recommendations: Optional[List[Dict]] = None
    status: Optional[ReportStatus] = None
    reviewer_id: Optional[UUID] = None

# Report in DB Schema
class ReportInDBBase(ReportBase):
    id: UUID
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Report Schema for Response
class Report(ReportInDBBase):
    pass

# Report Schema with Relationships
class ReportWithRelations(Report):
    mission: Optional[Mission] = None
    author: Optional[User] = None
    reviewer: Optional[User] = None 