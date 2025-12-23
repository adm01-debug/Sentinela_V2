import { BaseEntity } from './BaseEntity';
export class Screenshot extends BaseEntity {
  employeeId: string; imageUrl: string; thumbnailUrl?: string; capturedAt: Date; activityId?: string;
  constructor(id: string, employeeId: string, imageUrl: string, capturedAt: Date = new Date()) { super(id); this.employeeId = employeeId; this.imageUrl = imageUrl; this.capturedAt = capturedAt; }
}
