"""Workflow repository for database operations."""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.models import WorkflowRule, WorkflowTrigger
from app.models.workflow import WorkflowRuleCreate, WorkflowRuleUpdate


class WorkflowRepository:
    """Repository for workflow rule database operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, rule_data: WorkflowRuleCreate) -> WorkflowRule:
        """Create a new workflow rule."""
        db_rule = WorkflowRule(
            name=rule_data.name,
            description=rule_data.description,
            trigger=rule_data.trigger,
            conditions=rule_data.conditions,
            actions=rule_data.actions,
            active=rule_data.active
        )
        self.db.add(db_rule)
        self.db.commit()
        self.db.refresh(db_rule)
        return db_rule
    
    def get_by_id(self, rule_id: str) -> Optional[WorkflowRule]:
        """Get workflow rule by ID."""
        return self.db.query(WorkflowRule).filter(WorkflowRule.id == rule_id).first()
    
    def get_all(self, active_only: bool = False) -> List[WorkflowRule]:
        """Get all workflow rules."""
        query = self.db.query(WorkflowRule)
        if active_only:
            query = query.filter(WorkflowRule.active == True)
        return query.order_by(WorkflowRule.name).all()
    
    def get_by_trigger(self, trigger: WorkflowTrigger, active_only: bool = True) -> List[WorkflowRule]:
        """Get workflow rules by trigger type."""
        query = self.db.query(WorkflowRule).filter(WorkflowRule.trigger == trigger)
        if active_only:
            query = query.filter(WorkflowRule.active == True)
        return query.all()
    
    def update(self, rule_id: str, rule_data: WorkflowRuleUpdate) -> Optional[WorkflowRule]:
        """Update workflow rule."""
        db_rule = self.get_by_id(rule_id)
        if not db_rule:
            return None
        
        update_data = rule_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_rule, field, value)
        
        self.db.commit()
        self.db.refresh(db_rule)
        return db_rule
    
    def delete(self, rule_id: str) -> bool:
        """Delete workflow rule."""
        db_rule = self.get_by_id(rule_id)
        if not db_rule:
            return False
        
        self.db.delete(db_rule)
        self.db.commit()
        return True