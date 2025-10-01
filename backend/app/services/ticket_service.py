"""Ticket management service with in-memory storage."""

import uuid
from datetime import datetime
from typing import List, Optional, Dict

from app.core.config import settings
from app.models.ticket import (
    TicketInternal, TicketCreate, TicketUpdate, TicketStatus, 
    TicketHistoryEntry
)
from app.utils.errors import ErrorCodes, create_http_exception
from app.utils.events import event_bus, EventTypes
from app.services.auth_service import auth_service


class TicketService:
    """Ticket management service."""
    
    def __init__(self):
        self.tickets: Dict[str, TicketInternal] = {}
        self.ticket_history: Dict[str, List[TicketHistoryEntry]] = {}
        self.ticket_counter = settings.TICKET_KEY_START
        
        # Valid status transitions
        self.valid_transitions = {
            TicketStatus.OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
            TicketStatus.IN_PROGRESS: [TicketStatus.OPEN, TicketStatus.CLOSED, TicketStatus.BLOCKED],
            TicketStatus.BLOCKED: [TicketStatus.IN_PROGRESS, TicketStatus.OPEN],
            TicketStatus.CLOSED: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS]
        }
    
    def _generate_ticket_key(self) -> str:
        """Generate unique ticket key."""
        key = f"{settings.TICKET_KEY_PREFIX}-{self.ticket_counter}"
        self.ticket_counter += 1
        return key
    
    def _validate_assignees(self, assignee_ids: List[str]) -> bool:
        """Validate that all assignee IDs exist."""
        for assignee_id in assignee_ids:
            if not auth_service.get_user_by_id(assignee_id):
                return False
        return True
    
    def _add_history_entry(self, ticket_id: str, user_id: str, action: str, 
                          old_value: Optional[str] = None, new_value: Optional[str] = None):
        """Add entry to ticket history."""
        if ticket_id not in self.ticket_history:
            self.ticket_history[ticket_id] = []
        
        entry = TicketHistoryEntry(
            id=str(uuid.uuid4()),
            ticketId=ticket_id,
            userId=user_id,
            action=action,
            oldValue=old_value,
            newValue=new_value,
            createdAt=datetime.utcnow().isoformat()
        )
        
        self.ticket_history[ticket_id].append(entry)
    
    def create_ticket(self, ticket_data: TicketCreate, reporter_id: str) -> TicketInternal:
        """Create a new ticket."""
        # Validate assignees
        if ticket_data.assigneeIds and not self._validate_assignees(ticket_data.assigneeIds):
            raise create_http_exception(
                400,
                ErrorCodes.E_TICKET_INVALID_ASSIGNEE,
                "One or more assignee IDs are invalid"
            )
        
        # Create ticket
        ticket_id = str(uuid.uuid4())
        ticket = TicketInternal(
            id=ticket_id,
            key=self._generate_ticket_key(),
            title=ticket_data.title,
            description=ticket_data.description,
            priority=ticket_data.priority,
            department=ticket_data.department,
            reporter_id=reporter_id,
            assignee_ids=ticket_data.assigneeIds or [],
            status=TicketStatus.OPEN,
            created_at=datetime.utcnow().isoformat()
        )
        
        # Store ticket
        self.tickets[ticket_id] = ticket
        
        # Add history entry
        self._add_history_entry(ticket_id, reporter_id, "created")
        
        # Publish event
        event_bus.publish(EventTypes.TICKET_CREATED, {
            "ticket_id": ticket_id,
            "ticket_key": ticket.key,
            "reporter_id": reporter_id,
            "assignee_ids": ticket.assignee_ids
        })
        
        return ticket
    
    def get_ticket(self, ticket_id: str) -> Optional[TicketInternal]:
        """Get ticket by ID."""
        return self.tickets.get(ticket_id)
    
    def get_ticket_by_key(self, ticket_key: str) -> Optional[TicketInternal]:
        """Get ticket by key."""
        for ticket in self.tickets.values():
            if ticket.key == ticket_key:
                return ticket
        return None
    
    def get_all_tickets(self) -> List[TicketInternal]:
        """Get all tickets."""
        return list(self.tickets.values())
    
    def get_user_tickets(self, user_id: str) -> List[TicketInternal]:
        """Get tickets assigned to or reported by user."""
        user_tickets = []
        for ticket in self.tickets.values():
            if ticket.reporter_id == user_id or user_id in ticket.assignee_ids:
                user_tickets.append(ticket)
        return user_tickets
    
    def update_ticket(self, ticket_id: str, ticket_data: TicketUpdate, updated_by_id: str) -> TicketInternal:
        """Update ticket."""
        ticket = self.tickets.get(ticket_id)
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
                    f"Cannot transition from {ticket.status} to {ticket_data.status}"
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
        
        # Update fields
        if ticket_data.title is not None:
            changes.append(("title", ticket.title, ticket_data.title))
            ticket.title = ticket_data.title
        if ticket_data.description is not None:
            changes.append(("description", ticket.description, ticket_data.description))
            ticket.description = ticket_data.description
        if ticket_data.status is not None:
            changes.append(("status", ticket.status, ticket_data.status))
            ticket.status = ticket_data.status
        if ticket_data.priority is not None:
            changes.append(("priority", ticket.priority, ticket_data.priority))
            ticket.priority = ticket_data.priority
        if ticket_data.assigneeIds is not None:
            old_assignees = ",".join(ticket.assignee_ids)
            new_assignees = ",".join(ticket_data.assigneeIds)
            changes.append(("assignees", old_assignees, new_assignees))
            ticket.assignee_ids = ticket_data.assigneeIds
        if ticket_data.department is not None:
            changes.append(("department", ticket.department, ticket_data.department))
            ticket.department = ticket_data.department
        
        ticket.updated_at = datetime.utcnow().isoformat()
        
        # Add history entries for changes
        for field, old_value, new_value in changes:
            self._add_history_entry(ticket_id, updated_by_id, f"updated_{field}", old_value, new_value)
        
        # Publish events
        event_bus.publish(EventTypes.TICKET_UPDATED, {
            "ticket_id": ticket_id,
            "updated_by": updated_by_id,
            "changes": [{"field": field, "old": old, "new": new} for field, old, new in changes]
        })
        
        if ticket_data.status is not None:
            event_bus.publish(EventTypes.TICKET_STATUS_CHANGED, {
                "ticket_id": ticket_id,
                "old_status": changes[0][1] if changes and changes[0][0] == "status" else None,
                "new_status": ticket_data.status,
                "updated_by": updated_by_id
            })
        
        return ticket
    
    def get_ticket_history(self, ticket_id: str) -> List[TicketHistoryEntry]:
        """Get ticket history."""
        return self.ticket_history.get(ticket_id, [])


# Global ticket service instance
ticket_service = TicketService()