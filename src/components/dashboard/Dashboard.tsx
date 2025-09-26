import { Card, CardContent } from '@/components/ui/card';
import { useTicketStore } from '@/store/ticketStore';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Ticket, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import { DashboardStats } from './DashboardStats';
import { RecentActivity } from './RecentActivity';
import { TicketsByDepartment } from './TicketsByDepartment';
import { TicketsByPriority } from './TicketsByPriority';

const statCards = [
    {
        title: 'Open Tickets',
        icon: Ticket,
        color: '#4ADE80',
        key: 'openTickets',
    },
    {
        title: 'In Progress',
        icon: Clock,
        color: '#FACC15',
        key: 'inProgressTickets',
    },
    {
        title: 'Critical Issues',
        icon: AlertTriangle,
        color: '#EF4444',
        key: 'criticalTickets',
    },
    {
        title: 'Resolved',
        icon: TrendingUp,
        color: '#4ADE80',
        key: 'closedTickets',
    },
];

export function Dashboard() {
    const { dashboardStats, fetchDashboardStats, loading } = useTicketStore();

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    if (loading || !dashboardStats) {
        return (
            <div className="space-y-8 pb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-10 bg-muted rounded-lg w-48 mb-2 animate-pulse"></div>
                        <div className="h-6 bg-muted rounded w-64 animate-pulse"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card
                            key={i}
                            className="bg-card border-border shadow-lg"
                        >
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-muted rounded w-24 mb-3"></div>
                                    <div className="h-8 bg-muted rounded w-16"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-card border-border shadow-lg">
                        <CardContent className="p-6">
                            <div className="h-64 bg-muted rounded animate-pulse"></div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border shadow-lg">
                        <CardContent className="p-6">
                            <div className="h-64 bg-muted rounded animate-pulse"></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">
                        Track your team&apos;s progress and performance
                    </p>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const value = dashboardStats[
                        stat.key as keyof typeof dashboardStats
                    ] as number;

                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="bg-card border-border hover:border-primary/60 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
                                                {stat.title}
                                            </p>
                                            <p className="text-3xl font-bold text-foreground mt-3">
                                                {value}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl shadow-sm bg-primary/20 border-2 border-primary/30">
                                            <Icon
                                                size={28}
                                                className="text-primary"
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <TicketsByDepartment
                        data={dashboardStats.ticketsByDepartment}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <TicketsByPriority
                        data={dashboardStats.ticketsByPriority}
                    />
                </motion.div>
            </div>

            {/* Additional Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <DashboardStats stats={dashboardStats} />
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <RecentActivity activities={dashboardStats.recentActivity} />
            </motion.div>
        </div>
    );
}
