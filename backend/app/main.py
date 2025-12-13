from fastapi import FastAPI
from app.api.v1 import auth, sweets, inventory

app = FastAPI(
    title="Sweet Shop Management System",
    version="1.0.0"
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(sweets.router, prefix="/api/sweets", tags=["Sweets"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])

@app.get("/")
def root():
    return {"message": "Sweet Shop Management System API running"}
