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
    mfa: () => [...queryKeys.auth.all, 'mfa'] as const,
  },
  mfa: {
    all: ['mfa'] as const,
    factors: () => [...queryKeys.mfa.all, 'factors'] as const,
    status: () => [...queryKeys.mfa.all, 'status'] as const,
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
    layout: () => [...queryKeys.dashboard.all, 'layout'] as const,
    widgets: () => [...queryKeys.dashboard.all, 'widgets'] as const,
  },
  settings: {
    all: ['settings'] as const,
    alerts: () => [...queryKeys.settings.all, 'alerts'] as const,
  },
  security: {
    all: ['security'] as const,
    events: (filters?: unknown) => [...queryKeys.security.all, 'events', filters] as const,
    settings: ['security', 'settings'] as const,
  },
  permissions: {
    all: ['permissions'] as const,
    user: (id: string) => [...queryKeys.permissions.all, 'user', id] as const,
    roles: () => [...queryKeys.permissions.all, 'roles'] as const,
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
  mapbox: {
    all: ['mapbox'] as const,
    token: () => [...queryKeys.mapbox.all, 'token'] as const,
  }
} as any;

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
    onError: (error: unknown) => {
      logger.error('[Mutation Error]:', error);
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro na operação');
    },
  }),
});

export const queryPresets = {
  list: { staleTime: CACHE_TIMES.FREQUENT, gcTime: CACHE_TIMES.STABLE },
  detail: { staleTime: CACHE_TIMES.STABLE, gcTime: CACHE_TIMES.STATIC },
  dashboard: { staleTime: CACHE_TIMES.FREQUENT, gcTime: CACHE_TIMES.STABLE, refetchInterval: REFETCH_INTERVALS.NORMAL },
  config: { staleTime: CACHE_TIMES.STATIC, gcTime: CACHE_TIMES.IMMUTABLE },
  realtime: { staleTime: CACHE_TIMES.REALTIME, gcTime: CACHE_TIMES.FREQUENT, refetchInterval: REFETCH_INTERVALS.REALTIME },
  immutable: { staleTime: CACHE_TIMES.IMMUTABLE, gcTime: CACHE_TIMES.IMMUTABLE },
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
  settings: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.settings.all });
  }
} as any;
