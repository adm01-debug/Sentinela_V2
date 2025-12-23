export interface EmployeeDTO { id: string; user_id: string; name: string; email: string; department: string; position: string; status: string; team_id?: string; hired_at?: string; created_at: string; }
export interface CreateEmployeeDTO { name: string; email: string; department: string; position: string; team_id?: string; }
export interface UpdateEmployeeDTO { name?: string; email?: string; department?: string; position?: string; status?: string; team_id?: string; }
