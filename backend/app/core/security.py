"""JWT security utilities and authentication helpers."""

import logging
from typing import Optional, Dict, Any, List, Callable
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import hashlib

from app.core.config import settings

# Set up logger
logger = logging.getLogger(__name__)


# Password hashing - use a simpler approach for development
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    # Test if bcrypt is working
    test_hash = pwd_context.hash("test")
    pwd_context.verify("test", test_hash)
    BCRYPT_WORKING = True
except Exception as e:
    print(f"⚠️  Bcrypt not working: {e}")
    pwd_context = None
    BCRYPT_WORKING = False

# HTTP Bearer token scheme
security = HTTPBearer()

# Custom security scheme that handles OPTIONS requests


class OptionalHTTPBearer(HTTPBearer):
    async def __call__(self, request: Request) -> Optional[HTTPAuthorizationCredentials]:
        # Allow OPTIONS requests without authentication
        if request.method == "OPTIONS":
            return None
        try:
            return await super().__call__(request)
        except HTTPException:
            # Return None for failed authentication instead of raising exception
            return None


# Use optional security scheme
optional_security = OptionalHTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    if pwd_context and BCRYPT_WORKING:
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            pass

    # Fallback to simple SHA256 for development
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password


def get_password_hash(password: str) -> str:
    """Generate password hash."""
    if pwd_context and BCRYPT_WORKING:
        try:
            return pwd_context.hash(password)
        except Exception:
            pass

    # Fallback to simple SHA256 for development
    return hashlib.sha256(password.encode()).hexdigest()


