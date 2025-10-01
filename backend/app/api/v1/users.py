"""User management API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id, require_admin_role, require_permission, get_current_user_with_role
from app.models.user import UserCreate, UserUpdate, UserResponse
from app.services.user_service_db import get_user_service
from app.services.auth_service_db import get_auth_service
from app.utils.errors import build_error_response, ErrorCodes

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users(
    user_data: dict = Depends(require_permission("read:users")),
    user_service=Depends(get_user_service)
):
    """Get all users (admin only)."""
    try:
        users = user_service.get_all_users()
        return [
            UserResponse(
                id=str(user.id),
                name=user.name,
                email=user.email,
                role=user.role,
                active=user.active,
                emailVerified=user.email_verified,
                createdAt=user.created_at.isoformat(),
                updatedAt=user.updated_at.isoformat() if user.updated_at else None
            )
            for user in users
        ]
    except Exception as e:
        print(f"Error getting users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get users", {"error": str(e)})
        )


@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user_data: dict = Depends(require_permission("write:users")),
    user_service=Depends(get_user_service)
):
    """Create a new user (admin only)."""
    try:
        user = user_service.create_user(
            user_data, current_user_data.get("user_id"), send_verification=False)
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
                "E_INTERNAL_ERROR", "Failed to create user", {"error": str(e)})
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user_data: dict = Depends(require_permission("read:users")),
    auth_service=Depends(get_auth_service),
    user_service=Depends(get_user_service)
):
    """Get user by ID."""
    try:
        # Users can view their own profile, admins can view any profile
        current_user = auth_service.get_user_by_id(
            current_user_data.get("user_id"))
        if current_user.role.value != "admin" and current_user_data.get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=build_error_response(
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Can only view own profile"
                )
            )

        user = user_service.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=build_error_response(
                    ErrorCodes.E_USER_NOT_FOUND, "User not found")
            )

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


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user_data: dict = Depends(require_permission("write:users")),
    auth_service=Depends(get_auth_service),
    user_service=Depends(get_user_service)
):
    """Update user."""
    try:
        # Users can update their own profile (except role), admins can update any profile
        current_user = auth_service.get_user_by_id(
            current_user_data.get("user_id"))
        if current_user.role != "admin":
            if current_user_data.get("user_id") != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=build_error_response(
                        ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                        "Can only update own profile"
                    )
                )
            # Non-admins cannot change role
            if user_data.role is not None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=build_error_response(
                        ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                        "Cannot change role"
                    )
                )

        user = user_service.update_user(
            user_id, user_data, current_user_data.get("user_id"))
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            active=user.active,
            emailVerified=user.email_verified,
            createdAt=user.created_at,
            updatedAt=user.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to update user", {"error": str(e)})
        )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user_data: dict = Depends(require_permission("write:users")),
    user_service=Depends(get_user_service)
):
    """Delete user (admin only)."""
    try:
        user_service.delete_user(user_id, current_user_data.get("user_id"))
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to delete user", {"error": str(e)})
        )
