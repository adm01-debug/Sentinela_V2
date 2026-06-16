export interface Report {
  id: string;
  title: string;
  type: "activity" | "productivity" | "attendance" | "application" | "custom";
  status: "pending" | "generating" | "completed" | "failed";
  format: "pdf" | "csv" | "excel";
  filters: ReportFilters;
  downloadUrl?: string;
  error?: string;
  generatedBy: string;
  createdAt: string;
  completedAt?: string;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  employees?: string[];
  departments?: string[];
  includeScreenshots?: boolean;
  includeCharts?: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: Report["type"];
  description: string;
  defaultFilters: Partial<ReportFilters>;
  sections: string[];
}
