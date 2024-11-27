from pydantic import BaseModel
from typing import Optional
from app.models.user import Role

class UserBase(BaseModel):
    username: str
    role: Role

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True