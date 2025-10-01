import {
    BarChart3,
    CheckCircle,
    RotateCcw,
    Save,
    Settings,
    Shield,
    UserCheck,
    Users,
    Workflow,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';

export function PermissionsPage() {
    const { featurePermissions, updateFeaturePermission } = useSettingsStore();

    // Local state for pending changes
    const [pendingChanges, setPendingChanges] = useState<
        typeof featurePermissions
    >({} as typeof featurePermissions);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Initialize pending changes with current permissions
    useEffect(() => {
        if (featurePermissions && Object.keys(featurePermissions).length > 0) {
            setPendingChanges(JSON.parse(JSON.stringify(featurePermissions)));
        }
    }, [featurePermissions]);

    // Safety check - if featurePermissions is not properly initialized, return loading state
    if (!featurePermissions || Object.keys(featurePermissions).length === 0) {
        return (
            <div className="space-y-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Role Permissions Matrix
                    </h2>
                    <p className="text-muted-foreground">
                        Loading permissions...
                    </p>
                </div>
            </div>
        );
    }

    // Function to update pending changes
    const updatePendingPermission = (
        feature: keyof typeof featurePermissions,
        role: 'admin' | 'manager' | 'developer' | 'support' | 'it' | 'client',
        enabled: boolean,
    ) => {
        setPendingChanges((prev) => ({
            ...prev,
            [feature]: {
                ...prev[feature],
                [role]: enabled,
            },
        }));
        setHasUnsavedChanges(true);
    };

    // Function to save all pending changes
    const saveChanges = () => {
        Object.entries(pendingChanges).forEach(([feature, rolePermissions]) => {
            Object.entries(rolePermissions).forEach(([role, enabled]) => {
                updateFeaturePermission(
                    feature as keyof typeof featurePermissions,
                    role as
                        | 'admin'
                        | 'manager'
                        | 'developer'
                        | 'support'
                        | 'it'
                        | 'client',
                    enabled as boolean,
                );
            });
        });
        setHasUnsavedChanges(false);
    };

    // Function to reset changes
    const resetChanges = () => {
        setPendingChanges(JSON.parse(JSON.stringify(featurePermissions)));
        setHasUnsavedChanges(false);
    };

    // Function to apply role-based default permissions
    const applyRoleDefaults = () => {
        const defaultPermissions = { ...pendingChanges };

        features.forEach((feature) => {
            // Admin - Always has all permissions
            defaultPermissions[feature.key].admin = true;

            // Manager - Full access except admin panel
            if (feature.key === 'adminAccess') {
                defaultPermissions[feature.key].manager = false;
            } else {
                defaultPermissions[feature.key].manager = true;
            }

            // Team Member - Access to core work features
            if (
                [
                    'dashboardAccess',
                    'ticketManagement',
                    'kanbanAccess',
                    'notificationAccess',
                    'profileAccess',
                ].includes(feature.key)
            ) {
                defaultPermissions[feature.key].developer = true;
                defaultPermissions[feature.key].support = true;
                defaultPermissions[feature.key].it = true;
            } else {
                defaultPermissions[feature.key].developer = false;
                defaultPermissions[feature.key].support = false;
                defaultPermissions[feature.key].it = false;
            }

            // Client - Minimal access for external users
            if (['notificationAccess', 'profileAccess'].includes(feature.key)) {
                defaultPermissions[feature.key].client = true;
            } else {
                defaultPermissions[feature.key].client = false;
            }
        });

        setPendingChanges(defaultPermissions);
        setHasUnsavedChanges(true);
    };

    // Conservative permissions - minimal access for all roles
    const applyConservativeDefaults = () => {
        const conservativePermissions = { ...pendingChanges };

        features.forEach((feature) => {
            conservativePermissions[feature.key].admin = true; // Admin always enabled

            // Manager gets basic access
            if (
                [
                    'dashboardAccess',
                    'ticketManagement',
                    'notificationAccess',
                    'profileAccess',
                ].includes(feature.key)
            ) {
                conservativePermissions[feature.key].manager = true;
            } else {
                conservativePermissions[feature.key].manager = false;
            }

            // Team Member gets minimal access
            if (
                [
                    'ticketManagement',
                    'notificationAccess',
                    'profileAccess',
                ].includes(feature.key)
            ) {
                conservativePermissions[feature.key].developer = true;
                conservativePermissions[feature.key].support = true;
                conservativePermissions[feature.key].it = true;
            } else {
                conservativePermissions[feature.key].developer = false;
                conservativePermissions[feature.key].support = false;
                conservativePermissions[feature.key].it = false;
            }

            // Client gets only notifications and profile
            if (['notificationAccess', 'profileAccess'].includes(feature.key)) {
                conservativePermissions[feature.key].client = true;
            } else {
                conservativePermissions[feature.key].client = false;
            }
        });

        setPendingChanges(conservativePermissions);
        setHasUnsavedChanges(true);
    };

    // Liberal permissions - broader access for productivity
    const applyLiberalDefaults = () => {
        const liberalPermissions = { ...pendingChanges };

        features.forEach((feature) => {
            liberalPermissions[feature.key].admin = true; // Admin always enabled

            // Manager gets everything except admin access
            if (feature.key === 'adminAccess') {
                liberalPermissions[feature.key].manager = false;
            } else {
                liberalPermissions[feature.key].manager = true;
            }

            // Team Member gets broad access for collaboration
            if (
                [
                    'dashboardAccess',
                    'ticketManagement',
                    'kanbanAccess',
                    'projectManagement',
                    'notificationAccess',
                    'profileAccess',
                ].includes(feature.key)
            ) {
                liberalPermissions[feature.key].developer = true;
                liberalPermissions[feature.key].support = true;
                liberalPermissions[feature.key].it = true;
            } else {
                liberalPermissions[feature.key].developer = false;
                liberalPermissions[feature.key].support = false;
                liberalPermissions[feature.key].it = false;
            }

            // Client gets view access where appropriate
            if (
                [
                    'dashboardAccess',
                    'ticketManagement',
                    'notificationAccess',
                    'profileAccess',
                ].includes(feature.key)
            ) {
                liberalPermissions[feature.key].client = true;
            } else {
                liberalPermissions[feature.key].client = false;
            }
        });

        setPendingChanges(liberalPermissions);
        setHasUnsavedChanges(true);
    };

    const roles = [
        { key: 'admin' as const, label: 'Admin' },
        { key: 'manager' as const, label: 'Manager' },
        { key: 'developer' as const, label: 'Developer' },
        { key: 'support' as const, label: 'Support' },
        { key: 'it' as const, label: 'IT' },
        { key: 'client' as const, label: 'Client' },
    ];

    const features = [
        {
            key: 'dashboardAccess' as const,
            title: 'Dashboard',
            description: 'Access to main dashboard and analytics overview',
            icon: BarChart3,
        },
        {
            key: 'ticketManagement' as const,
            title: 'Ticket Management',
            description: 'View and manage all tickets',
            icon: Shield,
        },
        {
            key: 'kanbanAccess' as const,
            title: 'Kanban Board',
            description: 'Access to kanban board view',
            icon: BarChart3,
        },
        {
            key: 'projectManagement' as const,
            title: 'Project Management',
            description: 'Access to projects, epics, and stories',
            icon: Settings,
        },
        {
            key: 'workflowManagement' as const,
            title: 'Workflow Management',
            description: 'Manage workflows and processes',
            icon: Workflow,
        },
        {
            key: 'reportsAccess' as const,
            title: 'Reports',
            description: 'View reports and analytics',
            icon: BarChart3,
        },
        {
            key: 'adminAccess' as const,
            title: 'Admin Panel',
            description: 'Access to admin settings and user management',
            icon: Settings,
        },
        {
            key: 'notificationAccess' as const,
            title: 'Notifications',
            description: 'Receive and manage notifications',
            icon: Shield,
        },
        {
            key: 'profileAccess' as const,
            title: 'Profile Management',
            description: 'Access to user profile and settings',
            icon: Users,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            Role Permissions Matrix
                        </h2>
                        <p className="text-muted-foreground">
                            Control feature access for different user roles
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {hasUnsavedChanges && (
                            <div className="flex items-center space-x-2 text-amber-600">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">
                                    Unsaved changes
                                </span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            onClick={resetChanges}
                            disabled={!hasUnsavedChanges}
                            className="flex items-center space-x-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reset</span>
                        </Button>
                        <Button
                            onClick={saveChanges}
                            disabled={!hasUnsavedChanges}
                            className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table Format */}
            <Card>
                <CardContent className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                        Features
                                    </th>
                                    {roles.map((role) => (
                                        <th
                                            key={role.key}
                                            className="text-center py-3 px-4 font-medium text-muted-foreground"
                                        >
                                            {role.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((feature) => (
                                    <tr
                                        key={feature.key}
                                        className="border-b hover:bg-muted/50"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center space-x-3">
                                                <feature.icon className="w-5 h-5 text-primary" />
                                                <div>
                                                    <div className="font-medium">
                                                        {feature.title}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {feature.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {roles.map((role) => {
                                            const pendingPermission =
                                                pendingChanges[feature.key];
                                            const isEnabled = pendingPermission
                                                ? pendingPermission[role.key]
                                                : false;
                                            const isAdmin =
                                                role.key === 'admin';

                                            return (
                                                <td
                                                    key={role.key}
                                                    className="py-4 px-4 text-center"
                                                >
                                                    <div className="flex justify-center">
                                                        <Checkbox
                                                            checked={isEnabled}
                                                            disabled={isAdmin}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                if (!isAdmin) {
                                                                    updatePendingPermission(
                                                                        feature.key,
                                                                        role.key,
                                                                        checked as boolean,
                                                                    );
                                                                }
                                                            }}
                                                            className="h-5 w-5"
                                                        />
                                                    </div>
                                                    {isAdmin && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Always enabled
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Settings className="w-5 h-5" />
                        <span>Bulk Actions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Quick Actions */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                Quick Actions
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        features.forEach((feature) => {
                                            roles.forEach((role) => {
                                                if (role.key !== 'admin') {
                                                    updatePendingPermission(
                                                        feature.key,
                                                        role.key,
                                                        true,
                                                    );
                                                }
                                            });
                                        });
                                    }}
                                    className="flex items-center space-x-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Enable All</span>
                                </Button>

                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        features.forEach((feature) => {
                                            roles.forEach((role) => {
                                                if (role.key !== 'admin') {
                                                    updatePendingPermission(
                                                        feature.key,
                                                        role.key,
                                                        false,
                                                    );
                                                }
                                            });
                                        });
                                    }}
                                    className="flex items-center space-x-2"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Disable All</span>
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        features.forEach((feature) => {
                                            updatePendingPermission(
                                                feature.key,
                                                'manager',
                                                true,
                                            );
                                            updatePendingPermission(
                                                feature.key,
                                                'developer',
                                                false,
                                            );
                                            updatePendingPermission(
                                                feature.key,
                                                'support',
                                                false,
                                            );
                                            updatePendingPermission(
                                                feature.key,
                                                'it',
                                                false,
                                            );
                                            updatePendingPermission(
                                                feature.key,
                                                'client',
                                                false,
                                            );
                                        });
                                    }}
                                    className="flex items-center space-x-2"
                                >
                                    <Users className="w-4 h-4" />
                                    <span>Manager Only</span>
                                </Button>
                            </div>
                        </div>

                        {/* Role-Based Presets */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                Role-Based Presets
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={applyRoleDefaults}
                                    className="flex items-center space-x-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Balanced Defaults</span>
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={applyConservativeDefaults}
                                    className="flex items-center space-x-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    <span>Conservative</span>
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={applyLiberalDefaults}
                                    className="flex items-center space-x-2"
                                >
                                    <UserCheck className="w-4 h-4" />
                                    <span>Liberal</span>
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                <strong>Balanced:</strong> Standard role-based
                                permissions •<strong>Conservative:</strong>{' '}
                                Minimal access for security •
                                <strong>Liberal:</strong> Broader access for
                                collaboration
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
