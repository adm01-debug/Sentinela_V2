// Project Store for Sentinela v17
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Project, ProjectFilters, ProjectStats } from '@/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  filters: ProjectFilters;
  stats: ProjectStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  removeProject: (id) => void;
  setCurrentProject: (project: Project | null) => void;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  clearFilters: () => void;
  setStats: (stats: ProjectStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  projects: [],
  currentProject: null,
  filters: {},
  stats: null,
  isLoading: false,
  error: null,
};

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, _get) => ({
        ...initialState,

        setProjects: (projects) => set({ projects }),

        addProject: (project) =>
          set((state) => ({
            projects: [...state.projects, project],
          })),

        updateProject: (id, data) =>
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, ...data } : p
            ),
            currentProject:
              state.currentProject?.id === id
                ? { ...state.currentProject, ...data }
                : state.currentProject,
          })),

        removeProject: (id) =>
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject:
              state.currentProject?.id === id ? null : state.currentProject,
          })),

        setCurrentProject: (project) => set({ currentProject: project }),

        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        clearFilters: () => set({ filters: {} }),

        setStats: (stats) => set({ stats }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        reset: () => set(initialState),
      }),
      {
        name: 'project-store',
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    ),
    { name: 'ProjectStore' }
  )
);

// Selectors
export const selectProjectById = (id) => (state: ProjectState) =>
  state.projects.find((p) => p.id === id);

export const selectActiveProjects = (state: ProjectState) =>
  state.projects.filter((p) => p.status === 'active');

export const selectProjectsByTeam = (teamId) => (state: ProjectState) =>
  state.projects.filter((p) => p.teamId === teamId);
