import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { addDays } from 'date-fns';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    BarChart3,
    Download,
    Filter,
    PieChart,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart as RechartsPieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const ticketsByDepartment = [
    { department: 'Engineering', open: 12, closed: 8, inProgress: 5 },
    { department: 'IT', open: 8, closed: 12, inProgress: 3 },
    { department: 'Support', open: 5, closed: 15, inProgress: 2 },
    { department: 'Marketing', open: 3, closed: 7, inProgress: 1 },
];

const ticketsByPriority = [
    { priority: 'Critical', count: 3, color: '#EF4444' },
    { priority: 'High', count: 7, color: '#F97316' },
    { priority: 'Medium', count: 12, color: '#FACC15' },
    { priority: 'Low', count: 8, color: '#4ADE80' },
];

const ticketTrends = [
    { month: 'Jan', created: 15, resolved: 12 },
    { month: 'Feb', created: 18, resolved: 16 },
    { month: 'Mar', created: 22, resolved: 20 },
    { month: 'Apr', created: 19, resolved: 18 },
    { month: 'May', created: 25, resolved: 23 },
    { month: 'Jun', created: 28, resolved: 26 },
];

const teamPerformance = [
    { name: 'John Admin', resolved: 15, assigned: 18, efficiency: 83 },
    { name: 'Sarah Manager', resolved: 12, assigned: 14, efficiency: 86 },
    { name: 'Mike Developer', resolved: 20, assigned: 22, efficiency: 91 },
    { name: 'Lisa Client', resolved: 8, assigned: 10, efficiency: 80 },
];

