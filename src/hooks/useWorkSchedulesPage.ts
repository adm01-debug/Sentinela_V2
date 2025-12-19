import { useState, useMemo, useCallback } from 'react';
import { useWorkSchedules, type WorkSchedule } from '@/hooks/useWorkSchedules';
import { useEmployees } from '@/hooks/useEmployees';
import { useOvertimeNotifications } from '@/hooks/useOvertimeNotifications';

// ============================================================
// TYPES
// ============================================================

export interface ScheduleFormData {
  name: string;
  description: string;
  work_days: number[];
  start_time: string;
  end_time: string;
  break_start: string;
  break_end: string;
  flexible_start: boolean;
  flexible_minutes: number;
  overtime_allowed: boolean;
  overtime_requires_approval: boolean;
  block_outside_hours: boolean;
}

export interface AssignFormData {
  employee_id: string;
  schedule_id: string;
  effective_date: string;
}

export const WEEKDAYS = [
  { value: 1, label: 'Segunda', short: 'Seg' },
  { value: 2, label: 'Terça', short: 'Ter' },
  { value: 3, label: 'Quarta', short: 'Qua' },
  { value: 4, label: 'Quinta', short: 'Qui' },
  { value: 5, label: 'Sexta', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
  { value: 0, label: 'Domingo', short: 'Dom' },
] as const;

const initialScheduleForm: ScheduleFormData = {
  name: '',
  description: '',
  work_days: [1, 2, 3, 4, 5],
  start_time: '09:00',
  end_time: '18:00',
  break_start: '12:00',
  break_end: '13:00',
  flexible_start: false,
  flexible_minutes: 15,
  overtime_allowed: true,
  overtime_requires_approval: true,
  block_outside_hours: false,
};

const initialAssignForm: AssignFormData = {
  employee_id: '',
  schedule_id: '',
  effective_date: new Date().toISOString().split('T')[0],
};

// ============================================================
// HOOK
// ============================================================

export function useWorkSchedulesPage() {
  const { 
    schedules, 
    employeeSchedules, 
    overtimeRequests,
    blockLogs,
    loading, 
    addSchedule, 
    updateSchedule, 
    deleteSchedule,
    assignSchedule,
    removeEmployeeSchedule,
    updateOvertimeRequest
  } = useWorkSchedules();
  const { employees } = useEmployees();
  
  // Enable realtime notifications
  useOvertimeNotifications();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('schedules');

  // Dialog states
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Selected items
  const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<WorkSchedule | null>(null);

  // Form states
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>(initialScheduleForm);
  const [assignForm, setAssignForm] = useState<AssignFormData>(initialAssignForm);

  // Filtered data
  const filteredSchedules = useMemo(() => {
    if (!searchTerm) return schedules;
    const term = searchTerm.toLowerCase();
    return schedules.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term)
    );
  }, [schedules, searchTerm]);

  const filteredEmployeeSchedules = useMemo(() => {
    if (!searchTerm) return employeeSchedules;
    const term = searchTerm.toLowerCase();
    return employeeSchedules.filter(es => {
      const employee = employees.find(e => e.id === es.employee_id);
      return employee?.name.toLowerCase().includes(term);
    });
  }, [employeeSchedules, searchTerm, employees]);

  const pendingOvertimeRequests = useMemo(() => {
    return overtimeRequests.filter(r => r.status === 'pending');
  }, [overtimeRequests]);

  // Stats
  const stats = useMemo(() => ({
    totalSchedules: schedules.length,
    totalAssignments: employeeSchedules.length,
    pendingOvertimeRequests: pendingOvertimeRequests.length,
    recentBlocks: blockLogs.filter(b => {
      const blockDate = new Date(b.blocked_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return blockDate > dayAgo;
    }).length,
  }), [schedules, employeeSchedules, pendingOvertimeRequests, blockLogs]);

  // Form handlers
  const resetScheduleForm = useCallback(() => {
    setScheduleForm(initialScheduleForm);
    setSelectedSchedule(null);
  }, []);

  const resetAssignForm = useCallback(() => {
    setAssignForm(initialAssignForm);
  }, []);

  // Schedule CRUD
  const handleCreateSchedule = useCallback(async () => {
    if (!scheduleForm.name.trim()) return;
    
    await addSchedule({
      name: scheduleForm.name.trim(),
      description: scheduleForm.description.trim() || null,
      work_days: scheduleForm.work_days,
      start_time: scheduleForm.start_time,
      end_time: scheduleForm.end_time,
      break_start: scheduleForm.break_start || null,
      break_end: scheduleForm.break_end || null,
      flexible_start: scheduleForm.flexible_start,
      flexible_minutes: scheduleForm.flexible_minutes,
      overtime_allowed: scheduleForm.overtime_allowed,
      overtime_requires_approval: scheduleForm.overtime_requires_approval,
      block_outside_hours: scheduleForm.block_outside_hours,
    });
    
    resetScheduleForm();
    setIsScheduleDialogOpen(false);
  }, [scheduleForm, addSchedule, resetScheduleForm]);

  const handleUpdateSchedule = useCallback(async () => {
    if (!selectedSchedule || !scheduleForm.name.trim()) return;
    
    await updateSchedule(selectedSchedule.id, {
      name: scheduleForm.name.trim(),
      description: scheduleForm.description.trim() || null,
      work_days: scheduleForm.work_days,
      start_time: scheduleForm.start_time,
      end_time: scheduleForm.end_time,
      break_start: scheduleForm.break_start || null,
      break_end: scheduleForm.break_end || null,
      flexible_start: scheduleForm.flexible_start,
      flexible_minutes: scheduleForm.flexible_minutes,
      overtime_allowed: scheduleForm.overtime_allowed,
      overtime_requires_approval: scheduleForm.overtime_requires_approval,
      block_outside_hours: scheduleForm.block_outside_hours,
    });
    
    resetScheduleForm();
    setIsScheduleDialogOpen(false);
  }, [selectedSchedule, scheduleForm, updateSchedule, resetScheduleForm]);

  const handleDeleteSchedule = useCallback(async () => {
    if (!scheduleToDelete) return;
    
    await deleteSchedule(scheduleToDelete.id);
    setScheduleToDelete(null);
    setIsDeleteDialogOpen(false);
  }, [scheduleToDelete, deleteSchedule]);

  // Assignment handlers
  const handleAssignSchedule = useCallback(async () => {
    if (!assignForm.employee_id || !assignForm.schedule_id) return;
    
    await assignSchedule(
      assignForm.employee_id,
      assignForm.schedule_id,
      assignForm.effective_date
    );
    
    resetAssignForm();
    setIsAssignDialogOpen(false);
  }, [assignForm, assignSchedule, resetAssignForm]);

  const handleRemoveAssignment = useCallback(async (assignmentId: string) => {
    await removeEmployeeSchedule(assignmentId);
  }, [removeEmployeeSchedule]);

  // Overtime handlers
  const handleApproveOvertime = useCallback(async (requestId: string) => {
    await updateOvertimeRequest(requestId, 'approved');
  }, [updateOvertimeRequest]);

  const handleRejectOvertime = useCallback(async (requestId: string) => {
    await updateOvertimeRequest(requestId, 'rejected');
  }, [updateOvertimeRequest]);

  // Dialog openers
  const openCreateScheduleDialog = useCallback(() => {
    resetScheduleForm();
    setIsScheduleDialogOpen(true);
  }, [resetScheduleForm]);

  const openEditScheduleDialog = useCallback((schedule: WorkSchedule) => {
    setSelectedSchedule(schedule);
    setScheduleForm({
      name: schedule.name,
      description: schedule.description || '',
      work_days: schedule.work_days,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      break_start: schedule.break_start || '',
      break_end: schedule.break_end || '',
      flexible_start: schedule.flexible_start,
      flexible_minutes: schedule.flexible_minutes,
      overtime_allowed: schedule.overtime_allowed,
      overtime_requires_approval: schedule.overtime_requires_approval,
      block_outside_hours: schedule.block_outside_hours,
    });
    setIsScheduleDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((schedule: WorkSchedule) => {
    setScheduleToDelete(schedule);
    setIsDeleteDialogOpen(true);
  }, []);

  const openAssignDialog = useCallback(() => {
    resetAssignForm();
    setIsAssignDialogOpen(true);
  }, [resetAssignForm]);

  // Toggle work day
  const toggleWorkDay = useCallback((day: number) => {
    setScheduleForm(prev => ({
      ...prev,
      work_days: prev.work_days.includes(day)
        ? prev.work_days.filter(d => d !== day)
        : [...prev.work_days, day].sort()
    }));
  }, []);

  return {
    // Data
    schedules,
    filteredSchedules,
    employeeSchedules,
    filteredEmployeeSchedules,
    employees,
    overtimeRequests,
    pendingOvertimeRequests,
    blockLogs,
    stats,
    loading,

    // State
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    selectedSchedule,
    scheduleToDelete,

    // Forms
    scheduleForm,
    setScheduleForm,
    assignForm,
    setAssignForm,
    toggleWorkDay,

    // Dialogs
    isScheduleDialogOpen,
    setIsScheduleDialogOpen,
    isAssignDialogOpen,
    setIsAssignDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,

    // Actions
    handleCreateSchedule,
    handleUpdateSchedule,
    handleDeleteSchedule,
    handleAssignSchedule,
    handleRemoveAssignment,
    handleApproveOvertime,
    handleRejectOvertime,

    // Dialog handlers
    openCreateScheduleDialog,
    openEditScheduleDialog,
    openDeleteDialog,
    openAssignDialog,
  };
}

// ============================================================
// HELPERS
// ============================================================

export function formatWorkDays(days: number[]): string {
  if (days.length === 7) return 'Todos os dias';
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Seg - Sex';
  if (days.length === 6 && !days.includes(0)) return 'Seg - Sáb';
  
  return days
    .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
    .map(d => WEEKDAYS.find(w => w.value === d)?.short || '')
    .join(', ');
}

export function calculateWorkHours(start: string, end: string, breakStart?: string, breakEnd?: string): number {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  
  if (breakStart && breakEnd) {
    const [breakStartH, breakStartM] = breakStart.split(':').map(Number);
    const [breakEndH, breakEndM] = breakEnd.split(':').map(Number);
    const breakMinutes = (breakEndH * 60 + breakEndM) - (breakStartH * 60 + breakStartM);
    totalMinutes -= breakMinutes;
  }
  
  return totalMinutes / 60;
}
