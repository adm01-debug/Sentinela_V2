export interface ReportDTO { id: string; name: string; type: string; status: string; created_at: string; created_by: string; data?: string; }
export interface CreateReportDTO { name: string; type: string; params: Record<string, any>; }
export interface GenerateReportDTO { type: string; start_date: string; end_date: string; employee_ids?: string[]; }
