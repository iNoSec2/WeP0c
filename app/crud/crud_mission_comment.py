from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.mission_comment import MissionComment
from app.schemas.mission_comment import MissionCommentCreate, MissionCommentUpdate

def create(db: Session, *, obj_in: MissionCommentCreate) -> MissionComment:
    db_obj = MissionComment(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get(db: Session, comment_id: str) -> Optional[MissionComment]:
    return db.query(MissionComment).filter(MissionComment.id == comment_id).first()

def get_all(
    db: Session, *, skip: int = 0, limit: int = 100
) -> List[MissionComment]:
    return db.query(MissionComment).offset(skip).limit(limit).all()

def update(db: Session, *, db_obj: MissionComment, obj_in: MissionCommentUpdate) -> MissionComment:
    update_data = obj_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, id: str) -> MissionComment:
    obj = db.query(MissionComment).get(id)
    db.delete(obj)
    db.commit()
    return obj

def get_by_mission(
    db: Session, *, mission_id: str, skip: int = 0, limit: int = 100
) -> List[MissionComment]:
    return (
        db.query(MissionComment)
        .filter(MissionComment.mission_id == mission_id)
        .order_by(MissionComment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_by_user(
    db: Session, *, user_id: str, skip: int = 0, limit: int = 100
) -> List[MissionComment]:
    return (
        db.query(MissionComment)
        .filter(MissionComment.user_id == user_id)
        .order_by(MissionComment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    ) 