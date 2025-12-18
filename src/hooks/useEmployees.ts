import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  name: string;
  email: string | null;
  department: string | null;
  position: string | null;
  team_id: string | null;
  status: string;
  hire_date: string | null;
  phone: string | null;
  avatar_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface EmployeeDevice {
  id: string;
  employee_id: string;
  device_name: string;
  device_type: string | null;
  agent_key_id: string | null;
  is_primary: boolean | null;
  assigned_at: string;
}

export interface EmployeeWithDetails extends Employee {
  devices: EmployeeDevice[];
  team?: {
    id: string;
    name: string;
  } | null;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (employeesError) throw employeesError;

      // Fetch teams for mapping
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name');

      if (teamsError) throw teamsError;

      // Fetch employee devices
      const { data: devicesData, error: devicesError } = await supabase
        .from('employee_devices')
        .select('*');

      if (devicesError) throw devicesError;

      // Combine data
      const employeesWithDetails: EmployeeWithDetails[] = (employeesData || []).map(emp => ({
        ...emp,
        devices: (devicesData || []).filter(d => d.employee_id === emp.id),
        team: teamsData?.find(t => t.id === emp.team_id) || null
      }));

      setEmployees(employeesWithDetails);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast.error('Erro ao carregar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('employees')
        .insert({
          ...employee,
          created_by: userData.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Colaborador criado com sucesso');
      await fetchEmployees();
      return data;
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast.error('Erro ao criar colaborador');
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Colaborador atualizado com sucesso');
      await fetchEmployees();
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast.error('Erro ao atualizar colaborador');
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Colaborador excluído com sucesso');
      await fetchEmployees();
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast.error('Erro ao excluir colaborador');
      throw error;
    }
  };

  const assignDevice = async (employeeId: string, deviceName: string, deviceType: string = 'desktop', isPrimary: boolean = false) => {
    try {
      const { error } = await supabase
        .from('employee_devices')
        .insert({
          employee_id: employeeId,
          device_name: deviceName,
          device_type: deviceType,
          is_primary: isPrimary
        });

      if (error) throw error;

      toast.success('Dispositivo vinculado com sucesso');
      await fetchEmployees();
    } catch (error: any) {
      console.error('Error assigning device:', error);
      toast.error('Erro ao vincular dispositivo');
      throw error;
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('employee_devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      toast.success('Dispositivo removido com sucesso');
      await fetchEmployees();
    } catch (error: any) {
      console.error('Error removing device:', error);
      toast.error('Erro ao remover dispositivo');
      throw error;
    }
  };

  const assignToTeam = async (employeeId: string, teamId: string | null) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ team_id: teamId })
        .eq('id', employeeId);

      if (error) throw error;

      toast.success(teamId ? 'Colaborador vinculado à equipe' : 'Colaborador removido da equipe');
      await fetchEmployees();
    } catch (error: any) {
      console.error('Error assigning to team:', error);
      toast.error('Erro ao vincular à equipe');
      throw error;
    }
  };

  return {
    employees,
    loading,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    assignDevice,
    removeDevice,
    assignToTeam,
    refetch: fetchEmployees
  };
}
