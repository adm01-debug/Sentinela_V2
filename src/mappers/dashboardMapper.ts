export interface DashboardDTO { total_employees: number; active_employees: number; productivity: number; total_hours: number; violations: number; }
export interface DashboardModel { totalEmployees: number; activeEmployees: number; productivity: number; totalHours: number; violations: number; }
export const dashboardMapper = {
  toModel: (dto: DashboardDTO): DashboardModel => ({ totalEmployees: dto.total_employees, activeEmployees: dto.active_employees, productivity: dto.productivity, totalHours: dto.total_hours, violations: dto.violations }),
  toDTO: (model: DashboardModel): DashboardDTO => ({ total_employees: model.totalEmployees, active_employees: model.activeEmployees, productivity: model.productivity, total_hours: model.totalHours, violations: model.violations }),
};
