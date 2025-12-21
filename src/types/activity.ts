export interface Activity {
  id: string;
  employeeId: string;
  type: 'keystroke' | 'click' | 'scroll' | 'idle' | 'active';
  timestamp: string;
  metadata?: Record<string, unknown>;
  applicationName?: string;
  windowTitle?: string;
  duration?: number;
}

export interface ActivitySummary {
  totalActive: number;
  totalIdle: number;
  keystrokes: number;
  clicks: number;
  topApplications: { name: string; duration: number }[];
}

export interface ActivityFilter {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  type?: Activity['type'];
}
