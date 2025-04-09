from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.timesheet import Timesheet
from app.schemas.timesheet import TimesheetCreate, TimesheetUpdate

def create(db: Session, *, obj_in: TimesheetCreate, user_id: str) -> Timesheet:
    db_obj = Timesheet(
        **obj_in.dict(),
        user_id=user_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get(db: Session, timesheet_id: str) -> Optional[Timesheet]:
    return db.query(Timesheet).filter(Timesheet.id == timesheet_id).first()

def get_by_user(
    db: Session, *, user_id: str, skip: int = 0, limit: int = 100
) -> List[Timesheet]:
    return (
        db.query(Timesheet)
        .filter(Timesheet.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def update(db: Session, *, db_obj: Timesheet, obj_in: TimesheetUpdate) -> Timesheet:
    update_data = obj_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, id: str) -> Timesheet:
    obj = db.query(Timesheet).get(id)
    db.delete(obj)
    db.commit()
    return obj

def get_by_date_range(
    db: Session, *, user_id: str, start_date: datetime, end_date: datetime
) -> List[Timesheet]:
    return (
        db.query(Timesheet)
        .filter(
            Timesheet.user_id == user_id,
            Timesheet.date >= start_date,
            Timesheet.date <= end_date
        )
        .all()
    ) 