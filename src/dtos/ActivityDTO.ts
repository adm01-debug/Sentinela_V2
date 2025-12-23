export interface ActivityDTO { id: string; employee_id: string; type: string; application: string; title: string; duration: number; is_productive: boolean; started_at: string; ended_at?: string; }
export interface CreateActivityDTO { employee_id: string; type: string; application: string; title: string; duration: number; is_productive: boolean; }
