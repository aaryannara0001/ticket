"""Project-related Pydantic models."""

from typing import Optional, List
from pydantic import BaseModel


class ProjectBase(BaseModel):
    """Base project model."""
    name: str
    description: Optional[str] = None
    key: str


class ProjectCreate(ProjectBase):
    """Project creation model."""
    pass


class ProjectUpdate(BaseModel):
    """Project update model."""
    name: Optional[str] = None
    description: Optional[str] = None
    key: Optional[str] = None


class ProjectResponse(ProjectBase):
    """Project response model (camelCase for API)."""
    id: str
    createdAt: str
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectInternal(ProjectBase):
    """Internal project model (snake_case)."""
    id: str
    created_at: str
    updated_at: Optional[str] = None