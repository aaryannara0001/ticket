import { Attachment, Comment, DashboardStats, Ticket } from '@/types';
import { create } from 'zustand';
import { useAuthStore } from './authStore';

// Mock data - Enhanced according to LLD
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
        assigneeIds: ['2', '3'],
        assignees: [
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
        ],
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
        assigneeIds: ['1', '2', '3'],
        assignees: [
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
        ],
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

// Minimal TicketState interface (only the members used across the app/tests)
interface TicketState {
    tickets: Ticket[];
    selectedTicket: Ticket | null;
    dashboardStats: DashboardStats | null;
    loading: boolean;

    fetchTickets: (filter?: 'all' | 'assigned' | 'reported') => Promise<void>;
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

    // Real-time controls
    startRealtimeUpdates: () => void;
    stopRealtimeUpdates: () => void;
}

// Helper to compute dashboard stats from tickets (returns shape from src/types)
function computeStatsFromTickets(tickets: Ticket[]): DashboardStats {
    const openTickets = tickets.filter((t) => t.status === 'open').length;
    const inProgressTickets = tickets.filter(
        (t) => t.status === 'in_progress',
    ).length;
    const closedTickets = tickets.filter(
        (t) => t.status === 'closed' || t.status === 'resolved',
    ).length;
    const criticalTickets = tickets.filter(
        (t) => t.priority === 'critical',
    ).length;

    const deptMap = new Map<string, number>();
    const prioMap = new Map<string, number>();
    const recentActivity: any[] = [];

    tickets.forEach((t) => {
        deptMap.set(t.department, (deptMap.get(t.department) || 0) + 1);
        prioMap.set(t.priority, (prioMap.get(t.priority) || 0) + 1);

        // Add a ticket created activity
        recentActivity.push({
            id: `${t.id}-created`,
            type: 'ticket_created',
            description: t.title,
            userId: t.reporterId,
            user: t.reporter,
            ticketId: t.id,
            createdAt: t.createdAt,
        });

        // If there are comments, add the latest comment as activity
        if (t.comments && t.comments.length > 0) {
            const last = t.comments[t.comments.length - 1];
            recentActivity.push({
                id: `${t.id}-comment-${last.id}`,
                type: 'comment_added',
                description: last.content,
                userId: last.authorId,
                user: last.author,
                ticketId: t.id,
                createdAt: last.createdAt,
            });
        }
    });

    // sort recent activity by date desc and keep 5
    recentActivity.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );

    const ticketsByDepartment = Array.from(deptMap.entries()).map(
        ([department, count]) => ({ department, count }),
    );
    const ticketsByPriority = Array.from(prioMap.entries()).map(
        ([priority, count]) => ({ priority, count }),
    );

    return {
        openTickets,
        closedTickets,
        inProgressTickets,
        criticalTickets,
        ticketsByDepartment,
        ticketsByPriority,
        recentActivity: recentActivity.slice(0, 5),
    } as DashboardStats;
}

let _realtimeInterval: number | null = null;

