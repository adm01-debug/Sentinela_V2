import { BaseEntity } from './BaseEntity';
export class Violation extends BaseEntity {
  employeeId: string; type: string; severity: string; description: string; status: string; detectedAt: Date; resolvedAt?: Date;
  constructor(id: string, employeeId: string, type: string, severity: string, description: string) { super(id); this.employeeId = employeeId; this.type = type; this.severity = severity; this.description = description; this.status = 'pending'; this.detectedAt = new Date(); }
  isPending(): boolean { return this.status === 'pending'; }
  resolve(): void { this.status = 'resolved'; this.resolvedAt = new Date(); }
  isCritical(): boolean { return ['high', 'critical'].includes(this.severity); }
}
