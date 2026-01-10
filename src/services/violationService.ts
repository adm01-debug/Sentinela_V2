import { supabase } from '@/integrations/supabase/client';

export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ViolationStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

export interface Violation {
  id: string;
  employee_id: string;
  rule_id: string;
  severity: ViolationSeverity;
  status: ViolationStatus;
  description: string;
  details?: Record<string, unknown>;
  detected_at: string;
  resolved_at?: string;
  resolved_by?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ViolationRule {
  id: string;
  name: string;
  description: string;
  severity: ViolationSeverity;
  category: string;
  is_active: boolean;
  conditions: Record<string, unknown>;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ViolationFilters {
  search?: string;
  status?: ViolationStatus;
  severity?: ViolationSeverity;
  employeeId?: string;
  ruleId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const violationService = {
  /**
   * Get all violations with filters and pagination
   */
  async getAll(filters: ViolationFilters = {}): Promise<PaginatedResponse<Violation>> {
    const { 
      search, status, severity, employeeId, ruleId, 
      dateFrom, dateTo, page = 1, limit = 10 
    } = filters;
    
    let query = supabase
      .from('violations')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('description', `%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    if (ruleId) {
      query = query.eq('rule_id', ruleId);
    }
    if (dateFrom) {
      query = query.gte('detected_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('detected_at', dateTo);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to).order('detected_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: (data as Violation[]) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  /**
   * Get violation by ID
   */
  async getById(id: string): Promise<Violation | null> {
    const { data, error } = await supabase
      .from('violations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Violation;
  },

  /**
   * Create a new violation
   */
  async create(violation: Omit<Violation, 'id' | 'created_at' | 'updated_at'>): Promise<Violation> {
    const { data, error } = await supabase
      .from('violations')
      .insert([violation])
      .select()
      .single();

    if (error) throw error;
    return data as Violation;
  },

  /**
   * Update violation status
   */
  async updateStatus(
    id: string, 
    status: ViolationStatus, 
    resolvedBy?: string
  ): Promise<Violation> {
    const updates: Partial<Violation> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = resolvedBy;
    }

    const { data, error } = await supabase
      .from('violations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Violation;
  },

  /**
   * Bulk update violations status
   */
  async bulkUpdateStatus(ids: string[], status: ViolationStatus): Promise<void> {
    const { error } = await supabase
      .from('violations')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (error) throw error;
  },

  /**
   * Get violation rules
   */
  async getRules(organizationId: string): Promise<ViolationRule[]> {
    const { data, error } = await supabase
      .from('violation_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return (data as ViolationRule[]) || [];
  },

  /**
   * Create a violation rule
   */
  async createRule(rule: Omit<ViolationRule, 'id' | 'created_at' | 'updated_at'>): Promise<ViolationRule> {
    const { data, error } = await supabase
      .from('violation_rules')
      .insert([rule])
      .select()
      .single();

    if (error) throw error;
    return data as ViolationRule;
  },

  /**
   * Update a violation rule
   */
  async updateRule(id: string, updates: Partial<ViolationRule>): Promise<ViolationRule> {
    const { data, error } = await supabase
      .from('violation_rules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ViolationRule;
  },

  /**
   * Delete a violation rule
   */
  async deleteRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('violation_rules')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get violation statistics
   */
  async getStatistics(organizationId: string, dateRange?: { from: string; to: string }): Promise<{
    total: number;
    bySeverity: Record<ViolationSeverity, number>;
    byStatus: Record<ViolationStatus, number>;
    trend: { date: string; count: number }[];
  }> {
    let query = supabase
      .from('violations')
      .select('severity, status, detected_at')
      .eq('organization_id', organizationId);

    if (dateRange) {
      query = query.gte('detected_at', dateRange.from).lte('detected_at', dateRange.to);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 } as Record<ViolationSeverity, number>,
      byStatus: { open: 0, acknowledged: 0, resolved: 0, dismissed: 0 } as Record<ViolationStatus, number>,
      trend: [] as { date: string; count: number }[],
    };

    const trendMap = new Map<string, number>();

    data?.forEach((v) => {
      stats.bySeverity[v.severity as ViolationSeverity]++;
      stats.byStatus[v.status as ViolationStatus]++;
      
      const date = v.detected_at.split('T')[0];
      trendMap.set(date, (trendMap.get(date) || 0) + 1);
    });

    stats.trend = Array.from(trendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return stats;
  },
};

export default violationService;
