# app/main.py
import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.api.endpoints import api_router
from app.db.session import engine
from app.db.base_class import Base
from app.core.config import settings

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/pocs", exist_ok=True)

# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="P0cit - Pentester PoC Sharing Platform",
    description="A secure platform for pentesters to share PoCs with clients",
    version="1.0.0"
)

# Configure CORS
origins = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:3000,http://localhost:3001,http://frontend:3000,http://frontend:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API router
app.include_router(api_router, prefix="/api")

# Custom exception handler for better error messages
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail)},
    )

# Root endpoint
@app.get("/", tags=["root"])
async def root():
    return {"message": "Welcome to P0cit - Pentester PoC Sharing Platform"}