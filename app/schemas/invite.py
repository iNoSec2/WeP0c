from pydantic import BaseModel

class InvitationBase(BaseModel):
    email: str

class InvitationCreate(InvitationBase):
    short_link: str

class Invitation(InvitationBase):
    id: int
    short_link: str
    created_at: str

    class Config:
        orm_mode = True