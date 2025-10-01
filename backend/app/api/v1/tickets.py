"""Ticket management API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.security import get_current_user_id, require_permission, get_current_user_with_role
from app.models.ticket import TicketCreate, TicketUpdate, TicketResponse, TicketHistoryEntry
from app.models.reports import DashboardStats
from app.services.ticket_service_db import get_ticket_service
from app.services.auth_service_db import get_auth_service
from app.utils.errors import build_error_response, ErrorCodes

router = APIRouter()

# Add OPTIONS handlers for CORS


@router.options("/my")
async def options_my_tickets():
    print("OPTIONS /my called")
    return {"message": "OK"}


@router.options("/")
async def options_tickets():
    print("OPTIONS / called")
    return {"message": "OK"}


@router.options("/{ticket_id}")
async def options_ticket(ticket_id: str):
    print(f"OPTIONS /{ticket_id} called")
    return {"message": "OK"}


def convert_ticket_to_response(ticket) -> TicketResponse:
    """Convert internal ticket model to response model."""
    return TicketResponse(
        id=str(ticket.id),
        key=ticket.key,
        title=ticket.title,
        description=ticket.description,
        priority=ticket.priority,
        department=ticket.department,
        reporterId=str(ticket.reporter_id),
        assigneeIds=[str(a.id) for a in ticket.assignees],
        status=ticket.status,
        createdAt=ticket.created_at.isoformat(),
        updatedAt=ticket.updated_at.isoformat() if ticket.updated_at else None
    )


@router.get("/", response_model=List[TicketResponse])
async def get_tickets(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    assignee_id: Optional[str] = Query(
        None, description="Filter by assignee ID"),
    user_data: dict = Depends(require_permission("read:tickets")),
    ticket_service=Depends(get_ticket_service)
):
    """Get all tickets with optional filters."""
    try:
        filters = {}
        if status:
            filters["status"] = status
        if priority:
            filters["priority"] = priority
        if assignee_id:
            filters["assignee_id"] = assignee_id

        # Apply user-specific filtering for non-admin users
        user_role = user_data.get("role")
        user_id = user_data.get("user_id")

        if user_role == "client":
            # Clients can only see their own tickets
            filters["reporter_id"] = user_id
        elif user_role in ["developer", "support"]:
            # Developers and support can see tickets they're assigned to or reported
            filters["user_access"] = user_id

        tickets = ticket_service.get_all_tickets(filters if filters else None)
        return [convert_ticket_to_response(ticket) for ticket in tickets]
    except Exception as e:
        print(f"Error getting tickets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get tickets", {"error": str(e)})
        )


@router.post("/", response_model=TicketResponse)
async def create_ticket(
    ticket_data: TicketCreate,
    user_data: dict = Depends(require_permission("write:tickets")),
    ticket_service=Depends(get_ticket_service)
):
    """Create a new ticket."""
    try:
        user_id = user_data.get("user_id")
        ticket = ticket_service.create_ticket(ticket_data, user_id)
        return convert_ticket_to_response(ticket)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating ticket: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to create ticket", {"error": str(e)})
        )


@router.get("/my", response_model=List[TicketResponse])
async def get_my_tickets(
    user_data: dict = Depends(require_permission("read:tickets")),
    ticket_service=Depends(get_ticket_service)
):
    """Get tickets assigned to or reported by current user."""
    try:
        user_id = user_data.get("user_id")
        tickets = ticket_service.get_user_tickets(user_id)
        return [convert_ticket_to_response(ticket) for ticket in tickets]
    except Exception as e:
        print(f"Error getting tickets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get tickets", {"error": str(e)})
        )


@router.get("/dashboard-stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user_data: dict = Depends(require_permission("read:tickets")), ticket_service=Depends(get_ticket_service)):
    """Get dashboard statistics accessible to all users."""
    try:
        stats = ticket_service.get_ticket_stats()

        # Convert to dashboard format
        return DashboardStats(
            openTickets=stats["by_status"].get("open", 0),
            inProgressTickets=stats["by_status"].get("in_progress", 0),
            closedTickets=stats["by_status"].get("closed", 0),
            criticalTickets=stats["by_priority"].get("critical", 0),
            ticketsByDepartment=[
                {"department": dept, "count": count}
                for dept, count in stats["by_department"].items()
            ],
            ticketsByPriority=[
                {"priority": priority, "count": count}
                for priority, count in stats["by_priority"].items()
            ],
            recentActivity=[]  # Can be implemented later
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get dashboard stats", {"error": str(e)})
        )


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    user_data: dict = Depends(require_permission("read:tickets")),
    ticket_service=Depends(get_ticket_service)
):
    """Get ticket by ID."""
    try:
        ticket = ticket_service.get_ticket(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=build_error_response(
                    ErrorCodes.E_TICKET_NOT_FOUND, "Ticket not found")
            )

        # Check if user has access to this ticket
        user_role = user_data.get("role")
        user_id = user_data.get("user_id")

        if user_role == "client" and str(ticket.reporter_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=build_error_response(
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Can only view own tickets"
                )
            )
        elif user_role in ["developer", "support"] and str(ticket.reporter_id) != user_id and user_id not in [str(a.id) for a in ticket.assignees]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=build_error_response(
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Can only view assigned tickets"
                )
            )

        return convert_ticket_to_response(ticket)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get ticket", {"error": str(e)})
        )


@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    ticket_data: TicketUpdate,
    user_data: dict = Depends(require_permission("write:tickets")),
    ticket_service=Depends(get_ticket_service),
    auth_service=Depends(get_auth_service)
):
    """Update ticket."""
    try:
        # Check if ticket exists
        ticket = ticket_service.get_ticket(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=build_error_response(
                    ErrorCodes.E_TICKET_NOT_FOUND, "Ticket not found")
            )

        current_user = auth_service.get_user_by_id(user_data.get("user_id"))
        can_update = (
            current_user.role.value in ["admin", "manager"] or
            str(ticket.reporter_id) == user_data.get("user_id") or
            user_data.get("user_id") in [str(a.id) for a in ticket.assignees]
        )

        if not can_update:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=build_error_response(
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Not authorized to update this ticket"
                )
            )

        updated_ticket = ticket_service.update_ticket(
            ticket_id, ticket_data, user_data.get("user_id"))
        return convert_ticket_to_response(updated_ticket)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to update ticket", {"error": str(e)})
        )


@router.get("/{ticket_id}/history", response_model=List[TicketHistoryEntry])
async def get_ticket_history(
    ticket_id: str,
    user_data: dict = Depends(require_permission("read:tickets")),
    ticket_service=Depends(get_ticket_service)
):
    """Get ticket history."""
    try:
        # Check if ticket exists
        ticket = ticket_service.get_ticket(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=build_error_response(
                    ErrorCodes.E_TICKET_NOT_FOUND, "Ticket not found")
            )

        # Check if user has access to this ticket
        user_role = user_data.get("role")
        user_id = user_data.get("user_id")

        if user_role == "client" and str(ticket.reporter_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=build_error_response(
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Can only view own ticket history"
                )
            )
        elif user_role in ["developer", "support"] and str(ticket.reporter_id) != user_id and user_id not in [str(a.id) for a in ticket.assignees]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=build_error_response(
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Can only view assigned ticket history"
                )
            )

        history = ticket_service.get_ticket_history(ticket_id)
        # Convert to response format
        return [
            TicketHistoryEntry(
                id=str(entry.id),
                ticketId=str(entry.ticket_id),
                userId=str(entry.user_id),
                action=entry.action,
                oldValue=entry.old_value,
                newValue=entry.new_value,
                createdAt=entry.created_at.isoformat()
            )
            for entry in history
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get ticket history", {"error": str(e)})
        )


@router.get("/key/{ticket_key}", response_model=TicketResponse)
async def get_ticket_by_key(
    ticket_key: str,
    user_data: dict = Depends(require_permission("read:tickets")),
    ticket_service=Depends(get_ticket_service)
):
    """Get ticket by key (e.g., TSK-1001)."""
    try:
        ticket = ticket_service.get_ticket_by_key(ticket_key)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=build_error_response(
                    ErrorCodes.E_TICKET_NOT_FOUND, "Ticket not found")
            )

        # Check if user has access to this ticket
        user_role = user_data.get("role")
        user_id = user_data.get("user_id")

        if user_role == "client" and str(ticket.reporter_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=build_error_response(
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Can only view own tickets"
                )
            )
        elif user_role in ["developer", "support"] and str(ticket.reporter_id) != user_id and user_id not in [str(a.id) for a in ticket.assignees]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=build_error_response(
                    ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                    "Can only view assigned tickets"
                )
            )

        return convert_ticket_to_response(ticket)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get ticket", {"error": str(e)})
        )
