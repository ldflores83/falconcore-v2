from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from schemas.integration import SlackOAuthRequest, SlackOAuthResponse
from services.secrets_service import get_secrets_service
from api.dependencies import get_organization_id
import urllib.parse

router = APIRouter(prefix="/slack", tags=["integrations"])


@router.post("/authorize", response_model=SlackOAuthResponse)
async def authorize_slack(
    request: SlackOAuthRequest,
    db: Session = Depends(get_db),
):
    """
    Generate Slack OAuth authorization URL
    
    TODO: Implement full OAuth flow
    """
    secrets_service = get_secrets_service()
    credentials = secrets_service.get_slack_credentials()
    
    # Build authorization URL
    base_url = "https://slack.com/oauth/v2/authorize"
    params = {
        "client_id": credentials["client_id"],
        "scope": "chat:write channels:read",
        "redirect_uri": "http://localhost:8000/api/integrations/slack/callback",
    }
    
    auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    return SlackOAuthResponse(authorization_url=auth_url)


@router.get("/callback")
async def slack_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
):
    """
    Handle Slack OAuth callback
    
    TODO: Implement token exchange and storage
    """
    return {"message": "Slack OAuth callback - TODO: Implement"}

