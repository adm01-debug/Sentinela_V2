import { QueryClient } from '@tanstack/react-query';

// ============================================================
// CONFIGURAÇÃO DE TEMPOS DE CACHE
// ============================================================

export const CACHE_TIMES = {
  // Dados em tempo real (10 segundos)
  REALTIME: 1000 * 10,
  
  // Dados frequentemente atualizados (1 minuto)
  FREQUENT: 1000 * 60,
  
  // Dados estáveis (5 minutos)
  STABLE: 1000 * 60 * 5,
  
  // Dados raramente mudam (15 minutos)
  STATIC: 1000 * 60 * 15,
  
  // Dados que quase nunca mudam (1 hora)
  IMMUTABLE: 1000 * 60 * 60,
} as const;

export const REFETCH_INTERVALS = {
  REALTIME: 1000 * 10,    // 10 segundos
  FREQUENT: 1000 * 30,    // 30 segundos
  NORMAL: 1000 * 60,      // 1 minuto
  SLOW: 1000 * 60 * 5,    // 5 minutos
} as const;

// ============================================================
// QUERY KEYS CENTRALIZADAS - COMPLETAS
// ============================================================

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    mfa: () => [...queryKeys.auth.all, 'mfa'] as const,
  },
  
  // Employees
  employees: {
    all: ['employees'] as const,
    lists: () => [...queryKeys.employees.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.employees.lists(), filters] as const,
    details: () => [...queryKeys.employees.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.employees.details(), id] as const,
    stats: (id: string) => [...queryKeys.employees.all, 'stats', id] as const,
    active: () => [...queryKeys.employees.all, 'active'] as const,
    online: () => [...queryKeys.employees.all, 'online'] as const,
  },
  
  // Teams
  teams: {
    all: ['teams'] as const,
    lists: () => [...queryKeys.teams.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.teams.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.teams.all, 'detail', id] as const,
    members: (id: string) => [...queryKeys.teams.all, 'members', id] as const,
  },
  
  // Devices
  devices: {
    all: ['devices'] as const,
    lists: () => [...queryKeys.devices.all, 'list'] as const,
    stats: () => [...queryKeys.devices.all, 'stats'] as const,
    detail: (id: string) => [...queryKeys.devices.all, 'detail', id] as const,
    byEmployee: (employeeId: string) => [...queryKeys.devices.all, 'employee', employeeId] as const,
  },
  
  // Violations
  violations: {
    all: ['violations'] as const,
    lists: () => [...queryKeys.violations.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.violations.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.violations.all, 'detail', id] as const,
    comments: (id: string) => [...queryKeys.violations.all, 'comments', id] as const,
    actions: (id: string) => [...queryKeys.violations.all, 'actions', id] as const,
    unread: () => [...queryKeys.violations.all, 'unread'] as const,
    byEmployee: (employeeId: string) => [...queryKeys.violations.all, 'employee', employeeId] as const,
    trend: (period?: string) => [...queryKeys.violations.all, 'trend', period] as const,
  },
  
  // Violation Rules
  violationRules: {
    all: ['violation-rules'] as const,
    lists: () => [...queryKeys.violationRules.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.violationRules.all, 'detail', id] as const,
    active: () => [...queryKeys.violationRules.all, 'active'] as const,
  },
  
  // Settings
  settings: {
    all: ['settings'] as const,
    monitoring: () => [...queryKeys.settings.all, 'monitoring'] as const,
    alerts: () => [...queryKeys.settings.all, 'alerts'] as const,
    whatsapp: () => [...queryKeys.settings.all, 'whatsapp'] as const,
    rateLimit: () => [...queryKeys.settings.all, 'rate-limit'] as const,
    general: () => [...queryKeys.settings.all, 'general'] as const,
    notifications: () => [...queryKeys.settings.all, 'notifications'] as const,
  },
  
  // Permissions & Roles
  permissions: {
    all: ['permissions'] as const,
    user: (userId: string) => [...queryKeys.permissions.all, 'user', userId] as const,
    roles: () => [...queryKeys.permissions.all, 'roles'] as const,
    check: (permission: string) => [...queryKeys.permissions.all, 'check', permission] as const,
  },
  
  // Users Management
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
  },
  
  // Work Schedules
  workSchedules: {
    all: ['work-schedules'] as const,
    lists: () => [...queryKeys.workSchedules.all, 'list'] as const,
    employee: (employeeId: string) => 
      [...queryKeys.workSchedules.all, 'employee', employeeId] as const,
    detail: (id: string) => [...queryKeys.workSchedules.all, 'detail', id] as const,
    active: () => [...queryKeys.workSchedules.all, 'active'] as const,
  },
  
  // Geofences
  geofences: {
    all: ['geofences'] as const,
    lists: () => [...queryKeys.geofences.all, 'list'] as const,
    active: () => [...queryKeys.geofences.all, 'active'] as const,
    detail: (id: string) => [...queryKeys.geofences.all, 'detail', id] as const,
    events: (id?: string) => [...queryKeys.geofences.all, 'events', id] as const,
  },
  
  // Webhooks
  webhooks: {
    all: ['webhooks'] as const,
    lists: () => [...queryKeys.webhooks.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.webhooks.all, 'detail', id] as const,
    logs: (id: string) => [...queryKeys.webhooks.all, 'logs', id] as const,
    test: (id: string) => [...queryKeys.webhooks.all, 'test', id] as const,
  },
  
  // Message Templates
  messageTemplates: {
    all: ['message-templates'] as const,
    lists: () => [...queryKeys.messageTemplates.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.messageTemplates.all, 'detail', id] as const,
    byType: (type: string) => [...queryKeys.messageTemplates.all, 'type', type] as const,
  },
  
  // Gamification
  gamification: {
    all: ['gamification'] as const,
    badges: () => [...queryKeys.gamification.all, 'badges'] as const,
    employeeBadges: (employeeId: string) => 
      [...queryKeys.gamification.all, 'employee-badges', employeeId] as const,
    points: (employeeId: string) => 
      [...queryKeys.gamification.all, 'points', employeeId] as const,
    leaderboard: (period: string) => 
      [...queryKeys.gamification.all, 'leaderboard', period] as const,
    achievements: () => [...queryKeys.gamification.all, 'achievements'] as const,
    streaks: (employeeId: string) => 
      [...queryKeys.gamification.all, 'streaks', employeeId] as const,
  },
  
  // Saved Filters
  savedFilters: {
    all: ['saved-filters'] as const,
    module: (module: string, userId?: string) => 
      [...queryKeys.savedFilters.all, module, userId] as const,
    user: (userId: string) => [...queryKeys.savedFilters.all, 'user', userId] as const,
  },
  
  // Audit Logs
  auditLogs: {
    all: ['audit-logs'] as const,
    lists: () => [...queryKeys.auditLogs.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.auditLogs.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.auditLogs.all, 'detail', id] as const,
    user: (userId: string) => [...queryKeys.auditLogs.all, 'user', userId] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    activity: () => [...queryKeys.dashboard.all, 'activity'] as const,
    security: () => [...queryKeys.dashboard.all, 'security'] as const,
    layout: () => [...queryKeys.dashboard.all, 'layout'] as const,
    widgets: () => [...queryKeys.dashboard.all, 'widgets'] as const,
  },
  
  // Reports
  reports: {
    all: ['reports'] as const,
    scheduled: () => [...queryKeys.reports.all, 'scheduled'] as const,
    history: () => [...queryKeys.reports.all, 'history'] as const,
    detail: (id: string) => [...queryKeys.reports.all, 'detail', id] as const,
    generate: (type: string) => [...queryKeys.reports.all, 'generate', type] as const,
  },
  
  // Mobile Devices
  mobileDevices: {
    all: ['mobile-devices'] as const,
    lists: () => [...queryKeys.mobileDevices.all, 'list'] as const,
    locations: () => [...queryKeys.mobileDevices.all, 'locations'] as const,
    detail: (id: string) => [...queryKeys.mobileDevices.all, 'detail', id] as const,
    status: (id: string) => [...queryKeys.mobileDevices.all, 'status', id] as const,
  },
  
  // Activity
  activity: {
    all: ['activity'] as const,
    realtime: () => [...queryKeys.activity.all, 'realtime'] as const,
    employee: (employeeId: string) => 
      [...queryKeys.activity.all, 'employee', employeeId] as const,
    screenshots: (employeeId: string) => 
      [...queryKeys.activity.all, 'screenshots', employeeId] as const,
    keystrokes: (employeeId: string) => 
      [...queryKeys.activity.all, 'keystrokes', employeeId] as const,
    applications: (employeeId: string) => 
      [...queryKeys.activity.all, 'applications', employeeId] as const,
    websites: (employeeId: string) => 
      [...queryKeys.activity.all, 'websites', employeeId] as const,
  },
  
  // Rate Limiting
  rateLimiting: {
    all: ['rate-limiting'] as const,
    settings: () => [...queryKeys.rateLimiting.all, 'settings'] as const,
    logs: () => [...queryKeys.rateLimiting.all, 'logs'] as const,
    stats: () => [...queryKeys.rateLimiting.all, 'stats'] as const,
    blockedIPs: () => [...queryKeys.rateLimiting.all, 'blocked-ips'] as const,
  },
  
  // Internet Access
  internetAccess: {
    all: ['internet-access'] as const,
    rules: () => [...queryKeys.internetAccess.all, 'rules'] as const,
    logs: () => [...queryKeys.internetAccess.all, 'logs'] as const,
    blockedSites: () => [...queryKeys.internetAccess.all, 'blocked-sites'] as const,
  },
  
  // Policies
  policies: {
    all: ['policies'] as const,
    lists: () => [...queryKeys.policies.all, 'list'] as const,
    acknowledgments: () => [...queryKeys.policies.all, 'acknowledgments'] as const,
    employee: (employeeId: string) => [...queryKeys.policies.all, 'employee', employeeId] as const,
    pending: () => [...queryKeys.policies.all, 'pending'] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    overtime: () => [...queryKeys.notifications.all, 'overtime'] as const,
    pending: () => [...queryKeys.notifications.all, 'pending'] as const,
  },
  
  // MFA
  mfa: {
    all: ['mfa'] as const,
    status: () => [...queryKeys.mfa.all, 'status'] as const,
    factors: () => [...queryKeys.mfa.all, 'factors'] as const,
    challenge: () => [...queryKeys.mfa.all, 'challenge'] as const,
  },
  
  // Export
  export: {
    all: ['export'] as const,
    history: () => [...queryKeys.export.all, 'history'] as const,
    pending: () => [...queryKeys.export.all, 'pending'] as const,
  },
  
  // Security Metrics
  securityMetrics: {
    all: ['security-metrics'] as const,
    overview: () => [...queryKeys.securityMetrics.all, 'overview'] as const,
    threats: () => [...queryKeys.securityMetrics.all, 'threats'] as const,
    compliance: () => [...queryKeys.securityMetrics.all, 'compliance'] as const,
  },
  
  // Mapbox
  mapbox: {
    all: ['mapbox'] as const,
    token: () => [...queryKeys.mapbox.all, 'token'] as const,
  },
  
  // Productivity
  productivity: {
    all: ['productivity'] as const,
    comparison: (filters?: Record<string, unknown>) => 
      [...queryKeys.productivity.all, 'comparison', filters] as const,
    trends: (period?: string) => [...queryKeys.productivity.all, 'trends', period] as const,
    employee: (employeeId: string) => [...queryKeys.productivity.all, 'employee', employeeId] as const,
  },
  
  // AI Analysis
  aiAnalysis: {
    all: ['ai-analysis'] as const,
    results: () => [...queryKeys.aiAnalysis.all, 'results'] as const,
    pending: () => [...queryKeys.aiAnalysis.all, 'pending'] as const,
    employee: (employeeId: string) => [...queryKeys.aiAnalysis.all, 'employee', employeeId] as const,
  },
  
  // Agent Keys
  agentKeys: {
    all: ['agent-keys'] as const,
    lists: () => [...queryKeys.agentKeys.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.agentKeys.all, 'detail', id] as const,
    active: () => [...queryKeys.agentKeys.all, 'active'] as const,
  },
  
  // Sensitive Keywords
  sensitiveKeywords: {
    all: ['sensitive-keywords'] as const,
    lists: () => [...queryKeys.sensitiveKeywords.all, 'list'] as const,
    matches: () => [...queryKeys.sensitiveKeywords.all, 'matches'] as const,
  },
} as const;

