import { BaseEntity } from './BaseEntity';
export class Activity extends BaseEntity {
  employeeId: string; type: string; application: string; title: string; duration: number; isProductive: boolean; startedAt: Date; endedAt?: Date;
  constructor(id: string, employeeId: string, type: string, application: string, title: string, duration: number, isProductive: boolean) { super(id); this.employeeId = employeeId; this.type = type; this.application = application; this.title = title; this.duration = duration; this.isProductive = isProductive; this.startedAt = new Date(); }
  getDurationMinutes(): number { return Math.round(this.duration / 60); }
}
