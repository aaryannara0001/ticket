import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { useTicketStore } from '@/store/ticketStore';
import { Ticket } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Download, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CreateTicketModal } from './CreateTicketModal';
import { TicketDetailModal } from './TicketDetailModal';

const priorityColors = {
    low: '#4ADE80',
    medium: '#FACC15',
    high: '#F97316',
    critical: '#EF4444',
};

const statusColors = {
    open: '#6B7280',
    in_progress: '#FACC15',
    resolved: '#4ADE80',
    closed: '#A1A1AA',
};

const typeColors = {
    bug: '#EF4444',
    feature: '#4ADE80',
    task: '#FACC15',
    story: '#8B5CF6',
};

export function TicketsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const { tickets, fetchTickets, loading } = useTicketStore();
    const { hasPermission } = useAuthStore();

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch =
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || ticket.status === statusFilter;
        const matchesPriority =
            priorityFilter === 'all' || ticket.priority === priorityFilter;
        const matchesType = typeFilter === 'all' || ticket.type === typeFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });

    const handleViewTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowDetailModal(true);
    };

    const handleEditTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowDetailModal(true);
        // The TicketDetailModal should handle edit mode
    };

    const handleDeleteTicket = async (ticket: Ticket) => {
        if (
            window.confirm(
                `Are you sure you want to delete ticket ${ticket.key}?`,
            )
        ) {
            try {
                await useTicketStore.getState().deleteTicket(ticket.id);
                toast({
                    title: 'Success',
                    description: 'Ticket deleted successfully',
                });
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to delete ticket',
                    variant: 'destructive',
                });
            }
        }
    };

    const exportToCSV = () => {
        const headers = [
            'Key',
            'Title',
            'Type',
            'Priority',
            'Status',
            'Assignee',
            'Department',
            'Created',
            'Due Date',
        ];
        const csvContent = [
            headers.join(','),
            ...filteredTickets.map((ticket) =>
                [
                    ticket.key,
                    `"${ticket.title}"`,
                    ticket.type,
                    ticket.priority,
                    ticket.status,
                    ticket.assignee?.name || 'Unassigned',
                    ticket.department,
                    ticket.createdAt.toLocaleDateString(),
                    ticket.dueDate?.toLocaleDateString() || 'No due date',
                ].join(','),
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tickets.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-700 rounded w-32 animate-pulse"></div>
                    <div className="h-10 bg-gray-700 rounded w-24 animate-pulse"></div>
                </div>
                <Card className="bg-card border-gray-700">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-12 bg-muted rounded animate-pulse"
                                ></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">
                        Tickets
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">
                        Manage and track all tickets
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <Button
                        onClick={exportToCSV}
                        variant="outline"
                        className="border-border text-foreground hover:bg-accent hover:border-border"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    {hasPermission('create_ticket') && (
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Ticket
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search tickets..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground w-40">
                                        <SelectValue
                                            placeholder="Status"
                                            className="text-foreground"
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border">
                                        <SelectItem
                                            value="all"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            All Status
                                        </SelectItem>
                                        <SelectItem
                                            value="open"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Open
                                        </SelectItem>
                                        <SelectItem
                                            value="in_progress"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            In Progress
                                        </SelectItem>
                                        <SelectItem
                                            value="resolved"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Resolved
                                        </SelectItem>
                                        <SelectItem
                                            value="closed"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Closed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={priorityFilter}
                                    onValueChange={setPriorityFilter}
                                >
                                    <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground w-40">
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
                                            value="low"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Low
                                        </SelectItem>
                                        <SelectItem
                                            value="medium"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Medium
                                        </SelectItem>
                                        <SelectItem
                                            value="high"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            High
                                        </SelectItem>
                                        <SelectItem
                                            value="critical"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Critical
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={typeFilter}
                                    onValueChange={setTypeFilter}
                                >
                                    <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground w-40">
                                        <SelectValue
                                            placeholder="Type"
                                            className="text-foreground"
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border">
                                        <SelectItem
                                            value="all"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            All Types
                                        </SelectItem>
                                        <SelectItem
                                            value="bug"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Bug
                                        </SelectItem>
                                        <SelectItem
                                            value="feature"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Feature
                                        </SelectItem>
                                        <SelectItem
                                            value="task"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Task
                                        </SelectItem>
                                        <SelectItem
                                            value="story"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Story
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tickets Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="bg-card border-border shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-foreground text-lg font-semibold">
                            Tickets ({filteredTickets.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border">
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Key
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Title
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Type
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Priority
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Assignee
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Department
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Created
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTickets.map((ticket) => (
                                        <TableRow
                                            key={ticket.id}
                                            className="border-border hover:bg-accent/50 transition-colors"
                                        >
                                            <TableCell className="text-foreground font-mono font-semibold">
                                                {ticket.key}
                                            </TableCell>
                                            <TableCell className="text-foreground max-w-xs truncate font-medium">
                                                {ticket.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    style={{
                                                        backgroundColor:
                                                            typeColors[
                                                                ticket.type
                                                            ] + '30',
                                                        color: typeColors[
                                                            ticket.type
                                                        ],
                                                        border: `1px solid ${
                                                            typeColors[
                                                                ticket.type
                                                            ]
                                                        }60`,
                                                    }}
                                                    className="font-medium"
                                                >
                                                    {ticket.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
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
                                                    className="font-medium"
                                                >
                                                    {ticket.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
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
                                                    className="font-medium"
                                                >
                                                    {ticket.status.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-medium">
                                                {ticket.assignee?.name ||
                                                    'Unassigned'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-medium">
                                                {ticket.department}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-medium">
                                                {formatDistanceToNow(
                                                    ticket.createdAt,
                                                    { addSuffix: true },
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleViewTicket(
                                                                ticket,
                                                            )
                                                        }
                                                        className="text-primary hover:bg-primary/10"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    {hasPermission(
                                                        'tickets',
                                                    ) && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    handleEditTicket(
                                                                        ticket,
                                                                    )
                                                                }
                                                                className="text-yellow-500 hover:bg-yellow-500/10"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    handleDeleteTicket(
                                                                        ticket,
                                                                    )
                                                                }
                                                                className="text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Create Ticket Modal */}
            <CreateTicketModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
            />

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    open={showDetailModal}
                    onOpenChange={setShowDetailModal}
                />
            )}
        </div>
    );
}
