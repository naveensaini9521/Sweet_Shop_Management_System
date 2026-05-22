from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
from app.api.v1 import auth, sweets, inventory
import logging

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

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "https://sweet-shop.onrender.com",
        "https://sweet-shop-management-system.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# React Build Path
REACT_BUILD_PATH = Path(__file__).resolve().parent.parent / "frontend_dist"

# Serve React Frontend
if REACT_BUILD_PATH.exists():
    logger.info(f"Serving React app from: {REACT_BUILD_PATH}")

    # Mount Vite assets folder
    app.mount(
        "/assets",
        StaticFiles(directory=REACT_BUILD_PATH / "assets"),
        name="assets"
    )

    # Root Route
    @app.get("/")
    async def serve_react_app():
        return FileResponse(REACT_BUILD_PATH / "index.html")

    # React Router Catch-All
    @app.get("/{full_path:path}")
    async def serve_react_routes(request: Request, full_path: str):

        # Ignore API routes
        if full_path.startswith("api/"):
            return JSONResponse(
                status_code=404,
                content={"detail": f"API endpoint not found: {full_path}"}
            )

        # Serve direct files if they exist
        requested_file = REACT_BUILD_PATH / full_path

        if requested_file.exists() and requested_file.is_file():
            return FileResponse(requested_file)

        # Serve assets files
        asset_file = REACT_BUILD_PATH / "assets" / full_path

        if asset_file.exists() and asset_file.is_file():
            return FileResponse(asset_file)

        # Fallback to index.html for React Router
        return FileResponse(REACT_BUILD_PATH / "index.html")

else:
    logger.warning(f"React build not found at: {REACT_BUILD_PATH}")

    @app.get("/")
    async def root():
        return {
            "message": "Sweet Shop Management System API running"
        }

# API Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(sweets.router, prefix="/api/sweets", tags=["sweets"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])

# Health Check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "sweet-shop-api"
    }

@app.get("/api/health")
async def api_health_check():
    return {
        "status": "healthy",
        "service": "sweet-shop-api",
        "version": "1.0.0"
    }