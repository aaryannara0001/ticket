"""Ticket-related Pydantic models."""

from typing import Optional, List
from pydantic import BaseModel
from enum import Enum
from datetime import datetime


class TicketStatus(str, Enum):
    """Ticket status enumeration."""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"
    BLOCKED = "blocked"


class TicketPriority(str, Enum):
    """Ticket priority enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TicketBase(BaseModel):
    """Base ticket model."""
    title: str
    description: str
    priority: TicketPriority = TicketPriority.MEDIUM
    department: Optional[str] = None


class TicketCreate(TicketBase):
    """Ticket creation model."""
    assigneeIds: Optional[List[str]] = []


class TicketUpdate(BaseModel):
    """Ticket update model."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    assigneeIds: Optional[List[str]] = None
    department: Optional[str] = None


class TicketResponse(TicketBase):
    """Ticket response model (camelCase for API)."""
    id: str
    key: str
    reporterId: str
    assigneeIds: List[str]
    status: TicketStatus
    createdAt: str
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True


class TicketInternal(TicketBase):
    """Internal ticket model (snake_case)."""
    id: str
    key: str
    reporter_id: str
    assignee_ids: List[str]
    status: TicketStatus
    created_at: str
    updated_at: Optional[str] = None


class TicketHistoryEntry(BaseModel):
    """Ticket history entry model."""
    id: str
    ticketId: str
    userId: str
    action: str
    oldValue: Optional[str] = None
    newValue: Optional[str] = None
    createdAt: str