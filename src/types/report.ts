export interface Report {
  id: string;
  name: string;
  type: 'productivity' | 'security' | 'compliance' | 'activity' | 'custom';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  parameters: ReportParameters;
}

export interface ReportParameters {
  startDate: string;
  endDate: string;
  employees?: string[];
  teams?: string[];
  includeCharts?: boolean;
}

export interface ScheduledReport {
  id: string;
  reportType: Report['type'];
  schedule: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
}
