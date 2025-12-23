export class ActivityViewModel {
  activities: any[] = []; totalDuration = 0; productiveTime = 0; topApps: { name: string; duration: number }[] = [];
  static fromData(data: any): ActivityViewModel { const vm = new ActivityViewModel(); vm.activities = data.activities || []; vm.totalDuration = data.totalDuration || 0; vm.productiveTime = data.productiveTime || 0; vm.topApps = data.topApps || []; return vm; }
  get productivity(): number { return this.totalDuration > 0 ? (this.productiveTime / this.totalDuration) * 100 : 0; }
  get productivityFormatted(): string { return this.productivity.toFixed(1) + '%'; }
}
