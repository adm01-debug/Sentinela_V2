// Department types for Sentinela v17

export interface Department {
  id: string;
  name: string;
  description?: string;
  code: string;
  slug: string;
  managerId?: string;
  parentDepartmentId?: string;
  parentDepartment?: Department;
  childDepartments?: Department[];
  teams: DepartmentTeam[];
  teamCount: number;
  employeeCount: number;
  isActive: boolean;
  budget?: DepartmentBudget;
  settings: DepartmentSettings;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DepartmentTeam {
  id: string;
  name: string;
  memberCount: number;
}

export interface DepartmentBudget {
  annual: number;
  spent: number;
  remaining: number;
  currency: string;
}

export interface DepartmentSettings {
  allowCrossTeamCollaboration: boolean;
  requireManagerApproval: boolean;
  visibility: "public" | "private";
  workingHours: WorkingHours;
}

export interface WorkingHours {
  start: string;
  end: string;
  timezone: string;
  workDays: number[];
}

export interface DepartmentCreateInput {
  name: string;
  description?: string;
  code: string;
  managerId?: string;
  parentDepartmentId?: string;
  settings?: Partial<DepartmentSettings>;
}

export interface DepartmentUpdateInput {
  name?: string;
  description?: string;
  code?: string;
  managerId?: string;
  parentDepartmentId?: string;
  isActive?: boolean;
  budget?: Partial<DepartmentBudget>;
  settings?: Partial<DepartmentSettings>;
}

export interface DepartmentFilters {
  search?: string;
  managerId?: string;
  parentDepartmentId?: string;
  isActive?: boolean;
  hasTeams?: boolean;
}

export interface DepartmentStats {
  total: number;
  active: number;
  totalEmployees: number;
  totalTeams: number;
}

export interface DepartmentHierarchy {
  department: Department;
  children: DepartmentHierarchy[];
  level: number;
}
