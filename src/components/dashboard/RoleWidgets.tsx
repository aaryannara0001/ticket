import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useTicketStore } from '@/store/ticketStore';
import { ArrowRight } from 'lucide-react';

export function RoleWidgets() {
    const user = useAuthStore((s) => s.user);
    const dashboardStats = useTicketStore((s) => s.dashboardStats);

    if (!user) return null;

    const common = (
        <Card className="bg-card border-border">
            <CardContent>
                <h3 className="text-lg font-semibold text-foreground">
                    Welcome, {user.name}
                </h3>
                <p className="text-muted-foreground">
                    Role: {user.role.replace('_', ' ')}
                </p>
            </CardContent>
        </Card>
    );

    switch (user.role) {
        case 'admin':
            return (
                <div className="space-y-4">
                    {common}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="px-2 py-1 rounded bg-green-100 text-green-800 text-sm font-semibold">
                                Live
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Real-time data
                            </div>
                        </div>
                        <div>
                            <Button className="bg-primary">Open Admin</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-card border-border">
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-foreground">
                                            System Overview
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Active users, system health, and
                                            critical alerts.
                                        </p>
                                    </div>
                                    <ArrowRight />
                                </div>
                                <div className="mt-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-sm text-muted-foreground">
                                            Open
                                        </div>
                                        <div className="font-semibold">
                                            {dashboardStats?.openTickets ?? '—'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            In Progress
                                        </div>
                                        <div className="font-semibold">
                                            {dashboardStats?.inProgressTickets ??
                                                '—'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Critical
                                        </div>
                                        <div className="font-semibold">
                                            {dashboardStats?.criticalTickets ??
                                                '—'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Closed
                                        </div>
                                        <div className="font-semibold">
                                            {dashboardStats?.closedTickets ??
                                                '—'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border">
                            <CardContent>
                                <h4 className="font-semibold text-foreground">
                                    Manage Permissions
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Edit role feature toggles and defaults.
                                </p>
                                <div className="mt-3">
                                    <Button className="bg-primary">
                                        Open Permissions
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            );

        case 'manager':
            return (
                <div className="space-y-4">
                    {common}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-card border-border">
                            <CardContent>
                                <h4 className="font-semibold text-foreground">
                                    Team Tasks
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Overview of assigned tasks and progress.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border">
                            <CardContent>
                                <h4 className="font-semibold text-foreground">
                                    Project Progress
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Active projects and timelines.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border">
                            <CardContent>
                                <h4 className="font-semibold text-foreground">
                                    Team Members
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Quick access to team member profiles.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            );

        case 'team_member':
            return (
                <div className="space-y-4">
                    {common}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-card border-border">
                            <CardContent>
                                <h4 className="font-semibold text-foreground">
                                    My Tickets
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Tickets assigned to you and due soon.
                                </p>
                                <div className="mt-3 text-sm text-muted-foreground">
                                    Open: {dashboardStats?.openTickets ?? '—'} •
                                    Critical:{' '}
                                    {dashboardStats?.criticalTickets ?? '—'}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border">
                            <CardContent>
                                <h4 className="font-semibold text-foreground">
                                    Kanban
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Open board for your tasks and sprints.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            );

        case 'client':
            return (
                <div className="space-y-4">
                    {common}
                    <div className="grid grid-cols-1 gap-4">
                        <Card className="bg-card border-border">
                            <CardContent>
                                <h4 className="font-semibold text-foreground">
                                    My Requests
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    View and create support requests.
                                </p>
                                <div className="mt-3 text-sm text-muted-foreground">
                                    Open: {dashboardStats?.openTickets ?? '—'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            );

        default:
            return null;
    }
}
