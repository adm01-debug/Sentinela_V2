import type { Activity } from '@/types';

export const mockActivities: Activity[] = [
  { id: '1', employeeId: '1', type: 'app', application: 'VS Code', title: 'Desenvolvimento', duration: 3600, isProductive: true, startedAt: new Date() },
  { id: '2', employeeId: '1', type: 'website', application: 'Chrome', title: 'Pesquisa', duration: 1800, isProductive: true, startedAt: new Date() },
  { id: '3', employeeId: '2', type: 'app', application: 'Excel', title: 'Planilhas', duration: 2700, isProductive: true, startedAt: new Date() },
  { id: '4', employeeId: '3', type: 'idle', application: 'Sistema', title: 'Inativo', duration: 900, isProductive: false, startedAt: new Date() },
];
