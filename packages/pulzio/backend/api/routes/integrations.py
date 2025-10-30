from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

@router.get("/")
def list_integrations():
    return {
        "integrations": [
            {
                "id": "hubspot",
                "name": "HubSpot",
                "status": "available",
                "description": "Sync companies and deals from HubSpot CRM"
            },
            {
                "id": "salesforce",
                "name": "Salesforce",
                "status": "coming_soon",
                "description": "Sync accounts and opportunities from Salesforce"
            },
            {
                "id": "segment",
                "name": "Segment",
                "status": "coming_soon",
                "description": "Track product usage events"
            }
        ]
    }
