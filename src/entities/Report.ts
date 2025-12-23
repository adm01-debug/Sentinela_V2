import { BaseEntity } from './BaseEntity';
export class Report extends BaseEntity {
  name: string; type: string; status: string; createdBy: string; data?: any;
  constructor(id: string, name: string, type: string, createdBy: string) { super(id); this.name = name; this.type = type; this.createdBy = createdBy; this.status = 'pending'; }
  isCompleted(): boolean { return this.status === 'completed'; }
  markCompleted(data: any): void { this.status = 'completed'; this.data = data; }
}
