export interface ReportPort {
  getReport(id: string): Promise<any>;
  listReports(params?: any): Promise<any[]>;
  generateReport(type: string, params: any): Promise<any>;
  downloadReport(id: string, format: string): Promise<Blob>;
  deleteReport(id: string): Promise<void>;
}
