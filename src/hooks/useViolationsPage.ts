import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ViolationStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface Violation {
  id: string;
  employee_id: string;
  employee_name: string;
  violation_type: string;
  severity: ViolationSeverity;
  status: ViolationStatus;
  description?: string;
  evidence?: Record<string, unknown>;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export const VIOLATION_TYPES = [
  { value: 'unauthorized_access', label: 'Acesso Nao Autorizado' },
  { value: 'data_leak', label: 'Vazamento de Dados' },
  { value: 'policy_breach', label: 'Violacao de Politica' },
  { value: 'geofence_breach', label: 'Violacao de Geofence' },
  { value: 'time_violation', label: 'Violacao de Horario' },
  { value: 'app_violation', label: 'App Nao Autorizado' },
  { value: 'url_violation', label: 'Site Nao Autorizado' },
  { value: 'keyword_detected', label: 'Palavra-chave Detectada' },
  { value: 'excessive_idle', label: 'Ociosidade Excessiva' },
];

export function useViolationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: violations = [], isLoading } = useQuery({
    queryKey: ['violations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violations')
        .select('*, employees(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(v => ({ ...v, employee_name: v.employees?.name || 'Desconhecido' })) as Violation[];
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: ViolationStatus; notes?: string }) => {
      const { error } = await supabase
        .from('violations')
        .update({
          status,
          resolution_notes: notes,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      toast({ title: 'Violacao atualizada!' });
      setIsResolveOpen(false);
      setSelectedViolation(null);
      setResolutionNotes('');
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      const matchesSearch = !searchTerm || 
        v.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || v.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchesType = typeFilter === 'all' || v.violation_type === typeFilter;
      return matchesSearch && matchesSeverity && matchesStatus && matchesType;
    });
  }, [violations, searchTerm, severityFilter, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: violations.length,
    open: violations.filter(v => v.status === 'open').length,
    investigating: violations.filter(v => v.status === 'investigating').length,
    resolved: violations.filter(v => v.status === 'resolved').length,
    bySeverity: {
      critical: violations.filter(v => v.severity === 'critical').length,
      high: violations.filter(v => v.severity === 'high').length,
      medium: violations.filter(v => v.severity === 'medium').length,
      low: violations.filter(v => v.severity === 'low').length,
    },
  }), [violations]);

  const handleViewDetails = useCallback((violation: Violation) => {
    setSelectedViolation(violation);
    setIsDetailsOpen(true);
  }, []);

  const handleOpenResolve = useCallback((violation: Violation) => {
    setSelectedViolation(violation);
    setResolutionNotes('');
    setIsResolveOpen(true);
  }, []);

  const handleResolve = useCallback((status: ViolationStatus) => {
    if (selectedViolation) {
      resolveMutation.mutate({ id: selectedViolation.id, status, notes: resolutionNotes });
    }
  }, [selectedViolation, resolutionNotes, resolveMutation]);

  return {
    searchTerm, setSearchTerm,
    severityFilter, setSeverityFilter,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    isDetailsOpen, setIsDetailsOpen,
    isResolveOpen, setIsResolveOpen,
    selectedViolation,
    resolutionNotes, setResolutionNotes,
    violations: filteredViolations,
    stats, isLoading,
    isResolving: resolveMutation.isPending,
    handleViewDetails, handleOpenResolve, handleResolve,
    VIOLATION_TYPES,
  };
}
