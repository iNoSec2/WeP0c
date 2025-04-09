from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.mission_attachment import MissionAttachment
from app.schemas.mission_attachment import MissionAttachmentCreate, MissionAttachmentUpdate

def create(db: Session, *, obj_in: MissionAttachmentCreate) -> MissionAttachment:
    db_obj = MissionAttachment(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get(db: Session, attachment_id: str) -> Optional[MissionAttachment]:
    return db.query(MissionAttachment).filter(MissionAttachment.id == attachment_id).first()

def get_all(
    db: Session, *, skip: int = 0, limit: int = 100
) -> List[MissionAttachment]:
    return db.query(MissionAttachment).offset(skip).limit(limit).all()

def update(db: Session, *, db_obj: MissionAttachment, obj_in: MissionAttachmentUpdate) -> MissionAttachment:
    update_data = obj_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, id: str) -> MissionAttachment:
    obj = db.query(MissionAttachment).get(id)
    db.delete(obj)
    db.commit()
    return obj

def get_by_mission(
    db: Session, *, mission_id: str, skip: int = 0, limit: int = 100
) -> List[MissionAttachment]:
    return (
        db.query(MissionAttachment)
        .filter(MissionAttachment.mission_id == mission_id)
        .order_by(MissionAttachment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_by_type(
    db: Session, *, file_type: str, skip: int = 0, limit: int = 100
) -> List[MissionAttachment]:
    return (
        db.query(MissionAttachment)
        .filter(MissionAttachment.file_type == file_type)
        .order_by(MissionAttachment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    ) 