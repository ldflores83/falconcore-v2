from fastapi import Depends, Request
from sqlalchemy.orm import Session
from models.database import get_db
from middleware.auth import get_current_user
from typing import Optional

# Database dependency
def get_database() -> Session:
    """Dependency for database session"""
    return Depends(get_db)


# Auth dependencies
def get_authenticated_user():
    """Dependency for authenticated user"""
    return Depends(get_current_user)


def get_organization_id(request: Request, user: dict = Depends(get_current_user)) -> str:
    """
    Extract organization_id from authenticated user
    
    Usage:
        @router.get("/companies")
        async def get_companies(org_id: str = Depends(get_organization_id)):
            ...
    """
    # TODO: Get organization_id from user token or database
    # For now, return from user claims
    return user.get("organization_id") or user.get("org_id")

