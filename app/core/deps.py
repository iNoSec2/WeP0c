from typing import Generator, Optional, List, Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.user import Role
from app.crud import crud_user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_db() -> Generator:
    """Create a new database session for each request"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """Get the current user from the JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
    except (JWTError, ValidationError):
        raise credentials_exception
    
    # Get the user from the database
    user = crud_user.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user

def require_role(required_roles: Union[Role, List[Role]]):
    """
    Dependency to check if the current user has one of the required roles.
    Usage: @app.get("/admin-only", dependencies=[Depends(require_role(Role.ADMIN))])
    """
    if not isinstance(required_roles, list):
        required_roles = [required_roles]
    
    async def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User with role {current_user.role} does not have access to this resource"
            )
        return current_user
    
    return role_checker