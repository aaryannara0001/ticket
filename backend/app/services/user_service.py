"""User management service with in-memory storage."""

import uuid
from datetime import datetime
from typing import List, Optional

from app.core.security import get_password_hash
from app.models.user import UserInternal, UserCreate, UserUpdate, UserRole
from app.utils.errors import ErrorCodes, create_http_exception
from app.utils.events import event_bus, EventTypes
from app.services.auth_service import auth_service


class UserService:
    """User management service."""
    
    def create_user(self, user_data: UserCreate, created_by_id: str) -> UserInternal:
        """Create a new user."""
        # Check if email already exists
        if user_data.email in auth_service.users_by_email:
            raise create_http_exception(
                400,
                ErrorCodes.E_USER_EMAIL_EXISTS,
                "Email already exists"
            )
        
        # Check permissions (only admin can create admin users)
        creator = auth_service.get_user_by_id(created_by_id)
        if user_data.role == UserRole.ADMIN and creator.role != UserRole.ADMIN:
            raise create_http_exception(
                403,
                ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                "Only admins can create admin users"
            )
        
        # Create user
        user_id = str(uuid.uuid4())
        user = UserInternal(
            id=user_id,
            name=user_data.name,
            email=user_data.email,
            role=user_data.role,
            active=user_data.active,
            password_hash=get_password_hash(user_data.password),
            created_at=datetime.utcnow().isoformat()
        )
        
        # Store user
        auth_service.users[user_id] = user
        auth_service.users_by_email[user_data.email] = user_id
        
        # Publish event
        event_bus.publish(EventTypes.USER_CREATED, {
            "user_id": user_id,
            "email": user_data.email,
            "role": user_data.role,
            "created_by": created_by_id
        })
        
        return user
    
    def get_user(self, user_id: str) -> Optional[UserInternal]:
        """Get user by ID."""
        return auth_service.users.get(user_id)
    
    def get_all_users(self) -> List[UserInternal]:
        """Get all users."""
        return list(auth_service.users.values())
    
    def update_user(self, user_id: str, user_data: UserUpdate, updated_by_id: str) -> UserInternal:
        """Update user."""
        user = auth_service.users.get(user_id)
        if not user:
            raise create_http_exception(
                404,
                ErrorCodes.E_USER_NOT_FOUND,
                "User not found"
            )
        
        # Check permissions
        updater = auth_service.get_user_by_id(updated_by_id)
        if user_data.role == UserRole.ADMIN and updater.role != UserRole.ADMIN:
            raise create_http_exception(
                403,
                ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                "Only admins can assign admin role"
            )
        
        # Update fields
        if user_data.name is not None:
            user.name = user_data.name
        if user_data.email is not None:
            # Check if new email already exists
            existing_user_id = auth_service.users_by_email.get(user_data.email)
            if existing_user_id and existing_user_id != user_id:
                raise create_http_exception(
                    400,
                    ErrorCodes.E_USER_EMAIL_EXISTS,
                    "Email already exists"
                )
            # Update email mapping
            del auth_service.users_by_email[user.email]
            auth_service.users_by_email[user_data.email] = user_id
            user.email = user_data.email
        if user_data.role is not None:
            user.role = user_data.role
        if user_data.active is not None:
            user.active = user_data.active
        
        user.updated_at = datetime.utcnow().isoformat()
        
        # Publish event
        event_bus.publish(EventTypes.USER_UPDATED, {
            "user_id": user_id,
            "updated_by": updated_by_id,
            "changes": user_data.dict(exclude_unset=True)
        })
        
        return user
    
    def delete_user(self, user_id: str, deleted_by_id: str) -> bool:
        """Delete user."""
        user = auth_service.users.get(user_id)
        if not user:
            raise create_http_exception(
                404,
                ErrorCodes.E_USER_NOT_FOUND,
                "User not found"
            )
        
        # Remove from storage
        del auth_service.users[user_id]
        del auth_service.users_by_email[user.email]
        auth_service.refresh_tokens.pop(user_id, None)
        
        # Publish event
        event_bus.publish(EventTypes.USER_DELETED, {
            "user_id": user_id,
            "deleted_by": deleted_by_id
        })
        
        return True


# Global user service instance
user_service = UserService()