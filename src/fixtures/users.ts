import type { User } from '@/types';

export const mockUsers: User[] = [
  { id: '1', email: 'admin@sentinela.com', name: 'Admin User', role: 'admin', createdAt: new Date('2024-01-01') },
  { id: '2', email: 'manager@sentinela.com', name: 'Manager User', role: 'manager', createdAt: new Date('2024-01-15') },
  { id: '3', email: 'user@sentinela.com', name: 'Regular User', role: 'user', createdAt: new Date('2024-02-01') },
];

export const mockCurrentUser: User = mockUsers[0];
