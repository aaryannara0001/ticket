import { Project, Story, SubTask } from '@/types';
import { create } from 'zustand';

const mockProjects: Project[] = [
    {
        id: '1',
        title: 'User Authentication System',
        description:
            'Implement a comprehensive user authentication system with login, registration, password reset, and social login options.',
        status: 'in_progress',
        progress: 65,
        createdAt: new Date('2024-01-01'),
        managerId: '2', // Assigned to Sarah Manager
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
                completed: false,
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
                completed: true,
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
        managerId: '2', // Assigned to Sarah Manager
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
                completed: false,
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
            },
        ],
    },
    {
        id: '3',
        title: 'E-commerce Platform',
        description:
            'Build a complete e-commerce solution with product catalog, shopping cart, and payment processing.',
        status: 'completed',
        progress: 100,
        createdAt: new Date('2024-02-01'),
        managerId: '1', // Assigned to John Admin
        stories: [],
    },
];

interface ProjectState {
    projects: Project[];
    loading: boolean;

    // Actions
    fetchProjects: () => Promise<void>;
    createProject: (
        project: Omit<Project, 'id' | 'createdAt'>,
    ) => Promise<void>;
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;

    // Story management
    addStoryToProject: (
        projectId: string,
        story: Omit<Story, 'id' | 'epicId'>,
    ) => Promise<void>;
    updateStory: (
        projectId: string,
        storyId: string,
        updates: Partial<Story>,
    ) => Promise<void>;
    deleteStory: (projectId: string, storyId: string) => Promise<void>;

    // Sub-task management
    addSubTaskToStory: (
        projectId: string,
        storyId: string,
        subTask: Omit<SubTask, 'id' | 'storyId'>,
    ) => Promise<void>;
    updateSubTask: (
        projectId: string,
        storyId: string,
        subTaskId: string,
        updates: Partial<SubTask>,
    ) => Promise<void>;
    deleteSubTask: (
        projectId: string,
        storyId: string,
        subTaskId: string,
    ) => Promise<void>;
}

export const useProjectStore = create<ProjectState>()((set) => ({
    projects: [],
    loading: false,

    fetchProjects: async () => {
        set({ loading: true });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({ projects: mockProjects, loading: false });
    },

    createProject: async (projectData) => {
        const newProject: Project = {
            ...projectData,
            id: Date.now().toString(),
            createdAt: new Date(),
        };

        set((state) => ({ projects: [newProject, ...state.projects] }));
    },

    updateProject: async (id, updates) => {
        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === id ? { ...project, ...updates } : project,
            ),
        }));
    },

    deleteProject: async (id) => {
        set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
        }));
    },

    // Story management
    addStoryToProject: async (projectId, storyData) => {
        const newStory: Story = {
            ...storyData,
            id: Date.now().toString(),
            epicId: projectId,
            completed: false,
        };

        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === projectId
                    ? { ...project, stories: [...project.stories, newStory] }
                    : project,
            ),
        }));
    },

    updateStory: async (projectId, storyId, updates) => {
        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === projectId
                    ? {
                          ...project,
                          stories: project.stories.map((story) =>
                              story.id === storyId
                                  ? { ...story, ...updates }
                                  : story,
                          ),
                      }
                    : project,
            ),
        }));
    },

    deleteStory: async (projectId, storyId) => {
        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === projectId
                    ? {
                          ...project,
                          stories: project.stories.filter(
                              (story) => story.id !== storyId,
                          ),
                      }
                    : project,
            ),
        }));
    },

    // Sub-task management
    addSubTaskToStory: async (projectId, storyId, subTaskData) => {
        const newSubTask: SubTask = {
            ...subTaskData,
            id: Date.now().toString(),
            storyId: storyId,
            completed: false,
        };

        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === projectId
                    ? {
                          ...project,
                          stories: project.stories.map((story) =>
                              story.id === storyId
                                  ? {
                                        ...story,
                                        subTasks: [
                                            ...story.subTasks,
                                            newSubTask,
                                        ],
                                    }
                                  : story,
                          ),
                      }
                    : project,
            ),
        }));
    },

    updateSubTask: async (projectId, storyId, subTaskId, updates) => {
        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === projectId
                    ? {
                          ...project,
                          stories: project.stories.map((story) =>
                              story.id === storyId
                                  ? {
                                        ...story,
                                        subTasks: story.subTasks.map(
                                            (subTask) =>
                                                subTask.id === subTaskId
                                                    ? { ...subTask, ...updates }
                                                    : subTask,
                                        ),
                                    }
                                  : story,
                          ),
                      }
                    : project,
            ),
        }));
    },

    deleteSubTask: async (projectId, storyId, subTaskId) => {
        set((state) => ({
            projects: state.projects.map((project) =>
                project.id === projectId
                    ? {
                          ...project,
                          stories: project.stories.map((story) =>
                              story.id === storyId
                                  ? {
                                        ...story,
                                        subTasks: story.subTasks.filter(
                                            (subTask) =>
                                                subTask.id !== subTaskId,
                                        ),
                                    }
                                  : story,
                          ),
                      }
                    : project,
            ),
        }));
    },
}));
