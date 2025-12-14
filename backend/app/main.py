from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, sweets, inventory
from app.api.v1 import auth

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sweet Shop Management System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],  # Your React frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods including OPTIONS
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(sweets.router, prefix="/api/sweets", tags=["sweets"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])
@app.get("/")
def root():
    return {"message": "Sweet Shop Management System API running"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}