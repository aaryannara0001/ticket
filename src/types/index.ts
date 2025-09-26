export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'team_member' | 'client';
    avatar?: string;
    department?: string;
    isActive: boolean;
    phone?: string;
    location?: string;
    bio?: string;
    createdAt: Date;
}

export interface Ticket {
    id: string;
    key: string;
    title: string;
    description: string;
    type: 'bug' | 'feature' | 'task' | 'story';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assigneeId?: string;
    assignee?: User;
    reporterId: string;
    reporter?: User;
    department: string;
    createdAt: Date;
    updatedAt: Date;
    dueDate?: Date;
    attachments: Attachment[];
    comments: Comment[];
    epicId?: string;
}

export interface Comment {
    id: string;
    content: string;
    authorId: string;
    author: User;
    ticketId: string;
    createdAt: Date;
    mentions: string[];
}

export interface Attachment {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedBy: string;
    uploadedAt: Date;
}

export interface Epic {
    id: string;
    title: string;
    description: string;
    status: 'planning' | 'in_progress' | 'completed';
    stories: Story[];
    createdAt: Date;
    progress: number;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'planning' | 'in_progress' | 'completed';
    stories: Story[];
    createdAt: Date;
    progress: number;
    managerId?: string; // Assigned manager for the project
}

export interface Story {
    id: string;
    title: string;
    description: string;
    acceptanceCriteria: string[];
    subTasks: SubTask[];
    epicId: string;
    completed: boolean;
}

export interface SubTask {
    id: string;
    title: string;
    completed: boolean;
    ticketId?: string;
    storyId: string;
}

export interface Department {
    id: string;
    name: string;
    description: string;
    managerId: string;
    members: User[];
}

export interface DashboardStats {
    openTickets: number;
    closedTickets: number;
    inProgressTickets: number;
    criticalTickets: number;
    ticketsByDepartment: { department: string; count: number }[];
    ticketsByPriority: { priority: string; count: number }[];
    recentActivity: Activity[];
}

export interface Activity {
    id: string;
    type:
        | 'ticket_created'
        | 'ticket_updated'
        | 'ticket_assigned'
        | 'comment_added';
    description: string;
    userId: string;
    user?: User;
    ticketId?: string;
    createdAt: Date;
}
