export interface Activity {
  id: string;
  employeeId: string;
  type: 'application' | 'website' | 'idle' | 'system';
  application: string;
  title: string;
  url?: string;
  category?: string;
  productive: boolean;
  duration: number;
  keystrokes?: number;
  mouseClicks?: number;
  timestamp: string;
  metadata?: unknown;
}

export interface ActivitySummary {
  period: string;
  totalActivities: number;
  uniqueUsers: number;
  topApplications: Array<{ name: string; count: number; percentage: number }>;
  productivityScore: number;
  peakHours: Array<{ hour: number; count: number }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
  violationsSummary: { total: number; bySeverity: Record<string, number> };
  highlights: string[];
}

export interface ActivityFilters {
  employeeId?: string;
  startDate: string;
  endDate: string;
  type?: Activity['type'];
  productive?: boolean;
}