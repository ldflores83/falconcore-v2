from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from models.user import User
from models.organization import Organization
from schemas.auth import UserCreate, UserResponse
from middleware.auth import get_current_user
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Create new user and organization
    
    TODO: Implement full signup logic
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.firebase_uid == user_data.firebase_uid).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )
    
    # Create organization if provided
    organization = None
    if user_data.organization_name:
        organization = Organization(
            name=user_data.organization_name,
            slug=user_data.organization_name.lower().replace(" ", "-"),
        )
        db.add(organization)
        db.commit()
        db.refresh(organization)
    
    # Create user
    user = User(
        firebase_uid=user_data.firebase_uid,
        email=user_data.email,
        name=user_data.name,
        organization_id=organization.id if organization else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user information
    """
    firebase_uid = user.get("uid")
    db_user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return db_user

