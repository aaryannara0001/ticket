import { PageHeader } from '@/components/layout/PageHeader';
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
import { Download, Edit, Eye, FileText, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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

export function MyTicketsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const { tickets, loading } = useTicketStore();
    const { hasPermission } = useAuthStore();

    useEffect(() => {
        // Call fetchTickets directly from the store to avoid subscribing to the
        // function reference which may change and retrigger the effect.
        useTicketStore.getState().fetchTickets('assigned');
    }, []);

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
            } catch {
                // keep generic error handling; variable renamed to avoid unused var lint
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
        a.download = 'my-tickets.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="h-6 sm:h-8 bg-muted rounded w-32 sm:w-40 animate-pulse"></div>
                    <div className="h-8 sm:h-10 bg-muted rounded w-20 sm:w-24 animate-pulse"></div>
                </div>
                <Card className="bg-card border-border">
                    <CardContent className="p-3 sm:p-4 md:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-10 sm:h-12 bg-muted rounded animate-pulse"
                                ></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader
                title={`My Assigned Tickets`}
                subtitle={`${filteredTickets.length} ticket${
                    filteredTickets.length !== 1 ? 's' : ''
                } assigned to you`}
                actions={
                    <Button
                        onClick={exportToCSV}
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground hover:bg-accent hover:border-border"
                    >
                        <Download className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden xs:inline">Export</span>
                    </Button>
                }
            />

            {/* Filters - Mobile-first responsive design */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-3 sm:p-4 md:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            {/* Search bar - full width on all screens */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search your tickets..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            {/* Filters - responsive grid layout */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
                                        <SelectValue
                                            placeholder="All Status"
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
                                    <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
                                        <SelectValue
                                            placeholder="All Priority"
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
                                    <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
                                        <SelectValue
                                            placeholder="All Types"
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

            {/* Empty State */}
            {filteredTickets.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-card border-border shadow-lg">
                        <CardContent className="p-8 text-center">
                            <div className="text-muted-foreground mb-4">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                No tickets assigned
                            </h3>
                            <p className="text-muted-foreground">
                                You don't have any tickets assigned to you yet.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Tickets - Responsive Table/Cards */}
            {filteredTickets.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-foreground text-base sm:text-lg font-semibold">
                                Your Tickets ({filteredTickets.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            {/* Mobile Card View */}
                            <div className="block sm:hidden">
                                <div className="space-y-3 p-3">
                                    {filteredTickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="bg-accent/20 border border-border rounded-lg p-4 space-y-3"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="font-mono font-semibold text-foreground text-sm">
                                                        {ticket.key}
                                                    </div>
                                                    <div className="font-medium text-foreground">
                                                        {ticket.title}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleViewTicket(
                                                                ticket,
                                                            )
                                                        }
                                                        className="text-primary hover:bg-primary/10 p-1"
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
                                                                className="text-yellow-500 hover:bg-yellow-500/10 p-1"
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
                                                                className="text-destructive hover:bg-destructive/10 p-1"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
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
                                                    className="font-medium text-xs"
                                                >
                                                    {ticket.type}
                                                </Badge>
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
                                                    className="font-medium text-xs"
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
                                                    className="font-medium text-xs"
                                                >
                                                    {ticket.status.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </Badge>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                <span>{ticket.department}</span>
                                                <span>
                                                    {formatDistanceToNow(
                                                        ticket.createdAt,
                                                        {
                                                            addSuffix: true,
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border">
                                            <TableHead className="text-muted-foreground font-semibold text-xs sm:text-sm">
                                                Key
                                            </TableHead>
                                            <TableHead className="text-muted-foreground font-semibold text-xs sm:text-sm">
                                                Title
                                            </TableHead>
                                            <TableHead className="text-muted-foreground font-semibold text-xs sm:text-sm">
                                                Type
                                            </TableHead>
                                            <TableHead className="text-muted-foreground font-semibold text-xs sm:text-sm">
                                                Priority
                                            </TableHead>
                                            <TableHead className="text-muted-foreground font-semibold text-xs sm:text-sm">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-muted-foreground font-semibold text-xs sm:text-sm hidden md:table-cell">
                                                Department
                                            </TableHead>
                                            <TableHead className="text-muted-foreground font-semibold text-xs sm:text-sm hidden lg:table-cell">
                                                Created
                                            </TableHead>
                                            <TableHead className="text-muted-foreground font-semibold text-xs sm:text-sm">
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
                                                <TableCell className="text-foreground font-mono font-semibold text-xs sm:text-sm">
                                                    {ticket.key}
                                                </TableCell>
                                                <TableCell className="text-foreground max-w-xs truncate font-medium text-xs sm:text-sm">
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
                                                        className="font-medium text-xs"
                                                    >
                                                        {ticket.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        style={{
                                                            backgroundColor:
                                                                priorityColors[
                                                                    ticket
                                                                        .priority
                                                                ] + '30',
                                                            color: priorityColors[
                                                                ticket.priority
                                                            ],
                                                            border: `1px solid ${
                                                                priorityColors[
                                                                    ticket
                                                                        .priority
                                                                ]
                                                            }60`,
                                                        }}
                                                        className="font-medium text-xs"
                                                    >
                                                        {ticket.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        style={{
                                                            backgroundColor:
                                                                statusColors[
                                                                    ticket
                                                                        .status
                                                                ] + '30',
                                                            color: statusColors[
                                                                ticket.status
                                                            ],
                                                            border: `1px solid ${
                                                                statusColors[
                                                                    ticket
                                                                        .status
                                                                ]
                                                            }60`,
                                                        }}
                                                        className="font-medium text-xs"
                                                    >
                                                        {ticket.status.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-medium text-xs sm:text-sm hidden md:table-cell">
                                                    {ticket.department}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-medium text-xs sm:text-sm hidden lg:table-cell">
                                                    {formatDistanceToNow(
                                                        ticket.createdAt,
                                                        { addSuffix: true },
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleViewTicket(
                                                                    ticket,
                                                                )
                                                            }
                                                            className="text-primary hover:bg-primary/10 p-1 sm:p-2"
                                                        >
                                                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
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
                                                                    className="text-yellow-500 hover:bg-yellow-500/10 p-1 sm:p-2 hidden sm:flex"
                                                                >
                                                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() =>
                                                                        handleDeleteTicket(
                                                                            ticket,
                                                                        )
                                                                    }
                                                                    className="text-destructive hover:bg-destructive/10 p-1 sm:p-2 hidden sm:flex"
                                                                >
                                                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
            )}

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
