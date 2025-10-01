"""Ticket management service with database storage."""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import Depends

from app.core.config import settings
from app.database.base import get_db
from app.database.repositories.ticket_repository import TicketRepository, TicketHistoryRepository
from app.database.repositories.user_repository import UserRepository
from app.database.models import Ticket, TicketHistory, TicketStatus
from app.models.ticket import TicketCreate, TicketUpdate
from app.utils.errors import ErrorCodes, create_http_exception
from app.utils.events import event_bus, EventTypes


class TicketServiceDB:
    """Ticket management service with database storage."""
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.ticket_repo = TicketRepository(db)
        self.history_repo = TicketHistoryRepository(db)
        self.user_repo = UserRepository(db)
        
        # Valid status transitions
        self.valid_transitions = {
            TicketStatus.OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
            TicketStatus.IN_PROGRESS: [TicketStatus.OPEN, TicketStatus.CLOSED, TicketStatus.BLOCKED],
            TicketStatus.BLOCKED: [TicketStatus.IN_PROGRESS, TicketStatus.OPEN],
            TicketStatus.CLOSED: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS]
        }
    
    def _generate_ticket_key(self) -> str:
        """Generate unique ticket key."""
        next_number = self.ticket_repo.get_next_ticket_number()
        return f"{settings.TICKET_KEY_PREFIX}-{next_number}"
    
    def _validate_assignees(self, assignee_ids: List[str]) -> bool:
        """Validate that all assignee IDs exist."""
        for assignee_id in assignee_ids:
            if not self.user_repo.get_by_id(assignee_id):
                return False
        return True
    
    def create_ticket(self, ticket_data: TicketCreate, reporter_id: str) -> Ticket:
        """Create a new ticket."""
        # Validate assignees
        if ticket_data.assigneeIds and not self._validate_assignees(ticket_data.assigneeIds):
            raise create_http_exception(
                400,
                ErrorCodes.E_TICKET_INVALID_ASSIGNEE,
                "One or more assignee IDs are invalid"
            )
        
        # Generate ticket key
        ticket_key = self._generate_ticket_key()
        
        # Create ticket
        ticket = self.ticket_repo.create(ticket_data, reporter_id, ticket_key)
        
        # Add history entry
        self.history_repo.create(str(ticket.id), reporter_id, "created")
        
        # Publish event
        event_bus.publish(EventTypes.TICKET_CREATED, {
            "ticket_id": str(ticket.id),
            "ticket_key": ticket.key,
            "reporter_id": reporter_id,
            "assignee_ids": [str(a.id) for a in ticket.assignees]
        })
        
        return ticket
    
    def get_ticket(self, ticket_id: str) -> Optional[Ticket]:
        """Get ticket by ID."""
        return self.ticket_repo.get_by_id(ticket_id)
    
    def get_ticket_by_key(self, ticket_key: str) -> Optional[Ticket]:
        """Get ticket by key."""
        return self.ticket_repo.get_by_key(ticket_key)
    
    def get_all_tickets(self, filters: Optional[Dict[str, Any]] = None) -> List[Ticket]:
        """Get all tickets with optional filters."""
        return self.ticket_repo.get_all(filters)
    
    def get_user_tickets(self, user_id: str) -> List[Ticket]:
        """Get tickets assigned to or reported by user."""
        return self.ticket_repo.get_user_tickets(user_id)
    
    def update_ticket(self, ticket_id: str, ticket_data: TicketUpdate, updated_by_id: str) -> Ticket:
        """Update ticket."""
        ticket = self.ticket_repo.get_by_id(ticket_id)
        if not ticket:
            raise create_http_exception(
                404,
                ErrorCodes.E_TICKET_NOT_FOUND,
                "Ticket not found"
            )
        
        # Validate status transition
        if ticket_data.status is not None:
            if ticket_data.status not in self.valid_transitions.get(ticket.status, []):
                raise create_http_exception(
                    400,
                    ErrorCodes.E_TICKET_INVALID_STATUS_TRANSITION,
                    f"Cannot transition from {ticket.status.value} to {ticket_data.status.value}"
                )
        
        # Validate assignees
        if ticket_data.assigneeIds is not None and not self._validate_assignees(ticket_data.assigneeIds):
            raise create_http_exception(
                400,
                ErrorCodes.E_TICKET_INVALID_ASSIGNEE,
                "One or more assignee IDs are invalid"
            )
        
        # Track changes for history
        changes = []
        
        # Check what's changing
        if ticket_data.title is not None and ticket_data.title != ticket.title:
            changes.append(("title", ticket.title, ticket_data.title))
        if ticket_data.description is not None and ticket_data.description != ticket.description:
            changes.append(("description", ticket.description, ticket_data.description))
        if ticket_data.status is not None and ticket_data.status != ticket.status:
            changes.append(("status", ticket.status.value, ticket_data.status.value))
        if ticket_data.priority is not None and ticket_data.priority != ticket.priority:
            changes.append(("priority", ticket.priority.value, ticket_data.priority.value))
        if ticket_data.department is not None and ticket_data.department != ticket.department:
            changes.append(("department", ticket.department, ticket_data.department))
        
        # Check assignee changes
        if ticket_data.assigneeIds is not None:
            current_assignee_ids = {str(a.id) for a in ticket.assignees}
            new_assignee_ids = set(ticket_data.assigneeIds)
            if current_assignee_ids != new_assignee_ids:
                changes.append(("assignees", ",".join(current_assignee_ids), ",".join(new_assignee_ids)))
        
        # Update ticket
        updated_ticket = self.ticket_repo.update(ticket_id, ticket_data)
        
        # Add history entries for changes
        for field, old_value, new_value in changes:
            self.history_repo.create(ticket_id, updated_by_id, f"updated_{field}", old_value, new_value)
        
        # Publish events
        if changes:
            event_bus.publish(EventTypes.TICKET_UPDATED, {
                "ticket_id": ticket_id,
                "updated_by": updated_by_id,
                "changes": [{"field": field, "old": old, "new": new} for field, old, new in changes]
            })
            
            # Check for status change
            status_change = next((c for c in changes if c[0] == "status"), None)
            if status_change:
                event_bus.publish(EventTypes.TICKET_STATUS_CHANGED, {
                    "ticket_id": ticket_id,
                    "old_status": status_change[1],
                    "new_status": status_change[2],
                    "updated_by": updated_by_id
                })
        
        return updated_ticket
    
    def get_ticket_history(self, ticket_id: str) -> List[TicketHistory]:
        """Get ticket history."""
        return self.history_repo.get_by_ticket_id(ticket_id)
    
    def get_ticket_stats(self) -> Dict[str, Any]:
        """Get ticket statistics."""
        return self.ticket_repo.get_stats()


def get_ticket_service(db: Session = Depends(get_db)) -> TicketServiceDB:
    """Get ticket service instance."""
    return TicketServiceDB(db)