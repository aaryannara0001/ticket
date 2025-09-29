import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity as ActivityType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
    activities: ActivityType[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card className="bg-card border-border shadow-lg hover:border-border/80 transition-all">
            <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-foreground text-base sm:text-lg font-semibold">
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto">
                    {activities.length === 0 ? (
                        <p className="text-muted-foreground text-center py-6 sm:py-8 font-medium text-sm sm:text-base">
                            No recent activity
                        </p>
                    ) : (
                        activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                            >
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full mt-1 sm:mt-1.5 flex-shrink-0 shadow-sm"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-foreground text-xs sm:text-sm leading-relaxed font-medium">
                                        {activity.description}
                                    </p>
                                    <p className="text-muted-foreground text-xs mt-1 sm:mt-1.5 font-medium">
                                        {formatDistanceToNow(
                                            activity.createdAt,
                                            { addSuffix: true },
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
