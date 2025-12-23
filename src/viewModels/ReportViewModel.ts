export class ReportViewModel {
  id = ''; name = ''; type = ''; status = ''; data: any = null; createdAt = '';
  static fromData(data: any): ReportViewModel { const vm = new ReportViewModel(); vm.id = data.id; vm.name = data.name; vm.type = data.type; vm.status = data.status; vm.data = data.data; vm.createdAt = data.created_at; return vm; }
  get isCompleted(): boolean { return this.status === 'completed'; }
  get canDownload(): boolean { return this.isCompleted && this.data !== null; }
}
