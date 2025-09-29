import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useTicketStore } from '@/store/ticketStore';
import { Ticket, User as UserType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Clock,
    Edit,
    MessageSquare,
    Paperclip,
    Send,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface TicketDetailModalProps {
    ticket: Ticket;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

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

// use live users from auth store so assignee lists update in real-time

export function TicketDetailModal({
    ticket,
    open,
    onOpenChange,
}: TicketDetailModalProps) {
    const [users, setUsers] = useState<UserType[]>(() =>
        useAuthStore.getState().getUsers(),
    );
    const [newComment, setNewComment] = useState('');
    const [editingStatus, setEditingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState(ticket.status);
    const [editingAssignees, setEditingAssignees] = useState(false);
    const [newAssigneeIds, setNewAssigneeIds] = useState(
        ticket.assigneeIds || [],
    );

    const { updateTicket, addComment } = useTicketStore();
    const { user, hasPermission } = useAuthStore();

    useEffect(() => {
        const unsub = useAuthStore.subscribe(() => {
            setUsers(useAuthStore.getState().getUsers());
        });
        return unsub;
    }, []);

    const handleStatusUpdate = async () => {
        if (newStatus !== ticket.status) {
            await updateTicket(ticket.id, { status: newStatus as any });
        }
        setEditingStatus(false);
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        await addComment(ticket.id, newComment);
        setNewComment('');
    };

    const handleAssigneesUpdate = async () => {
        const currentIds = ticket.assigneeIds || [];
        const hasChanged =
            newAssigneeIds.length !== currentIds.length ||
            !newAssigneeIds.every((id) => currentIds.includes(id));

        if (hasChanged) {
            await updateTicket(ticket.id, {
                assigneeIds:
                    newAssigneeIds.length > 0 ? newAssigneeIds : undefined,
            });
        }
        setEditingAssignees(false);
    };

    const canAssign =
        hasPermission('*') ||
        hasPermission('assign_tickets') ||
        hasPermission('team_management');

    console.log('canAssign:', canAssign, 'user role:', user?.role);

    const canEdit = hasPermission('tickets') || ticket.reporterId === user?.id;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-popover border-border max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-popover-foreground text-xl flex items-center space-x-3">
                                <span className="font-mono text-primary">
                                    {ticket.key}
                                </span>
                                <span>{ticket.title}</span>
                            </DialogTitle>
                            <div className="flex items-center space-x-4 mt-2">
                                <Badge
                                    style={{
                                        backgroundColor:
                                            priorityColors[ticket.priority] +
                                            '20',
                                        color: priorityColors[ticket.priority],
                                        border: `1px solid ${
                                            priorityColors[ticket.priority]
                                        }40`,
                                    }}
                                >
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {ticket.priority}
                                </Badge>

                                {editingStatus ? (
                                    <div className="flex items-center space-x-2">
                                        <Select
                                            value={newStatus}
                                            onValueChange={(value) =>
                                                setNewStatus(value as any)
                                            }
                                        >
                                            <SelectTrigger className="w-32 h-8 bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
                                                <SelectValue className="text-foreground" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border">
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
                                        <Button
                                            size="sm"
                                            onClick={handleStatusUpdate}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setEditingStatus(false)
                                            }
                                            className="text-foreground"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Badge
                                        style={{
                                            backgroundColor:
                                                statusColors[ticket.status] +
                                                '20',
                                            color: statusColors[ticket.status],
                                            border: `1px solid ${
                                                statusColors[ticket.status]
                                            }40`,
                                        }}
                                        className="cursor-pointer"
                                        onClick={() =>
                                            canEdit && setEditingStatus(true)
                                        }
                                    >
                                        {ticket.status.replace('_', ' ')}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-muted">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="comments"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                Comments ({ticket.comments.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="attachments"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                Attachments ({ticket.attachments.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="activity"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                Activity
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="overview"
                            className="space-y-6 mt-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground text-sm">
                                            Description
                                        </Label>
                                        <div className="mt-2 p-4 bg-card rounded-lg border border-border">
                                            <p className="text-foreground whitespace-pre-wrap">
                                                {ticket.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">
                                                Assignees
                                            </Label>
                                            {editingAssignees ? (
                                                <div className="mt-2 space-y-3">
                                                    <MultiSelect
                                                        options={users
                                                            .filter(
                                                                (u) =>
                                                                    u.role !==
                                                                    'client',
                                                            )
                                                            .map((user) => ({
                                                                label: `${
                                                                    user.name
                                                                } (${
                                                                    user.department ||
                                                                    'Unknown'
                                                                })`,
                                                                value: user.id,
                                                                icon: User,
                                                            }))}
                                                        selected={
                                                            newAssigneeIds
                                                        }
                                                        onChange={
                                                            setNewAssigneeIds
                                                        }
                                                        placeholder="Select assignees"
                                                        className="w-full"
                                                        maxCount={2}
                                                    />
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={
                                                                handleAssigneesUpdate
                                                            }
                                                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setEditingAssignees(
                                                                    false,
                                                                );
                                                                setNewAssigneeIds(
                                                                    ticket.assigneeIds ||
                                                                        [],
                                                                );
                                                            }}
                                                            className="text-foreground"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-2">
                                                    {ticket.assignees &&
                                                    ticket.assignees.length >
                                                        0 ? (
                                                        <div className="flex flex-wrap gap-2 items-center">
                                                            {ticket.assignees.map(
                                                                (assignee) => (
                                                                    <div
                                                                        key={
                                                                            assignee.id
                                                                        }
                                                                        className="flex items-center space-x-2 bg-card rounded-md px-2 py-1 border"
                                                                    >
                                                                        <Avatar className="w-5 h-5">
                                                                            <AvatarImage
                                                                                src={
                                                                                    assignee.avatar
                                                                                }
                                                                            />
                                                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                                                {assignee.name.charAt(
                                                                                    0,
                                                                                )}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-foreground text-xs">
                                                                            {
                                                                                assignee.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                            {canAssign && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setEditingAssignees(
                                                                            true,
                                                                        );
                                                                        setNewAssigneeIds(
                                                                            ticket.assigneeIds ||
                                                                                [],
                                                                        );
                                                                    }}
                                                                    className="text-primary hover:bg-primary/10 h-7 w-7 p-0 border border-primary/20"
                                                                    title="Edit assignees"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-muted-foreground text-sm">
                                                                Unassigned
                                                            </span>
                                                            {canAssign && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setEditingAssignees(
                                                                            true,
                                                                        );
                                                                        setNewAssigneeIds(
                                                                            [],
                                                                        );
                                                                    }}
                                                                    className="text-primary hover:bg-primary/10 h-7 w-7 p-0 border border-primary/20"
                                                                    title="Assign users"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-muted-foreground text-sm">
                                                Reporter
                                            </Label>
                                            <div className="mt-2 flex items-center space-x-2">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarImage
                                                        src={
                                                            ticket.reporter
                                                                ?.avatar
                                                        }
                                                    />
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                        {ticket.reporter?.name?.charAt(
                                                            0,
                                                        ) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-foreground text-sm">
                                                    {ticket.reporter?.name ||
                                                        'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">
                                                Department
                                            </Label>
                                            <p className="text-foreground text-sm mt-1">
                                                {ticket.department}
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-muted-foreground text-sm">
                                                Type
                                            </Label>
                                            <p className="text-foreground text-sm mt-1 capitalize">
                                                {ticket.type}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">
                                                Created
                                            </Label>
                                            <p className="text-foreground text-sm mt-1">
                                                {formatDistanceToNow(
                                                    ticket.createdAt,
                                                    { addSuffix: true },
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-muted-foreground text-sm">
                                                Due Date
                                            </Label>
                                            <p className="text-foreground text-sm mt-1">
                                                {ticket.dueDate
                                                    ? formatDistanceToNow(
                                                          ticket.dueDate,
                                                          { addSuffix: true },
                                                      )
                                                    : 'No due date'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="comments"
                            className="space-y-4 mt-6"
                        >
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {ticket.comments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            No comments yet
                                        </p>
                                    </div>
                                ) : (
                                    ticket.comments.map((comment) => (
                                        <motion.div
                                            key={comment.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-card p-4 rounded-lg border border-border"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage
                                                        src={
                                                            comment.author
                                                                .avatar
                                                        }
                                                    />
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                                        {comment.author.name.charAt(
                                                            0,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="text-foreground font-medium">
                                                            {
                                                                comment.author
                                                                    .name
                                                            }
                                                        </span>
                                                        <span className="text-muted-foreground text-sm">
                                                            {formatDistanceToNow(
                                                                comment.createdAt,
                                                                {
                                                                    addSuffix:
                                                                        true,
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            <Separator className="bg-gray-700" />

                            <div className="space-y-3">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    placeholder="Add a comment..."
                                    className="bg-background border-border text-foreground focus:border-primary sm:min-h-[100px]"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Add Comment
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="attachments"
                            className="space-y-4 mt-6"
                        >
                            {ticket.attachments.length === 0 ? (
                                <div className="text-center py-8">
                                    <Paperclip className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        No attachments
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ticket.attachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="bg-card p-4 rounded-lg border border-border"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Paperclip className="w-5 h-5 text-primary" />
                                                <div className="flex-1">
                                                    <p className="text-foreground font-medium">
                                                        {attachment.name}
                                                    </p>
                                                    <p className="text-muted-foreground text-sm">
                                                        {(
                                                            attachment.size /
                                                            1024
                                                        ).toFixed(1)}{' '}
                                                        KB
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-primary hover:bg-primary/10"
                                                >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent
                            value="activity"
                            className="space-y-4 mt-6"
                        >
                            <div className="text-center py-8">
                                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Activity log coming soon
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
