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
// QUERY KEYS CENTRALIZADAS
// ============================================================

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
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
  },
  
  // Teams
  teams: {
    all: ['teams'] as const,
    lists: () => [...queryKeys.teams.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.teams.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.teams.all, 'detail', id] as const,
  },
  
  // Devices
  devices: {
    all: ['devices'] as const,
    lists: () => [...queryKeys.devices.all, 'list'] as const,
    stats: () => [...queryKeys.devices.all, 'stats'] as const,
    detail: (id: string) => [...queryKeys.devices.all, 'detail', id] as const,
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
  },
  
  // Violation Rules
  violationRules: {
    all: ['violation-rules'] as const,
    lists: () => [...queryKeys.violationRules.all, 'list'] as const,
  },
  
  // Settings
  settings: {
    all: ['settings'] as const,
    monitoring: () => [...queryKeys.settings.all, 'monitoring'] as const,
    alerts: () => [...queryKeys.settings.all, 'alerts'] as const,
    whatsapp: () => [...queryKeys.settings.all, 'whatsapp'] as const,
    rateLimit: () => [...queryKeys.settings.all, 'rate-limit'] as const,
  },
  
  // Permissions & Roles
  permissions: {
    all: ['permissions'] as const,
    user: (userId: string) => [...queryKeys.permissions.all, 'user', userId] as const,
    roles: () => [...queryKeys.permissions.all, 'roles'] as const,
  },
  
  // Users Management
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
  
  // Work Schedules
  workSchedules: {
    all: ['work-schedules'] as const,
    lists: () => [...queryKeys.workSchedules.all, 'list'] as const,
    employee: (employeeId: string) => 
      [...queryKeys.workSchedules.all, 'employee', employeeId] as const,
  },
  
  // Geofences
  geofences: {
    all: ['geofences'] as const,
    lists: () => [...queryKeys.geofences.all, 'list'] as const,
    active: () => [...queryKeys.geofences.all, 'active'] as const,
  },
  
  // Webhooks
  webhooks: {
    all: ['webhooks'] as const,
    lists: () => [...queryKeys.webhooks.all, 'list'] as const,
  },
  
  // Message Templates
  messageTemplates: {
    all: ['message-templates'] as const,
    lists: () => [...queryKeys.messageTemplates.all, 'list'] as const,
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
  },
  
  // Saved Filters
  savedFilters: {
    all: ['saved-filters'] as const,
    module: (module: string, userId?: string) => 
      [...queryKeys.savedFilters.all, module, userId] as const,
  },
  
  // Audit Logs
  auditLogs: {
    all: ['audit-logs'] as const,
    lists: () => [...queryKeys.auditLogs.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.auditLogs.lists(), filters] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    activity: () => [...queryKeys.dashboard.all, 'activity'] as const,
    security: () => [...queryKeys.dashboard.all, 'security'] as const,
  },
  
  // Reports
  reports: {
    all: ['reports'] as const,
    scheduled: () => [...queryKeys.reports.all, 'scheduled'] as const,
  },
  
  // Mobile Devices
  mobileDevices: {
    all: ['mobile-devices'] as const,
    lists: () => [...queryKeys.mobileDevices.all, 'list'] as const,
    locations: () => [...queryKeys.mobileDevices.all, 'locations'] as const,
  },
  
  // Activity
  activity: {
    all: ['activity'] as const,
    realtime: () => [...queryKeys.activity.all, 'realtime'] as const,
    employee: (employeeId: string) => 
      [...queryKeys.activity.all, 'employee', employeeId] as const,
  },
} as const;

// ============================================================
// QUERY PRESETS (configurações pré-definidas)
// ============================================================

export const queryPresets = {
  // Para dados em tempo real
  realtime: {
    staleTime: CACHE_TIMES.REALTIME,
    gcTime: CACHE_TIMES.FREQUENT,
    refetchInterval: REFETCH_INTERVALS.REALTIME,
    refetchOnWindowFocus: true,
  },
  
  // Para listas que mudam frequentemente
  list: {
    staleTime: CACHE_TIMES.FREQUENT,
    gcTime: CACHE_TIMES.STABLE,
    refetchOnWindowFocus: true,
  },
  
  // Para configurações
  config: {
    staleTime: CACHE_TIMES.STABLE,
    gcTime: CACHE_TIMES.STATIC,
    refetchOnWindowFocus: false,
  },
  
  // Para permissões (raramente mudam)
  permissions: {
    staleTime: CACHE_TIMES.STATIC,
    gcTime: CACHE_TIMES.IMMUTABLE,
    refetchOnWindowFocus: false,
  },
  
  // Para dados estáticos
  static: {
    staleTime: CACHE_TIMES.IMMUTABLE,
    gcTime: CACHE_TIMES.IMMUTABLE,
    refetchOnWindowFocus: false,
  },
} as const;

// ============================================================
// HELPERS PARA INVALIDAÇÃO
// ============================================================

export const invalidateRelated = {
  // Quando um funcionário muda
  employee: (queryClient: QueryClient, employeeId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    if (employeeId) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.gamification.points(employeeId) 
      });
    }
  },
  
  // Quando uma violação muda
  violation: (queryClient: QueryClient, violationId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.violations.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.security() });
    if (violationId) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.violations.comments(violationId) 
      });
    }
  },
  
  // Quando configurações mudam
  settings: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
  },
  
  // Quando permissões mudam
  permissions: (queryClient: QueryClient, userId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    if (userId) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.permissions.user(userId) 
      });
    }
  },
  
  // Invalidar tudo do dashboard
  dashboard: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  },
};

// ============================================================
// QUERY CLIENT INSTANCE
// ============================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIMES.FREQUENT,
      gcTime: CACHE_TIMES.STABLE,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default queryClient;
