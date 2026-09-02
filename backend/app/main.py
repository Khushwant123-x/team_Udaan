import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database import engine, Base, ensure_db_initialized
from backend.app.api import auth, users, manufacturers, instruments, sessions, dashboard

# Ensure tables & seed data on startup
ensure_db_initialized()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def debug_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error_message": str(exc),
            "error_type": type(exc).__name__,
            "traceback": traceback.format_exc()
        }
    )

# Static Uploads directory
upload_dir = settings.get_upload_dir
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Mount Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(manufacturers.router, prefix=settings.API_V1_STR)
app.include_router(instruments.router, prefix=settings.API_V1_STR)
app.include_router(sessions.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "lab": settings.LAB_NAME,
        "lab_code": settings.LAB_CODE,
        "standard": "OIML Recommendation R 76-1:2006",
        "status": "Online",
        "docs": "/docs"
    }
