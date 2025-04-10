from pydantic import BaseModel, Field, EmailStr, constr
from typing import List, Optional, Dict, Any, ForwardRef
from uuid import UUID
from datetime import datetime
import enum

# Define enums here to avoid circular imports
class Role(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    PENTESTER = "PENTESTER"
    CLIENT = "CLIENT"
    USER = "USER"

class AvailabilityStatus(str, enum.Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    UNAVAILABLE = "unavailable"
    ON_LEAVE = "on_leave"

# Forward references for circular dependencies
MissionRef = ForwardRef('Mission')
MissionCommentRef = ForwardRef('MissionComment')
MissionAttachmentRef = ForwardRef('MissionAttachment')
ReportRef = ForwardRef('Report')

class SpecialityBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None

class SpecialityCreate(SpecialityBase):
    pass

class SpecialityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

class Speciality(SpecialityBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TimesheetBase(BaseModel):
    project_id: UUID
    date: datetime
    hours_spent: int
    description: Optional[str] = None

class TimesheetCreate(TimesheetBase):
    pass

class Timesheet(TimesheetBase):
    id: UUID
    pentester_id: UUID
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    project_id: UUID
    title: str
    content: Dict[str, Any]
    status: str = "draft"
    version: int = 1

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: UUID
    author_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None
    role: Optional[Role] = None
    company: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[dict] = None
    theme: Optional[str] = None
    notification_settings: Optional[dict] = None

class PentesterProfile(BaseModel):
    hourly_rate: Optional[float] = None
    availability_status: Optional[AvailabilityStatus] = None
    years_of_experience: Optional[int] = None
    certifications: Optional[List[str]] = None
    tools_expertise: Optional[List[str]] = None
    methodology_expertise: Optional[List[str]] = None

    class Config:
        from_attributes = True

class UserCreate(UserBase):
    email: EmailStr
    password: str
    username: str
    specialities: Optional[List[str]] = []

class UserUpdate(UserBase):
    password: Optional[str] = None
    pentester_profile: Optional[PentesterProfile] = None

class UserInDBBase(UserBase):
    id: UUID
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserInDB(UserInDBBase):
    hashed_password: str

class User(UserInDBBase):
    pass

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    role: Role
    company: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    theme: Optional[str] = "light"
    specialities: Optional[List[Speciality]] = None
    pentester_profile: Optional[PentesterProfile] = None

    class Config:
        from_attributes = True

class ClientResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    role: Role = Role.CLIENT
    company: Optional[str] = None

    class Config:
        from_attributes = True

class PentesterResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    role: Role = Role.PENTESTER
    specialities: List[Speciality] = []
    hourly_rate: Optional[int] = None
    availability_status: Optional[str] = None
    years_of_experience: Optional[int] = None
    certifications: Optional[List[str]] = None

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    id: UUID
    name: str

class UserProfile(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    company: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Role
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserResponse(UserProfile):
    pass

class UserWithRelations(User):
    missions: List[MissionRef] = []
    specialities: List[Speciality] = []
    mission_comments: List[MissionCommentRef] = []
    mission_attachments: List[MissionAttachmentRef] = []
    authored_reports: List[ReportRef] = []
    reviewed_reports: List[ReportRef] = []
    pentester_profile: Optional[PentesterProfile] = None
    
    class Config:
        from_attributes = True

# Update forward references 
from app.schemas.mission import Mission
from app.schemas.mission_comment import MissionComment
from app.schemas.mission_attachment import MissionAttachment
from app.schemas.report import Report

UserWithRelations.update_forward_refs()