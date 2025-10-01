"""Reports and analytics API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.security import get_current_user_id, require_permission
from app.models.reports import DashboardStats, ReportResponse
from app.services.ticket_service_db import get_ticket_service
from app.services.reports_service import reports_service
from app.services.auth_service import auth_service
from app.utils.errors import build_error_response, ErrorCodes

router = APIRouter()


def require_manager_or_admin(current_user_id: str = Depends(get_current_user_id)) -> str:
    """Dependency to require manager or admin role."""
    user = auth_service.get_user_by_id(current_user_id)
    if not user or user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=build_error_response(
                ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                "Manager or admin role required"
            )
        )
    return current_user_id


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(current_user_data: dict = Depends(require_permission("read:reports")), ticket_service=Depends(get_ticket_service)):
    """Get dashboard statistics."""
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


@router.get("/tickets-by-status", response_model=ReportResponse)
async def get_tickets_by_status_report(current_user_data: dict = Depends(require_permission("read:reports"))):
    """Get tickets grouped by status report (manager/admin only)."""
    try:
        report_data = reports_service.get_tickets_by_status_report()
        return ReportResponse(**report_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to generate status report", {"error": str(e)})
        )


@router.get("/tickets-by-priority", response_model=ReportResponse)
async def get_tickets_by_priority_report(current_user_data: dict = Depends(require_permission("read:reports"))):
    """Get tickets grouped by priority report (manager/admin only)."""
    try:
        report_data = reports_service.get_tickets_by_priority_report()
        return ReportResponse(**report_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to generate priority report", {"error": str(e)})
        )


@router.get("/tickets-by-department", response_model=ReportResponse)
async def get_tickets_by_department_report(current_user_data: dict = Depends(require_permission("read:reports"))):
    """Get tickets grouped by department report (manager/admin only)."""
    try:
        report_data = reports_service.get_tickets_by_department_report()
        return ReportResponse(**report_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to generate department report", {"error": str(e)})
        )


@router.get("/user-activity", response_model=ReportResponse)
async def get_user_activity_report(
    days: int = Query(30, description="Number of days to look back"),
    current_user_data: dict = Depends(require_permission("read:reports"))
):
    """Get user activity report for the last N days (manager/admin only)."""
    try:
        report_data = reports_service.get_user_activity_report(days)
        return ReportResponse(**report_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to generate user activity report", {"error": str(e)})
        )
