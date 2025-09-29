import { LoginPage } from '@/components/auth/LoginPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SignupPage } from '@/components/auth/SignupPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Layout } from '@/components/layout/Layout';
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

function App() {
    const { isAuthenticated } = useAuthStore();

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
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute permission="dashboard">
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

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
                        <ProtectedRoute permission="*">
                            <Layout>
                                <AdminPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute permission="dashboard">
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
