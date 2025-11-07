from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from models.company import Company
from schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from api.dependencies import get_organization_id
from typing import List

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/", response_model=List[CompanyResponse])
async def list_companies(
    org_id: str = Depends(get_organization_id),
    db: Session = Depends(get_db),
):
    """List all companies for organization"""
    companies = db.query(Company).filter(Company.organization_id == org_id).all()
    return companies


@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_data: CompanyCreate,
    org_id: str = Depends(get_organization_id),
    db: Session = Depends(get_db),
):
    """Create new company"""
    company = Company(
        organization_id=org_id,
        name=company_data.name,
        domain=company_data.domain,
        hubspot_company_id=company_data.hubspot_company_id,
        metadata=company_data.metadata,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: str,
    org_id: str = Depends(get_organization_id),
    db: Session = Depends(get_db),
):
    """Get company by ID"""
    company = db.query(Company).filter(
        Company.id == company_id,
        Company.organization_id == org_id,
    ).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )
    
    return company

