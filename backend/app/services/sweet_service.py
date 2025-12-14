# backend/app/services/sweet_service.py
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException, status
import logging

from app.core.database import get_database
from app.schemas.sweet import SweetCreate, SweetUpdate, Sweet, PurchaseRequest, RestockRequest

logger = logging.getLogger(__name__)

class SweetService:
    def __init__(self):
        self.db = get_database()
        self.sweets_collection = self.db.sweets
        self.purchases_collection = self.db.purchases
        self.restocks_collection = self.db.restocks

    async def create_sweet(self, sweet_data: SweetCreate, user_id: str) -> Sweet:
        """Insert a new sweet document."""
        try:
            # Check if sweet with same name already exists
            existing_sweet = await self.sweets_collection.find_one(
                {"name": {"$regex": f"^{sweet_data.name}$", "$options": "i"}}
            )
            if existing_sweet:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Sweet with name '{sweet_data.name}' already exists"
                )
            
            # Prepare document with timestamps
            sweet_dict = sweet_data.dict()
            sweet_dict["created_by"] = user_id
            sweet_dict["created_at"] = datetime.utcnow()
            sweet_dict["updated_at"] = datetime.utcnow()
            sweet_dict["is_active"] = True
            
            result = await self.sweets_collection.insert_one(sweet_dict)
            
            # Return the created sweet
            created_sweet = await self.sweets_collection.find_one({"_id": result.inserted_id})
            return Sweet.from_mongo(created_sweet)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating sweet: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create sweet: {str(e)}"
            )

    async def get_sweet(self, sweet_id: str) -> Optional[Sweet]:
        """Retrieve a single sweet by ID."""
        try:
            if not ObjectId.is_valid(sweet_id):
                return None
            
            sweet = await self.sweets_collection.find_one({"_id": ObjectId(sweet_id), "is_active": True})
            return Sweet.from_mongo(sweet) if sweet else None
            
        except Exception as e:
            logger.error(f"Error fetching sweet: {str(e)}")
            return None

    async def get_all_sweets(self) -> List[Sweet]:
        """Retrieve all active sweets."""
        try:
            sweets = []
            async for doc in self.sweets_collection.find({"is_active": True}).sort("created_at", -1):
                sweets.append(Sweet.from_mongo(doc))
            return sweets
        except Exception as e:
            logger.error(f"Error fetching sweets: {str(e)}")
            return []

    async def update_sweet(self, sweet_id: str, updates: SweetUpdate, user_id: str) -> Optional[Sweet]:
        """Update a sweet's details."""
        try:
            if not ObjectId.is_valid(sweet_id):
                return None
            
            # Check if sweet exists
            existing_sweet = await self.sweets_collection.find_one(
                {"_id": ObjectId(sweet_id), "is_active": True}
            )
            if not existing_sweet:
                return None
            
            # Filter out fields that are None
            update_data = {k: v for k, v in updates.dict(exclude_unset=True).items() if v is not None}
            
            # If updating name, check for duplicates
            if "name" in update_data and update_data["name"]:
                existing_with_name = await self.sweets_collection.find_one({
                    "name": {"$regex": f"^{update_data['name']}$", "$options": "i"},
                    "_id": {"$ne": ObjectId(sweet_id)},
                    "is_active": True
                })
                if existing_with_name:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Sweet with name '{update_data['name']}' already exists"
                    )
            
            # Add updated timestamp and user
            update_data["updated_at"] = datetime.utcnow()
            update_data["updated_by"] = user_id
            
            if not update_data:
                return await self.get_sweet(sweet_id)
            
            await self.sweets_collection.update_one(
                {"_id": ObjectId(sweet_id)},
                {"$set": update_data}
            )
            
            return await self.get_sweet(sweet_id)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating sweet: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update sweet: {str(e)}"
            )

    async def delete_sweet(self, sweet_id: str, user_id: str) -> bool:
        """Soft delete a sweet (Admin only)."""
        try:
            if not ObjectId.is_valid(sweet_id):
                return False
            
            # Check if sweet exists
            existing_sweet = await self.sweets_collection.find_one(
                {"_id": ObjectId(sweet_id), "is_active": True}
            )
            if not existing_sweet:
                return False
            
            # Soft delete (mark as inactive)
            result = await self.sweets_collection.update_one(
                {"_id": ObjectId(sweet_id)},
                {
                    "$set": {
                        "is_active": False,
                        "updated_at": datetime.utcnow(),
                        "updated_by": user_id,
                        "deleted_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error deleting sweet: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete sweet: {str(e)}"
            )

    async def search_sweets(
        self, 
        name: Optional[str] = None, 
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> List[Sweet]:
        """Search sweets with filters."""
        try:
            query = {"is_active": True}
            
            if name:
                query["name"] = {"$regex": name, "$options": "i"}
            
            if category and category != "all":
                query["category"] = category
            
            price_query = {}
            if min_price is not None:
                price_query["$gte"] = min_price
            if max_price is not None:
                price_query["$lte"] = max_price
            
            if price_query:
                query["price"] = price_query
            
            sweets = []
            async for doc in self.sweets_collection.find(query).sort("name", 1):
                sweets.append(Sweet.from_mongo(doc))
            return sweets
        except Exception as e:
            logger.error(f"Error searching sweets: {str(e)}")
            return []

    async def purchase_sweet(self, sweet_id: str, quantity: int, user_id: str) -> Dict[str, Any]:
        """Purchase a sweet (decrease quantity)."""
        try:
            if not ObjectId.is_valid(sweet_id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Sweet not found"
                )
            
            # Find and lock the sweet document
            sweet = await self.sweets_collection.find_one(
                {"_id": ObjectId(sweet_id), "is_active": True}
            )
            
            if not sweet:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Sweet not found or inactive"
                )
            
            current_quantity = sweet.get("quantity", 0)
            
            if current_quantity < quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock. Available: {current_quantity}, Requested: {quantity}"
                )
            
            # Update quantity
            new_quantity = current_quantity - quantity
            result = await self.sweets_collection.update_one(
                {"_id": ObjectId(sweet_id), "quantity": {"$gte": quantity}},
                {
                    "$set": {
                        "quantity": new_quantity,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Purchase failed. Please try again."
                )
            
            # Record purchase
            purchase_record = {
                "sweet_id": ObjectId(sweet_id),
                "user_id": ObjectId(user_id),
                "quantity": quantity,
                "total_price": sweet["price"] * quantity,
                "purchased_at": datetime.utcnow(),
                "status": "completed"
            }
            await self.purchases_collection.insert_one(purchase_record)
            
            # Get updated sweet
            updated_sweet = await self.get_sweet(sweet_id)
            
            return {
                "success": True,
                "message": f"Successfully purchased {quantity} item(s)",
                "sweet": updated_sweet,
                "remaining_stock": new_quantity,
                "total_paid": sweet["price"] * quantity
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error purchasing sweet: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process purchase: {str(e)}"
            )

    async def restock_sweet(self, sweet_id: str, quantity: int, user_id: str) -> Dict[str, Any]:
        """Restock a sweet (increase quantity - Admin only)."""
        try:
            if not ObjectId.is_valid(sweet_id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Sweet not found"
                )
            
            # Find the sweet
            sweet = await self.sweets_collection.find_one(
                {"_id": ObjectId(sweet_id), "is_active": True}
            )
            
            if not sweet:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Sweet not found or inactive"
                )
            
            # Update quantity
            current_quantity = sweet.get("quantity", 0)
            new_quantity = current_quantity + quantity
            
            result = await self.sweets_collection.update_one(
                {"_id": ObjectId(sweet_id)},
                {
                    "$set": {
                        "quantity": new_quantity,
                        "updated_at": datetime.utcnow(),
                        "updated_by": user_id
                    }
                }
            )
            
            if result.modified_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Restock failed. Please try again."
                )
            
            # Record restock
            restock_record = {
                "sweet_id": ObjectId(sweet_id),
                "admin_id": ObjectId(user_id),
                "quantity": quantity,
                "restocked_at": datetime.utcnow(),
                "previous_quantity": current_quantity,
                "new_quantity": new_quantity
            }
            await self.restocks_collection.insert_one(restock_record)
            
            # Get updated sweet
            updated_sweet = await self.get_sweet(sweet_id)
            
            return {
                "success": True,
                "message": f"Successfully restocked {quantity} item(s)",
                "sweet": updated_sweet,
                "new_stock": new_quantity
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error restocking sweet: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to restock sweet: {str(e)}"
            )