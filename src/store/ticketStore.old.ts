import { Attachment, Comment, DashboardStats, Ticket } from '@/types';
import { create } from 'zustand';
import { useAuthStore } from './authStore';

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
    tickets: [],
    selectedTicket: null,
    dashboardStats: computeStatsFromTickets([]),
    loading: false,

    fetchTickets: async (filter) => {
        set({ loading: true });
        await new Promise((r) => setTimeout(r, 200));
        const { user } = useAuthStore.getState();
        let filtered = get().tickets;

        if (filter === 'assigned' && user) {
            filtered = get().tickets.filter(
                (t) =>
                    t.assigneeId === user.id ||
                    (t.assigneeIds && t.assigneeIds.includes(user.id)),
            );
        } else if (filter === 'reported' && user) {
            filtered = get().tickets.filter((t) => t.reporterId === user.id);
        } else {
            if (user?.role === 'client') {
                filtered = get().tickets.filter(
                    (t) => t.reporterId === user.id,
                );
            } else if (
                user?.role === 'developer' ||
                user?.role === 'support' ||
                user?.role === 'it'
            ) {
                filtered = get().tickets.filter(
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
        const tickets = get().tickets;
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
