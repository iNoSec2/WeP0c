from pydantic import BaseModel
from typing import List
from app.schemas.vulnerability import Vulnerability

class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    vulnerabilities: List[Vulnerability] = []

    class Config:
        orm_mode = True