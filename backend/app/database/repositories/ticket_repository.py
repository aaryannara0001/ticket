"""Ticket repository for database operations."""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, func

from app.database.models import Ticket, TicketHistory, TicketComment, User, TicketStatus, TicketPriority
from app.models.ticket import TicketCreate, TicketUpdate


class TicketRepository:
    """Repository for ticket database operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, ticket_data: TicketCreate, reporter_id: str, ticket_key: str) -> Ticket:
        """Create a new ticket."""
        db_ticket = Ticket(
            key=ticket_key,
            title=ticket_data.title,
            description=ticket_data.description,
            priority=ticket_data.priority,
            department=ticket_data.department,
            reporter_id=reporter_id
        )
        
        # Add assignees if provided
        if ticket_data.assigneeIds:
            assignees = self.db.query(User).filter(
                User.id.in_(ticket_data.assigneeIds)
            ).all()
            db_ticket.assignees = assignees
        
        self.db.add(db_ticket)
        self.db.commit()
        self.db.refresh(db_ticket)
        return db_ticket
    
    def get_by_id(self, ticket_id: str) -> Optional[Ticket]:
        """Get ticket by ID with relationships."""
        return self.db.query(Ticket).options(
            joinedload(Ticket.reporter),
            joinedload(Ticket.assignees),
            joinedload(Ticket.project)
        ).filter(Ticket.id == ticket_id).first()
    
    def get_by_key(self, ticket_key: str) -> Optional[Ticket]:
        """Get ticket by key."""
        return self.db.query(Ticket).options(
            joinedload(Ticket.reporter),
            joinedload(Ticket.assignees),
            joinedload(Ticket.project)
        ).filter(Ticket.key == ticket_key).first()
    
    def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List[Ticket]:
        """Get all tickets with optional filters."""
        query = self.db.query(Ticket).options(
            joinedload(Ticket.reporter),
            joinedload(Ticket.assignees),
            joinedload(Ticket.project)
        )
        
        if filters:
            if filters.get("status"):
                query = query.filter(Ticket.status == filters["status"])
            if filters.get("priority"):
                query = query.filter(Ticket.priority == filters["priority"])
            if filters.get("department"):
                query = query.filter(Ticket.department == filters["department"])
            if filters.get("assignee_id"):
                query = query.join(Ticket.assignees).filter(
                    User.id == filters["assignee_id"]
                )
            if filters.get("reporter_id"):
                query = query.filter(Ticket.reporter_id == filters["reporter_id"])
        
        return query.order_by(desc(Ticket.created_at)).all()
    
    def get_user_tickets(self, user_id: str) -> List[Ticket]:
        """Get tickets assigned to or reported by user."""
        return self.db.query(Ticket).options(
            joinedload(Ticket.reporter),
            joinedload(Ticket.assignees),
            joinedload(Ticket.project)
        ).filter(
            or_(
                Ticket.reporter_id == user_id,
                Ticket.assignees.any(User.id == user_id)
            )
        ).order_by(desc(Ticket.created_at)).all()
    
    def update(self, ticket_id: str, ticket_data: TicketUpdate) -> Optional[Ticket]:
        """Update ticket."""
        db_ticket = self.get_by_id(ticket_id)
        if not db_ticket:
            return None
        
        update_data = ticket_data.dict(exclude_unset=True, exclude={"assigneeIds"})
        for field, value in update_data.items():
            setattr(db_ticket, field, value)
        
        # Handle assignees separately
        if ticket_data.assigneeIds is not None:
            assignees = self.db.query(User).filter(
                User.id.in_(ticket_data.assigneeIds)
            ).all()
            db_ticket.assignees = assignees
        
        self.db.commit()
        self.db.refresh(db_ticket)
        return db_ticket
    
    def delete(self, ticket_id: str) -> bool:
        """Delete ticket."""
        db_ticket = self.get_by_id(ticket_id)
        if not db_ticket:
            return False
        
        self.db.delete(db_ticket)
        self.db.commit()
        return True
    
    def get_next_ticket_number(self) -> int:
        """Get next ticket number for key generation."""
        last_ticket = self.db.query(Ticket).order_by(desc(Ticket.created_at)).first()
        if not last_ticket:
            return 1001
        
        # Extract number from key (e.g., TSK-1001 -> 1001)
        try:
            last_number = int(last_ticket.key.split('-')[1])
            return last_number + 1
        except (IndexError, ValueError):
            return 1001
    
    def get_stats(self) -> Dict[str, Any]:
        """Get ticket statistics."""
        total_tickets = self.db.query(Ticket).count()
        
        # Count by status
        status_counts = self.db.query(
            Ticket.status, func.count(Ticket.id)
        ).group_by(Ticket.status).all()
        
        # Count by priority
        priority_counts = self.db.query(
            Ticket.priority, func.count(Ticket.id)
        ).group_by(Ticket.priority).all()
        
        # Count by department
        dept_counts = self.db.query(
            func.coalesce(Ticket.department, 'Unassigned').label('department'),
            func.count(Ticket.id)
        ).group_by(Ticket.department).all()
        
        return {
            "total": total_tickets,
            "by_status": dict(status_counts),
            "by_priority": dict(priority_counts),
            "by_department": dict(dept_counts)
        }


class TicketHistoryRepository:
    """Repository for ticket history operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, ticket_id: str, user_id: str, action: str, 
               old_value: Optional[str] = None, new_value: Optional[str] = None) -> TicketHistory:
        """Create ticket history entry."""
        db_history = TicketHistory(
            ticket_id=ticket_id,
            user_id=user_id,
            action=action,
            old_value=old_value,
            new_value=new_value
        )
        self.db.add(db_history)
        self.db.commit()
        self.db.refresh(db_history)
        return db_history
    
    def get_by_ticket_id(self, ticket_id: str) -> List[TicketHistory]:
        """Get history for a ticket."""
        return self.db.query(TicketHistory).options(
            joinedload(TicketHistory.user)
        ).filter(
            TicketHistory.ticket_id == ticket_id
        ).order_by(TicketHistory.created_at).all()


class TicketCommentRepository:
    """Repository for ticket comment operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, ticket_id: str, user_id: str, content: str) -> TicketComment:
        """Create ticket comment."""
        db_comment = TicketComment(
            ticket_id=ticket_id,
            user_id=user_id,
            content=content
        )
        self.db.add(db_comment)
        self.db.commit()
        self.db.refresh(db_comment)
        return db_comment
    
    def get_by_ticket_id(self, ticket_id: str) -> List[TicketComment]:
        """Get comments for a ticket."""
        return self.db.query(TicketComment).options(
            joinedload(TicketComment.user)
        ).filter(
            TicketComment.ticket_id == ticket_id
        ).order_by(TicketComment.created_at).all()
    
    def update(self, comment_id: str, content: str) -> Optional[TicketComment]:
        """Update comment."""
        db_comment = self.db.query(TicketComment).filter(
            TicketComment.id == comment_id
        ).first()
        
        if not db_comment:
            return None
        
        db_comment.content = content
        self.db.commit()
        self.db.refresh(db_comment)
        return db_comment
    
    def delete(self, comment_id: str) -> bool:
        """Delete comment."""
        db_comment = self.db.query(TicketComment).filter(
            TicketComment.id == comment_id
        ).first()
        
        if not db_comment:
            return False
        
        self.db.delete(db_comment)
        self.db.commit()
        return True