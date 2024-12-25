from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.short_gen import ShortLinkGenerator
from app.schemas.invite import InvitationCreate, Invitation
from app.crud.crud_invite import create_invitation
from app.core.deps import get_db

router = APIRouter()

@router.post("/invite", response_model=Invitation)
def invite_client(email: str, project_id: int, db: Session = Depends(get_db)):
    short_link = ShortLinkGenerator.generate_short_link()
    invitation = InvitationCreate(email=email, short_link=short_link, project_id=project_id)
    db_invitation = create_invitation(db=db, invitation=invitation)
    return db_invitation