"""Workflow service for managing automation rules."""

import uuid
from datetime import datetime
from typing import Dict, List, Optional
import logging

from app.models.workflow import WorkflowRuleInternal, WorkflowRuleCreate, WorkflowRuleUpdate, WorkflowTrigger
from app.models.ticket import TicketInternal
from app.utils.errors import ErrorCodes, create_http_exception
from app.utils.events import event_bus, EventTypes

logger = logging.getLogger(__name__)


class WorkflowService:
    """Workflow automation service."""
    
    def __init__(self):
        self.rules: Dict[str, WorkflowRuleInternal] = {}
        self._setup_event_listeners()
    
    def _setup_event_listeners(self):
        """Setup event listeners for workflow triggers."""
        event_bus.subscribe(EventTypes.TICKET_CREATED, self._handle_ticket_created)
        event_bus.subscribe(EventTypes.TICKET_UPDATED, self._handle_ticket_updated)
        event_bus.subscribe(EventTypes.TICKET_STATUS_CHANGED, self._handle_status_changed)
    
    def create_rule(self, rule_data: WorkflowRuleCreate, created_by_id: str) -> WorkflowRuleInternal:
        """Create a new workflow rule."""
        rule_id = str(uuid.uuid4())
        rule = WorkflowRuleInternal(
            id=rule_id,
            name=rule_data.name,
            description=rule_data.description,
            trigger=rule_data.trigger,
            conditions=rule_data.conditions,
            actions=rule_data.actions,
            active=rule_data.active,
            created_at=datetime.utcnow().isoformat()
        )
        
        self.rules[rule_id] = rule
        logger.info(f"Created workflow rule: {rule.name} (ID: {rule_id})")
        
        return rule
    
    def get_rule(self, rule_id: str) -> Optional[WorkflowRuleInternal]:
        """Get workflow rule by ID."""
        return self.rules.get(rule_id)
    
    def get_all_rules(self) -> List[WorkflowRuleInternal]:
        """Get all workflow rules."""
        return list(self.rules.values())
    
    def update_rule(self, rule_id: str, rule_data: WorkflowRuleUpdate, updated_by_id: str) -> WorkflowRuleInternal:
        """Update workflow rule."""
        rule = self.rules.get(rule_id)
        if not rule:
            raise create_http_exception(
                404,
                ErrorCodes.E_WORKFLOW_NOT_FOUND,
                "Workflow rule not found"
            )
        
        # Update fields
        if rule_data.name is not None:
            rule.name = rule_data.name
        if rule_data.description is not None:
            rule.description = rule_data.description
        if rule_data.conditions is not None:
            rule.conditions = rule_data.conditions
        if rule_data.actions is not None:
            rule.actions = rule_data.actions
        if rule_data.active is not None:
            rule.active = rule_data.active
        
        rule.updated_at = datetime.utcnow().isoformat()
        
        return rule
    
    def delete_rule(self, rule_id: str, deleted_by_id: str) -> bool:
        """Delete workflow rule."""
        if rule_id not in self.rules:
            raise create_http_exception(
                404,
                ErrorCodes.E_WORKFLOW_NOT_FOUND,
                "Workflow rule not found"
            )
        
        del self.rules[rule_id]
        return True
    
    def _evaluate_conditions(self, conditions: Dict, context: Dict) -> bool:
        """Evaluate workflow conditions against context."""
        # Simple condition evaluation (can be extended)
        for key, expected_value in conditions.items():
            if key not in context or context[key] != expected_value:
                return False
        return True
    
    def _execute_actions(self, actions: Dict, context: Dict):
        """Execute workflow actions (stubbed implementation)."""
        logger.info(f"Executing workflow actions: {actions} with context: {context}")
        # In a real implementation, this would perform actual actions like:
        # - Assigning tickets
        # - Changing status
        # - Sending notifications
        # - Adding comments
    
    def _handle_ticket_created(self, event_data: Dict):
        """Handle ticket created event."""
        self._process_rules(WorkflowTrigger.TICKET_CREATED, event_data)
    
    def _handle_ticket_updated(self, event_data: Dict):
        """Handle ticket updated event."""
        self._process_rules(WorkflowTrigger.TICKET_UPDATED, event_data)
    
    def _handle_status_changed(self, event_data: Dict):
        """Handle ticket status changed event."""
        self._process_rules(WorkflowTrigger.STATUS_CHANGED, event_data)
    
    def _process_rules(self, trigger: WorkflowTrigger, event_data: Dict):
        """Process workflow rules for a given trigger."""
        matching_rules = [
            rule for rule in self.rules.values()
            if rule.active and rule.trigger == trigger
        ]
        
        for rule in matching_rules:
            try:
                if self._evaluate_conditions(rule.conditions, event_data["data"]):
                    logger.info(f"Workflow rule '{rule.name}' matched for trigger {trigger}")
                    self._execute_actions(rule.actions, event_data["data"])
                else:
                    logger.debug(f"Workflow rule '{rule.name}' conditions not met")
            except Exception as e:
                logger.error(f"Error processing workflow rule '{rule.name}': {e}")


# Global workflow service instance
workflow_service = WorkflowService()