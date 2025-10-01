import { Attachment, Comment, DashboardStats, Ticket } from '@/types';
import { create } from 'zustand';
import { apiService } from '../services/api';
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

// Helper to convert API ticket to frontend ticket format
function convertApiTicketToFrontend(apiTicket: any): Ticket {
    return {
        id: apiTicket.id,
        key: apiTicket.key,
        title: apiTicket.title,
        description: apiTicket.description,
        type: 'task', // Default type
        status: apiTicket.status,
        priority: apiTicket.priority,
        department: apiTicket.department || 'Unassigned',
        reporterId: apiTicket.reporterId,
        assigneeId: apiTicket.assigneeIds?.[0], // Take first assignee for compatibility
        assigneeIds: apiTicket.assigneeIds || [],
        createdAt: new Date(apiTicket.createdAt),
        updatedAt: apiTicket.updatedAt
            ? new Date(apiTicket.updatedAt)
            : undefined,
        reporter: undefined, // Will be populated by real user data
        assignee: undefined, // Will be populated by real user data
        comments: [],
        attachments: [],
    };
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
    dashboardStats: null,
    loading: false,

    fetchTickets: async (filter) => {
        // Don't fetch if not authenticated
        const isAuthenticated = useAuthStore.getState().user ? true : false;
        if (!isAuthenticated) {
            set({ tickets: [], loading: false });
            return;
        }

        try {
            set({ loading: true });

            let apiTickets;
            if (filter === 'assigned') {
                apiTickets = await apiService.getMyTickets();
            } else {
                apiTickets = await apiService.getTickets();
            }

            const tickets = apiTickets.map(convertApiTicketToFrontend);

            // Apply client-side filtering if needed
            const { user } = useAuthStore.getState();
            let filtered = tickets;

            if (filter === 'reported' && user) {
                filtered = tickets.filter((t) => t.reporterId === user.id);
            } else if (user?.role === 'client') {
                filtered = tickets.filter((t) => t.reporterId === user.id);
            }

            set({ tickets: filtered, loading: false });
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
            set({ loading: false });
        }
    },

    fetchDashboardStats: async () => {
        // Don't fetch if not authenticated
        const isAuthenticated = useAuthStore.getState().user ? true : false;
        if (!isAuthenticated) {
            set({ dashboardStats: null, loading: false });
            return;
        }

        try {
            set({ loading: true });
            const stats = await apiService.getDashboardStats();

            // Convert API response to frontend format
            const frontendStats: DashboardStats = {
                ...stats,
                recentActivity: stats.recentActivity.map((activity) => ({
                    id: activity.id,
                    type: 'ticket_created' as const, // Default type
                    description: activity.message,
                    userId: '', // Not provided by API
                    ticketId: '', // Not provided by API
                    createdAt: new Date(activity.createdAt),
                })),
            };

            set({ dashboardStats: frontendStats, loading: false });
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            // Fallback to computed stats from current tickets
            const tickets = get().tickets;
            const stats = computeStatsFromTickets(tickets);
            set({ dashboardStats: stats, loading: false });
        }
    },

    createTicket: async (ticketData) => {
        try {
            const apiTicket = await apiService.createTicket({
                title: ticketData.title,
                description: ticketData.description,
                priority: ticketData.priority,
                department: ticketData.department,
                assigneeIds: ticketData.assigneeIds,
            });

            const newTicket = convertApiTicketToFrontend(apiTicket);
            set((state) => ({
                tickets: [...state.tickets, newTicket],
            }));

            // Refresh dashboard stats
            get().fetchDashboardStats();
        } catch (error) {
            console.error('Failed to create ticket:', error);
            throw error;
        }
    },

    updateTicket: async (id, updates) => {
        try {
            const apiTicket = await apiService.updateTicket(id, {
                title: updates.title,
                description: updates.description,
                status: updates.status,
                priority: updates.priority,
                department: updates.department,
                assigneeIds: updates.assigneeIds,
            });

            const updatedTicket = convertApiTicketToFrontend(apiTicket);

            set((state) => ({
                tickets: state.tickets.map((t) =>
                    t.id === id ? updatedTicket : t,
                ),
                selectedTicket:
                    state.selectedTicket?.id === id
                        ? updatedTicket
                        : state.selectedTicket,
            }));

            // Refresh dashboard stats
            get().fetchDashboardStats();
        } catch (error) {
            console.error('Failed to update ticket:', error);
            throw error;
        }
    },

    deleteTicket: async (id) => {
        try {
            // Note: Delete endpoint not implemented in backend yet
            // await apiService.deleteTicket(id);

            set((state) => ({
                tickets: state.tickets.filter((t) => t.id !== id),
                selectedTicket:
                    state.selectedTicket?.id === id
                        ? null
                        : state.selectedTicket,
            }));

            // Refresh dashboard stats
            get().fetchDashboardStats();
        } catch (error) {
            console.error('Failed to delete ticket:', error);
            throw error;
        }
    },

    setSelectedTicket: (ticket) => {
        set({ selectedTicket: ticket });
    },

    addComment: async (ticketId, content) => {
        try {
            // Note: Comments endpoint not implemented in backend yet
            // For now, just add locally
            const { user } = useAuthStore.getState();
            if (!user) return;

            const newComment: Comment = {
                id: Date.now().toString(),
                content,
                authorId: user.id,
                author: {
                    id: user.id,
                    name: user.name,
                    email: user.email || '',
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                },
                ticketId,
                createdAt: new Date(),
                mentions: [],
            };

            set((state) => ({
                tickets: state.tickets.map((t) =>
                    t.id === ticketId
                        ? {
                              ...t,
                              comments: [...(t.comments || []), newComment],
                          }
                        : t,
                ),
                selectedTicket:
                    state.selectedTicket?.id === ticketId
                        ? {
                              ...state.selectedTicket,
                              comments: [
                                  ...(state.selectedTicket.comments || []),
                                  newComment,
                              ],
                          }
                        : state.selectedTicket,
            }));
        } catch (error) {
            console.error('Failed to add comment:', error);
            throw error;
        }
    },

    addAttachment: async (ticketId, attachment) => {
        try {
            // Note: Attachments endpoint not fully implemented yet
            // For now, just add locally
            const newAttachment: Attachment = {
                ...attachment,
                id: Date.now().toString(),
                uploadedAt: new Date(),
            };

            set((state) => ({
                tickets: state.tickets.map((t) =>
                    t.id === ticketId
                        ? {
                              ...t,
                              attachments: [
                                  ...(t.attachments || []),
                                  newAttachment,
                              ],
                          }
                        : t,
                ),
                selectedTicket:
                    state.selectedTicket?.id === ticketId
                        ? {
                              ...state.selectedTicket,
                              attachments: [
                                  ...(state.selectedTicket.attachments || []),
                                  newAttachment,
                              ],
                          }
                        : state.selectedTicket,
            }));
        } catch (error) {
            console.error('Failed to add attachment:', error);
            throw error;
        }
    },

    startRealtimeUpdates: () => {
        if (_realtimeInterval) return;

        _realtimeInterval = window.setInterval(() => {
            // Only refresh if user is authenticated
            const isAuthenticated = useAuthStore.getState().user ? true : false;
            if (isAuthenticated) {
                get().fetchTickets();
                get().fetchDashboardStats();
            }
        }, 30000); // Every 30 seconds
    },

    stopRealtimeUpdates: () => {
        if (_realtimeInterval) {
            clearInterval(_realtimeInterval);
            _realtimeInterval = null;
        }
    },
}));
