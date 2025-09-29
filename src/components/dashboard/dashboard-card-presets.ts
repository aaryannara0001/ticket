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
