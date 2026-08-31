import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings

# Handle Vercel serverless environment paths (Vercel filesystem is read-only except /tmp)
if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    if settings.DATABASE_URL.startswith("sqlite"):
        settings.DATABASE_URL = "sqlite:////tmp/nawi_test.db"
    settings.UPLOAD_DIR = "/tmp/uploads"

from backend.app.database import engine, Base
from backend.app.api import auth, users, manufacturers, instruments, sessions, dashboard

# Create DB tables & Auto-seed initial data
Base.metadata.create_all(bind=engine)
try:
    from backend.seed_data import seed_db
    seed_db()
except Exception as e:
    print(f"Auto-seeding warning: {e}")

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

# Static Uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

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
