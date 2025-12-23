export class ActivityDomain {
  constructor(public id: string, public employeeId: string, public type: string, public application: string, public duration: number, public isProductive: boolean) {}
  getDurationMinutes(): number { return Math.round(this.duration / 60); }
  getDurationHours(): number { return Math.round(this.duration / 3600 * 100) / 100; }
  static create(data: any): ActivityDomain { return new ActivityDomain(data.id, data.employeeId, data.type, data.application, data.duration, data.isProductive); }
}
