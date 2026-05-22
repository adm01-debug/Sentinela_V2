import { supabase } from '@/integrations/supabase/client';
import type { EmployeeCreateInput, EmployeeUpdateInput, EmployeeFilters } from '@/hooks/useEmployees';

export const employeeService = {
  async getEmployees(filters?: EmployeeFilters) {
    let query = supabase
      .from('employees')
      .select('*, devices:employee_devices(*)')
      .order('name');
    
    if (filters?.department) query = query.eq('department', filters.department);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getEmployeeById(id: string) {
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async createEmployee(data: EmployeeCreateInput) {
    const payload = { ...data };
    if (payload.name && !payload.full_name) payload.full_name = payload.name;
    if (payload.full_name && !payload.name) payload.name = payload.full_name;
    
    const { data: result, error } = await supabase.from('employees').insert(payload).select().single();
    if (error) throw error;
    return result;
  },

  async updateEmployee(id: string, data: EmployeeUpdateInput) {
    const payload = { ...data };
    if (payload.name && !payload.full_name) payload.full_name = payload.name;
    if (payload.full_name && !payload.name) payload.name = payload.full_name;

    const { data: result, error } = await supabase.from('employees').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return result;
  },

  async deleteEmployee(id: string) {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
  },

  async getEmployeeStats(id: string, startDate: string, endDate: string) {
    const [keystrokeLogs, violations, attendance] = await Promise.all([
      supabase
        .from('keystroke_logs')
        .select('recorded_at, keystrokes_count, active_time_seconds, idle_time_seconds')
        .eq('employee_name', id)
        .gte('recorded_at', startDate)
        .lte('recorded_at', endDate),
      supabase
        .from('security_violations')
        .select('id', { count: 'exact', head: true })
        .eq('employee_name', id)
        .gte('created_at', startDate)
        .lte('created_at', endDate),
      supabase
        .from('attendance_records')
        .select('total_worked_minutes, status')
        .eq('employee_id', id)
        .gte('date', startDate)
        .lte('date', endDate)
    ]);

    if (keystrokeLogs.error) throw keystrokeLogs.error;
    if (violations.error) throw violations.error;
    if (attendance.error) throw attendance.error;

    return {
      keystrokeLogs: keystrokeLogs.data || [],
      violationCount: violations.count || 0,
      attendance: attendance.data || []
    };
  },

  async assignDevice(employeeId: string, name: string, type: string, primary: boolean) {
    const { data, error } = await supabase.from('employee_devices').insert({
      employee_id: employeeId,
      device_name: name,
      device_type: type,
      is_primary: primary,
    }).select().single();
    
    if (error) throw error;
    return data;
  },

  async unassignDevice(deviceId: string) {
    const { error } = await supabase.from('employee_devices').delete().eq('id', deviceId);
    if (error) throw error;
  }
};

export default employeeService;
