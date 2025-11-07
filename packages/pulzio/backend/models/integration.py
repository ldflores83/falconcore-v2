from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from models.database import Base
import uuid


class Integration(Base):
    __tablename__ = "integrations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    integration_type = Column(String, nullable=False)  # hubspot, gmail, slack
    access_token = Column(Text)  # Encrypted in production
    refresh_token = Column(Text)  # Encrypted in production
    expires_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    metadata = Column(JSON)  # Additional integration config
    last_synced_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", backref="integrations")

