from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import UserRegister, UserLogin, Token
from app.services.auth_service import register_user, authenticate_user
from app.core.dependencies import get_db

router = APIRouter()

@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    user = register_user(db, data.email, data.password)
    return {"message": "User registered successfully", "user_id": user.id}

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    token = authenticate_user(db, data.email, data.password)
    return {"access_token": token}
