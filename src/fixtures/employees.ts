import type { Employee } from '@/types';

export const mockEmployees: Employee[] = [
  { id: '1', userId: '1', name: 'João Silva', email: 'joao@empresa.com', department: 'TI', position: 'Desenvolvedor', status: 'active', teamId: '1', createdAt: new Date('2024-01-01') },
  { id: '2', userId: '2', name: 'Maria Santos', email: 'maria@empresa.com', department: 'RH', position: 'Analista', status: 'active', teamId: '2', createdAt: new Date('2024-01-15') },
  { id: '3', userId: '3', name: 'Pedro Costa', email: 'pedro@empresa.com', department: 'Vendas', position: 'Vendedor', status: 'inactive', teamId: '3', createdAt: new Date('2024-02-01') },
];
