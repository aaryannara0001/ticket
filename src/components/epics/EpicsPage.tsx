import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { motion } from 'framer-motion';
import {
    BookOpen,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Circle,
    Plus,
    Shield,
    Target,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CreateStoryModal } from '../projects/CreateStoryModal';
import { CreateSubTaskModal } from '../projects/CreateSubTaskModal';
import { CreateProjectModal } from './CreateProjectModal';

const statusColors = {
    planning: '#6B7280',
    in_progress: '#FACC15',
    completed: '#4ADE80',
};

export function EpicsPage() {
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
        new Set(['1']),
    );
    const [expandedStories, setExpandedStories] = useState<Set<string>>(
        new Set(),
    );
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
    const [showCreateSubTaskModal, setShowCreateSubTaskModal] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [selectedStoryId, setSelectedStoryId] = useState<string>('');
    const [selectedStoryTitle, setSelectedStoryTitle] = useState<string>('');

    const {
        projects,
        fetchProjects,
        createProject,
        addStoryToProject,
        addSubTaskToStory,
        updateSubTask,
    } = useProjectStore();
    const { user } = useAuthStore();
    const { isFeatureEnabledForRole } = useSettingsStore();

    // Check if user has actual permission to access projects
    const canAccessProjects =
        user?.role === 'admin' ||
        isFeatureEnabledForRole('projectManagement', user?.role || '');

    // Check if user can manage a specific project (admin or assigned manager)
    const canManageProject = (project: any) => {
        return (
            user?.role === 'admin' ||
            (user?.role === 'manager' && project.managerId === user.id)
        );
    };

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleCreateProject = async (projectData: {
        title: string;
        description: string;
        status: 'planning' | 'in_progress' | 'completed';
    }) => {
        await createProject({
            title: projectData.title,
            description: projectData.description,
            status: projectData.status,
            progress: 0,
            stories: [],
        });
        setShowCreateModal(false);
    };

    const handleCreateStory = async (storyData: {
        title: string;
        description: string;
        acceptanceCriteria: string[];
    }) => {
        try {
            await addStoryToProject(selectedProjectId, {
                title: storyData.title,
                description: storyData.description,
                acceptanceCriteria: storyData.acceptanceCriteria,
                subTasks: [],
                completed: false,
            });
            setShowCreateStoryModal(false);
            setSelectedProjectId('');
            toast({
                title: 'Success',
                description: 'Story created successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create story',
                variant: 'destructive',
            });
        }
    };

    const handleCreateSubTaskSubmit = async (subTaskData: {
        title: string;
        description?: string;
    }) => {
        try {
            await addSubTaskToStory(selectedProjectId, selectedStoryId, {
                title: subTaskData.title,
                completed: false,
            });
            setShowCreateSubTaskModal(false);
            setSelectedProjectId('');
            setSelectedStoryId('');
            setSelectedStoryTitle('');
            toast({
                title: 'Success',
                description: 'Sub-task created successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create sub-task',
                variant: 'destructive',
            });
        }
    };

    const handleSubTaskToggle = async (
        projectId: string,
        storyId: string,
        subTaskId: string,
        completed: boolean,
    ) => {
        try {
            await updateSubTask(projectId, storyId, subTaskId, { completed });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update sub-task',
                variant: 'destructive',
            });
        }
    };

    const openCreateStoryModal = (projectId: string) => {
        setSelectedProjectId(projectId);
        setShowCreateStoryModal(true);
    };

    const openCreateSubTaskModal = (
        projectId: string,
        storyId: string,
        storyTitle: string,
    ) => {
        setSelectedProjectId(projectId);
        setSelectedStoryId(storyId);
        setSelectedStoryTitle(storyTitle);
        setShowCreateSubTaskModal(true);
    };

    const toggleProject = (projectId: string) => {
        const newExpanded = new Set(expandedProjects);
        if (newExpanded.has(projectId)) {
            newExpanded.delete(projectId);
        } else {
            newExpanded.add(projectId);
        }
        setExpandedProjects(newExpanded);
    };

    const toggleStory = (storyId: string) => {
        const newExpanded = new Set(expandedStories);
        if (newExpanded.has(storyId)) {
            newExpanded.delete(storyId);
        } else {
            newExpanded.add(storyId);
        }
        setExpandedStories(newExpanded);
    };

    // Show access denied message if user doesn't have permission
    if (!canAccessProjects) {
        return (
            <div className="space-y-6">
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
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Projects & Stories
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage projects, stories, and sub-tasks
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                </Button>
            </motion.div>

            <div className="space-y-6">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                toggleProject(project.id)
                                            }
                                            className="text-foreground hover:bg-accent p-1"
                                        >
                                            {expandedProjects.has(
                                                project.id,
                                            ) ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <BookOpen className="w-6 h-6 text-primary" />
                                        <div>
                                            <CardTitle className="text-foreground text-xl">
                                                {project.title}
                                            </CardTitle>
                                            <p className="text-muted-foreground text-sm mt-1">
                                                {project.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {canManageProject(project) && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    openCreateStoryModal(
                                                        project.id,
                                                    )
                                                }
                                                className="border-primary text-primary hover:bg-primary/10"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add Story
                                            </Button>
                                        )}
                                        <Badge
                                            style={{
                                                backgroundColor:
                                                    statusColors[
                                                        project.status
                                                    ] + '20',
                                                color: statusColors[
                                                    project.status
                                                ],
                                                border: `1px solid ${
                                                    statusColors[project.status]
                                                }40`,
                                            }}
                                        >
                                            {project.status.replace('_', ' ')}
                                        </Badge>
                                        <div className="text-right">
                                            <div className="text-foreground font-medium">
                                                {project.progress}%
                                            </div>
                                            <Progress
                                                value={project.progress}
                                                className="w-24 h-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <Collapsible
                                open={expandedProjects.has(project.id)}
                            >
                                <CollapsibleContent>
                                    <CardContent className="pt-0">
                                        <div className="space-y-4">
                                            {project.stories.map((story) => (
                                                <Card
                                                    key={story.id}
                                                    className="bg-secondary border-border"
                                                >
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        toggleStory(
                                                                            story.id,
                                                                        )
                                                                    }
                                                                    className="text-foreground hover:bg-accent p-1"
                                                                >
                                                                    {expandedStories.has(
                                                                        story.id,
                                                                    ) ? (
                                                                        <ChevronDown className="w-4 h-4" />
                                                                    ) : (
                                                                        <ChevronRight className="w-4 h-4" />
                                                                    )}
                                                                </Button>
                                                                {story.completed ? (
                                                                    <CheckCircle className="w-5 h-5 text-primary" />
                                                                ) : (
                                                                    <Circle className="w-5 h-5 text-muted-foreground" />
                                                                )}
                                                                <div>
                                                                    <h4 className="text-foreground font-medium">
                                                                        {
                                                                            story.title
                                                                        }
                                                                    </h4>
                                                                    <p className="text-muted-foreground text-sm">
                                                                        {
                                                                            story.description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                {canManageProject(
                                                                    project,
                                                                ) && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() =>
                                                                            openCreateSubTaskModal(
                                                                                project.id,
                                                                                story.id,
                                                                                story.title,
                                                                            )
                                                                        }
                                                                        className="text-primary hover:bg-primary/10"
                                                                    >
                                                                        <Plus className="w-3 h-3 mr-1" />
                                                                        Add
                                                                        Sub-task
                                                                    </Button>
                                                                )}
                                                                <div className="text-muted-foreground text-sm">
                                                                    {
                                                                        story.subTasks.filter(
                                                                            (
                                                                                t,
                                                                            ) =>
                                                                                t.completed,
                                                                        ).length
                                                                    }
                                                                    /
                                                                    {
                                                                        story
                                                                            .subTasks
                                                                            .length
                                                                    }{' '}
                                                                    tasks
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardHeader>

                                                    <Collapsible
                                                        open={expandedStories.has(
                                                            story.id,
                                                        )}
                                                    >
                                                        <CollapsibleContent>
                                                            <CardContent className="pt-0 space-y-4">
                                                                {/* Acceptance Criteria */}
                                                                <div>
                                                                    <h5 className="text-foreground font-medium mb-2 flex items-center">
                                                                        <Target className="w-4 h-4 mr-2 text-primary" />
                                                                        Acceptance
                                                                        Criteria
                                                                    </h5>
                                                                    <div className="space-y-2">
                                                                        {story.acceptanceCriteria.map(
                                                                            (
                                                                                criteria,
                                                                                index,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="flex items-start space-x-2"
                                                                                >
                                                                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                                                                    <p className="text-muted-foreground text-sm">
                                                                                        {
                                                                                            criteria
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Sub-tasks */}
                                                                <div>
                                                                    <h5 className="text-foreground font-medium mb-2">
                                                                        Sub-tasks
                                                                    </h5>
                                                                    <div className="space-y-2">
                                                                        {story.subTasks.map(
                                                                            (
                                                                                subTask,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        subTask.id
                                                                                    }
                                                                                    className="flex items-center space-x-3 p-2 bg-card rounded-lg"
                                                                                >
                                                                                    <Checkbox
                                                                                        checked={
                                                                                            subTask.completed
                                                                                        }
                                                                                        onCheckedChange={(
                                                                                            checked,
                                                                                        ) =>
                                                                                            handleSubTaskToggle(
                                                                                                project.id,
                                                                                                story.id,
                                                                                                subTask.id,
                                                                                                !!checked,
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            !canManageProject(
                                                                                                project,
                                                                                            )
                                                                                        }
                                                                                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                                    />
                                                                                    <span
                                                                                        className={`text-sm flex-1 ${
                                                                                            subTask.completed
                                                                                                ? 'text-muted-foreground line-through'
                                                                                                : 'text-foreground'
                                                                                        }`}
                                                                                    >
                                                                                        {
                                                                                            subTask.title
                                                                                        }
                                                                                    </span>
                                                                                    {subTask.ticketId && (
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className="text-xs border-primary text-primary"
                                                                                        >
                                                                                            PROJ-
                                                                                            {
                                                                                                subTask.ticketId
                                                                                            }
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                onCreateProject={handleCreateProject}
            />

            {/* Create Story Modal */}
            <CreateStoryModal
                open={showCreateStoryModal}
                onOpenChange={setShowCreateStoryModal}
                onCreateStory={handleCreateStory}
            />

            {/* Create Sub-task Modal */}
            <CreateSubTaskModal
                open={showCreateSubTaskModal}
                onOpenChange={setShowCreateSubTaskModal}
                onCreateSubTask={handleCreateSubTaskSubmit}
                storyTitle={selectedStoryTitle}
            />
        </div>
    );
}
