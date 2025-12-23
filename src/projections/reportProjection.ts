export interface ReportProjection { id: string; name: string; type: string; status: string; createdAt: string; summary: { totalRecords: number; dateRange: string }; }
export function projectReport(report: any): ReportProjection {
  const data = report.data ? JSON.parse(report.data) : {};
  return { id: report.id, name: report.name, type: report.type, status: report.status, createdAt: report.created_at, summary: { totalRecords: data.totalRecords || 0, dateRange: data.startDate && data.endDate ? data.startDate + ' - ' + data.endDate : 'N/A' } };
}
