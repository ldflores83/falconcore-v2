from services.secrets_service import get_secrets_service
from anthropic import Anthropic
from typing import Dict, List, Optional


class AIService:
    """Service for AI operations using Anthropic Claude"""
    
    def __init__(self):
        secrets_service = get_secrets_service()
        api_key = secrets_service.get_anthropic_api_key()
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-3-5-sonnet-20241022"
    
    def analyze_email(
        self,
        email_body: str,
        email_subject: str,
        company_context: Optional[Dict] = None,
    ) -> Dict:
        """
        Analyze email for sentiment, urgency, and churn signals
        
        Args:
            email_body: Email body text
            email_subject: Email subject
            company_context: Optional company context (MRR, health score, etc.)
        
        Returns:
            Analysis dictionary with sentiment, urgency, churn_signals, action_items
        """
        context_str = ""
        if company_context:
            context_str = f"\nCompany context: {company_context}"
        
        prompt = f"""Analyze this customer success email and extract:

1. Sentiment (positive, neutral, negative)
2. Urgency (low, medium, high)
3. Churn signals (list any concerns, complaints, or red flags)
4. Action items (specific tasks that need to be done)

Email Subject: {email_subject}
Email Body: {email_body}
{context_str}

Return a JSON object with:
{{
  "sentiment": "positive|neutral|negative",
  "urgency": "low|medium|high",
  "churn_signals": ["signal1", "signal2"],
  "action_items": ["action1", "action2"]
}}"""
        
        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ],
            )
            
            # Parse response (assuming JSON response)
            import json
            response_text = message.content[0].text
            return json.loads(response_text)
        except Exception as e:
            raise ValueError(f"AI analysis failed: {str(e)}")
    
    def predict_churn(self, company_data: Dict) -> Dict:
        """
        Predict churn probability for a company
        
        Args:
            company_data: Company data (health score, MRR, engagement, etc.)
        
        Returns:
            Churn prediction with probability and reasons
        """
        # TODO: Implement churn prediction
        return {
            "probability": 0.0,
            "reasons": [],
        }

