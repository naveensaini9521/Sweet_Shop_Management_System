from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def inventory_status():
    return {"message": "Inventory routes will be implemented next"}
