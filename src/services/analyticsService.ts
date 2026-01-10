import { supabase } from '@/integrations/supabase/client';

export type MetricType = 'productivity' | 'violations' | 'attendance' | 'activity';
export type TimeGranularity = 'hour' | 'day' | 'week' | 'month';

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface DashboardMetrics {
  activeEmployees: number;
  totalViolations: number;
  avgProductivity: number;
  onlineDevices: number;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  employeeIds?: string[];
  departments?: string[];
  teams?: string[];
  granularity?: TimeGranularity;
}

export const analyticsService = {
  /**
   * Get dashboard overview metrics
   */
  async getDashboardMetrics(organizationId: string): Promise<DashboardMetrics> {
    const [employees, violations, productivity, devices] = await Promise.all([
      supabase
        .from('employees')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('status', 'active'),
      supabase
        .from('violations')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('status', 'open'),
      supabase
        .from('productivity_metrics')
        .select('productivity_score')
        .eq('organization_id', organizationId)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('devices')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('status', 'online'),
    ]);

    const avgProductivity = productivity.data?.length
      ? productivity.data.reduce((acc, m) => acc + (m.productivity_score || 0), 0) / productivity.data.length
      : 0;

    return {
      activeEmployees: employees.count || 0,
      totalViolations: violations.count || 0,
      avgProductivity: Math.round(avgProductivity * 100) / 100,
      onlineDevices: devices.count || 0,
    };
  },

  /**
   * Get metric trend data
   */
  async getMetricTrend(
    organizationId: string,
    metric: MetricType,
    filters: AnalyticsFilters = {}
  ): Promise<TrendData> {
    const now = new Date();
    const currentPeriodStart = filters.dateFrom || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const currentPeriodEnd = filters.dateTo || now.toISOString();
    
    const periodLength = new Date(currentPeriodEnd).getTime() - new Date(currentPeriodStart).getTime();
    const previousPeriodStart = new Date(new Date(currentPeriodStart).getTime() - periodLength).toISOString();
    const previousPeriodEnd = currentPeriodStart;

    const tableName = this.getTableForMetric(metric);
    const dateField = this.getDateFieldForMetric(metric);

    const [currentData, previousData] = await Promise.all([
      supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .gte(dateField, currentPeriodStart)
        .lte(dateField, currentPeriodEnd),
      supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .gte(dateField, previousPeriodStart)
        .lte(dateField, previousPeriodEnd),
    ]);

    const current = currentData.count || 0;
    const previous = previousData.count || 0;
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;

    return {
      current,
      previous,
      change,
      changePercent: Math.round(changePercent * 100) / 100,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  },

  /**
   * Get time series data for a metric
   */
  async getTimeSeries(
    organizationId: string,
    metric: MetricType,
    filters: AnalyticsFilters = {}
  ): Promise<MetricDataPoint[]> {
    const { dateFrom, dateTo, granularity = 'day' } = filters;
    
    const startDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = dateTo || new Date().toISOString();

    const tableName = this.getTableForMetric(metric);
    const dateField = this.getDateFieldForMetric(metric);

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('organization_id', organizationId)
      .gte(dateField, startDate)
      .lte(dateField, endDate)
      .order(dateField);

    if (error) throw error;

    // Group by granularity
    const grouped = this.groupByGranularity(data || [], dateField, granularity);
    
    return grouped.map(g => ({
      timestamp: g.timestamp,
      value: g.count,
      label: this.formatTimestamp(g.timestamp, granularity),
    }));
  },

  /**
   * Get productivity analytics
   */
  async getProductivityAnalytics(
    organizationId: string,
    filters: AnalyticsFilters = {}
  ): Promise<{
    avgScore: number;
    topPerformers: Array<{ employeeId: string; score: number }>;
    byDepartment: Array<{ department: string; avgScore: number }>;
    trend: MetricDataPoint[];
  }> {
    const { dateFrom, dateTo } = filters;
    
    let query = supabase
      .from('productivity_metrics')
      .select('*')
      .eq('organization_id', organizationId);

    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);

    const { data, error } = await query;
    if (error) throw error;

    const metrics = data || [];
    const avgScore = metrics.length
      ? metrics.reduce((acc, m) => acc + (m.productivity_score || 0), 0) / metrics.length
      : 0;

    // Group by employee
    const byEmployee = new Map<string, number[]>();
    metrics.forEach(m => {
      const scores = byEmployee.get(m.employee_id) || [];
      scores.push(m.productivity_score || 0);
      byEmployee.set(m.employee_id, scores);
    });

    const topPerformers = Array.from(byEmployee.entries())
      .map(([employeeId, scores]) => ({
        employeeId,
        score: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      avgScore: Math.round(avgScore * 100) / 100,
      topPerformers,
      byDepartment: [], // Would need join with employees table
      trend: await this.getTimeSeries(organizationId, 'productivity', filters),
    };
  },

  /**
   * Get violation analytics
   */
  async getViolationAnalytics(
    organizationId: string,
    filters: AnalyticsFilters = {}
  ): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    trend: MetricDataPoint[];
    riskScore: number;
  }> {
    const { dateFrom, dateTo } = filters;
    
    let query = supabase
      .from('violations')
      .select('*')
      .eq('organization_id', organizationId);

    if (dateFrom) query = query.gte('detected_at', dateFrom);
    if (dateTo) query = query.lte('detected_at', dateTo);

    const { data, error } = await query;
    if (error) throw error;

    const violations = data || [];
    
    const bySeverity: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    violations.forEach(v => {
      bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1;
      if (v.category) {
        byCategory[v.category] = (byCategory[v.category] || 0) + 1;
      }
    });

    // Calculate risk score based on severity distribution
    const riskWeights = { low: 1, medium: 2, high: 4, critical: 8 };
    const riskScore = violations.reduce((acc, v) => 
      acc + (riskWeights[v.severity as keyof typeof riskWeights] || 0), 0
    );

    return {
      total: violations.length,
      bySeverity,
      byCategory,
      trend: await this.getTimeSeries(organizationId, 'violations', filters),
      riskScore: Math.min(100, riskScore),
    };
  },

  // Helper methods
  getTableForMetric(metric: MetricType): string {
    const tables: Record<MetricType, string> = {
      productivity: 'productivity_metrics',
      violations: 'violations',
      attendance: 'attendance',
      activity: 'activities',
    };
    return tables[metric];
  },

  getDateFieldForMetric(metric: MetricType): string {
    const fields: Record<MetricType, string> = {
      productivity: 'date',
      violations: 'detected_at',
      attendance: 'date',
      activity: 'created_at',
    };
    return fields[metric];
  },

  groupByGranularity(
    data: Array<Record<string, unknown>>,
    dateField: string,
    granularity: TimeGranularity
  ): Array<{ timestamp: string; count: number }> {
    const grouped = new Map<string, number>();
    
    data.forEach(item => {
      const date = new Date(item[dateField] as string);
      let key: string;
      
      switch (granularity) {
        case 'hour':
          key = date.toISOString().slice(0, 13);
          break;
        case 'day':
          key = date.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7);
          break;
      }
      
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  },

  formatTimestamp(timestamp: string, granularity: TimeGranularity): string {
    const date = new Date(timestamp);
    switch (granularity) {
      case 'hour':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'week':
        return `Week of ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString([], { month: 'long', year: 'numeric' });
    }
  },
};

export default analyticsService;
