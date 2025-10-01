import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';
import { User } from '../types';

interface AuthState {
    user: User | null;
    users: User[];
    isAuthenticated: boolean;
    isInitialized: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (
        name: string,
        email: string,
        password: string,
        role: User['role'],
    ) => Promise<boolean>;
    verifyEmail: (email: string, otp: string) => Promise<boolean>;
    resendOTP: (email: string) => Promise<boolean>;
    loadCurrentUser: () => Promise<void>;
    loadUsers: () => Promise<void>;
    createUser: (
        name: string,
        email: string,
        password: string,
        role: User['role'],
        department?: string,
    ) => Promise<User | null>;
    updateUser: (id: string, patch: Partial<User>) => Promise<boolean>;
    deleteUser: (id: string) => Promise<boolean>;
    logout: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
    initialize: () => Promise<void>;
}

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
    developer: [
        'dashboard',
        'tickets',
        'my_tickets',
        'kanban',
        'create_ticket',
        'ticket_detail',
    ],
    support: [
        'dashboard',
        'tickets',
        'my_tickets',
        'kanban',
        'create_ticket',
        'ticket_detail',
        'assign_tickets',
    ],
    it: [
        'dashboard',
        'tickets',
        'my_tickets',
        'kanban',
        'epics',
        'reports',
        'workflows',
        'create_ticket',
        'ticket_detail',
        'assign_tickets',
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
            users: [],
            isAuthenticated: false,
            isInitialized: false,
            login: async (email: string, password: string) => {
                try {
                    const response = await apiService.login({
                        email,
                        password,
                    });
                    const user: User = {
                        id: response.user.id,
                        name: response.user.name,
                        email: response.user.email,
                        role: response.user.role as User['role'],
                        department: 'IT', // Default department
                        isActive: response.user.active,
                        emailVerified: response.user.emailVerified,
                        createdAt: new Date(response.user.createdAt),
                        avatar: undefined,
                    };
                    set({ user, isAuthenticated: true });
                    return true;
                } catch (error) {
                    console.error('Login failed:', error);
                    return false;
                }
            },
            register: async (
                name: string,
                email: string,
                password: string,
                role: User['role'],
            ) => {
                try {
                    // Map frontend roles to backend roles
                    const roleMapping: Record<
                        User['role'],
                        | 'developer'
                        | 'support'
                        | 'it'
                        | 'manager'
                        | 'admin'
                        | 'client'
                    > = {
                        developer: 'developer',
                        support: 'support',
                        it: 'it',
                        manager: 'manager',
                        admin: 'admin',
                        client: 'client',
                    };
                    const backendRole = roleMapping[role];
                    await apiService.register({
                        name,
                        email,
                        password,
                        role: backendRole,
                    });
                    // Registration successful, OTP sent to email
                    // User needs to verify email before login
                    return true;
                } catch (error) {
                    console.error('Register failed:', error);
                    return false;
                }
            },
            verifyEmail: async (email: string, otp: string) => {
                try {
                    await apiService.verifyEmail(email, otp);
                    return true;
                } catch (error) {
                    console.error('Email verification failed:', error);
                    return false;
                }
            },
            resendOTP: async (email: string) => {
                try {
                    await apiService.resendOTP(email);
                    return true;
                } catch (error) {
                    console.error('Resend OTP failed:', error);
                    return false;
                }
            },
            // User helpers
            getUsers: () => {
                return get().users;
            },
            loadCurrentUser: async () => {
                try {
                    const response = await apiService.getCurrentUser();
                    const user: User = {
                        id: response.id,
                        name: response.name,
                        email: response.email,
                        role: response.role as User['role'],
                        department: 'IT', // Default department
                        isActive: !!response.active,
                        emailVerified: response.emailVerified,
                        createdAt: new Date(response.createdAt),
                        avatar: undefined,
                    };
                    set({ user, isAuthenticated: true });
                } catch (error) {
                    console.error('Load current user failed:', error);
                    apiService.clearToken();
                    set({ user: null, isAuthenticated: false });
                    throw error;
                }
            },
            loadUsers: async () => {
                try {
                    const response = await apiService.getUsers();
                    const users: User[] = response.map((u) => ({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        role: u.role as User['role'],
                        department: 'IT', // Default department
                        isActive: !!u.active,
                        emailVerified: u.emailVerified,
                        createdAt: new Date(u.createdAt),
                        avatar: undefined,
                    }));
                    set({ users });
                } catch (error) {
                    console.error('Load users failed:', error);
                }
            },
            createUser: async (
                name: string,
                email: string,
                password: string,
                role: User['role'],
                department?: string,
            ) => {
                try {
                    const newUser = await apiService.createUser({
                        name,
                        email,
                        password,
                        role,
                    });
                    const user: User = {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role as User['role'],
                        department: department || 'Unassigned',
                        isActive: !!newUser.active,
                        emailVerified: newUser.emailVerified,
                        createdAt: new Date(newUser.createdAt),
                    };
                    set((state) => ({ users: [...state.users, user] }));
                    return user;
                } catch (error) {
                    console.error('Create user failed:', error);
                    return null;
                }
            },
            updateUser: async (id: string, patch: Partial<User>) => {
                try {
                    // Convert isActive to active for API
                    const apiPatch: any = { ...patch };
                    if (patch.isActive !== undefined) {
                        apiPatch.active = patch.isActive;
                        delete apiPatch.isActive;
                    }
                    await apiService.updateUser(id, apiPatch);
                    set((state) => {
                        const users = [...state.users];
                        const idx = users.findIndex((u) => u.id === id);
                        if (idx !== -1) {
                            users[idx] = {
                                ...users[idx],
                                ...patch,
                            };
                        }
                        return { users };
                    });
                    // If current authenticated user was updated, update store user as well
                    const { user } = get();
                    if (user && user.id === id) {
                        set({ user: { ...user, ...patch } as User });
                    }
                    return true;
                } catch (error) {
                    console.error('Update user failed:', error);
                    return false;
                }
            },
            deleteUser: async (id: string) => {
                try {
                    await apiService.deleteUser(id);
                    set((state) => {
                        const users = [...state.users];
                        const idx = users.findIndex((u) => u.id === id);
                        if (idx !== -1) {
                            users.splice(idx, 1);
                        }
                        return { users };
                    });
                    // if deleted current user, logout
                    const { user } = get();
                    if (user && user.id === id) {
                        set({ user: null, isAuthenticated: false });
                    }
                    return true;
                } catch (error) {
                    console.error('Delete user failed:', error);
                    return false;
                }
            },
            logout: async () => {
                try {
                    await apiService.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    set({ user: null, isAuthenticated: false, users: [] });
                    apiService.clearToken();
                }
            },
            hasPermission: (permission: string) => {
                const { user } = get();
                if (!user) return false;
                // Admin always has access
                if (user.role === 'admin') return true;
                const permissions = rolePermissions[user.role] || [];
                const hasBasicPermission =
                    permissions.includes(permission) ||
                    permissions.includes('*');
                if (!hasBasicPermission) return false;
                const featureKey = permissionToFeature[permission];
                // If permission maps to a feature toggle, consult settingsStore
                if (featureKey) {
                    // For now, return true - settingsStore integration can be added later
                    return true;
                }
                return hasBasicPermission;
            },
            initialize: async () => {
                try {
                    await get().loadCurrentUser();
                } catch {
                    // Token is invalid, clear it
                    apiService.clearToken();
                    set({ user: null, isAuthenticated: false });
                } finally {
                    set({ isInitialized: true });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                // Only persist isAuthenticated and isInitialized, not user data
                // User data will be loaded fresh on initialization
                isAuthenticated: state.isAuthenticated,
                isInitialized: state.isInitialized,
            }),
        },
    ),
);
