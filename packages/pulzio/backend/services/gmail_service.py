from services.secrets_service import get_secrets_service
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from typing import Dict, List, Optional
import os


class GmailService:
    """Service for Gmail API operations"""
    
    def __init__(self, credentials_json: Dict):
        """
        Initialize Gmail service with credentials
        
        Args:
            credentials_json: OAuth2 credentials dictionary
        """
        self.credentials = Credentials.from_authorized_user_info(credentials_json)
        self.service = build("gmail", "v1", credentials=self.credentials)
    
    def get_messages(self, query: str = "", max_results: int = 10) -> List[Dict]:
        """
        Get messages from Gmail
        
        Args:
            query: Gmail search query
            max_results: Maximum number of messages
        
        Returns:
            List of message dictionaries
        """
        try:
            results = self.service.users().messages().list(
                userId="me",
                q=query,
                maxResults=max_results,
            ).execute()
            return results.get("messages", [])
        except Exception as e:
            raise ValueError(f"Failed to get messages: {str(e)}")
    
    def get_message(self, message_id: str) -> Dict:
        """
        Get full message by ID
        
        Args:
            message_id: Gmail message ID
        
        Returns:
            Full message dictionary
        """
        try:
            return self.service.users().messages().get(
                userId="me",
                id=message_id,
            ).execute()
        except Exception as e:
            raise ValueError(f"Failed to get message: {str(e)}")

