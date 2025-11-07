from services.secrets_service import get_secrets_service
from typing import Dict, List, Optional
import httpx


class HubSpotService:
    """Service for HubSpot API operations"""
    
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.hubapi.com"
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }
    
    async def get_companies(self, limit: int = 100) -> List[Dict]:
        """
        Get companies from HubSpot
        
        Args:
            limit: Maximum number of companies to fetch
        
        Returns:
            List of company dictionaries
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/crm/v3/objects/companies",
                headers=self.headers,
                params={"limit": limit},
            )
            response.raise_for_status()
            return response.json().get("results", [])
    
    async def get_contacts(self, limit: int = 100) -> List[Dict]:
        """Get contacts from HubSpot"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/crm/v3/objects/contacts",
                headers=self.headers,
                params={"limit": limit},
            )
            response.raise_for_status()
            return response.json().get("results", [])
    
    async def refresh_token(self, refresh_token: str) -> Dict:
        """
        Refresh access token using refresh token
        
        Args:
            refresh_token: HubSpot refresh token
        
        Returns:
            New token response with access_token and refresh_token
        """
        secrets_service = get_secrets_service()
        credentials = secrets_service.get_hubspot_credentials()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.hubapi.com/oauth/v1/token",
                data={
                    "grant_type": "refresh_token",
                    "client_id": credentials["client_id"],
                    "client_secret": credentials["client_secret"],
                    "refresh_token": refresh_token,
                },
            )
            response.raise_for_status()
            return response.json()

