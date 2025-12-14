from fastapi import APIRouter
from . import auth, sweets, inventory

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(sweets.router, prefix="/sweets", tags=["Sweets"])
api_router.include_router(inventory.router, prefix="/sweets", tags=["Inventory"])