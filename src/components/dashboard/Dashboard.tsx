import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useTicketStore } from '@/store/ticketStore';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Ticket, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { DashboardStats } from './DashboardStats';
import { MyTicketsWidget } from './MyTicketsWidget';
import { RecentActivity } from './RecentActivity';
import { RoleWidgets } from './RoleWidgets';
import { TicketsByDepartment } from './TicketsByDepartment';
import { TicketsByPriority } from './TicketsByPriority';

export function Dashboard() {
    const dashboardStats = useTicketStore((s) => s.dashboardStats);
    const loading = useTicketStore((s) => s.loading);
    const { user } = useAuthStore();

    useEffect(() => {
        if (user) {
            useTicketStore.getState().fetchDashboardStats();
            useTicketStore.getState().fetchTickets('assigned'); // Fetch assigned tickets for MyTicketsWidget

            // start realtime simulation
            useTicketStore.getState().startRealtimeUpdates();
        }

        return () => {
            useTicketStore.getState().stopRealtimeUpdates();
        };
    }, [user]);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (loading || !dashboardStats) {
        return (
            <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-4 sm:pb-6 md:pb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-6 sm:h-8 md:h-10 bg-muted rounded-lg w-32 sm:w-40 md:w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 sm:h-5 md:h-6 bg-muted rounded w-48 sm:w-56 md:w-64 animate-pulse"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card
                            key={i}
                            className="bg-card border-border shadow-lg"
                        >
                            <CardContent className="p-3 sm:p-4 md:p-6">
                                <div className="animate-pulse">
                                    <div className="h-3 sm:h-4 bg-muted rounded w-16 sm:w-20 md:w-24 mb-2 sm:mb-3"></div>
                                    <div className="h-6 sm:h-7 md:h-8 bg-muted rounded w-12 sm:w-14 md:w-16"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <Card className="bg-card border-border shadow-lg">
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="h-48 sm:h-56 md:h-64 bg-muted rounded animate-pulse"></div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border shadow-lg">
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="h-48 sm:h-56 md:h-64 bg-muted rounded animate-pulse"></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-4 sm:pb-6 md:pb-8">
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <button
                        aria-label="Toggle menu"
                        className="sm:hidden p-2 rounded-md hover:bg-muted"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>

                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                        Dashboard
                    </h1>
                </div>

                <nav className="hidden sm:flex items-center gap-6">
                    <a
                        className="text-sm md:text-base lg:text-lg hover:text-primary"
                        href="#"
                    >
                        Overview
                    </a>
                    <a
                        className="text-sm md:text-base lg:text-lg hover:text-primary"
                        href="#"
                    >
                        Tickets
                    </a>
                    <a
                        className="text-sm md:text-base lg:text-lg hover:text-primary"
                        href="#"
                    >
                        Projects
                    </a>
                    <a
                        className="text-sm md:text-base lg:text-lg hover:text-primary"
                        href="#"
                    >
                        Reports
                    </a>
                </nav>

                <div className="hidden sm:flex items-center gap-3">
                    <button className="px-3 py-1 rounded-md bg-primary/10 text-primary text-sm md:text-base">
                        New Ticket
                    </button>
                </div>
            </motion.header>

            {mobileMenuOpen && (
                <div className="sm:hidden border-t border-border bg-card rounded-md mt-3">
                    <div className="px-3 py-3 flex flex-col gap-2">
                        <a className="text-base" href="#">
                            Overview
                        </a>
                        <a className="text-base" href="#">
                            Tickets
                        </a>
                        <a className="text-base" href="#">
                            Projects
                        </a>
                        <a className="text-base" href="#">
                            Reports
                        </a>
                        <button className="mt-2 px-3 py-2 rounded-md bg-primary/10 text-primary">
                            New Ticket
                        </button>
                    </div>
                </div>
            )}

            {/* Role-based widgets */}
            <RoleWidgets />

            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                <DashboardCard
                    title="Open Tickets"
                    value={dashboardStats.openTickets}
                    icon={Ticket}
                    cardType="open_tickets"
                    delay={0}
                />
                <DashboardCard
                    title="In Progress"
                    value={dashboardStats.inProgressTickets}
                    icon={Clock}
                    cardType="in_progress"
                    delay={0.1}
                />
                <DashboardCard
                    title="Critical Issues"
                    value={dashboardStats.criticalTickets}
                    icon={AlertTriangle}
                    cardType="critical"
                    delay={0.2}
                />
                <DashboardCard
                    title="Resolved"
                    value={dashboardStats.closedTickets}
                    icon={TrendingUp}
                    cardType="resolved"
                    delay={0.3}
                />
            </div>

            {/* Charts and My Tickets - Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                <MyTicketsWidget />
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
