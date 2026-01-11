export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  phone?: string;
  hireDate: string;
  manager?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeStats {
  totalHours: number;
  productivity: number;
  activeTime: number;
  idleTime: number;
  topApplications: Array<{ name: string; duration: number }>;
  activityByHour: Array<{ hour: number; count: number }>;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
  sortBy?: 'name' | 'department' | 'status' | 'hireDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type CreateEmployeeInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;