export function ReportsPage() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const exportToPDF = async () => {
        const element = document.getElementById('reports-content');
        if (!element) return;

        const canvas = await html2canvas(element, {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            scale: 2,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('ticket-reports.pdf');
    };

    const exportToExcel = () => {
        const csvContent = [
            ['Department', 'Open', 'In Progress', 'Closed'],
            ...ticketsByDepartment.map((item) => [
                item.department,
                item.open.toString(),
                item.inProgress.toString(),
                item.closed.toString(),
            ]),
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ticket-reports.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Reports & Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive insights into ticket management and team
                        performance
                    </p>
                </div>

                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Reports & Analytics
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Comprehensive insights into ticket management
                                and team performance
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={exportToExcel}
                                variant="outline"
                                className="border-border text-foreground hover:bg-accent"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Excel
                            </Button>
                            <Button
                                onClick={exportToPDF}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export PDF
                            </Button>
                        </div>
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-card border-border">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div>
                                        <DatePickerWithRange
                                            date={dateRange}
                                            onDateChange={setDateRange}
                                            open={datePickerOpen}
                                            onOpenChange={setDatePickerOpen}
                                            className="bg-background border-border text-foreground"
                                        />
                                    </div>

                                    <Select
                                        value={departmentFilter}
                                        onValueChange={setDepartmentFilter}
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                                            <SelectValue
                                                placeholder="Department"
                                                className="text-foreground"
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem
                                                value="all"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                All Departments
                                            </SelectItem>
                                            <SelectItem
                                                value="engineering"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                Engineering
                                            </SelectItem>
                                            <SelectItem
                                                value="it"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                IT
                                            </SelectItem>
                                            <SelectItem
                                                value="support"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                Support
                                            </SelectItem>
                                            <SelectItem
                                                value="marketing"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                Marketing
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={priorityFilter}
                                        onValueChange={setPriorityFilter}
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                                            <SelectValue
                                                placeholder="Priority"
                                                className="text-foreground"
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem
                                                value="all"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                All Priority
                                            </SelectItem>
                                            <SelectItem
                                                value="critical"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                Critical
                                            </SelectItem>
                                            <SelectItem
                                                value="high"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                High
                                            </SelectItem>
                                            <SelectItem
                                                value="medium"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                Medium
                                            </SelectItem>
                                            <SelectItem
                                                value="low"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                Low
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={assigneeFilter}
                                        onValueChange={setAssigneeFilter}
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                                            <SelectValue
                                                placeholder="Assignee"
                                                className="text-foreground"
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem
                                                value="all"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                All Assignees
                                            </SelectItem>
                                            <SelectItem
                                                value="john"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                John Admin
                                            </SelectItem>
                                            <SelectItem
                                                value="sarah"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                Sarah Manager
                                            </SelectItem>
                                            <SelectItem
                                                value="mike"
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                Mike Developer
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        onClick={() => {
                                            setDepartmentFilter('all');
                                            setPriorityFilter('all');
                                            setAssigneeFilter('all');
                                        }}
                                        variant="outline"
                                        className="border-border text-foreground hover:bg-accent"
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        Clear
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Reports Content */}
                    <div id="reports-content">
                        <Tabs defaultValue="overview" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4 bg-muted">
                                <TabsTrigger
                                    value="overview"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="departments"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    Departments
                                </TabsTrigger>
                                <TabsTrigger
                                    value="trends"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    Trends
                                </TabsTrigger>
                                <TabsTrigger
                                    value="performance"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    Performance
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <Card className="bg-card border-border">
                                        <CardHeader>
                                            <CardTitle className="text-foreground flex items-center">
                                                <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                                                Tickets by Department
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer
                                                width="100%"
                                                height={300}
                                            >
                                                <BarChart
                                                    data={ticketsByDepartment}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        stroke={
                                                            isDark
                                                                ? '#4B5563'
                                                                : '#E5E7EB'
                                                        }
                                                    />
                                                    <XAxis
                                                        dataKey="department"
                                                        tick={{
                                                            fill: isDark
                                                                ? '#D1D5DB'
                                                                : '#374151',
                                                            fontSize: 12,
                                                        }}
                                                        stroke={
                                                            isDark
                                                                ? '#6B7280'
                                                                : '#9CA3AF'
                                                        }
                                                    />
                                                    <YAxis
                                                        tick={{
                                                            fill: isDark
                                                                ? '#D1D5DB'
                                                                : '#374151',
                                                            fontSize: 12,
                                                        }}
                                                        stroke={
                                                            isDark
                                                                ? '#6B7280'
                                                                : '#9CA3AF'
                                                        }
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor:
                                                                isDark
                                                                    ? '#1B2320'
                                                                    : '#FFFFFF',
                                                            border: `1px solid ${
                                                                isDark
                                                                    ? '#4B5563'
                                                                    : '#E5E7EB'
                                                            }`,
                                                            borderRadius: '8px',
                                                            color: isDark
                                                                ? '#FFFFFF'
                                                                : '#111827',
                                                        }}
                                                    />
                                                    <Bar
                                                        dataKey="open"
                                                        fill="#6B7280"
                                                        name="Open"
                                                    />
                                                    <Bar
                                                        dataKey="inProgress"
                                                        fill="#FACC15"
                                                        name="In Progress"
                                                    />
                                                    <Bar
                                                        dataKey="closed"
                                                        fill="#4ADE80"
                                                        name="Closed"
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-card border-border">
                                        <CardHeader>
                                            <CardTitle className="text-foreground flex items-center">
                                                <PieChart className="w-5 h-5 mr-2 text-primary" />
                                                Tickets by Priority
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer
                                                width="100%"
                                                height={300}
                                            >
                                                <RechartsPieChart>
                                                    <Pie
                                                        data={ticketsByPriority}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        dataKey="count"
                                                    >
                                                        {ticketsByPriority.map(
                                                            (entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        entry.color
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor:
                                                                isDark
                                                                    ? '#1B2320'
                                                                    : '#FFFFFF',
                                                            border: `1px solid ${
                                                                isDark
                                                                    ? '#4B5563'
                                                                    : '#E5E7EB'
                                                            }`,
                                                            borderRadius: '8px',
                                                            color: isDark
                                                                ? '#FFFFFF'
                                                                : '#111827',
                                                        }}
                                                    />
                                                    <Legend
                                                        wrapperStyle={{
                                                            color: isDark
                                                                ? '#D1D5DB'
                                                                : '#374151',
                                                        }}
                                                    />
                                                </RechartsPieChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            <TabsContent
                                value="departments"
                                className="space-y-6"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className="bg-card border-border">
                                        <CardHeader>
                                            <CardTitle className="text-foreground">
                                                Department Performance
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {ticketsByDepartment.map(
                                                    (dept) => {
                                                        const total =
                                                            dept.open +
                                                            dept.inProgress +
                                                            dept.closed;
                                                        const completionRate =
                                                            (dept.closed /
                                                                total) *
                                                            100;

                                                        return (
                                                            <div
                                                                key={
                                                                    dept.department
                                                                }
                                                                className="p-4 bg-muted rounded-lg"
                                                            >
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="text-foreground font-medium">
                                                                        {
                                                                            dept.department
                                                                        }
                                                                    </h4>
                                                                    <span className="text-primary font-medium">
                                                                        {completionRate.toFixed(
                                                                            1,
                                                                        )}
                                                                        %
                                                                        completion
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                                    <div>
                                                                        <span className="text-muted-foreground">
                                                                            Open:{' '}
                                                                        </span>
                                                                        <span className="text-foreground">
                                                                            {
                                                                                dept.open
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-yellow-500">
                                                                            In
                                                                            Progress:{' '}
                                                                        </span>
                                                                        <span className="text-foreground">
                                                                            {
                                                                                dept.inProgress
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-primary">
                                                                            Closed:{' '}
                                                                        </span>
                                                                        <span className="text-foreground">
                                                                            {
                                                                                dept.closed
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="trends" className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className="bg-card border-border">
                                        <CardHeader>
                                            <CardTitle className="text-foreground flex items-center">
                                                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                                                Ticket Trends Over Time
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer
                                                width="100%"
                                                height={400}
                                            >
                                                <LineChart data={ticketTrends}>
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        stroke={
                                                            isDark
                                                                ? '#4B5563'
                                                                : '#E5E7EB'
                                                        }
                                                    />
                                                    <XAxis
                                                        dataKey="month"
                                                        tick={{
                                                            fill: isDark
                                                                ? '#D1D5DB'
                                                                : '#374151',
                                                            fontSize: 12,
                                                        }}
                                                        stroke={
                                                            isDark
                                                                ? '#6B7280'
                                                                : '#9CA3AF'
                                                        }
                                                    />
                                                    <YAxis
                                                        tick={{
                                                            fill: isDark
                                                                ? '#D1D5DB'
                                                                : '#374151',
                                                            fontSize: 12,
                                                        }}
                                                        stroke={
                                                            isDark
                                                                ? '#6B7280'
                                                                : '#9CA3AF'
                                                        }
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor:
                                                                isDark
                                                                    ? '#1B2320'
                                                                    : '#FFFFFF',
                                                            border: `1px solid ${
                                                                isDark
                                                                    ? '#4B5563'
                                                                    : '#E5E7EB'
                                                            }`,
                                                            borderRadius: '8px',
                                                            color: isDark
                                                                ? '#FFFFFF'
                                                                : '#111827',
                                                        }}
                                                    />
                                                    <Legend
                                                        wrapperStyle={{
                                                            color: isDark
                                                                ? '#D1D5DB'
                                                                : '#374151',
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="created"
                                                        stroke="#A3FF12"
                                                        strokeWidth={3}
                                                        name="Created"
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="resolved"
                                                        stroke="#4ADE80"
                                                        strokeWidth={3}
                                                        name="Resolved"
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            <TabsContent
                                value="performance"
                                className="space-y-6"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className="bg-card border-border">
                                        <CardHeader>
                                            <CardTitle className="text-foreground flex items-center">
                                                <Users className="w-5 h-5 mr-2 text-primary" />
                                                Team Performance
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {teamPerformance.map(
                                                    (member) => (
                                                        <div
                                                            key={member.name}
                                                            className="p-4 bg-muted rounded-lg"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="text-foreground font-medium">
                                                                    {
                                                                        member.name
                                                                    }
                                                                </h4>
                                                                <div className="flex items-center space-x-4">
                                                                    <span className="text-primary font-medium">
                                                                        {
                                                                            member.efficiency
                                                                        }
                                                                        %
                                                                        efficiency
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        Resolved:{' '}
                                                                    </span>
                                                                    <span className="text-foreground">
                                                                        {
                                                                            member.resolved
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        Assigned:{' '}
                                                                    </span>
                                                                    <span className="text-foreground">
                                                                        {
                                                                            member.assigned
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
