/**
 * Hook to initialize the app with backend data
 */

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTicketStore } from '../store/ticketStore';

export function useAppInitialization() {
    const { user, isInitialized, loadUsers, initialize } = useAuthStore();
    const { fetchTickets, fetchDashboardStats } = useTicketStore();

    useEffect(() => {
        // Initialize auth state
        initialize();
    }, [initialize]);

    useEffect(() => {
        // Load additional data when authenticated
        if (user && isInitialized) {
            const loadAppData = async () => {
                try {
                    // Load users for admin/manager roles
                    if (user.role === 'admin' || user.role === 'manager') {
                        await loadUsers();
                    }

                    // Load tickets and dashboard stats
                    await Promise.all([fetchTickets(), fetchDashboardStats()]);
                } catch (error) {
                    console.error('Failed to load app data:', error);
                }
            };

            loadAppData();
        }
    }, [user, isInitialized, loadUsers, fetchTickets, fetchDashboardStats]);

    return {
        isInitialized,
        isAuthenticated: !!user,
        user,
    };
}
