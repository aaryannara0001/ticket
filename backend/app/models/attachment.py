"""Attachment-related Pydantic models."""

from typing import Optional
from pydantic import BaseModel


class AttachmentBase(BaseModel):
    """Base attachment model."""
    filename: str
    contentType: str
    size: int


class AttachmentCreate(AttachmentBase):
    """Attachment creation model."""
    ticketId: str


class AttachmentResponse(AttachmentBase):
    """Attachment response model (camelCase for API)."""
    id: str
    ticketId: str
    fileKey: str
    uploadedBy: str
    createdAt: str

    class Config:
        from_attributes = True


class AttachmentInternal(BaseModel):
    """Internal attachment model (snake_case)."""
    id: str
    ticket_id: str
    filename: str
    content_type: str
    size: int
    file_key: str
    uploaded_by: str
    created_at: str


class PresignedUrlResponse(BaseModel):
    """Presigned URL response for file uploads."""
    uploadUrl: str
    fileKey: str