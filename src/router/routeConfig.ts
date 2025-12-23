export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  EMPLOYEE_DETAIL: (id: string) => '/employees/' + id,
  TEAMS: '/teams',
  TEAM_DETAIL: (id: string) => '/teams/' + id,
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

export const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Colaboradores',
  '/teams': 'Equipes',
  '/reports': 'Relatórios',
  '/settings': 'Configurações',
};
