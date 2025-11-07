from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    firebase_uid: str
    email: EmailStr
    name: Optional[str] = None
    organization_name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    firebase_uid: str
    email: str
    name: Optional[str]
    organization_id: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

