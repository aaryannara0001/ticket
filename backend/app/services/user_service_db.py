"""User management service with database storage."""

from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import Depends

from app.core.security import get_password_hash
from app.database.base import get_db
from app.database.repositories.user_repository import UserRepository
from app.database.models import User, UserRole
from app.models.user import UserCreate, UserUpdate
from app.services.email_service import email_service
from app.utils.errors import ErrorCodes, create_http_exception
from app.utils.events import event_bus, EventTypes


class UserServiceDB:
    """User management service with database storage."""

    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.user_repo = UserRepository(db)

    def create_user(self, user_data: UserCreate, created_by_id: str, send_verification: bool = True) -> User:
        """Create a new user."""
        # Check if email already exists
        if self.user_repo.email_exists(user_data.email):
            raise create_http_exception(
                400,
                ErrorCodes.E_USER_EMAIL_EXISTS,
                "Email already exists"
            )

        # Check permissions (only admin can create admin users)
        if created_by_id != "system":
            creator = self.user_repo.get_by_id(created_by_id)
            if user_data.role == UserRole.ADMIN and creator.role != UserRole.ADMIN:
                raise create_http_exception(
                    403,
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Only admins can create admin users"
                )

        # Generate OTP for email verification
        verification_token = None
        verification_expires = None
        if send_verification:
            verification_token = email_service.generate_otp()
            verification_expires = email_service.get_otp_expiry_time()

        # Create user
        password_hash = get_password_hash(user_data.password)
        user = self.user_repo.create(
            user_data, password_hash, verification_token, verification_expires)

        # Send verification email
        if send_verification:
            email_service.send_verification_email(
                user.email, verification_token, user.name)

        # Publish event
        event_bus.publish(EventTypes.USER_CREATED, {
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "created_by": created_by_id
        })

        return user

    def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return self.user_repo.get_by_id(user_id)

    def get_all_users(self) -> List[User]:
        """Get all users."""
        return self.user_repo.get_all()

    def update_user(self, user_id: str, user_data: UserUpdate, updated_by_id: str) -> User:
        """Update user."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise create_http_exception(
                404,
                ErrorCodes.E_USER_NOT_FOUND,
                "User not found"
            )

        # Protect permanent admin user (admin@company.com)
        if user.email == "admin@company.com":
            # Prevent role change from admin
            if user_data.role and user_data.role != UserRole.ADMIN:
                raise create_http_exception(
                    403,
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Cannot change role of permanent admin user"
                )
            # Prevent deactivation
            if user_data.active is False:
                raise create_http_exception(
                    403,
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Cannot deactivate permanent admin user"
                )
            # Prevent email change
            if user_data.email and user_data.email != "admin@company.com":
                raise create_http_exception(
                    403,
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Cannot change email of permanent admin user"
                )

        # Check permissions
        updater = self.user_repo.get_by_id(updated_by_id)
        if user_data.role == UserRole.ADMIN and updater.role != UserRole.ADMIN:
            raise create_http_exception(
                403,
                ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                "Only admins can assign admin role"
            )

        # Check if new email already exists
        if user_data.email and self.user_repo.email_exists(user_data.email, user_id):
            raise create_http_exception(
                400,
                ErrorCodes.E_USER_EMAIL_EXISTS,
                "Email already exists"
            )

        # Update user
        updated_user = self.user_repo.update(user_id, user_data)

        # Publish event
        event_bus.publish(EventTypes.USER_UPDATED, {
            "user_id": user_id,
            "updated_by": updated_by_id,
            "changes": user_data.dict(exclude_unset=True)
        })

        return updated_user

    def delete_user(self, user_id: str, deleted_by_id: str) -> bool:
        """Delete user."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise create_http_exception(
                404,
                ErrorCodes.E_USER_NOT_FOUND,
                "User not found"
            )

        # Protect permanent admin user (admin@company.com) from deletion
        if user.email == "admin@company.com":
            raise create_http_exception(
                403,
                ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                "Cannot delete permanent admin user"
            )

        # Delete user
        success = self.user_repo.delete(user_id)

        if success:
            # Publish event
            event_bus.publish(EventTypes.USER_DELETED, {
                "user_id": user_id,
                "deleted_by": deleted_by_id
            })

        return success

    def verify_email(self, email: str, otp: str) -> bool:
        """Verify user email with OTP."""
        user = self.user_repo.verify_email(email, otp)
        if user:
            # Publish event
            event_bus.publish(EventTypes.USER_UPDATED, {
                "user_id": str(user.id),
                "email": user.email,
                "changes": {"email_verified": True}
            })
            return True
        return False

    def resend_verification_otp(self, email: str) -> bool:
        """Resend verification OTP to user."""
        user = self.user_repo.get_by_email(email)
        if not user:
            raise create_http_exception(
                404,
                ErrorCodes.E_USER_NOT_FOUND,
                "User not found"
            )

        if user.email_verified:
            raise create_http_exception(
                400,
                "E_EMAIL_ALREADY_VERIFIED",
                "Email is already verified"
            )

        # Generate new OTP
        verification_token = email_service.generate_otp()
        verification_expires = email_service.get_otp_expiry_time()

        # Update verification token
        if self.user_repo.update_verification_token(email, verification_token, verification_expires):
            # Send verification email
            return email_service.send_verification_email(email, verification_token, user.name)

        return False


def get_user_service(db: Session = Depends(get_db)) -> UserServiceDB:
    """Get user service instance."""
    return UserServiceDB(db)
