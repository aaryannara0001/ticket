import { Attachment, Comment, DashboardStats, Ticket, User } from '@/types';
import { create } from 'zustand';
import { useAuthStore } from './authStore';

// Mock data - Enhanced according to LLD
const mockUsers: User[] = [
    {
        id: '1',
        name: 'John Admin',
        email: 'admin@company.com',
        role: 'admin' as const,
        department: 'IT',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '2',
        name: 'Sarah Manager',
        email: 'manager@company.com',
        role: 'manager' as const,
        department: 'Engineering',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '3',
        name: 'Mike Developer',
        email: 'developer@company.com',
        role: 'team_member' as const,
        department: 'Engineering',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
        id: '4',
        name: 'Lisa Client',
        email: 'client@company.com',
        role: 'client' as const,
        department: 'External',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
];

const mockTickets: Ticket[] = [
    {
        id: '1',
        key: 'TSK-001',
        title: 'Login page not responsive on mobile',
        description:
            'The login page layout breaks on mobile devices below 768px width. Users are unable to access the login form on screens smaller than 768px.',
        type: 'bug',
        priority: 'high',
        status: 'open',
        assigneeId: '3',
        reporterId: '4',
        department: 'Engineering',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        dueDate: new Date('2024-01-20'),
        attachments: [],
        comments: [
            {
                id: '1',
                content:
                    'I can reproduce this issue on iPhone 12. The login button is cut off.',
                authorId: '4',
                author: {
                    id: '4',
                    name: 'Lisa Client',
                    email: 'client@company.com',
                    role: 'client',
                    department: 'External',
                    isActive: true,
                    createdAt: new Date('2024-01-01'),
                },
                ticketId: '1',
                createdAt: new Date('2024-01-15T10:30:00Z'),
                mentions: [],
            },
        ],
    },
    {
        id: '2',
        key: 'TSK-002',
        title: 'Add dark mode toggle',
        description:
            'Implement dark mode functionality across the application with user preference persistence.',
        type: 'feature',
        priority: 'medium',
        status: 'in_progress',
        assigneeId: '3',
        reporterId: '2',
        department: 'Engineering',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-16'),
        dueDate: new Date('2024-01-25'),
        attachments: [],
        comments: [
            {
                id: '2',
                content:
                    'Started working on this. Will implement theme context first.',
                authorId: '3',
                author: {
                    id: '3',
                    name: 'Mike Developer',
                    email: 'developer@company.com',
                    role: 'team_member',
                    department: 'Engineering',
                    isActive: true,
                    createdAt: new Date('2024-01-01'),
                },
                ticketId: '2',
                createdAt: new Date('2024-01-16T09:15:00Z'),
                mentions: [],
            },
        ],
    },
    {
        id: '3',
        key: 'TSK-003',
        title: 'Database backup automation',
        description:
            'Set up automated daily backups for production database with retention policy and monitoring.',
        type: 'task',
        priority: 'critical',
        status: 'resolved',
        assigneeId: '1',
        reporterId: '2',
        department: 'IT',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        dueDate: new Date('2024-01-15'),
        attachments: [],
        comments: [
            {
                id: '3',
                content:
                    'Backup automation is now configured and tested. Monitoring alerts are active.',
                authorId: '1',
                author: {
                    id: '1',
                    name: 'John Admin',
                    email: 'admin@company.com',
                    role: 'admin',
                    department: 'IT',
                    isActive: true,
                    createdAt: new Date('2024-01-01'),
                },
                ticketId: '3',
                createdAt: new Date('2024-01-18T14:20:00Z'),
                mentions: [],
            },
        ],
    },
    {
        id: '4',
        key: 'TSK-004',
        title: 'User profile page enhancement',
        description:
            'Improve user profile page with better UX, avatar upload, and additional user settings.',
        type: 'feature',
        priority: 'medium',
        status: 'open',
        assigneeId: '3',
        reporterId: '4',
        department: 'Engineering',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
        dueDate: new Date('2024-01-30'),
        attachments: [],
        comments: [],
    },
    {
        id: '5',
        key: 'TSK-005',
        title: 'Email notification system',
        description:
            'Implement email notifications for ticket updates, assignments, and mentions.',
        type: 'feature',
        priority: 'high',
        status: 'in_progress',
        assigneeId: '2',
        reporterId: '1',
        department: 'Engineering',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-16'),
        dueDate: new Date('2024-01-22'),
        attachments: [],
        comments: [],
    },
    {
        id: '6',
        key: 'TSK-006',
        title: 'API rate limiting implementation',
        description:
            'Implement rate limiting on API endpoints to prevent abuse and ensure fair usage.',
        type: 'task',
        priority: 'high',
        status: 'open',
        assigneeId: '1',
        reporterId: '2',
        department: 'IT',
        createdAt: new Date('2024-01-09'),
        updatedAt: new Date('2024-01-09'),
        dueDate: new Date('2024-01-23'),
        attachments: [],
        comments: [],
    },
    {
        id: '7',
        key: 'TSK-007',
        title: 'Payment processing bug',
        description:
            'Payment gateway returns error 500 when processing transactions above $1000.',
        type: 'bug',
        priority: 'critical',
        status: 'in_progress',
        assigneeId: '3',
        reporterId: '4',
        department: 'Engineering',
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17'),
        dueDate: new Date('2024-01-19'),
        attachments: [],
        comments: [
            {
                id: '4',
                content:
                    'This is blocking our major customer transactions. @john please prioritize.',
                authorId: '4',
                author: {
                    id: '4',
                    name: 'Lisa Client',
                    email: 'client@company.com',
                    role: 'client',
                    department: 'External',
                    isActive: true,
                    createdAt: new Date('2024-01-01'),
                },
                ticketId: '7',
                createdAt: new Date('2024-01-17T11:45:00Z'),
                mentions: ['1'],
            },
        ],
    },
    {
        id: '8',
        key: 'TSK-008',
        title: 'Mobile app crashes on startup',
        description:
            'iOS app crashes immediately after launch on iOS 17.2+ devices.',
        type: 'bug',
        priority: 'high',
        status: 'open',
        assigneeId: '3',
        reporterId: '2',
        department: 'Engineering',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
        dueDate: new Date('2024-01-25'),
        attachments: [],
        comments: [],
    },
    {
        id: '9',
        key: 'TSK-009',
        title: 'Security audit compliance',
        description:
            'Complete security audit and implement required compliance measures for SOC 2.',
        type: 'task',
        priority: 'medium',
        status: 'in_progress',
        assigneeId: '1',
        reporterId: '2',
        department: 'IT',
        createdAt: new Date('2024-01-11'),
        updatedAt: new Date('2024-01-16'),
        dueDate: new Date('2024-02-01'),
        attachments: [],
        comments: [],
    },
    {
        id: '10',
        key: 'TSK-010',
        title: 'Performance optimization',
        description:
            'Optimize database queries and implement caching to improve application performance.',
        type: 'task',
        priority: 'medium',
        status: 'closed',
        assigneeId: '3',
        reporterId: '2',
        department: 'Engineering',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-15'),
        dueDate: new Date('2024-01-20'),
        attachments: [],
        comments: [
            {
                id: '5',
                content:
                    'Performance improvements completed. API response times improved by 40%.',
                authorId: '3',
                author: {
                    id: '3',
                    name: 'Mike Developer',
                    email: 'developer@company.com',
                    role: 'team_member',
                    department: 'Engineering',
                    isActive: true,
                    createdAt: new Date('2024-01-01'),
                },
                ticketId: '10',
                createdAt: new Date('2024-01-15T16:30:00Z'),
                mentions: [],
            },
        ],
    },
];

const mockStats: DashboardStats = {
    openTickets: 4,
    closedTickets: 1,
    inProgressTickets: 4,
    criticalTickets: 2,
    ticketsByDepartment: [
        { department: 'Engineering', count: 7 },
        { department: 'IT', count: 3 },
        { department: 'Support', count: 0 },
        { department: 'Marketing', count: 0 },
    ],
    ticketsByPriority: [
        { priority: 'Critical', count: 2 },
        { priority: 'High', count: 4 },
        { priority: 'Medium', count: 4 },
        { priority: 'Low', count: 0 },
    ],
    recentActivity: [
        {
            id: '1',
            type: 'ticket_created',
            description: 'Mobile app crashes on startup (TSK-008) was created',
            userId: '2',
            user: {
                id: '2',
                name: 'Sarah Manager',
                email: 'manager@company.com',
                role: 'manager',
                department: 'Engineering',
                isActive: true,
                createdAt: new Date('2024-01-01'),
            },
            ticketId: '8',
            createdAt: new Date('2024-01-18T09:00:00Z'),
        },
        {
            id: '2',
            type: 'ticket_updated',
            description:
                'Payment processing bug (TSK-007) priority changed to Critical',
            userId: '1',
            user: {
                id: '1',
                name: 'John Admin',
                email: 'admin@company.com',
                role: 'admin',
                department: 'IT',
                isActive: true,
                createdAt: new Date('2024-01-01'),
            },
            ticketId: '7',
            createdAt: new Date('2024-01-17T14:30:00Z'),
        },
        {
            id: '3',
            type: 'comment_added',
            description:
                'New comment added to Database backup automation (TSK-003)',
            userId: '1',
            user: {
                id: '1',
                name: 'John Admin',
                email: 'admin@company.com',
                role: 'admin',
                department: 'IT',
                isActive: true,
                createdAt: new Date('2024-01-01'),
            },
            ticketId: '3',
            createdAt: new Date('2024-01-18T14:20:00Z'),
        },
        {
            id: '4',
            type: 'ticket_assigned',
            description:
                'Payment processing bug (TSK-007) assigned to Mike Developer',
            userId: '2',
            user: {
                id: '2',
                name: 'Sarah Manager',
                email: 'manager@company.com',
                role: 'manager',
                department: 'Engineering',
                isActive: true,
                createdAt: new Date('2024-01-01'),
            },
            ticketId: '7',
            createdAt: new Date('2024-01-17T11:45:00Z'),
        },
        {
            id: '5',
            type: 'ticket_updated',
            description: 'Performance optimization (TSK-010) marked as closed',
            userId: '3',
            user: {
                id: '3',
                name: 'Mike Developer',
                email: 'developer@company.com',
                role: 'team_member',
                department: 'Engineering',
                isActive: true,
                createdAt: new Date('2024-01-01'),
            },
            ticketId: '10',
            createdAt: new Date('2024-01-15T16:30:00Z'),
        },
    ],
};

interface TicketState {
    tickets: Ticket[];
    selectedTicket: Ticket | null;
    dashboardStats: DashboardStats | null;
    loading: boolean;

    // Actions
    fetchTickets: () => Promise<void>;
    fetchDashboardStats: () => Promise<void>;
    createTicket: (
        ticket: Omit<Ticket, 'id' | 'key' | 'createdAt' | 'updatedAt'>,
    ) => Promise<void>;
    updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
    deleteTicket: (id: string) => Promise<void>;
    setSelectedTicket: (ticket: Ticket | null) => void;
    addComment: (ticketId: string, content: string) => Promise<void>;
    addAttachment: (
        ticketId: string,
        attachment: Omit<Attachment, 'id' | 'uploadedAt'>,
    ) => Promise<void>;
}

export const useTicketStore = create<TicketState>()((set, get) => ({
    tickets: [],
    selectedTicket: null,
    dashboardStats: null,
    loading: false,

    fetchTickets: async () => {
        set({ loading: true });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { user } = useAuthStore.getState();
        let filteredTickets = mockTickets;

        // Filter based on user role
        if (user?.role === 'client') {
            filteredTickets = mockTickets.filter(
                (t) => t.reporterId === user.id,
            );
        } else if (user?.role === 'team_member') {
            filteredTickets = mockTickets.filter(
                (t) =>
                    t.assigneeId === user.id ||
                    t.department === user.department,
            );
        }

        set({ tickets: filteredTickets, loading: false });
    },

    fetchDashboardStats: async () => {
        set({ loading: true });
        await new Promise((resolve) => setTimeout(resolve, 300));
        set({ dashboardStats: mockStats, loading: false });
    },

    createTicket: async (ticketData) => {
        const { user } = useAuthStore.getState();
        const newTicket: Ticket = {
            ...ticketData,
            id: Date.now().toString(),
            key: `PROJ-${String(get().tickets.length + 1).padStart(3, '0')}`,
            reporterId: user?.id || '1',
            createdAt: new Date(),
            updatedAt: new Date(),
            attachments: [],
            comments: [],
        };

        set((state) => ({ tickets: [newTicket, ...state.tickets] }));
    },

    updateTicket: async (id, updates) => {
        set((state) => ({
            tickets: state.tickets.map((ticket) => {
                if (ticket.id === id) {
                    const updatedTicket = {
                        ...ticket,
                        ...updates,
                        updatedAt: new Date(),
                    };

                    // If assigneeId is being updated, also update the assignee object
                    if (updates.assigneeId !== undefined) {
                        if (updates.assigneeId) {
                            const assignee = mockUsers.find(
                                (u) => u.id === updates.assigneeId,
                            );
                            updatedTicket.assignee = assignee;
                        } else {
                            updatedTicket.assignee = undefined;
                        }
                    }

                    return updatedTicket;
                }
                return ticket;
            }),
            selectedTicket:
                state.selectedTicket?.id === id
                    ? (() => {
                          const updatedTicket = {
                              ...state.selectedTicket,
                              ...updates,
                              updatedAt: new Date(),
                          };

                          // If assigneeId is being updated, also update the assignee object
                          if (updates.assigneeId !== undefined) {
                              if (updates.assigneeId) {
                                  const assignee = mockUsers.find(
                                      (u) => u.id === updates.assigneeId,
                                  );
                                  updatedTicket.assignee = assignee;
                              } else {
                                  updatedTicket.assignee = undefined;
                              }
                          }

                          return updatedTicket;
                      })()
                    : state.selectedTicket,
        }));
    },

    deleteTicket: async (id) => {
        set((state) => ({
            tickets: state.tickets.filter((ticket) => ticket.id !== id),
            selectedTicket:
                state.selectedTicket?.id === id ? null : state.selectedTicket,
        }));
    },

    setSelectedTicket: (ticket) => {
        set({ selectedTicket: ticket });
    },

    addComment: async (ticketId, content) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const newComment: Comment = {
            id: Date.now().toString(),
            content,
            authorId: user.id,
            author: user,
            ticketId,
            createdAt: new Date(),
            mentions: [],
        };

        set((state) => ({
            tickets: state.tickets.map((ticket) =>
                ticket.id === ticketId
                    ? { ...ticket, comments: [...ticket.comments, newComment] }
                    : ticket,
            ),
            selectedTicket:
                state.selectedTicket?.id === ticketId
                    ? {
                          ...state.selectedTicket,
                          comments: [
                              ...state.selectedTicket.comments,
                              newComment,
                          ],
                      }
                    : state.selectedTicket,
        }));
    },

    addAttachment: async (ticketId, attachmentData) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const newAttachment: Attachment = {
            ...attachmentData,
            id: Date.now().toString(),
            uploadedBy: user.id,
            uploadedAt: new Date(),
        };

        set((state) => ({
            tickets: state.tickets.map((ticket) =>
                ticket.id === ticketId
                    ? {
                          ...ticket,
                          attachments: [...ticket.attachments, newAttachment],
                      }
                    : ticket,
            ),
            selectedTicket:
                state.selectedTicket?.id === ticketId
                    ? {
                          ...state.selectedTicket,
                          attachments: [
                              ...state.selectedTicket.attachments,
                              newAttachment,
                          ],
                      }
                    : state.selectedTicket,
        }));
    },
}));
