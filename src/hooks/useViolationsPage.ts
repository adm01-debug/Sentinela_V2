import { useState, useMemo, useCallback } from 'react';
import { useSecurityViolations, type SecurityViolation } from '@/hooks/useSecurityViolations';
import { useEmployees } from '@/hooks/useEmployees';

export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ViolationStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export const SEVERITY_CONFIG = {
  low: { label: 'Baixa', color: 'bg-blue-500/20 text-blue-500' },
  medium: { label: 'Média', color: 'bg-yellow-500/20 text-yellow-500' },
  high: { label: 'Alta', color: 'bg-orange-500/20 text-orange-500' },
  critical: { label: 'Crítica', color: 'bg-red-500/20 text-red-500' },
} as const;

export const STATUS_CONFIG = {
  open: { label: 'Aberta', color: 'bg-red-500/20 text-red-500' },
  investigating: { label: 'Investigando', color: 'bg-yellow-500/20 text-yellow-500' },
  resolved: { label: 'Resolvida', color: 'bg-green-500/20 text-green-500' },
  dismissed: { label: 'Descartada', color: 'bg-gray-500/20 text-gray-500' },
} as const;

export function useViolationsPage() {
  const { violations, loading, updateViolation } = useSecurityViolations();
  const { employees } = useEmployees();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [selectedViolation, setSelectedViolation] = useState<SecurityViolation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      const employee = employees.find(e => e.id === v.employee_id);
      const matchesSearch = 
        v.violation_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || v.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      
      let matchesDate = true;
      if (dateRange.from) {
        matchesDate = new Date(v.created_at) >= dateRange.from;
      }
      if (dateRange.to && matchesDate) {
        matchesDate = new Date(v.created_at) <= dateRange.to;
      }
      
      return matchesSearch && matchesSeverity && matchesStatus && matchesDate;
    });
  }, [violations, employees, searchTerm, severityFilter, statusFilter, dateRange]);

  const stats = useMemo(() => ({
    total: violations.length,
    open: violations.filter(v => v.status === 'open').length,
    critical: violations.filter(v => v.severity === 'critical').length,
    resolvedToday: violations.filter(v => {
      if (v.status !== 'resolved') return false;
      const today = new Date().toDateString();
      return new Date(v.resolved_at || '').toDateString() === today;
    }).length,
  }), [violations]);

  const getEmployeeName = useCallback((employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Desconhecido';
  }, [employees]);

  const handleUpdateStatus = useCallback(async (violationId: string, status: ViolationStatus) => {
    await updateViolation(violationId, { 
      status,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
    });
  }, [updateViolation]);

  const openDetail = useCallback((violation: SecurityViolation) => {
    setSelectedViolation(violation);
    setIsDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedViolation(null);
    setIsDetailOpen(false);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setDateRange({ from: null, to: null });
  }, []);

  return {
    violations, filteredViolations, employees, stats, loading, selectedViolation,
    searchTerm, setSearchTerm, severityFilter, setSeverityFilter,
    statusFilter, setStatusFilter, dateRange, setDateRange,
    isDetailOpen, setIsDetailOpen,
    handleUpdateStatus, getEmployeeName, openDetail, closeDetail, clearFilters,
  };
}
