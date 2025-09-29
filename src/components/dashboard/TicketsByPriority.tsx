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
                <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-foreground">
                                {data.reduce(
                                    (sum, item) => sum + item.count,
                                    0,
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total
                            </div>
                        </div>
                    </div>
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
                                label={false}
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
                                    backgroundColor: isDark
                                        ? 'rgba(31, 41, 55, 0.95)'
                                        : 'rgba(255, 255, 255, 0.95)',
                                    border: `1px solid ${
                                        isDark ? '#6B7280' : '#E5E7EB'
                                    }`,
                                    borderRadius: '8px',
                                    color: isDark ? '#FFFFFF' : '#111827',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                    padding: '12px',
                                }}
                                labelStyle={{
                                    color: isDark ? '#FFFFFF' : '#111827',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    marginBottom: '4px',
                                }}
                                itemStyle={{
                                    color: isDark ? '#FFFFFF' : '#111827',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                }}
                            />
                            <Legend
                                wrapperStyle={{
                                    color: isDark ? '#FFFFFF' : '#000000',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                }}
                                formatter={(value) => {
                                    const item = data.find(
                                        (d) => d.priority === value,
                                    );
                                    return (
                                        <span
                                            style={{
                                                color: isDark
                                                    ? '#FFFFFF'
                                                    : '#000000',
                                            }}
                                        >
                                            {value}: {item?.count || 0}
                                        </span>
                                    );
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
