import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useTicketStore } from '@/store/ticketStore';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusColors = {
    open: '#6B7280',
    in_progress: '#FACC15',
    resolved: '#4ADE80',
    closed: '#A1A1AA',
};

const priorityColors = {
    low: '#4ADE80',
    medium: '#FACC15',
    high: '#F97316',
    critical: '#EF4444',
};

export function MyTicketsWidget() {
    const { user } = useAuthStore();
    const { tickets } = useTicketStore();

    // Filter tickets assigned to current user
    const myTickets = tickets
        .filter(
            (ticket) =>
                ticket.assigneeIds?.includes(user?.id || '') ||
                ticket.assigneeId === user?.id,
        )
        .slice(0, 5);

    if (!user) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
        >
            <Card className="bg-card border-border shadow-lg">
                <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-foreground text-base sm:text-lg font-semibold flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            My Assigned Tickets
                        </CardTitle>
                        <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20"
                        >
                            {myTickets.length}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {myTickets.length === 0 ? (
                        <div className="text-center py-8">
                            <User className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                            <p className="text-muted-foreground text-sm">
                                No tickets assigned to you
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border border-border/50 hover:bg-accent/30 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs font-semibold text-foreground">
                                                {ticket.key}
                                            </span>
                                            <Badge
                                                style={{
                                                    backgroundColor:
                                                        priorityColors[
                                                            ticket.priority
                                                        ] + '30',
                                                    color: priorityColors[
                                                        ticket.priority
                                                    ],
                                                    border: `1px solid ${
                                                        priorityColors[
                                                            ticket.priority
                                                        ]
                                                    }60`,
                                                }}
                                                className="text-xs px-1.5 py-0.5"
                                            >
                                                {ticket.priority}
                                            </Badge>
                                            <Badge
                                                style={{
                                                    backgroundColor:
                                                        statusColors[
                                                            ticket.status
                                                        ] + '30',
                                                    color: statusColors[
                                                        ticket.status
                                                    ],
                                                    border: `1px solid ${
                                                        statusColors[
                                                            ticket.status
                                                        ]
                                                    }60`,
                                                }}
                                                className="text-xs px-1.5 py-0.5"
                                            >
                                                {ticket.status.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium text-foreground truncate mb-1">
                                            {ticket.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(
                                                ticket.createdAt,
                                                { addSuffix: true },
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {myTickets.length > 0 && (
                                <div className="pt-3 border-t border-border">
                                    <Link to="/my-tickets">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-border hover:bg-accent hover:border-primary/30 group"
                                        >
                                            View All My Tickets
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
