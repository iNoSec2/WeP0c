from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.core.deps import get_db, get_current_user, require_role
from app.models.user import User
from app.schemas.user import Role, UserCreate, UserUpdate, UserOut
from app.crud import crud_user
from app.schemas.project import Project

router = APIRouter()

@router.get("/", response_model=dict)
async def admin_dashboard(
    current_user: User = Depends(require_role(Role.SUPER_ADMIN))
):
    """Admin dashboard stats"""
    return {
        "message": "Welcome to the super admin dashboard",
        "admin": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email
        }
    }

@router.get("/users", response_model=List[UserOut])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN))
):
    """Get all users (admin only)"""
    return db.query(User).offset(skip).limit(limit).all()

@router.post("/users", response_model=UserOut)
async def create_user_admin(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN))
):
    """Create any type of user as admin"""
    # Check if username is taken
    db_user = crud_user.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")

    # Check if email is taken
    if user.email:
        db_user = crud_user.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    # Ensure role is uppercase in case frontend sends lowercase
    if user.role and isinstance(user.role, str):
        user.role = Role(user.role.upper())
        
    return crud_user.create_user(db=db, user=user)

@router.get("/user/{user_id}", response_model=UserOut)
async def get_user_details(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN))
):
    """Get detailed user information by ID (admin only)"""
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/user", response_model=UserOut)
async def create_admin_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN))
):
    """Create a new user with any role (admin only)"""
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

@router.delete("/user/{user_id}", response_model=dict)
async def deactivate_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN))
):
    """Deactivate a user (admin only)"""
    # Check if user exists
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Don't allow deactivating self
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own admin account"
        )

    crud_user.deactivate_user(db, user_id=user_id)
    return {"message": f"User {user.username} has been deactivated"}

@router.get("/projects", response_model=List[Project])
async def get_all_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN))
):
    """Get all projects (admin only)"""
    from app.crud.crud_project import get_projects
    return get_projects(db, skip=skip, limit=limit)

