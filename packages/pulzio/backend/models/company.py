from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from models.database import Base
import uuid


class Company(Base):
    __tablename__ = "companies"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    domain = Column(String, index=True)
    hubspot_company_id = Column(String, index=True)
    health_score = Column(Float, default=0.0)  # 0-100
    mrr = Column(Float)  # Monthly Recurring Revenue
    status = Column(String, default="active")  # active, churned, at_risk
    metadata = Column(JSON)  # Additional data from integrations
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_synced_at = Column(DateTime(timezone=True))

    # Relationships
    organization = relationship("Organization", backref="companies")

