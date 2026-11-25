import { useState, useMemo, useCallback } from "react";
import {
  useWorkSchedules,
  useCreateWorkSchedule,
  useUpdateWorkSchedule,
  useDeleteWorkSchedule,
  type WorkSchedule,
} from "@/hooks/useWorkSchedules";
import {
  useEmployeeSchedules,
  useAssignEmployeeSchedule,
  useRemoveEmployeeSchedule,
  escalaVigenteEm,
  situacaoDaAtribuicao,
  type EmployeeScheduleRow,
  type SituacaoAtribuicao,
} from "@/hooks/useEmployeeSchedules";
import {
  useOvertimeRequests,
  useReviewOvertimeRequest,
  useRecentStationBlocks,
} from "@/hooks/useOvertimeRequests";
import { useEmployees } from "@/hooks/useEmployees";
import { useOvertimeNotifications } from "@/hooks/useOvertimeNotifications";

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
  { value: 1, label: "Segunda", short: "Seg" },
  { value: 2, label: "Terça", short: "Ter" },
  { value: 3, label: "Quarta", short: "Qua" },
  { value: 4, label: "Quinta", short: "Qui" },
  { value: 5, label: "Sexta", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
  { value: 0, label: "Domingo", short: "Dom" },
] as const;

const initialScheduleForm: ScheduleFormData = {
  name: "",
  description: "",
  work_days: [1, 2, 3, 4, 5],
  start_time: "09:00",
  end_time: "18:00",
  break_start: "12:00",
  break_end: "13:00",
  flexible_start: false,
  flexible_minutes: 15,
  overtime_allowed: true,
  overtime_requires_approval: true,
  block_outside_hours: false,
};

const initialAssignForm: AssignFormData = {
  employee_id: "",
  schedule_id: "",
  effective_date: new Date().toISOString().split("T")[0],
};

export interface WorkSchedulePayload {
  name: string;
  description: string | null;
  work_days: number[];
  start_time: string;
  end_time: string;
  allow_overtime: boolean;
  auto_block_enabled: boolean;
  lunch_start: string | null;
  lunch_end: string | null;
}

/**
 * Converte o formulário da tela para as colunas reais de `work_schedules`.
 * O formulário usa nomes de UI (overtime_allowed/block_outside_hours/break_*),
 * o banco usa allow_overtime/auto_block_enabled/lunch_*.
 */
export function toWorkSchedulePayload(form: ScheduleFormData): WorkSchedulePayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    work_days: form.work_days,
    start_time: form.start_time,
    end_time: form.end_time,
    allow_overtime: form.overtime_allowed,
    auto_block_enabled: form.block_outside_hours,
    lunch_start: form.break_start || null,
    lunch_end: form.break_end || null,
  };
}

// ============================================================
// HOOK
// ============================================================

