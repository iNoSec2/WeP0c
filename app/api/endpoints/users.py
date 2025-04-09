from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.schemas.user import User as UserSchema, UserCreate, PentesterResponse, ClientResponse, UserUpdate, UserProfile, UserResponse, Role
from app.crud import crud_user
from app.core.deps import get_db, get_current_user, require_role
from app.security import verify_password, create_access_token
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User
from app.core.security import get_password_hash
import json

router = APIRouter()

@router.post("/", response_model=UserSchema)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user (accessible without authentication)"""
    # Check if username is taken
    db_user = crud_user.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    
    # Check if email is taken
    if user.email:
        db_user = crud_user.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    return crud_user.create_user(db=db, user=user)

@router.post("/clients", response_model=ClientResponse, tags=["clients"])
async def create_client(
    username: str,
    password: str,
    email: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.PENTESTER))  # Only pentesters can create clients
):
    """Create a new client account (pentester only)"""
    # Check if username is taken
    db_user = crud_user.get_user_by_username(db, username=username)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    
    # Check if email is taken
    if email:
        db_user = crud_user.get_user_by_email(db, email=email)
        if db_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    # Create client with role explicitly set
    user_data = UserCreate(
        username=username,
        password=password,
        email=email,
        role=Role.CLIENT
    )
    
    return crud_user.create_user(db=db, user=user_data)

@router.post("/pentesters", response_model=PentesterResponse, tags=["pentesters"])
async def create_pentester(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([Role.PENTESTER, Role.SUPER_ADMIN]))  # Only pentesters or admins
):
    """Create a new pentester account (pentester or admin only)"""
    # Check if username is taken
    db_user = crud_user.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    
    # Check if email is taken
    if user.email:
        db_user = crud_user.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    # Ensure role is set to pentester
    user_data = UserCreate(
        username=user.username,
        password=user.password,
        email=user.email,
        role=Role.PENTESTER,
        specialities=user.specialities
    )
    
    return crud_user.create_user(db=db, user=user_data)

@router.post("/token")
async def login_for_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """Generate a JWT token for user authentication"""
    user = crud_user.get_user_by_username(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # User must be active
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")
    
    # Create access token with user ID (not username) as subject
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    }

@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Update current user.
    """
    user = current_user
    if user_in.email is not None:
        user.email = user_in.email
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.password is not None:
        user.hashed_password = get_password_hash(user_in.password)
    if user_in.company is not None:
        user.company = user_in.company
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.bio is not None:
        user.bio = user_in.bio
    if user_in.avatar_url is not None:
        user.avatar_url = user_in.avatar_url
    if user_in.preferences is not None:
        user.preferences = json.dumps(user_in.preferences)
    if user_in.theme is not None:
        user.theme = user_in.theme
    if user_in.notification_settings is not None:
        user.notification_settings = json.dumps(user_in.notification_settings)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/me/profile", response_model=UserProfile)
def read_user_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's profile.
    """
    return current_user

@router.put("/me/preferences")
def update_user_preferences(
    *,
    db: Session = Depends(get_db),
    preferences: dict,
    current_user: User = Depends(get_current_user),
):
    """
    Update user preferences.
    """
    current_user.preferences = json.dumps(preferences)
    db.add(current_user)
    db.commit()
    return {"status": "success"}

@router.put("/me/notifications")
def update_notification_settings(
    *,
    db: Session = Depends(get_db),
    settings: dict,
    current_user: User = Depends(get_current_user),
):
    """
    Update notification settings.
    """
    current_user.notification_settings = json.dumps(settings)
    db.add(current_user)
    db.commit()
    return {"status": "success"}

@router.get("/pentesters", response_model=List[PentesterResponse])
async def read_pentesters(
    db: Session = Depends(get_db),
    skip: int = 0, 
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get all pentesters (used when assigning to projects)"""
    return crud_user.get_users_by_role(db, role=Role.PENTESTER, skip=skip, limit=limit)

@router.get("/clients", response_model=List[ClientResponse])
async def read_clients(
    db: Session = Depends(get_db),
    skip: int = 0, 
    limit: int = 100,
    current_user: User = Depends(require_role(Role.PENTESTER))
):
    """Get all clients (only accessible by pentesters)"""
    return crud_user.get_users_by_role(db, role=Role.CLIENT, skip=skip, limit=limit)

@router.post("/specialities/{user_id}/{speciality}", response_model=PentesterResponse)
async def add_user_speciality(
    user_id: UUID,
    speciality: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a speciality to a pentester"""
    # Verify permissions (only self or admin)
    if current_user.id != user_id and current_user.role != Role.PENTESTER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this user's specialities"
        )
    
    user = crud_user.add_speciality(db, user_id=user_id, speciality_name=speciality)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or not a pentester"
        )
    
    return user

@router.delete("/specialities/{user_id}/{speciality}", response_model=PentesterResponse)
async def remove_user_speciality(
    user_id: UUID,
    speciality: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a speciality from a pentester"""
    # Verify permissions (only self or admin)
    if current_user.id != user_id and current_user.role != Role.PENTESTER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this user's specialities"
        )
    
    user = crud_user.remove_speciality(db, user_id=user_id, speciality_name=speciality)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or not a pentester"
        )
    
    return user