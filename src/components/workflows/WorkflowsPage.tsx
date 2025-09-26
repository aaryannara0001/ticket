import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Edit, Filter, Play, Plus, Settings, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';

interface WorkflowRule {
    id: string;
    name: string;
    trigger:
        | 'ticket.created'
        | 'ticket.updated'
        | 'status.changed'
        | 'comment.added';
    conditions: {
        field: string;
        operator: '=' | '!=' | 'contains' | 'not_contains';
        value: string;
    }[];
    actions: {
        type:
            | 'assignTo'
            | 'changePriority'
            | 'notifyUser'
            | 'addTag'
            | 'changeStatus';
        userId?: string;
        priority?: string;
        status?: string;
        tag?: string;
    }[];
    active: boolean;
    createdBy: string;
    createdAt: Date;
    executions: number;
}

const mockWorkflowRules: WorkflowRule[] = [
    {
        id: '1',
        name: 'Auto-assign urgent bugs',
        trigger: 'ticket.created',
        conditions: [
            { field: 'priority', operator: '=', value: 'critical' },
            { field: 'type', operator: '=', value: 'bug' },
        ],
        actions: [
            { type: 'assignTo', userId: '1' },
            { type: 'notifyUser', userId: '2' },
        ],
        active: true,
        createdBy: '1',
        createdAt: new Date('2024-01-10'),
        executions: 15,
    },
    {
        id: '2',
        name: 'Escalate high priority tickets',
        trigger: 'ticket.updated',
        conditions: [
            { field: 'priority', operator: '=', value: 'high' },
            { field: 'status', operator: '=', value: 'open' },
        ],
        actions: [
            { type: 'notifyUser', userId: '2' },
            { type: 'addTag', tag: 'escalated' },
        ],
        active: true,
        createdBy: '2',
        createdAt: new Date('2024-01-12'),
        executions: 8,
    },
    {
        id: '3',
        name: 'Client ticket auto-response',
        trigger: 'ticket.created',
        conditions: [{ field: 'reporterRole', operator: '=', value: 'client' }],
        actions: [
            { type: 'addTag', tag: 'client-request' },
            { type: 'notifyUser', userId: '2' },
        ],
        active: false,
        createdBy: '1',
        createdAt: new Date('2024-01-08'),
        executions: 25,
    },
];

