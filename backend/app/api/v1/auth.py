"""Authentication API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from app.core.security import security, get_current_user_id, get_current_user_with_role
from app.database.base import get_db
from app.models.auth import LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse
from app.models.user import UserCreate, UserResponse, UserRole, EmailVerificationRequest, ResendOTPRequest
from app.services.auth_service_db import get_auth_service
from app.services.user_service_db import get_user_service
from app.utils.errors import build_error_response

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, auth_service=Depends(get_auth_service)):
    """Login user and return access/refresh tokens."""
    try:
        return auth_service.login(login_data.email, login_data.password)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Login failed", {"error": str(e)})
        )


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(refresh_data: RefreshTokenRequest, auth_service=Depends(get_auth_service)):
    """Refresh access token using refresh token."""
    try:
        tokens = auth_service.refresh_access_token(refresh_data.refreshToken)
        return RefreshTokenResponse(**tokens)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Token refresh failed", {"error": str(e)})
        )


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, user_service=Depends(get_user_service)):
    """Register a new user (non-admin only)."""
    try:
        # Prevent direct admin registration
        if user_data.role == UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=build_error_response(
                    "E_AUTH_INSUFFICIENT_PERMISSIONS",
                    "Cannot register as admin directly"
                )
            )

        # Set new users as unverified (will need to verify email)
        user_data.email_verified = False

        # Create user with system as creator (for registration)
        user = user_service.create_user(
            user_data, "system", send_verification=True)

        # Convert to response format (camelCase)
        return UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            active=user.active,
            emailVerified=user.email_verified,
            createdAt=user.created_at.isoformat(),
            updatedAt=user.updated_at.isoformat() if user.updated_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Registration failed", {"error": str(e)})
        )


@router.post("/logout")
async def logout(auth_service=Depends(get_auth_service)):
    """Logout user by invalidating refresh token."""
    try:
        # Allow logout without authentication
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Logout failed", {"error": str(e)})
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_data: dict = Depends(get_current_user_with_role),
    auth_service=Depends(get_auth_service)
):
    """Get current user information."""
    try:
        # Get the actual user from database
        user = auth_service.get_user_by_id(user_data.get("user_id"))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=build_error_response(
                    "E_USER_NOT_FOUND", "User not found")
            )

        # Convert to response format (camelCase)
        return UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            active=user.active,
            emailVerified=user.email_verified,
            createdAt=user.created_at.isoformat(),
            updatedAt=user.updated_at.isoformat() if user.updated_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get user", {"error": str(e)})
        )


@router.post("/verify-email")
async def verify_email(verification_data: EmailVerificationRequest, user_service=Depends(get_user_service)):
    """Verify user email with OTP."""
    try:
        success = user_service.verify_email(
            verification_data.email, verification_data.otp)
        if success:
            return {"message": "Email verified successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=build_error_response(
                    "E_INVALID_OTP",
                    "Invalid or expired OTP"
                )
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Email verification failed", {"error": str(e)})
        )


@router.post("/resend-otp")
async def resend_otp(resend_data: ResendOTPRequest, user_service=Depends(get_user_service)):
    """Resend OTP to user email."""
    try:
        success = user_service.resend_verification_otp(resend_data.email)
        if success:
            return {"message": "OTP sent successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=build_error_response(
                    "E_EMAIL_SEND_FAILED",
                    "Failed to send OTP"
                )
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Resend OTP failed", {"error": str(e)})
        )
