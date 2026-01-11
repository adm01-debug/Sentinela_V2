export const endpoints = {
  auth: { login: '/auth/login', logout: '/auth/logout', refresh: '/auth/refresh', me: '/auth/me' },
  employees: { list: '/employees', get: (id: string) => '/employees/' + id, create: '/employees', update: (id: string) => '/employees/' + id, delete: (id: string) => '/employees/' + id },
  activities: { list: '/activities', get: (id: string) => '/activities/' + id, byEmployee: (id: string) => '/employees/' + id + '/activities' },
  reports: { list: '/reports', get: (id: string) => '/reports/' + id, generate: '/reports/generate', download: (id: string) => '/reports/' + id + '/download' },
  alerts: { list: '/alerts', get: (id: string) => '/alerts/' + id, acknowledge: (id: string) => '/alerts/' + id + '/acknowledge' },
  settings: { get: '/settings', update: '/settings' },
  dashboard: { stats: '/dashboard/stats', widgets: '/dashboard/widgets' },
};