export function WorkflowsPage() {
    const [rules, setRules] = useState<WorkflowRule[]>(mockWorkflowRules);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRule, setNewRule] = useState({
        name: '',
        trigger: 'ticket.created' as const,
        conditions: [{ field: 'priority', operator: '=' as const, value: '' }],
        actions: [{ type: 'assignTo' as const, userId: '' }],
    });

    const { hasPermission } = useAuthStore();

    const triggerOptions = [
        { value: 'ticket.created', label: 'Ticket Created' },
        { value: 'ticket.updated', label: 'Ticket Updated' },
        { value: 'status.changed', label: 'Status Changed' },
        { value: 'comment.added', label: 'Comment Added' },
    ];

    const fieldOptions = [
        { value: 'priority', label: 'Priority' },
        { value: 'status', label: 'Status' },
        { value: 'type', label: 'Type' },
        { value: 'department', label: 'Department' },
        { value: 'assignee', label: 'Assignee' },
        { value: 'reporterRole', label: 'Reporter Role' },
    ];

    const operatorOptions = [
        { value: '=', label: 'Equals' },
        { value: '!=', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does Not Contain' },
    ];

    const toggleRule = (id: string) => {
        setRules(
            rules.map((rule) =>
                rule.id === id ? { ...rule, active: !rule.active } : rule,
            ),
        );
    };

    const deleteRule = (id: string) => {
        setRules(rules.filter((rule) => rule.id !== id));
    };

    const getTriggerBadgeColor = (trigger: string) => {
        switch (trigger) {
            case 'ticket.created':
                return 'bg-green-500/20 text-green-400';
            case 'ticket.updated':
                return 'bg-blue-500/20 text-blue-400';
            case 'status.changed':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'comment.added':
                return 'bg-purple-500/20 text-purple-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const canManageWorkflows =
        hasPermission('*') || hasPermission('team_management');

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Workflow Automation
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Automate ticket workflows with custom rules and actions
                    </p>
                </div>
                {canManageWorkflows && (
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Rule
                    </Button>
                )}
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-card border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">
                                        Total Rules
                                    </p>
                                    <p className="text-2xl font-bold text-foreground mt-2">
                                        {rules.length}
                                    </p>
                                </div>
                                <Zap className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-card border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">
                                        Active Rules
                                    </p>
                                    <p className="text-2xl font-bold text-foreground mt-2">
                                        {rules.filter((r) => r.active).length}
                                    </p>
                                </div>
                                <Play className="w-8 h-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="bg-card border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">
                                        Total Executions
                                    </p>
                                    <p className="text-2xl font-bold text-foreground mt-2">
                                        {rules.reduce(
                                            (sum, rule) =>
                                                sum + rule.executions,
                                            0,
                                        )}
                                    </p>
                                </div>
                                <Settings className="w-8 h-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-card border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">
                                        Avg. Executions
                                    </p>
                                    <p className="text-2xl font-bold text-foreground mt-2">
                                        {Math.round(
                                            rules.reduce(
                                                (sum, rule) =>
                                                    sum + rule.executions,
                                                0,
                                            ) / rules.length,
                                        )}
                                    </p>
                                </div>
                                <Filter className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Rules Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">
                            Workflow Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border">
                                    <TableHead className="text-muted-foreground">
                                        Name
                                    </TableHead>
                                    <TableHead className="text-muted-foreground">
                                        Trigger
                                    </TableHead>
                                    <TableHead className="text-muted-foreground">
                                        Conditions
                                    </TableHead>
                                    <TableHead className="text-muted-foreground">
                                        Actions
                                    </TableHead>
                                    <TableHead className="text-muted-foreground">
                                        Executions
                                    </TableHead>
                                    <TableHead className="text-muted-foreground">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-muted-foreground">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map((rule) => (
                                    <TableRow
                                        key={rule.id}
                                        className="border-border"
                                    >
                                        <TableCell className="text-foreground font-medium">
                                            {rule.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getTriggerBadgeColor(
                                                    rule.trigger,
                                                )}
                                            >
                                                {rule.trigger
                                                    .replace('.', ' ')
                                                    .replace(/\b\w/g, (l) =>
                                                        l.toUpperCase(),
                                                    )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {rule.conditions.length} condition
                                            {rule.conditions.length !== 1
                                                ? 's'
                                                : ''}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {rule.actions.length} action
                                            {rule.actions.length !== 1
                                                ? 's'
                                                : ''}
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            {rule.executions}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={rule.active}
                                                    onCheckedChange={() =>
                                                        toggleRule(rule.id)
                                                    }
                                                    disabled={
                                                        !canManageWorkflows
                                                    }
                                                />
                                                <span
                                                    className={`text-sm ${
                                                        rule.active
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {rule.active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {canManageWorkflows && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                /* Edit functionality */
                                                            }}
                                                            className="text-primary hover:bg-primary/10"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                deleteRule(
                                                                    rule.id,
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
                    </CardContent>
                </Card>
            </motion.div>

            {/* Create Rule Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="bg-popover border-border text-popover-foreground max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Create Workflow Rule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="rule-name">Rule Name</Label>
                                <Input
                                    id="rule-name"
                                    value={newRule.name}
                                    onChange={(e) =>
                                        setNewRule({
                                            ...newRule,
                                            name: e.target.value,
                                        })
                                    }
                                    className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted-foreground"
                                    placeholder="e.g., Auto-assign urgent bugs"
                                />
                            </div>
                            <div>
                                <Label htmlFor="trigger">Trigger Event</Label>
                                <Select
                                    value={newRule.trigger}
                                    onValueChange={(value: any) =>
                                        setNewRule({
                                            ...newRule,
                                            trigger: value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
                                        <SelectValue className="text-foreground" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border">
                                        {triggerOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Conditions</Label>
                            <div className="space-y-2 mt-2">
                                {newRule.conditions.map((condition, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-4 gap-2"
                                    >
                                        <Select
                                            value={condition.field}
                                            onValueChange={(value) => {
                                                const updatedConditions = [
                                                    ...newRule.conditions,
                                                ];
                                                updatedConditions[index] = {
                                                    ...condition,
                                                    field: value,
                                                };
                                                setNewRule({
                                                    ...newRule,
                                                    conditions:
                                                        updatedConditions,
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
                                                <SelectValue
                                                    placeholder="Field"
                                                    className="text-foreground"
                                                />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border">
                                                {fieldOptions.map((option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                        className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={condition.operator}
                                            onValueChange={(value: any) => {
                                                const updatedConditions = [
                                                    ...newRule.conditions,
                                                ];
                                                updatedConditions[index] = {
                                                    ...condition,
                                                    operator: value,
                                                };
                                                setNewRule({
                                                    ...newRule,
                                                    conditions:
                                                        updatedConditions,
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary [&>span]:text-foreground">
                                                <SelectValue
                                                    placeholder="Operator"
                                                    className="text-foreground"
                                                />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border">
                                                {operatorOptions.map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            value={condition.value}
                                            onChange={(e) => {
                                                const updatedConditions = [
                                                    ...newRule.conditions,
                                                ];
                                                updatedConditions[index] = {
                                                    ...condition,
                                                    value: e.target.value,
                                                };
                                                setNewRule({
                                                    ...newRule,
                                                    conditions:
                                                        updatedConditions,
                                                });
                                            }}
                                            className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted-foreground"
                                            placeholder="Value"
                                        />

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const updatedConditions =
                                                    newRule.conditions.filter(
                                                        (_, i) => i !== index,
                                                    );
                                                setNewRule({
                                                    ...newRule,
                                                    conditions:
                                                        updatedConditions,
                                                });
                                            }}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setNewRule({
                                            ...newRule,
                                            conditions: [
                                                ...newRule.conditions,
                                                {
                                                    field: '',
                                                    operator: '=',
                                                    value: '',
                                                },
                                            ],
                                        });
                                    }}
                                    className="border-border text-foreground hover:bg-accent"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Condition
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowCreateModal(false)}
                                className="border-border text-foreground hover:bg-accent"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    // Here you would typically save the rule
                                    setShowCreateModal(false);
                                    setNewRule({
                                        name: '',
                                        trigger: 'ticket.created',
                                        conditions: [
                                            {
                                                field: 'priority',
                                                operator: '=',
                                                value: '',
                                            },
                                        ],
                                        actions: [
                                            { type: 'assignTo', userId: '' },
                                        ],
                                    });
                                }}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                Create Rule
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
