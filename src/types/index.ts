export * from './employee';
export * from './activity';
export * from './alert';
export * from './report';
export * from './settings';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ip: string;
  location?: string;
  current: boolean;
  lastActive: string;
  createdAt: string;
}