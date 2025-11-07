from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from schemas.integration import HubSpotOAuthRequest, HubSpotOAuthResponse
from services.secrets_service import get_secrets_service
from api.dependencies import get_organization_id
import urllib.parse

router = APIRouter(prefix="/hubspot", tags=["integrations"])


@router.post("/authorize", response_model=HubSpotOAuthResponse)
async def authorize_hubspot(
    request: HubSpotOAuthRequest,
    db: Session = Depends(get_db),
):
    """
    Generate HubSpot OAuth authorization URL
    
    TODO: Implement full OAuth flow
    """
    secrets_service = get_secrets_service()
    credentials = secrets_service.get_hubspot_credentials()
    
    # Build authorization URL
    base_url = "https://app.hubspot.com/oauth/authorize"
    params = {
        "client_id": credentials["client_id"],
        "scope": "crm.objects.companies.read crm.objects.contacts.read crm.objects.deals.read",
        "redirect_uri": "http://localhost:8000/api/integrations/hubspot/callback",
    }
    
    auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    return HubSpotOAuthResponse(authorization_url=auth_url)


@router.get("/callback")
async def hubspot_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
):
    """
    Handle HubSpot OAuth callback
    
    TODO: Implement token exchange and storage
    """
    return {"message": "HubSpot OAuth callback - TODO: Implement"}

