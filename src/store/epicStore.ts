import { create } from 'zustand';
import { Epic, Story, SubTask } from '@/types';

const mockEpics: Epic[] = [
    {
        id: '1',
        title: 'User Authentication System',
        description:
            'Implement a comprehensive user authentication system with login, registration, password reset, and social login options.',
        status: 'in_progress',
        progress: 65,
        createdAt: new Date('2024-01-01'),
        stories: [
            {
                id: '1',
                title: 'User Registration',
                description:
                    'Allow users to create accounts with email and password',
                acceptanceCriteria: [
                    'User can enter email and password',
                    'Password strength validation',
                    'Email verification sent',
                    'User redirected to login after registration',
                ],
                subTasks: [
                    {
                        id: '1',
                        title: 'Create registration form',
                        completed: true,
                        storyId: '1',
                    },
                    {
                        id: '2',
                        title: 'Add password validation',
                        completed: true,
                        storyId: '1',
                    },
                    {
                        id: '3',
                        title: 'Implement email verification',
                        completed: false,
                        storyId: '1',
                    },
                ],
                epicId: '1',
                completed: false,
            },
            {
                id: '2',
                title: 'Login Functionality',
                description: 'Users can log in with their credentials',
                acceptanceCriteria: [
                    'Login form with email/password fields',
                    'Remember me option',
                    'Forgot password link',
                    'Proper error messages',
                ],
                subTasks: [
                    {
                        id: '4',
                        title: 'Create login form UI',
                        completed: true,
                        storyId: '2',
                    },
                    {
                        id: '5',
                        title: 'Implement authentication logic',
                        completed: true,
                        storyId: '2',
                    },
                    {
                        id: '6',
                        title: 'Add remember me functionality',
                        completed: false,
                        storyId: '2',
                    },
                ],
                epicId: '1',
                completed: false,
            },
        ],
    },
    {
        id: '2',
        title: 'Dashboard Analytics',
        description:
            'Create comprehensive dashboard with charts, metrics, and real-time data visualization.',
        status: 'planning',
        progress: 20,
        createdAt: new Date('2024-01-15'),
        stories: [
            {
                id: '3',
                title: 'Basic Dashboard Layout',
                description: 'Set up the main dashboard structure',
                acceptanceCriteria: [
                    'Responsive grid layout',
                    'Header with user info',
                    'Sidebar navigation',
                    'Main content area',
                ],
                subTasks: [
                    {
                        id: '7',
                        title: 'Design dashboard wireframes',
                        completed: true,
                        storyId: '3',
                    },
                    {
                        id: '8',
                        title: 'Implement responsive layout',
                        completed: false,
                        storyId: '3',
                    },
                ],
                epicId: '2',
                completed: false,
            },
        ],
    },
];

interface EpicState {
    epics: Epic[];
    loading: boolean;

    // Actions
    fetchEpics: () => Promise<void>;
    createEpic: (epic: Omit<Epic, 'id' | 'createdAt'>) => Promise<void>;
    updateEpic: (id: string, updates: Partial<Epic>) => Promise<void>;
    deleteEpic: (id: string) => Promise<void>;
}

export const useEpicStore = create<EpicState>()((set) => ({
    epics: [],
    loading: false,

    fetchEpics: async () => {
        set({ loading: true });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({ epics: mockEpics, loading: false });
    },

    createEpic: async (epicData) => {
        const newEpic: Epic = {
            ...epicData,
            id: Date.now().toString(),
            createdAt: new Date(),
        };

        set((state) => ({ epics: [newEpic, ...state.epics] }));
    },

    updateEpic: async (id, updates) => {
        set((state) => ({
            epics: state.epics.map((epic) =>
                epic.id === id ? { ...epic, ...updates } : epic,
            ),
        }));
    },

    deleteEpic: async (id) => {
        set((state) => ({
            epics: state.epics.filter((epic) => epic.id !== id),
        }));
    },
}));
