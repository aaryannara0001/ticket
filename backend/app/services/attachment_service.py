"""Attachment service with stubbed S3 functionality."""

import uuid
from datetime import datetime
from typing import Dict, List

from app.models.attachment import AttachmentInternal, AttachmentCreate, PresignedUrlResponse
from app.utils.errors import ErrorCodes, create_http_exception


class AttachmentService:
    """Attachment service with stubbed S3 operations."""
    
    def __init__(self):
        self.attachments: Dict[str, AttachmentInternal] = {}
    
    def generate_presigned_url(self, filename: str, content_type: str) -> PresignedUrlResponse:
        """Generate presigned URL for file upload (stubbed)."""
        file_key = f"attachments/{uuid.uuid4()}/{filename}"
        upload_url = f"https://stubbed-s3-bucket.s3.amazonaws.com/{file_key}?presigned=true"
        
        return PresignedUrlResponse(
            uploadUrl=upload_url,
            fileKey=file_key
        )
    
    def create_attachment(self, attachment_data: AttachmentCreate, uploaded_by_id: str, file_key: str) -> AttachmentInternal:
        """Create attachment record after successful upload."""
        attachment_id = str(uuid.uuid4())
        attachment = AttachmentInternal(
            id=attachment_id,
            ticket_id=attachment_data.ticketId,
            filename=attachment_data.filename,
            content_type=attachment_data.contentType,
            size=attachment_data.size,
            file_key=file_key,
            uploaded_by=uploaded_by_id,
            created_at=datetime.utcnow().isoformat()
        )
        
        self.attachments[attachment_id] = attachment
        return attachment
    
    def get_attachment(self, attachment_id: str) -> AttachmentInternal:
        """Get attachment by ID."""
        attachment = self.attachments.get(attachment_id)
        if not attachment:
            raise create_http_exception(
                404,
                ErrorCodes.E_TICKET_NOT_FOUND,  # Reusing error code
                "Attachment not found"
            )
        return attachment
    
    def get_ticket_attachments(self, ticket_id: str) -> List[AttachmentInternal]:
        """Get all attachments for a ticket."""
        return [att for att in self.attachments.values() if att.ticket_id == ticket_id]
    
    def delete_attachment(self, attachment_id: str, deleted_by_id: str) -> bool:
        """Delete attachment."""
        if attachment_id not in self.attachments:
            raise create_http_exception(
                404,
                ErrorCodes.E_TICKET_NOT_FOUND,  # Reusing error code
                "Attachment not found"
            )
        
        del self.attachments[attachment_id]
        return True


# Global attachment service instance
attachment_service = AttachmentService()