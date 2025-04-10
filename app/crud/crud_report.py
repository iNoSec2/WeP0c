from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportUpdate

def create(db: Session, *, obj_in: ReportCreate) -> Report:
    db_obj = Report(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get(db: Session, report_id: str) -> Optional[Report]:
    return db.query(Report).filter(Report.id == report_id).first()

def get_all(
    db: Session, *, skip: int = 0, limit: int = 100
) -> List[Report]:
    return db.query(Report).offset(skip).limit(limit).all()

def update(db: Session, *, db_obj: Report, obj_in: ReportUpdate) -> Report:
    update_data = obj_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, id: str) -> Report:
    obj = db.query(Report).get(id)
    db.delete(obj)
    db.commit()
    return obj

def get_by_mission(
    db: Session, *, mission_id: str, skip: int = 0, limit: int = 100
) -> List[Report]:
    return (
        db.query(Report)
        .filter(Report.mission_id == mission_id)
        .order_by(Report.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_by_author(
    db: Session, *, author_id: str, skip: int = 0, limit: int = 100
) -> List[Report]:
    return (
        db.query(Report)
        .filter(Report.author_id == author_id)
        .order_by(Report.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_by_status(
    db: Session, *, status: str, skip: int = 0, limit: int = 100
) -> List[Report]:
    return (
        db.query(Report)
        .filter(Report.status == status)
        .order_by(Report.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    ) 