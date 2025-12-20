export interface WorkSchedule {
  id: string;
  name: string;
  work_days: number[]; // 0-6, Sunday-Saturday
  start_time: string; // HH:MM format
  end_time: string;
  break_start?: string;
  break_end?: string;
  flexible_start: boolean;
  flexible_minutes?: number;
  overtime_allowed: boolean;
  max_overtime_hours?: number;
  block_outside_hours: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeSchedule {
  id: string;
  employee_id: string;
  schedule_id: string;
  effective_from: string;
  effective_to?: string;
  is_current: boolean;
  created_at: string;
}

export interface OvertimeRequest {
  id: string;
  employee_id: string;
  requested_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface ScheduleFormData {
  name: string;
  work_days: number[];
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
  flexible_start: boolean;
  flexible_minutes?: number;
  overtime_allowed: boolean;
  max_overtime_hours?: number;
  block_outside_hours: boolean;
  is_active: boolean;
}
