import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

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
        .select(\`
          *,
          devices(device_id, last_seen, is_online),
          activity_logs(keystrokes, mouse_clicks, idle_time, recorded_at)
        \`)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;

      return data.map(emp => {
        const device = emp.devices?.[0];
        const recentActivity = emp.activity_logs?.slice(0, 10) || [];
        const totalKeystrokes = recentActivity.reduce((sum: number, a: any) => sum + (a.keystrokes || 0), 0);
        
        let status: 'online' | 'offline' | 'idle' | 'busy' = 'offline';
        if (device?.is_online) {
          const lastActivity = recentActivity[0];
          if (lastActivity?.idle_time > 300) {
            status = 'idle';
          } else if (totalKeystrokes > 100) {
            status = 'busy';
          } else {
            status = 'online';
          }
        }

        return {
          id: emp.id,
          name: emp.name,
          email: emp.email,
          department: emp.department || 'Sem departamento',
          status,
          last_activity: device?.last_seen || emp.updated_at,
          device_id: device?.device_id,
          productivity_score: Math.min(100, Math.round((totalKeystrokes / 500) * 100)),
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
      
      const { data: activity } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('employee_id', selectedEmployee.id)
        .gte('recorded_at', today);

      const { data: apps } = await supabase
        .from('application_usage')
        .select('app_name, duration_seconds')
        .eq('employee_id', selectedEmployee.id)
        .gte('start_time', today);

      const { data: urls } = await supabase
        .from('url_visits')
        .select('url')
        .eq('employee_id', selectedEmployee.id)
        .gte('visit_time', today);

      const totalKeystrokes = activity?.reduce((sum, a) => sum + (a.keystrokes || 0), 0) || 0;
      const totalClicks = activity?.reduce((sum, a) => sum + (a.mouse_clicks || 0), 0) || 0;
      const totalIdle = activity?.reduce((sum, a) => sum + (a.idle_time || 0), 0) || 0;

      // Aggregate apps
      const appMap = new Map<string, number>();
      apps?.forEach(app => {
        appMap.set(app.app_name, (appMap.get(app.app_name) || 0) + app.duration_seconds);
      });
      const topApps = Array.from(appMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, duration]) => ({ name, duration }));

      // Aggregate URLs
      const domainMap = new Map<string, number>();
      urls?.forEach(u => {
        try {
          const domain = new URL(u.url).hostname;
          domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
        } catch {}
      });
      const topUrls = Array.from(domainMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([domain, visits]) => ({ domain, visits }));

      return {
        total_keystrokes: totalKeystrokes,
        total_clicks: totalClicks,
        total_active_time: (activity?.length || 0) * 60 - totalIdle,
        total_idle_time: totalIdle,
        top_apps: topApps,
        top_urls: topUrls,
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
