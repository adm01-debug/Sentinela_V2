export interface ViolationDTO { id: string; employee_id: string; type: string; severity: string; description: string; status: string; detected_at: string; resolved_at?: string; }
export interface CreateViolationDTO { employee_id: string; type: string; severity: string; description: string; }
