from google.cloud import secretmanager
from functools import lru_cache
import os
from typing import Optional


class SecretsService:
    """
    Service to access secrets from Google Secret Manager
    
    ALL secrets are stored in Secret Manager with environment prefix:
    - dev-* for development
    - prod-* for production
    
    Example:
    - dev-database-url
    - prod-database-url
    - dev-hubspot-client-id
    - prod-hubspot-client-id
    """
    
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID", "falconcore-v2")
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.client = secretmanager.SecretManagerServiceClient()
        
        # Validate environment
        if self.environment not in ["development", "staging", "production"]:
            raise ValueError(f"Invalid ENVIRONMENT: {self.environment}")
    
    def _get_secret_name(self, base_name: str) -> str:
        """
        Get full secret name with environment prefix
        
        Args:
            base_name: Base name of secret (e.g., 'database-url')
        
        Returns:
            Full secret name (e.g., 'dev-database-url' or 'prod-database-url')
        """
        env_prefix = "dev" if self.environment == "development" else "prod"
        return f"{env_prefix}-{base_name}"
    
    @lru_cache(maxsize=128)
    def get_secret(self, base_name: str, version: str = "latest") -> str:
        """
        Get secret from Secret Manager
        
        Args:
            base_name: Base name of secret (e.g., 'database-url')
            version: Version of the secret (default: 'latest')
        
        Returns:
            Secret value as string
        
        Raises:
            ValueError: If secret not found
        """
        try:
            secret_name = self._get_secret_name(base_name)
            name = f"projects/{self.project_id}/secrets/{secret_name}/versions/{version}"
            response = self.client.access_secret_version(request={"name": name})
            return response.payload.data.decode("UTF-8")
        except Exception as e:
            raise ValueError(
                f"Failed to get secret '{self._get_secret_name(base_name)}' from Secret Manager. "
                f"Error: {str(e)}. "
                f"Make sure the secret exists and you have proper IAM permissions."
            )
    
    def get_database_url(self) -> str:
        """Get database connection URL from Secret Manager"""
        return self.get_secret("database-url")
    
    def get_hubspot_credentials(self) -> dict:
        """Get HubSpot OAuth credentials from Secret Manager"""
        return {
            "client_id": self.get_secret("hubspot-client-id"),
            "client_secret": self.get_secret("hubspot-client-secret"),
        }
    
    def get_google_credentials(self) -> dict:
        """Get Google OAuth credentials from Secret Manager"""
        return {
            "client_id": self.get_secret("google-client-id"),
            "client_secret": self.get_secret("google-client-secret"),
        }
    
    def get_slack_credentials(self) -> dict:
        """Get Slack OAuth credentials from Secret Manager"""
        return {
            "client_id": self.get_secret("slack-client-id"),
            "client_secret": self.get_secret("slack-client-secret"),
        }
    
    def get_anthropic_api_key(self) -> str:
        """Get Anthropic API key from Secret Manager"""
        return self.get_secret("anthropic-api-key")
    
    def get_firebase_credentials(self) -> str:
        """Get Firebase service account JSON from Secret Manager"""
        return self.get_secret("firebase-service-account-json")


@lru_cache
def get_secrets_service() -> SecretsService:
    """Dependency injection for secrets service"""
    return SecretsService()

