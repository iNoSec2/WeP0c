from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate

def create(db: Session, *, obj_in: ClientCreate) -> Client:
    db_obj = Client(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get(db: Session, client_id: str) -> Optional[Client]:
    return db.query(Client).filter(Client.id == client_id).first()

def get_all(
    db: Session, *, skip: int = 0, limit: int = 100
) -> List[Client]:
    return db.query(Client).offset(skip).limit(limit).all()

def update(db: Session, *, db_obj: Client, obj_in: ClientUpdate) -> Client:
    update_data = obj_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, id: str) -> Client:
    obj = db.query(Client).get(id)
    db.delete(obj)
    db.commit()
    return obj

def get_by_industry(
    db: Session, *, industry: str, skip: int = 0, limit: int = 100
) -> List[Client]:
    return (
        db.query(Client)
        .filter(Client.industry == industry)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_by_country(
    db: Session, *, country: str, skip: int = 0, limit: int = 100
) -> List[Client]:
    return (
        db.query(Client)
        .filter(Client.country == country)
        .offset(skip)
        .limit(limit)
        .all()
    ) 