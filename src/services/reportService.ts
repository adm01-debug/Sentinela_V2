import { supabase } from '@/integrations/supabase/client';

export type ReportType = 'productivity' | 'violations' | 'attendance' | 'activity' | 'custom';
export type ReportFormat = 'pdf' | 'csv' | 'excel' | 'json';
export type ReportFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  filters: Record<string, unknown>;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledReport {
  id: string;
  report_id: string;
  frequency: ReportFrequency;
  recipients: string[];
  next_run: string;
  last_run?: string;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ReportData {
  headers: string[];
  rows: Array<Record<string, unknown>>;
  summary?: Record<string, unknown>;
  generatedAt: string;
}

export interface ReportGenerationOptions {
  type: ReportType;
  format: ReportFormat;
  filters: {
    dateFrom?: string;
    dateTo?: string;
    employeeIds?: string[];
    departments?: string[];
    teams?: string[];
  };
}

export const reportService = {
  /**
   * Get all reports
   */
  async getAll(organizationId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Report[]) || [];
  },

  /**
   * Get report by ID
   */
  async getById(id: string): Promise<Report | null> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Report;
  },

  /**
   * Create a new report
   */
  async create(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert([report])
      .select()
      .single();

    if (error) throw error;
    return data as Report;
  },

  /**
   * Update a report
   */
  async update(id: string, updates: Partial<Report>): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Report;
  },

  /**
   * Delete a report
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Generate report data
   */
  async generate(options: ReportGenerationOptions): Promise<ReportData> {
    const { type, filters } = options;
    
    let data: ReportData = {
      headers: [],
      rows: [],
      generatedAt: new Date().toISOString(),
    };

    switch (type) {
      case 'productivity':
        data = await this.generateProductivityReport(filters);
        break;
      case 'violations':
        data = await this.generateViolationsReport(filters);
        break;
      case 'attendance':
        data = await this.generateAttendanceReport(filters);
        break;
      case 'activity':
        data = await this.generateActivityReport(filters);
        break;
      default:
        throw new Error(`Unknown report type: ${type}`);
    }

    return data;
  },

  /**
   * Generate productivity report
   */
  async generateProductivityReport(filters: ReportGenerationOptions['filters']): Promise<ReportData> {
    let query = supabase.from('productivity_metrics').select('*');

    if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
    if (filters.dateTo) query = query.lte('date', filters.dateTo);
    if (filters.employeeIds?.length) query = query.in('employee_id', filters.employeeIds);

    const { data, error } = await query;
    if (error) throw error;

    return {
      headers: ['Employee', 'Date', 'Hours Worked', 'Productivity Score', 'Tasks Completed'],
      rows: data || [],
      summary: {
        avgProductivity: data?.reduce((acc, r) => acc + (r.productivity_score || 0), 0) / (data?.length || 1),
        totalHours: data?.reduce((acc, r) => acc + (r.hours_worked || 0), 0),
      },
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Generate violations report
   */
  async generateViolationsReport(filters: ReportGenerationOptions['filters']): Promise<ReportData> {
    let query = supabase.from('violations').select('*');

    if (filters.dateFrom) query = query.gte('detected_at', filters.dateFrom);
    if (filters.dateTo) query = query.lte('detected_at', filters.dateTo);
    if (filters.employeeIds?.length) query = query.in('employee_id', filters.employeeIds);

    const { data, error } = await query;
    if (error) throw error;

    return {
      headers: ['Employee', 'Violation', 'Severity', 'Status', 'Detected At'],
      rows: data || [],
      summary: {
        total: data?.length || 0,
        critical: data?.filter(v => v.severity === 'critical').length || 0,
        resolved: data?.filter(v => v.status === 'resolved').length || 0,
      },
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Generate attendance report
   */
  async generateAttendanceReport(filters: ReportGenerationOptions['filters']): Promise<ReportData> {
    let query = supabase.from('attendance').select('*');

    if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
    if (filters.dateTo) query = query.lte('date', filters.dateTo);
    if (filters.employeeIds?.length) query = query.in('employee_id', filters.employeeIds);

    const { data, error } = await query;
    if (error) throw error;

    return {
      headers: ['Employee', 'Date', 'Check In', 'Check Out', 'Total Hours', 'Status'],
      rows: data || [],
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Generate activity report
   */
  async generateActivityReport(filters: ReportGenerationOptions['filters']): Promise<ReportData> {
    let query = supabase.from('activities').select('*');

    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo);
    if (filters.employeeIds?.length) query = query.in('employee_id', filters.employeeIds);

    const { data, error } = await query;
    if (error) throw error;

    return {
      headers: ['Employee', 'Activity', 'Application', 'Duration', 'Timestamp'],
      rows: data || [],
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Export report to specified format
   */
  async export(reportData: ReportData, format: ReportFormat): Promise<Blob> {
    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      case 'csv':
        return this.toCSV(reportData);
      default:
        throw new Error(`Export format ${format} not yet implemented`);
    }
  },

  /**
   * Convert report data to CSV
   */
  toCSV(reportData: ReportData): Blob {
    const lines = [reportData.headers.join(',')];
    reportData.rows.forEach(row => {
      const values = reportData.headers.map(h => {
        const value = row[h.toLowerCase().replace(/ /g, '_')] ?? '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      lines.push(values.join(','));
    });
    return new Blob([lines.join('\n')], { type: 'text/csv' });
  },

  /**
   * Get scheduled reports
   */
  async getScheduledReports(organizationId: string): Promise<ScheduledReport[]> {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('next_run');

    if (error) throw error;
    return (data as ScheduledReport[]) || [];
  },

  /**
   * Create a scheduled report
   */
  async scheduleReport(schedule: Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at'>): Promise<ScheduledReport> {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert([schedule])
      .select()
      .single();

    if (error) throw error;
    return data as ScheduledReport;
  },

  /**
   * Update scheduled report
   */
  async updateSchedule(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ScheduledReport;
  },

  /**
   * Delete scheduled report
   */
  async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('scheduled_reports')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};

export default reportService;
