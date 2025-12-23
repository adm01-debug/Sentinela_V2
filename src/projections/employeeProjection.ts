export interface EmployeeProjection { id: string; name: string; email: string; department: string; status: string; productivity: number; totalHours: number; violations: number; }
export function projectEmployee(employee: any, activities: any[], violations: any[]): EmployeeProjection {
  const empActivities = activities.filter(a => a.employee_id === employee.id);
  const totalSeconds = empActivities.reduce((sum, a) => sum + a.duration, 0);
  const productiveSeconds = empActivities.filter(a => a.is_productive).reduce((sum, a) => sum + a.duration, 0);
  return { id: employee.id, name: employee.name, email: employee.email, department: employee.department, status: employee.status, productivity: totalSeconds > 0 ? (productiveSeconds / totalSeconds) * 100 : 0, totalHours: totalSeconds / 3600, violations: violations.filter(v => v.employee_id === employee.id).length };
}
