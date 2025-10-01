"""
Enhanced Authorization System - Usage Examples
==============================================

This file demonstrates how to use the comprehensive role-based authorization system
implemented in the ticketing application.

## Frontend Usage:

1. ProtectedRoute Component:

    - Use `permission` prop for feature-based access control
    - Use `requiredRole` prop for strict role requirements
    - Use `fallbackPath` to customize redirect destination

    Examples:

    ```tsx
    // Require specific permission
    <ProtectedRoute permission="read:reports">
      <ReportsPage />
    </ProtectedRoute>

    // Require admin role
    <ProtectedRoute requiredRole="admin">
      <AdminPage />
    </ProtectedRoute>

    // Custom fallback path
    <ProtectedRoute permission="write:users" fallbackPath="/dashboard">
      <UserManagementPage />
    </ProtectedRoute>
    ```

2. Permission Checking in Components:

    ```tsx
    const { hasPermission } = useAuthStore();

    if (hasPermission('write:tickets')) {
        // Show create ticket button
    }
    ```

## Backend Usage:

1. Permission-based Authorization:

    ```python
    from app.core.security import require_permission

    @router.get("/tickets")
    async def get_tickets(
        user_data: dict = Depends(require_permission("read:tickets"))
    ):
        # User has read:tickets permission
        pass
    ```

2. Role-based Authorization:

    ```python
    from app.core.security import require_role, require_admin_role

    @router.get("/admin/users")
    async def get_all_users(
        user_data: dict = Depends(require_admin_role())
    ):
        # Only admins can access
        pass

    @router.get("/manager/reports")
    async def get_reports(
        user_data: dict = Depends(require_role("manager", "admin"))
    ):
        # Managers and admins can access
        pass
    ```

3. Using Authorization Middleware:

    ```python
    from app.core.security import (
        require_read_tickets, require_write_tickets,
        require_assign_tickets, require_admin
    )

    @router.get("/tickets")
    async def get_tickets(user_data: dict = Depends(require_read_tickets)):
        pass

    @router.post("/tickets")
    async def create_ticket(user_data: dict = Depends(require_write_tickets)):
        pass
    ```

## Role Permissions:

Admin: ["*"] (all permissions)
Manager: tickets, users, reports, dashboard, projects, workflows
Developer: tickets, projects, dashboard
Support: tickets, dashboard
IT: tickets, users, projects, workflows, reports, dashboard
Client: tickets, dashboard (own tickets only)

## Error Handling:

1. Frontend errors are user-friendly and don't expose internal details
2. Backend errors are logged with detailed information for debugging
3. JWT validation includes token expiration and user status checks
4. CORS preflight requests are handled properly

## Security Features:

1. JWT token validation with expiration checks
2. User status verification (active/inactive)
3. Role-based access control
4. Permission-based feature access
5. Comprehensive error logging
6. Automatic token cleanup on authentication failures
7. CORS protection with proper preflight handling

## Testing Authorization:

To test the authorization system:

1. Login with different user roles
2. Try accessing restricted pages
3. Check browser console for detailed error logs
4. Verify backend logs for authorization failure information
5. Test token expiration scenarios

## Debugging Tips:

1. Check browser Network tab for API request/response details
2. Look at browser console for frontend error messages
3. Check backend logs for detailed authorization failure information
4. Use the demo credentials to test different permission levels
5. Verify JWT token contents if needed

This system provides comprehensive security while maintaining good user experience.
"""
