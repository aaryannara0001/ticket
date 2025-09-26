import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeaturePermissions {
    dashboardAccess: {
        admin: boolean;
        manager: boolean;
        team_member: boolean;
        client: boolean;
    };
    ticketManagement: {
        admin: boolean;
        manager: boolean;
        team_member: boolean;
        client: boolean;
    };
    kanbanAccess: {
        admin: boolean;
        manager: boolean;
        team_member: boolean;
        client: boolean;
    };
    projectManagement: {
        admin: boolean;
        manager: boolean;
        team_member: boolean;
        client: boolean;
    };
    workflowManagement: {
        admin: boolean;
        manager: boolean;
        team_member: boolean;
        client: boolean;
    };
    reportsAccess: {
        admin: boolean;
        manager: boolean;
        team_member: boolean;
        client: boolean;
    };
    adminAccess: {
        admin: boolean;
        manager: boolean;
        team_member: boolean;
        client: boolean;
    };
    notificationAccess: {
        admin: boolean;
        manager: boolean;
        team_member: boolean;
        client: boolean;
    };
    profileAccess: {
        admin: boolean;
        manager: boolean;
        team_member: boolean;
        client: boolean;
    };
}

interface SettingsState {
    featurePermissions: FeaturePermissions;

    // Actions
    updateFeaturePermission: (
        feature: keyof FeaturePermissions,
        role: 'admin' | 'manager' | 'team_member' | 'client',
        enabled: boolean,
    ) => void;
    isFeatureEnabledForRole: (
        feature: keyof FeaturePermissions,
        role: string,
    ) => boolean;
    resetPermissions: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            featurePermissions: {
                dashboardAccess: {
                    admin: true,
                    manager: true,
                    team_member: true,
                    client: false,
                },
                ticketManagement: {
                    admin: true,
                    manager: true,
                    team_member: true,
                    client: false,
                },
                kanbanAccess: {
                    admin: true,
                    manager: true,
                    team_member: true,
                    client: false,
                },
                projectManagement: {
                    admin: true,
                    manager: true,
                    team_member: false,
                    client: false,
                },
                workflowManagement: {
                    admin: true,
                    manager: true,
                    team_member: false,
                    client: false,
                },
                reportsAccess: {
                    admin: true,
                    manager: true,
                    team_member: false,
                    client: false,
                },
                adminAccess: {
                    admin: true,
                    manager: false,
                    team_member: false,
                    client: false,
                },
                notificationAccess: {
                    admin: true,
                    manager: true,
                    team_member: true,
                    client: true,
                },
                profileAccess: {
                    admin: true,
                    manager: true,
                    team_member: true,
                    client: true,
                },
            },

            updateFeaturePermission: (feature, role, enabled) => {
                set((state) => ({
                    featurePermissions: {
                        ...state.featurePermissions,
                        [feature]: {
                            ...state.featurePermissions[feature],
                            [role]: enabled,
                        },
                    },
                }));
            },

            isFeatureEnabledForRole: (feature, role) => {
                const { featurePermissions } = get();

                // Admins always have access to everything
                if (role === 'admin') {
                    return true;
                }

                // Check feature-specific permissions
                const permission = featurePermissions[feature];
                if (permission && role in permission) {
                    return permission[role as keyof typeof permission] ?? false;
                }

                return false;
            },

            resetPermissions: () => {
                set({
                    featurePermissions: {
                        dashboardAccess: {
                            admin: true,
                            manager: true,
                            team_member: true,
                            client: false,
                        },
                        ticketManagement: {
                            admin: true,
                            manager: true,
                            team_member: true,
                            client: false,
                        },
                        kanbanAccess: {
                            admin: true,
                            manager: true,
                            team_member: true,
                            client: false,
                        },
                        projectManagement: {
                            admin: true,
                            manager: true,
                            team_member: false,
                            client: false,
                        },
                        workflowManagement: {
                            admin: true,
                            manager: true,
                            team_member: false,
                            client: false,
                        },
                        reportsAccess: {
                            admin: true,
                            manager: true,
                            team_member: false,
                            client: false,
                        },
                        adminAccess: {
                            admin: true,
                            manager: false,
                            team_member: false,
                            client: false,
                        },
                        notificationAccess: {
                            admin: true,
                            manager: true,
                            team_member: true,
                            client: true,
                        },
                        profileAccess: {
                            admin: true,
                            manager: true,
                            team_member: true,
                            client: true,
                        },
                    },
                });
            },
        }),
        {
            name: 'settings-storage',
        },
    ),
);
