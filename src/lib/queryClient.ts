import { QueryClient } from '@tanstack/react-query';

// ============================================
// CONFIGURAÇÃO GLOBAL DO REACT QUERY
// ============================================

export const CACHE_TIMES = {
  REALTIME: 10 * 1000,      // 10 segundos
  FREQUENT: 60 * 1000,      // 1 minuto
  STABLE: 5 * 60 * 1000,    // 5 minutos
  STATIC: 15 * 60 * 1000,   // 15 minutos
  INFINITE: Infinity,
} as const;

export const REFETCH_INTERVALS = {
  REALTIME: 30 * 1000,
  FREQUENT: 60 * 1000,
  STABLE: 5 * 60 * 1000,
  NONE: false as const,
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIMES.FREQUENT,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnReconnect: false,
    },
    mutations: { retry: 1 },
  },
});

export const queryPresets = {
  realtime: { staleTime: CACHE_TIMES.REALTIME, refetchInterval: REFETCH_INTERVALS.REALTIME, refetchOnWindowFocus: true },
  list: { staleTime: CACHE_TIMES.FREQUENT, refetchInterval: REFETCH_INTERVALS.FREQUENT },
  config: { staleTime: CACHE_TIMES.STABLE, refetchInterval: REFETCH_INTERVALS.NONE },
  permissions: { staleTime: CACHE_TIMES.STATIC, refetchInterval: REFETCH_INTERVALS.NONE, refetchOnWindowFocus: false },
  static: { staleTime: CACHE_TIMES.INFINITE, refetchInterval: REFETCH_INTERVALS.NONE, refetchOnWindowFocus: false },
};

export const queryKeys = {
  employees: {
    all: ['employees'] as const,
    list: (filters?: Record<string, unknown>) => ['employees', 'list', filters] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    active: ['employees', 'active'] as const,
  },
  teams: { all: ['teams'] as const, list: () => ['teams', 'list'] as const, detail: (id: string) => ['teams', 'detail', id] as const },
  devices: { all: ['devices'] as const, stats: ['devices', 'stats'] as const, list: (type?: string) => ['devices', 'list', type] as const },
  violations: { all: ['violations'] as const, list: (filters?: Record<string, unknown>) => ['violations', 'list', filters] as const, metrics: ['violations', 'metrics'] as const },
  settings: { all: ['settings'] as const, policies: ['settings', 'policies'] as const, appRules: ['settings', 'app-rules'] as const },
  permissions: { user: (userId: string) => ['permissions', 'user', userId] as const, roles: ['permissions', 'roles'] as const },
  users: { all: ['users'] as const, withRoles: ['users', 'with-roles'] as const },
  workSchedules: { all: ['work-schedules'] as const, list: () => ['work-schedules', 'list'] as const },
  geofences: { all: ['geofences'] as const, list: () => ['geofences', 'list'] as const },
  webhooks: { all: ['webhooks'] as const, list: () => ['webhooks', 'list'] as const },
};

export const invalidateRelated = {
  employees: () => { queryClient.invalidateQueries({ queryKey: queryKeys.employees.all }); queryClient.invalidateQueries({ queryKey: queryKeys.devices.stats }); },
  teams: () => { queryClient.invalidateQueries({ queryKey: queryKeys.teams.all }); queryClient.invalidateQueries({ queryKey: queryKeys.employees.all }); },
  violations: () => { queryClient.invalidateQueries({ queryKey: queryKeys.violations.all }); },
  settings: () => { queryClient.invalidateQueries({ queryKey: queryKeys.settings.all }); },
  all: () => { queryClient.invalidateQueries(); },
};
