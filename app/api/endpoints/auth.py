from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.schemas.user import UserCreate, User, UserLogin, UserOut
from app.crud import crud_user
from app.models.user import User as UserModel

router = APIRouter()

@router.post("/api/auth/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    """
    Get access token for user authentication
    """
    user = crud_user.authenticate(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role
    }

@router.post("/register", response_model=UserOut)
async def register(user_data: UserCreate, db = Depends(get_db)):
    """
    Register a new user
    """
    # Check if user with this email already exists
    user = crud_user.get_user_by_email(db, email=user_data.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    
    # Create new user
    user = crud_user.create_user(db, user=user_data)
    return user

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: UserModel = Depends(get_current_user)):
    """
    Get current user
    """
    return current_user 