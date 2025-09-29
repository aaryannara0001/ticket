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
    register: (
        name: string,
        email: string,
        password: string,
        role: User['role'],
    ) => Promise<boolean>;
    // User management helpers for admin
    getUsers: () => User[];
    createUser: (
        name: string,
        email: string,
        password: string,
        role: User['role'],
        department?: string,
    ) => Promise<User | null>;
    updateUser: (id: string, patch: Partial<User>) => Promise<boolean>;
    deleteUser: (id: string) => Promise<boolean>;
}

// Mock users for demo - keep only a single admin seed to avoid duplicated mock data across app
const mockUsers: User[] = [
    {
        id: '1',
        name: 'John Admin',
        email: 'admin@company.com',
        role: 'admin',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
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

// Map logical permission keys to the feature keys used by settingsStore
const permissionToFeature: Record<string, string | undefined> = {
    dashboard: 'dashboardAccess',
    tickets: 'ticketManagement',
    my_tickets: 'ticketManagement',
    kanban: 'kanbanAccess',
    epics: 'projectManagement',
    reports: 'reportsAccess',
    workflows: 'workflowManagement',
    admin: 'adminAccess',
    profile: 'profileAccess',
    notifications: 'notificationAccess',
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

            register: async (
                name: string,
                email: string,
                _password: string,
                role: User['role'],
            ) => {
                // Simple mock register: prevent duplicates
                const existing = mockUsers.find((u) => u.email === email);
                if (existing) return false;

                const newUser: User = {
                    id: String(Date.now()),
                    name,
                    email,
                    role,
                    department: role === 'client' ? 'External' : 'Unassigned',
                    isActive: true,
                    createdAt: new Date(),
                } as User;

                // Add to mock users store (in-memory)
                mockUsers.push(newUser);

                // Set as authenticated user
                set({ user: newUser, isAuthenticated: true });
                return true;
            },

            // User helpers
            getUsers: () => {
                // return a shallow copy to avoid accidental mutation
                return mockUsers.map((u) => ({ ...u }));
            },

            createUser: async (
                name: string,
                email: string,
                _password: string,
                role: User['role'],
                department?: string,
            ) => {
                const existing = mockUsers.find((u) => u.email === email);
                if (existing) return null;
                const newUser: User = {
                    id: String(Date.now()),
                    name,
                    email,
                    role,
                    department:
                        department ||
                        (role === 'client' ? 'External' : 'Unassigned'),
                    isActive: true,
                    createdAt: new Date(),
                } as User;
                mockUsers.push(newUser);
                return { ...newUser };
            },

            updateUser: async (id: string, patch: Partial<User>) => {
                const idx = mockUsers.findIndex((u) => u.id === id);
                if (idx === -1) return false;
                mockUsers[idx] = { ...mockUsers[idx], ...patch };

                // If current authenticated user was updated, update store user as well
                const { user } = get();
                if (user && user.id === id) {
                    set({ user: { ...user, ...patch } as User });
                }

                return true;
            },

            deleteUser: async (id: string) => {
                const idx = mockUsers.findIndex((u) => u.id === id);
                if (idx === -1) return false;
                mockUsers.splice(idx, 1);

                // if deleted current user, logout
                const { user } = get();
                if (user && user.id === id) {
                    set({ user: null, isAuthenticated: false });
                }

                return true;
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },

            hasPermission: (permission: string) => {
                const { user } = get();
                if (!user) return false;

                // Admin always has access
                if (user.role === 'admin') return true;

                const permissions = rolePermissions[user.role] || [];
                const hasBasicPermission =
                    permissions.includes('*') ||
                    permissions.includes(permission);

                if (!hasBasicPermission) return false;

                // If permission maps to a feature toggle, consult settingsStore
                const featureKey = permissionToFeature[permission];
                if (featureKey) {
                    const settingsStore = useSettingsStore.getState();
                    // Cast because settingsStore expects keyof FeaturePermissions
                    return settingsStore.isFeatureEnabledForRole(
                        featureKey as any,
                        user.role,
                    );
                }

                // Default allow when no feature toggle exists
                return true;
            },
        }),
        {
            name: 'auth-storage',
        },
    ),
);
