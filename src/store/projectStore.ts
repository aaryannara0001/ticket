import { Project, Story, SubTask } from '@/types';
import { create } from 'zustand';
import { apiService } from '../services/api';
import { useAuthStore } from './authStore';

interface ProjectState {
    projects: Project[];
    loading: boolean;

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

    // Internal helpers
    updateProjectProgress: (projectId: string) => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
    projects: [],
    loading: false,

    // Helper function to update project progress
    updateProjectProgress: (projectId: string) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (project) {
            // Calculate progress based on story completion and subtask completion
            const calculateProgress = (stories: Story[]): number => {
                if (stories.length === 0) return 0;

                const storyProgress = stories.map((story) => {
                    if (story.completed) return 100;

                    const totalSubTasks = story.subTasks.length;
                    if (totalSubTasks === 0) return 0;

                    const completedSubTasks = story.subTasks.filter(
                        (subTask) => subTask.completed,
                    ).length;
                    return (completedSubTasks / totalSubTasks) * 100;
                });

                const totalProgress = storyProgress.reduce(
                    (sum, progress) => sum + progress,
                    0,
                );
                return Math.round(totalProgress / stories.length);
            };

            const progress = calculateProgress(project.stories);

            // Update project status based on progress
            let status: 'planning' | 'in_progress' | 'completed' = 'planning';
            if (progress === 100) {
                status = 'completed';
            } else if (progress > 0) {
                status = 'in_progress';
            }

            set((currentState) => ({
                projects: currentState.projects.map((p) =>
                    p.id === projectId ? { ...p, progress, status } : p,
                ),
            }));
        }
    },

    fetchProjects: async () => {
        // Don't fetch if not authenticated
        const isAuthenticated = useAuthStore.getState().user ? true : false;
        if (!isAuthenticated) {
            set({ projects: [], loading: false });
            return;
        }

        set({ loading: true });
        try {
            const apiProjects = await apiService.getProjects();
            // Map API response to frontend Project interface
            const projects: Project[] = apiProjects.map((apiProject) => ({
                id: apiProject.id,
                title: apiProject.name,
                description: apiProject.description,
                status: 'planning', // Default status
                stories: [], // Will be populated separately if needed
                createdAt: new Date(apiProject.createdAt),
                progress: 0, // Will be calculated dynamically
                managerId: '', // Not in API yet
            }));
            set({ projects, loading: false });
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            set({ loading: false });
        }
    },

    createProject: async (projectData) => {
        // Don't create if not authenticated
        const isAuthenticated = useAuthStore.getState().user ? true : false;
        if (!isAuthenticated) {
            throw new Error('Not authenticated');
        }

        try {
            // Map frontend project to API format
            const apiProjectData = {
                name: projectData.title,
                description: projectData.description,
                key: projectData.title
                    .toUpperCase()
                    .replace(/\s+/g, '-')
                    .substring(0, 10),
            };
            const createdProject = await apiService.createProject(
                apiProjectData,
            );

            // Map back to frontend format
            const newProject: Project = {
                id: createdProject.id,
                title: createdProject.name,
                description: createdProject.description,
                status: 'planning',
                stories: [],
                createdAt: new Date(createdProject.createdAt),
                progress: 0,
                managerId: '',
            };

            set((state) => ({ projects: [newProject, ...state.projects] }));
        } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
        }
    },

    updateProject: async (id, updates) => {
        // Don't update if not authenticated
        const isAuthenticated = useAuthStore.getState().user ? true : false;
        if (!isAuthenticated) {
            throw new Error('Not authenticated');
        }

        try {
            // Map frontend updates to API format
            const apiUpdates: any = {};
            if (updates.title) apiUpdates.name = updates.title;
            if (updates.description)
                apiUpdates.description = updates.description;

            await apiService.updateProject(id, apiUpdates);

            // Update local state
            set((state) => ({
                projects: state.projects.map((project) =>
                    project.id === id ? { ...project, ...updates } : project,
                ),
            }));
        } catch (error) {
            console.error('Failed to update project:', error);
            throw error;
        }
    },

    deleteProject: async (id) => {
        // Don't delete if not authenticated
        const isAuthenticated = useAuthStore.getState().user ? true : false;
        if (!isAuthenticated) {
            throw new Error('Not authenticated');
        }

        try {
            await apiService.deleteProject(id);
            set((state) => ({
                projects: state.projects.filter((project) => project.id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error;
        }
    },

    // Story management (keeping mock implementation for now since API might not have story endpoints)
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
        // Update progress after adding story
        get().updateProjectProgress(projectId);
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
        // Update progress after story update
        get().updateProjectProgress(projectId);
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
        // Update progress after story deletion
        get().updateProjectProgress(projectId);
    },

    // Sub-task management (keeping mock implementation for now)
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
        // Update progress after adding subtask
        get().updateProjectProgress(projectId);
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
        // Update progress after subtask update
        get().updateProjectProgress(projectId);
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
        // Update progress after subtask deletion
        get().updateProjectProgress(projectId);
    },
}));
