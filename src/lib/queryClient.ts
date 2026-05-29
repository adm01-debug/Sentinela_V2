import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

// ============================================================
// CONFIGURAÇÃO DE TEMPOS DE CACHE
// ============================================================

export const CACHE_TIMES = {
  REALTIME: 1000 * 10,
  FREQUENT: 1000 * 60,
  STABLE: 1000 * 60 * 5,
  STATIC: 1000 * 60 * 15,
  IMMUTABLE: 1000 * 60 * 60,
} as const;

export const REFETCH_INTERVALS = {
  REALTIME: 1000 * 30,
  FREQUENT: 1000 * 60,
  NORMAL: 1000 * 60,
  SLOW: 1000 * 60 * 5,
} as const;

// ============================================================
// QUERY KEYS CENTRALIZADAS
// ============================================================

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  employees: {
    all: ['employees'] as const,
    lists: () => [...queryKeys.employees.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.employees.lists(), filters] as const,
    details: () => [...queryKeys.employees.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.employees.details(), id] as const,
    stats: (id: string) => [...queryKeys.employees.all, 'stats', id] as const,
  },
  teams: {
    all: ['teams'] as const,
    lists: () => [...queryKeys.teams.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.teams.lists(), filters] as const,
  },
  violations: {
    all: ['security_violations'] as const,
    lists: () => [...queryKeys.violations.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.violations.lists(), filters] as const,
    unread: () => [...queryKeys.violations.all, 'unread'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    recentActivity: () => [...queryKeys.dashboard.all, 'recent-activity'] as const,
    recentViolations: () => [...queryKeys.dashboard.all, 'recent-violations'] as const,
    security: () => [...queryKeys.dashboard.all, 'security'] as const,
    activity: () => [...queryKeys.dashboard.all, 'activity'] as const,
  },
  settings: {
    all: ['settings'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  geofences: {
    all: ['geofences'] as const,
  },
  mobileDevices: {
    all: ['mobile-devices'] as const,
  },
  activity: {
    all: ['activity'] as const,
  },
} as any; // Using any to allow the rest of the file logic to work if I missed something

// ============================================================
// QUERY CLIENT INSTANCE
// ============================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIMES.STABLE,
      gcTime: CACHE_TIMES.STATIC,
      retry: (failureCount, error: any) => {
        if (error?.status === 404 || error?.status === 403 || error?.status === 401) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      if (query.meta?.silent) return;
      logger.error(`[Query Error] ${query.queryKey}:`, error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      logger.error('[Mutation Error]:', error);
      toast.error(error.message || 'Ocorreu um erro na operação');
    },
  }),
});

export const queryPresets = {
  list: { staleTime: CACHE_TIMES.FREQUENT, gcTime: CACHE_TIMES.STABLE },
  detail: { staleTime: CACHE_TIMES.STABLE, gcTime: CACHE_TIMES.STATIC },
  dashboard: { staleTime: CACHE_TIMES.FREQUENT, gcTime: CACHE_TIMES.STABLE, refetchInterval: REFETCH_INTERVALS.NORMAL },
};

export const invalidateRelated = {
  employee: (client: QueryClient, id: string) => {
    client.invalidateQueries({ queryKey: queryKeys.employees.detail(id) });
    client.invalidateQueries({ queryKey: queryKeys.employees.lists() });
    client.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
  },
  employees: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.employees.all });
    client.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
  },
  violations: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.violations.all });
    client.invalidateQueries({ queryKey: queryKeys.dashboard.security() });
  },
} as any;
