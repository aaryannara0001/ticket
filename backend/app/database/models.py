"""SQLAlchemy database models."""

from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, Integer,
    ForeignKey, Table, JSON, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.database.base import Base


def generate_uuid():
    """Generate UUID as string for cross-database compatibility."""
    return str(uuid.uuid4())


# Association table for ticket assignees (many-to-many)
ticket_assignees = Table(
    'ticket_assignees',
    Base.metadata,
    Column('ticket_id', String(36), ForeignKey(
        'tickets.id'), primary_key=True),
    Column('user_id', String(36), ForeignKey('users.id'), primary_key=True)
)


class UserRole(str, enum.Enum):
    """User role enumeration."""
    DEVELOPER = "developer"
    SUPPORT = "support"
    IT = "it"
    MANAGER = "manager"
    ADMIN = "admin"
    CLIENT = "client"


class TicketStatus(str, enum.Enum):
    """Ticket status enumeration."""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"
    BLOCKED = "blocked"


class TicketPriority(str, enum.Enum):
    """Ticket priority enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class WorkflowTrigger(str, enum.Enum):
    """Workflow trigger types."""
    TICKET_CREATED = "ticket_created"
    TICKET_UPDATED = "ticket_updated"
    STATUS_CHANGED = "status_changed"


class UserVerificationStatus(str, enum.Enum):
    """User email verification status enumeration."""
    PENDING = "pending"
    VERIFIED = "verified"


class User(Base):
    """User model."""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False,
                  default=UserRole.DEVELOPER)
    active = Column(Boolean, default=True, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(255), nullable=True)
    verification_token_expires = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),
                        onupdate=func.now())    # Relationships
    reported_tickets = relationship(
        "Ticket", foreign_keys="Ticket.reporter_id", back_populates="reporter")
    assigned_tickets = relationship(
        "Ticket", secondary=ticket_assignees, back_populates="assignees")
    ticket_history = relationship("TicketHistory", back_populates="user")
    attachments = relationship("Attachment", back_populates="uploaded_by_user")


class Project(Base):
    """Project model."""
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    key = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tickets = relationship("Ticket", back_populates="project")


class Ticket(Base):
    """Ticket model."""
    __tablename__ = "tickets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    key = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLEnum(TicketStatus), nullable=False,
                    default=TicketStatus.OPEN)
    priority = Column(SQLEnum(TicketPriority), nullable=False,
                      default=TicketPriority.MEDIUM)
    department = Column(String(100))

    # Foreign keys
    reporter_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    reporter = relationship("User", foreign_keys=[
                            reporter_id], back_populates="reported_tickets")
    assignees = relationship(
        "User", secondary=ticket_assignees, back_populates="assigned_tickets")
    project = relationship("Project", back_populates="tickets")
    history = relationship(
        "TicketHistory", back_populates="ticket", cascade="all, delete-orphan")
    attachments = relationship(
        "Attachment", back_populates="ticket", cascade="all, delete-orphan")
    comments = relationship(
        "TicketComment", back_populates="ticket", cascade="all, delete-orphan")


class TicketHistory(Base):
    """Ticket history model."""
    __tablename__ = "ticket_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    old_value = Column(Text)
    new_value = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ticket = relationship("Ticket", back_populates="history")
    user = relationship("User", back_populates="ticket_history")


class TicketComment(Base):
    """Ticket comment model."""
    __tablename__ = "ticket_comments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    ticket = relationship("Ticket", back_populates="comments")
    user = relationship("User")


class Attachment(Base):
    """Attachment model."""
    __tablename__ = "attachments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    size = Column(Integer, nullable=False)
    file_key = Column(String(500), nullable=False)
    uploaded_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ticket = relationship("Ticket", back_populates="attachments")
    uploaded_by_user = relationship("User", back_populates="attachments")


class WorkflowRule(Base):
    """Workflow rule model."""
    __tablename__ = "workflow_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    trigger = Column(SQLEnum(WorkflowTrigger), nullable=False)
    conditions = Column(JSON, nullable=False, default=dict)
    actions = Column(JSON, nullable=False, default=dict)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class RefreshToken(Base):
    """Refresh token model."""
    __tablename__ = "refresh_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    token = Column(String(500), nullable=False, unique=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")


class Department(Base):
    """Department model."""
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
