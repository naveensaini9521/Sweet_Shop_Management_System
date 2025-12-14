from typing import List, Optional, Dict
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException, status

from app.core.database import get_database
from app.schemas.sweet import SweetCreate, SweetUpdate, Sweet

class SweetService:
    def __init__(self):
        self.db = get_database()
        self.sweets = self.db.sweets
        self.purchases = self.db.purchases

    async def create_sweet(self, sweet_data: SweetCreate, user_id: str) -> Sweet:
        existing = await self.sweets.find_one({"name": sweet_data.name})
        if existing:
            raise HTTPException(status_code=400, detail="Sweet name already exists")
        
        sweet_dict = sweet_data.dict()
        sweet_dict["created_by"] = user_id
        sweet_dict["created_at"] = sweet_dict["updated_at"] = datetime.utcnow()
        sweet_dict["is_active"] = True
        
        result = await self.sweets.insert_one(sweet_dict)
        created = await self.sweets.find_one({"_id": result.inserted_id})
        return Sweet.from_mongo(created)

    async def get_all_sweets(self) -> List[Sweet]:
        sweets = []
        async for doc in self.sweets.find({"is_active": True}):
            sweets.append(Sweet.from_mongo(doc))
        return sweets

    async def update_sweet(self, sweet_id: str, updates: SweetUpdate, user_id: str) -> Optional[Sweet]:
        if not ObjectId.is_valid(sweet_id):
            return None
        
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            update_data["updated_by"] = user_id
            
            await self.sweets.update_one(
                {"_id": ObjectId(sweet_id)},
                {"$set": update_data}
            )
        
        return await self.get_sweet(sweet_id)

    async def get_sweet(self, sweet_id: str) -> Optional[Sweet]:
        if ObjectId.is_valid(sweet_id):
            sweet = await self.sweets.find_one({"_id": ObjectId(sweet_id), "is_active": True})
            return Sweet.from_mongo(sweet)
        return None

    async def delete_sweet(self, sweet_id: str, user_id: str) -> bool:
        if ObjectId.is_valid(sweet_id):
            result = await self.sweets.update_one(
                {"_id": ObjectId(sweet_id)},
                {"$set": {"is_active": False, "deleted_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        return False

    async def search_sweets(self, name=None, category=None, min_price=None, max_price=None) -> List[Sweet]:
        query = {"is_active": True}
        if name:
            query["name"] = {"$regex": name, "$options": "i"}
        if category and category != "all":
            query["category"] = category
        if min_price or max_price:
            query["price"] = {}
            if min_price:
                query["price"]["$gte"] = min_price
            if max_price:
                query["price"]["$lte"] = max_price
        
        sweets = []
        async for doc in self.sweets.find(query):
            sweets.append(Sweet.from_mongo(doc))
        return sweets

    async def purchase_sweet(self, sweet_id: str, quantity: int, user_id: str) -> Dict:
        sweet = await self.get_sweet(sweet_id)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        
        if sweet.quantity < quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        
        await self.sweets.update_one(
            {"_id": ObjectId(sweet_id)},
            {"$inc": {"quantity": -quantity}}
        )
        
        await self.purchases.insert_one({
            "sweet_id": ObjectId(sweet_id),
            "user_id": user_id,
            "quantity": quantity,
            "purchased_at": datetime.utcnow()
        })
        
        return {"message": f"Purchased {quantity} items", "success": True}

    async def restock_sweet(self, sweet_id: str, quantity: int, user_id: str) -> Dict:
        sweet = await self.get_sweet(sweet_id)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        
        await self.sweets.update_one(
            {"_id": ObjectId(sweet_id)},
            {"$inc": {"quantity": quantity}}
        )
        
        return {"message": f"Restocked {quantity} items", "success": True}