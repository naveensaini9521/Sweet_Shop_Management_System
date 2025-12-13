from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.services.inventory_service import purchase_sweet, restock_sweet
from app.core.dependencies import get_db, get_current_user, admin_required

router = APIRouter()

class QuantityRequest(BaseModel):
    quantity: int


@router.post("/purchase/{sweet_id}")
def purchase(
    sweet_id: int,
    data: QuantityRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    sweet = purchase_sweet(db, sweet_id, data.quantity)
    return {
        "message": "Purchase successful",
        "sweet_id": sweet.id,
        "remaining_quantity": sweet.quantity
    }


@router.post("/restock/{sweet_id}")
def restock(
    sweet_id: int,
    data: QuantityRequest,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):
    sweet = restock_sweet(db, sweet_id, data.quantity)
    return {
        "message": "Restock successful",
        "sweet_id": sweet.id,
        "new_quantity": sweet.quantity
    }
