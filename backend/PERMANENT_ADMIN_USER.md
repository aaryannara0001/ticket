# Permanent Admin User Configuration

## Overview

The system is configured with a permanent admin user that cannot be deleted or modified in ways that would compromise system access.

## Admin User Details

-   **Email**: `admin@company.com`
-   **Default Password**: `password`
-   **Role**: `admin`
-   **Status**: Always active and email-verified

## Protection Features

### 1. Automatic Creation

The admin user is automatically created during:

-   Database initialization (`setup_database()`)
-   First server startup
-   Manual admin setup script

### 2. Permanent Protection

The admin user `admin@company.com` is protected from:

#### Cannot be Deleted

-   The `delete_user()` function prevents deletion of this user
-   API endpoints will return 403 error if deletion is attempted

#### Cannot Lose Admin Privileges

-   Role cannot be changed from `admin` to any other role
-   Update operations will return 403 error if role change is attempted

#### Cannot be Deactivated

-   The `active` status cannot be set to `false`
-   Update operations will return 403 error if deactivation is attempted

#### Cannot Change Email

-   The email address cannot be changed from `admin@company.com`
-   This prevents accidental loss of the known admin account

#### Always Verified

-   Email verification status is automatically set to `true`
-   Verification is enforced on every startup

### 3. Self-Healing

The system automatically corrects the admin user on startup:

-   Ensures the user exists
-   Verifies correct password hash
-   Maintains admin role
-   Keeps user active
-   Ensures email verification

## Files Modified

### Backend Service Protection

-   `backend/app/services/user_service_db.py`
    -   Added protection in `update_user()` method
    -   Added protection in `delete_user()` method

### Database Initialization

-   `backend/app/database/setup.py`

    -   Enhanced admin user creation with verification
    -   Added self-healing on startup

-   `backend/app/database/init_db.py`
    -   Enhanced admin user creation with verification
    -   Added self-healing on startup

### Admin Management Script

-   `backend/ensure_admin.py`
    -   Standalone script to verify/create admin user
    -   Can be run anytime to ensure admin access

## Usage

### Login as Admin

Use these credentials to login:

-   **Email**: `admin@company.com`
-   **Password**: `password`

### Verify Admin User

Run the admin setup script anytime:

```bash
cd backend
python3 ensure_admin.py
```

### Change Admin Password

To change the admin password, you must:

1. Login as admin
2. Use the user profile/settings interface
3. Or update the password through the API

**Note**: The default password will be restored if you run database initialization scripts again.

## Security Considerations

### Password Management

-   The default password is `password` for development
-   **IMPORTANT**: Change this password in production environments
-   Consider implementing stronger password requirements

### Production Deployment

For production deployments:

1. Change the default password immediately
2. Consider using environment variables for admin credentials
3. Implement additional security measures (2FA, IP restrictions, etc.)

### Backup Access

Since this admin user cannot be deleted:

-   It serves as a backup access method
-   Always available for system recovery
-   Cannot be accidentally removed by other admins

## Error Messages

If someone tries to modify the permanent admin user, they'll see:

-   `"Cannot delete permanent admin user"`
-   `"Cannot change role of permanent admin user"`
-   `"Cannot deactivate permanent admin user"`
-   `"Cannot change email of permanent admin user"`

## Troubleshooting

### Admin User Missing

If the admin user is missing:

1. Run `python3 backend/ensure_admin.py`
2. Or restart the server (auto-creation on startup)

### Cannot Login

If you cannot login as admin:

1. Verify the email: `admin@company.com`
2. Try the default password: `password`
3. Run the ensure_admin script to reset
4. Check database connectivity

### Lost Admin Access

If all admin access is lost:

1. Run `python3 backend/ensure_admin.py`
2. This will create/restore the permanent admin
3. Login with `admin@company.com` / `password`

## API Endpoints

The permanent admin protection is active on these endpoints:

-   `PUT /api/v1/users/{user_id}` - User updates
-   `DELETE /api/v1/users/{user_id}` - User deletion
-   Any user management operations through the frontend

## Summary

The `admin@company.com` user is now a permanent fixture of the system that:

-   ✅ Cannot be deleted
-   ✅ Cannot lose admin privileges
-   ✅ Cannot be deactivated
-   ✅ Cannot have email changed
-   ✅ Is automatically created/verified on startup
-   ✅ Provides guaranteed system access
-   ✅ Can be restored anytime with the ensure_admin script
