from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timedelta
from typing import Optional
import logging

# Correct imports - use app.core.dependencies
from app.core.dependencies import get_current_user, admin_required
from app.services.auth_service import register_user, authenticate_user, create_access_token
from app.core.database import get_database
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    username: str = Field(..., min_length=3)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: dict

class UserProfile(BaseModel):
    id: str
    email: str
    username: str
    is_admin: bool
    is_active: bool
    created_at: datetime

@router.post("/register", response_model=Token)
async def register(data: UserRegister):
    """Register a new user"""
    try:
        db = get_database()
        user = await register_user(db, data.email, data.password, data.username)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User registration failed"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user["_id"])}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "username": user["username"],
                "is_admin": user.get("is_admin", False)
            }
        }
    
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    """Login user"""
    try:
        db = get_database()
        user = await authenticate_user(db, data.email, data.password)
        
        if not user:
            logger.warning(f"Login failed for email: {data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"Login successful for user: {user['email']}")
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user["_id"])}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "username": user["username"],
                "is_admin": user.get("is_admin", False)
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/profile", response_model=UserProfile)
async def get_profile(user: dict = Depends(get_current_user)):
    """Get current user profile"""
    try:
        return {
            "id": user.get("id"),
            "email": user.get("email"),
            "username": user.get("username"),
            "is_admin": user.get("is_admin", False),
            "is_active": user.get("is_active", True),
            "created_at": user.get("created_at", datetime.utcnow())
        }
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get profile"
        )