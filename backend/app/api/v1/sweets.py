# backend/app/api/v1/sweets.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional
import logging

from app.schemas.sweet import SweetCreate, SweetUpdate, Sweet, PurchaseRequest, RestockRequest
from app.services.sweet_service import SweetService
from app.core.dependencies import get_current_user, admin_required, user_or_admin_required

router = APIRouter()
logger = logging.getLogger(__name__)
sweet_service = SweetService()

@router.post("/", response_model=Sweet, status_code=status.HTTP_201_CREATED)
async def add_sweet(
    data: SweetCreate,
    current_user: dict = Depends(admin_required)
):
    """Add a new sweet (Admin only)"""
    try:
        return await sweet_service.create_sweet(data, current_user["id"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating sweet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create sweet"
        )

@router.get("/", response_model=List[Sweet])
async def list_sweets(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of items to return"),
    current_user: dict = Depends(user_or_admin_required)
):
    """Get all sweets (Protected)"""
    try:
        sweets = await sweet_service.get_all_sweets()
        return sweets[skip:skip + limit]
    except Exception as e:
        logger.error(f"Error fetching sweets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch sweets"
        )

@router.get("/search", response_model=List[Sweet])
async def search_sweets(
    name: Optional[str] = Query(None, description="Search by name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(user_or_admin_required)
):
    """Search sweets with filters (Protected)"""
    try:
        sweets = await sweet_service.search_sweets(name, category, min_price, max_price)
        return sweets[skip:skip + limit]
    except Exception as e:
        logger.error(f"Error searching sweets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search sweets"
        )

@router.get("/{sweet_id}", response_model=Sweet)
async def get_sweet_by_id(
    sweet_id: str,
    current_user: dict = Depends(user_or_admin_required)
):
    """Get a specific sweet by ID (Protected)"""
    try:
        sweet = await sweet_service.get_sweet(sweet_id)
        if sweet is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sweet not found"
            )
        return sweet
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching sweet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch sweet"
        )

@router.put("/{sweet_id}", response_model=Sweet)
async def update_sweet(
    sweet_id: str,
    data: SweetUpdate,
    current_user: dict = Depends(admin_required)
):
    """Update a sweet's details (Admin only)"""
    try:
        sweet = await sweet_service.update_sweet(sweet_id, data, current_user["id"])
        if sweet is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sweet not found"
            )
        return sweet
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating sweet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update sweet"
        )

@router.delete("/{sweet_id}")
async def delete_sweet(
    sweet_id: str,
    current_user: dict = Depends(admin_required)
):
    """Delete a sweet (Admin only)"""
    try:
        success = await sweet_service.delete_sweet(sweet_id, current_user["id"])
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sweet not found"
            )
        return {"message": "Sweet deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting sweet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete sweet"
        )

@router.post("/{sweet_id}/purchase")
async def purchase_sweet(
    sweet_id: str,
    purchase_data: PurchaseRequest,
    current_user: dict = Depends(user_or_admin_required)
):
    """Purchase a sweet, decreasing its quantity (Protected)"""
    try:
        result = await sweet_service.purchase_sweet(
            sweet_id, 
            purchase_data.quantity, 
            current_user["id"]
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error purchasing sweet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process purchase"
        )

@router.post("/{sweet_id}/restock")
async def restock_sweet(
    sweet_id: str,
    restock_data: RestockRequest,
    current_user: dict = Depends(admin_required)
):
    """Restock a sweet, increasing its quantity (Admin only)"""
    try:
        result = await sweet_service.restock_sweet(
            sweet_id, 
            restock_data.quantity, 
            current_user["id"]
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restocking sweet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restock sweet"
        )

@router.get("/categories/list", response_model=List[str])
async def get_categories(current_user: dict = Depends(user_or_admin_required)):
    """Get all unique sweet categories"""
    try:
        # You can implement this in sweet_service or handle here
        sweets = await sweet_service.get_all_sweets()
        categories = list(set([sweet.category for sweet in sweets if sweet.category]))
        return sorted(categories)
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        return []