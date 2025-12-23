export interface EmployeePort {
  getEmployee(id: string): Promise<any>;
  listEmployees(params?: any): Promise<any[]>;
  createEmployee(data: any): Promise<any>;
  updateEmployee(id: string, data: any): Promise<any>;
  deleteEmployee(id: string): Promise<void>;
  getByTeam(teamId: string): Promise<any[]>;
}
