from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from typing import Optional

from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.schemas.user import UserCreate, User, UserLogin, UserOut
from app.crud import crud_user
from app.models.user import User as UserModel
from app.utils.microsoft_auth import get_microsoft_user_info

router = APIRouter()

@router.post("/auth/login", response_model=dict)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db)
):
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
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    crud_user.update_last_login(db, user=user)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role,
            "email": user.email
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role
    }

@router.post("/auth/microsoft/login")
async def microsoft_login(code: str, db = Depends(get_db)):
    """
    Handle Microsoft OAuth login
    """
    try:
        # Get user info from Microsoft
        user_info = await get_microsoft_user_info(code)
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not get user info from Microsoft"
            )
        
        # Check if user exists
        user = crud_user.get_user_by_email(db, email=user_info["email"])
        if not user:
            # Create new user with Microsoft info
            user_data = UserCreate(
                email=user_info["email"],
                username=user_info["email"].split("@")[0],
                password=user_info["id"],  # Use Microsoft ID as password
                role="USER",  # Default role
                full_name=user_info.get("name", ""),
            )
            user = crud_user.create_user(db, user=user_data)
        
        # Update last login
        crud_user.update_last_login(db, user=user)
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "role": user.role,
                "email": user.email
            },
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(user.id),
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

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
    
    # Check if username is taken
    user = crud_user.get_user_by_username(db, username=user_data.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
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

@router.post("/logout")
async def logout(request: Request):
    """
    Logout user (clear token)
    """
    response = JSONResponse(content={"message": "Successfully logged out"})
    response.delete_cookie("token")
    return response

@router.get("/auth/test-token", response_model=dict)
async def test_token(current_user: UserModel = Depends(get_current_user)):
    """
    Test token validation endpoint
    """
    return {
        "user_id": str(current_user.id),
        "email": current_user.email,
        "role": current_user.role,
        "status": "valid"
    } 