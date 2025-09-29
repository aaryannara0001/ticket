import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useTicketStore } from '@/store/ticketStore';
import { Ticket } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, Filter, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult,
} from 'react-beautiful-dnd';
import { CreateTicketModal } from '../tickets/CreateTicketModal';
import { TicketDetailModal } from '../tickets/TicketDetailModal';

const columns = [
    { id: 'open', title: 'Open', color: '#6B7280' },
    { id: 'in_progress', title: 'In Progress', color: '#FACC15' },
    { id: 'resolved', title: 'Resolved', color: '#4ADE80' },
    { id: 'closed', title: 'Closed', color: '#A1A1AA' },
];

const priorityColors = {
    low: '#4ADE80',
    medium: '#FACC15',
    high: '#F97316',
    critical: '#EF4444',
};

const typeColors = {
    bug: '#EF4444',
    feature: '#4ADE80',
    task: '#FACC15',
    story: '#8B5CF6',
};

export function KanbanPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // fetchTickets removed from destructure because we call it via the store getter on mount
    const { tickets, updateTicket, loading } = useTicketStore();
    const { hasPermission } = useAuthStore();

    useEffect(() => {
        // Call fetchTickets once on mount using the store getter to avoid
        // subscribing to the function reference which may change and retrigger
        // the effect (causes re-render loops).
        useTicketStore.getState().fetchTickets();
    }, []);

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch =
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.key.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority =
            priorityFilter === 'all' || ticket.priority === priorityFilter;
        const matchesAssignee =
            assigneeFilter === 'all' || ticket.assigneeId === assigneeFilter;

        return matchesSearch && matchesPriority && matchesAssignee;
    });

    const ticketsByStatus = columns.reduce((acc, column) => {
        acc[column.id] = filteredTickets.filter(
            (ticket) => ticket.status === column.id,
        );
        return acc;
    }, {} as Record<string, Ticket[]>);

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        if (source.droppableId === destination.droppableId) return;

        const ticket = tickets.find((t) => t.id === draggableId);
        if (!ticket) return;

        await updateTicket(ticket.id, {
            status: destination.droppableId as any,
        });
    };

    const handleTicketClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowDetailModal(true);
    };

    const uniqueAssignees = Array.from(
        new Set(tickets.map((t) => t.assigneeId).filter(Boolean)),
    )
        .map((id) => tickets.find((t) => t.assigneeId === id)?.assignee)
        .filter(Boolean);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-700 rounded w-32 animate-pulse"></div>
                    <div className="h-10 bg-gray-700 rounded w-24 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-96 bg-gray-700 rounded animate-pulse"
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Kanban"
                actions={
                    hasPermission('create_ticket') ? (
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Ticket
                        </Button>
                    ) : undefined
                }
            />

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
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

                            <Select
                                value={priorityFilter}
                                onValueChange={setPriorityFilter}
                            >
                                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
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
                                value={assigneeFilter}
                                onValueChange={setAssigneeFilter}
                            >
                                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
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
                                    {uniqueAssignees.map((assignee) => (
                                        <SelectItem
                                            key={assignee!.id}
                                            value={assignee!.id}
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            {assignee!.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={() => {
                                    setSearchQuery('');
                                    setPriorityFilter('all');
                                    setAssigneeFilter('all');
                                }}
                                variant="outline"
                                className="border-border text-foreground hover:bg-accent hover:border-border"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Kanban Board */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {columns.map((column) => (
                            <div key={column.id} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-foreground font-semibold flex items-center text-lg">
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{
                                                backgroundColor: column.color,
                                            }}
                                        />
                                        {column.title}
                                    </h3>
                                    <Badge
                                        variant="secondary"
                                        className="bg-secondary text-secondary-foreground border border-border font-medium"
                                    >
                                        {ticketsByStatus[column.id]?.length ||
                                            0}
                                    </Badge>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-h-[300px] sm:min-h-[500px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                                                snapshot.isDraggingOver
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border'
                                            }`}
                                        >
                                            <div className="space-y-3">
                                                {ticketsByStatus[
                                                    column.id
                                                ]?.map((ticket, index) => (
                                                    <Draggable
                                                        key={ticket.id}
                                                        draggableId={ticket.id}
                                                        index={index}
                                                    >
                                                        {(
                                                            provided,
                                                            snapshot,
                                                        ) => (
                                                            <div
                                                                ref={
                                                                    provided.innerRef
                                                                }
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                <motion.div
                                                                    initial={{
                                                                        opacity: 0,
                                                                        scale: 0.9,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        scale: 1,
                                                                    }}
                                                                    whileHover={{
                                                                        scale: 1.02,
                                                                    }}
                                                                    className={`cursor-pointer transition-all ${
                                                                        snapshot.isDragging
                                                                            ? 'rotate-3 shadow-2xl'
                                                                            : ''
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleTicketClick(
                                                                            ticket,
                                                                        )
                                                                    }
                                                                >
                                                                    <Card className="bg-card border-border hover:border-primary/60 shadow-lg hover:shadow-xl transition-all">
                                                                        <CardContent className="p-4">
                                                                            <div className="space-y-3">
                                                                                <div className="flex items-start justify-between">
                                                                                    <span className="text-primary text-sm font-mono font-bold">
                                                                                        {
                                                                                            ticket.key
                                                                                        }
                                                                                    </span>
                                                                                    <Badge
                                                                                        style={{
                                                                                            backgroundColor:
                                                                                                priorityColors[
                                                                                                    ticket
                                                                                                        .priority
                                                                                                ] +
                                                                                                '30',
                                                                                            color: priorityColors[
                                                                                                ticket
                                                                                                    .priority
                                                                                            ],
                                                                                            border: `1px solid ${
                                                                                                priorityColors[
                                                                                                    ticket
                                                                                                        .priority
                                                                                                ]
                                                                                            }60`,
                                                                                        }}
                                                                                        className="text-xs font-medium"
                                                                                    >
                                                                                        {
                                                                                            ticket.priority
                                                                                        }
                                                                                    </Badge>
                                                                                </div>

                                                                                <h4 className="text-foreground font-semibold text-sm line-clamp-2 leading-relaxed">
                                                                                    {
                                                                                        ticket.title
                                                                                    }
                                                                                </h4>

                                                                                <div className="flex items-center justify-between">
                                                                                    <Badge
                                                                                        style={{
                                                                                            backgroundColor:
                                                                                                typeColors[
                                                                                                    ticket
                                                                                                        .type
                                                                                                ] +
                                                                                                '30',
                                                                                            color: typeColors[
                                                                                                ticket
                                                                                                    .type
                                                                                            ],
                                                                                            border: `1px solid ${
                                                                                                typeColors[
                                                                                                    ticket
                                                                                                        .type
                                                                                                ]
                                                                                            }60`,
                                                                                        }}
                                                                                        className="text-xs font-medium"
                                                                                    >
                                                                                        {
                                                                                            ticket.type
                                                                                        }
                                                                                    </Badge>

                                                                                    {ticket.assignee && (
                                                                                        <Avatar className="w-6 h-6">
                                                                                            <AvatarImage
                                                                                                src={
                                                                                                    ticket
                                                                                                        .assignee
                                                                                                        .avatar
                                                                                                }
                                                                                            />
                                                                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                                                                                {ticket.assignee.name.charAt(
                                                                                                    0,
                                                                                                )}
                                                                                            </AvatarFallback>
                                                                                        </Avatar>
                                                                                    )}
                                                                                </div>

                                                                                {ticket.dueDate && (
                                                                                    <div className="flex items-center text-muted-foreground text-xs font-medium">
                                                                                        <Calendar className="w-3 h-3 mr-1" />
                                                                                        Due{' '}
                                                                                        {formatDistanceToNow(
                                                                                            ticket.dueDate,
                                                                                            {
                                                                                                addSuffix:
                                                                                                    true,
                                                                                            },
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                                                                                    <span>
                                                                                        {
                                                                                            ticket
                                                                                                .comments
                                                                                                .length
                                                                                        }{' '}
                                                                                        comments
                                                                                    </span>
                                                                                    <span>
                                                                                        {formatDistanceToNow(
                                                                                            ticket.updatedAt,
                                                                                            {
                                                                                                addSuffix:
                                                                                                    true,
                                                                                            },
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </motion.div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            </div>
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
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
