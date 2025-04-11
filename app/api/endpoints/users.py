from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import (
    User as UserSchema,
    UserCreate,
    PentesterResponse,
    ClientResponse,
    UserUpdate,
    UserProfile,
    UserResponse,
    Role,
)
from app.crud import crud_user
from app.core.deps import get_db, get_current_user, require_role
from app.security import verify_password, create_access_token
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User
from app.core.security import get_password_hash
import json

router = APIRouter()


# Update the response model to handle UUIDs
class UserResponse(BaseModel):
    id: UUID  # Change from int to UUID
    username: str
    email: Optional[str]  # Fixed: Use Optional from typing instead of pipe syntax
    role: Role
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]  # Fixed: Use Optional from typing
    company: Optional[str]  # Fixed: Use Optional from typing
    full_name: Optional[str]  # Fixed: Use Optional from typing

    class Config:
        from_attributes = True


# Handle base path with a GET request
@router.get("", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get list of users with optional role filtering

    - role: Filter users by role (case-insensitive). Example: ?role=pentester
    """
    # Base query
    query = db.query(User)

    # Apply role filter if provided
    if role:
        # Case insensitive role comparison by converting to upper
        normalized_role = role.upper()

        # Only apply role filter if it's a valid role
        try:
            valid_role = Role[normalized_role]
            query = query.filter(User.role == valid_role)
        except (KeyError, ValueError):
            # If role is not valid, return empty list
            return []

    # Apply access control based on current user's role
    if current_user.role in [Role.SUPER_ADMIN, Role.ADMIN]:
        # Admin sees all users (with optional role filter)
        pass  # No additional filters needed
    elif current_user.role == Role.PENTESTER:
        # Pentesters see other pentesters and clients
        if role:
            # If role filter is applied, respect it but within pentester's visibility
            if normalized_role in ["PENTESTER", "CLIENT"]:
                pass  # Role filter already applied above
            else:
                # If filtered role is outside pentester's visibility, return empty list
                return []
        else:
            # No role filter, apply default visibility
            query = query.filter(User.role.in_([Role.PENTESTER, Role.CLIENT]))
    else:
        # Clients see only pentesters
        if role and normalized_role != "PENTESTER":
            # If role filter is not pentester, return empty list for clients
            return []
        else:
            # Default visibility for clients - only see pentesters
            query = query.filter(User.role == Role.PENTESTER)

    # Apply pagination
    users = query.offset(skip).limit(limit).all()
    return users


# Get a specific user by ID
@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific user by ID"""
    # Get the user
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check permissions
    if current_user.role in [Role.SUPER_ADMIN, Role.ADMIN]:
        # Admins can view any user
        pass
    elif current_user.role == Role.PENTESTER and user.role in [
        Role.PENTESTER,
        Role.CLIENT,
    ]:
        # Pentesters can view other pentesters and clients
        pass
    elif current_user.role == Role.CLIENT and user.role == Role.PENTESTER:
        # Clients can view pentesters
        pass
    elif current_user.id == user.id:
        # Users can view themselves
        pass
    else:
        # Otherwise, deny access
        raise HTTPException(
            status_code=403, detail="Not authorized to access this user"
        )

    return user


# Delete a user
@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([Role.SUPER_ADMIN, Role.ADMIN])),
):
    """Delete a user (admin only)"""
    # Check if user exists
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    # Prevent deleting the last super admin
    if user.role == Role.SUPER_ADMIN:
        # Count super admins
        super_admin_count = db.query(User).filter(User.role == Role.SUPER_ADMIN).count()
        if super_admin_count <= 1:
            raise HTTPException(
                status_code=400, detail="Cannot delete the last super admin account"
            )

    # Delete the user
    db.delete(user)
    db.commit()

    return None


# Handle base path with POST
@router.post("", response_model=UserSchema)
async def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([Role.SUPER_ADMIN, Role.ADMIN])),
):
    """Create a new user (admin only)"""
    # Check if username is taken
    db_user = crud_user.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email is taken
    if user.email:
        db_user = crud_user.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    # If role is not set, default to USER
    if not user.role:
        user.role = Role.USER
    # Handle lowercase role strings from frontend
    elif isinstance(user.role, str):
        try:
            user.role = Role(user.role.upper())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {user.role}. Valid roles are: {', '.join([r.value for r in Role])}",
            )

    # Create user
    return crud_user.create_user(db=db, user=user)


# Keep original endpoint for backward compatibility
@router.post("/", response_model=UserSchema)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([Role.SUPER_ADMIN, Role.ADMIN])),
):
    """Create a new user (admin only)"""
    return await create_new_user(user, db, current_user)