def create_access_token(data: Dict[str, Any]) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})

    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})

    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY,
                             algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(optional_security)) -> str:
    """Extract user ID from JWT token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    payload = decode_token(credentials.credentials)
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    return user_id


async def get_current_user_id_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)) -> Optional[str]:
    """Extract user ID from JWT token, but allow unauthenticated requests."""
    if not credentials:
        return None

    try:
        payload = decode_token(credentials.credentials)
        user_id: str = payload.get("sub")
        return user_id
    except:
        return None


async def get_current_user_with_role(request: Request) -> Dict[str, Any]:
    """Get current user with role information."""
    # Allow OPTIONS requests to pass through without authentication
    if request.method == "OPTIONS":
        return {
            "user_id": "preflight",
            "role": "admin",  # Give admin permissions for preflight
            "permissions": ["*"]
        }

    # Extract token from Authorization header
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "E_AUTH_MISSING_TOKEN",
                    "message": "Authorization header missing or invalid"}
        )

    token = authorization.split(" ")[1]

    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "E_AUTH_INVALID_TOKEN",
                        "message": "Invalid token format"}
            )

        # For now, return basic user data from token with real role validation
        # This avoids database connection issues in the dependency
        user_role = payload.get("role", "client")

        # Validate the role exists in our system
        if user_role not in ["admin", "manager", "developer", "support", "it", "client"]:
            user_role = "client"

        return {
            "user_id": user_id,
            "role": user_role,
            "permissions": get_role_permissions(user_role)
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "E_AUTH_INVALID_TOKEN",
                    "message": "Token validation failed"}
        )


def get_role_permissions(role: str) -> List[str]:
    """Get permissions for a given role."""
    role_permissions = {
        "admin": ["*"],  # Admin has all permissions
        "manager": [
            "read:tickets", "write:tickets", "assign:tickets",
            "read:users", "write:users",
            "read:reports", "read:dashboard",
            "read:projects", "write:projects",
            "read:workflows", "write:workflows"
        ],
        "developer": [
            "read:tickets", "write:tickets",
            "read:projects",
            "read:dashboard"
        ],
        "support": [
            "read:tickets", "write:tickets", "assign:tickets",
            "read:dashboard"
        ],
        "it": [
            "read:tickets", "write:tickets", "assign:tickets",
            "read:users", "write:users",
            "read:projects", "write:projects",
            "read:workflows", "write:workflows",
            "read:reports", "read:dashboard"
        ],
        "client": [
            "read:tickets", "write:tickets",  # Only their own tickets
            "read:dashboard"
        ]
    }
    return role_permissions.get(role, [])


def require_permission(permission: str):
    """Dependency to require specific permission."""
    async def dependency(request: Request) -> Dict[str, Any]:
        # Handle OPTIONS requests before any authentication
        if request.method == "OPTIONS":
            return {
                "user_id": "preflight",
                "role": "admin",
                "permissions": ["*"]
            }

        # Now do normal authentication
        user_data: Dict[str, Any] = await get_current_user_with_role(request)

        permissions = user_data.get("permissions", [])

        # Admin has all permissions
        if "*" in permissions or permission in permissions:
            return user_data

        # Log permission denial for debugging
        print(
            f"Permission denied: {permission} for user {user_data.get('user_id')} with role {user_data.get('role')}")

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "E_AUTH_INSUFFICIENT_PERMISSIONS",
                "message": f"Permission denied: {permission}",
                "required_permission": permission,
                "user_role": user_data.get("role")
            }
        )

    return dependency


def require_role(*allowed_roles: str):
    """Dependency to require specific roles."""
    async def dependency(
        request: Request,
        user_data: Dict[str, Any] = Depends(get_current_user_with_role)
    ) -> Dict[str, Any]:
        # Allow OPTIONS requests
        if request.method == "OPTIONS":
            return user_data

        user_role = user_data.get("role")

        if user_role in allowed_roles or user_role == "admin":
            return user_data

        # Log role requirement failure for debugging
        print(
            f"Role requirement failed: {allowed_roles} required, user has {user_role}")

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "E_AUTH_INSUFFICIENT_ROLE",
                "message": f"Role {user_role} not authorized. Required: {', '.join(allowed_roles)}",
                "required_roles": allowed_roles,
                "user_role": user_role
            }
        )

    return dependency


def require_admin_role():
    """Dependency to require admin role."""
    return require_role("admin")


def create_permission_dependency(permission: str) -> Callable:
    """Create a dependency function for permission checking."""
    async def dependency(
        request: Request,
        user_data: Dict[str, Any] = Depends(get_current_user_with_role)
    ) -> Dict[str, Any]:
        # Allow OPTIONS requests
        if request.method == "OPTIONS":
            return user_data

        permissions = user_data.get("permissions", [])

        if "*" in permissions or permission in permissions:
            return user_data

        logger.warning(
            f"Permission denied: {permission} for user {user_data.get('user_id')} "
            f"with role {user_data.get('role')}"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "E_AUTH_INSUFFICIENT_PERMISSIONS",
                "message": f"Permission denied: {permission}",
                "required_permission": permission,
                "user_role": user_data.get("role")
            }
        )

    return dependency


def create_role_dependency(*roles: str) -> Callable:
    """Create a dependency function for role checking."""
    async def dependency(
        request: Request,
        user_data: Dict[str, Any] = Depends(get_current_user_with_role)
    ) -> Dict[str, Any]:
        # Allow OPTIONS requests
        if request.method == "OPTIONS":
            return user_data

        user_role = user_data.get("role")

        if user_role in roles or user_role == "admin":
            return user_data

        logger.warning(
            f"Role requirement failed: {roles} required, "
            f"user {user_data.get('user_id')} has {user_role}"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "E_AUTH_INSUFFICIENT_ROLE",
                "message": f"Role {user_role} not authorized. Required: {', '.join(roles)}",
                "required_roles": list(roles),
                "user_role": user_role
            }
        )

    return dependency


class AuthorizationMiddleware:
    """Middleware for handling authorization checks."""

    @staticmethod
    async def check_permission(
        permission: str,
        user_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check if user has specific permission."""
        permissions = user_data.get("permissions", [])

        if "*" in permissions or permission in permissions:
            return user_data

        logger.warning(
            f"Permission denied: {permission} for user {user_data.get('user_id')} "
            f"with role {user_data.get('role')}"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "E_AUTH_INSUFFICIENT_PERMISSIONS",
                "message": f"Permission denied: {permission}",
                "required_permission": permission,
                "user_role": user_data.get("role")
            }
        )

    @staticmethod
    async def check_role(
        *allowed_roles: str,
        user_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check if user has one of the allowed roles."""
        user_role = user_data.get("role")

        if user_role in allowed_roles or user_role == "admin":
            return user_data

        logger.warning(
            f"Role requirement failed: {allowed_roles} required, "
            f"user {user_data.get('user_id')} has {user_role}"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "E_AUTH_INSUFFICIENT_ROLE",
                "message": f"Role {user_role} not authorized. Required: {', '.join(allowed_roles)}",
                "required_roles": list(allowed_roles),
                "user_role": user_role
            }
        )

    @staticmethod
    async def check_admin_role(
        user_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check if user has admin role."""
        return await AuthorizationMiddleware.check_role("admin", user_data=user_data)


# Convenience functions for common permissions
require_read_tickets = create_permission_dependency("read:tickets")
require_write_tickets = create_permission_dependency("write:tickets")
require_assign_tickets = create_permission_dependency("assign:tickets")
require_read_users = create_permission_dependency("read:users")
require_write_users = create_permission_dependency("write:users")
require_read_reports = create_permission_dependency("read:reports")
require_read_projects = create_permission_dependency("read:projects")
require_write_projects = create_permission_dependency("write:projects")
require_admin = create_role_dependency("admin")
require_manager = create_role_dependency("manager", "admin")
