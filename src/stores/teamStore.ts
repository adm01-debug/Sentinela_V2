// Team Store for Sentinela - Supabase integrated
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
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
  fetchTeam: (id) => Promise<void>;
  fetchStats: () => Promise<void>;
  createTeam: (data: { name: string; description?: string }) => Promise<Team>;
  updateTeam: (id: string, data: Partial<Team>) => Promise<Team>;
  deleteTeam: (id) => Promise<void>;
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

        fetchTeams: async (_filters, _page = 1) => {
          set({ isLoading: true, error: null });
          try {
            const { data, error } = await supabase.from('teams').select('*').order('name');
            if (error) throw error;
            set({ teams: (data || []) as Team[], isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchTeam: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const { data, error } = await supabase.from('teams').select('*').eq('id', id).maybeSingle();
            if (error) throw error;
            set({ currentTeam: data as Team, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchStats: async () => {
          try {
            const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true });
            set({ stats: { total: count || 0, active: count || 0, withMembers: 0, averageSize: 0, totalMembers: 0 } as TeamStats });
          } catch (error) {
            set({ error: (error as Error).message });
          }
        },

        createTeam: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const { data: team, error } = await supabase.from('teams').insert(data).select().maybeSingle();
            if (error) throw error;
            const typed = team as Team;
            set({ teams: [...get().teams, typed], isLoading: false });
            return typed;
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        updateTeam: async (id, data) => {
          set({ isLoading: true, error: null });
          try {
            const { data: team, error } = await supabase.from('teams').update(data as Record<string, unknown>).eq('id', id).select().maybeSingle();
            if (error) throw error;
            const typed = team as Team;
            set({ teams: get().teams.map(t => t.id === id ? typed : t), currentTeam: get().currentTeam?.id === id ? typed : get().currentTeam, isLoading: false });
            return typed;
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        deleteTeam: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const { error } = await supabase.from('teams').delete().eq('id', id);
            if (error) throw error;
            set({ teams: get().teams.filter(t => t.id !== id), currentTeam: get().currentTeam?.id === id ? null : get().currentTeam, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
          }
        },

        addMember: async (_teamId, _userId, _role) => {
          // Stub - team members table integration pending
        },

        removeMember: async (_teamId, _userId) => {
          // Stub - team members table integration pending
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
