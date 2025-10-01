"""Error handling utilities and response builders."""

from typing import Dict, Any, Optional
from fastapi import HTTPException


class ErrorCodes:
    """Standard error codes for the application."""
    
    # Authentication errors
    E_AUTH_INVALID_CREDENTIALS = "E_AUTH_INVALID_CREDENTIALS"
    E_AUTH_TOKEN_EXPIRED = "E_AUTH_TOKEN_EXPIRED"
    E_AUTH_TOKEN_INVALID = "E_AUTH_TOKEN_INVALID"
    E_AUTH_INSUFFICIENT_PERMISSIONS = "E_AUTH_INSUFFICIENT_PERMISSIONS"
    
    # User errors
    E_USER_NOT_FOUND = "E_USER_NOT_FOUND"
    E_USER_EMAIL_EXISTS = "E_USER_EMAIL_EXISTS"
    E_USER_INVALID_ROLE = "E_USER_INVALID_ROLE"
    
    # Ticket errors
    E_TICKET_NOT_FOUND = "E_TICKET_NOT_FOUND"
    E_TICKET_INVALID_STATUS_TRANSITION = "E_TICKET_INVALID_STATUS_TRANSITION"
    E_TICKET_INVALID_ASSIGNEE = "E_TICKET_INVALID_ASSIGNEE"
    
    # Project errors
    E_PROJECT_NOT_FOUND = "E_PROJECT_NOT_FOUND"
    E_PROJECT_KEY_EXISTS = "E_PROJECT_KEY_EXISTS"
    
    # Workflow errors
    E_WORKFLOW_NOT_FOUND = "E_WORKFLOW_NOT_FOUND"
    E_WORKFLOW_INVALID_RULE = "E_WORKFLOW_INVALID_RULE"
    
    # General errors
    E_VALIDATION_ERROR = "E_VALIDATION_ERROR"
    E_INTERNAL_ERROR = "E_INTERNAL_ERROR"


def build_error_response(
    error_code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Build standardized error response."""
    return {
        "error": error_code,
        "message": message,
        "details": details or {}
    }


def create_http_exception(
    status_code: int,
    error_code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None
) -> HTTPException:
    """Create HTTPException with standardized error format."""
    return HTTPException(
        status_code=status_code,
        detail=build_error_response(error_code, message, details)
    )