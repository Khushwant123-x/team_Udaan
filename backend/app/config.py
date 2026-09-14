import os
import json
from typing import List, Any
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "NAWI Test Report Generator (OIML R 76)"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = ""
    
    # JWT Auth
    JWT_SECRET_KEY: str = "nawi-oiml-r76-legal-metrology-secret-key-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Storage & Labs
    UPLOAD_DIR: str = ""
    MAX_UPLOAD_SIZE_MB: int = 10
    LAB_CODE: str = "NPL-DELHI"
    LAB_NAME: str = "National Physical Laboratory / Legal Metrology Dept"
    LAB_LOCATION: str = "New Delhi, India"
    
    # CORS
    BACKEND_CORS_ORIGINS: Any = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]

    @property
    def get_database_url(self) -> str:
        if self.DATABASE_URL and self.DATABASE_URL.strip():
            url = self.DATABASE_URL.strip()
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url
        return "sqlite:///:memory:"

    @property
    def get_upload_dir(self) -> str:
        if self.UPLOAD_DIR and self.UPLOAD_DIR.strip():
            return self.UPLOAD_DIR
        if (
            os.getenv("VERCEL")
            or os.getenv("VERCEL_ENV")
            or os.getenv("VERCEL_REGION")
            or os.getenv("AWS_LAMBDA_FUNCTION_NAME")
            or os.getenv("LAMBDA_TASK_ROOT")
            or not os.access(".", os.W_OK)
        ):
            import tempfile
            up_dir = os.path.join(tempfile.gettempdir(), "uploads")
            os.makedirs(up_dir, exist_ok=True)
            return up_dir
        return "./uploads"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if not v or v.strip() == "":
                return ["*"]
            if v.startswith("["):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return [str(item) for item in v]
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
