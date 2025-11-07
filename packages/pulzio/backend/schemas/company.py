from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str
    domain: Optional[str] = None
    hubspot_company_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    health_score: Optional[float] = None
    mrr: Optional[float] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CompanyResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    domain: Optional[str]
    hubspot_company_id: Optional[str]
    health_score: float
    mrr: Optional[float]
    status: str
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

