// Core types for Sentinela

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  userId?: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface Violation {
  id: string;
  employeeId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'reviewed' | 'resolved';
  createdAt: Date;
}

export interface Activity {
  id: string;
  employeeId: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface Report {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: Record<string, unknown>;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
