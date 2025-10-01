/**
 * API service for backend integration
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Types for API responses
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
    details?: any;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        active: boolean;
        emailVerified: boolean;
        createdAt: string;
        updatedAt?: string;
    };
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'developer' | 'support' | 'it' | 'manager' | 'admin' | 'client';
    active: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface Ticket {
    id: string;
    key: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    department?: string;
    reporterId: string;
    assigneeIds: string[];
    createdAt: string;
    updatedAt?: string;
}

export interface CreateTicketRequest {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    department?: string;
    assigneeIds?: string[];
}

export interface UpdateTicketRequest {
    title?: string;
    description?: string;
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    department?: string;
    assigneeIds?: string[];
}

export interface DashboardStats {
    openTickets: number;
    inProgressTickets: number;
    closedTickets: number;
    criticalTickets: number;
    ticketsByDepartment: Array<{ department: string; count: number }>;
    ticketsByPriority: Array<{ priority: string; count: number }>;
    recentActivity: Array<{ id: string; message: string; createdAt: string }>;
}

class ApiService {
    private token: string | null = null;

    constructor() {
        // Load token from localStorage on initialization
        this.token = localStorage.getItem('accessToken');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Log detailed error information for debugging
            console.error('API Error:', {
                endpoint,
                status: response.status,
                statusText: response.statusText,
                error: errorData,
                token: this.token ? 'present' : 'missing',
            });

            // Provide user-friendly error messages
            let errorMessage =
                errorData.detail?.message || `HTTP ${response.status}`;

            // Handle specific error types
            if (response.status === 401) {
                errorMessage = 'Your session has expired. Please log in again.';
                // Clear invalid token
                this.clearToken();
            } else if (response.status === 403) {
                if (
                    errorData.detail?.error ===
                    'E_AUTH_INSUFFICIENT_PERMISSIONS'
                ) {
                    errorMessage = `Access denied: ${
                        errorData.detail?.required_permission ||
                        'Required permission not met'
                    }`;
                } else if (
                    errorData.detail?.error === 'E_AUTH_INSUFFICIENT_ROLE'
                ) {
                    errorMessage = `Access denied: ${
                        errorData.detail?.message || 'Insufficient role'
                    }`;
                } else {
                    errorMessage =
                        'You do not have permission to perform this action.';
                }
            } else if (response.status === 404) {
                errorMessage = 'The requested resource was not found.';
            } else if (response.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            throw new Error(errorMessage);
        }

        return response.json();
    }

    // Auth methods
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await this.request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        // Store tokens
        this.token = response.accessToken;
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        return response;
    }

    async logout(): Promise<void> {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            // Clear tokens regardless of API response
            this.token = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    async getCurrentUser(): Promise<User> {
        return this.request<User>('/auth/me');
    }

    async register(userData: {
        name: string;
        email: string;
        password: string;
        role?: 'developer' | 'support' | 'it' | 'manager' | 'admin' | 'client';
    }): Promise<User> {
        return this.request<User>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    // User methods
    async getUsers(): Promise<User[]> {
        return this.request<User[]>('/users/');
    }

    async createUser(userData: {
        name: string;
        email: string;
        password: string;
        role: 'developer' | 'support' | 'it' | 'manager' | 'admin' | 'client';
    }): Promise<User> {
        return this.request<User>('/users/', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async updateUser(userId: string, userData: Partial<User>): Promise<User> {
        return this.request<User>(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(userId: string): Promise<void> {
        await this.request(`/users/${userId}`, { method: 'DELETE' });
    }

    // Ticket methods
    async getTickets(filters?: {
        status?: string;
        priority?: string;
        assigneeId?: string;
    }): Promise<Ticket[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.assigneeId)
            params.append('assignee_id', filters.assigneeId);

        const query = params.toString();
        return this.request<Ticket[]>(`/tickets/${query ? `?${query}` : ''}`);
    }

    async getMyTickets(): Promise<Ticket[]> {
        return this.request<Ticket[]>('/tickets/my');
    }

    async getTicket(ticketId: string): Promise<Ticket> {
        return this.request<Ticket>(`/tickets/${ticketId}`);
    }

    async createTicket(ticketData: CreateTicketRequest): Promise<Ticket> {
        return this.request<Ticket>('/tickets/', {
            method: 'POST',
            body: JSON.stringify(ticketData),
        });
    }

    async updateTicket(
        ticketId: string,
        ticketData: UpdateTicketRequest,
    ): Promise<Ticket> {
        return this.request<Ticket>(`/tickets/${ticketId}`, {
            method: 'PUT',
            body: JSON.stringify(ticketData),
        });
    }

    async getTicketHistory(ticketId: string): Promise<any[]> {
        return this.request<any[]>(`/tickets/${ticketId}/history`);
    }

    // Dashboard methods
    async getDashboardStats(): Promise<DashboardStats> {
        return this.request<DashboardStats>('/tickets/dashboard-stats');
    }

    // Project methods
    async getProjects(): Promise<any[]> {
        return this.request<any[]>('/projects/');
    }

    async createProject(projectData: {
        name: string;
        description?: string;
        key: string;
    }): Promise<any> {
        return this.request('/projects/', {
            method: 'POST',
            body: JSON.stringify(projectData),
        });
    }

    async updateProject(
        projectId: string,
        projectData: {
            name?: string;
            description?: string;
            key?: string;
        },
    ): Promise<any> {
        return this.request(`/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(projectData),
        });
    }

    async deleteProject(projectId: string): Promise<void> {
        await this.request(`/projects/${projectId}`, { method: 'DELETE' });
    }

    async verifyEmail(email: string, otp: string): Promise<void> {
        await this.request('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        });
    }

    async resendOTP(email: string): Promise<void> {
        await this.request('/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    // Utility methods
    isAuthenticated(): boolean {
        return !!this.token;
    }

    setToken(token: string): void {
        this.token = token;
        localStorage.setItem('accessToken', token);
    }

    clearToken(): void {
        this.token = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
}

export const apiService = new ApiService();
