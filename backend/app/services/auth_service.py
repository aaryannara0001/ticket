"""Authentication service with in-memory storage."""

import uuid
from datetime import datetime
from typing import Optional, Dict

from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.models.user import UserInternal, UserRole
from app.models.auth import LoginResponse
from app.utils.errors import ErrorCodes, create_http_exception
from app.utils.events import event_bus, EventTypes


class AuthService:
    """Authentication service with in-memory user storage."""
    
    def __init__(self):
        # In-memory user storage
        self.users: Dict[str, UserInternal] = {}
        self.users_by_email: Dict[str, str] = {}  # email -> user_id mapping
        self.refresh_tokens: Dict[str, str] = {}  # user_id -> refresh_token mapping
        
        # Create default admin user
        self._create_default_admin()
    
    def _create_default_admin(self):
        """Create default admin user for testing."""
        admin_id = str(uuid.uuid4())
        admin_user = UserInternal(
            id=admin_id,
            name="Admin User",
            email="admin@company.com",
            role=UserRole.ADMIN,
            active=True,
            password_hash=get_password_hash("password"),
            created_at=datetime.utcnow().isoformat()
        )
        
        self.users[admin_id] = admin_user
        self.users_by_email["admin@company.com"] = admin_id
    
    def authenticate_user(self, email: str, password: str) -> Optional[UserInternal]:
        """Authenticate user by email and password."""
        user_id = self.users_by_email.get(email)
        if not user_id:
            return None
        
        user = self.users.get(user_id)
        if not user or not user.active:
            return None
        
        if not verify_password(password, user.password_hash):
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
        token_data = {"sub": user.id, "email": user.email, "role": user.role}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Store refresh token
        self.refresh_tokens[user.id] = refresh_token
        
        # Convert to response format (camelCase)
        user_response = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "active": user.active,
            "createdAt": user.created_at,
            "updatedAt": user.updated_at
        }
        
        return LoginResponse(
            accessToken=access_token,
            refreshToken=refresh_token,
            user=user_response
        )
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, str]:
        """Refresh access token using refresh token."""
        # Find user by refresh token
        user_id = None
        for uid, token in self.refresh_tokens.items():
            if token == refresh_token:
                user_id = uid
                break
        
        if not user_id:
            raise create_http_exception(
                401,
                ErrorCodes.E_AUTH_TOKEN_INVALID,
                "Invalid refresh token"
            )
        
        user = self.users.get(user_id)
        if not user or not user.active:
            raise create_http_exception(
                401,
                ErrorCodes.E_AUTH_TOKEN_INVALID,
                "User not found or inactive"
            )
        
        # Create new tokens
        token_data = {"sub": user.id, "email": user.email, "role": user.role}
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)
        
        # Update stored refresh token
        self.refresh_tokens[user.id] = new_refresh_token
        
        return {
            "accessToken": new_access_token,
            "refreshToken": new_refresh_token
        }
    
    def get_user_by_id(self, user_id: str) -> Optional[UserInternal]:
        """Get user by ID."""
        return self.users.get(user_id)
    
    def logout(self, user_id: str):
        """Logout user by removing refresh token."""
        self.refresh_tokens.pop(user_id, None)


# Global auth service instance
auth_service = AuthService()