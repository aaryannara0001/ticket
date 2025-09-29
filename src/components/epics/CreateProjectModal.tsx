import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { User } from '@/types';
import {
    Calendar,
    Check,
    ChevronDown,
    Clock,
    Target,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateProject: (project: {
        title: string;
        description: string;
        status: 'planning' | 'in_progress' | 'completed';
        priority: 'low' | 'medium' | 'high' | 'critical';
        category: string;
        estimatedDuration: string;
        assignedTeam: string;
        assignedMembers: string[];
        objectives: string[];
        deliverables: string[];
    }) => void;
}

// Mock team members organized by team structure
const mockTeamMembers: User[] = [
    // Developer Team
    {
        id: '1',
        name: 'John Frontend Dev',
        email: 'john.frontend@company.com',
        role: 'team_member',
        department: 'Developer Team',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '2',
        name: 'Sarah Backend Dev',
        email: 'sarah.backend@company.com',
        role: 'team_member',
        department: 'Developer Team',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '3',
        name: 'Mike Full Stack',
        email: 'mike.fullstack@company.com',
        role: 'team_member',
        department: 'Developer Team',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '4',
        name: 'Alice Mobile Dev',
        email: 'alice.mobile@company.com',
        role: 'team_member',
        department: 'Developer Team',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    // IT Team
    {
        id: '5',
        name: 'Bob System Admin',
        email: 'bob.sysadmin@company.com',
        role: 'admin',
        department: 'IT Team',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '6',
        name: 'Emma DevOps',
        email: 'emma.devops@company.com',
        role: 'manager',
        department: 'IT Team',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '7',
        name: 'David Network Admin',
        email: 'david.network@company.com',
        role: 'team_member',
        department: 'IT Team',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    // Support Team
    {
        id: '8',
        name: 'Lisa Support Lead',
        email: 'lisa.support@company.com',
        role: 'manager',
        department: 'Support Team',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '9',
        name: 'Tom Customer Support',
        email: 'tom.customer@company.com',
        role: 'team_member',
        department: 'Support Team',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '10',
        name: 'Anna QA Support',
        email: 'anna.qa@company.com',
        role: 'team_member',
        department: 'Support Team',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '11',
        name: 'Ryan Help Desk',
        email: 'ryan.helpdesk@company.com',
        role: 'team_member',
        department: 'Support Team',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
];

export function CreateProjectModal({
    open,
    onOpenChange,
    onCreateProject,
}: CreateProjectModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'planning' as 'planning' | 'in_progress' | 'completed',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
        category: '',
        estimatedDuration: '',
        assignedTeam: '',
        assignedMembers: [] as string[],
        objectives: [''],
        deliverables: [''],
    });
    const [loading, setLoading] = useState(false);
    const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);

    // Clear selected members when team changes
    useEffect(() => {
        if (formData.assignedTeam) {
            // Clear assigned members when team changes to avoid inconsistency
            setFormData((prev) => ({
                ...prev,
                assignedMembers: [],
            }));
        }
    }, [formData.assignedTeam]);

    // Map team values to department names
    const getTeamDepartmentName = (teamValue: string) => {
        switch (teamValue) {
            case 'developer':
                return 'Developer Team';
            case 'it':
                return 'IT Team';
            case 'support':
                return 'Support Team';
            default:
                return '';
        }
    };

    // Filter available team members based on selected team
    const availableMembers = mockTeamMembers.filter((member) => {
        // Exclude clients and inactive members
        if (member.role === 'client' || !member.isActive) {
            return false;
        }

        // If no team is selected, show no members
        if (!formData.assignedTeam) {
            return false;
        }

        // Only show members from the selected team
        const selectedDepartment = getTeamDepartmentName(formData.assignedTeam);
        return member.department === selectedDepartment;
    });

    // Group members by department for better organization (though now it will only be one department)
    const membersByDepartment = availableMembers.reduce((acc, member) => {
        const department = member.department || 'Other';
        if (!acc[department]) {
            acc[department] = [];
        }
        acc[department].push(member);
        return acc;
    }, {} as Record<string, User[]>);

    // Get selected members for display
    const selectedMembers = availableMembers.filter((member) =>
        formData.assignedMembers.includes(member.id),
    );

    const toggleMemberSelection = (memberId: string) => {
        setFormData((prev) => ({
            ...prev,
            assignedMembers: prev.assignedMembers.includes(memberId)
                ? prev.assignedMembers.filter((id) => id !== memberId)
                : [...prev.assignedMembers, memberId],
        }));
    };

    const removeMember = (memberId: string) => {
        setFormData((prev) => ({
            ...prev,
            assignedMembers: prev.assignedMembers.filter(
                (id) => id !== memberId,
            ),
        }));
    };

    const getDepartmentColor = (department: string) => {
        switch (department) {
            case 'Developer Team':
                return 'text-blue-600 bg-blue-50';
            case 'IT Team':
                return 'text-green-600 bg-green-50';
            case 'Support Team':
                return 'text-purple-600 bg-purple-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const addObjective = () => {
        setFormData((prev) => ({
            ...prev,
            objectives: [...prev.objectives, ''],
        }));
    };

    const removeObjective = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            objectives: prev.objectives.filter((_, i) => i !== index),
        }));
    };

    const updateObjective = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            objectives: prev.objectives.map((obj, i) =>
                i === index ? value : obj,
            ),
        }));
    };

    const addDeliverable = () => {
        setFormData((prev) => ({
            ...prev,
            deliverables: [...prev.deliverables, ''],
        }));
    };

    const removeDeliverable = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            deliverables: prev.deliverables.filter((_, i) => i !== index),
        }));
    };

    const updateDeliverable = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            deliverables: prev.deliverables.map((del, i) =>
                i === index ? value : del,
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !formData.title ||
            !formData.description ||
            !formData.category ||
            !formData.estimatedDuration
        ) {
            toast({
                title: 'Validation Error',
                description:
                    'Please fill in all required fields (Title, Description, Category, and Estimated Duration)',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            // Log the complete project payload to console
            console.log('📋 Project Creation:', {
                ...formData,
                selectedMembersDetails: selectedMembers.map((member) => ({
                    id: member.id,
                    name: member.name,
                    department: member.department,
                    role: member.role,
                })),
                membersByTeam: {
                    developerTeam: selectedMembers.filter(
                        (m) => m.department === 'Developer Team',
                    ).length,
                    itTeam: selectedMembers.filter(
                        (m) => m.department === 'IT Team',
                    ).length,
                    supportTeam: selectedMembers.filter(
                        (m) => m.department === 'Support Team',
                    ).length,
                },
                timestamp: new Date().toISOString(),
            });

            onCreateProject(formData);
            toast({
                title: 'Success',
                description: 'Project created successfully',
            });

            // Reset form
            setFormData({
                title: '',
                description: '',
                status: 'planning',
                priority: 'medium',
                category: '',
                estimatedDuration: '',
                assignedTeam: '',
                assignedMembers: [],
                objectives: [''],
                deliverables: [''],
            });
            onOpenChange(false);
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to create project',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-popover border-border max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-popover-foreground text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary" />
                        Create New Project
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-2">
                        Set up a comprehensive project with detailed planning
                        and objectives
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Project Information */}
                    <Card className="bg-muted/30 border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-4 h-4 text-primary" />
                                <h3 className="text-lg font-semibold text-foreground">
                                    Project Overview
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label
                                        htmlFor="title"
                                        className="text-popover-foreground font-medium flex items-center gap-1"
                                    >
                                        Project Title{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                title: e.target.value,
                                            }))
                                        }
                                        className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary placeholder-muted-foreground"
                                        placeholder="e.g., Customer Management System Redesign"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="category"
                                        className="text-popover-foreground font-medium flex items-center gap-1"
                                    >
                                        Category{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                category: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem value="web-development">
                                                Web Development
                                            </SelectItem>
                                            <SelectItem value="mobile-app">
                                                Mobile Application
                                            </SelectItem>
                                            <SelectItem value="infrastructure">
                                                Infrastructure
                                            </SelectItem>
                                            <SelectItem value="data-analysis">
                                                Data Analysis
                                            </SelectItem>
                                            <SelectItem value="design">
                                                Design & UX
                                            </SelectItem>
                                            <SelectItem value="integration">
                                                System Integration
                                            </SelectItem>
                                            <SelectItem value="research">
                                                Research & Development
                                            </SelectItem>
                                            <SelectItem value="maintenance">
                                                Maintenance
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="priority"
                                        className="text-popover-foreground font-medium"
                                    >
                                        Priority Level
                                    </Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(
                                            value:
                                                | 'low'
                                                | 'medium'
                                                | 'high'
                                                | 'critical',
                                        ) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                priority: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem value="low">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-gray-100 text-gray-800 border-gray-200"
                                                    >
                                                        Low
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-blue-100 text-blue-800 border-blue-200"
                                                    >
                                                        Medium
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="high">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-orange-100 text-orange-800 border-orange-200"
                                                    >
                                                        High
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="critical">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-red-100 text-red-800 border-red-200"
                                                    >
                                                        Critical
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="estimatedDuration"
                                        className="text-popover-foreground font-medium flex items-center gap-1"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Estimated Duration{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={formData.estimatedDuration}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                estimatedDuration: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem value="1-2 weeks">
                                                1-2 weeks
                                            </SelectItem>
                                            <SelectItem value="3-4 weeks">
                                                3-4 weeks
                                            </SelectItem>
                                            <SelectItem value="1-2 months">
                                                1-2 months
                                            </SelectItem>
                                            <SelectItem value="3-6 months">
                                                3-6 months
                                            </SelectItem>
                                            <SelectItem value="6+ months">
                                                6+ months
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="assignedTeam"
                                        className="text-popover-foreground font-medium flex items-center gap-1"
                                    >
                                        <Users className="w-4 h-4" />
                                        Assigned Team
                                    </Label>
                                    <Select
                                        value={formData.assignedTeam}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                assignedTeam: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                                            <SelectValue placeholder="Select team" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem value="developer">
                                                Developer Team
                                            </SelectItem>
                                            <SelectItem value="it">
                                                IT Team
                                            </SelectItem>
                                            <SelectItem value="support">
                                                Support Team
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Team Member Selection Section */}
                                <div className="space-y-4 col-span-2 bg-muted/30 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" />
                                        <h4 className="text-sm font-semibold text-foreground">
                                            Assign Team Members
                                        </h4>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-foreground font-medium text-sm">
                                            Select Individual Team Members
                                        </Label>
                                        {!formData.assignedTeam ? (
                                            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border border-dashed">
                                                Please select a team above first
                                                to choose individual members
                                            </div>
                                        ) : (
                                            <Popover
                                                open={isTeamSelectorOpen}
                                                onOpenChange={
                                                    setIsTeamSelectorOpen
                                                }
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className="w-full justify-between bg-background border-border text-foreground hover:bg-accent"
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            {selectedMembers.length >
                                                            0
                                                                ? `${
                                                                      selectedMembers.length
                                                                  } member${
                                                                      selectedMembers.length !==
                                                                      1
                                                                          ? 's'
                                                                          : ''
                                                                  } selected`
                                                                : `Select from ${getTeamDepartmentName(
                                                                      formData.assignedTeam,
                                                                  )}...`}
                                                        </div>
                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-0 bg-popover border-border">
                                                    <div className="p-2">
                                                        <div className="text-sm font-medium text-popover-foreground mb-2 px-2">
                                                            Available Team
                                                            Members
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto">
                                                            {Object.entries(
                                                                membersByDepartment,
                                                            ).map(
                                                                ([
                                                                    department,
                                                                    members,
                                                                ]) => (
                                                                    <div
                                                                        key={
                                                                            department
                                                                        }
                                                                        className="mb-3"
                                                                    >
                                                                        <div
                                                                            className={`text-xs font-semibold px-2 py-1 rounded-md mb-2 ${getDepartmentColor(
                                                                                department,
                                                                            )}`}
                                                                        >
                                                                            {
                                                                                department
                                                                            }{' '}
                                                                            (
                                                                            {
                                                                                members.length
                                                                            }{' '}
                                                                            members)
                                                                        </div>
                                                                        {members.map(
                                                                            (
                                                                                member,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        member.id
                                                                                    }
                                                                                    className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent cursor-pointer ml-2"
                                                                                    onClick={() =>
                                                                                        toggleMemberSelection(
                                                                                            member.id,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Checkbox
                                                                                        id={`member-${member.id}`}
                                                                                        checked={formData.assignedMembers.includes(
                                                                                            member.id,
                                                                                        )}
                                                                                        onChange={() =>
                                                                                            toggleMemberSelection(
                                                                                                member.id,
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                    <div className="flex items-center space-x-2 flex-1">
                                                                                        {member.avatar && (
                                                                                            <img
                                                                                                src={
                                                                                                    member.avatar
                                                                                                }
                                                                                                alt={
                                                                                                    member.name
                                                                                                }
                                                                                                className="w-5 h-5 rounded-full object-cover"
                                                                                            />
                                                                                        )}
                                                                                        <div className="flex flex-col">
                                                                                            <span className="text-sm font-medium text-popover-foreground">
                                                                                                {
                                                                                                    member.name
                                                                                                }
                                                                                            </span>
                                                                                            <span className="text-xs text-muted-foreground">
                                                                                                {member.role.replace(
                                                                                                    '_',
                                                                                                    ' ',
                                                                                                )}{' '}
                                                                                                •
                                                                                                ID:{' '}
                                                                                                {
                                                                                                    member.id
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                    {formData.assignedMembers.includes(
                                                                                        member.id,
                                                                                    ) && (
                                                                                        <Check className="w-4 h-4 text-primary" />
                                                                                    )}
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </div>

                                    {/* Selected Members Display */}
                                    {selectedMembers.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-foreground font-medium text-sm">
                                                Selected Team Members (
                                                {selectedMembers.length})
                                            </Label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedMembers.map(
                                                    (member) => (
                                                        <Badge
                                                            key={member.id}
                                                            variant="secondary"
                                                            className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs"
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {member.avatar && (
                                                                    <img
                                                                        src={
                                                                            member.avatar
                                                                        }
                                                                        alt={
                                                                            member.name
                                                                        }
                                                                        className="w-3 h-3 rounded-full object-cover"
                                                                    />
                                                                )}
                                                                <span>
                                                                    {
                                                                        member.name
                                                                    }
                                                                </span>
                                                                <span className="text-xs opacity-70">
                                                                    (
                                                                    {
                                                                        member.department
                                                                    }
                                                                    )
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeMember(
                                                                            member.id,
                                                                        )
                                                                    }
                                                                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                                                                >
                                                                    <X className="w-2 h-2" />
                                                                </button>
                                                            </div>
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="status"
                                        className="text-popover-foreground font-medium"
                                    >
                                        Initial Status
                                    </Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(
                                            value:
                                                | 'planning'
                                                | 'in_progress'
                                                | 'completed',
                                        ) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                status: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem value="planning">
                                                Planning
                                            </SelectItem>
                                            <SelectItem value="in_progress">
                                                In Progress
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                Completed
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label
                                        htmlFor="description"
                                        className="text-popover-foreground font-medium flex items-center gap-1"
                                    >
                                        Project Description{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary sm:min-h-[100px] placeholder-muted-foreground"
                                        placeholder="Provide a comprehensive description of the project scope, background, and context..."
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="border-border" />

                    {/* Project Objectives */}
                    <Card className="bg-muted/30 border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-primary" />
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Project Objectives
                                    </h3>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addObjective}
                                    className="text-primary border-primary hover:bg-primary/10"
                                >
                                    Add Objective
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {formData.objectives.map((objective, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={objective}
                                            onChange={(e) =>
                                                updateObjective(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={`Objective ${
                                                index + 1
                                            }...`}
                                            className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        {formData.objectives.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    removeObjective(index)
                                                }
                                                className="text-destructive border-destructive hover:bg-destructive/10"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project Deliverables */}
                    <Card className="bg-muted/30 border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Expected Deliverables
                                    </h3>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addDeliverable}
                                    className="text-primary border-primary hover:bg-primary/10"
                                >
                                    Add Deliverable
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {formData.deliverables.map(
                                    (deliverable, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={deliverable}
                                                onChange={(e) =>
                                                    updateDeliverable(
                                                        index,
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={`Deliverable ${
                                                    index + 1
                                                }...`}
                                                className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                                            />
                                            {formData.deliverables.length >
                                                1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeDeliverable(index)
                                                    }
                                                    className="text-destructive border-destructive hover:bg-destructive/10"
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="border-border" />

                    <div className="flex justify-between items-center pt-6">
                        <div className="text-sm text-muted-foreground">
                            All fields marked with{' '}
                            <span className="text-destructive">*</span> are
                            required
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="border-border text-foreground hover:bg-accent px-6"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating Project...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Create Project
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
