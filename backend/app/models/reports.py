"""Reports and dashboard-related Pydantic models."""

from typing import List, Dict, Any
from pydantic import BaseModel


class DashboardStats(BaseModel):
    """Dashboard statistics model."""
    openTickets: int
    inProgressTickets: int
    closedTickets: int
    criticalTickets: int
    ticketsByDepartment: List[Dict[str, Any]]
    ticketsByPriority: List[Dict[str, Any]]
    recentActivity: List[Dict[str, Any]]


class TicketsByStatus(BaseModel):
    """Tickets grouped by status."""
    status: str
    count: int


class TicketsByPriority(BaseModel):
    """Tickets grouped by priority."""
    priority: str
    count: int


class TicketsByDepartment(BaseModel):
    """Tickets grouped by department."""
    department: str
    count: int


class RecentActivity(BaseModel):
    """Recent activity item."""
    id: str
    message: str
    createdAt: str


class ReportResponse(BaseModel):
    """Generic report response."""
    data: List[Dict[str, Any]]
    metadata: Dict[str, Any]