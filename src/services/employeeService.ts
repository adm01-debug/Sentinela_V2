import { supabase } from '@/integrations/supabase/client';

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  organization_id: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  phone?: string;
  hire_date?: string;
}

export interface EmployeeFilters {
  search?: string;
  status?: string;
  department?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface EmployeeCreateData {
  full_name: string;
  email: string;
  role: string;
  department: string;
  organization_id: string;
  phone?: string;
  hire_date?: string;
}

export interface EmployeeUpdateData extends Partial<EmployeeCreateData> {
  status?: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const employeeService = {
  /**
   * Get all employees with optional filters and pagination
   */
  async getAll(filters: EmployeeFilters = {}): Promise<PaginatedResponse<Employee>> {
    const { search, status, department, role, page = 1, limit = 10 } = filters;
    
    let query = supabase
      .from('employees')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (department) {
      query = query.eq('department', department);
    }
    if (role) {
      query = query.eq('role', role);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: (data as Employee[]) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Employee;
  },

  /**
   * Create a new employee
   */
  async create(employeeData: EmployeeCreateData): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert([{ ...employeeData, status: 'active' }])
      .select()
      .single();

    if (error) throw error;
    return data as Employee;
  },

  /**
   * Update an employee
   */
  async update(id: string, updates: EmployeeUpdateData): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Employee;
  },

  /**
   * Delete an employee (soft delete by setting status to inactive)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Hard delete an employee
   */
  async hardDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Bulk update employees status
   */
  async bulkUpdateStatus(ids: string[], status: Employee['status']): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (error) throw error;
  },

  /**
   * Get employee statistics
   */
  async getStatistics(organizationId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byDepartment: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('employees')
      .select('status, department')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      active: 0,
      inactive: 0,
      suspended: 0,
      byDepartment: {} as Record<string, number>,
    };

    data?.forEach((emp) => {
      if (emp.status === 'active') stats.active++;
      else if (emp.status === 'inactive') stats.inactive++;
      else if (emp.status === 'suspended') stats.suspended++;

      if (emp.department) {
        stats.byDepartment[emp.department] = (stats.byDepartment[emp.department] || 0) + 1;
      }
    });

    return stats;
  },
};

export default employeeService;
