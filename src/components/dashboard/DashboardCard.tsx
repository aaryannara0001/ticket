import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Clock,
    LucideIcon,
    Ticket,
    TrendingUp,
} from 'lucide-react';

interface DashboardCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    cardType: 'critical' | 'in_progress' | 'resolved' | 'open_tickets';
    className?: string;
    delay?: number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function DashboardCard({
    title,
    value,
    icon: Icon,
    cardType,
    className,
    delay = 0,
    trend,
}: DashboardCardProps) {
    // Get conditional styling based on card type/status
    const getCardStyles = (type: DashboardCardProps['cardType']) => {
        switch (type) {
            case 'critical':
                return {
                    background: 'bg-red-100 dark:bg-red-950/30',
                    text: 'text-red-600 dark:text-red-400',
                    iconBg: 'bg-red-500/20 border-red-500/30',
                    iconColor: 'text-red-500',
                    border: 'border-red-200 dark:border-red-800',
                };
            case 'in_progress':
                return {
                    background: 'bg-blue-100 dark:bg-blue-950/30',
                    text: 'text-blue-600 dark:text-blue-400',
                    iconBg: 'bg-blue-500/20 border-blue-500/30',
                    iconColor: 'text-blue-500',
                    border: 'border-blue-200 dark:border-blue-800',
                };
            case 'resolved':
                return {
                    background: 'bg-green-100 dark:bg-green-950/30',
                    text: 'text-green-600 dark:text-green-400',
                    iconBg: 'bg-green-500/20 border-green-500/30',
                    iconColor: 'text-green-500',
                    border: 'border-green-200 dark:border-green-800',
                };
            case 'open_tickets':
                return {
                    background: 'bg-yellow-100 dark:bg-yellow-950/30',
                    text: 'text-yellow-600 dark:text-yellow-400',
                    iconBg: 'bg-yellow-500/20 border-yellow-500/30',
                    iconColor: 'text-yellow-500',
                    border: 'border-yellow-200 dark:border-yellow-800',
                };
            default:
                return {
                    background: 'bg-card',
                    text: 'text-foreground',
                    iconBg: 'bg-primary/20 border-primary/30',
                    iconColor: 'text-primary',
                    border: 'border-border',
                };
        }
    };

    const styles = getCardStyles(cardType);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
            className={cn('w-full', className)}
        >
            <Card
                className={cn(
                    'shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer',
                    styles.background,
                    styles.border,
                )}
            >
                <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide mb-1 sm:mb-2 opacity-80">
                                <span className={styles.text}>{title}</span>
                            </p>
                            <div className="flex items-baseline space-x-1 sm:space-x-2">
                                <p
                                    className={cn(
                                        'text-xl sm:text-2xl md:text-3xl font-bold',
                                        styles.text,
                                    )}
                                >
                                    {value}
                                </p>
                                {trend && (
                                    <div className="flex items-center">
                                        <span
                                            className={cn(
                                                'text-xs font-medium px-2 py-1 rounded-full',
                                                trend.isPositive
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400',
                                            )}
                                        >
                                            {trend.isPositive ? '+' : ''}
                                            {trend.value}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            {trend && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    vs last period
                                </p>
                            )}
                        </div>
                        <div
                            className={cn(
                                'p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-sm border-2 transition-all duration-300 flex-shrink-0',
                                styles.iconBg,
                            )}
                        >
                            <Icon
                                size={20}
                                className={cn(
                                    'sm:w-6 sm:h-6 md:w-7 md:h-7 transition-all duration-300',
                                    styles.iconColor,
                                )}
                                strokeWidth={2.5}
                            />
                        </div>
                    </div>

                    {/* Optional status indicator */}
                    <div className="mt-2 sm:mt-3 md:mt-4">
                        <div
                            className={cn(
                                'h-1 rounded-full',
                                styles.background,
                            )}
                        >
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    styles.iconColor.replace('text-', 'bg-'),
                                )}
                                style={{
                                    width:
                                        cardType === 'critical'
                                            ? '85%'
                                            : cardType === 'in_progress'
                                            ? '60%'
                                            : cardType === 'resolved'
                                            ? '95%'
                                            : '70%',
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Predefined card configurations for common use cases
export const DashboardCardPresets = {
    critical: (value: number | string, delay?: number) => ({
        title: 'Critical Issues',
        value,
        cardType: 'critical' as const,
        delay,
    }),
    inProgress: (value: number | string, delay?: number) => ({
        title: 'In Progress',
        value,
        cardType: 'in_progress' as const,
        delay,
    }),
    resolved: (value: number | string, delay?: number) => ({
        title: 'Resolved',
        value,
        cardType: 'resolved' as const,
        delay,
    }),
    openTickets: (value: number | string, delay?: number) => ({
        title: 'Open Tickets',
        value,
        cardType: 'open_tickets' as const,
        delay,
    }),
};

// Example usage component demonstrating different card types
export function DashboardCardExample() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
                title="Open Tickets"
                value={42}
                icon={Ticket}
                cardType="open_tickets"
                delay={0}
                trend={{ value: 12, isPositive: false }}
            />

            <DashboardCard
                title="In Progress"
                value={28}
                icon={Clock}
                cardType="in_progress"
                delay={0.1}
                trend={{ value: 8, isPositive: true }}
            />

            <DashboardCard
                title="Critical Issues"
                value={5}
                icon={AlertTriangle}
                cardType="critical"
                delay={0.2}
                trend={{ value: 25, isPositive: false }}
            />

            <DashboardCard
                title="Resolved"
                value={134}
                icon={TrendingUp}
                cardType="resolved"
                delay={0.3}
                trend={{ value: 15, isPositive: true }}
            />
        </div>
    );
}
