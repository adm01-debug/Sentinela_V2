import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCreateAuditLog } from './useAuditLogs';
import { toast } from 'sonner';

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  dateRange?: { start: string; end: string };
  filters?: Record<string, any>;
  columns?: string[];
}

interface ExportResult {
  success: boolean;
  filename: string;
  recordCount: number;
}

// Helper para converter dados para CSV
function toCSV(data: Record<string, any>[], columns?: string[]): string {
  if (data.length === 0) return '';
  
  const headers = columns || Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val).includes(',') ? `"${val}"` : val;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

// Helper para download
function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const createAuditLog = useCreateAuditLog();

  // Exportar funcionários
  const exportEmployees = useCallback(async (options: ExportOptions): Promise<ExportResult> => {
    setIsExporting(true);
    setProgress(0);
    
    try {
      let query = supabase
        .from('employees')
        .select('id, name, email, department, position, status, hire_date, phone, created_at');
      
      if (options.filters?.status) {
        query = query.eq('status', options.filters.status);
      }
      if (options.filters?.department) {
        query = query.eq('department', options.filters.department);
      }
      
      setProgress(30);
      const { data, error } = await query;
      
      if (error) throw error;
      
      setProgress(60);
      
      const filename = options.filename || `funcionarios_${new Date().toISOString().split('T')[0]}`;
      
      if (options.format === 'csv') {
        const csv = toCSV(data || [], options.columns);
        downloadFile(csv, `${filename}.csv`, 'text/csv');
      } else if (options.format === 'json') {
        downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
      }
      
      setProgress(100);
      
      // Registrar no audit log
      createAuditLog.mutate({
        action: 'export',
        entityType: 'employees',
        description: `Exportou ${data?.length || 0} funcionários em ${options.format.toUpperCase()}`,
        module: 'reports',
      });
      
      toast.success(`Exportação concluída: ${data?.length || 0} registros`);
      
      return { success: true, filename: `${filename}.${options.format}`, recordCount: data?.length || 0 };
    } catch (error: any) {
      toast.error('Erro na exportação: ' + error.message);
      return { success: false, filename: '', recordCount: 0 };
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  }, [createAuditLog]);

  // Exportar violações
  const exportViolations = useCallback(async (options: ExportOptions): Promise<ExportResult> => {
    setIsExporting(true);
    setProgress(0);
    
    try {
      let query = supabase
        .from('security_violations')
        .select('id, employee_name, violation_type, severity, policy_name, description, device, created_at, is_read');
      
      if (options.dateRange) {
        query = query
          .gte('created_at', options.dateRange.start)
          .lte('created_at', options.dateRange.end);
      }
      if (options.filters?.severity) {
        query = query.eq('severity', options.filters.severity);
      }
      
      setProgress(30);
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProgress(60);
      
      const filename = options.filename || `violacoes_${new Date().toISOString().split('T')[0]}`;
      
      if (options.format === 'csv') {
        const csv = toCSV(data || [], options.columns);
        downloadFile(csv, `${filename}.csv`, 'text/csv');
      } else if (options.format === 'json') {
        downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
      }
      
      setProgress(100);
      
      createAuditLog.mutate({
        action: 'export',
        entityType: 'violations',
        description: `Exportou ${data?.length || 0} violações em ${options.format.toUpperCase()}`,
        module: 'reports',
      });
      
      toast.success(`Exportação concluída: ${data?.length || 0} registros`);
      
      return { success: true, filename: `${filename}.${options.format}`, recordCount: data?.length || 0 };
    } catch (error: any) {
      toast.error('Erro na exportação: ' + error.message);
      return { success: false, filename: '', recordCount: 0 };
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  }, [createAuditLog]);

  // Exportar logs de auditoria
  const exportAuditLogs = useCallback(async (options: ExportOptions): Promise<ExportResult> => {
    setIsExporting(true);
    setProgress(0);
    
    try {
      let query = supabase
        .from('audit_logs')
        .select('id, user_email, action, entity_type, entity_name, description, severity, created_at');
      
      if (options.dateRange) {
        query = query
          .gte('created_at', options.dateRange.start)
          .lte('created_at', options.dateRange.end);
      }
      
      setProgress(30);
      const { data, error } = await query.order('created_at', { ascending: false }).limit(10000);
      
      if (error) throw error;
      
      setProgress(60);
      
      const filename = options.filename || `audit_logs_${new Date().toISOString().split('T')[0]}`;
      
      if (options.format === 'csv') {
        const csv = toCSV(data || [], options.columns);
        downloadFile(csv, `${filename}.csv`, 'text/csv');
      } else if (options.format === 'json') {
        downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
      }
      
      setProgress(100);
      
      toast.success(`Exportação concluída: ${data?.length || 0} registros`);
      
      return { success: true, filename: `${filename}.${options.format}`, recordCount: data?.length || 0 };
    } catch (error: any) {
      toast.error('Erro na exportação: ' + error.message);
      return { success: false, filename: '', recordCount: 0 };
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  }, []);

  // Exportação genérica
  const exportTable = useCallback(async (
    tableName: string,
    selectColumns: string,
    options: ExportOptions
  ): Promise<ExportResult> => {
    setIsExporting(true);
    setProgress(0);
    
    try {
      let query = supabase.from(tableName).select(selectColumns);
      
      if (options.dateRange) {
        query = query
          .gte('created_at', options.dateRange.start)
          .lte('created_at', options.dateRange.end);
      }
      
      Object.entries(options.filters || {}).forEach(([key, value]) => {
        if (value) query = query.eq(key, value);
      });
      
      setProgress(30);
      const { data, error } = await query.limit(50000);
      
      if (error) throw error;
      
      setProgress(60);
      
      const filename = options.filename || `${tableName}_${new Date().toISOString().split('T')[0]}`;
      
      if (options.format === 'csv') {
        const csv = toCSV(data || [], options.columns);
        downloadFile(csv, `${filename}.csv`, 'text/csv');
      } else if (options.format === 'json') {
        downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
      }
      
      setProgress(100);
      
      createAuditLog.mutate({
        action: 'export',
        entityType: tableName,
        description: `Exportou ${data?.length || 0} registros de ${tableName}`,
        module: 'reports',
      });
      
      toast.success(`Exportação concluída: ${data?.length || 0} registros`);
      
      return { success: true, filename: `${filename}.${options.format}`, recordCount: data?.length || 0 };
    } catch (error: any) {
      toast.error('Erro na exportação: ' + error.message);
      return { success: false, filename: '', recordCount: 0 };
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  }, [createAuditLog]);

  return {
    isExporting,
    progress,
    exportEmployees,
    exportViolations,
    exportAuditLogs,
    exportTable,
  };
}
