"""Simple event bus for application events."""

import logging
from typing import Dict, Any, List, Callable
from datetime import datetime

logger = logging.getLogger(__name__)


class EventBus:
    """Simple in-memory event bus."""
    
    def __init__(self):
        self.listeners: Dict[str, List[Callable]] = {}
    
    def subscribe(self, event_type: str, callback: Callable):
        """Subscribe to an event type."""
        if event_type not in self.listeners:
            self.listeners[event_type] = []
        self.listeners[event_type].append(callback)
    
    def publish(self, event_type: str, data: Dict[str, Any]):
        """Publish an event."""
        event_data = {
            "type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        
        # Log the event (stub implementation)
        logger.info(f"Event published: {event_type} - {data}")
        
        # Call registered listeners
        if event_type in self.listeners:
            for callback in self.listeners[event_type]:
                try:
                    callback(event_data)
                except Exception as e:
                    logger.error(f"Error in event listener for {event_type}: {e}")


# Global event bus instance
event_bus = EventBus()


# Event types
class EventTypes:
    """Standard event types."""
    USER_CREATED = "user.created"
    USER_UPDATED = "user.updated"
    USER_DELETED = "user.deleted"
    
    TICKET_CREATED = "ticket.created"
    TICKET_UPDATED = "ticket.updated"
    TICKET_STATUS_CHANGED = "ticket.status_changed"
    TICKET_ASSIGNED = "ticket.assigned"
    
    PROJECT_CREATED = "project.created"
    PROJECT_UPDATED = "project.updated"
    PROJECT_DELETED = "project.deleted"