"""User repository for database operations."""

from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database.models import User, UserRole
from app.models.user import UserCreate, UserUpdate


class UserRepository:
    """Repository for user database operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, user_data: UserCreate, password_hash: str, verification_token: str = None, verification_expires: datetime = None) -> User:
        """Create a new user."""
        from datetime import datetime
        db_user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=password_hash,
            role=user_data.role,
            active=user_data.active,
            email_verified=user_data.email_verified,
            verification_token=verification_token,
            verification_token_expires=verification_expires
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()

    def get_all(self, active_only: bool = False) -> List[User]:
        """Get all users."""
        query = self.db.query(User)
        if active_only:
            query = query.filter(User.active == True)
        return query.all()

    def update(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Update user."""
        db_user = self.get_by_id(user_id)
        if not db_user:
            return None

        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)

        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def delete(self, user_id: str) -> bool:
        """Delete user."""
        db_user = self.get_by_id(user_id)
        if not db_user:
            return False

        self.db.delete(db_user)
        self.db.commit()
        return True

    def get_by_role(self, role: UserRole) -> List[User]:
        """Get users by role."""
        return self.db.query(User).filter(
            and_(User.role == role, User.active == True)
        ).all()

    def email_exists(self, email: str, exclude_user_id: Optional[str] = None) -> bool:
        """Check if email exists."""
        query = self.db.query(User).filter(User.email == email)
        if exclude_user_id:
            query = query.filter(User.id != exclude_user_id)
        return query.first() is not None

    def verify_email(self, email: str, otp: str) -> Optional[User]:
        """Verify email with OTP."""
        from datetime import datetime
        user = self.db.query(User).filter(
            and_(
                User.email == email,
                User.verification_token == otp,
                User.verification_token_expires > datetime.utcnow(),
                User.email_verified == False
            )
        ).first()

        if user:
            user.email_verified = True
            user.verification_token = None
            user.verification_token_expires = None
            self.db.commit()
            self.db.refresh(user)

        return user

    def update_verification_token(self, email: str, token: str, expires: datetime) -> bool:
        """Update verification token for a user."""
        user = self.db.query(User).filter(User.email == email).first()
        if user:
            user.verification_token = token
            user.verification_token_expires = expires
            self.db.commit()
            return True
        return False
