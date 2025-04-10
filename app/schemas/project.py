from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.schemas.vulnerability import Vulnerability
from app.models.project import ProjectStatus


class UserBase(BaseModel):
    id: UUID
    username: str
    email: Optional[str] = None


class ProjectBase(BaseModel):
    name: str
    status: Optional[ProjectStatus] = ProjectStatus.planning


class ProjectCreate(ProjectBase):
    client_id: UUID
    pentester_id: UUID  # Make pentester required


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[ProjectStatus] = None


class ProjectAddPentester(BaseModel):
    pentester_id: UUID


class Project(ProjectBase):
    id: UUID
    client_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    client: Optional[UserBase] = None
    pentesters: List[UserBase] = []
    vulnerabilities: List[Vulnerability] = []

    class Config:
        from_attributes = True
