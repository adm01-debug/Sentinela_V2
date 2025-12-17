import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityMetricsData {
  printBlocked: number;
  usbBlocked: number;
  hdBlocked: number;
  suspiciousActivity: number;
  totalViolations: number;
  criticalViolations: number;
  highViolations: number;
  todayViolations: number;
  unreadViolations: number;
}

interface ViolationRecord {
  id: string;
  violation_type: string;
  severity: string;
  created_at: string;
  read: boolean;
}

export function useSecurityMetrics() {
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('security-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'security_violations'
        },
        () => {
          fetchViolations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchViolations = async () => {
    try {
      const { data, error } = await supabase
        .from('security_violations')
        .select('id, violation_type, severity, created_at, read')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setViolations(data || []);
    } catch (error) {
      console.error('Error fetching security metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo<SecurityMetricsData>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayViolations = violations.filter(v => 
      new Date(v.created_at) >= today
    );

    return {
      printBlocked: violations.filter(v => 
        v.violation_type.toLowerCase().includes('print') || 
        v.violation_type.toLowerCase().includes('screenshot') ||
        v.violation_type.toLowerCase().includes('captura')
      ).length,
      usbBlocked: violations.filter(v => 
        v.violation_type.toLowerCase().includes('usb') ||
        v.violation_type.toLowerCase().includes('pendrive')
      ).length,
      hdBlocked: violations.filter(v => 
        v.violation_type.toLowerCase().includes('hd') ||
        v.violation_type.toLowerCase().includes('externo') ||
        v.violation_type.toLowerCase().includes('storage')
      ).length,
      suspiciousActivity: violations.filter(v => 
        v.violation_type.toLowerCase().includes('suspicious') ||
        v.violation_type.toLowerCase().includes('suspeito') ||
        v.violation_type.toLowerCase().includes('unauthorized') ||
        v.violation_type.toLowerCase().includes('não autorizado')
      ).length,
      totalViolations: violations.length,
      criticalViolations: violations.filter(v => v.severity === 'critical').length,
      highViolations: violations.filter(v => v.severity === 'high').length,
      todayViolations: todayViolations.length,
      unreadViolations: violations.filter(v => !v.read).length,
    };
  }, [violations]);

  return {
    metrics,
    loading,
    refetch: fetchViolations
  };
}
