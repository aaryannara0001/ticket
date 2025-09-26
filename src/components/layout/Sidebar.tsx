import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { motion } from 'framer-motion';
import {
    BarChart3,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Kanban,
    LayoutDashboard,
    Settings,
    Ticket,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        permissions: ['dashboard'],
    },
    {
        title: 'Tickets',
        icon: Ticket,
        href: '/tickets',
        permissions: ['tickets', 'my_tickets'],
    },
    {
        title: 'Kanban',
        icon: Kanban,
        href: '/kanban',
        permissions: ['kanban'],
    },
    {
        title: 'Projects',
        icon: BookOpen,
        href: '/epics',
        permissions: ['epics'],
    },
    {
        title: 'Workflows',
        icon: Zap,
        href: '/workflows',
        permissions: ['workflows', '*'],
    },
    {
        title: 'Reports',
        icon: BarChart3,
        href: '/reports',
        permissions: ['reports'],
    },
    {
        title: 'Admin',
        icon: Settings,
        href: '/admin',
        permissions: ['*'],
    },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { hasPermission, user } = useAuthStore();
    const { isFeatureEnabledForRole } = useSettingsStore();

    const filteredMenuItems = menuItems.filter((item) => {
        const hasBasicPermission = item.permissions.some((permission) =>
            hasPermission(permission),
        );

        // Check feature-specific permissions
        if (item.href === '/dashboard') {
            return (
                hasBasicPermission &&
                isFeatureEnabledForRole('dashboardAccess', user?.role || '')
            );
        }
        if (item.href === '/tickets') {
            return (
                hasBasicPermission &&
                isFeatureEnabledForRole('ticketManagement', user?.role || '')
            );
        }
        if (item.href === '/kanban') {
            return (
                hasBasicPermission &&
                isFeatureEnabledForRole('kanbanAccess', user?.role || '')
            );
        }
        if (item.href === '/epics') {
            return (
                hasBasicPermission &&
                isFeatureEnabledForRole('projectManagement', user?.role || '')
            );
        }
        if (item.href === '/workflows') {
            return (
                hasBasicPermission &&
                isFeatureEnabledForRole('workflowManagement', user?.role || '')
            );
        }
        if (item.href === '/reports') {
            return (
                hasBasicPermission &&
                isFeatureEnabledForRole('reportsAccess', user?.role || '')
            );
        }
        if (item.href === '/admin') {
            return (
                hasBasicPermission &&
                isFeatureEnabledForRole('adminAccess', user?.role || '')
            );
        }

        return hasBasicPermission;
    });

    return (
        <motion.aside
            animate={{ width: collapsed ? 80 : 280 }}
            className="h-screen bg-card border-r border-border flex flex-col shadow-lg"
        >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                {!collapsed && (
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xl font-bold text-foreground tracking-tight"
                    >
                        TicketFlow
                    </motion.h1>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                    {collapsed ? (
                        <ChevronRight size={20} />
                    ) : (
                        <ChevronLeft size={20} />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <div className="space-y-2">
                    {filteredMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    'flex items-center p-3 rounded-xl transition-all relative group',
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-lg font-semibold'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                                )}
                            >
                                <Icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="ml-3 font-medium"
                                    >
                                        {item.title}
                                    </motion.span>
                                )}

                                {collapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                        {item.title}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </motion.aside>
    );
}
