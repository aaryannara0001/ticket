import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/authStore';
import { AlertCircle, Shield, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    permission?: string;
    requiredRole?:
        | 'admin'
        | 'manager'
        | 'developer'
        | 'support'
        | 'it'
        | 'client';
    fallbackPath?: string;
}

export function ProtectedRoute({
    children,
    permission,
    requiredRole,
    fallbackPath: _fallbackPath = '/dashboard',
}: ProtectedRouteProps) {
    const { hasPermission, user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        // Simulate checking authentication state
        const checkAuth = async () => {
            try {
                // Check if user data is loaded
                if (!user) {
                    setAuthError('not_authenticated');
                } else {
                    setAuthError(null);
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
                setAuthError('auth_check_failed');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [user]);

    // Check authentication first
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (authError === 'not_authenticated') {
        return <Navigate to="/login" replace />;
    }

    if (authError === 'auth_check_failed') {
        return (
            <Alert className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Authentication check failed. Please try logging in again.
                </AlertDescription>
            </Alert>
        );
    }

    // Check role requirements
    if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
        return (
            <Alert className="m-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                    You don't have the required role ({requiredRole}) to access
                    this page.
                </AlertDescription>
            </Alert>
        );
    }

    // Check permission requirements
    if (permission && !hasPermission(permission)) {
        console.log(`Permission denied: ${permission} for user:`, user);
        return (
            <Alert className="m-4">
                <UserX className="h-4 w-4" />
                <AlertDescription>
                    You don't have permission to access this page. Required
                    permission: {permission}
                </AlertDescription>
            </Alert>
        );
    }

    return <>{children}</>;
}
