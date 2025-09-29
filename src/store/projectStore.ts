import { Project, Story, SubTask } from '@/types';
import { create } from 'zustand';

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
        await new Promise((resolve) => setTimeout(resolve, 200));
        // start empty - admin can create projects
        set({ projects: [], loading: false });
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
