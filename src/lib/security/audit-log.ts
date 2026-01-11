import { supabase } from '@/lib/supabase';

export interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export async function logAuditEvent(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
  await supabase.from('audit_logs').insert({
    ...entry,
    timestamp: new Date().toISOString(),
  });
}

export async function getAuditLogs(filters: {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<AuditEntry[]> {
  let query = supabase.from('audit_logs').select('*');
  
  if (filters.userId) query = query.eq('user_id', filters.userId);
  if (filters.action) query = query.eq('action', filters.action);
  if (filters.resource) query = query.eq('resource', filters.resource);
  if (filters.startDate) query = query.gte('timestamp', filters.startDate.toISOString());
  if (filters.endDate) query = query.lte('timestamp', filters.endDate.toISOString());
  if (filters.limit) query = query.limit(filters.limit);
  
  const { data } = await query.order('timestamp', { ascending: false });
  return data || [];
}
