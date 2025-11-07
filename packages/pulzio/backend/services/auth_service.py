from firebase_admin import auth
from middleware.auth import initialize_firebase
from typing import Optional, Dict


class AuthService:
    """Service for authentication operations"""
    
    def __init__(self):
        initialize_firebase()
    
    def verify_token(self, token: str) -> Dict:
        """
        Verify Firebase ID token
        
        Args:
            token: Firebase ID token string
        
        Returns:
            Decoded token with user info
        
        Raises:
            ValueError: If token is invalid
        """
        try:
            return auth.verify_id_token(token)
        except Exception as e:
            raise ValueError(f"Invalid token: {str(e)}")
    
    def get_user_by_uid(self, uid: str) -> Optional[Dict]:
        """
        Get user by Firebase UID
        
        Args:
            uid: Firebase user UID
        
        Returns:
            User record or None
        """
        try:
            return auth.get_user(uid)
        except Exception:
            return None

