import type { Report } from '@/types';

export const mockReports: Report[] = [
  { id: '1', name: 'Relatório Semanal', type: 'weekly', status: 'completed', createdAt: new Date(), createdBy: '1' },
  { id: '2', name: 'Relatório Mensal', type: 'monthly', status: 'completed', createdAt: new Date(), createdBy: '1' },
  { id: '3', name: 'Relatório de Produtividade', type: 'productivity', status: 'pending', createdAt: new Date(), createdBy: '2' },
];