// ============================================================
// QUERY PRESETS (configurações pré-definidas)
// ============================================================

export const queryPresets = {
  // Para listas que podem mudar frequentemente
  list: {
    staleTime: CACHE_TIMES.FREQUENT,
    gcTime: CACHE_TIMES.STABLE,
  },
  
  // Para detalhes de itens individuais
  detail: {
    staleTime: CACHE_TIMES.STABLE,
    gcTime: CACHE_TIMES.STATIC,
  },
  
  // Para dados em tempo real
  realtime: {
    staleTime: CACHE_TIMES.REALTIME,
    gcTime: CACHE_TIMES.FREQUENT,
    refetchInterval: REFETCH_INTERVALS.REALTIME,
  },
  
  // Para configurações que raramente mudam
  config: {
    staleTime: CACHE_TIMES.STATIC,
    gcTime: CACHE_TIMES.IMMUTABLE,
  },
  
  // Para dados imutáveis
  immutable: {
    staleTime: CACHE_TIMES.IMMUTABLE,
    gcTime: CACHE_TIMES.IMMUTABLE,
  },
  
  // Para dashboard e stats
  dashboard: {
    staleTime: CACHE_TIMES.FREQUENT,
    gcTime: CACHE_TIMES.STABLE,
    refetchInterval: REFETCH_INTERVALS.NORMAL,
  },
  
  // Para ações/mutações com refetch rápido
  mutation: {
    staleTime: 0,
    gcTime: CACHE_TIMES.REALTIME,
  },
} as const;

