# app/services/auth_service.py
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    try:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

async def register_user(db, email: str, password: str, username: str) -> Optional[Dict[str, Any]]:
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"$or": [{"email": email}, {"username": username}]})
        
        if existing_user:
            logger.warning(f"User already exists: {email}")
            return None
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Create user document
        user_data = {
            "email": email,
            "username": username,
            "hashed_password": hashed_password,
            "is_admin": False,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into database
        result = await db.users.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        
        logger.info(f"User registered successfully: {email}")
        return user_data
    
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return None

async def authenticate_user(db, email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate a user"""
    try:
        # Find user by email
        user = await db.users.find_one({"email": email, "is_active": True})
        
        if not user:
            logger.warning(f"User not found: {email}")
            return None
        
        # Verify password
        if not verify_password(password, user.get("hashed_password", "")):
            logger.warning(f"Password verification failed for: {email}")
            return None
        
        logger.info(f"Authentication successful for: {email}")
        return user
    
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    try:
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        
        return encoded_jwt
    
    except Exception as e:
        logger.error(f"Token creation error: {e}")
        raise