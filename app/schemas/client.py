from typing import Optional, List, Dict
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr

# Base Client Schema
class ClientBase(BaseModel):
    company_name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    preferences: Optional[Dict] = {}

# Create Client Schema
class ClientCreate(ClientBase):
    pass

# Update Client Schema
class ClientUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    preferences: Optional[Dict] = None

# Client in DB Schema
class ClientInDBBase(ClientBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Client Schema for Response
class Client(ClientInDBBase):
    pass

# Client Schema with Relationships
class ClientWithRelations(Client):
    missions: List["Mission"] = []
    
    class Config:
        from_attributes = True 