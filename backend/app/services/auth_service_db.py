"""Authentication service with database storage."""

from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Depends

from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.database.base import get_db
from app.database.repositories.user_repository import UserRepository
from app.database.repositories.auth_repository import AuthRepository
from app.database.models import User, UserRole
from app.models.auth import LoginResponse
from app.utils.errors import ErrorCodes, create_http_exception
from app.utils.events import event_bus, EventTypes


class AuthServiceDB:
    """Authentication service with database storage."""

    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.user_repo = UserRepository(db)
        self.auth_repo = AuthRepository(db)

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password."""
        user = self.user_repo.get_by_email(email)
        if not user or not user.active:
            return None

        if not verify_password(password, user.password_hash):
            return None

        # Check if user email is verified
        if not user.email_verified:
            return None

        return user

    def login(self, email: str, password: str) -> LoginResponse:
        """Login user and return tokens."""
        user = self.authenticate_user(email, password)
        if not user:
            raise create_http_exception(
                401,
                ErrorCodes.E_AUTH_INVALID_CREDENTIALS,
                "Invalid email or password"
            )

        # Create tokens
        token_data = {"sub": str(
            user.id), "email": user.email, "role": user.role.value}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        # Store refresh token in database
        self.auth_repo.create_refresh_token(str(user.id), refresh_token)

        # Convert to response format (camelCase)
        user_response = {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role.value,
            "active": user.active,
            "emailVerified": user.email_verified,
            "createdAt": user.created_at.isoformat(),
            "updatedAt": user.updated_at.isoformat() if user.updated_at else None
        }

        return LoginResponse(
            accessToken=access_token,
            refreshToken=refresh_token,
            user=user_response
        )

    def refresh_access_token(self, refresh_token: str) -> dict:
        """Refresh access token using refresh token."""
        # Find refresh token in database
        db_token = self.auth_repo.get_refresh_token(refresh_token)
        if not db_token:
            raise create_http_exception(
                401,
                ErrorCodes.E_AUTH_TOKEN_INVALID,
                "Invalid refresh token"
            )

        user = self.user_repo.get_by_id(str(db_token.user_id))
        if not user or not user.active:
            raise create_http_exception(
                401,
                ErrorCodes.E_AUTH_TOKEN_INVALID,
                "User not found or inactive"
            )

        # Create new tokens
        token_data = {"sub": str(
            user.id), "email": user.email, "role": user.role.value}
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)

        # Update stored refresh token
        self.auth_repo.create_refresh_token(str(user.id), new_refresh_token)

        return {
            "accessToken": new_access_token,
            "refreshToken": new_refresh_token
        }

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return self.user_repo.get_by_id(user_id)

    def logout(self, user_id: str):
        """Logout user by removing refresh token."""
        self.auth_repo.delete_refresh_token(user_id)

    def create_default_admin(self):
        """Create default admin user if it doesn't exist."""
        admin_user = self.user_repo.get_by_email("admin@company.com")
        if not admin_user:
            from app.models.user import UserCreate
            admin_data = UserCreate(
                name="Admin User",
                email="admin@company.com",
                password="password",
                role=UserRole.ADMIN,
                active=True
            )
            password_hash = get_password_hash(admin_data.password)
            self.user_repo.create(admin_data, password_hash)


# Global auth service instance
def get_auth_service(db: Session = Depends(get_db)) -> AuthServiceDB:
    """Get auth service instance."""
    return AuthServiceDB(db)
