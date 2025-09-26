import { User } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSettingsStore } from './settingsStore';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
}

// Mock users for demo
const mockUsers: User[] = [
    {
        id: '1',
        name: 'John Admin',
        email: 'admin@company.com',
        role: 'admin',
        department: 'IT',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '2',
        name: 'Sarah Manager',
        email: 'manager@company.com',
        role: 'manager',
        department: 'Engineering',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '3',
        name: 'Mike Developer',
        email: 'developer@company.com',
        role: 'team_member',
        department: 'Engineering',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '4',
        name: 'Lisa Client',
        email: 'client@company.com',
        role: 'client',
        department: 'External',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
];

const rolePermissions: Record<string, string[]> = {
    admin: ['*'],
    manager: [
        'dashboard',
        'tickets',
        'my_tickets',
        'kanban',
        'epics',
        'reports',
        'workflows',
        'team_management',
        'create_ticket',
        'ticket_detail',
        'assign_tickets',
    ],
    team_member: [
        'dashboard',
        'tickets',
        'my_tickets',
        'kanban',
        'create_ticket',
        'ticket_detail',
    ],
    client: [
        'dashboard',
        'tickets',
        'my_tickets',
        'create_ticket',
        'ticket_detail',
    ],
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,

            login: async (email: string, password: string) => {
                // Mock authentication
                const user = mockUsers.find((u) => u.email === email);
                if (user && password === 'password') {
                    set({ user, isAuthenticated: true });
                    return true;
                }
                return false;
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },

            hasPermission: (permission: string) => {
                const { user } = get();
                if (!user) return false;

                const permissions = rolePermissions[user.role] || [];
                const hasBasicPermission =
                    permissions.includes('*') ||
                    permissions.includes(permission);

                // Check if this is a project management permission that requires admin control
                if (permission === 'epics' && user.role === 'manager') {
                    const settingsStore = useSettingsStore.getState();
                    return (
                        hasBasicPermission &&
                        settingsStore.isFeatureEnabledForRole(
                            'projectManagement',
                            user.role,
                        )
                    );
                }

                return hasBasicPermission;
            },
        }),
        {
            name: 'auth-storage',
        },
    ),
);
