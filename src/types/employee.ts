export interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  team_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  hire_date?: string;
  manager_id?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeWithRelations extends Employee {
  team?: {
    id: string;
    name: string;
    manager_id?: string;
  };
  manager?: {
    id: string;
    name: string;
  };
  devices?: Device[];
}

export interface Device {
  id: string;
  device_id: string;
  employee_id: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  device_name?: string;
  os?: string;
  os_version?: string;
  agent_version?: string;
  last_seen?: string;
  is_online: boolean;
  created_at: string;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  department?: string;
  position?: string;
  team_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
}

export interface EmployeeFilters {
  search?: string;
  status?: string;
  department?: string;
  team_id?: string;
}
