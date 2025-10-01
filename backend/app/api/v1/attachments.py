"""Attachment management API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id, require_permission
from app.models.attachment import AttachmentCreate, AttachmentResponse, PresignedUrlResponse
from app.services.attachment_service import attachment_service
from app.services.ticket_service import ticket_service
from app.utils.errors import build_error_response, ErrorCodes

router = APIRouter()


def convert_attachment_to_response(attachment) -> AttachmentResponse:
    """Convert internal attachment model to response model."""
    return AttachmentResponse(
        id=attachment.id,
        ticketId=attachment.ticket_id,
        filename=attachment.filename,
        contentType=attachment.content_type,
        size=attachment.size,
        fileKey=attachment.file_key,
        uploadedBy=attachment.uploaded_by,
        createdAt=attachment.created_at
    )


@router.post("/presigned-url", response_model=PresignedUrlResponse)
async def get_presigned_url(
    filename: str,
    content_type: str,
    current_user_data: dict = Depends(require_permission("write:tickets"))
):
    """Get presigned URL for file upload."""
    try:
        return attachment_service.generate_presigned_url(filename, content_type)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to generate presigned URL", {"error": str(e)})
        )


@router.post("/", response_model=AttachmentResponse)
async def create_attachment(
    attachment_data: AttachmentCreate,
    file_key: str,
    current_user_data: dict = Depends(require_permission("write:tickets"))
):
    """Create attachment record after successful upload."""
    try:
        # Verify ticket exists
        ticket = ticket_service.get_ticket(attachment_data.ticketId)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=build_error_response(
                    ErrorCodes.E_TICKET_NOT_FOUND, "Ticket not found")
            )

        attachment = attachment_service.create_attachment(
            attachment_data, current_user_data.get("user_id"), file_key)
        return convert_attachment_to_response(attachment)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to create attachment", {"error": str(e)})
        )


@router.get("/{attachment_id}", response_model=AttachmentResponse)
async def get_attachment(
    attachment_id: str,
    current_user_data: dict = Depends(require_permission("read:tickets"))
):
    """Get attachment by ID."""
    try:
        attachment = attachment_service.get_attachment(attachment_id)
        return convert_attachment_to_response(attachment)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get attachment", {"error": str(e)})
        )


@router.get("/ticket/{ticket_id}", response_model=List[AttachmentResponse])
async def get_ticket_attachments(
    ticket_id: str,
    current_user_data: dict = Depends(require_permission("read:tickets"))
):
    """Get all attachments for a ticket."""
    try:
        # Verify ticket exists
        ticket = ticket_service.get_ticket(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=build_error_response(
                    ErrorCodes.E_TICKET_NOT_FOUND, "Ticket not found")
            )

        attachments = attachment_service.get_ticket_attachments(ticket_id)
        return [convert_attachment_to_response(att) for att in attachments]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get ticket attachments", {"error": str(e)})
        )


@router.delete("/{attachment_id}")
async def delete_attachment(
    attachment_id: str,
    current_user_data: dict = Depends(require_permission("write:tickets"))
):
    """Delete attachment."""
    try:
        attachment_service.delete_attachment(
            attachment_id, current_user_data.get("user_id"))
        return {"message": "Attachment deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to delete attachment", {"error": str(e)})
        )
