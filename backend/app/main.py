from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
from app.api.v1 import auth, sweets, inventory
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sweet Shop Management System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware - IMPORTANT for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Path to your React build
REACT_BUILD_PATH = Path(__file__).resolve().parents[2] / "frontend" / "dist"

# Serve React static files
if REACT_BUILD_PATH.exists():
    logger.info(f"Serving React app from: {REACT_BUILD_PATH}")
    
    # Mount static files
    app.mount("/static", StaticFiles(directory=REACT_BUILD_PATH / "static"), name="static")
    
    # Serve index.html for root
    @app.get("/")
    async def serve_react_app():
        return FileResponse(REACT_BUILD_PATH / "index.html")
    
    # Catch-all for React Router
    @app.get("/{full_path:path}")
    async def serve_react_path(request: Request, full_path: str):
        # Check if it's an API call
        if full_path.startswith("api/"):
            # Let API routes handle it (they won't reach here due to prefix)
            return JSONResponse(status_code=404, content={"detail": f"API endpoint not found: {full_path}"}
            )
        
        # Check if it's a static file
        static_file = REACT_BUILD_PATH / full_path
        if static_file.exists() and static_file.is_file():
            return FileResponse(static_file)
        
        # Check for files in static directory
        static_subpath = REACT_BUILD_PATH / "static" / full_path
        if static_subpath.exists() and static_subpath.is_file():
            return FileResponse(static_subpath)
        
        # Default to index.html for React Router
        return FileResponse(REACT_BUILD_PATH / "index.html")
else:
    logger.warning(f"React build not found at {REACT_BUILD_PATH}")
    
    @app.get("/")
    def root():
        return {"message": "Sweet Shop Management System API running"}

# API endpoints
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(sweets.router, prefix="/api/sweets", tags=["sweets"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])

# Health checks
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "sweet-shop-api"}

@app.get("/api/health")
def api_health_check():
    return {"status": "healthy", "service": "sweet-shop-api", "version": "1.0.0"}

