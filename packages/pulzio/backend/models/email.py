from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from models.database import Base
import uuid


class Email(Base):
    __tablename__ = "emails"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(String, ForeignKey("companies.id"), index=True)
    gmail_message_id = Column(String, unique=True, index=True)
    thread_id = Column(String, index=True)
    from_email = Column(String, nullable=False, index=True)
    to_email = Column(String, nullable=False)
    subject = Column(String)
    body = Column(Text)
    sentiment = Column(String)  # positive, neutral, negative
    urgency = Column(String)  # low, medium, high
    churn_signals = Column(JSON)  # AI-detected signals
    action_items = Column(JSON)  # Extracted action items
    ai_analysis = Column(JSON)  # Full AI analysis
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization", backref="emails")
    company = relationship("Company", backref="emails")

