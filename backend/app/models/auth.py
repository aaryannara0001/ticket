"""Authentication-related Pydantic models."""

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response model."""
    accessToken: str
    refreshToken: str
    user: dict


class RefreshTokenRequest(BaseModel):
    """Refresh token request model."""
    refreshToken: str


class RefreshTokenResponse(BaseModel):
    """Refresh token response model."""
    accessToken: str
    refreshToken: str