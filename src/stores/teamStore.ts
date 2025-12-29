import { create } from 'zustand';

interface TeamMember {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  loading: boolean;
  error: string | null;
}

interface TeamActions {
  setTeams: (teams: Team[]) => void;
  setCurrentTeam: (team: Team | null) => void;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  removeTeam: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type TeamStore = TeamState & TeamActions;

const initialState: TeamState = {
  teams: [],
  currentTeam: null,
  loading: false,
  error: null,
};

export const useTeamStore = create<TeamStore>((set) => ({
  ...initialState,

  setTeams: (teams) => set({ teams, error: null }),
  setCurrentTeam: (currentTeam) => set({ currentTeam }),

  addTeam: (team) =>
    set((state) => ({ teams: [...state.teams, team] })),

  updateTeam: (id, updates) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  removeTeam: (id) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== id),
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export type { Team, TeamMember, TeamState };
