from sqlalchemy import Column, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from models.database import Base
import uuid


class Signal(Base):
    __tablename__ = "signals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    signal_type = Column(String, nullable=False)  # churn, expansion, support, engagement
    severity = Column(String, default="medium")  # low, medium, high, critical
    confidence = Column(Float)  # 0-1
    source = Column(String)  # email, hubspot, product_usage
    metadata = Column(JSON)  # Additional signal data
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization", backref="signals")
    company = relationship("Company", backref="signals")

