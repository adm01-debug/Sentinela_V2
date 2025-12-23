export class DashboardViewModel {
  totalEmployees = 0; activeEmployees = 0; productivity = 0; totalHours = 0; violations = 0; trend: 'up' | 'down' | 'stable' = 'stable';
  static fromData(data: any): DashboardViewModel { const vm = new DashboardViewModel(); vm.totalEmployees = data.totalEmployees || 0; vm.activeEmployees = data.activeEmployees || 0; vm.productivity = data.productivity || 0; vm.totalHours = data.totalHours || 0; vm.violations = data.violations || 0; vm.trend = data.trend || 'stable'; return vm; }
  get productivityFormatted(): string { return this.productivity.toFixed(1) + '%'; }
  get hoursFormatted(): string { return this.totalHours.toFixed(1) + 'h'; }
}