# Update a user
@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a user"""
    # Check if user exists
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check permissions
    if current_user.role in [Role.SUPER_ADMIN, Role.ADMIN]:
        # Admins can update any user
        pass
    elif current_user.id == user.id:
        # Users can update themselves, but with restrictions
        if user_update.role is not None and user_update.role != user.role:
            raise HTTPException(status_code=403, detail="Cannot change your own role")
    else:
        # Otherwise, deny access
        raise HTTPException(
            status_code=403, detail="Not authorized to update this user"
        )

    # Handle role update
    if user_update.role is not None and isinstance(user_update.role, str):
        try:
            user_update.role = Role(user_update.role.upper())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {user_update.role}. Valid roles are: {', '.join([r.value for r in Role])}",
            )

    # Update the user
    updated_user = crud_user.update_user(
        db, user_id=user_id, user_data=user_update.dict(exclude_unset=True)
    )
    return updated_user


@router.post("/clients", response_model=ClientResponse, tags=["clients"])
async def create_client(
    username: str,
    password: str,
    email: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role([Role.PENTESTER, Role.SUPER_ADMIN])
    ),  # Allow pentesters and super admins
):
    """Create a new client account (pentester or super admin only)"""
    # Check if username is taken
    db_user = crud_user.get_user_by_username(db, username=username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email is taken
    if email:
        db_user = crud_user.get_user_by_email(db, email=email)
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    # Create client with role explicitly set
    user_data = UserCreate(
        username=username, password=password, email=email, role=Role.CLIENT
    )

    return crud_user.create_user(db=db, user=user_data)


# Add a new endpoint for client creation with JSON body
class ClientCreateRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    company: Optional[str] = None
    full_name: Optional[str] = None


@router.post("/clients/create", response_model=ClientResponse, tags=["clients"])
async def create_client_json(
    client_data: ClientCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([Role.PENTESTER, Role.SUPER_ADMIN])),
):
    """Create a new client account using JSON body (for pentester or super admin)"""
    # Check if username is taken
    db_user = crud_user.get_user_by_username(db, username=client_data.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email is taken
    if client_data.email:
        db_user = crud_user.get_user_by_email(db, email=client_data.email)
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    # Create client with role explicitly set
    user_data = UserCreate(
        username=client_data.username,
        password=client_data.password,
        email=client_data.email,
        role=Role.CLIENT,
    )

    client = crud_user.create_user(db=db, user=user_data)

    # Update additional fields if provided
    if client_data.company or client_data.full_name:
        if client_data.company:
            client.company = client_data.company
        if client_data.full_name:
            client.full_name = client_data.full_name
        db.add(client)
        db.commit()
        db.refresh(client)

    return client


@router.post("/pentesters", response_model=PentesterResponse, tags=["pentesters"])
async def create_pentester(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role([Role.PENTESTER, Role.SUPER_ADMIN])
    ),  # Only pentesters or admins
):
    """Create a new pentester account (pentester or admin only)"""
    # Check if username is taken
    db_user = crud_user.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email is taken
    if user.email:
        db_user = crud_user.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    # Ensure role is set to pentester
    user_data = UserCreate(
        username=user.username,
        password=user.password,
        email=user.email,
        role=Role.PENTESTER,
        specialities=user.specialities,
    )

    return crud_user.create_user(db=db, user=user_data)


@router.post("/token")
async def login_for_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
        )

    # Create access token with user ID (not username) as subject
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
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
    current_user: User = Depends(get_current_user),
):
    """Get all pentesters (used when assigning to projects)"""
    return crud_user.get_users_by_role(db, role=Role.PENTESTER, skip=skip, limit=limit)


@router.get("/clients", response_model=List[ClientResponse])
async def read_clients(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role([Role.PENTESTER, Role.SUPER_ADMIN])),
):
    """Get all clients (accessible by pentesters and super admins)"""
    return crud_user.get_users_by_role(db, role=Role.CLIENT, skip=skip, limit=limit)


@router.post("/specialities/{user_id}/{speciality}", response_model=PentesterResponse)
async def add_user_speciality(
    user_id: UUID,
    speciality: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a speciality to a pentester"""
    # Verify permissions (only self or admin)
    if current_user.id != user_id and current_user.role != Role.PENTESTER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this user's specialities",
        )

    user = crud_user.add_speciality(db, user_id=user_id, speciality_name=speciality)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or not a pentester",
        )

    return user


@router.delete("/specialities/{user_id}/{speciality}", response_model=PentesterResponse)
async def remove_user_speciality(
    user_id: UUID,
    speciality: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a speciality from a pentester"""
    # Verify permissions (only self or admin)
    if current_user.id != user_id and current_user.role != Role.PENTESTER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this user's specialities",
        )

    user = crud_user.remove_speciality(db, user_id=user_id, speciality_name=speciality)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or not a pentester",
        )

    return user
