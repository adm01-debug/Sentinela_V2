import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

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
    active: () => [...queryKeys.employees.all, 'active'] as const,
    online: () => [...queryKeys.employees.all, 'online'] as const,
  },
  teams: {
    all: ['teams'] as const,
    lists: () => [...queryKeys.teams.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.teams.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.teams.all, 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
  },
  devices: {
    all: ['devices'] as const,
    lists: () => [...queryKeys.devices.all, 'list'] as const,
  },
  violations: {
    all: ['security_violations'] as const,
    lists: () => [...queryKeys.violations.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.violations.lists(), filters] as const,
    unread: () => [...queryKeys.violations.all, 'unread'] as const,
    detail: (id: string) => [...queryKeys.violations.all, 'detail', id] as const,
    comments: (violationId: string) => [...queryKeys.violations.all, 'comments', violationId] as const,
  },
  violationRules: {
    all: ['violation_rules'] as const,
    lists: () => [...queryKeys.violationRules.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.violationRules.all, 'detail', id] as const,
    active: () => [...queryKeys.violationRules.all, 'active'] as const,
  },
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeys.reports.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.reports.all, 'detail', id] as const,
    history: () => [...queryKeys.reports.all, 'history'] as const,
    scheduled: () => [...queryKeys.reports.all, 'scheduled'] as const,
  },
  webhooks: {
    all: ['webhooks'] as const,
    lists: () => [...queryKeys.webhooks.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.webhooks.all, 'detail', id] as const,
    logs: (webhookId: string) => [...queryKeys.webhooks.all, 'logs', webhookId] as const,
  },
  workSchedules: {
    all: ['work_schedules'] as const,
    lists: () => [...queryKeys.workSchedules.all, 'list'] as const,
    employee: (employeeId: string) => [...queryKeys.workSchedules.all, 'employee', employeeId] as const,
  },
  messageTemplates: {
    all: ['message_templates'] as const,
    lists: () => [...queryKeys.messageTemplates.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.messageTemplates.all, 'detail', id] as const,
    byType: (type: string) => [...queryKeys.messageTemplates.all, 'type', type] as const,
  },
  gamification: {
    all: ['gamification'] as const,
    achievements: () => [...queryKeys.gamification.all, 'achievements'] as const,
    badges: () => [...queryKeys.gamification.all, 'badges'] as const,
    leaderboard: (period: string) => [...queryKeys.gamification.all, 'leaderboard', period] as const,
    points: (employeeId: string) => [...queryKeys.gamification.all, 'points', employeeId] as const,
  },
  rateLimiting: {
    all: ['rate_limiting'] as const,
    blockedIPs: () => [...queryKeys.rateLimiting.all, 'blocked-ips'] as const,
    logs: () => [...queryKeys.rateLimiting.all, 'logs'] as const,
    settings: () => [...queryKeys.rateLimiting.all, 'settings'] as const,
    stats: () => [...queryKeys.rateLimiting.all, 'stats'] as const,
  },
  internetAccess: {
    all: ['internet-access'] as const,
    rules: () => [...queryKeys.internetAccess.all, 'rules'] as const,
  },
  securityMetrics: {
    all: ['security-metrics'] as const,
    overview: () => [...queryKeys.securityMetrics.all, 'overview'] as const,
  },
  auditLogs: {
    all: ['audit_logs'] as const,
    list: (filters?: unknown) => [...queryKeys.auditLogs.all, 'list', filters] as const,
  },
  agentKeys: {
    all: ['agent_keys'] as const,
    lists: () => [...queryKeys.agentKeys.all, 'list'] as const,
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
    monitoring: () => [...queryKeys.settings.all, 'monitoring'] as const,
    whatsapp: () => [...queryKeys.settings.all, 'whatsapp'] as const,
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
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    pending: () => [...queryKeys.notifications.all, 'pending'] as const,
    overtime: () => [...queryKeys.notifications.all, 'overtime'] as const,
  },
  geofences: {
    all: ['geofences'] as const,
    lists: () => [...queryKeys.geofences.all, 'list'] as const,
    active: () => [...queryKeys.geofences.all, 'active'] as const,
    detail: (id: string) => [...queryKeys.geofences.all, 'detail', id] as const,
  },
  mobileDevices: {
    all: ['mobile-devices'] as const,
    lists: () => [...queryKeys.mobileDevices.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.mobileDevices.all, 'detail', id] as const,
    locations: () => [...queryKeys.mobileDevices.all, 'locations'] as const,
  },
  activity: {
    all: ['activity'] as const,
    employee: (employeeId: string) => [...queryKeys.activity.all, 'employee', employeeId] as const,
    realtime: () => [...queryKeys.activity.all, 'realtime'] as const,
  },
  mapbox: {
    all: ['mapbox'] as const,
    token: () => [...queryKeys.mapbox.all, 'token'] as const,
  },
};

// ============================================================
// QUERY CLIENT INSTANCE
// ============================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIMES.STABLE,
      gcTime: CACHE_TIMES.STATIC,
      retry: (failureCount, error: unknown) => {
        const status = (error as { status?: number } | null | undefined)?.status;
        if (status === 404 || status === 403 || status === 401) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error: unknown, query) => {
      if (query.meta?.silent) return;
      logger.error(`[Query Error] ${query.queryKey}:`, error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: unknown) => {
      logger.error('[Mutation Error]:', error);
      toast.error((error as { message?: string } | null | undefined)?.message || 'Ocorreu um erro na operação');
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
  teams: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.teams.all });
  },
  violations: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.violations.all });
    client.invalidateQueries({ queryKey: queryKeys.dashboard.security() });
  },
  violationRules: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.violationRules.all });
  },
  reports: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.reports.all });
  },
  webhooks: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.webhooks.all });
  },
  workSchedules: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.workSchedules.all });
  },
  messageTemplates: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.messageTemplates.all });
  },
  mobileDevices: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.mobileDevices.all });
  },
  geofences: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.geofences.all });
  },
  internetAccess: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.internetAccess.all });
  },
  rateLimiting: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.rateLimiting.all });
  },
  notifications: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.notifications.all });
  },
  settings: (client: QueryClient) => {
    client.invalidateQueries({ queryKey: queryKeys.settings.all });
  },
};
