from sqlalchemy.orm import Session
from typing import List, Optional, Any, Dict, Union
from uuid import UUID
from app.models.user import User, Speciality
from app.schemas.user import UserCreate, UserUpdate, Role
from app.core.security import get_password_hash, verify_password
from datetime import datetime
from app.crud.base import CRUDBase

def get_user(db: Session, user_id: UUID = None, email: str = None) -> Optional[User]:
    """Get a user by ID or email"""
    if user_id:
        return db.query(User).filter(User.id == user_id).first()
    elif email:
        return db.query(User).filter(User.email == email).first()
    return None

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get a user by username"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email"""
    return db.query(User).filter(User.email == email).first()

def get_users_by_role(db: Session, role: Role, skip: int = 0, limit: int = 100) -> List[User]:
    """Get all users with a specific role"""
    return db.query(User).filter(User.role == role).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.flush()  # Flush to get the ID but don't commit yet
    
    # Only process specialities for pentester role
    if user.role == Role.PENTESTER and user.specialities:
        for speciality_name in user.specialities:
            # Check if the speciality already exists
            speciality = db.query(Speciality).filter(Speciality.name == speciality_name).first()
            if not speciality:
                # Create the speciality if it doesn't exist
                speciality = Speciality(
                    name=speciality_name, 
                    description=f"Expertise in {speciality_name}"
                )
                db.add(speciality)
                db.flush()
            
            # Add the speciality to the user's specialities list
            db_user.specialities.append(speciality)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password"""
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def update_user(db: Session, user_id: UUID, user_data: dict) -> Optional[User]:
    """Update a user's information"""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    # Extract specialities from the update data if present
    specialities = user_data.pop("specialities", None)
    
    # Update password separately if provided
    if "password" in user_data:
        user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
    
    # Update other attributes
    for key, value in user_data.items():
        setattr(db_user, key, value)
    
    # Handle speciality updates if user is a pentester
    if db_user.role == Role.PENTESTER and specialities is not None:
        # Clear the user's specialities
        db_user.specialities = []
        
        # Add new specialities
        for speciality_name in specialities:
            # Check if the speciality already exists
            speciality = db.query(Speciality).filter(Speciality.name == speciality_name).first()
            if not speciality:
                # Create the speciality if it doesn't exist
                speciality = Speciality(
                    name=speciality_name,
                    description=f"Expertise in {speciality_name}"
                )
                db.add(speciality)
                db.flush()
            
            # Add the speciality to the user's specialities list
            db_user.specialities.append(speciality)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def add_speciality(db: Session, user_id: UUID, speciality_name: str) -> Optional[User]:
    """Add a speciality to a pentester"""
    db_user = get_user(db, user_id)
    if not db_user or db_user.role != Role.PENTESTER:
        return None
    
    # Check if the user already has this speciality
    for spec in db_user.specialities:
        if spec.name == speciality_name:
            return db_user  # Already has this speciality
    
    # Check if the speciality exists
    speciality = db.query(Speciality).filter(Speciality.name == speciality_name).first()
    if not speciality:
        # Create it if it doesn't exist
        speciality = Speciality(
            name=speciality_name,
            description=f"Expertise in {speciality_name}"
        )
        db.add(speciality)
        db.flush()
    
    # Add the speciality to the user
    db_user.specialities.append(speciality)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def remove_speciality(db: Session, user_id: UUID, speciality_name: str) -> Optional[User]:
    """Remove a speciality from a pentester"""
    db_user = get_user(db, user_id)
    if not db_user or db_user.role != Role.PENTESTER:
        return None
    
    # Find the speciality to remove
    for speciality in db_user.specialities:
        if speciality.name == speciality_name:
            db_user.specialities.remove(speciality)
            break
    
    db.commit()
    db.refresh(db_user)
    return db_user

def deactivate_user(db: Session, user_id: UUID) -> Optional[User]:
    """Deactivate a user (instead of deleting)"""
    return update_user(db, user_id, {"is_active": False})

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            role=obj_in.role,
            is_active=True,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if update_data.get("password"):
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def update_last_login(self, db: Session, *, user: User) -> User:
        user.last_login = datetime.utcnow()
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def is_active(self, user: User) -> bool:
        return user.is_active

    def is_admin(self, user: User) -> bool:
        return user.role == "admin"

user = CRUDUser(User)