from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.sweet import Sweet

def purchase_sweet(db: Session, sweet_id: int, quantity: int):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()

    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")

    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero"
        )

    if sweet.quantity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )

    sweet.quantity -= quantity
    db.commit()
    db.refresh(sweet)
    return sweet

def restock_sweet(db: Session, sweet_id: int, quantity: int):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()

    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")

    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero"
        )

    sweet.quantity += quantity
    db.commit()
    db.refresh(sweet)
    return sweet
