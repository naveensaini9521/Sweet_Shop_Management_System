from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas.sweet import SweetCreate, SweetUpdate, SweetOut
from app.services.sweet_service import (
    create_sweet, get_all_sweets, search_sweets,
    update_sweet, delete_sweet
)
from app.core.dependencies import get_db, get_current_user, admin_required

router = APIRouter()

@router.post("/", response_model=SweetOut)
def add_sweet(
    data: SweetCreate,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):
    return create_sweet(db, data)

@router.get("/", response_model=List[SweetOut])
def list_sweets(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return get_all_sweets(db)

@router.get("/search", response_model=List[SweetOut])
def search(
    name: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return search_sweets(db, name, category, min_price, max_price)

@router.put("/{sweet_id}", response_model=SweetOut)
def update(
    sweet_id: int,
    data: SweetUpdate,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):
    return update_sweet(db, sweet_id, data)

@router.delete("/{sweet_id}")
def delete(
    sweet_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):
    delete_sweet(db, sweet_id)
    return {"message": "Sweet deleted successfully"}
