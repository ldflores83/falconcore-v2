from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class IntegrationCreate(BaseModel):
    integration_type: str  # hubspot, gmail, slack
    metadata: Optional[Dict[str, Any]] = None


class IntegrationResponse(BaseModel):
    id: str
    organization_id: str
    integration_type: str
    is_active: bool
    metadata: Optional[Dict[str, Any]]
    last_synced_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class HubSpotOAuthRequest(BaseModel):
    organization_id: str


class HubSpotOAuthResponse(BaseModel):
    authorization_url: str


class GmailOAuthRequest(BaseModel):
    organization_id: str


class GmailOAuthResponse(BaseModel):
    authorization_url: str


class SlackOAuthRequest(BaseModel):
    organization_id: str


class SlackOAuthResponse(BaseModel):
    authorization_url: str

