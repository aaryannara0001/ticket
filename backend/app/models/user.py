"""User-related Pydantic models."""

from typing import Optional, List
from pydantic import BaseModel, EmailStr
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration."""
    DEVELOPER = "developer"
    SUPPORT = "support"
    IT = "it"
    MANAGER = "manager"
    ADMIN = "admin"
    CLIENT = "client"


class UserBase(BaseModel):
    """Base user model."""
    name: str
    email: EmailStr
    role: UserRole = UserRole.DEVELOPER
    active: bool = True
    email_verified: bool = False


class UserCreate(UserBase):
    """User creation model."""
    password: str


class UserUpdate(BaseModel):
    """User update model."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    active: Optional[bool] = None
    email_verified: Optional[bool] = None


class UserResponse(BaseModel):
    """User response model (camelCase for API)."""
    id: str
    name: str
    email: EmailStr
    role: UserRole
    active: bool
    emailVerified: bool
    createdAt: str
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True


class UserInternal(UserBase):
    """Internal user model (snake_case)."""
    id: str
    password_hash: str
    created_at: str
    updated_at: Optional[str] = None


class EmailVerificationRequest(BaseModel):
    """Email verification request model."""
    email: EmailStr
    otp: str


class ResendOTPRequest(BaseModel):
    """Resend OTP request model."""
    email: EmailStr
