import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

interface TicketsByDepartmentProps {
    data: { department: string; count: number }[];
}

export function TicketsByDepartment({ data }: TicketsByDepartmentProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Card className="bg-card border-border shadow-lg hover:border-border/80 transition-all">
            <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-lg font-semibold">
                    Tickets by Department
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={isDark ? '#4B5563' : '#E5E7EB'}
                            opacity={0.6}
                        />
                        <XAxis
                            dataKey="department"
                            tick={{
                                fill: isDark ? '#D1D5DB' : '#374151',
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                            stroke={isDark ? '#6B7280' : '#9CA3AF'}
                            tickLine={{
                                stroke: isDark ? '#6B7280' : '#9CA3AF',
                            }}
                        />
                        <YAxis
                            tick={{
                                fill: isDark ? '#D1D5DB' : '#374151',
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                            stroke={isDark ? '#6B7280' : '#9CA3AF'}
                            tickLine={{
                                stroke: isDark ? '#6B7280' : '#9CA3AF',
                            }}
                        />
                        <Bar
                            dataKey="count"
                            fill="#4ADE80"
                            radius={[6, 6, 0, 0]}
                            strokeWidth={1}
                            stroke="#34D399"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
