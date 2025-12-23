import type { Team } from '@/types';

export const mockTeams: Team[] = [
  { id: '1', name: 'Desenvolvimento', description: 'Time de desenvolvimento de software', leaderId: '1', memberCount: 8, createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Recursos Humanos', description: 'Time de RH', leaderId: '2', memberCount: 5, createdAt: new Date('2024-01-01') },
  { id: '3', name: 'Comercial', description: 'Time de vendas', leaderId: '3', memberCount: 12, createdAt: new Date('2024-01-01') },
];
