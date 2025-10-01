"""Authentication repository for database operations."""

from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database.models import RefreshToken, User
from app.core.config import settings


class AuthRepository:
    """Repository for authentication database operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_refresh_token(self, user_id: str, token: str) -> RefreshToken:
        """Create a refresh token."""
        # Delete existing refresh tokens for this user
        self.db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete()
        
        # Create new refresh token
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        db_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
        self.db.add(db_token)
        self.db.commit()
        self.db.refresh(db_token)
        return db_token
    
    def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        """Get refresh token by token string."""
        return self.db.query(RefreshToken).filter(
            RefreshToken.token == token,
            RefreshToken.expires_at > datetime.utcnow()
        ).first()
    
    def delete_refresh_token(self, user_id: str) -> bool:
        """Delete refresh token for user (logout)."""
        deleted_count = self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id
        ).delete()
        self.db.commit()
        return deleted_count > 0
    
    def delete_expired_tokens(self) -> int:
        """Delete expired refresh tokens."""
        deleted_count = self.db.query(RefreshToken).filter(
            RefreshToken.expires_at <= datetime.utcnow()
        ).delete()
        self.db.commit()
        return deleted_count