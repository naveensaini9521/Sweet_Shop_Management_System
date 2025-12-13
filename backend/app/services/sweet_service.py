from sqlalchemy.orm import Session
from app.models.sweet import Sweet
from fastapi import HTTPException, status

def create_sweet(db: Session, data):
    sweet = Sweet(**data.dict())
    db.add(sweet)
    db.commit()
    db.refresh(sweet)
    return sweet

def get_all_sweets(db: Session):
    return db.query(Sweet).all()

def search_sweets(db: Session, name=None, category=None, min_price=None, max_price=None):
    query = db.query(Sweet)

    if name:
        query = query.filter(Sweet.name.ilike(f"%{name}%"))
    if category:
        query = query.filter(Sweet.category.ilike(f"%{category}%"))
    if min_price is not None:
        query = query.filter(Sweet.price >= min_price)
    if max_price is not None:
        query = query.filter(Sweet.price <= max_price)

    return query.all()

def update_sweet(db: Session, sweet_id: int, data):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(sweet, key, value)

    db.commit()
    db.refresh(sweet)
    return sweet

def delete_sweet(db: Session, sweet_id: int):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")

    db.delete(sweet)
    db.commit()