export const useTicketStore = create<TicketState>((set, get) => ({
    tickets: [...mockTickets],
    selectedTicket: null,
    dashboardStats: computeStatsFromTickets(mockTickets),
    loading: false,

    fetchTickets: async (filter) => {
        set({ loading: true });
        await new Promise((r) => setTimeout(r, 200));
        const { user } = useAuthStore.getState();
        let filtered = mockTickets;

        if (filter === 'assigned' && user) {
            filtered = mockTickets.filter(
                (t) =>
                    t.assigneeId === user.id ||
                    (t.assigneeIds && t.assigneeIds.includes(user.id)),
            );
        } else if (filter === 'reported' && user) {
            filtered = mockTickets.filter((t) => t.reporterId === user.id);
        } else {
            if (user?.role === 'client') {
                filtered = mockTickets.filter((t) => t.reporterId === user.id);
            } else if (user?.role === 'team_member') {
                filtered = mockTickets.filter(
                    (t) =>
                        t.assigneeId === user.id ||
                        (t.assigneeIds && t.assigneeIds.includes(user.id)) ||
                        t.department === user.department,
                );
            }
        }

        set({ tickets: filtered, loading: false });
    },

    fetchDashboardStats: async () => {
        set({ loading: true });
        await new Promise((r) => setTimeout(r, 150));
        const tickets = get().tickets.length > 0 ? get().tickets : mockTickets;
        const stats = computeStatsFromTickets(tickets);
        set({ dashboardStats: stats, loading: false });
    },

    createTicket: async (ticketData) => {
        const { user } = useAuthStore.getState();
        const authUsers = useAuthStore.getState().getUsers();
        const newTicket: Ticket = {
            ...ticketData,
            id: Date.now().toString(),
            key: `PROJ-${String(get().tickets.length + 1).padStart(3, '0')}`,
            reporterId: user?.id || '1',
            createdAt: new Date(),
            updatedAt: new Date(),
            attachments: [],
            comments: [],
            assignees: ticketData.assigneeIds
                ? authUsers.filter((u) =>
                      ticketData.assigneeIds?.includes(u.id),
                  )
                : undefined,
        } as Ticket;

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
                    } as Ticket;
                    if (updates.assigneeId !== undefined) {
                        const authUsers = useAuthStore.getState().getUsers();
                        updatedTicket.assignee = authUsers.find(
                            (u) => u.id === updates.assigneeId,
                        ) as any;
                    }
                    if (updates.assigneeIds !== undefined) {
                        const authUsers = useAuthStore.getState().getUsers();
                        updatedTicket.assignees =
                            updates.assigneeIds &&
                            updates.assigneeIds.length > 0
                                ? authUsers.filter((u) =>
                                      updates.assigneeIds?.includes(u.id),
                                  )
                                : undefined;
                    }
                    return updatedTicket;
                }
                return ticket;
            }),
            selectedTicket:
                state.selectedTicket?.id === id
                    ? {
                          ...state.selectedTicket,
                          ...updates,
                          updatedAt: new Date(),
                      }
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

    setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

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
        } as Comment;

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
        } as Attachment;

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

    startRealtimeUpdates: () => {
        if (_realtimeInterval) return;
        _realtimeInterval = window.setInterval(() => {
            // simple random event: create or update
            const rnd = Math.random();
            if (rnd < 0.4) {
                // create a new ticket
                const authUsersNow = useAuthStore.getState().getUsers();
                const reporterId =
                    useAuthStore.getState().user?.id ||
                    (authUsersNow[0]?.id ?? '1');
                const newT: Ticket = {
                    id: Date.now().toString(),
                    key: `PROJ-${Math.floor(Math.random() * 1000)}`,
                    title: `Realtime ${Date.now()}`,
                    description: 'Auto-generated',
                    type: 'task',
                    priority: Math.random() < 0.2 ? 'critical' : 'low',
                    status: 'open',
                    reporterId,
                    department: 'Engineering',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    attachments: [],
                    comments: [],
                } as Ticket;
                set((s) => ({
                    tickets: [newT, ...s.tickets],
                    dashboardStats: computeStatsFromTickets([
                        newT,
                        ...s.tickets,
                    ]),
                }));
            } else {
                // update random ticket status or add comment
                const state = get();
                if (state.tickets.length === 0) return;
                const idx = Math.floor(Math.random() * state.tickets.length);
                const ticket = state.tickets[idx];
                if (!ticket) return;
                const op = Math.random();
                if (op < 0.5) {
                    // change status
                    const newStatus = (
                        ticket.status === 'open'
                            ? 'in_progress'
                            : ticket.status === 'in_progress'
                            ? 'resolved'
                            : 'closed'
                    ) as Ticket['status'];
                    set((s) => {
                        const updated = s.tickets.map((t) =>
                            t.id === ticket.id
                                ? {
                                      ...t,
                                      status: newStatus,
                                      updatedAt: new Date(),
                                  }
                                : t,
                        );
                        return {
                            tickets: updated,
                            dashboardStats: computeStatsFromTickets(updated),
                        };
                    });
                } else {
                    // add comment
                    const authUsersNow = useAuthStore.getState().getUsers();
                    const authorUser =
                        useAuthStore.getState().user || authUsersNow[0];
                    const comment: Comment = {
                        id: Date.now().toString(),
                        content: 'Realtime comment',
                        authorId: authorUser?.id,
                        author: (authorUser as any) || authUsersNow[0],
                        ticketId: ticket.id,
                        createdAt: new Date(),
                        mentions: [],
                    } as Comment;
                    set((s) => {
                        const updated = s.tickets.map((t) =>
                            t.id === ticket.id
                                ? {
                                      ...t,
                                      comments: [...t.comments, comment],
                                      updatedAt: new Date(),
                                  }
                                : t,
                        );
                        return {
                            tickets: updated,
                            dashboardStats: computeStatsFromTickets(updated),
                        };
                    });
                }
            }
        }, 5000);
    },

    stopRealtimeUpdates: () => {
        if (_realtimeInterval) {
            clearInterval(_realtimeInterval);
            _realtimeInterval = null;
        }
    },
}));
