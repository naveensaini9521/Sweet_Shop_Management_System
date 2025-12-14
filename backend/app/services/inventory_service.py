from typing import Optional, Dict, Any
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException, status

from app.core.database import get_database
from app.schemas.sweet import Sweet

async def purchase_sweet(sweet_id: str, quantity: int = 1) -> Optional[Sweet]:
    """Purchase a sweet, decreasing its quantity."""
    try:
        if not ObjectId.is_valid(sweet_id):
            return None
        
        db = get_database()
        collection = db.sweets
        
        # Find the sweet
        sweet = await collection.find_one({"_id": ObjectId(sweet_id)})
        if not sweet:
            return None
        
        # Check if enough quantity is available
        current_quantity = sweet.get("quantity", 0)
        if current_quantity < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock. Available: {current_quantity}, Requested: {quantity}"
            )
        
        # Decrease quantity
        await collection.update_one(
            {"_id": ObjectId(sweet_id)},
            {
                "$inc": {"quantity": -quantity},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # Record purchase history
        purchase_data = {
            "sweet_id": ObjectId(sweet_id),
            "sweet_name": sweet.get("name"),
            "quantity": quantity,
            "unit_price": sweet.get("price"),
            "total_amount": sweet.get("price", 0) * quantity,
            "purchased_at": datetime.utcnow()
        }
        
        await db.purchases.insert_one(purchase_data)
        
        # Return updated sweet
        updated_sweet = await collection.find_one({"_id": ObjectId(sweet_id)})
        return Sweet.from_mongo(updated_sweet) if updated_sweet else None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process purchase: {str(e)}"
        )

async def restock_sweet(sweet_id: str, quantity: int) -> Optional[Sweet]:
    """Restock a sweet, increasing its quantity (Admin only)."""
    try:
        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than 0"
            )
        
        db = get_database()
        collection = db.sweets
        
        if not ObjectId.is_valid(sweet_id):
            return None
        
        # Find the sweet
        sweet = await collection.find_one({"_id": ObjectId(sweet_id)})
        if not sweet:
            return None
        
        # Increase quantity
        await collection.update_one(
            {"_id": ObjectId(sweet_id)},
            {
                "$inc": {"quantity": quantity},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # Record restock history
        restock_data = {
            "sweet_id": ObjectId(sweet_id),
            "sweet_name": sweet.get("name"),
            "quantity": quantity,
            "restocked_at": datetime.utcnow()
        }
        
        await db.restocks.insert_one(restock_data)
        
        # Return updated sweet
        updated_sweet = await collection.find_one({"_id": ObjectId(sweet_id)})
        return Sweet.from_mongo(updated_sweet) if updated_sweet else None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process restock: {str(e)}"
        )

async def get_purchase_history(sweet_id: Optional[str] = None, limit: int = 100) -> list:
    """Get purchase history for a sweet or all purchases."""
    try:
        db = get_database()
        query = {}
        
        if sweet_id and ObjectId.is_valid(sweet_id):
            query["sweet_id"] = ObjectId(sweet_id)
        
        purchases = []
        async for doc in db.purchases.find(query).sort("purchased_at", -1).limit(limit):
            doc["_id"] = str(doc["_id"])
            doc["sweet_id"] = str(doc["sweet_id"])
            purchases.append(doc)
        
        return purchases
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get purchase history: {str(e)}"
        )

async def get_restock_history(sweet_id: Optional[str] = None, limit: int = 100) -> list:
    """Get restock history for a sweet or all restocks."""
    try:
        db = get_database()
        query = {}
        
        if sweet_id and ObjectId.is_valid(sweet_id):
            query["sweet_id"] = ObjectId(sweet_id)
        
        restocks = []
        async for doc in db.restocks.find(query).sort("restocked_at", -1).limit(limit):
            doc["_id"] = str(doc["_id"])
            doc["sweet_id"] = str(doc["sweet_id"])
            restocks.append(doc)
        
        return restocks
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get restock history: {str(e)}"
        )