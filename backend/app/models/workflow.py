"""Workflow-related Pydantic models."""

from typing import Optional, Dict, Any
from pydantic import BaseModel
from enum import Enum


class WorkflowTrigger(str, Enum):
    """Workflow trigger types."""
    TICKET_CREATED = "ticket_created"
    TICKET_UPDATED = "ticket_updated"
    STATUS_CHANGED = "status_changed"


class WorkflowAction(str, Enum):
    """Workflow action types."""
    ASSIGN_USER = "assign_user"
    CHANGE_STATUS = "change_status"
    ADD_COMMENT = "add_comment"
    SEND_NOTIFICATION = "send_notification"


class WorkflowRuleBase(BaseModel):
    """Base workflow rule model."""
    name: str
    description: Optional[str] = None
    trigger: WorkflowTrigger
    conditions: Dict[str, Any]
    actions: Dict[str, Any]
    active: bool = True


class WorkflowRuleCreate(WorkflowRuleBase):
    """Workflow rule creation model."""
    pass


class WorkflowRuleUpdate(BaseModel):
    """Workflow rule update model."""
    name: Optional[str] = None
    description: Optional[str] = None
    conditions: Optional[Dict[str, Any]] = None
    actions: Optional[Dict[str, Any]] = None
    active: Optional[bool] = None


class WorkflowRuleResponse(WorkflowRuleBase):
    """Workflow rule response model (camelCase for API)."""
    id: str
    createdAt: str
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True


class WorkflowRuleInternal(WorkflowRuleBase):
    """Internal workflow rule model (snake_case)."""
    id: str
    created_at: str
    updated_at: Optional[str] = None