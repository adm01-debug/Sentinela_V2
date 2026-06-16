export interface Activity {
  id: string;
  employeeId: string;
  type: "application" | "website" | "idle" | "system";
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
  totalDuration: number;
  productiveDuration: number;
  idleDuration: number;
  applicationBreakdown: Array<{ app: string; duration: number; percentage: number }>;
  categoryBreakdown: Array<{ category: string; duration: number; percentage: number }>;
  hourlyDistribution: Array<{ hour: number; duration: number }>;
}

export interface ActivityFilters {
  employeeId?: string;
  startDate: string;
  endDate: string;
  type?: Activity["type"];
  productive?: boolean;
}
