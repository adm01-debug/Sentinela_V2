// Team Store for Sentinela v17
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { teamService } from '@/services/teamService';
import type { Team, TeamFilters, TeamStats } from '@/types/team';

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  stats: TeamStats | null;
  filters: TeamFilters;
  isLoading: boolean;
  error: string | null;
  pagination: { page: number; pageSize: number; total: number };
}

interface TeamActions {
  fetchTeams: (filters?: TeamFilters, page?: number) => Promise<void>;
  fetchTeam: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  createTeam: (data: Parameters<typeof teamService.create>[0]) => Promise<Team>;
  updateTeam: (id: string, data: Parameters<typeof teamService.update>[1]) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;
  addMember: (teamId: string, userId: string, role?: string) => Promise<void>;
  removeMember: (teamId: string, userId: string) => Promise<void>;
  setFilters: (filters: TeamFilters) => void;
  setCurrentTeam: (team: Team | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: TeamState = {
  teams: [],
  currentTeam: null,
  stats: null,
  filters: {},
  isLoading: false,
  error: null,
  pagination: { page: 1, pageSize: 20, total: 0 },
};

export const useTeamStore = create<TeamState & TeamActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        fetchTeams: async (filters, page = 1) => {
          set({ isLoading: true, error: null });
          try {
            const response = await teamService.getAll(filters || get().filters, page, get().pagination.pageSize);
            set({ teams: response.data, pagination: { ...get().pagination, page, total: response.pagination.total }, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchTeam: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const team = await teamService.getById(id);
            set({ currentTeam: team, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchStats: async () => {
          try {
            const stats = await teamService.getStats();
            set({ stats });
          } catch (error) {
            set({ error: (error as Error).message });
          }
        },

        createTeam: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const team = await teamService.create(data);
            set({ teams: [...get().teams, team], isLoading: false });
            return team;
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        updateTeam: async (id, data) => {
          set({ isLoading: true, error: null });
          try {
            const team = await teamService.update(id, data);
            set({ teams: get().teams.map(t => t.id === id ? team : t), currentTeam: get().currentTeam?.id === id ? team : get().currentTeam, isLoading: false });
            return team;
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        deleteTeam: async (id) => {
          set({ isLoading: true, error: null });
          try {
            await teamService.delete(id);
            set({ teams: get().teams.filter(t => t.id !== id), currentTeam: get().currentTeam?.id === id ? null : get().currentTeam, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        addMember: async (teamId, userId, role) => {
          await teamService.addMember(teamId, { userId, role: role as any });
          get().fetchTeam(teamId);
        },

        removeMember: async (teamId, userId) => {
          await teamService.removeMember(teamId, userId);
          get().fetchTeam(teamId);
        },

        setFilters: (filters) => set({ filters }),
        setCurrentTeam: (team) => set({ currentTeam: team }),
        clearError: () => set({ error: null }),
        reset: () => set(initialState),
      }),
      { name: 'team-store', partialize: (state) => ({ filters: state.filters }) }
    ),
    { name: 'TeamStore' }
  )
);

export default useTeamStore;
