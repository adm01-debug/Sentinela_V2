import { useState, useMemo, useCallback } from 'react';
import { useEmployees, type EmployeeWithDetails } from '@/hooks/useEmployees';
import { useTeams } from '@/hooks/useTeams';

// ============================================================
// TYPES
// ============================================================

export interface EmployeeFormData {
  name: string;
  email: string;
  department: string;
  position: string;
  team_id: string;
  status: string;
  hire_date: string;
  phone: string;
  notes: string;
}

export interface DeviceFormData {
  device_name: string;
  device_type: string;
  is_primary: boolean;
}

export interface EmployeeFilters {
  searchTerm: string;
  statusFilter: string;
  teamFilter: string;
}

export interface EmployeeStats {
  total: number;
  active: number;
  withTeam: number;
  withDevices: number;
}

const initialFormData: EmployeeFormData = {
  name: '',
  email: '',
  department: '',
  position: '',
  team_id: '',
  status: 'active',
  hire_date: '',
  phone: '',
  notes: ''
};

const initialDeviceData: DeviceFormData = {
  device_name: '',
  device_type: 'desktop',
  is_primary: false
};

// ============================================================
// HOOK
// ============================================================

export function useEmployeesPage() {
  const { 
    employees, 
    loading, 
    createEmployee, 
    updateEmployee, 
    deleteEmployee, 
    assignDevice,
    unassignDevice 
  } = useEmployees();
  const { teams } = useTeams();

  // Filters
  const [filters, setFilters] = useState<EmployeeFilters>({
    searchTerm: '',
    statusFilter: 'all',
    teamFilter: 'all'
  });

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeviceOpen, setIsDeviceOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected employee
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDetails | null>(null);

  // Form states
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [deviceData, setDeviceData] = useState<DeviceFormData>(initialDeviceData);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesStatus = filters.statusFilter === 'all' || emp.status === filters.statusFilter;
      const matchesTeam = filters.teamFilter === 'all' || emp.team_id === filters.teamFilter || 
        (!emp.team_id && filters.teamFilter === 'none');
      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [employees, filters]);

  // Stats
  const stats = useMemo<EmployeeStats>(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    withTeam: employees.filter(e => e.team_id).length,
    withDevices: employees.filter(e => e.devices && e.devices.length > 0).length
  }), [employees]);

  // Filter handlers
  const setSearchTerm = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  }, []);

  const setStatusFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, statusFilter: value }));
  }, []);

  const setTeamFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, teamFilter: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ searchTerm: '', statusFilter: 'all', teamFilter: 'all' });
  }, []);

  // Form handlers
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const resetDeviceForm = useCallback(() => {
    setDeviceData(initialDeviceData);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!formData.name.trim()) return;
    
    await createEmployee({
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      department: formData.department.trim() || null,
      position: formData.position.trim() || null,
      team_id: formData.team_id || null,
      status: formData.status,
      hire_date: formData.hire_date || null,
      phone: formData.phone.trim() || null,
      avatar_url: null,
      notes: formData.notes.trim() || null
    });
    
    resetForm();
    setIsCreateOpen(false);
  }, [formData, createEmployee, resetForm]);

  const handleUpdate = useCallback(async () => {
    if (!selectedEmployee || !formData.name.trim()) return;
    
    await updateEmployee(selectedEmployee.id, {
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      department: formData.department.trim() || null,
      position: formData.position.trim() || null,
      team_id: formData.team_id || null,
      status: formData.status,
      hire_date: formData.hire_date || null,
      phone: formData.phone.trim() || null,
      notes: formData.notes.trim() || null
    });
    
    resetForm();
    setSelectedEmployee(null);
    setIsEditOpen(false);
  }, [selectedEmployee, formData, updateEmployee, resetForm]);

  const handleDelete = useCallback(async () => {
    if (!selectedEmployee) return;
    
    await deleteEmployee(selectedEmployee.id);
    setSelectedEmployee(null);
    setIsDeleteOpen(false);
  }, [selectedEmployee, deleteEmployee]);

  const handleAssignDevice = useCallback(async () => {
    if (!selectedEmployee || !deviceData.device_name.trim()) return;
    
    await assignDevice(
      selectedEmployee.id, 
      deviceData.device_name.trim(), 
      deviceData.device_type, 
      deviceData.is_primary
    );
    
    resetDeviceForm();
    setIsDeviceOpen(false);
  }, [selectedEmployee, deviceData, assignDevice, resetDeviceForm]);

  const handleUnassignDevice = useCallback(async (employeeId: string, deviceId: string) => {
    await unassignDevice(employeeId, deviceId);
  }, [unassignDevice]);

  // Dialog openers
  const openCreateDialog = useCallback(() => {
    resetForm();
    setIsCreateOpen(true);
  }, [resetForm]);

  const openEditDialog = useCallback((employee: EmployeeWithDetails) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email || '',
      department: employee.department || '',
      position: employee.position || '',
      team_id: employee.team_id || '',
      status: employee.status,
      hire_date: employee.hire_date || '',
      phone: employee.phone || '',
      notes: employee.notes || ''
    });
    setIsEditOpen(true);
  }, []);

  const openDeviceDialog = useCallback((employee: EmployeeWithDetails) => {
    setSelectedEmployee(employee);
    resetDeviceForm();
    setIsDeviceOpen(true);
  }, [resetDeviceForm]);

  const openDeleteDialog = useCallback((employee: EmployeeWithDetails) => {
    setSelectedEmployee(employee);
    setIsDeleteOpen(true);
  }, []);

  // Dialog closers
  const closeCreateDialog = useCallback(() => {
    setIsCreateOpen(false);
    resetForm();
  }, [resetForm]);

  const closeEditDialog = useCallback(() => {
    setIsEditOpen(false);
    setSelectedEmployee(null);
    resetForm();
  }, [resetForm]);

  const closeDeviceDialog = useCallback(() => {
    setIsDeviceOpen(false);
    setSelectedEmployee(null);
    resetDeviceForm();
  }, [resetDeviceForm]);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteOpen(false);
    setSelectedEmployee(null);
  }, []);

  return {
    // Data
    employees,
    filteredEmployees,
    teams,
    stats,
    loading,
    selectedEmployee,

    // Filters
    filters,
    setSearchTerm,
    setStatusFilter,
    setTeamFilter,
    clearFilters,

    // Form data
    formData,
    setFormData,
    deviceData,
    setDeviceData,

    // Dialog states
    isCreateOpen,
    isEditOpen,
    isDeviceOpen,
    isDeleteOpen,

    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAssignDevice,
    handleUnassignDevice,

    // Dialog handlers
    openCreateDialog,
    openEditDialog,
    openDeviceDialog,
    openDeleteDialog,
    closeCreateDialog,
    closeEditDialog,
    closeDeviceDialog,
    closeDeleteDialog,
  };
}

// ============================================================
// CONSTANTS
// ============================================================

export const statusConfig = {
  active: { label: 'Ativo', color: 'bg-success/20 text-success' },
  inactive: { label: 'Inativo', color: 'bg-muted text-muted-foreground' },
  vacation: { label: 'Férias', color: 'bg-warning/20 text-warning' },
  leave: { label: 'Afastado', color: 'bg-info/20 text-info' }
} as const;

export const deviceTypeLabels = {
  desktop: 'Desktop',
  laptop: 'Laptop',
  mobile: 'Mobile'
} as const;

// ============================================================
// HELPERS
// ============================================================

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}