export function useWorkSchedulesPage() {
  const schedulesQuery = useWorkSchedules();
  const schedules = useMemo(
    () => (schedulesQuery.data ?? []) as WorkSchedule[],
    [schedulesQuery.data]
  );

  const assignmentsQuery = useEmployeeSchedules();
  const employeeSchedules = useMemo(() => assignmentsQuery.data ?? [], [assignmentsQuery.data]);

  const overtimeQuery = useOvertimeRequests();
  const overtimeRequests = useMemo(() => overtimeQuery.data ?? [], [overtimeQuery.data]);

  const blocksQuery = useRecentStationBlocks();
  const blockLogs = useMemo(() => blocksQuery.data ?? [], [blocksQuery.data]);

  const createScheduleMutation = useCreateWorkSchedule();
  const updateScheduleMutation = useUpdateWorkSchedule();
  const deleteScheduleMutation = useDeleteWorkSchedule();
  const assignMutation = useAssignEmployeeSchedule();
  const removeAssignmentMutation = useRemoveEmployeeSchedule();
  const reviewOvertimeMutation = useReviewOvertimeRequest();

  const loading =
    schedulesQuery.isLoading ||
    assignmentsQuery.isLoading ||
    overtimeQuery.isLoading ||
    blocksQuery.isLoading;

  const employeesQuery = useEmployees();
  const employees = useMemo(
    () => (employeesQuery.data ?? []) as Array<{ id: string; name: string }>,
    [employeesQuery.data]
  );

  // Enable realtime notifications
  useOvertimeNotifications();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("schedules");
  const [dataVigente, setDataVigente] = useState(initialAssignForm.effective_date);

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
    return schedules.filter(
      (s) =>
        (s.name ?? "").toLowerCase().includes(term) || s.description?.toLowerCase().includes(term)
    );
  }, [schedules, searchTerm]);

  const filteredEmployeeSchedules = useMemo(() => {
    if (!searchTerm) return employeeSchedules;
    const term = searchTerm.toLowerCase();
    return employeeSchedules.filter((es) => {
      const nome = es.employee_name ?? employees.find((e) => e.id === es.employee_id)?.name ?? "";
      return nome.toLowerCase().includes(term);
    });
  }, [employeeSchedules, searchTerm, employees]);

  const pendingOvertimeRequests = useMemo(() => {
    return overtimeRequests.filter((r) => r.status === "pending");
  }, [overtimeRequests]);

  // Escala em vigor na data escolhida (por funcionario) e situacao de cada atribuicao
  const vigentesPorFuncionario = useMemo(() => {
    const mapa: Record<string, EmployeeScheduleRow | null> = {};
    for (const es of employeeSchedules) {
      if (!(es.employee_id in mapa)) {
        mapa[es.employee_id] = escalaVigenteEm(employeeSchedules, es.employee_id, dataVigente);
      }
    }
    return mapa;
  }, [employeeSchedules, dataVigente]);

  const situacoesPorAtribuicao = useMemo(() => {
    const mapa: Record<string, SituacaoAtribuicao> = {};
    for (const es of employeeSchedules) {
      mapa[es.id] = situacaoDaAtribuicao(es, employeeSchedules, dataVigente);
    }
    return mapa;
  }, [employeeSchedules, dataVigente]);

  const funcionariosComVigente = useMemo(
    () => Object.values(vigentesPorFuncionario).filter((linha) => linha !== null).length,
    [vigentesPorFuncionario]
  );

  // Stats
  const stats = useMemo(
    () => ({
      totalSchedules: schedules.length,
      totalAssignments: employeeSchedules.length,
      pendingOvertimeRequests: pendingOvertimeRequests.length,
      // blockLogs já vem filtrado nas últimas 24h pela consulta
      recentBlocks: blockLogs.length,
    }),
    [schedules, employeeSchedules, pendingOvertimeRequests, blockLogs]
  );

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

    await createScheduleMutation.mutateAsync(toWorkSchedulePayload(scheduleForm));

    resetScheduleForm();
    setIsScheduleDialogOpen(false);
  }, [scheduleForm, createScheduleMutation, resetScheduleForm]);

  const handleUpdateSchedule = useCallback(async () => {
    if (!selectedSchedule || !scheduleForm.name.trim()) return;

    await updateScheduleMutation.mutateAsync({
      id: selectedSchedule.id,
      ...toWorkSchedulePayload(scheduleForm),
    });

    resetScheduleForm();
    setIsScheduleDialogOpen(false);
  }, [selectedSchedule, scheduleForm, updateScheduleMutation, resetScheduleForm]);

  const handleDeleteSchedule = useCallback(async () => {
    if (!scheduleToDelete) return;

    await deleteScheduleMutation.mutateAsync(scheduleToDelete.id);
    setScheduleToDelete(null);
    setIsDeleteDialogOpen(false);
  }, [scheduleToDelete, deleteScheduleMutation]);

  // Assignment handlers
  const handleAssignSchedule = useCallback(async () => {
    if (!assignForm.employee_id || !assignForm.schedule_id) return;

    await assignMutation.mutateAsync({
      employee_id: assignForm.employee_id,
      schedule_id: assignForm.schedule_id,
      effective_from: assignForm.effective_date,
    });

    resetAssignForm();
    setIsAssignDialogOpen(false);
  }, [assignForm, assignMutation, resetAssignForm]);

  const handleRemoveAssignment = useCallback(
    async (assignmentId: string) => {
      await removeAssignmentMutation.mutateAsync(assignmentId);
    },
    [removeAssignmentMutation]
  );

  // Overtime handlers
  const handleApproveOvertime = useCallback(
    async (requestId: string) => {
      await reviewOvertimeMutation.mutateAsync({ id: requestId, status: "approved" });
    },
    [reviewOvertimeMutation]
  );

  const handleRejectOvertime = useCallback(
    async (requestId: string) => {
      await reviewOvertimeMutation.mutateAsync({ id: requestId, status: "rejected" });
    },
    [reviewOvertimeMutation]
  );

  // Dialog openers
  const openCreateScheduleDialog = useCallback(() => {
    resetScheduleForm();
    setIsScheduleDialogOpen(true);
  }, [resetScheduleForm]);

  const openEditScheduleDialog = useCallback((schedule: WorkSchedule) => {
    setSelectedSchedule(schedule);
    setScheduleForm({
      name: schedule.name ?? "",
      description: schedule.description || "",
      work_days: schedule.work_days ?? [1, 2, 3, 4, 5],
      start_time: schedule.start_time ?? "09:00",
      end_time: schedule.end_time ?? "18:00",
      break_start: schedule.lunch_start || "",
      break_end: schedule.lunch_end || "",
      flexible_start: schedule.flexible_start ?? false,
      flexible_minutes: schedule.flexible_minutes ?? 15,
      overtime_allowed: schedule.allow_overtime ?? false,
      overtime_requires_approval: schedule.overtime_requires_approval ?? false,
      block_outside_hours: schedule.auto_block_enabled ?? false,
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
  const toggleWorkDay = useCallback((day) => {
    setScheduleForm((prev) => ({
      ...prev,
      work_days: prev.work_days.includes(day)
        ? prev.work_days.filter((d) => d !== day)
        : [...prev.work_days, day].sort(),
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
    dataVigente,
    setDataVigente,
    selectedSchedule,
    scheduleToDelete,

    // Escala vigente
    vigentesPorFuncionario,
    situacoesPorAtribuicao,
    funcionariosComVigente,

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
  if (days.length === 7) return "Todos os dias";
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return "Seg - Sex";
  if (days.length === 6 && !days.includes(0)) return "Seg - Sáb";

  return days
    .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
    .map((d) => WEEKDAYS.find((w) => w.value === d)?.short || "")
    .join(", ");
}

export function calculateWorkHours(
  start: string,
  end: string,
  breakStart?: string,
  breakEnd?: string
): number {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  let totalMinutes = endH * 60 + endM - (startH * 60 + startM);

  if (breakStart && breakEnd) {
    const [breakStartH, breakStartM] = breakStart.split(":").map(Number);
    const [breakEndH, breakEndM] = breakEnd.split(":").map(Number);
    const breakMinutes = breakEndH * 60 + breakEndM - (breakStartH * 60 + breakStartM);
    totalMinutes -= breakMinutes;
  }

  return totalMinutes / 60;
}
