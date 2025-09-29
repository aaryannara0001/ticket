import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Progress } from '@/components/ui/progress';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { Department, Project, User } from '@/types';
import { motion } from 'framer-motion';
import {
    Building,
    Edit,
    Eye,
    Plus,
    Shield,
    Target,
    Trash2,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PermissionsPage } from './PermissionsPage';

const roleColors = {
    admin: '#EF4444',
    manager: '#F97316',
    team_member: '#4ADE80',
    client: '#8B5CF6',
};

// re-use role/permission definitions from authStore instead of duplicating
// keep this list for reference but prefix with underscore to indicate intentionally unused
const _permissions: any = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        description: 'View dashboard and analytics',
    },
    {
        id: 'tickets',
        name: 'All Tickets',
        description: 'View and manage all tickets',
    },
    {
        id: 'my_tickets',
        name: 'My Tickets',
        description: 'View own tickets only',
    },
    {
        id: 'create_ticket',
        name: 'Create Ticket',
        description: 'Create new tickets',
    },
    { id: 'kanban', name: 'Kanban Board', description: 'Access Kanban board' },
    { id: 'epics', name: 'Epics', description: 'Manage epics and stories' },
    {
        id: 'reports',
        name: 'Reports',
        description: 'View reports and analytics',
    },
    {
        id: 'team_management',
        name: 'Team Management',
        description: 'Manage team members',
    },
    { id: '*', name: 'Full Access', description: 'Complete system access' },
];

// keep rolePermissions here for reference; actual permissions are in authStore
const _rolePermissions: any = {
    admin: ['*'],
    manager: [
        'dashboard',
        'tickets',
        'kanban',
        'epics',
        'reports',
        'team_management',
    ],
    team_member: ['dashboard', 'tickets', 'kanban', 'my_tickets'],
    client: ['my_tickets', 'create_ticket'],
};

