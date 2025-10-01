"""Attachment repository for database operations."""

from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.database.models import Attachment
from app.models.attachment import AttachmentCreate


class AttachmentRepository:
    """Repository for attachment database operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, attachment_data: AttachmentCreate, uploaded_by_id: str, file_key: str) -> Attachment:
        """Create a new attachment."""
        db_attachment = Attachment(
            ticket_id=attachment_data.ticketId,
            filename=attachment_data.filename,
            content_type=attachment_data.contentType,
            size=attachment_data.size,
            file_key=file_key,
            uploaded_by=uploaded_by_id
        )
        self.db.add(db_attachment)
        self.db.commit()
        self.db.refresh(db_attachment)
        return db_attachment
    
    def get_by_id(self, attachment_id: str) -> Optional[Attachment]:
        """Get attachment by ID."""
        return self.db.query(Attachment).options(
            joinedload(Attachment.uploaded_by_user),
            joinedload(Attachment.ticket)
        ).filter(Attachment.id == attachment_id).first()
    
    def get_by_ticket_id(self, ticket_id: str) -> List[Attachment]:
        """Get all attachments for a ticket."""
        return self.db.query(Attachment).options(
            joinedload(Attachment.uploaded_by_user)
        ).filter(Attachment.ticket_id == ticket_id).order_by(
            Attachment.created_at
        ).all()
    
    def delete(self, attachment_id: str) -> bool:
        """Delete attachment."""
        db_attachment = self.get_by_id(attachment_id)
        if not db_attachment:
            return False
        
        self.db.delete(db_attachment)
        self.db.commit()
        return True