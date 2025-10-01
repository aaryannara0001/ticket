"""Workflow management API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id, require_permission
from app.models.workflow import WorkflowRuleCreate, WorkflowRuleUpdate, WorkflowRuleResponse
from app.services.workflow_service import workflow_service
from app.services.auth_service import auth_service
from app.utils.errors import build_error_response, ErrorCodes

router = APIRouter()


def convert_workflow_to_response(rule) -> WorkflowRuleResponse:
    """Convert internal workflow rule model to response model."""
    return WorkflowRuleResponse(
        id=rule.id,
        name=rule.name,
        description=rule.description,
        trigger=rule.trigger,
        conditions=rule.conditions,
        actions=rule.actions,
        active=rule.active,
        createdAt=rule.created_at,
        updatedAt=rule.updated_at
    )


def require_admin_role(current_user_id: str = Depends(get_current_user_id)) -> str:
    """Dependency to require admin role."""
    user = auth_service.get_user_by_id(current_user_id)
    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=build_error_response(
                ErrorCodes.E_AUTH_INSUFFICIENT_PERMISSIONS,
                "Admin role required"
            )
        )
    return current_user_id


@router.get("/", response_model=List[WorkflowRuleResponse])
async def get_workflow_rules(current_user_data: dict = Depends(require_permission("read:workflows"))):
    """Get all workflow rules (admin only)."""
    try:
        rules = workflow_service.get_all_rules()
        return [convert_workflow_to_response(rule) for rule in rules]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get workflow rules", {"error": str(e)})
        )


@router.post("/", response_model=WorkflowRuleResponse)
async def create_workflow_rule(
    rule_data: WorkflowRuleCreate,
    current_user_data: dict = Depends(require_permission("write:workflows"))
):
    """Create a new workflow rule (admin only)."""
    try:
        rule = workflow_service.create_rule(
            rule_data, current_user_data.get("user_id"))
        return convert_workflow_to_response(rule)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to create workflow rule", {"error": str(e)})
        )


@router.get("/{rule_id}", response_model=WorkflowRuleResponse)
async def get_workflow_rule(
    rule_id: str,
    current_user_data: dict = Depends(require_permission("read:workflows"))
):
    """Get workflow rule by ID (admin only)."""
    try:
        rule = workflow_service.get_rule(rule_id)
        if not rule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=build_error_response(
                    ErrorCodes.E_WORKFLOW_NOT_FOUND, "Workflow rule not found")
            )

        return convert_workflow_to_response(rule)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to get workflow rule", {"error": str(e)})
        )


@router.put("/{rule_id}", response_model=WorkflowRuleResponse)
async def update_workflow_rule(
    rule_id: str,
    rule_data: WorkflowRuleUpdate,
    current_user_data: dict = Depends(require_permission("write:workflows"))
):
    """Update workflow rule (admin only)."""
    try:
        rule = workflow_service.update_rule(
            rule_id, rule_data, current_user_data.get("user_id"))
        return convert_workflow_to_response(rule)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to update workflow rule", {"error": str(e)})
        )


@router.delete("/{rule_id}")
async def delete_workflow_rule(
    rule_id: str,
    current_user_data: dict = Depends(require_permission("write:workflows"))
):
    """Delete workflow rule (admin only)."""
    try:
        workflow_service.delete_rule(rule_id, current_user_data.get("user_id"))
        return {"message": "Workflow rule deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=build_error_response(
                "E_INTERNAL_ERROR", "Failed to delete workflow rule", {"error": str(e)})
        )