// ============================================================
// FUNÇÕES DE INVALIDAÇÃO RELACIONADA
// ============================================================

export const invalidateRelated = {
  employees: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
  },
  
  teams: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
  },
  
  violations: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.violations.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.security() });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  },
  
  settings: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
  },
  
  gamification: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.gamification.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
  },
  
  policies: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.policies.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
  },
  
  workSchedules: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workSchedules.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
  },
  
  geofences: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.mobileDevices.all });
  },
  
  webhooks: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.all });
  },
  
  messageTemplates: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.messageTemplates.all });
  },
  
  users: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
  },
  
  rateLimiting: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.rateLimiting.all });
  },
  
  mobileDevices: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.mobileDevices.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
  },
  
  activity: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.activity.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.activity() });
  },
  
  notifications: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  },
  
  auditLogs: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
  },
  
  reports: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  },
  
  violationRules: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.violationRules.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.violations.all });
  },
  
  internetAccess: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.internetAccess.all });
  },
  
  agentKeys: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.agentKeys.all });
  },
  
  sensitiveKeywords: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.sensitiveKeywords.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.violations.all });
  },
  
  // Invalidar tudo (para logout, etc)
  all: (queryClient: QueryClient) => {
    queryClient.invalidateQueries();
  },
};

// ============================================================
// CONFIGURAÇÃO DO QUERY CLIENT
// ============================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIMES.FREQUENT,
      gcTime: CACHE_TIMES.STABLE,
      retry: (failureCount, error) => {
        // Não retry em erros de autenticação
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status === 401 || status === 403) return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('[Mutation Error]', error);
      },
    },
  },
});

// ============================================================
// HELPER PARA PREFETCH
// ============================================================

export const prefetchQueries = {
  dashboard: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.stats(),
        staleTime: CACHE_TIMES.FREQUENT,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.employees.lists(),
        staleTime: CACHE_TIMES.FREQUENT,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.violations.unread(),
        staleTime: CACHE_TIMES.REALTIME,
      }),
    ]);
  },
  
  employees: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.employees.lists(),
      staleTime: CACHE_TIMES.FREQUENT,
    });
  },
  
  violations: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.violations.lists(),
      staleTime: CACHE_TIMES.FREQUENT,
    });
  },
};

// ============================================================
// EXPORTS
// ============================================================

export default queryClient;
