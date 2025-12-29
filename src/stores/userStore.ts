import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  department?: string;
  organizationId: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

type UserStore = UserState & UserActions;

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
          error: null,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      logout: () => set(initialState),
    }),
    {
      name: 'sentinela-user',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export type { User, UserRole, UserState };
