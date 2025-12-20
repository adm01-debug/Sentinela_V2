import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MonitoringEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'online' | 'offline' | 'idle' | 'busy';
  last_activity: string;
  current_app?: string;
  current_url?: string;
  productivity_score: number;
  device_id?: string;
}

export interface ActivitySummary {
  total_keystrokes: number;
  total_clicks: number;
  total_active_time: number;
  total_idle_time: number;
  top_apps: Array<{ name: string; duration: number }>;
  top_urls: Array<{ domain: string; visits: number }>;
}

export function useMonitoringPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<MonitoringEmployee | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);

  // Real-time employees status
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['monitoring-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;

      return data.map(emp => {
        const status: 'online' | 'offline' | 'idle' | 'busy' = 'offline';

        return {
          id: emp.id,
          name: emp.name,
          email: emp.email || '',
          department: emp.department || 'Sem departamento',
          status,
          last_activity: emp.updated_at,
          productivity_score: 0,
        } as MonitoringEmployee;
      });
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Activity summary for selected employee
  const { data: activitySummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['employee-activity-summary', selectedEmployee?.id],
    queryFn: async () => {
      if (!selectedEmployee) return null;

      const today = new Date().toISOString().split('T')[0];
      
      const { data: keystrokeLogs } = await supabase
        .from('keystroke_logs')
        .select('*')
        .eq('employee_name', selectedEmployee.name)
        .gte('recorded_at', today);

      const { data: clickLogs } = await supabase
        .from('click_logs')
        .select('*')
        .eq('employee_name', selectedEmployee.name)
        .gte('recorded_at', today);

      const totalKeystrokes = keystrokeLogs?.reduce((sum, a) => sum + (a.keystrokes_count || 0), 0) || 0;
      const totalClicks = clickLogs?.length || 0;
      const totalIdle = keystrokeLogs?.reduce((sum, a) => sum + (a.idle_time_seconds || 0), 0) || 0;
      const totalActive = keystrokeLogs?.reduce((sum, a) => sum + (a.active_time_seconds || 0), 0) || 0;

      return {
        total_keystrokes: totalKeystrokes,
        total_clicks: totalClicks,
        total_active_time: totalActive,
        total_idle_time: totalIdle,
        top_apps: [],
        top_urls: [],
      } as ActivitySummary;
    },
    enabled: !!selectedEmployee,
  });

  // Departments list
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return Array.from(depts).sort();
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = !searchTerm || 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, searchTerm, statusFilter, departmentFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: employees.length,
    online: employees.filter(e => e.status === 'online').length,
    busy: employees.filter(e => e.status === 'busy').length,
    idle: employees.filter(e => e.status === 'idle').length,
    offline: employees.filter(e => e.status === 'offline').length,
    avgProductivity: employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + e.productivity_score, 0) / employees.length)
      : 0,
  }), [employees]);

  const handleSelectEmployee = useCallback((employee: MonitoringEmployee | null) => {
    setSelectedEmployee(employee);
  }, []);

  return {
    selectedEmployee,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    departmentFilter,
    setDepartmentFilter,
    searchTerm,
    setSearchTerm,
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    employees: filteredEmployees,
    allEmployees: employees,
    departments,
    activitySummary,
    stats,
    isLoadingEmployees,
    isLoadingSummary,
    handleSelectEmployee,
  };
}