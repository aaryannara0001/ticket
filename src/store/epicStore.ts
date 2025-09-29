import { Epic } from '@/types';
import { create } from 'zustand';

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
        set({ epics: [], loading: false });
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
