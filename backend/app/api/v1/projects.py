"""Project management API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id, require_permission
from app.models.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.project_service import project_service
from app.services.auth_service import auth_service
from app.utils.errors import build_error_response, ErrorCodes

router = APIRouter()


def convert_project_to_response(project) -> ProjectResponse:
    """Convert internal project model to response model."""
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        key=project.key,
        createdAt=project.created_at,
        updatedAt=project.updated_at
    )


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


@router.get("/", response_model=List[ProjectResponse])
async def get_projects(current_user_data: dict = Depends(require_permission("read:projects"))):
    """Get all projects."""
    try:
        projects = project_service.get_all_projects()
        return [convert_project_to_response(project) for project in projects]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get projects", {"error": str(e)})
        )


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    current_user_data: dict = Depends(require_permission("write:projects"))
):
    """Create a new project (manager/admin only)."""
    try:
        project = project_service.create_project(
            project_data, current_user_data.get("user_id"))
        return convert_project_to_response(project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to create project", {"error": str(e)})
        )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user_data: dict = Depends(require_permission("read:projects"))
):
    """Get project by ID."""
    try:
        project = project_service.get_project(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=build_error_response(
                    ErrorCodes.E_PROJECT_NOT_FOUND, "Project not found")
            )

        return convert_project_to_response(project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get project", {"error": str(e)})
        )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user_data: dict = Depends(require_permission("write:projects"))
):
    """Update project (manager/admin only)."""
    try:
        project = project_service.update_project(
            project_id, project_data, current_user_data.get("user_id"))
        return convert_project_to_response(project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to update project", {"error": str(e)})
        )


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user_data: dict = Depends(require_permission("write:projects"))
):
    """Delete project (manager/admin only)."""
    try:
        project_service.delete_project(
            project_id, current_user_data.get("user_id"))
        return {"message": "Project deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to delete project", {"error": str(e)})
        )


@router.get("/key/{project_key}", response_model=ProjectResponse)
async def get_project_by_key(
    project_key: str,
    current_user_data: dict = Depends(require_permission("read:projects"))
):
    """Get project by key."""
    try:
        project = project_service.get_project_by_key(project_key)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=build_error_response(
                    ErrorCodes.E_PROJECT_NOT_FOUND, "Project not found")
            )

        return convert_project_to_response(project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get project", {"error": str(e)})
        )
