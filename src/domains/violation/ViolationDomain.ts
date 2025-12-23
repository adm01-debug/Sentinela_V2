export class ViolationDomain {
  constructor(public id: string, public employeeId: string, public type: string, public severity: string, public status: string) {}
  isPending(): boolean { return this.status === 'pending'; }
  isCritical(): boolean { return ['high', 'critical'].includes(this.severity); }
  canResolve(): boolean { return this.isPending(); }
  static create(data: any): ViolationDomain { return new ViolationDomain(data.id, data.employeeId, data.type, data.severity, data.status); }
}
