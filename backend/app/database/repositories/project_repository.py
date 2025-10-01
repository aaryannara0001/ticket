"""Project repository for database operations."""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.models import Project
from app.models.project import ProjectCreate, ProjectUpdate


class ProjectRepository:
    """Repository for project database operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, project_data: ProjectCreate) -> Project:
        """Create a new project."""
        db_project = Project(
            name=project_data.name,
            description=project_data.description,
            key=project_data.key
        )
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        return db_project
    
    def get_by_id(self, project_id: str) -> Optional[Project]:
        """Get project by ID."""
        return self.db.query(Project).filter(Project.id == project_id).first()
    
    def get_by_key(self, project_key: str) -> Optional[Project]:
        """Get project by key."""
        return self.db.query(Project).filter(Project.key == project_key).first()
    
    def get_all(self) -> List[Project]:
        """Get all projects."""
        return self.db.query(Project).order_by(Project.name).all()
    
    def update(self, project_id: str, project_data: ProjectUpdate) -> Optional[Project]:
        """Update project."""
        db_project = self.get_by_id(project_id)
        if not db_project:
            return None
        
        update_data = project_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project, field, value)
        
        self.db.commit()
        self.db.refresh(db_project)
        return db_project
    
    def delete(self, project_id: str) -> bool:
        """Delete project."""
        db_project = self.get_by_id(project_id)
        if not db_project:
            return False
        
        self.db.delete(db_project)
        self.db.commit()
        return True
    
    def key_exists(self, key: str, exclude_project_id: Optional[str] = None) -> bool:
        """Check if project key exists."""
        query = self.db.query(Project).filter(Project.key == key)
        if exclude_project_id:
            query = query.filter(Project.id != exclude_project_id)
        return query.first() is not None