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
import { useEpicStore } from '@/store/epicStore';
import { useSettingsStore } from '@/store/settingsStore';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
    Download,
    Edit,
    Eye,
    Plus,
    Search,
    Shield,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CreateEpicModal } from '../epics/CreateEpicModal';
import { EpicDetailModal } from './EpicDetailModal';

const statusColors = {
    planning: '#6B7280',
    in_progress: '#FACC15',
    completed: '#4ADE80',
};

export function ProjectsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedEpic, setSelectedEpic] = useState<any | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const { epics, fetchEpics, deleteEpic, createEpic } = useEpicStore();
    const { hasPermission, user } = useAuthStore();
    const { isFeatureEnabledForRole } = useSettingsStore();

    // Check if user has actual permission to access projects
    const canAccessProjects =
        user?.role === 'admin' ||
        isFeatureEnabledForRole('projectManagement', user?.role || '');

    useEffect(() => {
        fetchEpics();
    }, [fetchEpics]);

    const filteredEpics = epics.filter((epic) => {
        const matchesSearch =
            epic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            epic.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || epic.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleViewEpic = (epic: any) => {
        setSelectedEpic(epic);
        setShowDetailModal(true);
    };

    const handleEditEpic = (epic: any) => {
        setSelectedEpic(epic);
        setShowDetailModal(true);
        // The EpicDetailModal should handle edit mode
    };

    const handleDeleteEpic = async (epic: any) => {
        if (
            window.confirm(
                `Are you sure you want to delete project "${epic.title}"?`,
            )
        ) {
            try {
                await deleteEpic(epic.id);
                toast({
                    title: 'Success',
                    description: 'Project deleted successfully',
                });
            } catch {
                toast({
                    title: 'Error',
                    description: 'Failed to delete project',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleCreateEpic = async (epicData: {
        title: string;
        description: string;
        status: 'planning' | 'in_progress' | 'completed';
    }) => {
        try {
            await createEpic({
                title: epicData.title,
                description: epicData.description,
                status: epicData.status,
                progress: 0,
                stories: [],
            });
            setShowCreateModal(false);
            toast({
                title: 'Success',
                description: 'Project created successfully',
            });
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to create project',
                variant: 'destructive',
            });
        }
    };

    const exportToCSV = () => {
        const csvContent = [
            ['Title', 'Description', 'Status', 'Progress', 'Created'],
            ...filteredEpics.map((epic) => [
                epic.title,
                epic.description,
                epic.status.replace('_', ' '),
                `${epic.progress}%`,
                formatDistanceToNow(epic.createdAt, { addSuffix: true }),
            ]),
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Show access denied message if user doesn't have permission
    if (!canAccessProjects) {
        return (
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <Card className="bg-card border-border shadow-lg max-w-md mx-auto">
                        <CardContent className="p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                Access Restricted
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                Project management features are currently
                                disabled for managers. Please contact your
                                administrator to enable access.
                            </p>
                            <div className="text-sm text-muted-foreground">
                                Your role:{' '}
                                <span className="font-medium capitalize">
                                    {user?.role?.replace('_', ' ')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader
                title="Projects"
                actions={
                    <>
                        <Button
                            onClick={exportToCSV}
                            variant="outline"
                            size="sm"
                            className="border-border text-foreground hover:bg-accent"
                        >
                            <Download className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="hidden xs:inline">Export</span>
                        </Button>
                        {hasPermission('epics') && (
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                                <span className="hidden xs:inline">Create</span>
                            </Button>
                        )}
                    </>
                }
            />

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-3 sm:p-4 md:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            {/* Search bar - full width */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            {/* Filters - responsive grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                            value="planning"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Planning
                                        </SelectItem>
                                        <SelectItem
                                            value="in_progress"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            In Progress
                                        </SelectItem>
                                        <SelectItem
                                            value="completed"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Completed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Projects Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="bg-card border-border shadow-lg">
                    <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="text-foreground text-base sm:text-lg font-semibold">
                            Projects ({filteredEpics.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        {/* Mobile Card View */}
                        <div className="block sm:hidden">
                            <div className="space-y-3 p-3">
                                {filteredEpics.map((epic) => (
                                    <div
                                        key={epic.id}
                                        className="bg-accent/20 border border-border rounded-lg p-4 space-y-3"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 min-w-0 flex-1">
                                                <div className="font-semibold text-foreground">
                                                    {epic.title}
                                                </div>
                                                <div className="text-sm text-muted-foreground truncate">
                                                    {epic.description}
                                                </div>
                                            </div>
                                            <div className="flex space-x-1 ml-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleViewEpic(epic)
                                                    }
                                                    className="text-primary hover:bg-primary/10 p-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {hasPermission('epics') && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleEditEpic(
                                                                    epic,
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
                                                                handleDeleteEpic(
                                                                    epic,
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

                                        <div className="flex items-center justify-between">
                                            <Badge
                                                style={{
                                                    backgroundColor:
                                                        statusColors[
                                                            epic.status
                                                        ] + '30',
                                                    color: statusColors[
                                                        epic.status
                                                    ],
                                                    border: `1px solid ${
                                                        statusColors[
                                                            epic.status
                                                        ]
                                                    }60`,
                                                }}
                                                className="font-medium text-xs"
                                            >
                                                {epic.status.replace('_', ' ')}
                                            </Badge>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 bg-muted rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${epic.progress}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {epic.progress}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>
                                                {epic.stories?.length || 0}{' '}
                                                stories
                                            </span>
                                            <span>
                                                {formatDistanceToNow(
                                                    epic.createdAt,
                                                    { addSuffix: true },
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
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Title
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Description
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Progress
                                        </TableHead>
                                        <TableHead className="text-muted-foreground font-semibold">
                                            Stories
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
                                    {filteredEpics.map((epic) => (
                                        <TableRow
                                            key={epic.id}
                                            className="border-border hover:bg-accent/50 transition-colors"
                                        >
                                            <TableCell className="text-foreground font-semibold">
                                                {epic.title}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground max-w-xs truncate">
                                                {epic.description}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    style={{
                                                        backgroundColor:
                                                            statusColors[
                                                                epic.status
                                                            ] + '30',
                                                        color: statusColors[
                                                            epic.status
                                                        ],
                                                        border: `1px solid ${
                                                            statusColors[
                                                                epic.status
                                                            ]
                                                        }60`,
                                                    }}
                                                    className="font-medium"
                                                >
                                                    {epic.status.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-20 bg-muted rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${epic.progress}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {epic.progress}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {epic.stories?.length || 0}{' '}
                                                stories
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDistanceToNow(
                                                    epic.createdAt,
                                                    { addSuffix: true },
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleViewEpic(epic)
                                                        }
                                                        className="text-primary hover:bg-primary/10"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    {hasPermission('epics') && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    handleEditEpic(
                                                                        epic,
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
                                                                    handleDeleteEpic(
                                                                        epic,
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

            {/* Create Project Modal */}
            <CreateEpicModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                onCreateEpic={handleCreateEpic}
            />

            {/* Project Detail Modal */}
            {selectedEpic && (
                <EpicDetailModal
                    epic={selectedEpic}
                    open={showDetailModal}
                    onOpenChange={setShowDetailModal}
                />
            )}
        </div>
    );
}
