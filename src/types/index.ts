// Core Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  teamId?: string;
  status: EmployeeStatus;
  createdAt: Date;
}

export type EmployeeStatus = 'active' | 'inactive' | 'suspended';

export interface Violation {
  id: string;
  employeeId: string;
  type: ViolationType;
  severity: Severity;
  description: string;
  createdAt: Date;
}

export type ViolationType = 'security' | 'policy' | 'productivity' | 'access';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Activity {
  id: string;
  employeeId: string;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
