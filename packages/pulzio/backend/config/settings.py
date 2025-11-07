from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # App
    app_name: str = "Pulzio API"
    app_version: str = "0.1.0"
    
    # Environment (ONLY env var needed)
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # Google Cloud
    gcp_project_id: str = os.getenv("GCP_PROJECT_ID", "falconcore-v2")
    
    # Debug mode
    debug: bool = environment == "development"
    
    # CORS
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "https://pulzio.web.app",
    ]
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    
    class Config:
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()


def is_production() -> bool:
    """Check if running in production"""
    return os.getenv("ENVIRONMENT") == "production"


def is_development() -> bool:
    """Check if running in development"""
    return os.getenv("ENVIRONMENT") == "development"

