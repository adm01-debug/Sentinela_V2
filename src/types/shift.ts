export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  workDays: number[];
  breakDuration: number;
  timezone: string;
  isDefault: boolean;
}