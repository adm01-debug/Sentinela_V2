/**
 * Employee Types
 * Core type definitions for employee-related entities
 */

export type EmployeeStatus = "active" | "inactive" | "suspended" | "pending";
export type EmployeeRole = "admin" | "manager" | "supervisor" | "employee" | "contractor";

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: EmployeeRole;
  department: string;
  team_id?: string;
  manager_id?: string;
  status: EmployeeStatus;
  hire_date?: string;
  termination_date?: string;
  organization_id: string;
  metadata?: EmployeeMetadata;
  created_at: string;
  updated_at: string;
}

export interface EmployeeMetadata {
  timezone?: string;
  locale?: string;
  work_schedule_id?: string;
  custom_fields?: unknown;
}

export interface EmployeeLocation {
  id: string;
  employee_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  device_id?: string;
  timestamp: string;
}

export interface EmployeeActivity {
  id: string;
  employee_id: string;
  activity_type: ActivityType;
  application?: string;
  window_title?: string;
  url?: string;
  duration_seconds: number;
  is_productive?: boolean;
  category?: string;
  started_at: string;
  ended_at?: string;
}

export type ActivityType = "application" | "website" | "idle" | "meeting" | "break" | "offline";

export interface EmployeeProductivity {
  id: string;
  employee_id: string;
  date: string;
  productivity_score: number;
  active_time_seconds: number;
  idle_time_seconds: number;
  productive_time_seconds: number;
  unproductive_time_seconds: number;
  neutral_time_seconds: number;
  tasks_completed?: number;
  focus_score?: number;
}

export interface EmployeeAttendance {
  id: string;
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  break_start?: string;
  break_end?: string;
  total_hours?: number;
  overtime_hours?: number;
  status: AttendanceStatus;
  notes?: string;
}

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "half_day"
  | "remote"
  | "holiday"
  | "sick_leave"
  | "vacation";

export interface EmployeeDevice {
  id: string;
  employee_id: string;
  device_id: string;
  device_name: string;
  device_type: DeviceType;
  os: string;
  os_version: string;
  agent_version?: string;
  last_seen_at?: string;
  is_primary: boolean;
  is_approved: boolean;
}

export type DeviceType = "desktop" | "laptop" | "mobile" | "tablet";

// Filter and query types
export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus | EmployeeStatus[];
  role?: EmployeeRole | EmployeeRole[];
  department?: string | string[];
  team_id?: string;
  manager_id?: string;
  hire_date_from?: string;
  hire_date_to?: string;
}

export interface EmployeeSort {
  field: keyof Employee;
  direction: "asc" | "desc";
}

export interface EmployeePagination {
  page: number;
  limit: number;
}

export interface EmployeeQueryOptions {
  filters?: EmployeeFilters;
  sort?: EmployeeSort;
  pagination?: EmployeePagination;
  include?: ("team" | "manager" | "devices" | "location")[];
}

// Create and update types
export interface EmployeeCreateInput {
  full_name: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  department: string;
  team_id?: string;
  manager_id?: string;
  hire_date?: string;
  organization_id: string;
  metadata?: EmployeeMetadata;
}

export interface EmployeeUpdateInput extends Partial<EmployeeCreateInput> {
  status?: EmployeeStatus;
  avatar_url?: string;
  termination_date?: string;
}

export interface EmployeeBulkAction {
  action: "activate" | "deactivate" | "suspend" | "delete" | "assign_team" | "assign_manager";
  employee_ids: string[];
  params?: unknown;
}

// Response types
export interface EmployeeListResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface EmployeeWithRelations extends Employee {
  team?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    full_name: string;
  };
  devices?: EmployeeDevice[];
  current_location?: EmployeeLocation;
}
