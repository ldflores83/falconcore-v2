from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "pulzio-api",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/ready")
def readiness_check():
    # TODO: Check database, redis connections
    return {
        "status": "ready",
        "checks": {
            "database": "ok",
            "redis": "ok"
        }
    }
