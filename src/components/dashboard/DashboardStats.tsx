import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DashboardStats as Stats } from '@/types';

interface DashboardStatsProps {
    stats: Stats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const totalTickets =
        stats.openTickets + stats.closedTickets + stats.inProgressTickets;
    const completionRate = totalTickets
        ? (stats.closedTickets / totalTickets) * 100
        : 0;
    const inProgressRate = totalTickets
        ? (stats.inProgressTickets / totalTickets) * 100
        : 0;

    return (
        <Card className="bg-card border-border shadow-lg hover:border-border/80 transition-all">
            <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-foreground text-base sm:text-lg font-semibold">
                    Project Overview
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
                {/* Mobile-first: single column, then 2 columns on sm, 3 columns on md+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 items-start">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">
                                Completed
                            </span>
                            <span className="text-foreground font-bold">
                                {completionRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full h-3 sm:h-3">
                            <Progress
                                value={Math.min(
                                    Math.max(completionRate, 0),
                                    100,
                                )}
                                className="h-3 bg-muted rounded"
                                aria-label={`Completed ${completionRate.toFixed(
                                    1,
                                )} percent`}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Closed / Total
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">
                                In Progress
                            </span>
                            <span className="text-foreground font-bold">
                                {inProgressRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full h-3 sm:h-3">
                            <Progress
                                value={Math.min(
                                    Math.max(inProgressRate, 0),
                                    100,
                                )}
                                className="h-3 bg-muted rounded"
                                aria-label={`In progress ${inProgressRate.toFixed(
                                    1,
                                )} percent`}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            In Progress / Total
                        </p>
                    </div>

                    {/* Total Tickets - center on md+, full-width on smaller screens */}
                    <div className="flex flex-col items-center justify-center text-center py-2 sm:py-0">
                        <span className="text-muted-foreground text-sm font-medium">
                            Total Tickets
                        </span>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mt-2">
                            {totalTickets}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Open:{' '}
                            <span className="text-foreground font-medium">
                                {stats.openTickets}
                            </span>{' '}
                            &middot; In Progress:{' '}
                            <span className="text-foreground font-medium">
                                {stats.inProgressTickets}
                            </span>{' '}
                            &middot; Closed:{' '}
                            <span className="text-foreground font-medium">
                                {stats.closedTickets}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
