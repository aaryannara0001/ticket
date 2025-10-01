import { LoginPage } from '@/components/auth/LoginPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SignupPage } from '@/components/auth/SignupPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Layout } from '@/components/layout/Layout';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useAuthStore } from '@/store/authStore';
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom';

// Import all page components
import { AdminPage } from '@/components/admin/AdminPage';
import { EpicsPage } from '@/components/epics/EpicsPage';
import { KanbanPage } from '@/components/kanban/KanbanPage';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { ReportsPage } from '@/components/reports/ReportsPage';
import { MyTicketsPage } from '@/components/tickets/MyTicketsPage';
import { TicketsPage } from '@/components/tickets/TicketsPage';
import { WorkflowsPage } from '@/components/workflows/WorkflowsPage';

// Role-based default page mapping
const getDefaultPageForRole = (role: string): string => {
    // Dashboard is the default for all users
    const roleDefaults: Record<string, string> = {
        admin: '/dashboard',
        manager: '/dashboard',
        developer: '/dashboard',
        support: '/dashboard',
        it: '/dashboard',
        client: '/dashboard',
    };
    return roleDefaults[role] || '/dashboard';
};

// Component for role-based redirection
const RoleBasedRedirect = () => {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const defaultPage = getDefaultPageForRole(user.role);
    return <Navigate to={defaultPage} replace />;
};

function App() {
    const isAuthenticated = useAuthStore((state) => !!state.user);
    const { isInitialized } = useAppInitialization();

    // Show loading spinner while initializing
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <Router
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <RoleBasedRedirect />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Role-based default redirects */}
                <Route path="/default" element={<RoleBasedRedirect />} />

                <Route
                    path="/tickets"
                    element={
                        <ProtectedRoute permission="tickets">
                            <Layout>
                                <TicketsPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-tickets"
                    element={
                        <ProtectedRoute permission="my_tickets">
                            <Layout>
                                <MyTicketsPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/kanban"
                    element={
                        <ProtectedRoute permission="kanban">
                            <Layout>
                                <KanbanPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/epics"
                    element={
                        <ProtectedRoute permission="epics">
                            <Layout>
                                <EpicsPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute permission="reports">
                            <Layout>
                                <ReportsPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <Layout>
                                <AdminPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute permission="profile">
                            <Layout>
                                <ProfilePage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/workflows"
                    element={
                        <ProtectedRoute permission="workflows">
                            <Layout>
                                <WorkflowsPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