export function AdminPage() {
    const {
        projects,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
    } = useProjectStore();
    const [users, setUsers] = useState<User[]>(() =>
        useAuthStore.getState().getUsers(),
    );
    const authStore = useAuthStore();
    useEffect(() => {
        const unsub = useAuthStore.subscribe(() => {
            setUsers(useAuthStore.getState().getUsers());
        });
        return unsub;
    }, []);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingDepartment, setEditingDepartment] =
        useState<Department | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [viewingProject, setViewingProject] = useState<Project | null>(null);

    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        role: '',
        department: '',
        isActive: true,
    });

    const [departmentForm, setDepartmentForm] = useState({
        name: '',
        description: '',
        managerId: '',
    });

    const [projectForm, setProjectForm] = useState({
        title: '',
        description: '',
        status: 'planning' as 'planning' | 'in_progress' | 'completed',
    });

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            await authStore.updateUser(editingUser.id, {
                ...userForm,
                role: userForm.role as User['role'],
            });
        } else {
            await authStore.createUser(
                userForm.name,
                userForm.email,
                'password',
                userForm.role as User['role'],
                userForm.department || undefined,
            );
        }
        resetUserForm();
    };

    const handleDepartmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingDepartment) {
            setDepartments((prev) =>
                prev.map((dept) =>
                    dept.id === editingDepartment.id
                        ? { ...dept, ...departmentForm, members: [] }
                        : dept,
                ),
            );
        } else {
            const newDepartment: Department = {
                id: Date.now().toString(),
                ...departmentForm,
                members: [],
            };
            setDepartments((prev) => [...prev, newDepartment]);
        }
        resetDepartmentForm();
    };

    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            await updateProject(editingProject.id, projectForm);
        } else {
            await createProject({
                ...projectForm,
                stories: [],
                progress: 0,
            });
        }
        resetProjectForm();
    };

    const resetUserForm = () => {
        setUserForm({
            name: '',
            email: '',
            role: '',
            department: '',
            isActive: true,
        });
        setEditingUser(null);
        setShowUserModal(false);
    };

    const resetDepartmentForm = () => {
        setDepartmentForm({
            name: '',
            description: '',
            managerId: '',
        });
        setEditingDepartment(null);
        setShowDepartmentModal(false);
    };

    const resetProjectForm = () => {
        setProjectForm({
            title: '',
            description: '',
            status: 'planning',
        });
        setEditingProject(null);
        setShowProjectModal(false);
    };

    const editUser = (user: User) => {
        setEditingUser(user);
        setUserForm({
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department || '',
            isActive: user.isActive,
        });
        setShowUserModal(true);
    };

    const editDepartment = (department: Department) => {
        setEditingDepartment(department);
        setDepartmentForm({
            name: department.name,
            description: department.description,
            managerId: department.managerId,
        });
        setShowDepartmentModal(true);
    };

    const editProject = (project: Project) => {
        setEditingProject(project);
        setProjectForm({
            title: project.title,
            description: project.description,
            status: project.status,
        });
        setShowProjectModal(true);
    };

    const viewProject = (project: Project) => {
        setViewingProject(project);
    };

    const toggleUserStatus = async (userId: string) => {
        const user = useAuthStore
            .getState()
            .getUsers()
            .find((u) => u.id === userId);
        if (!user) return;
        await authStore.updateUser(userId, { isActive: !user.isActive });
    };

    const deleteUser = async (userId: string) => {
        await authStore.deleteUser(userId);
    };

    const deleteDepartment = (departmentId: string) => {
        setDepartments((prev) =>
            prev.filter((dept) => dept.id !== departmentId),
        );
    };

    const deleteProjectHandler = async (projectId: string) => {
        await deleteProject(projectId);
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            ></motion.div>

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-muted">
                    <TabsTrigger
                        value="users"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Users
                    </TabsTrigger>
                    <TabsTrigger
                        value="departments"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                        <Building className="w-4 h-4 mr-2" />
                        Departments
                    </TabsTrigger>
                    <TabsTrigger
                        value="projects"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                        <Target className="w-4 h-4 mr-2" />
                        Projects
                    </TabsTrigger>
                    <TabsTrigger
                        value="permissions"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Permissions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-foreground">
                                        User Management
                                    </CardTitle>
                                    <Button
                                        onClick={() => setShowUserModal(true)}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add User
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border">
                                            <TableHead className="text-muted-foreground">
                                                User
                                            </TableHead>
                                            <TableHead className="text-muted-foreground">
                                                Email
                                            </TableHead>
                                            <TableHead className="text-muted-foreground">
                                                Role
                                            </TableHead>
                                            <TableHead className="text-muted-foreground">
                                                Department
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
                                        {users.map((user) => (
                                            <TableRow
                                                key={user.id}
                                                className="border-border"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage
                                                                src={
                                                                    user.avatar
                                                                }
                                                            />
                                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                                {user.name.charAt(
                                                                    0,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-foreground">
                                                            {user.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        style={{
                                                            backgroundColor:
                                                                roleColors[
                                                                    user.role
                                                                ] + '20',
                                                            color: roleColors[
                                                                user.role
                                                            ],
                                                            border: `1px solid ${
                                                                roleColors[
                                                                    user.role
                                                                ]
                                                            }40`,
                                                        }}
                                                    >
                                                        {user.role.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {user.department}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            checked={
                                                                user.isActive
                                                            }
                                                            onCheckedChange={() =>
                                                                toggleUserStatus(
                                                                    user.id,
                                                                )
                                                            }
                                                        />
                                                        <span
                                                            className={
                                                                user.isActive
                                                                    ? 'text-primary'
                                                                    : 'text-muted-foreground'
                                                            }
                                                        >
                                                            {user.isActive
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                editUser(user)
                                                            }
                                                            className="text-primary hover:bg-primary/10"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                deleteUser(
                                                                    user.id,
                                                                )
                                                            }
                                                            className="text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="departments" className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-foreground">
                                        Department Management
                                    </CardTitle>
                                    <Button
                                        onClick={() =>
                                            setShowDepartmentModal(true)
                                        }
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Department
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {departments.map((department) => {
                                        const manager = users.find(
                                            (u) =>
                                                u.id === department.managerId,
                                        );
                                        const memberCount = users.filter(
                                            (u) =>
                                                u.department ===
                                                department.name,
                                        ).length;

                                        return (
                                            <Card
                                                key={department.id}
                                                className="bg-muted border-border"
                                            >
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-foreground text-lg">
                                                            {department.name}
                                                        </CardTitle>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    editDepartment(
                                                                        department,
                                                                    )
                                                                }
                                                                className="text-primary hover:bg-primary/10"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    deleteDepartment(
                                                                        department.id,
                                                                    )
                                                                }
                                                                className="text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <p className="text-muted-foreground text-sm">
                                                        {department.description}
                                                    </p>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-muted-foreground text-sm">
                                                                Manager:
                                                            </span>
                                                            <span className="text-foreground text-sm">
                                                                {manager?.name ||
                                                                    'Not assigned'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-muted-foreground text-sm">
                                                                Members:
                                                            </span>
                                                            <span className="text-foreground text-sm">
                                                                {memberCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="projects" className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-foreground">
                                        Project Management
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border">
                                            <TableHead className="text-muted-foreground">
                                                Project
                                            </TableHead>
                                            <TableHead className="text-muted-foreground">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-muted-foreground">
                                                Progress
                                            </TableHead>
                                            <TableHead className="text-muted-foreground">
                                                Stories
                                            </TableHead>
                                            <TableHead className="text-muted-foreground">
                                                Created
                                            </TableHead>
                                            <TableHead className="text-muted-foreground">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projects.map((project) => (
                                            <TableRow
                                                key={project.id}
                                                className="border-border"
                                            >
                                                <TableCell>
                                                    <div>
                                                        <div className="text-foreground font-medium">
                                                            {project.title}
                                                        </div>
                                                        <div className="text-muted-foreground text-sm max-w-xs truncate">
                                                            {
                                                                project.description
                                                            }
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            project.status ===
                                                            'completed'
                                                                ? 'default'
                                                                : project.status ===
                                                                  'in_progress'
                                                                ? 'secondary'
                                                                : 'outline'
                                                        }
                                                        className={
                                                            project.status ===
                                                            'completed'
                                                                ? 'bg-green-100 text-green-800 border-green-200'
                                                                : project.status ===
                                                                  'in_progress'
                                                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                                : 'bg-gray-100 text-gray-800 border-gray-200'
                                                        }
                                                    >
                                                        {project.status.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Progress
                                                            value={
                                                                project.progress
                                                            }
                                                            className="w-16"
                                                        />
                                                        <span className="text-sm text-muted-foreground">
                                                            {project.progress}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {project.stories.length}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(
                                                        project.createdAt,
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                viewProject(
                                                                    project,
                                                                )
                                                            }
                                                            className="text-primary hover:bg-primary/10"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                editProject(
                                                                    project,
                                                                )
                                                            }
                                                            className="text-primary hover:bg-primary/10"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                deleteProjectHandler(
                                                                    project.id,
                                                                )
                                                            }
                                                            className="text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {projects.length === 0 && (
                                    <div className="text-center py-8">
                                        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            No projects found. Create your first
                                            project to get started.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-6">
                    <PermissionsPage />
                </TabsContent>
            </Tabs>

            {/* User Modal */}
            <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                <DialogContent className="bg-popover border-border">
                    <DialogHeader>
                        <DialogTitle className="text-popover-foreground">
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label
                                    htmlFor="name"
                                    className="text-popover-foreground"
                                >
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={userForm.name}
                                    onChange={(e) =>
                                        setUserForm((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    className="bg-background border-border text-foreground"
                                    required
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor="email"
                                    className="text-popover-foreground"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) =>
                                        setUserForm((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    className="bg-background border-border text-foreground"
                                    required
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor="role"
                                    className="text-popover-foreground"
                                >
                                    Role
                                </Label>
                                <Select
                                    value={userForm.role}
                                    onValueChange={(value) =>
                                        setUserForm((prev) => ({
                                            ...prev,
                                            role: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                                        <SelectValue
                                            placeholder="Select role"
                                            className="text-foreground"
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border">
                                        <SelectItem
                                            value="admin"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Admin
                                        </SelectItem>
                                        <SelectItem
                                            value="manager"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Manager
                                        </SelectItem>
                                        <SelectItem
                                            value="team_member"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Team Member
                                        </SelectItem>
                                        <SelectItem
                                            value="client"
                                            className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                        >
                                            Client
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label
                                    htmlFor="department"
                                    className="text-popover-foreground"
                                >
                                    Department
                                </Label>
                                <Input
                                    id="department"
                                    value={userForm.department}
                                    onChange={(e) =>
                                        setUserForm((prev) => ({
                                            ...prev,
                                            department: e.target.value,
                                        }))
                                    }
                                    className="bg-background border-border text-foreground"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={userForm.isActive}
                                onCheckedChange={(checked) =>
                                    setUserForm((prev) => ({
                                        ...prev,
                                        isActive: checked,
                                    }))
                                }
                            />
                            <Label className="text-popover-foreground">
                                Active
                            </Label>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetUserForm}
                                className="border-border text-foreground hover:bg-accent"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {editingUser ? 'Update' : 'Create'} User
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Department Modal */}
            <Dialog
                open={showDepartmentModal}
                onOpenChange={setShowDepartmentModal}
            >
                <DialogContent className="bg-popover border-border">
                    <DialogHeader>
                        <DialogTitle className="text-popover-foreground">
                            {editingDepartment
                                ? 'Edit Department'
                                : 'Add New Department'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleDepartmentSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <Label
                                htmlFor="deptName"
                                className="text-popover-foreground"
                            >
                                Name
                            </Label>
                            <Input
                                id="deptName"
                                value={departmentForm.name}
                                onChange={(e) =>
                                    setDepartmentForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className="bg-background border-border text-foreground"
                                required
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="description"
                                className="text-popover-foreground"
                            >
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={departmentForm.description}
                                onChange={(e) =>
                                    setDepartmentForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className="bg-background border-border text-foreground"
                                required
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="manager"
                                className="text-popover-foreground"
                            >
                                Manager
                            </Label>
                            <Select
                                value={departmentForm.managerId}
                                onValueChange={(value) =>
                                    setDepartmentForm((prev) => ({
                                        ...prev,
                                        managerId: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                                    <SelectValue
                                        placeholder="Select manager"
                                        className="text-foreground"
                                    />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    {users
                                        .filter(
                                            (u) =>
                                                u.role === 'admin' ||
                                                u.role === 'manager',
                                        )
                                        .map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={user.id}
                                                className="text-popover-foreground hover:bg-accent focus:bg-accent"
                                            >
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetDepartmentForm}
                                className="border-border text-foreground hover:bg-accent"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {editingDepartment ? 'Update' : 'Create'}{' '}
                                Department
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Project Modal */}
            <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
                <DialogContent className="bg-popover border-border">
                    <DialogHeader>
                        <DialogTitle className="text-popover-foreground">
                            {editingProject
                                ? 'Edit Project'
                                : 'Add New Project'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProjectSubmit} className="space-y-4">
                        <div>
                            <Label
                                htmlFor="projectTitle"
                                className="text-popover-foreground"
                            >
                                Title
                            </Label>
                            <Input
                                id="projectTitle"
                                value={projectForm.title}
                                onChange={(e) =>
                                    setProjectForm((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                                className="bg-background border-border text-foreground"
                                required
                                disabled
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="projectDescription"
                                className="text-popover-foreground"
                            >
                                Description
                            </Label>
                            <Textarea
                                id="projectDescription"
                                value={projectForm.description}
                                onChange={(e) =>
                                    setProjectForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className="bg-background border-border text-foreground"
                                required
                                disabled
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="projectStatus"
                                className="text-popover-foreground"
                            >
                                Status
                            </Label>
                            <Select
                                value={projectForm.status}
                                onValueChange={(
                                    value:
                                        | 'planning'
                                        | 'in_progress'
                                        | 'completed',
                                ) =>
                                    setProjectForm((prev) => ({
                                        ...prev,
                                        status: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                                    <SelectValue
                                        placeholder="Select status"
                                        className="text-foreground"
                                    />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
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
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetProjectForm}
                                className="border-border text-foreground hover:bg-accent"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {editingProject ? 'Update' : 'Create'} Project
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Project Detail Modal */}
            <Dialog
                open={!!viewingProject}
                onOpenChange={() => setViewingProject(null)}
            >
                <DialogContent className="bg-popover border-border max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-popover-foreground">
                            Project Details
                        </DialogTitle>
                    </DialogHeader>
                    {viewingProject && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-popover-foreground">
                                    {viewingProject.title}
                                </h3>
                                <p className="text-muted-foreground mt-2">
                                    {viewingProject.description}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-popover-foreground">
                                        Status
                                    </Label>
                                    <div className="mt-1">
                                        <Badge
                                            variant={
                                                viewingProject.status ===
                                                'completed'
                                                    ? 'default'
                                                    : viewingProject.status ===
                                                      'in_progress'
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                            className={
                                                viewingProject.status ===
                                                'completed'
                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                    : viewingProject.status ===
                                                      'in_progress'
                                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                            }
                                        >
                                            {viewingProject.status.replace(
                                                '_',
                                                ' ',
                                            )}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-popover-foreground">
                                        Progress
                                    </Label>
                                    <div className="mt-1 flex items-center space-x-2">
                                        <Progress
                                            value={viewingProject.progress}
                                            className="w-16"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {viewingProject.progress}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {viewingProject.stories.length > 0 && (
                                <div>
                                    <Label className="text-popover-foreground">
                                        Stories
                                    </Label>
                                    <div className="mt-2 space-y-2">
                                        {viewingProject.stories.map((story) => (
                                            <Card
                                                key={story.id}
                                                className="bg-background border-border"
                                            >
                                                <CardContent className="p-3">
                                                    <h4 className="font-medium text-foreground">
                                                        {story.title}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {story.description}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <Badge
                                                            variant={
                                                                story.completed
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {story.completed
                                                                ? 'Completed'
                                                                : 'In Progress'}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {
                                                                story.subTasks
                                                                    .length
                                                            }{' '}
                                                            sub-tasks
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
