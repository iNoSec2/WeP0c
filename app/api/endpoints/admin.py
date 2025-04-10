from fastapi import APIRouter, Depends, HTTPException, status, Header
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
async def admin_dashboard(current_user: User = Depends(require_role(Role.SUPER_ADMIN))):
    """Admin dashboard stats"""
    return {
        "message": "Welcome to the super admin dashboard",
        "admin": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
        },
    }


@router.get("/users", response_model=List[UserOut])
async def get_all_users(
    role: Optional[Role] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN)),
    admin_override: Optional[str] = Header(None, alias="X-Admin-Override"),
):
    """Get all users (admin only)"""
    print(
        f"Admin API - Get users request from user {current_user.username} with role {current_user.role}"
    )
    if admin_override:
        print(f"Admin override header present: {admin_override}")

    # Apply role filter if provided
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)

    return query.offset(skip).limit(limit).all()


@router.post("/users", response_model=UserOut)
async def create_user_admin(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN)),
    admin_override: Optional[str] = Header(None, alias="X-Admin-Override"),
):
    """Create any type of user as admin"""
    print(
        f"Admin API - Create user request from user {current_user.username} with role {current_user.role}"
    )
    if admin_override:
        print(f"Admin override header present: {admin_override}")

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

    # Ensure role is uppercase in case frontend sends lowercase
    if user.role and isinstance(user.role, str):
        user.role = Role(user.role.upper())

    return crud_user.create_user(db=db, user=user)


@router.get("/user/{user_id}", response_model=UserOut)
async def get_user_details(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN)),
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
    current_user: User = Depends(require_role(Role.SUPER_ADMIN)),
):
    """Create a new user with any role (admin only)"""
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

    return crud_user.create_user(db=db, user=user)


@router.delete("/user/{user_id}", response_model=dict)
async def deactivate_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN)),
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
            detail="Cannot deactivate your own admin account",
        )

    crud_user.deactivate_user(db, user_id=user_id)
    return {"message": f"User {user.username} has been deactivated"}


@router.get("/projects", response_model=List[Project])
async def get_all_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN)),
):
    """Get all projects (admin only)"""
    from app.crud.crud_project import get_projects

    return get_projects(db, skip=skip, limit=limit)


@router.delete("/users/{user_id}", response_model=dict)
async def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN)),
):
    """Delete a user (admin only) - matches frontend URL structure"""
    # Check if user exists
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Don't allow deleting self
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account",
        )

    crud_user.deactivate_user(db, user_id=user_id)
    return {"message": f"User {user.username} has been deactivated"}


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user_by_id(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN)),
    admin_override: Optional[str] = Header(None, alias="X-Admin-Override"),
):
    """Get detailed user information by ID (admin only) - matches frontend URL structure"""
    print(
        f"Admin API - Get user by ID request from user {current_user.username} with role {current_user.role}"
    )
    if admin_override:
        print(f"Admin override header present: {admin_override}")

    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=UserOut)
async def update_user_by_id(
    user_id: UUID,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPER_ADMIN)),
    admin_override: Optional[str] = Header(None, alias="X-Admin-Override"),
):
    """Update user information (admin only) - matches frontend URL structure"""
    print(
        f"Admin API - Update user request from user {current_user.username} with role {current_user.role}"
    )
    if admin_override:
        print(f"Admin override header present: {admin_override}")
    # Check if user exists
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Convert Pydantic model to dict and update user
    updated_user = crud_user.update_user(
        db, user_id=user_id, user_data=user_data.dict(exclude_unset=True)
    )
    return updated_user
