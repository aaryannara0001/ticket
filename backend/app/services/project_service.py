"""Project management service with in-memory storage."""

import uuid
from datetime import datetime
from typing import List, Optional, Dict

from app.models.project import ProjectInternal, ProjectCreate, ProjectUpdate
from app.utils.errors import ErrorCodes, create_http_exception
from app.utils.events import event_bus, EventTypes


class ProjectService:
    """Project management service."""
    
    def __init__(self):
        self.projects: Dict[str, ProjectInternal] = {}
        self.projects_by_key: Dict[str, str] = {}  # key -> project_id mapping
    
    def create_project(self, project_data: ProjectCreate, created_by_id: str) -> ProjectInternal:
        """Create a new project."""
        # Check if key already exists
        if project_data.key in self.projects_by_key:
            raise create_http_exception(
                400,
                ErrorCodes.E_PROJECT_KEY_EXISTS,
                "Project key already exists"
            )
        
        # Create project
        project_id = str(uuid.uuid4())
        project = ProjectInternal(
            id=project_id,
            name=project_data.name,
            description=project_data.description,
            key=project_data.key,
            created_at=datetime.utcnow().isoformat()
        )
        
        # Store project
        self.projects[project_id] = project
        self.projects_by_key[project_data.key] = project_id
        
        # Publish event
        event_bus.publish(EventTypes.PROJECT_CREATED, {
            "project_id": project_id,
            "project_key": project_data.key,
            "created_by": created_by_id
        })
        
        return project
    
    def get_project(self, project_id: str) -> Optional[ProjectInternal]:
        """Get project by ID."""
        return self.projects.get(project_id)
    
    def get_project_by_key(self, project_key: str) -> Optional[ProjectInternal]:
        """Get project by key."""
        project_id = self.projects_by_key.get(project_key)
        return self.projects.get(project_id) if project_id else None
    
    def get_all_projects(self) -> List[ProjectInternal]:
        """Get all projects."""
        return list(self.projects.values())
    
    def update_project(self, project_id: str, project_data: ProjectUpdate, updated_by_id: str) -> ProjectInternal:
        """Update project."""
        project = self.projects.get(project_id)
        if not project:
            raise create_http_exception(
                404,
                ErrorCodes.E_PROJECT_NOT_FOUND,
                "Project not found"
            )
        
        # Check if new key already exists
        if project_data.key is not None and project_data.key != project.key:
            if project_data.key in self.projects_by_key:
                raise create_http_exception(
                    400,
                    ErrorCodes.E_PROJECT_KEY_EXISTS,
                    "Project key already exists"
                )
        
        # Update fields
        if project_data.name is not None:
            project.name = project_data.name
        if project_data.description is not None:
            project.description = project_data.description
        if project_data.key is not None:
            # Update key mapping
            del self.projects_by_key[project.key]
            self.projects_by_key[project_data.key] = project_id
            project.key = project_data.key
        
        project.updated_at = datetime.utcnow().isoformat()
        
        # Publish event
        event_bus.publish(EventTypes.PROJECT_UPDATED, {
            "project_id": project_id,
            "updated_by": updated_by_id,
            "changes": project_data.dict(exclude_unset=True)
        })
        
        return project
    
    def delete_project(self, project_id: str, deleted_by_id: str) -> bool:
        """Delete project."""
        project = self.projects.get(project_id)
        if not project:
            raise create_http_exception(
                404,
                ErrorCodes.E_PROJECT_NOT_FOUND,
                "Project not found"
            )
        
        # Remove from storage
        del self.projects[project_id]
        del self.projects_by_key[project.key]
        
        # Publish event
        event_bus.publish(EventTypes.PROJECT_DELETED, {
            "project_id": project_id,
            "deleted_by": deleted_by_id
        })
        
        return True


# Global project service instance
project_service = ProjectService()