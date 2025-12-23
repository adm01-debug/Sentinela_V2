export class ReportDomain {
  constructor(public id: string, public name: string, public type: string, public status: string, public createdBy: string) {}
  isCompleted(): boolean { return this.status === 'completed'; }
  isPending(): boolean { return this.status === 'pending'; }
  canDownload(): boolean { return this.isCompleted(); }
  static create(data: any): ReportDomain { return new ReportDomain(data.id, data.name, data.type, data.status, data.createdBy); }
}
