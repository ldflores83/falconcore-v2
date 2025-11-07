from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from schemas.integration import GmailOAuthRequest, GmailOAuthResponse
from services.secrets_service import get_secrets_service
from api.dependencies import get_organization_id
import urllib.parse

router = APIRouter(prefix="/gmail", tags=["integrations"])


@router.post("/authorize", response_model=GmailOAuthResponse)
async def authorize_gmail(
    request: GmailOAuthRequest,
    db: Session = Depends(get_db),
):
    """
    Generate Gmail OAuth authorization URL
    
    TODO: Implement full OAuth flow
    """
    secrets_service = get_secrets_service()
    credentials = secrets_service.get_google_credentials()
    
    # Build authorization URL
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": credentials["client_id"],
        "scope": "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
        "redirect_uri": "http://localhost:8000/api/integrations/gmail/callback",
        "response_type": "code",
        "access_type": "offline",
        "prompt": "consent",
    }
    
    auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    return GmailOAuthResponse(authorization_url=auth_url)


@router.get("/callback")
async def gmail_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
):
    """
    Handle Gmail OAuth callback
    
    TODO: Implement token exchange and storage
    """
    return {"message": "Gmail OAuth callback - TODO: Implement"}

