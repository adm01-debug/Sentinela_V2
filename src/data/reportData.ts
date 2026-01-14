export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ReportData {
  id: string;
  title: string;
  createdAt: string;
  periodStart: string;
  periodEnd: string;
  summary: string;
  highlights: Array<{ label: string; value: string | number }>;
  severityBreakdown?: Record<ReportSeverity, number>;
}
