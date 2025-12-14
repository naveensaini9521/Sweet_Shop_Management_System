from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from app.core.dependencies import get_current_user, admin_required
from app.services.sweet_service import SweetService
from app.schemas.sweet import RestockRequest

router = APIRouter(prefix="/inventory", tags=["inventory"])
logger = logging.getLogger(__name__)
sweet_service = SweetService()

@router.get("/low-stock")
async def get_low_stock_items(
    threshold: int = Query(10, ge=1, description="Low stock threshold"),
    current_user: dict = Depends(admin_required)
):
    """Get sweets with low stock (Admin only)"""
    try:
        sweets = await sweet_service.get_all_sweets()
        low_stock = [sweet for sweet in sweets if sweet.quantity <= threshold]
        return {
            "threshold": threshold,
            "count": len(low_stock),
            "items": low_stock
        }
    except Exception as e:
        logger.error(f"Error getting low stock items: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get low stock items"
        )

@router.get("/out-of-stock")
async def get_out_of_stock_items(
    current_user: dict = Depends(admin_required)
):
    """Get sweets that are out of stock (Admin only)"""
    try:
        sweets = await sweet_service.get_all_sweets()
        out_of_stock = [sweet for sweet in sweets if sweet.quantity == 0]
        return {
            "count": len(out_of_stock),
            "items": out_of_stock
        }
    except Exception as e:
        logger.error(f"Error getting out of stock items: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get out of stock items"
        )

@router.get("/stats")
async def get_inventory_stats(
    current_user: dict = Depends(admin_required)
):
    """Get inventory statistics (Admin only)"""
    try:
        sweets = await sweet_service.get_all_sweets()
        
        total_items = len(sweets)
        total_stock = sum(sweet.quantity for sweet in sweets)
        total_value = sum(sweet.price * sweet.quantity for sweet in sweets)
        out_of_stock = sum(1 for sweet in sweets if sweet.quantity == 0)
        low_stock = sum(1 for sweet in sweets if 0 < sweet.quantity <= 10)
        
        # Get categories count
        categories = {}
        for sweet in sweets:
            categories[sweet.category] = categories.get(sweet.category, 0) + 1
        
        return {
            "total_items": total_items,
            "total_stock": total_stock,
            "total_value": round(total_value, 2),
            "out_of_stock": out_of_stock,
            "low_stock": low_stock,
            "categories": categories,
            "average_price": round(total_value / total_stock, 2) if total_stock > 0 else 0
        }
    except Exception as e:
        logger.error(f"Error getting inventory stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get inventory statistics"
        )

@router.post("/bulk-restock")
async def bulk_restock(
    restock_data: dict,  # {sweet_id: quantity}
    current_user: dict = Depends(admin_required)
):
    """Restock multiple sweets at once (Admin only)"""
    try:
        results = []
        errors = []
        
        for sweet_id, quantity in restock_data.items():
            try:
                result = await sweet_service.restock_sweet(sweet_id, quantity, current_user["id"])
                results.append({
                    "sweet_id": sweet_id,
                    "success": True,
                    "message": result["message"]
                })
            except Exception as e:
                errors.append({
                    "sweet_id": sweet_id,
                    "error": str(e)
                })
        
        return {
            "success": len(errors) == 0,
            "results": results,
            "errors": errors,
            "total_restocked": len(results)
        }
    except Exception as e:
        logger.error(f"Error in bulk restock: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process bulk restock"
        )