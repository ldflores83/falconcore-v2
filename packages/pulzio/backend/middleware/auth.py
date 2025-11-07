from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
import json
from services.secrets_service import get_secrets_service
import os

# Initialize Firebase Admin (only once)
_firebase_initialized = False


def initialize_firebase():
    """Initialize Firebase Admin SDK with credentials from Secret Manager"""
    global _firebase_initialized
    
    if _firebase_initialized:
        return
    
    try:
        secrets_service = get_secrets_service()
        firebase_json = secrets_service.get_firebase_credentials()
        cred_dict = json.loads(firebase_json)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
    except Exception as e:
        raise ValueError(f"Failed to initialize Firebase Admin: {str(e)}")


security = HTTPBearer()


async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = None) -> dict:
    """
    Verify Firebase JWT token and return decoded token
    
    Args:
        credentials: HTTPBearer credentials from request header
    
    Returns:
        Decoded Firebase token with user info
    
    Raises:
        HTTPException: If token is invalid or missing
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )
    
    try:
        initialize_firebase()
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )


async def get_current_user(request: Request) -> dict:
    """
    FastAPI dependency to get current authenticated user
    
    Usage:
        @router.get("/me")
        async def get_me(user: dict = Depends(get_current_user)):
            return user
    """
    credentials = await security(request)
    return await verify_firebase_token(credentials)

