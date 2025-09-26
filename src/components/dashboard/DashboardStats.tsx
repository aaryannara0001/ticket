import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DashboardStats as Stats } from '@/types';

interface DashboardStatsProps {
    stats: Stats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const totalTickets =
        stats.openTickets + stats.closedTickets + stats.inProgressTickets;
    const completionRate = (stats.closedTickets / totalTickets) * 100;
    const inProgressRate = (stats.inProgressTickets / totalTickets) * 100;

    return (
        <Card className="bg-card border-border shadow-lg hover:border-border/80 transition-all">
            <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-lg font-semibold">
                    Project Overview
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground font-medium">
                                Completed
                            </span>
                            <span className="text-foreground font-bold">
                                {completionRate.toFixed(1)}%
                            </span>
                        </div>
                        <Progress
                            value={completionRate}
                            className="h-3 bg-muted"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground font-medium">
                                In Progress
                            </span>
                            <span className="text-foreground font-bold">
                                {inProgressRate.toFixed(1)}%
                            </span>
                        </div>
                        <Progress
                            value={inProgressRate}
                            className="h-3 bg-muted"
                        />
                    </div>

                    <div className="text-center">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground font-medium">
                                Total Tickets
                            </span>
                            <span className="text-foreground font-bold">
                                {totalTickets}
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-primary mt-2">
                            {totalTickets}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
