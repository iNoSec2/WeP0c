from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.mission import Mission
from app.schemas.mission import MissionCreate, MissionUpdate

def create(db: Session, *, obj_in: MissionCreate) -> Mission:
    db_obj = Mission(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get(db: Session, mission_id: str) -> Optional[Mission]:
    return db.query(Mission).filter(Mission.id == mission_id).first()

def get_all(
    db: Session, *, skip: int = 0, limit: int = 100
) -> List[Mission]:
    return db.query(Mission).offset(skip).limit(limit).all()

def update(db: Session, *, db_obj: Mission, obj_in: MissionUpdate) -> Mission:
    update_data = obj_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, id: str) -> Mission:
    obj = db.query(Mission).get(id)
    db.delete(obj)
    db.commit()
    return obj

def get_by_client(
    db: Session, *, client_id: str, skip: int = 0, limit: int = 100
) -> List[Mission]:
    return (
        db.query(Mission)
        .filter(Mission.client_id == client_id)
        .order_by(Mission.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_by_status(
    db: Session, *, status: str, skip: int = 0, limit: int = 100
) -> List[Mission]:
    return (
        db.query(Mission)
        .filter(Mission.status == status)
        .order_by(Mission.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_by_priority(
    db: Session, *, priority: str, skip: int = 0, limit: int = 100
) -> List[Mission]:
    return (
        db.query(Mission)
        .filter(Mission.priority == priority)
        .order_by(Mission.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    ) 