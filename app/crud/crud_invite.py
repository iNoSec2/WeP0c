from sqlalchemy.orm import Session
from app.models.invitation import Invitation
from app.schemas.invite import InvitationCreate

def create_invitation(db: Session, invitation: InvitationCreate):
    db_invitation = Invitation(email=invitation.email, short_link=invitation.short_link, project_id=invitation.project_id)
    db.add(db_invitation)
    db.commit()
    db.refresh(db_invitation)
    return db_invitation

def get_invitation_by_short_link(db: Session, short_link: str):
    return db.query(Invitation).filter(Invitation.short_link == short_link).first()