import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

interface TicketsByPriorityProps {
    data: { priority: string; count: number }[];
}

const COLORS = {
    Critical: '#EF4444',
    High: '#F97316',
    Medium: '#FACC15',
    Low: '#4ADE80',
};

export function TicketsByPriority({ data }: TicketsByPriorityProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Card className="bg-card border-border shadow-lg hover:border-border/80 transition-all">
            <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-lg font-semibold">
                    Tickets by Priority
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="count"
                            stroke={isDark ? '#374151' : '#D1D5DB'}
                            strokeWidth={2}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        COLORS[
                                            entry.priority as keyof typeof COLORS
                                        ] || '#4ADE80'
                                    }
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                                border: `1px solid ${
                                    isDark ? '#4B5563' : '#E5E7EB'
                                }`,
                                borderRadius: '8px',
                                color: isDark ? '#F3F4F6' : '#111827',
                                boxShadow: isDark
                                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                                    : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            }}
                            labelStyle={{
                                color: isDark ? '#D1D5DB' : '#374151',
                            }}
                        />
                        <Legend
                            wrapperStyle={{
                                color: isDark ? '#D1D5DB' : '#374151',
                                fontSize: '14px',
                                fontWeight: '500',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
