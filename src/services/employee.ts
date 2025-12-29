export class EmployeeService {
  private static instance: EmployeeService;
  
  static getInstance() {
    if (!this.instance) this.instance = new EmployeeService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('employee service initialized'); }
}

export const employeeService = EmployeeService.getInstance();