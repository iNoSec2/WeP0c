from typing import Optional
from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel, conint
from app.schemas.user import User
from app.schemas.mission import Mission

# Base Timesheet Schema
class TimesheetBase(BaseModel):
    mission_id: UUID
    date: date
    hours_spent: conint(ge=0, le=24)  # Validate hours between 0 and 24
    description: Optional[str] = None
    status: Optional[str] = "pending"  # pending, approved, rejected

# Create Timesheet Schema
class TimesheetCreate(TimesheetBase):
    pass

# Update Timesheet Schema
class TimesheetUpdate(BaseModel):
    hours_spent: Optional[conint(ge=0, le=24)] = None
    description: Optional[str] = None
    status: Optional[str] = None

# Timesheet in DB Schema
class TimesheetInDBBase(TimesheetBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Timesheet Schema for Response
class Timesheet(TimesheetInDBBase):
    pass

# Timesheet Schema with Relationships
class TimesheetWithRelations(Timesheet):
    user: Optional[User] = None
    mission: Optional[Mission] = None 