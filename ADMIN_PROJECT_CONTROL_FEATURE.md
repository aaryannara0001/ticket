# Admin Control for Project Management Features

## Overview

I've implemented a system where admins can control whether managers have access to project management features. This gives administrators granular control over which roles can access specific features.

## What Was Implemented

### 1. Settings Store (`src/store/settingsStore.ts`)

-   Created a new Zustand store to manage feature permissions
-   Added `projectManagement` permission that controls manager access to projects
-   Includes persistence so settings survive page refreshes
-   Provides helper function to check if a feature is enabled for a specific role

### 2. Enhanced Auth Store (`src/store/authStore.ts`)

-   Updated `hasPermission` function to check dynamic feature permissions
-   Special handling for `epics` permission for managers
-   Managers now need both role permission AND admin approval to access projects

### 3. Admin Panel Settings Tab (`src/components/admin/AdminPage.tsx`)

-   Replaced the placeholder "Settings" tab with actual feature controls
-   Added toggle switch for "Project Management for Managers"
-   Shows current access matrix for all user roles
-   Visual warning when project management is disabled
-   Real-time updates when settings are changed

### 4. Sidebar Updates (`src/components/layout/Sidebar.tsx`)

-   Enhanced menu filtering to respect dynamic permissions
-   Projects menu item now checks both role permissions and admin settings
-   Managers only see the Projects menu when enabled by admin

### 5. Project Pages Protection

-   **ProjectsPage** (`src/components/projects/ProjectsPage.tsx`)
-   **EpicsPage** (`src/components/epics/EpicsPage.tsx`)
-   Both pages now check for actual permissions before rendering
-   Show access denied message with user-friendly explanation when disabled
-   Maintains security even if users try to access URLs directly

## How It Works

### For Admins:

1. Login as admin (admin@company.com / password)
2. Go to Admin Panel → Settings tab
3. Toggle "Project Management for Managers" on/off
4. Changes take effect immediately for all managers

### For Managers:

1. When enabled: Full access to Projects page, can create/edit/delete projects
2. When disabled:
    - Projects menu item disappears from sidebar
    - Direct URL access shows "Access Restricted" message
    - Clear explanation of why access is denied

### For Other Roles:

-   Team Members and Clients: No access to projects (unchanged)
-   Admins: Always have full access regardless of settings

## Security Features

-   **Route Protection**: Even if managers try to access `/epics` directly, they're blocked
-   **Menu Filtering**: UI elements are hidden when permissions are revoked
-   **Persistent Settings**: Admin choices are saved and persist across sessions
-   **Real-time Updates**: No need to refresh - changes apply immediately

## Testing the Feature

1. **Test as Admin**:

    - Login: admin@company.com / password
    - Navigate to Admin Panel → Settings
    - Toggle the project management permission

2. **Test as Manager**:

    - Login: manager@company.com / password
    - Try accessing Projects page with permission on/off
    - Notice sidebar menu changes

3. **Verify Security**:
    - Try accessing `/epics` URL directly when disabled
    - Should show access restriction message

## Benefits

-   **Granular Control**: Admins can enable/disable features per role
-   **User-Friendly**: Clear feedback when access is restricted
-   **Scalable**: Easy to add more feature permissions in the future
-   **Secure**: Multiple layers of protection (UI, routing, API-level checks)
-   **Flexible**: Settings can be changed at any time without code changes

This implementation provides the exact functionality requested: admin control over manager access to project management features, with proper security and user experience considerations.
