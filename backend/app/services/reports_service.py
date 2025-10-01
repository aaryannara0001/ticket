"""Reports and analytics service."""

from typing import Dict, List, Any
from collections import Counter
from datetime import datetime, timedelta

from app.models.reports import DashboardStats
from app.services.ticket_service import ticket_service
from app.services.auth_service import auth_service


class ReportsService:
    """Reports and analytics service."""
    
    def get_dashboard_stats(self) -> DashboardStats:
        """Generate dashboard statistics from current tickets."""
        tickets = ticket_service.get_all_tickets()
        
        # Count tickets by status
        status_counts = Counter(ticket.status for ticket in tickets)
        open_tickets = status_counts.get("open", 0)
        in_progress_tickets = status_counts.get("in_progress", 0)
        closed_tickets = status_counts.get("closed", 0)
        
        # Count critical tickets
        critical_tickets = sum(1 for ticket in tickets if ticket.priority == "critical")
        
        # Group by department
        dept_counts = Counter(ticket.department or "Unassigned" for ticket in tickets)
        tickets_by_department = [
            {"department": dept, "count": count}
            for dept, count in dept_counts.items()
        ]
        
        # Group by priority
        priority_counts = Counter(ticket.priority for ticket in tickets)
        tickets_by_priority = [
            {"priority": priority, "count": count}
            for priority, count in priority_counts.items()
        ]
        
        # Generate recent activity (last 10 tickets)
        recent_tickets = sorted(tickets, key=lambda t: t.created_at, reverse=True)[:10]
        recent_activity = []
        
        for ticket in recent_tickets:
            reporter = auth_service.get_user_by_id(ticket.reporter_id)
            reporter_name = reporter.name if reporter else "Unknown"
            
            recent_activity.append({
                "id": ticket.id,
                "message": f"{reporter_name} created ticket {ticket.key}: {ticket.title}",
                "createdAt": ticket.created_at
            })
        
        return DashboardStats(
            openTickets=open_tickets,
            inProgressTickets=in_progress_tickets,
            closedTickets=closed_tickets,
            criticalTickets=critical_tickets,
            ticketsByDepartment=tickets_by_department,
            ticketsByPriority=tickets_by_priority,
            recentActivity=recent_activity
        )
    
    def get_tickets_by_status_report(self) -> Dict[str, Any]:
        """Get tickets grouped by status report."""
        tickets = ticket_service.get_all_tickets()
        status_counts = Counter(ticket.status for ticket in tickets)
        
        return {
            "data": [
                {"status": status, "count": count}
                for status, count in status_counts.items()
            ],
            "metadata": {
                "total_tickets": len(tickets),
                "generated_at": datetime.utcnow().isoformat()
            }
        }
    
    def get_tickets_by_priority_report(self) -> Dict[str, Any]:
        """Get tickets grouped by priority report."""
        tickets = ticket_service.get_all_tickets()
        priority_counts = Counter(ticket.priority for ticket in tickets)
        
        return {
            "data": [
                {"priority": priority, "count": count}
                for priority, count in priority_counts.items()
            ],
            "metadata": {
                "total_tickets": len(tickets),
                "generated_at": datetime.utcnow().isoformat()
            }
        }
    
    def get_tickets_by_department_report(self) -> Dict[str, Any]:
        """Get tickets grouped by department report."""
        tickets = ticket_service.get_all_tickets()
        dept_counts = Counter(ticket.department or "Unassigned" for ticket in tickets)
        
        return {
            "data": [
                {"department": dept, "count": count}
                for dept, count in dept_counts.items()
            ],
            "metadata": {
                "total_tickets": len(tickets),
                "generated_at": datetime.utcnow().isoformat()
            }
        }
    
    def get_user_activity_report(self, days: int = 30) -> Dict[str, Any]:
        """Get user activity report for the last N days."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        tickets = ticket_service.get_all_tickets()
        
        # Filter tickets created in the last N days
        recent_tickets = [
            ticket for ticket in tickets
            if datetime.fromisoformat(ticket.created_at.replace('Z', '+00:00')) > cutoff_date
        ]
        
        # Count tickets by reporter
        reporter_counts = Counter(ticket.reporter_id for ticket in recent_tickets)
        
        # Get user names
        user_activity = []
        for user_id, count in reporter_counts.items():
            user = auth_service.get_user_by_id(user_id)
            user_name = user.name if user else "Unknown"
            user_activity.append({
                "user_id": user_id,
                "user_name": user_name,
                "tickets_created": count
            })
        
        return {
            "data": sorted(user_activity, key=lambda x: x["tickets_created"], reverse=True),
            "metadata": {
                "period_days": days,
                "total_tickets": len(recent_tickets),
                "generated_at": datetime.utcnow().isoformat()
            }
        }


# Global reports service instance
reports_service = ReportsService()