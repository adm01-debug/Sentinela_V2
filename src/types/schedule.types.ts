export interface Schedule {
  id: string;
  name: string;
  description?: string;
  type: ScheduleType;
  employeeId?: string;
  teamId?: string;
  entries: ScheduleEntry[];
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export type ScheduleType = "work" | "break" | "vacation" | "holiday" | "custom";
export interface ScheduleEntry {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: ScheduleType;
}
export interface ScheduleOverride {
  id: string;
  scheduleId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: ScheduleType;
  reason?: string;
}
export interface ScheduleConflict {
  scheduleId: string;
  employeeId: string;
  date: string;
  conflictType: "overlap" | "gap" | "overtime";
  details: string;
}
export interface WorkHours {
  scheduled: number;
  worked: number;
  overtime: number;
  undertime: number;
}
