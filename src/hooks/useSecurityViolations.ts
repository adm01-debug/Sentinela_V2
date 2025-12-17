import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SecurityViolation {
  id: string;
  employee_name: string;
  policy_name: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string | null;
  device: string | null;
  ip_address: string | null;
  read: boolean;
  created_at: string;
}

export function useSecurityViolations() {
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchViolations();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('security-violations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_violations'
        },
        (payload) => {
          console.log('New violation:', payload);
          const newViolation = payload.new as SecurityViolation;
          setViolations(prev => [newViolation, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          const severityColors = {
            low: 'info',
            medium: 'warning', 
            high: 'error',
            critical: 'error'
          } as const;
          
          toast[severityColors[newViolation.severity] || 'warning'](
            `Violação: ${newViolation.policy_name}`,
            {
              description: `${newViolation.employee_name} - ${newViolation.violation_type}`,
              duration: 5000,
            }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'security_violations'
        },
        (payload) => {
          const updated = payload.new as SecurityViolation;
          setViolations(prev => prev.map(v => v.id === updated.id ? updated : v));
          updateUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_violations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedData = (data || []).map(v => ({
        ...v,
        severity: v.severity as SecurityViolation['severity']
      }));
      
      setViolations(typedData);
      setUnreadCount(typedData.filter(v => !v.read).length);
    } catch (error: any) {
      console.error('Error fetching violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUnreadCount = () => {
    setUnreadCount(violations.filter(v => !v.read).length);
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('security_violations')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setViolations(prev => prev.map(v => v.id === id ? { ...v, read: true } : v));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = violations.filter(v => !v.read).map(v => v.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('security_violations')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setViolations(prev => prev.map(v => ({ ...v, read: true })));
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    violations,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchViolations
  };
}
